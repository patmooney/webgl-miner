import { size } from "./constants";
import { updateMap, type Tile } from "./map";
import type { Vec2D } from "./world";

export type ActionType = "ROTATE" | "MOVE" | "MINE" | "UNLOAD";

export interface IAction {
    delta?: Vec2D;
    value?: number;
    timeEnd: number;
    entityId: number;
}

export class Action implements IAction {
    type: ActionType;
    delta?: Vec2D;
    value?: number;
    timeEnd: number;
    entityId: number;

    isComplete?: boolean = false;
    isStarted?: boolean = false;

    constructor(type: ActionType, { delta, value, timeEnd, entityId }: IAction) {
        this.type = type;
        this.delta = delta;
        this.value = value;
        this.timeEnd = timeEnd;
        this.entityId = entityId;

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

    constructor() {
        this.stack = [];
        this.mapUpdates = [];
    }
    getActions() {
        this.stack = [...this.stack.filter((a) => !a.isComplete)];
        return this.stack;
    }
    addAction(type: ActionType, { delta, value, timeEnd, entityId }: IAction) {
        const a = new Action(type, { delta, value, timeEnd, entityId });
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
