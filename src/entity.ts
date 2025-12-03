import { entityFragmentSource, entityVertexSource } from './shaders';
import './style.css'

import * as webglUtils from "./utils/webgl.js";

import t from "./assets/atlas.png";
import type { Action, ActionType } from './actions.js';
import { tileW, size, ANGLE_TO_RAD, SATW, type Angle } from './constants';
import { runAction } from './commands/index.js';
import { state } from './state.js';
import { Inventory } from './invent.js';

// BLOCK TYPES
type Vec2D = [number, number];
type EntityBinds = {
    position: number,
    atlas: number,
    move: WebGLUniformLocation,
    camera: WebGLUniformLocation,
    resolution: WebGLUniformLocation,
    rotation: WebGLUniformLocation,
    tileW: WebGLUniformLocation,
};

export type EntityType = "MINER";

export class Entity {
    id: number;
    type: EntityType;

    actions: ActionType[];

    rotation: Vec2D = [0, 1];
    rad: number = ANGLE_TO_RAD[3];
    angle: Angle = 3;
    inventory: Inventory;

    target: Vec2D | undefined;
    targetR: Angle | undefined;

    coords: Vec2D;
    moveSpeed: number = tileW / 100;

    indices: Uint16Array;
    positions: Float32Array;

    binds: EntityBinds | undefined;
    program: WebGLProgram | undefined;
    vao: WebGLVertexArrayObject | undefined;
    vbo: WebGLBuffer | undefined;
    posBuf: WebGLBuffer | undefined;

    atlas: WebGLTexture | undefined;

    constructor(id: number, type: EntityType, actions: ActionType[] = ["MOVE", "ROTATE"]) {
        this.id = id;
        this.indices = new Uint16Array([0, 1, 2, 2, 3, 1]);
        this.positions = new Float32Array([
            0, 0, SATW*2, 0,
            0, tileW, SATW*3, 0,
            tileW, 0, SATW*2, 1,
            tileW, tileW, SATW*3, 1
        ]);
        this.coords = [Math.round((size / 2) * tileW) - (tileW / 2), Math.round((size / 2) * tileW) - (tileW / 2)];
        this.rotation[0] = Math.sin(this.rad);
        this.rotation[1] = Math.cos(this.rad);
        this.actions = actions;
        this.type = type;
        this.inventory = new Inventory();
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
            tileW: gl.getUniformLocation(program, "tileW"),
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

        this.atlas = await webglUtils.loadTexture(gl, t);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    update(action?: Action) {
        if (action) {
            runAction.call(this, action);
        }
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
        gl.uniform1f(this.binds.tileW, tileW / 2);

        // Pass in the canvas resolution so we can convert from
        // pixels to clipspace in the shader
        gl.uniform2f(this.binds.resolution, ...state.resolution(gl));

        // draw
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
}
