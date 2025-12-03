import { MIN_ZOOM, state } from "./state";
import type { Vec2D } from "./world";
import * as csl from "./console";
import { HISTORY_MAX } from "./constants";
import { onNav } from "./story";

let dragStart: Vec2D | undefined;
let canvas = document.getElementById("c");
const input = document.querySelector('#control_console input');

let historyIdx = HISTORY_MAX;

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

    canvas?.addEventListener("wheel", (e) => {
        const deltaY = (e as WheelEvent).deltaY;
        state.setZoom(state.zoom + (deltaY > 0 ? 1 : -1));
    });

    input?.addEventListener("keyup", (e) => {
        const key = (e as KeyboardEvent).key;
        const val = (e.target as HTMLInputElement).value;
        if (key === "Enter" && val.length) {
            state.history.push(val);
            csl.parseCmd(val);
            (e.target as HTMLInputElement).value = "";
            const history = state.getHistory();
            historyIdx = Math.min(history.length, HISTORY_MAX);
        }
        if (key === "ArrowUp") {
            if (historyIdx > 0) {
                const history = state.getHistory();
                historyIdx--;
                (input as HTMLInputElement).value = history[historyIdx] ?? "";
            }
        }
        if (key === "ArrowDown") {
            const history = state.getHistory();
            if (historyIdx >= history.length) {
                (input as HTMLInputElement).value = "";
            } else {
                historyIdx++;
                (input as HTMLInputElement).value = history[historyIdx] ?? "";
            }
        }
    });

    (input as HTMLInputElement)?.focus();

    document.querySelector("#nav > div:first-of-type")?.addEventListener("click", (e) => onNav(e.target as HTMLDivElement, "control_console"));
};
