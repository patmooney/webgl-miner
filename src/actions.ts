import { size } from "./constants";
import { updateMap, type Tile } from "./map";
import type { Vec2D } from "./world";

export type ActionType = "ROTATE" | "MOVE" | "MINE" | "UNLOAD" | "RECHARGE";

export const ACTION_ADD_EVENT = "ACTION_ADD";
export const ACTION_COMPLETE_EVENT = "ACTION_REMOVE";

export type ActionEventType = {
    detail: Action;
}

export interface IAction {
    delta?: Vec2D;
    value?: number;
    timeEnd?: number;
    entityId: number;
}

export class Action implements IAction {
    id: string;
    type: ActionType;
    delta?: Vec2D;
    value?: number;
    timeEnd?: number;
    entityId: number;
    
    isSilent?: boolean = false;
    isComplete?: boolean = false;
    isStarted?: boolean = false;


    constructor(type: ActionType, { delta, value, timeEnd, entityId }: IAction, isSilent = false) {
        this.type = type;
        this.delta = delta;
        this.value = value;
        this.timeEnd = timeEnd;
        this.entityId = entityId;
        this.id = crypto.randomUUID();
        this.isSilent = isSilent;

        if (this.type === "ROTATE") {
            this.value = Math.max(Math.min(3, this.value ?? 0), -3);
        }
        if (this.type === "MOVE") {
            this.value = Math.max(0, Math.min(size, value ?? 0));
        }
    }

    complete() {
        this.isComplete = true;
    }
    start() {
        this.isStarted = true;
    }
}

export class Actions {
    stack: Action[];
    mapUpdates: Tile[];
    hook: EventTarget;

    constructor() {
        this.stack = [];
        this.mapUpdates = [];
        this.hook = new EventTarget();
    }
    getActions() {
        const completed = this.stack.filter((a) => a.isComplete);
        completed.forEach((a) => {
            this.hook.dispatchEvent(new CustomEvent(ACTION_COMPLETE_EVENT, { detail: a }));
        })
        this.stack = [...this.stack.filter((a) => !a.isComplete)];
        return this.stack;
    }
    addAction(type: ActionType, { delta, value, timeEnd, entityId }: IAction) {
        const a = new Action(type, { delta, value, timeEnd, entityId });
        this.stack.push(a);
        this.hook.dispatchEvent(new CustomEvent(ACTION_ADD_EVENT, { detail: a }));
    }
    addSilentAction(type: ActionType, { delta, value, timeEnd, entityId }: IAction) {
        const a = new Action(type, { delta, value, timeEnd, entityId }, true);
        this.stack.push(a);
    }
    getMapUpdates() {
        const toReturn = [...this.mapUpdates];
        this.mapUpdates = [];
        return toReturn;
    }
    addMapUpdate(update: Tile) {
        this.mapUpdates.push(update);
        updateMap(update);
    }
}
