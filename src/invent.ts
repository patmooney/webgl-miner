
export type Item = "stone" | "iron";

export const ItemLabels: Record<Item, string> = {
    stone: "Stone",
    iron: "Iron ore"
} as const satisfies Record<Item, string>;

export class Inventory {
    inventory: { [key in Item]?: number } = {};
    add(item: Item, count = 1) {
        this.inventory[item] = (this.inventory[item] ?? 0) + count;
    }
    remove(item: Item, count = 1) {
        if ((this.inventory[item] ?? 0) >= count) {
            this.inventory[item] = this.inventory[item]! - count;
            if (!this.inventory[item]) {
                delete this.inventory[item];
            }
            return true;
        }
        return false;
    }
}
