import { size, tileW } from "./constants";
import type { Vec2D } from "./world";

export type TILE = "SHADOW" | "ROCK" | "FLOOR" | "ORE";

export const TILE_TYPE = {
    "SHADOW": -1,
    "FLOOR": 0,
    "ROCK": 1,
    "ORE": 2
} as const satisfies Record<TILE, number>;

export type MapUpdate = {
    tile: Vec2D;
    type: number;
}

export const initMap = () => {
    const lDelta = (size / 2) - 4;
    const uDelta = (size / 2) + 4;
    /** Initial map state is everywhere shadow and rock except a small square in the center **/
    const bTypes = new Int32Array(size * size).fill(1).map(
        (_, idx) => {
            const col = idx % size;
            const row = Math.floor(idx / size);
            if (row > lDelta && row < uDelta && col > lDelta && col < uDelta) {
                return TILE_TYPE.FLOOR;
            }
            if ((row === lDelta || row === uDelta) && (col >= lDelta && col <= uDelta)) {
                return TILE_TYPE.ROCK;
            }
            if ((col === lDelta || col === uDelta) && (row >= lDelta && row <= uDelta)) {
                return TILE_TYPE.ROCK;
            }
            return TILE_TYPE.SHADOW;
            //return TILE_TYPE.ROCK;
        }
    );
    return bTypes;
}

export const getTileFromN = (tileN: number): Vec2D => {
    const col = tileN % size;
    const row = Math.floor(tileN / size);
    return [col, row];
};

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
    return [Math.round(coord[0] / tileW), Math.round(coord[1] / tileW)];
};

export const getNeighbours = (coord: Vec2D): MapUpdate[] => {
    const neighbours: MapUpdate[] = [];
    const [col, row] = coord;

    if (col > 0) {
        neighbours.push({ tile: [col-1, row], type: getTileAt([col-1, row]) });
    }
    if (col < (size-1)) {
        neighbours.push({ tile: [col+1, row], type: getTileAt([col+1, row]) });
    }
    if (row > 0) {
        neighbours.push({ tile: [col, row-1], type: getTileAt([col, row-1]) });
    }
    if (row < (size-1)) {
        neighbours.push({ tile: [col, row+1], type: getTileAt([col, row+1]) });
    }

    return neighbours;
}

let _map: Int32Array | undefined;
export const getMap = (): Int32Array => {
    if (!_map) {
        _map = initMap();
    }
    return _map;
}

export const updateMap = (update: MapUpdate) => {
    const map = getMap();
    const [col, row] = update.tile;
    const tileN = (row * size) + col;
    map[tileN] = update.type;
}
