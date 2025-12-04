import type { Action } from "../actions";
import { printError } from "../console";
import type { Entity } from "../entity";
import { coordToTile, getTileAt, TILE_TYPE } from "../map";

export const BATTERY_COST = 0;
const RECHARGE_TIME_MS = 1000;

export const command = function(this: Entity, action: Action) {
    if (!action.isStarted) {
        const tileCoord = coordToTile(this.coords);
        const tile = getTileAt(tileCoord);
        if (tile.type !== TILE_TYPE.HOME) {
            printError(`Entity [${this.id}] - Unable to recharge at this location`);
            action.complete();
            return;
        }
        action.timeEnd = Date.now() + RECHARGE_TIME_MS
        action.start();
    }
    if (action.timeEnd! > Date.now()) {
        return;
    }
    if (this.battery >= this.maxBattery) {
        action.complete();
        return;
    }
    this.battery++;
    action.timeEnd = Date.now() + RECHARGE_TIME_MS;
};
