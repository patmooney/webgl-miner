import { MIN_ZOOM, state } from "./state";
import type { Vec2D } from "./world";

let dragStart: Vec2D | undefined;
let canvas = document.getElementById("c");
export const initMouse = () => {
    canvas?.addEventListener("mousedown", (e: Event) => {
        dragStart = [(e as MouseEvent).clientX, (e as MouseEvent).clientY];
    });
    canvas?.addEventListener("mousemove", (e: Event) => {
        if (dragStart) {
            let coords = [(e as MouseEvent).clientX, (e as MouseEvent).clientY];
            const zoom = state.zoom + (0 - MIN_ZOOM)
            const ratio = 0.6 + (zoom * 0.125);
            const xMove = (coords[0] - (dragStart?.[0] ?? 0)) * ratio;
            const yMove = (coords[1] - (dragStart?.[1] ?? 0)) * ratio;
            state.camera[0] = state.camera[0] - xMove;
            state.camera[1] = state.camera[1] + yMove;
            dragStart = coords as Vec2D;
        }
    });
    canvas?.addEventListener("mouseup", () => dragStart = undefined);
    canvas?.addEventListener("mouseout", () => dragStart = undefined);

    document.addEventListener("wheel", (e) => {
        const deltaY = (e as WheelEvent).deltaY;
        state.setZoom(state.zoom + (deltaY > 0 ? 1 : -1));
    });
};
