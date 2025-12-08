import { size } from "./constants";
import { updateMap, type Tile } from "./map";
import type { Vec2D } from "./world";

export type ActionType = "ROTATE" | "MOVE" | "DEVICE" | "UNLOAD" | "RECHARGE";

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
    parentId?: string;
    result?: number;
    
    isSilent: boolean = false;
    isComplete: boolean = false;
    isStarted: boolean = false;
    isCancelled: boolean = false;
    shouldCancel: boolean = false;

    constructor(type: ActionType, { delta, value, timeEnd, entityId }: IAction, isSilent = false, parentId?: string) {
        this.type = type;
        this.delta = delta;
        this.value = value;
        this.timeEnd = timeEnd;
        this.entityId = entityId;
        this.id = crypto.randomUUID();
        this.isSilent = isSilent;
        this.parentId = parentId;

        if (this.type === "ROTATE") {
            this.value = Math.max(-3, Math.min(3, this.value || 1));
        }
        if (this.type === "MOVE") {
            this.value = Math.max(0, Math.min(size, value || 0));
        }
    }

    complete(result?: number) {
        this.result = result;
        this.isComplete = true;
    }
    start() {
        this.isStarted = true;
    }
    cancel() {
        if (this.isStarted) {
            this.shouldCancel = true;
        } else {
            this.isCancelled = true;
        }
    }
}

export class Actions {
    stack: Action[];
    mapUpdates: Tile[];
    mapChanges: Tile[];
    hook: EventTarget;

    constructor() {
        this.stack = [];
        this.mapUpdates = [];
        this.mapChanges = [];
        this.hook = new EventTarget();
    }
    getActions() {
        const completed = this.stack.filter((a) => a.isComplete);
        completed.forEach((a) => {
            this.hook.dispatchEvent(new CustomEvent(ACTION_COMPLETE_EVENT, { detail: a }));
        })
        this.stack = [...this.stack.filter((a) => !a.isComplete && !a.isCancelled)];
        return this.stack;
    }
    addAction(type: ActionType, { delta, value, timeEnd, entityId }: IAction): Action {
        const a = new Action(type, { delta, value, timeEnd, entityId });
        this.stack.push(a);
        this.hook.dispatchEvent(new CustomEvent(ACTION_ADD_EVENT, { detail: a }));
        return a;
    }
    addSilentAction(type: ActionType, { delta, value, timeEnd, entityId }: IAction, parentId?: string): Action {
        const a = new Action(type, { delta, value, timeEnd, entityId }, true, parentId);
        this.stack.push(a);
        return a;
    }
    cancelOneForEntity(entityId: number): Action | undefined {
        const action = this.stack.find((a) => a.entityId === entityId);
        if (!action) {
            return;
        }
        const children = this.stack.filter((a) => a.parentId === action.id);
        [action, ...children].forEach(
            (a) => a.cancel()
        );
        return action;
    }
    cancelAllForEntity(entityId: number) {
        this.stack.filter((a) => a.entityId === entityId).forEach(
            (a) => a.cancel()
        );
    }
    getMapUpdates() {
        const toReturn = [...this.mapUpdates];
        this.mapUpdates = [];
        return toReturn;
    }
    addMapUpdate(update: Tile) {
        this.mapUpdates.push(update);
        this.mapChanges.push(update);
        updateMap(update);
    }
}
