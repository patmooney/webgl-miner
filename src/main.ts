import { Entity } from './entity.js';
import './style.css'
import * as webglUtils from "./utils/webgl.js";

import { World, type Vec2D } from './world.js';

const size = 50;
const tileW = 20;

const loop = async (gl: WebGL2RenderingContext) => {
    const w = new World(size, tileW);
    const e = new Entity(tileW);

    await e.init(gl);
    await w.init(gl);

    const camera: Vec2D = [(size/8) * tileW, (size/5) * tileW];
    let time = 0;

    while(true) {
        await new Promise<void>((finishRender) => requestAnimationFrame(() => {
            time += 0.05;

            e.update([500 + (time), 500]);

            webglUtils.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
            // Tell WebGL how to convert from clip space to pixels
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

            // Clear the canvas
            gl.clearColor(0, 0, 0, 0);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            w.render(gl, camera);
            e.render(gl, camera);
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
