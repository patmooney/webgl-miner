import * as csl from "./console";
import { init as initGfx } from "./graphics/main";
import { state } from "./state";
import * as controlInterface from "./control.interface";
import { Entity, type IEntityStats } from "./entity";
import type { ActionType } from "./actions";
import { IS_DEV } from "./constants";

export type WayPoint =
    "STORAGE_FIRST" |
    "IRON_FIRST" |
    "CARBON_FIRST" |
    "COPPER_FIRST" |
    "INTERFACE_CONTROL_INTERFACE" |
    "INTERFACE_AUTOMATION_INTERFACE" |
    "INTERFACE_SMELTING" |
    "DEPLOY_FIRST";

export type ItemClass = "INTERFACE" | "MODULE" | "DEPLOYABLE" | "RESOURCE";

export type ItemQuality = "BASIC";

export type Item_Resource = "stone" | "iron" | "carbon" | "copper" | "coal";
export type Item_Module = "module_visual_scanner" | "module_basic_drill" | "module_basic_battery" | "module_basic_motor"  | "module_home_navigation" | "module_basic_store" |
    "module_dev";
export type Item_Deployable = "deployable_automation_hull";
export type Item_Interface = "interface_automation" | "interface_control" | "interface_smelting";
export type Item = Item_Resource | Item_Module | Item_Deployable | Item_Interface;

export type ModuleType = "engine" | "battery" | "drill" | "navigation" | "store";

export type ItemInfoBase = {
    story?: WayPoint[];
    description: string;
    label: string;
};

export type ItemInfoCraftable = {
    ingredients: { item: Item, count: number }[];
}

export type ItemInfoResource = ItemInfoBase & {
    type: "RESOURCE";
}

export type ItemInfoModule = ItemInfoBase & ItemInfoCraftable & {
    type: "MODULE";
    quality: ItemQuality;
    stats: Partial<IEntityStats>;
    moduleType: ModuleType;
    actionType?: ActionType[];
};

export type ItemInfoDeployable = ItemInfoBase & ItemInfoCraftable & {
    type: "DEPLOYABLE";
    quality: ItemQuality;
}

export type ItemInfoInterface = ItemInfoBase & ItemInfoCraftable & {
    type: "INTERFACE";
    waypoint: WayPoint;
};

export type ItemInfoType = ItemInfoModule | ItemInfoInterface | ItemInfoResource | ItemInfoDeployable;

export const Items: Record<Item, ItemInfoType> = {
    // RESOURCE
    stone: {
        type: "RESOURCE",
        description: "",
        label: "Stone"
    },
    iron: {
        type: "RESOURCE",
        description: "",
        label: "Iron Ore",
    },
    carbon: {
        type: "RESOURCE",
        description: "",
        label: "Carbon"
    },
    copper: {
        type: "RESOURCE",
        description: "",
        label: "Copper Ore",
    },
    coal: {
        type: "RESOURCE",
        description: "",
        label: "Coal"
    },
    // INTERFACE
    interface_control: {
        ingredients: [{ item: "stone", count: 50 }, { item: "iron", count: 10 }],
        story: ["IRON_FIRST"],
        description: "Extra control interface for manual remote instruction",
        type: "INTERFACE",
        waypoint: "INTERFACE_CONTROL_INTERFACE",
        label: "Control Interface"
    },
    interface_automation: {
        ingredients: [
            { item: "stone", count: 50 },
            { item: "iron", count: 10 },
            { item: "copper", count: 10 },
            { item: "carbon", count: 10 }
        ],
        story: ["IRON_FIRST", "CARBON_FIRST", "COPPER_FIRST"],
        description: "Allow automated remote instruction",
        type: "INTERFACE",
        waypoint: "INTERFACE_AUTOMATION_INTERFACE",
        label: "Automation Interface"
    },
    interface_smelting: {
        ingredients: [
            { item: "iron", count: 50 },
            { item: "stone", count: 200 }
        ],
        story: ["IRON_FIRST"],
        description: "For the production of alloy metals",
        type: "INTERFACE",
        waypoint: "INTERFACE_SMELTING",
        label: "Smelting Interface"
    },

    // MODULE
    module_visual_scanner: {
        ingredients: [{ item: "iron", count: 10 }],
        story: ["IRON_FIRST"],
        description: "Visually assess one tile in front",
        type: "MODULE",
        label: "Visual Scanner (Module)",
        quality: "BASIC",
        moduleType: "navigation",
        stats: {},
    },
    module_basic_battery: {
        ingredients: [
            { item: "stone", count: 20 },
            { item: "iron", count: 10 }
        ],
        story: ["IRON_FIRST"],
        description: "A very simple battery with limited capacity",
        type: "MODULE",
        label: "Basic Battery (Module)",
        quality: "BASIC",
        moduleType: "battery",
        stats: { battery: 100, rechargeSpeed: 1 },
        actionType: ["RECHARGE"]
    },
    module_basic_drill: {
        ingredients: [
            { item: "iron", count: 30 }
        ],
        story: ["IRON_FIRST"],
        description: "A brittle, dull drill",
        type: "MODULE",
        label: "Basic Drill (Module)",
        quality: "BASIC",
        moduleType: "drill",
        stats: { drillSpeed: 1, drillPower: 1 },
        actionType: ["MINE"]
    },
    module_basic_motor: {
        ingredients: [
            { item: "stone", count: 20 },
            { item: "iron", count: 50 }
        ],
        story: ["IRON_FIRST"],
        description: "5hp of pure disappointment",
        type: "MODULE",
        label: "Basic Motor (Module)",
        quality: "BASIC",
        moduleType: "engine",
        stats: { speed: 1 },
        actionType: ["MOVE", "ROTATE"]
    },
    module_basic_store: {
        ingredients: [
            { item: "stone", count: 20 },
            { item: "iron", count: 20 }
        ],
        story: ["IRON_FIRST"],
        description: "10 slot store",
        type: "MODULE",
        label: "Basic Store",
        quality: "BASIC",
        moduleType: "store",
        stats: { inventorySize: 10 },
        actionType: ["UNLOAD"]
    },
    module_home_navigation: {
        ingredients: [
            { item: "carbon", count: 10 },
            { item: "copper", count: 10 }
        ],
        story: ["CARBON_FIRST", "COPPER_FIRST"],
        description: "Provides automated routing to nearest base",
        type: "MODULE",
        label: "Home Navigation (Module)",
        quality: "BASIC",
        moduleType: "navigation",
        stats: {}
    },

    module_dev: {
        type: "MODULE",
        label: "DEV DEV DEV",
        quality: "BASIC",
        description: "DEV DEV DEV",
        moduleType: "engine",
        stats: { battery: 10_000, drillSpeed: 10, speed: 10, inventorySize: 10_000, rechargeSpeed: 10, drillPower: 10 },
        ingredients: [],
        actionType: ["ROTATE", "MOVE", "MINE", "UNLOAD", "RECHARGE"]
    },

    // DEPLOYABLE
    deployable_automation_hull: {
        ingredients: [
            { item: "iron", count: 10 }
        ],
        story: ["IRON_FIRST"],
        description: "An empty mining automation hull (deployable)",
        type: "DEPLOYABLE",
        label: "Basic Automation Hull",
        quality: "BASIC"
    },
};

