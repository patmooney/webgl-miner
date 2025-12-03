import { fragmentShaderSource, vertexShaderSource } from './shaders';
import './style.css'

import * as webglUtils from "./utils/webgl.js";

import t from "./assets/atlas.png";
import { SATW, size, tileW } from './constants.js';
import { getMap, type Tile } from './map.js';
import { state } from './state.js';

// BLOCK TYPES
export type Vec2D = [number, number];
type WorldBinds = {
    position: number,
    atlas: number,
    tileW: WebGLUniformLocation,
    tileX: WebGLUniformLocation,
    camera: WebGLUniformLocation,
    resolution: WebGLUniformLocation,
    atlasW: WebGLUniformLocation,
};

export class World {
    private indices: Uint16Array;
    private positions: Float32Array;

    private binds: WorldBinds | undefined;
    private program: WebGLProgram | undefined;
    private vao: WebGLVertexArrayObject | undefined;
    private vbo: WebGLBuffer | undefined;
    private posBuf: WebGLBuffer | undefined;

    private blockTex: WebGLTexture | undefined;
    private atlas: WebGLTexture | undefined;

    constructor() {
        this.indices = new Uint16Array([0, 1, 2, 2, 3, 1]);
        this.positions = new Float32Array([
            0, 0, 0, 1,
            0, tileW, 0, 0,
            tileW, 0, SATW, 1,
            tileW, tileW, SATW, 0
        ]);
    }

    async init(gl: WebGL2RenderingContext) {
        const program = webglUtils.createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);

        if (!program) {
            throw new Error("No program");
        }
        this.program = program;

        // look up where the vertex data needs to go.
        const binds = {
            position: gl.getAttribLocation(program, "a_position"),
            atlas: gl.getAttribLocation(program, "a_texcoord"),
            tileW: gl.getUniformLocation(program, "tileW"),
            tileX: gl.getUniformLocation(program, "tileX"),
            camera: gl.getUniformLocation(program, "camera"),
            resolution: gl.getUniformLocation(program, "u_resolution"),
            atlasW: gl.getUniformLocation(program, "u_atlas_w")
        };

        if (binds.camera === null || binds.position === null || binds.resolution === null || binds.tileW === null || binds.tileX === null || binds.atlas === null) {
            throw new Error("Bad binds");
        }

        this.binds = binds as WorldBinds;

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
        const vSize = 2;          // 2 components per iteration
        const type = gl.FLOAT;   // the data is 32bit floats
        const normalize = false; // don't normalize the data
        const stride = 4 * Float32Array.BYTES_PER_ELEMENT;
        let offset = 0;        // start at the beginning of the buffer

        gl.vertexAttribPointer(this.binds.position, vSize, type, normalize, stride, offset);
        gl.enableVertexAttribArray(this.binds.position)
       
        offset += 2 * Float32Array.BYTES_PER_ELEMENT;

        gl.vertexAttribPointer(this.binds.atlas, vSize, type, normalize, stride, offset);
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

        this.atlas = await webglUtils.loadTexture(gl, t);

        this.blockTex = gl.createTexture() ?? undefined;
        if (!this.blockTex) {
            throw new Error("No block texture");
        }
        gl.bindTexture(gl.TEXTURE_2D, this.blockTex);

        const bTypes = getMap();

        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RG32F, size, size, 0, gl.RG,
            gl.FLOAT, bTypes
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    update(gl: WebGL2RenderingContext, updates?: Tile[]) {
        if (updates?.length && this.blockTex) {
            gl.bindTexture(gl.TEXTURE_2D, this.blockTex);
            updates.forEach(
                (update) => {
                    gl.texSubImage2D(
                        gl.TEXTURE_2D, 0, update.coord[1], update.coord[0], 1, 1,
                        gl.RG, gl.FLOAT, new Float32Array([update.type, update.durability])
                    )
                }
            );
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
    }

    render(gl: WebGL2RenderingContext, camera: Vec2D) {
        if (!this.binds || !this.program || !this.vao || !this.blockTex || !this.vbo || !this.posBuf || !this.atlas) {
            return;
        }

        // Tell it to use our program (pair of shaders)
        gl.useProgram(this.program);

        // Bind the attribute/buffer set we want.
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vbo);

        gl.uniform1i(this.binds.tileW, tileW);
        gl.uniform1i(this.binds.tileX, size);

        // block type texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.blockTex);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.atlas);
        gl.uniform1i(gl.getUniformLocation(this.program, "u_data"), 0);
        gl.uniform1i(gl.getUniformLocation(this.program, "u_texture"), 1);
        gl.uniform1f(this.binds.atlasW, SATW);

        gl.uniform2fv(this.binds.camera, [-camera[0], -camera[1]]);

        // Pass in the canvas resolution so we can convert from
        // pixels to clipspace in the shader
        gl.uniform2f(this.binds.resolution, ...state.resolution(gl));

        // draw
        gl.drawElementsInstanced(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT,0, size * size);
    }
}
