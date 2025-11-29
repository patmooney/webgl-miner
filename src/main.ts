import { Entity } from './entity.js';
import { initMouse } from './input.js';
import { state } from './state.js';
import './style.css'
import * as webglUtils from "./utils/webgl.js";

import { World } from './world.js';

const size = 50;
const tileW = 20;

const loop = async (gl: WebGL2RenderingContext) => {
    const w = new World(size, tileW);
    const e = new Entity(tileW);

    state.camera = [(size/8) * tileW, (size/5) * tileW];

    initMouse();
    await e.init(gl);
    await w.init(gl);

    let time = 0;

    while(true) {
        await new Promise<void>((finishRender) => requestAnimationFrame(() => {
            time += 0.05;

            e.update([500 + (time), 500]);

            webglUtils.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
            // Tell WebGL how to convert from clip space to pixels
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

            // Clear the canvas
            gl.clearColor(0.2, 0.2, 0.2, 1);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            w.render(gl, state.camera);
            e.render(gl, state.camera);
            finishRender();
        }));
    }
}

const run = () => {
    const canvas = document.querySelector("#c") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: false });

    if (!gl) {
        return;
    }
    loop(gl);
};

run();
