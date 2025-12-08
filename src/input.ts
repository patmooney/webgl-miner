import { MIN_ZOOM, state, type KeyboardBind } from "./state";
import type { Vec2D } from "./world";
import * as csl from "./console";
import { HISTORY_MAX } from "./constants";

let dragStart: Vec2D | undefined;
const input = document.querySelector('#control_console input');

let historyIdx = HISTORY_MAX;

export const init = () => {
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
    document.addEventListener("keyup", (e) => {
        if (document.activeElement === input) {
            return;
        }
        const kb = state.keybinds.find((kb) => kb.key === e.key);
        if (kb) {
            csl.parseCmd(kb.exec);
        }
    });
};

export const initCanvas = () => {
    let canvas = document.getElementById("c");
    canvas?.addEventListener("mousedown", (e: Event) => {
        dragStart = [(e as MouseEvent).clientX, (e as MouseEvent).clientY];
    });
    canvas?.addEventListener("mousemove", (e: Event) => {
        if (dragStart) {
            state.isFollowing = undefined;
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
}


export const onNav = (link: HTMLDivElement, control: string) => {
    Array.from(document.querySelectorAll('div#context > div')).forEach(
        (div) => (div as HTMLDivElement).classList.add("hidden")
    );
    Array.from(document.querySelectorAll("#nav > div")).forEach(
        (nav) => (nav as HTMLDivElement).classList.remove("active")
    );
    document.getElementById(control)?.classList.remove("hidden");
    link.classList.add("active");
}

export const onKeybind = (exec: string) => {
    setTimeout(() => {
        csl.print(`Press a key to bind...`);
        document.addEventListener("keyup", (e) => {
            const kb: KeyboardBind = {
                key: e.key,
                exec
            };
            state.addKeybind(kb);
            csl.print(`"${exec}" bound to ${kb.key}`);
        }, { once: true });
    }, 100);
};
