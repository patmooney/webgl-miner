import { ACTION_ADD_EVENT, ACTION_COMPLETE_EVENT, type Action, type ActionEventType } from "./actions";
import { onNav } from "./input";
import { interface_Control } from "./interface/control";
import { ENTITY_SELECTED_EVENT, state } from "./state";

export const init = () => {
    const nav = document.getElementById("nav");
    const context = document.getElementById("context");

    const link = document.createElement("div");
    link.textContent = "Control";

    const control = document.createElement("div");
    control.id = "control_control";
    control.classList.add("hidden");
    control.innerHTML = interface_Control;
    link.addEventListener("click", () => onNav(link, "control_control"));

    nav?.appendChild(link);
    context?.appendChild(control);

    bindButtons(control);
    listEntities();

    if (state.selectedEntity !== undefined) {
        const actions = state.actions.getActions().filter((a) => a.entityId === state.selectedEntity && !a.isSilent);
        listActions(actions);
    }

    state.actions.hook.addEventListener(ACTION_ADD_EVENT, (e: Event) => {
        const evt: ActionEventType = (e as CustomEvent);
        if (evt.detail.entityId === state.selectedEntity) {
            addAction(evt.detail);
        }
    });

    state.actions.hook.addEventListener(ACTION_COMPLETE_EVENT, (e: Event) => {
        const evt: ActionEventType = (e as CustomEvent);
        if (evt.detail.entityId === state.selectedEntity) {
            removeAction(evt.detail);
        }
    });

    state.entityHook.addEventListener(ENTITY_SELECTED_EVENT, (e: Event) => {
        const custom = e as CustomEvent;
        Array.from(document.querySelectorAll(`#interface_control > div:first-child > div`)).forEach(
            (d) => (d as HTMLDivElement).classList.remove("active")
        );
        const eDiv = document.querySelector(`#interface_control > div:first-child > div[data-id="${custom.detail}"]`);
        (eDiv as HTMLDivElement)?.classList.add("active");
        const actions = state.actions.getActions().filter((a) => a.entityId === state.selectedEntity && !a.isSilent);
        listActions(actions);
    });
};

const listActions = (actions: Action[]) => {
    const container = document.querySelector("#interface_control > div:last-child");
    if (!container) {
        return;
    }
    container.innerHTML = "";
    for (let action of actions) {
        addAction(action, container as HTMLDivElement);
    }
}

const addAction = (action: Action, container?: HTMLDivElement) => {
    container = container ?? document.querySelector("#interface_control > div:last-child") as HTMLDivElement ?? undefined;
    const actionDiv = document.createElement("div");
    actionDiv.textContent = `${action.type} - ${action.value}`;
    actionDiv.dataset["id"] = action.id;
    container?.appendChild(actionDiv);
}

const removeAction = (action: Action) => {
    const container = document.querySelector("#interface_control > div:last-child") as HTMLDivElement ?? undefined;
    if (container) {
        container.querySelector(`div[data-id="${action.id}"]`)?.remove();
    }
};

const bindButtons = (control: HTMLDivElement) => {
    const [up, up5, left, right, mine, mine5, unload, recharge, focus] = Array.from(control.querySelectorAll("button"));
    up5.addEventListener("click", () => {
        if (state.selectedEntity !== undefined) {
            state.actions.addAction("MOVE", { value: 5, entityId: state.selectedEntity });
            for (let i = 1; i < 5; i++) {
                state.actions.addSilentAction("MOVE", { value: 1, entityId: state.selectedEntity });
            }
        }
    });
    up.addEventListener("click", () => {
        if (state.selectedEntity !== undefined) {
            state.actions.addAction("MOVE", { value: 1, entityId: state.selectedEntity });
        }
    });
    left.addEventListener("click", () => {
        if (state.selectedEntity !== undefined) {
            state.actions.addAction("ROTATE", { value: -1, entityId: state.selectedEntity });
        }
    });
    right.addEventListener("click", () => {
        if (state.selectedEntity !== undefined) {
            state.actions.addAction("ROTATE", { value: 1, entityId: state.selectedEntity });
        }
    });
    mine.addEventListener("click", () => {
        if (state.selectedEntity !== undefined) {
            state.actions.addAction("MINE", { value: 0, entityId: state.selectedEntity });
        }
    });
    mine5.addEventListener("click", () => {
        if (state.selectedEntity !== undefined) {
            state.actions.addAction("MINE", { value: 5, entityId: state.selectedEntity });
            for (let i = 1; i < 5; i++) {
                state.actions.addSilentAction("MINE", { value: 1, entityId: state.selectedEntity });
            }
        }
    });
    unload.addEventListener("click", () => {
        if (state.selectedEntity !== undefined) {
            state.actions.addAction("UNLOAD", { value: 0, entityId: state.selectedEntity });
        }
    });
    recharge.addEventListener("click", () => {
        if (state.selectedEntity !== undefined) {
            state.actions.addAction("RECHARGE", { value: 100, entityId: state.selectedEntity });
        }
    });
    focus.addEventListener("click", () => {   
        if (state.selectedEntity !== undefined) {
            state.focusEntity(state.selectedEntity);
        }
    });
}

const listEntities = () => {
    const container = document.querySelector("#interface_control > div:first-child") as HTMLDivElement ?? undefined;
    if (!container) {
        return;
    }
    state.entities.forEach((e) => {
        const entityDiv = document.createElement("div");
        entityDiv.dataset["id"] = e.id.toString();
        entityDiv.textContent = `[${e.id}] ${e.type}`;
        container.appendChild(entityDiv);
        entityDiv.addEventListener("click", () => state.selectEntity(e.id));
    });
};
