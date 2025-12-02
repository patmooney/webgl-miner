import type { Vec2D } from "./world";

export type ActionType = "ROTATE" | "MOVE";

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

    constructor() {
        this.stack = [];
    }
    getActions() {
        const now = Date.now();
        const toReturn = [...this.stack.filter((a) => !a.isComplete)];
        this.stack = this.stack.filter(
            (a) => a.timeEnd >= now && !a.isComplete
        );
        return toReturn;
    }
    addAction(type: ActionType, { delta, value, timeEnd, entityId }: IAction) {
        const a = new Action(type, { delta, value, timeEnd, entityId });
        this.stack.push(a);
    }
}
