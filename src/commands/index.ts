import type { Action } from "../actions";
import { printAction } from "../console";
import type { Entity } from "../entity";

import * as command_Mine from "./mine";
import * as command_Move from "./move";
import * as command_Rotate from "./rotate";
import * as command_Unload from "./unload";
import * as command_Recharge from "./recharge";

type Command = {
    BATTERY_COST: number;
    command: (this: Entity, action: Action) => void;
}

export const runAction = function(this: Entity, action: Action) {
    if (!this.actions.includes(action.type)) {
        action.complete();
        return;
    }
    let command: Command | undefined;
    switch (action.type) {
        case "MOVE":
            command = command_Move; break;
        case "ROTATE":
            command = command_Rotate; break;
        case "MINE":
            command = command_Mine; break;
        case "UNLOAD":
            command = command_Unload; break;
        case "RECHARGE":
            command = command_Recharge; break;
    }

    if (!command) {
        return;
    }

    if (!action.isStarted) {
        if (command.BATTERY_COST) {
            this.battery = Math.max(0, this.battery - command.BATTERY_COST);
            if (!this.battery) {
                return;
            }
        }
        printAction(this, action);
    }

    return command.command.call(this, action);
}
