import { Actions } from "./actions";
import { tileW } from "./constants";
import { clamp } from "./utils/maths";
import type { Vec2D } from "./world";

export const MAX_ZOOM = 10;
export const MIN_ZOOM = -3;

class State {
    camera: Vec2D = [0, 0];
    actions: Actions;
    zoom: number = 0;

    constructor() {
        this.actions = new Actions();
    }
    resolution(gl: WebGL2RenderingContext): [number, number] {
        const ratio = gl.canvas.height / gl.canvas.width;
        const w = gl.canvas.width + (100 * this.zoom);
        const h = gl.canvas.height + ((100 * this.zoom) * ratio);
        return [w, h];
    }
    setZoom(zoom: number) {
        const nZoom = clamp(MIN_ZOOM, MAX_ZOOM, zoom);
        if (nZoom > this.zoom) {
            this.camera[0] = this.camera[0] - tileW;
            this.camera[1] = this.camera[1] - tileW;
        } else if (nZoom < this.zoom) {
            this.camera[0] = this.camera[0] + tileW;
            this.camera[1] = this.camera[1] + tileW;
        } else {
            return;
        }
        this.zoom = nZoom;
    }
}

export const state = new State();
