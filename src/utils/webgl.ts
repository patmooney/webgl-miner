/**
 * Wrapped logging function.
 * @param {string} msg The message to log.
 */
function error(msg: string) {
    if (console) {
        if (console.error) {
            console.error(msg);
        } else if (console.log) {
            console.log(msg);
        }
    }
}

const errorRE = /ERROR:\s*\d+:(\d+)/gi;
function addLineNumbersWithError(src: string, log = '') {
    // Note: Error message formats are not defined by any spec so this may or may not work.
    const matches = [...log.matchAll(errorRE)];
    const lineNoToErrorMap = new Map(matches.map((m, ndx) => {
        const lineNo = parseInt(m[1]);
        const next = matches[ndx + 1];
        const end = next ? next.index : log.length;
        const msg = log.substring(m.index, end);
        return [lineNo - 1, msg];
    }));
    return src.split('\n').map((line, lineNo) => {
        const err = lineNoToErrorMap.get(lineNo);
        return `${lineNo + 1}: ${line}${err ? `\n\n^^^ ${err}` : ''}`;
    }).join('\n');
}


function loadShader(gl: WebGLRenderingContext, shaderSource: string, shaderType: number, opt_errorCallback: (err: string) => void) {
    const errFn = opt_errorCallback || error;
    // Create the shader object
    const shader = gl.createShader(shaderType);
    if (!shader) {
        errFn("No shader");
        return null;
    }

    // Load the shader source
    gl.shaderSource(shader, shaderSource);

    // Compile the shader
    gl.compileShader(shader);

    // Check the compile status
    const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
        // Something went wrong during compilation; get the error
        const lastError = gl.getShaderInfoLog(shader);
        errFn(`Error compiling shader: ${lastError}\n${addLineNumbersWithError(shaderSource, lastError ?? "")}`);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

/**
 * Creates a program, attaches shaders, binds attrib locations, links the
 * program and calls useProgram.
 * @param {WebGLShader[]} shaders The shaders to attach
 * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
 * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
 * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @memberOf module:webgl-utils
 */
export function createProgram(
    gl: WebGLRenderingContext, shaders: WebGLShader[], opt_attribs: string[], opt_locations: number[], opt_errorCallback: (err: string) => void
) {
    const errFn = opt_errorCallback || error;
    const program = gl.createProgram();
    if (!program) {
        return null;
    }
    shaders.forEach(function(shader) {
        gl.attachShader(program, shader);
    });
    if (opt_attribs) {
        opt_attribs.forEach(function(attrib, ndx) {
            gl.bindAttribLocation(
                program,
                opt_locations ? opt_locations[ndx] : ndx,
                attrib);
        });
    }
    gl.linkProgram(program);

    // Check the link status
    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        // something went wrong with the link
        const lastError = gl.getProgramInfoLog(program);
        const lines = shaders.map(shader => {
            const src = addLineNumbersWithError(gl.getShaderSource(shader) ?? "");
            const type = gl.getShaderParameter(shader, gl.SHADER_TYPE);
            return `${type}:\n${src}`;
        }).join('\n')
        errFn(`Error in program linking: ${lastError}\n${lines}`);
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

const defaultShaderType = [
    "VERTEX_SHADER",
    "FRAGMENT_SHADER",
];

export function createProgramFromSources(
    gl: WebGLRenderingContext, shaderSources: string[], opt_attribs: string[] = [],
    opt_locations: number[] = [], opt_errorCallback: (err: string) => void = () => {}
) {
    const shaders = [];
    for (let ii = 0; ii < shaderSources.length; ++ii) {
        shaders.push(loadShader(
            gl, shaderSources[ii], gl[defaultShaderType[ii] as keyof typeof gl] as number, opt_errorCallback));
    }
    return createProgram(gl, shaders.filter(Boolean) as WebGLShader[], opt_attribs, opt_locations, opt_errorCallback);
}

export function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement, multiplier?: number) {
    multiplier = multiplier || 1;
    const width  = canvas.clientWidth  * multiplier | 0;
    const height = canvas.clientHeight * multiplier | 0;
    if (canvas.width !== width ||  canvas.height !== height) {
        canvas.width  = width;
        canvas.height = height;
        return true;
    }
    return false;
}

let texMap: Record<string, WebGLTexture> = {};

export const loadTexture = async (gl: WebGL2RenderingContext, img: string): Promise<WebGLTexture> => {
    if (texMap[img]) {
        return texMap[img];
    }
    const tex = gl.createTexture() ?? undefined;
    if (!tex) {
        throw new Error("Invalid texture");
    }
    gl.bindTexture(gl.TEXTURE_2D, tex);

    const image = new Image();
    image.src = img;

    return new Promise((resolve) => {
        image.onload = () => {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.bindTexture(gl.TEXTURE_2D, null);
            texMap[img] = tex;
            resolve(tex);
        };
    });
}
