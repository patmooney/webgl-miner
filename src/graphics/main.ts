import { initCanvas } from '../input';
import { state } from '../state';
import * as webglUtils from "../utils/webgl";

import { World } from '../world';
import { FPS, size, tileW } from '../constants';
import { initMap } from '../map';
import { EntityGraphics } from '../graphics/entity';
import { Script } from '../script';

let RUNNING = false;

const loop = async (gl: WebGL2RenderingContext) => {
    initMap();
    const w = new World();
    state.gl = gl;

    const entityGraphics = new EntityGraphics();
    await entityGraphics.initGraphics(gl);
    state.entityGfx = entityGraphics;

    state.camera = [((size/2) - 11.5) * tileW, ((size/2) - 7) * tileW];
    state.scripts["test"] = new Script(`
        START:
            MOVE 1
            MINE 10
            JMP START
    `);

    initCanvas();

    await w.init(gl);

    state.updateLights();

    const timePerFrame = 1000 / FPS;
    let t = Date.now();
    while(RUNNING) {
        let nextFrame = t+timePerFrame;
        if (Date.now() < nextFrame) {
            await new Promise((res) => setTimeout(res, 10));
        }
        await new Promise<void>((finishRender) => requestAnimationFrame(() => {
            const actions = state.actions.getActions();
            for (let e of state.entities) {
                const action = actions.find((a) => a.entityId === e.id);
                e.update(action);
            }
            w.update(gl, state.actions.getMapUpdates())

            webglUtils.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
            // Tell WebGL how to convert from clip space to pixels
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

            // Clear the canvas
            gl.clearColor(0.1, 0.1, 0.1, 1);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            w.render(gl, state.camera);
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
    canvas.width = 1000;
    canvas.height = 600;
    canvas.style.backgroundColor = "#000";
    document.querySelector("div.container > div.canvas-container")?.prepend(canvas);
    setTimeout(() => {
        canvas.style.height = "600px";
        canvas.addEventListener("transitionend", () => {
            const gl = canvas.getContext("webgl2", { premultipliedAlpha: false });
            canvas.style.border = "none";
            gl?.getExtension("EXT_color_buffer_float");

            if (!gl) {
                return;
            }
            RUNNING = true;
            loop(gl);
        }, { once: true })
    }, 1000);
};

export const end = () => {
    document.getElementById("c")?.remove();
    RUNNING = false;
    return new Promise((res) => setTimeout(res, 500));
};
