import type { Action } from './actions.js';
import { Entity } from './entity.js';
import { initMouse } from './input.js';
import { state } from './state.js';
import './style.css'
import * as webglUtils from "./utils/webgl.js";

import { World } from './world.js';

const size = 50;
const tileW = 20;
let entities: Entity[] = [];

const input = document.querySelector('#console input');
const output = document.querySelector('#console div#output');

const loop = async (gl: WebGL2RenderingContext) => {
    const w = new World(size, tileW);
    entities.push(new Entity(entities.length, tileW));

    state.camera = [(size/8) * tileW, (size/5) * tileW];

    initMouse();
    for (let e of entities) {
        await e.init(gl);
    }
    await w.init(gl);

    let time = 0;

    input?.addEventListener("keyup", (e) => {
        const key = (e as KeyboardEvent).key;
        const val = (e.target as HTMLInputElement).value;
        if (key === "Enter") {
            parseCmd(val);
            (e.target as HTMLInputElement).value = "";
        }
    });

    const parseCmd = (val: string) => {
        const [cmd, value] = val.split(" ");
        switch (cmd) {
            case "move": state.actions.addAction("MOVE", { entityId: 0, timeEnd: Date.now() + 10000, value: parseInt(value ?? 0) }); break;
            case "rotate": state.actions.addAction("ROTATE", { entityId: 0, timeEnd: Date.now() + 10000, value: parseInt(value ?? 0) }); break;
        };
        printAction(state.actions.stack.at(-1));
    };

    while(true) {
        await new Promise<void>((finishRender) => requestAnimationFrame(() => {
            time += 0.05;

            const actions = state.actions.getActions();
            for (let e of entities) {
                const action = actions.find((a) => a.entityId === e.id);
                e.update(action);
            }

            webglUtils.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
            // Tell WebGL how to convert from clip space to pixels
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

            // Clear the canvas
            gl.clearColor(0.2, 0.2, 0.2, 1);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            w.render(gl, state.camera);
            for (let e of entities) {
                e.render(gl, state.camera);
            }
            finishRender();
        }));
    }
}

const printAction = (a: Action | undefined) => {
    if (!a) {
        return;
    }
    const line = document.createElement("p");
    line.textContent = `[${(Date.now() / 1000).toFixed(0)}] Entity [0] - ${a.type}: ${a.value}`;
    output?.appendChild(line);
};

const run = () => {
    const canvas = document.querySelector("#c") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: false });

    if (!gl) {
        return;
    }
    loop(gl);
};

run();
