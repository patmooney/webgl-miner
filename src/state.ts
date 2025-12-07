import { Actions, Action } from "./actions";
import { HISTORY_MAX, tileW } from "./constants";
import { Entity } from "./entity";
import type { EntityGraphics } from "./graphics/entity";
import { Inventory } from "./invent";
import type { Script } from "./script";
import type { Item, WayPoint } from "./story";
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
    onDeploy?: (item: Item, name?: string) => void;
    scripts: Record<string, Script>;

    lights: Float32Array;

    entityHook: EventTarget;

    getSave() {
        return {
            ...this,
            gl: undefined,
            entityGfx: undefined,
            entities: this.entities.map((e) => e.getSave()),
            lights: []
        }
    }
    onLoad(save: Partial<State>) {
        Object.assign(this, {
            camera: save.camera ?? this.camera,
            zoom: save.zoom ?? this.zoom,
            selectedEntity: save.selectedEntity ?? this.selectedEntity,
            isFollowing: save.isFollowing ?? this.isFollowing,
            story: save.story ?? this.story,
            history: save.history ?? this.history,
            scripts: save.scripts ?? this.scripts
        });
        if (this.entityGfx) {
            this.entities = save.entities?.map((raw) => {
                const e = new Entity(this.entityGfx!, raw.id, raw.name, raw.actions, raw.modules);
                Object.assign(e, raw);
                e.balanceModules();
                return e;
            }) ?? [];
        }
        if (this.actions && save.actions) {
            this.actions.stack = save.actions.stack.map(
                (a) => {
                    const action = new Action(
                        a.type, {
                            delta: a.delta,
                            value: a.value,
                            timeEnd: a.timeEnd,
                            entityId: a.entityId
                        }, a.isSilent, a.parentId
                    );
                    action.id = a.id;
                    action.isComplete = a.isComplete;
                    action.isStarted = a.isStarted;
                    action.shouldCancel = a.shouldCancel;
                    return action;
                }
            );
        }
        console.log(this.actions);
        if (this.inventory) {
            Object.assign(this.inventory, save.inventory);
        }
        this.updateLights();
    }


    constructor(actions = new Actions(), inventory = new Inventory(), onStory?: (waypoint: WayPoint) => void) {
        this.lights = new Float32Array(16 * 3).fill(0);
        this.actions = actions;
        this.inventory = inventory;
        this.onStory = onStory;
        this.entityHook = new EventTarget();
        this.scripts = {};
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
            this.camera = [entity.coords[0] - (11 * tileW), entity.coords[1]  - (6.5 * tileW)];
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
    updateLights() {
        const lights = new Float32Array(16 * 3).fill(0);
        for (let idx = 0; idx < state.entities.length; idx++) {
            const [x, y] = state.entities[idx].coords;
            lights[idx*3] = x;
            lights[(idx*3)+1] = y;
            lights[(idx*3)+2] = 5 * tileW;
        }
        this.lights = lights;
    }
    deploy(item: Item, name?: string) {
        if (this.inventory.remove(item)) {
            this.onDeploy?.(item, name);
        }
    }
}

export const state = new State();