export const onStorage = (item: Item, count: number) => {
    if (count < 0) {
        return;
    }
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

export const onDeploy = (_: Item, name?: string) => {
    if (!state.story.DEPLOY_FIRST) {
        state.addWaypoint("DEPLOY_FIRST");
        csl.printImportant(`An automation requires modules in order to be useful.
Useful commands: list, select, equip`);
    }

    if (state.entityGfx) {
        const id = state.entities.length;
        name = name || `ENTITY-${id}`;
        state.entities.push(
            new Entity(
                state.entityGfx,
                state.entities.length, name,
                [],
                []
            )
        );
        state.updateLights();
    }
};

export const onCraft = (item: Item): boolean => {
    const info = Items[item];
    if (!info || !(info as ItemInfoCraftable).ingredients) {
        return false;
    }
    const ingredients = (info as ItemInfoCraftable).ingredients;
    for (let ing of ingredients) {
        if ((state.inventory.inventory[ing.item] ?? 0) < ing.count) {
            return false;
        }
    }
    for (let ing of ingredients) {
        state.inventory.remove(ing.item, ing.count);
    }
    if (info.type === "MODULE" || info.type === "DEPLOYABLE") {
        state.inventory.add(item);
    } else if (info.type === "INTERFACE") {
        state.addWaypoint(info.waypoint);
    }
    return true;
}

export const onStory = (waypoint: WayPoint) => {
    switch (waypoint) {
        case "STORAGE_FIRST":
            csl.printImportant(`Crafting Unlocked
see command "crafting" for more information`);
            break;
        case "IRON_FIRST": 
            csl.printImportant(`New recipes available`);
            break;
        case "CARBON_FIRST":
            if (state.story.COPPER_FIRST) {
                csl.printImportant(`New recipes available`);
            }
            break;
        case "COPPER_FIRST":
            if (state.story.CARBON_FIRST) {
                csl.printImportant(`New recipes available`);
            }
            break;
        case "INTERFACE_CONTROL_INTERFACE":
            csl.printImportant(`Control interface installed`);
            addControllInterface();
            break;
        case "INTERFACE_AUTOMATION_INTERFACE":
            csl.printImportant(`Automation interface installed`);
            addControllInterface();
            break;
    }
};

const addControllInterface = () => {
    controlInterface.init();
}

export const start = async () => {
    csl.printImportant("Welcome...");
    await delay(500);
    csl.print("Initialising environment...");
    await delay(500);
    csl.printWarning("INIT CONNECTION...");
    await delay(100);
    csl.printWarning("INIT CAMERA...");
    await delay(500);
    initGfx();
    await delay(1500);
    csl.printWarning("INIT COMPLETE");
    await delay(1500);
    csl.command_Clear();
    csl.printImportant(`Your first task will be to deploy and construct a mining automation
========
Type "help" to get started
Useful commands: storage, deploy`);

    const initialStory: WayPoint[] = [];
    const initialStorage: [Item, number][] = [
        ["deployable_automation_hull", 1],
        ["module_basic_drill", 1],
        ["module_basic_motor", 1],
        ["module_basic_store", 1],
        ["module_basic_battery", 1],
    ];

    initialStorage.forEach(([i, c]) => state.inventory.add(i, c));
    initialStory.forEach((w) => state.addWaypoint(w));

    state.inventory.hook = onStorage;
    state.onStory = onStory;
    state.onDeploy = onDeploy;
};

const delay = (timeMs: number) => {
    if (IS_DEV) {
        return;
    }
    return new Promise((res) => setTimeout(res, timeMs));
}
