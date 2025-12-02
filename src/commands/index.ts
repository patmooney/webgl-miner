import type { Action } from "../actions";
import type { Entity } from "../entity";
import { command_Move } from "./move";
import { command_Rotate } from "./rotate";

export const runAction = function(this: Entity, action: Action) {
    if (!this.actions.includes(action.type)) {
        action.complete();
        return;
    }
    switch (action.type) {
        case "MOVE":
            return command_Move.call(this, action);
        case "ROTATE":
            return command_Rotate.call(this, action);
    }
}
