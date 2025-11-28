import { Miner } from './miner.js';
import './style.css'
import * as webglUtils from "./utils/webgl.js";

import { World } from './world.js';

const loop = async (gl: WebGL2RenderingContext) => {
    const w = new World(8, 50);
    const e = new Miner(50);

    await e.init(gl);
    await w.init(gl);

    while(true) {
        await new Promise<void>((r) => requestAnimationFrame(() => {
            webglUtils.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
            // Tell WebGL how to convert from clip space to pixels
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

            // Clear the canvas
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            w.render(gl, [-10, -10]);
            e.render(gl, [-10, -10]);
            r();
        }));
    }
}

const run = () => {
    const canvas = document.querySelector("#c") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        return;
    }
    loop(gl);
};

run();
