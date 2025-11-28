import './style.css'

import { World } from './world.js';

const loop = async (gl: WebGL2RenderingContext) => {
    const w = new World(8, 50);
    w.init(gl);
    while(true) {
        await new Promise<void>((r) => requestAnimationFrame(() => { w.render(gl, [-10, -10]); r(); }));
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
