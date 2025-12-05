import { Actions } from "./actions";
import { HISTORY_MAX, tileW } from "./constants";
import type { Entity } from "./entity";
import type { EntityGraphics } from "./graphics/entity";
import { Inventory } from "./invent";
import type { WayPoint } from "./story";
import { clamp } from "./utils/maths";
import type { Vec2D } from "./world";

export const MAX_ZOOM = 10;
export const MIN_ZOOM = -3;
export const ENTITY_SELECTED_EVENT = "ENTITY_SELECTED";

class State {
    gl?: WebGL2RenderingContext;
    entityGfx?: EntityGraphics;

    camera: Vec2D = [0, 0];
    actions: Actions;
    zoom: number = 0;
    selectedEntity: number | undefined;
    inventory: Inventory;
    isFollowing?: number;
    entities: Entity[] = [];
    story: { [key in WayPoint]?: boolean } = {};
    history: string[] = [];
    onStory?: (waypoint: WayPoint) => void;

    entityHook: EventTarget;

    constructor(actions = new Actions(), inventory = new Inventory(), onStory?: (waypoint: WayPoint) => void) {
        this.actions = actions;
        this.inventory = inventory;
        this.onStory = onStory;
        this.entityHook = new EventTarget();
    }
    selectEntity(id: number) {
        if (this.focusEntity(id)) {
            this.selectedEntity = id;
            this.entityHook.dispatchEvent(new CustomEvent(ENTITY_SELECTED_EVENT, { detail: id }));
        }
    }
    focusEntity(id: number): boolean {
        const entity = this.entities.find((e) => e.id === id);
        if (entity) {
            this.isFollowing = id;
            this.camera = [entity.coords[0] - (8.5 * tileW), entity.coords[1]  - (6.5 * tileW)];
            this.zoom = 0;
            return true;
        }
        return false;
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
    getHistory() {
        this.history = this.history.slice(-HISTORY_MAX).toReversed().filter((v, idx, arr) => arr.indexOf(v) === idx).reverse();
        return this.history;
    }
    addWaypoint(waypoint: WayPoint) {
        if (!this.story[waypoint]) {
            this.story[waypoint] = true;
            this.onStory?.(waypoint);
        }
    }
}

export const state = new State();
