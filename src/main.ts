import './style.css'

import { Entity } from './entity';
import { initMouse } from './input';
import { state } from './state';
import * as webglUtils from "./utils/webgl";
import * as csl from "./console";

import { World } from './world';
import { size, tileW } from './constants';
import { initMap } from './map';
import { Inventory } from './invent';
import { onStorage, onStory, type WayPoint, type Item } from './story';

const loop = async (gl: WebGL2RenderingContext) => {
    initMap();
    const w = new World();
    state.inventory = new Inventory(onStorage);
    state.onStory = onStory;

    state.entities.push(
        new Entity(
            state.entities.length, "MINER",
            ["ROTATE", "MOVE", "MINE", "UNLOAD", "RECHARGE"],
            10,
            ["module_basic_drill", "module_basic_battery", "module_basic_motor"]
        )
    );

    state.camera = [((size/2) - 9) * tileW, ((size/2) - 6) * tileW];

    initMouse();

    for (let e of state.entities) {
        await e.init(gl);
    }
    await w.init(gl);

    const initialStory: WayPoint[] = [];
    const initialStorage: [Item, number][] = [];

    initialStorage.forEach(([i, c]) => state.inventory.add(i, c));
    initialStory.forEach((w) => state.addWaypoint(w));

    let time = 0;
    csl.command_Welcome();

    while(true) {
        await new Promise<void>((finishRender) => requestAnimationFrame(() => {
            time += 0.05;

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
            gl.clearColor(0.2, 0.2, 0.2, 1);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            w.render(gl, state.camera);
            for (let e of state.entities) {
                e.render(gl, state.camera);
            }
            finishRender();
        }));
    }
}

const run = () => {
    const canvas = document.querySelector("#c") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: false });
    gl?.getExtension("EXT_color_buffer_float");

    if (!gl) {
        return;
    }
    loop(gl);
};

run();
