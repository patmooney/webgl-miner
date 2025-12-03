import type { Action } from "../actions";
import { printAction } from "../console";
import type { Entity } from "../entity";
import { command_Mine } from "./mine";
import { command_Move } from "./move";
import { command_Rotate } from "./rotate";
import { command_Unload } from "./unload";

export const runAction = function(this: Entity, action: Action) {
    if (!this.actions.includes(action.type)) {
        action.complete();
        return;
    }
    if (!action.isStarted) {
        printAction(this, action);
    }
    switch (action.type) {
        case "MOVE":
            return command_Move.call(this, action);
        case "ROTATE":
            return command_Rotate.call(this, action);
        case "MINE":
            return command_Mine.call(this, action);
        case "UNLOAD":
            return command_Unload.call(this, action);
    }
}
