import { printImportant } from "./console";
import { state } from "./state";
import * as controlInterface from "./control.interface";
import type { IEntityStats } from "./entity";

export type WayPoint =
    "STORAGE_FIRST" |
    "IRON_FIRST" |
    "CARBON_FIRST" |
    "COPPER_FIRST" |
    "INTERFACE_CONTROL_INTERFACE" |
    "INTERFACE_AUTOMATION_INTERFACE" |
    "INTERFACE_SMELTING";

export type RecipeName = "VISUAL_SCAN_MODULE" | "AUTOMATION_INTERFACE" | "CONTROL_INTERFACE" |
    "BASIC_DRILL_MODULE" | "BASIC_MOTOR_MODULE" | "BASIC_BATTERY_MODULE" | "MINING_AUTOMATION_HULL" | "HOME_NAVIGATION_MODULE" | "SMELTING_INTERFACE"
export type CraftType = "INTERFACE" | "MODULE" | "DEPLOYABLE";

export type Item = "stone" | "iron" | "carbon" | "copper" | "coal"| "module_visual_scanner" | "module_basic_drill" | "module_basic_battery" | "module_basic_motor" | "deployable_mining_hull" | "module_home_navigation" | "module_basic_store" |
    // DEV MODULES
    "module_dev";

export type ModuleType = "engine" | "battery" | "drill" | "navigation" | "store";

export const ModuleStats: { [key in Item]?: { type: ModuleType, stats: Partial<IEntityStats> } } =  {
    module_basic_battery: {
        type: "battery",
        stats: {
            battery: 100
        }
    },
    module_basic_drill: {
        type: "drill",
        stats: {
            drillSpeed: 1
        }
    },
    module_basic_motor: {
        type: "engine",
        stats: {
            speed: 1
        }
    },
    module_basic_store: {
        type: "store",
        stats: {
            inventorySize: 10
        }
    },
    // DEV
    module_dev: {
        type: "battery",
        stats: {
            battery: 10_000,
            drillSpeed: 20,
            speed: 10,
            inventorySize: 1000
        }
    }
}

export const ItemLabels: Record<Item, string> = {
    stone: "Stone",
    iron: "Iron ore",
    carbon: "Carbon",
    copper: "Copper",
    module_visual_scanner: "Visual Scanner",
    module_basic_battery: "Basic Battery",
    module_basic_drill: "Basic Drill",
    module_basic_motor: "Basic Motor",
    module_basic_store: "Basic Store",
    deployable_mining_hull: "Mining Automation Hull",
    module_home_navigation: "Home Navigation Module",
    coal: "Coal",
    module_dev: "DEV DEV DEV"
} as const satisfies Record<Item, string>;

export type RecipeBase = {
    ingredients: { item: Item, count: number }[];
    story?: WayPoint[];
    description: string;
};

export type RecipeModule = RecipeBase & {
    type: "MODULE" | "DEPLOYABLE";
    item: Item;
};

export type RecipeInterface = RecipeBase & {
    type: "INTERFACE";
    waypoint: WayPoint;
};

export type Recipe = RecipeModule | RecipeInterface;

