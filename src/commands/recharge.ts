import type { Action } from "../actions";
import { printError } from "../console";
import type { Entity } from "../entity";
import { coordToTile, getTileAt, TILE_TYPE } from "../map";

export const BATTERY_COST = 0;
const RECHARGE_TIME_MS = 1100;

export const command = function(this: Entity, action: Action) {
    if (!action.isStarted) {
        const tileCoord = coordToTile(this.coords);
        const tile = getTileAt(tileCoord);
        if (tile.type !== TILE_TYPE.HOME) {
            printError(`Entity [${this.id}] - Unable to recharge at this location`);
            action.complete();
            return;
        }
        action.timeEnd = Date.now() + (RECHARGE_TIME_MS - (this.rechargeSpeed * 100));
        action.start();
    }
    if (action.timeEnd! > Date.now()) {
        return;
    }
    const target = action.value
        ? (Math.max(0, Math.min(100, action.value)) / 100) * this.maxBattery
        : this.maxBattery;
    if (this.battery >= target || action.shouldCancel) {
        action.complete();
        return;
    }
    this.battery++;
    action.timeEnd = Date.now() + (RECHARGE_TIME_MS - (this.rechargeSpeed * 100));
};
