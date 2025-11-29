import { state } from "./state";
import type { Vec2D } from "./world";

let dragStart: Vec2D | undefined;
export const initMouse = () => {
    window.document.body.addEventListener("mousedown", (e: Event) => {
        dragStart = [(e as MouseEvent).clientX, (e as MouseEvent).clientY];
    });
    window.document.body.addEventListener("mousemove", (e: Event) => {
        if (dragStart) {
            let coords = [(e as MouseEvent).clientX, (e as MouseEvent).clientY];
            state.camera[0] = state.camera[0] - (coords[0] - (dragStart?.[0] ?? 0));
            state.camera[1] = state.camera[1] + (coords[1] - (dragStart?.[1] ?? 1));
            dragStart = coords as Vec2D;
        }
    });
    window.document.body.addEventListener("mouseup", () => dragStart = undefined);
};
