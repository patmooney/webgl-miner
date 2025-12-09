import { CANVAS_H, CANVAS_W, size, tileW, type Vec2D } from "./constants";
import type { Entity } from "./entity";
import { EntityGraphics } from "./graphics/entity";
import { initCanvas } from "./input";
import { initMap } from "./map";
import { state } from "./state";
import { World } from "./world";

let updateI = 0;
const UPDATE_CADENCE = 100;
const stats = document.getElementById("status");

export const update = (gl: WebGL2RenderingContext) => {
    if (updateI > UPDATE_CADENCE) {
        updateI = 0;
    }
    updateI++;

    if (updateI === UPDATE_CADENCE && stats) {
        const selected = state.selectedEntity !== undefined && state.entities.find((e) => e.id === state.selectedEntity);
        stats.textContent = selected ? getStatus(selected) : "";
    }

    const actions = state.actions.getActions();
    state.runScripts();
    for (let e of state.entities) {
        const action = actions.find((a) => a.entityId === e.id);
        e.update(action);
    }
    state.world?.update(gl, state.actions.getMapUpdates());
};

export const initScene = async (gl: WebGL2RenderingContext) => {
    initMap();
    state.world = new World();
    state.gl = gl;

    const entityGraphics = new EntityGraphics();
    await entityGraphics.initGraphics(gl);
    state.entityGfx = entityGraphics;

    state.camera = [((size/2) - 11.5) * tileW, ((size/2) - 7) * tileW];

    initCanvas();

    await state.world.init(gl);

    state.updateLights();
};

const C_W2 = CANVAS_W / 2;
const C_H2 = CANVAS_H / 2;

// return normalised direction based on screen dimensions
export const cameraCenterOffset = (target: Vec2D): Vec2D => {
    const cam = state.camera;
    const center = [cam[0] + C_W2, cam[1] + C_H2];
    const dx = target[0] - center[0];
    const dy = target[1] - center[1];
    const sx = Math.sign(dx);
    const sy = Math.sign(dy);
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);

    return [
        (ax / C_W2) * sx,
        (ay / C_H2) * sy,
    ];
}

const getStatus = (entity: Entity) => {
    const action = state.actions.getActions().find((a) => a.entityId === entity.id && !a.isComplete && !a.isCancelled);
    return`
Entity:    ${entity.name}
Battery:   ${entity.battery} / ${entity.maxBattery}
Inventory: ${entity.inventory.total} / ${entity.inventorySize}
${action ? `${action?.type}${action?.value !== undefined ? ` - ${action.value}` : ""}` : " - IDLE - "}
`;
};
