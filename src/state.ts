import { Actions, Action } from "./actions";
import { print } from "./console";
import { HISTORY_MAX, tileW } from "./constants";
import { Entity } from "./entity";
import type { EntityGraphics } from "./graphics/entity";
import { Inventory } from "./invent";
import { coordToTile, resetMap, updateMap, type Tile } from "./map";
import type { Script, ScriptExecutor } from "./script";
import type { Item, WayPoint } from "./story";
import { clamp } from "./utils/maths";
import type { Vec2D, World } from "./world";

export const MAX_ZOOM = 10;
export const MIN_ZOOM = -3;
export const ENTITY_SELECTED_EVENT = "ENTITY_SELECTED";

class State {
    gl?: WebGL2RenderingContext;
    entityGfx?: EntityGraphics;

    world: World | undefined;
    camera: Vec2D = [0, 0];
    actions: Actions;
    zoom: number = 0;
    selectedEntity: number | undefined;
    inventory: Inventory;
    isFollowing?: number;
    entities: Entity[] = [];
    executors: ScriptExecutor[] = [];
    story: { [key in WayPoint]?: boolean } = {};
    history: string[] = [];
    onStory?: (waypoint: WayPoint) => void;
    onDeploy?: (item: Item, name?: string) => void;
    scripts: Record<string, Script>;

    lights: Float32Array;

    entityHook: EventTarget;

    getSave() {
        const actions: Partial<Actions> = {
            stack: this.actions.stack,
            mapUpdates: this.actions.mapUpdates,
            mapChanges: consolidateMapChanges(this.actions.mapChanges)
        };
        return {
            ...this,
            inventory: this.inventory.inventory,
            gl: undefined,
            entityGfx: undefined,
            entities: this.entities.map((e) => e.getSave()),
            executors: [],
            lights: [],
            actions: actions
        }
    }
    onLoad(save: Partial<State> & { inventory: { [key in Item]?: number } }) {
        Object.assign(this, {
            camera: save.camera ?? this.camera,
            zoom: save.zoom ?? this.zoom,
            selectedEntity: save.selectedEntity ?? this.selectedEntity,
            isFollowing: save.isFollowing ?? this.isFollowing,
            story: save.story ?? this.story,
            history: save.history ?? this.history,
            scripts: save.scripts ?? this.scripts,
        });
        this.inventory.inventory = save.inventory ?? this.inventory.inventory;
        if (this.entityGfx) {
            this.entities = save.entities?.map((raw) => {
                const e = new Entity(this.entityGfx!, raw.id, raw.name, raw.actions, raw.modules);
                Object.assign(e, raw);
                e.inventory = new Inventory();
                e.inventory.inventory = raw.inventory as { [key in Item]?: number } ?? {};
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
            this.actions.mapChanges = save.actions.mapChanges;
        }
        if (this.inventory) {
            Object.assign(this.inventory, save.inventory);
        }
        this.actions.mapChanges.forEach(
            (change) => {
                updateMap(change);
                this.actions.mapUpdates.push(change);
            }
        );
        this.updateLights();
    }

    reset() {
        resetMap();
        this.gl = undefined;
        this.actions = new Actions();
        this.entities = [];
        this.inventory = new Inventory();
        this.lights = new Float32Array(16 * 3).fill(0);
        this.entityHook = new EventTarget();
        this.story = {};
        this.scripts = {};
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
            const [row, col] = coordToTile(state.entities[idx].coords);
            lights[idx*3] = row;
            lights[(idx*3)+1] = col;
            lights[(idx*3)+2] = 5;
        }
        this.lights = lights;
    }
    deploy(item: Item, name?: string) {
        if (this.inventory.remove(item)) {
            this.onDeploy?.(item, name);
        }
    }
    runScripts() {
        for (let s of this.executors) {
            s.run();
            if (s.isComplete) {
                print(`Script finished`);
            }
        }
        this.executors = this.executors.filter((e) => !e.isComplete);
    }
    cancelScripts(entityId: number) {
        this.executors = this.executors.filter((e) => e.entity.id !== entityId);
    }
    saveScript(s: Script) {
        this.scripts[s.name] = s;
    }
}

export const state = new State();

const consolidateMapChanges = (mapChanges: Tile[]): Tile[] => {
    return Object.values(mapChanges.reduce<{ [key: number]: Tile }>(
        (acc, change) => {
            acc[change.tileN] = change;
            return acc;
        }, {}
    ));
};
