import type { Entity } from "./entity";
import { state } from "./state";

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


const getStatus = (entity: Entity) => {
    const action = state.actions.getActions().find((a) => a.entityId === entity.id && !a.isComplete && !a.isCancelled);
    return`
Entity:    ${entity.name}
Battery:   ${entity.battery} / ${entity.maxBattery}
Inventory: ${entity.inventory.total} / ${entity.inventorySize}
${action ? `${action?.type}${action?.value !== undefined ? ` - ${action.value}` : ""}` : " - IDLE - "}
`;
};
