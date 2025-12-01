import { Actions } from "./actions";
import type { Vec2D } from "./world";

class State {
    camera: Vec2D = [0, 0];
    actions: Actions;
    constructor() {
        this.actions = new Actions();
    }
}

export const state = new State();
