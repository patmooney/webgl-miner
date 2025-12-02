import type { Action, ActionType } from './actions.js';
import { Entity } from './entity.js';
import { initMouse } from './input.js';
import { state } from './state.js';
import './style.css'
import * as webglUtils from "./utils/webgl.js";

import { World } from './world.js';
import { size, tileW } from './constants.js';
import { initMap } from './map.js';

let entities: Entity[] = [];

const input = document.querySelector('#console input');
const output = document.querySelector('#console div#output');

const loop = async (gl: WebGL2RenderingContext) => {
    const w = new World();

    entities.push(new Entity(entities.length, "MINER", ["ROTATE", "MOVE"]));

    state.camera = [((size/2) - 9) * tileW, ((size/2) - 6) * tileW];

    initMouse();
    initMap();

    for (let e of entities) {
        await e.init(gl);
    }
    await w.init(gl);

    let time = 0;

    input?.addEventListener("keyup", (e) => {
        const key = (e as KeyboardEvent).key;
        const val = (e.target as HTMLInputElement).value;
        if (key === "Enter" && val.length) {
            parseCmd(val);
            (e.target as HTMLInputElement).value = "";
        }
    });

    command_Welcome();
    (input as HTMLInputElement)?.focus();

    const parseCmd = (val: string) => {
        print(" ");
        print(` > ${val}`);
        const [rawCmd, value] = val.split(" ");
        const cmd = rawCmd.toLowerCase();

        const isMeta = metaCommand(cmd, value);
        if (isMeta === false) {
            print("[ERROR] Invalid argument");
            return;
        } else if (isMeta) {
            return;
        }
        const isCommand = entityCommand(cmd, value);
        if (isCommand === false) {
            print("[ERROR] No entity selected!");
            return;
        } else if (isCommand) {
            printAction(state.actions.stack.at(-1));
            return;
        }

        print(`[ERROR] Unknown command: ${cmd}`);
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
    print(`[${(Date.now() / 1000).toFixed(0)}] Entity [0] - ${a.type}: ${a.value}`);
};

const print = (str: string) => {
    str.split("\n").map(
        (line) => {
            const p = document.createElement("p");
            p.textContent = line;
            output?.appendChild(p);
        }
    );
    output?.scrollTo(0, output.scrollHeight ?? 0);
};

const command_Welcome = () => {
    print(`
Welcome
========

Type "help" to get started
`);
};

const command_List = () => {
    print(`
ENTITIES
==========

${entities.map((e) => `[${e.id}] - ${e.type}`).join("\n")}
`);
};

const command_Help = () => {
    print(`
HELP
=====

list       - List available entities
select <n> - Select entity for control
commands   - List available commands for selected entity
selected   - Show currently selected entitiy
`);
};

const command_Selected = () => {
    const selected = state.selectedEntity !== undefined ? entities.find((e) => e.id === state.selectedEntity) : undefined;
    print(`
SELECTED
=========

${selected ? `[${selected.id}] - ${selected.type}` : "- NONE -"}
`);
};

const command_Commands = () => {
    const selected = state.selectedEntity !== undefined ? entities.find((e) => e.id === state.selectedEntity) : undefined;
    if (!selected) {
        return print(`[ERROR] No entity selected`);
    }
print(`
COMMANDS
=========

${selected.actions.map((act) => ` - ${act.toLowerCase()}`).join("\n")}
`);

};

const entityCommand = (cmd: string, value: string): boolean | undefined => {
    const addAction = (action: ActionType) => {
        if (state.selectedEntity === undefined) {
            return false;
        }
        state.actions.addAction(action, { entityId: state.selectedEntity, timeEnd: Date.now() + 100000, value: parseInt(value ?? 0) });
        return true;
    };

    switch (cmd) {
        case "move": return addAction("MOVE");
        case "rotate": return addAction("ROTATE");
        default: return undefined;
    };
};

const metaCommand = (cmd: string, value: string): boolean | undefined => {
    switch (cmd) {
        case "help": command_Help(); return true;
        case "list": command_List(); return true;
        case "selected": command_Selected(); return true;
        case "commands": command_Commands(); return true;
        case "select": return selectEntity(parseInt(value));
        default: return undefined;
    };
};

const selectEntity = (entityId: number) => {
    if (isNaN(entityId)) {
        return false;
    }
    if (!entities.find((e) => e.id === entityId)) {
        return false;
    }
    state.selectedEntity = entityId;
    print(`Entity ${entityId} selected`);
    return true;
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
