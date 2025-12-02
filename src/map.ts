import { size, tileW } from "./constants";
import type { Vec2D } from "./world";

export type TILE = "ROCK" | "FLOOR" | "ORE";

export const TILE_TYPE = {
    "FLOOR": 0,
    "ROCK": 1,
    "ORE": 2
} as const satisfies Record<TILE, number>;

export const initMap = () => {
    const lDelta = (size / 2) - 3;
    const uDelta = (size / 2) + 3;
    const bTypes = new Int32Array(size * size).fill(1).map(
        (_, idx) => {
            const col = idx % size;
            const row = Math.floor(idx / size);
            return (row >= lDelta && row <= uDelta && col >= lDelta && col <= uDelta) ? TILE_TYPE.FLOOR : TILE_TYPE.ROCK;
        }
    );
    return bTypes;
}

export const getTileAt = (coord: Vec2D): number => {
    const [col, row] = coord;
    const tileN = (row * size) + col;
    const tile = getMap().at(tileN);
    if (tile === undefined) {
        throw new Error(`Invalid tile ${col} / ${row}`);
    }
    return tile;
};

export const coordToTile = (coord: Vec2D): Vec2D => {
    return [Math.round(coord[0] * tileW), Math.round(coord[1] * tileW)];
};

let _map: Int32Array | undefined;
export const getMap = (): Int32Array => {
    if (!_map) {
        _map = initMap();
    }
    return _map;
}
