export const tileW = 40;
export const size = 20;

export const ATLAS_IMAGE_NUM = 3; // number of textures in our atlas
export const SATW = 1 / ATLAS_IMAGE_NUM;

export type Vec2D = [number, number];

export type CARDINAL = "UP" | "DOWN" | "LEFT" | "RIGHT";
export const CARDINAL_MAP = {
    RIGHT: 0,
    LEFT: 2,
    DOWN: 1,
    UP: 3
} as const satisfies Record<CARDINAL, number>;

export const ANGLE_TO_RAD: Record<number, number> = {
    0: (0 * Math.PI) / 180.0, // right
    1: (90 * Math.PI) / 180.0, // down
    2: (180 * Math.PI) / 180.0, // left
    3: (270 * Math.PI) / 180.0 // up
};
export const FULL_ROTATION = (360 * Math.PI) / 180.0;