export const Recipes: Record<RecipeName, Recipe> = {
    VISUAL_SCAN_MODULE: {
        ingredients: [{ item: "iron", count: 10 }],
        story: ["IRON_FIRST"],
        description: "Visually assess one tile in front",
        type: "MODULE",
        item: "module_visual_scanner"
    },
    CONTROL_INTERFACE: {
        ingredients: [{ item: "stone", count: 50 }, { item: "iron", count: 10 }],
        story: ["IRON_FIRST"],
        description: "Extra control interface for manual remote instruction",
        type: "INTERFACE",
        waypoint: "INTERFACE_CONTROL_INTERFACE"
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
        type: "INTERFACE",
        waypoint: "INTERFACE_AUTOMATION_INTERFACE"
    },
    BASIC_BATTERY_MODULE: {
        ingredients: [
            { item: "stone", count: 20 },
            { item: "iron", count: 10 }
        ],
        story: ["IRON_FIRST"],
        description: "A very simple battery with limited capacity",
        type: "MODULE",
        item: "module_basic_battery"
    },
    BASIC_DRILL_MODULE: {
        ingredients: [
            { item: "iron", count: 30 }
        ],
        story: ["IRON_FIRST"],
        description: "A brittle, dull drill",
        type: "MODULE",
        item: "module_basic_drill"
    },
    BASIC_MOTOR_MODULE: {
        ingredients: [
            { item: "stone", count: 20 },
            { item: "iron", count: 50 }
        ],
        story: ["IRON_FIRST"],
        description: "5hp of pure disappointment",
        type: "MODULE",
        item: "module_basic_motor"
    },
    MINING_AUTOMATION_HULL: {
        ingredients: [
            { item: "iron", count: 10 }
        ],
        story: ["IRON_FIRST"],
        description: "An empty mining automation hull (deployable)",
        type: "DEPLOYABLE",
        item: "deployable_mining_hull"
    },
    HOME_NAVIGATION_MODULE: {
        ingredients: [
            { item: "carbon", count: 10 },
            { item: "copper", count: 10 }
        ],
        story: ["CARBON_FIRST", "COPPER_FIRST"],
        description: "Provides automated routing to nearest base",
        type: "MODULE",
        item: "module_home_navigation"
    },
    SMELTING_INTERFACE: {
        ingredients: [
            { item: "iron", count: 50 },
            { item: "stone", count: 200 }
        ],
        story: ["IRON_FIRST"],
        description: "For the production of alloy metals",
        type: "INTERFACE",
        waypoint: "INTERFACE_SMELTING"
    }
};

export const onStorage = (item: Item) => {
    if (!state.story.STORAGE_FIRST) {
        state.addWaypoint("STORAGE_FIRST");
    }
    if (item === "iron" && !state.story.IRON_FIRST) {
        state.addWaypoint("IRON_FIRST");
    }
    if (item === "carbon" && !state.story.CARBON_FIRST) {
        state.addWaypoint("CARBON_FIRST");
    }
    if (item === "copper" && !state.story.COPPER_FIRST) {
        state.addWaypoint("COPPER_FIRST");
    }
};

export const onCraft = (item: RecipeName): boolean => {
    const recipe = Recipes[item];
    if (!recipe) {
        return false;
    }
    for (let ing of recipe.ingredients) {
        if ((state.inventory.inventory[ing.item] ?? 0) < ing.count) {
            return false;
        }
    }
    for (let ing of recipe.ingredients) {
        state.inventory.remove(ing.item, ing.count);
    }
    if (recipe.type === "MODULE") {
        state.inventory.add(recipe.item);
    } else if (recipe.type === "INTERFACE") {
        state.addWaypoint(recipe.waypoint);
    }
    return true;
}

export const onStory = (waypoint: WayPoint) => {
    switch (waypoint) {
        case "STORAGE_FIRST":
            printImportant(`Crafting Unlocked
see command "crafting" for more information`);
            break;
        case "IRON_FIRST": 
            printImportant(`New recipes available`);
            break;
        case "CARBON_FIRST":
            if (state.story.COPPER_FIRST) {
                printImportant(`New recipes available`);
            }
            break;
        case "COPPER_FIRST":
            if (state.story.CARBON_FIRST) {
                printImportant(`New recipes available`);
            }
            break;
        case "INTERFACE_CONTROL_INTERFACE":
            printImportant(`Control interface installed`);
            addControllInterface();
            break;
        case "INTERFACE_AUTOMATION_INTERFACE":
            printImportant(`Automation interface installed`);
            addControllInterface();
            break;
    }
};

const addControllInterface = () => {
    controlInterface.init();
}
