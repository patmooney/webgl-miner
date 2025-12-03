import type { Entity } from "../entity";
import type { Vec2D, Angle } from "../constants";
import type { Action } from "../actions";
import { coordToTile, getNeighbours, getTileAt, TILE_DROP, TILE_DURABILITY, TILE_TYPE, type Tile } from "../map";
import { state } from "../state";

const DAMAGE = 1;
const MINE_TIME_MS = 2000;

export const command_Mine = function(this: Entity, action: Action) {
    if (!action.isStarted) {
        action.timeEnd = Date.now() + MINE_TIME_MS
        action.start();
    }
    if (action.timeEnd > Date.now()) {
        return;
    }
    action.complete();
    const tile = getFacingTile(coordToTile(this.coords), this.angle, 1);
    if (tile.type === TILE_TYPE.ROCK || tile.type === TILE_TYPE.ORE) {

        let durability = tile.durability * TILE_DURABILITY[tile.tile];
        durability -= DAMAGE;

        const drops = TILE_DROP[tile.tile as keyof typeof TILE_DROP] ?? [];
        for (let drop of drops) {
            if (Math.random() <= drop.chance) {
                this.inventory.add(drop.item)
            }
        }

        if (durability <= 0) { // tile is done
            const neighbours = getNeighbours(tile.coord);
            state.actions.addMapUpdate({ ...tile, type: TILE_TYPE.FLOOR, durability: 1 });
            for (let n of neighbours) {
                if (n.type === TILE_TYPE.SHADOW) {
                    state.actions.addMapUpdate({ ...n, type: TILE_TYPE.ROCK, durability: 1 });
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
