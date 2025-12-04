import type { Item } from "./story";

export class Inventory {
    inventory: { [key in Item]?: number } = {};
    limit?: number;
    total: number;
    hook?: (item: Item, count: number) => void;

    constructor(hook?: (item: Item, count: number) => void, limit?: number) {
        this.hook = hook;
        this.limit = limit;
        this.total = 0;
    }

    add(item: Item, count = 1) {
        if (this.limit) {
            count = Math.max(0, Math.min(this.limit - this.total, count));
        }
        if (!count) {
            return;
        }
        this.total += count;
        this.inventory[item] = (this.inventory[item] ?? 0) + count;
        this.hook?.(item, count);
    }

    remove(item: Item, count = 1) {
        if ((this.inventory[item] ?? 0) >= count) {
            this.inventory[item] = this.inventory[item]! - count;
            this.total -= count;
            this.hook?.(item, -count);
            if (!this.inventory[item]) {
                delete this.inventory[item];
            }
            return true;
        }
        return false;
    }
}
