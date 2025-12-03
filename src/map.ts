import { size, tileW, TILE_STORE_SIZE } from "./constants";
import type { Item } from "./invent";
import type { Vec2D } from "./world";

export type TILE = "SHADOW" | "ROCK" | "FLOOR" | "ORE" | "HOME";

export const TILE_DURABILITY = {
    FLOOR: 0,
    ROCK: 10,
    ORE: 100,
    SHADOW: 0,
    HOME: 0
} as const satisfies Record<TILE, number>;

export const TILE_NAVIGATE = {
    FLOOR: true,
    ROCK: false,
    ORE: false,
    SHADOW: false,
    HOME: true
} as const satisfies Record<TILE, boolean>;

export const TILE_TYPE = {
    FLOOR: 0,
    ROCK: 1,
    ORE: 2,
    SHADOW: 3,
    HOME: 4
} as const satisfies Record<TILE, number>;

export const TILE_DROP = {
    ROCK: [{ item: "stone", chance: 1 }]
} as const satisfies { [key in TILE]?: { item: Item, chance: number }[] };

export const getTileType = (tile: number): TILE => {
    return (Object.entries(TILE_TYPE).find(
        ([, v]) => v === tile
    )?.[0] ?? "FLOOR") as TILE;
};

export type Tile = {
    coord: Vec2D;
    tile: TILE;
    type: number;
    durability: number;
}

export const initMap = (): Float32Array => {
    const lStart = (size / 2) - 4;
    const uStart = (size / 2) + 4;
    const lHome = (size / 2) - 2;
    const uHome = (size / 2) + 2;

    /** Initial map state is everywhere shadow and rock except a small square in the center **/

    let map: number[] = [];
    for (let idx = 0; idx < (size * size); idx++) {
        const col = idx % size;
        const row = Math.floor(idx / size);
        if (row > lHome && row < uHome && col > lHome && col < uHome) {
            map.push(TILE_TYPE.HOME, 1);
            continue;
        }
        if (row > lStart && row < uStart && col > lStart && col < uStart) {
            map.push(TILE_TYPE.FLOOR, 1);
            continue;
        }
        if ((row === lStart || row === uStart) && (col >= lStart && col <= uStart)) {
            map.push(TILE_TYPE.ROCK, 1);
            continue;
        }
        if ((col === lStart || col === uStart) && (row >= lStart && row <= uStart)) {
            map.push(TILE_TYPE.ROCK, 1);
            continue;
        }
        map.push(TILE_TYPE.SHADOW, 1);
    }

    return new Float32Array(map);
}

export const getTileFromN = (tileN: number): Vec2D => {
    const col = tileN % size;
    const row = Math.floor(tileN / size);
    return [col, row];
};

export const getTileAt = (coord: Vec2D): Tile => {
    const [col, row] = coord;
    const tileN = (row * size) + col;
    const tile = getMap().at(tileN * TILE_STORE_SIZE);
    const durability = getMap().at((tileN * TILE_STORE_SIZE) + 1) ?? 0;
    if (tile === undefined) {
        throw new Error(`Invalid tile ${col} / ${row}`);
    }
    return { coord, tile: getTileType(tile), type: tile, durability }; 
};

export const coordToTile = (coord: Vec2D): Vec2D => {
    return [Math.round(coord[0] / tileW), Math.round(coord[1] / tileW)];
};

export const getNeighbours = (coord: Vec2D): Tile[] => {
    const neighbours: Tile[] = [];
    const [col, row] = coord;

    if (col > 0) {
        neighbours.push(getTileAt([col-1, row]));
    }
    if (col < (size-1)) {
        neighbours.push(getTileAt([col+1, row]));
    }
    if (row > 0) {
        neighbours.push(getTileAt([col, row-1]));
    }
    if (row < (size-1)) {
        neighbours.push(getTileAt([col, row+1]));
    }

    return neighbours;
}

let _map: Float32Array | undefined;
export const getMap = (): Float32Array => {
    if (!_map) {
        _map = initMap();
    }
    return _map;
}

export const updateMap = (update: Tile) => {
    const map = getMap();
    const [col, row] = update.coord;
    const tileN = (row * size) + col;
    map[tileN * TILE_STORE_SIZE] = update.type;
    map[(tileN * TILE_STORE_SIZE) + 1] = update.durability;
}
