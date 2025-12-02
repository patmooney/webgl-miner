import type { Entity } from "../entity";
import type { Vec2D, Angle } from "../constants";
import type { Action } from "../actions";
import { coordToTile, getNeighbours, getTileAt, TILE_TYPE } from "../map";
import { state } from "../state";

export const command_Mine = function(this: Entity, action: Action) {
    action.complete();
    const [target, tileN] = getFacingTile(coordToTile(this.coords), this.angle, 1);
    if (tileN === TILE_TYPE.ROCK || tileN === TILE_TYPE.ORE) {
        const neighbours = getNeighbours(target);
        state.actions.addMapUpdate({ tile: target, type: TILE_TYPE.FLOOR });
        for (let n of neighbours) {
            if (n.type === TILE_TYPE.SHADOW) {
                state.actions.addMapUpdate({ tile: n.tile, type: TILE_TYPE.ROCK });
            }
        }
    }
};

export const getFacingTile = (tile: Vec2D, angle: Angle, distance = 1): [Vec2D, number] => {
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
    return [target, getTileAt(target)];
};
