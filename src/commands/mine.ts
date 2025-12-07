import type { Entity } from "../entity";
import type { Vec2D, Angle } from "../constants";
import type { Action } from "../actions";
import { coordToTile, distanceFromCenter, getNeighbours, getTileAt, TILE_DROP, TILE_DURABILITY, TILE_TYPE, type Tile } from "../map";
import { state } from "../state";

export const BATTERY_COST = 2;
const MINE_TIME_MS = 2200;

export const command = function(this: Entity, action: Action) {
    if (!action.isStarted) {
        action.timeEnd = Date.now() + (MINE_TIME_MS - (this.drillSpeed * 200));
        action.start();
    }
    if (action.timeEnd! > Date.now()) {
        return;
    }
    action.complete();
    const tile = getFacingTile(coordToTile(this.coords), this.angle, 1);
    if (tile.type === TILE_TYPE.ROCK || tile.type === TILE_TYPE.ORE) {

        let durability = tile.durability * TILE_DURABILITY[tile.tile];
        durability -= this.drillPower;
        const dist = distanceFromCenter(tile);

        for (let i = 0; i < this.drillPower; i++) {
            const drops = TILE_DROP[tile.tile as keyof typeof TILE_DROP] ?? [];
            for (let drop of drops) {
                let chance = drop.chance
                    ? drop.chance
                    : (drop.baseChance ?? 0) * (dist * 0.2);
                while(chance > 0) {
                    if (Math.random() <= chance) {
                        this.inventory.add(drop.item);
                    }
                    chance -= 1;
                }
            }
        }

        if (durability <= 0) { // tile is done
            const neighbours = getNeighbours(tile.coord);
            state.actions.addMapUpdate({ ...tile, type: TILE_TYPE.FLOOR, durability: 1 });
            for (let n of neighbours) {
                if (n.type === TILE_TYPE.SHADOW) {
                    let type: number = TILE_TYPE.ROCK;
                    if (Math.random() < (0.01 * dist)) {
                        // chance that new tile is ore is 5%
                        type = TILE_TYPE.ORE;
                    }
                    state.actions.addMapUpdate({ ...n, type, durability: 1 });
                }
            }
        } else {
            state.actions.addMapUpdate({ ...tile, durability: durability / TILE_DURABILITY[tile.tile] });
        }
    }
};

export const getFacingTile = (tile: Vec2D, angle: Angle, distance = 1): Tile => {
    const target: Vec2D = [...tile];
    if (angle === 0) {
        target[0] += distance;
    } else if (angle === 1) {
        target[1] -= distance;
    } else if (angle === 2) {
        target[0] -= distance;
    } else if (angle === 3) {
        target[1] += distance;
    }
    return getTileAt(target);
};
