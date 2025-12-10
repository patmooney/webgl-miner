import type { Item } from "./story";

export const INVENTORY_EVENT = "INVENTORY_EVENT";
export type InventoryEventType = [Item, number];

export class Inventory {
    inventory: { [key in Item]?: number } = {};
    limit?: number;
    total: number;
    hook: EventTarget;

    constructor(limit?: number) {
        this.hook = new EventTarget();
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
        this.hook.dispatchEvent(new CustomEvent(INVENTORY_EVENT, { detail: [item, count] }));
    }

    remove(item: Item, count = 1) {
        if ((this.inventory[item] ?? 0) >= count) {
            this.inventory[item] = this.inventory[item]! - count;
            this.total -= count;
            this.hook.dispatchEvent(new CustomEvent(INVENTORY_EVENT, { detail: [item, -count] }));
            if (!this.inventory[item]) {
                delete this.inventory[item];
            }
            return true;
        }
        return false;
    }
}
