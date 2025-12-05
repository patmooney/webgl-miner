import type { Entity } from "../entity";
import { tileW, CARDINAL_MAP, type Vec2D, type Angle } from "../constants";
import type { Action } from "../actions";
import { coordToTile, getTileAt, TILE_NAVIGATE } from "../map";
import { clamp } from "../utils/maths";
import { state } from "../state";

export const BATTERY_COST = 1;
const baseSpeed = tileW / 100;

export const command = function(this: Entity, action: Action) {
    if (!action.isStarted) {
        const moves = 1; // action.value!; - OK we only do a single move per action now, to account for battery
        const value = getMaxMove(moves, this.angle, this.coords);
        if (this.angle === 3) { // UP
            this.target = [this.coords[0], this.coords[1] + (value * tileW)];
        }
        if (this.angle === 0) { // RIGHT
            this.target = [this.coords[0] + (value * tileW), this.coords[1]];
        }
        if (this.angle === 1) { // DOWN
            this.target = [this.coords[0], this.coords[1] - (value * tileW)];
        }
        if (this.angle === 2) { // LEFT
            this.target = [this.coords[0] - (value * tileW), this.coords[1]];
        }
        action?.start();
    }

    const moveSpeed = baseSpeed;//this.speed * baseSpeed;

    let delta: Vec2D | undefined;
    if (this.target) {
        delta = [
            clamp(-moveSpeed, moveSpeed, this.target[0] - this.coords[0]),
            clamp(-moveSpeed, moveSpeed, this.target[1] - this.coords[1]),
        ];
    }

    if (delta?.[0] === 0 && delta?.[1] === 0) {
        state.updateLights();
        action?.complete();
        this.target = undefined;
        delta = undefined;
    }

    if (delta) {
        if (state.isFollowing === this.id) {
            state.camera[0] += delta[0];
            state.camera[1] += delta[1];
        }
        this.coords = [this.coords[0] + delta[0], this.coords[1] + delta[1]];
    }
}

const getMaxMove = (moves: number, angle: Angle, coords: Vec2D) => {
    let delta: Vec2D = [0, 0];
    if (angle === CARDINAL_MAP.DOWN) {
        delta = [0, -tileW];
    } else if (angle === CARDINAL_MAP.LEFT) {
        delta = [-tileW, 0];
    } else if (angle === CARDINAL_MAP.RIGHT) {
        delta = [tileW, 0];
    } else {
        delta = [0, tileW];
    }
    let allowed = 0;
    let current: Vec2D = [...coords];
    while (allowed < moves) {
        current[0] += delta[0];
        current[1] += delta[1];
        const tileCoord = coordToTile(current);
        const tile = getTileAt(tileCoord);
        if (!TILE_NAVIGATE[tile.tile]) {
            break;
         }
        allowed++;
    }
    return allowed;
};
