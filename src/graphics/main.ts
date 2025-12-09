import { state } from '../state';
import * as webglUtils from "../utils/webgl";

import { CANVAS_H, CANVAS_W, FPS, IS_DEV } from '../constants';
import { initScene, update } from '../scene';

let RUNNING = false;

const loop = async (gl: WebGL2RenderingContext) => {
    const timePerFrame = 1000 / FPS;
    let t = Date.now();
    while(RUNNING) {
        let nextFrame = t+timePerFrame;
        if (Date.now() < nextFrame) {
            await new Promise((res) => setTimeout(res, 10));
        }
        update(gl);
        await new Promise<void>((finishRender) => requestAnimationFrame(() => {

            webglUtils.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
            // Tell WebGL how to convert from clip space to pixels
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

            // Clear the canvas
            gl.clearColor(0.1, 0.1, 0.1, 1);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            state.world?.render(gl, state.camera);
            for (let e of state.entities) {
               e.render(gl, state.camera);
            }

            finishRender();
        }));
        t = Date.now();
    }
}

export const init = () => {
    const canvas = document.createElement('canvas');
    canvas.id = "c";
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    canvas.style.backgroundColor = "#000";
    canvas.style.transition = IS_DEV ? "height 10ms ease-out" : "height 0.5s ease-out";
    document.querySelector("div.container > div.canvas-container")?.prepend(canvas);
    return new Promise((initComplete) => {
        setTimeout(() => {
            canvas.style.height = "600px";
            canvas.addEventListener("transitionend", async () => {
                const gl = canvas.getContext("webgl2", { premultipliedAlpha: false });
                canvas.style.border = "none";

                if (!gl) {
                    return;
                }

                RUNNING = true;
                await initScene(gl);
                initComplete(undefined);

                gl.getExtension("EXT_color_buffer_float");
                loop(gl);
            }, { once: true })
        }, 1000);
    });
};

export const end = () => {
    document.getElementById("c")?.remove();
    RUNNING = false;
    return new Promise((res) => setTimeout(res, 500));
};
