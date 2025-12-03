
export type Item = "stone" | "iron" | "carbon" | "copper";

export const ItemLabels: Record<Item, string> = {
    stone: "Stone",
    iron: "Iron ore",
    carbon: "Carbon",
    copper: "Copper"
} as const satisfies Record<Item, string>;

export class Inventory {
    inventory: { [key in Item]?: number } = {};
    hook?: (item: Item, count: number) => void;

    constructor(hook?: (item: Item, count: number) => void) {
        this.hook = hook;
    }

    add(item: Item, count = 1) {
        this.inventory[item] = (this.inventory[item] ?? 0) + count;
        this.hook?.(item, count);
    }

    remove(item: Item, count = 1) {
        if ((this.inventory[item] ?? 0) >= count) {
            this.inventory[item] = this.inventory[item]! - count;
            this.hook?.(item, -count);
            if (!this.inventory[item]) {
                delete this.inventory[item];
            }
            return true;
        }
        return false;
    }
}
