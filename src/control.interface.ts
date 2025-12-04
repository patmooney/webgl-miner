import { ACTION_ADD_EVENT, ACTION_COMPLETE_EVENT, type Action, type ActionEventType } from "./actions";
import { onNav } from "./input";
import { interface_Control } from "./interface/control";
import { state } from "./state";

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

    if (state.selectedEntity !== undefined) {
        const actions = state.actions.getActions().filter((a) => a.entityId === state.selectedEntity);
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
};

const listActions = (actions: Action[]) => {
    const container = document.querySelector("#control_control > div:last-child");
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
    const [up, left, right] = Array.from(control.querySelectorAll("button"));
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
}
