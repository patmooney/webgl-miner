import { entityFragmentSource, entityVertexSource } from './shaders';
import './style.css'

import * as webglUtils from "./utils/webgl.js";

import t from "./assets/atlas.png";

// BLOCK TYPES
type Vec2D = [number, number];
type EntityBinds = {
    position: number,
    atlas: number,
    move: WebGLUniformLocation,
    camera: WebGLUniformLocation,
    resolution: WebGLUniformLocation,
    rotation: WebGLUniformLocation,
};

const ATLAS_IMAGE_NUM = 3; // number of textures in our atlas
const SATW = 1 / ATLAS_IMAGE_NUM;

export class Entity {
    rotation: Vec2D = [0, 1];
    angle: number = (270 * Math.PI) / 180.0;

    private coords: Vec2D;

    private tileWidth: number;
    private indices: Uint16Array;
    private positions: Float32Array;

    private binds: EntityBinds | undefined;
    private program: WebGLProgram | undefined;
    private vao: WebGLVertexArrayObject | undefined;
    private vbo: WebGLBuffer | undefined;
    private posBuf: WebGLBuffer | undefined;

    private atlas: WebGLTexture | undefined;

    constructor(tileWidth: number) {
        this.tileWidth = tileWidth;
        this.indices = new Uint16Array([0, 1, 2, 2, 3, 1]);
        this.positions = new Float32Array([
            0, 0, SATW*2, 0,
            0, this.tileWidth, SATW*3, 0,
            this.tileWidth, 0, SATW*2, SATW*3,
            this.tileWidth, this.tileWidth, SATW*3, SATW*3
        ]);
        this.coords = [500, 500];
    }

    async init(gl: WebGL2RenderingContext) {
        const program = webglUtils.createProgramFromSources(gl, [entityVertexSource, entityFragmentSource]);

        if (!program) {
            throw new Error("No program");
        }
        this.program = program;

        // look up where the vertex data needs to go.
        const binds = {
            position: gl.getAttribLocation(program, "a_position"),
            move: gl.getUniformLocation(program, "u_movement"),
            atlas: gl.getAttribLocation(program, "a_texcoord"),
            camera: gl.getUniformLocation(program, "camera"),
            resolution: gl.getUniformLocation(program, "u_resolution"),
            rotation: gl.getUniformLocation(program, "u_rotation")
        };

        if (binds.camera === null || binds.position === null || binds.resolution === null || binds.move === null || binds.atlas === null) {
            throw new Error("Bad binds");
        }

        this.binds = binds as EntityBinds;

        // Create a buffer and put a single pixel space rectangle in
        // it (2 triangles)
        // Create a buffer and put three 2d clip space points in it
        this.posBuf = gl.createBuffer() ?? undefined;
        if (!this.posBuf) {
            throw new Error("No Pos Buf");
        }

        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuf);
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

        // Create a vertex array object (attribute state)
        this.vao = gl.createVertexArray() ?? undefined;
        if (!this.vao) {
            throw new Error("No VAO");
        }

        // and make it the one we're currently working with
        gl.bindVertexArray(this.vao);
        // Turn on the attribute

        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        const size = 2;          // 2 components per iteration
        const type = gl.FLOAT;   // the data is 32bit floats
        const normalize = false; // don't normalize the data
        const stride = 4 * Float32Array.BYTES_PER_ELEMENT;
        let offset = 0;        // start at the beginning of the buffer

        gl.vertexAttribPointer(this.binds.position, size, type, normalize, stride, offset);
        gl.enableVertexAttribArray(this.binds.position)
       
        offset += 2 * Float32Array.BYTES_PER_ELEMENT;

        gl.vertexAttribPointer(this.binds.atlas, size, type, normalize, stride, offset);
        gl.enableVertexAttribArray(this.binds.atlas)

        // Create an empty buffer object to store Index buffer
        this.vbo = gl.createBuffer() ?? undefined;
        if (!this.vbo) {
            throw new Error("No VBO");
        }

        // Bind appropriate array buffer to it
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vbo);

        // Pass the vertex data to the buffer
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        this.atlas = await loadTexture(gl, t);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    update(move: Vec2D) {
        this.angle = move[0];
        this.rotation[0] = Math.sin(this.angle);
        this.rotation[1] = Math.cos(this.angle);
    //    this.coords = move;
    }

    render(gl: WebGL2RenderingContext, camera: Vec2D) {
        if (!this.binds || !this.program || !this.vao || !this.vbo || !this.posBuf || !this.atlas) {
            return;
        }

        webglUtils.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);

        // Tell it to use our program (pair of shaders)
        gl.useProgram(this.program);

        // Bind the attribute/buffer set we want.
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vbo);

        // block type texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.atlas);
        gl.uniform1i(gl.getUniformLocation(this.program, "u_texture"), 0);

        gl.uniform2fv(this.binds.camera, [-camera[0], -camera[1]]);
        gl.uniform2fv(this.binds.move, this.coords);
        gl.uniform2fv(this.binds.rotation, this.rotation);

        // Pass in the canvas resolution so we can convert from
        // pixels to clipspace in the shader
        gl.uniform2f(this.binds.resolution, gl.canvas.width, gl.canvas.height);

        // draw
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
}

const loadTexture = async (gl: WebGL2RenderingContext, img: string): Promise<WebGLTexture> => {
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
            resolve(tex);
        };
    });
}
