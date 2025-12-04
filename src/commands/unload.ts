import type { Entity } from "../entity";
import type { Action } from "../actions";
import { coordToTile, getTileAt, TILE_TYPE } from "../map";
import { state } from "../state";
import type { Item } from "../story";
import { printEntity } from "../console";

export const BATTERY_COST = 0;

export const command = function(this: Entity, action: Action) {
    action.complete();

    const tileCoord = coordToTile(this.coords);
    const tile = getTileAt(tileCoord);

    if (tile.type === TILE_TYPE.HOME) {
        Object.entries(this.inventory.inventory).forEach(
            ([k, v]) => {
                state.inventory.add(k as Item, v);
                this.inventory.remove(k as Item, v);
            }
        );
        printEntity(this.id, "Unloading");
    } else {
        printEntity(this.id, "Unable to unload");
    }
};
