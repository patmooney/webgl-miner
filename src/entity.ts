import "./style.css"

import type { Action, ActionType } from "./actions";
import { tileW, size, ANGLE_TO_RAD, type Angle } from "./constants";
import { runAction } from "./commands/index";
import { Inventory } from "./invent";
import { printError, printWarning } from "./console";
import { ModuleStats, type Item } from "./story";
import type { EntityGraphics } from "./graphics/entity";

// BLOCK TYPES
type Vec2D = [number, number];

export type EntityType = "MINER";

export interface IEntityStats {
    drillSpeed: number;
    battery: number;
    speed: number;
    inventorySize: number;
}

export class Entity implements IEntityStats {
    id: number;
    type: EntityType;

    gfx: EntityGraphics;

    actions: ActionType[];

    rotation: Vec2D = [0, 1];
    rad: number = ANGLE_TO_RAD[3];
    angle: Angle = 3;
    inventorySize: number;
    inventory: Inventory;

    speed: number;
    drillSpeed: number;
    battery: number;
    maxBattery: number;

    target: Vec2D | undefined;
    targetR: Angle | undefined;

    coords: Vec2D;

    modules: Item[];

    constructor(gfx: EntityGraphics, id: number, type: EntityType, actions: ActionType[] = ["MOVE", "ROTATE"], modules?: Item[]) {
        this.gfx = gfx;
        this.id = id;
        this.coords = [Math.round((size / 2) * tileW) - (tileW / 2), Math.round((size / 2) * tileW) - (tileW / 2)];
        this.rotation[0] = Math.sin(this.rad);
        this.rotation[1] = Math.cos(this.rad);
        this.actions = actions;
        this.type = type;

        this.maxBattery = 0;
        this.battery = this.maxBattery;
        this.speed = 0;
        this.drillSpeed = 0;
        this.inventorySize = 0;
        this.inventory = new Inventory(undefined, this.inventorySize);
        this.modules = modules ?? [];
    }

    async init() {
        this.balanceModules();
        this.battery = this.maxBattery;
    }

    installModule(name: Item): boolean {
        const mod = ModuleStats[name];
        if (!mod) {
            return false;
        }
        if (this.modules.find((installed) => ModuleStats[installed]?.type === mod.type)) {
            // can't have two moduels of same type ... for now
            return false;
        }
        this.modules.push(name);
        this.balanceModules();
        return true;
    }

    balanceModules() {
        this.speed = 0;
        this.drillSpeed = 0;
        this.maxBattery = 0;
        this.inventorySize = 0;
        this.modules.forEach((m) => {
            const stats = ModuleStats[m]?.stats;
            this.speed += stats?.speed ?? 0;
            this.maxBattery += stats?.battery ?? 0;
            this.drillSpeed += stats?.drillSpeed ?? 0;
            this.inventorySize += stats?.inventorySize ?? 0;
        });
        this.inventory.limit = this.inventorySize;
    }

    update(action?: Action) {
        const prevBat = this.battery;
        if (action) {
            runAction.call(this, action);
        }
        if (this.battery !== prevBat) {
            if (this.battery <= 0) {
                printError(`Entity ${this.id} - no power, battery empty`);
            } else if (this.battery <= (this.maxBattery * 0.2) && prevBat > (this.maxBattery * 0.2)) {
                printWarning(`Entity ${this.id} - battery low warning`);
            } else if (this.battery <= (this.maxBattery * 0.1) && prevBat > (this.maxBattery * 0.1)) {
                printError(`Entity ${this.id} - battery is critical`);
            }
        }
    }

    render(gl: WebGL2RenderingContext, camera: Vec2D) {
        this.gfx.render(gl, this, camera);
    }
}
