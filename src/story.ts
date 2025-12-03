import { printImportant } from "./console";
import type { Item } from "./invent";
import { state } from "./state";

export type WayPoint =
    "STORAGE_FIRST" |
    "IRON_FIRST" |
    "CARBON_FIRST" |
    "COPPER_FIRST";

export type RecipeName = "VISUAL_SCAN_MODULE" | "AUTOMATION_INTERFACE" | "CONTROL_INTERFACE";
export type CraftType = "INTERFACE" | "MODULE";

export type Recipe = {
    ingredients: { item: Item, count: number }[];
    story?: WayPoint[];
    description: string;
    type: CraftType;
};

export const Recipes: Record<RecipeName, Recipe> = {
    VISUAL_SCAN_MODULE: {
        ingredients: [{ item: "iron", count: 10 }],
        story: ["IRON_FIRST"],
        description: "Visually assess one tile in front",
        type: "MODULE"
    },
    CONTROL_INTERFACE: {
        ingredients: [{ item: "stone", count: 50 }, { item: "iron", count: 10 }],
        story: ["IRON_FIRST"],
        description: "Extra control interface for manual remote instruction",
        type: "INTERFACE"
    },
    AUTOMATION_INTERFACE: {
        ingredients: [
            { item: "stone", count: 50 },
            { item: "iron", count: 10 },
            { item: "copper", count: 10 },
            { item: "carbon", count: 10 }
        ],
        story: ["IRON_FIRST", "CARBON_FIRST", "COPPER_FIRST"],
        description: "Allow automated remote instruction",
        type: "INTERFACE"
    }
};

export const onStorage = (item: Item) => {
    if (!state.story.STORAGE_FIRST) {
        state.story.STORAGE_FIRST = true;
        printImportant(`Crafting Unlocked
see command "crafting" for more information`);
    }
    if (item === "iron" && !state.story.IRON_FIRST) {
        printImportant(`New recipes available`);
        state.story.IRON_FIRST = true;
    }
    if (item === "carbon" && !state.story.CARBON_FIRST) {
        state.story.CARBON_FIRST = true;
        if (state.story.COPPER_FIRST) {
            printImportant(`New recipes available`);
        }
    }
    if (item === "copper" && !state.story.COPPER_FIRST) {
        state.story.COPPER_FIRST = true;
        if (state.story.CARBON_FIRST) {
            printImportant(`New recipes available`);
        }
    }
};
