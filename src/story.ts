import { printImportant } from "./console";
import { interface_Control } from "./interface/control";
import type { Item } from "./invent";
import { state } from "./state";

export type WayPoint =
    "STORAGE_FIRST" |
    "IRON_FIRST" |
    "CARBON_FIRST" |
    "COPPER_FIRST" |
    "INTERFACE_CONTROL_INTERFACE" |
    "INTERFACE_AUTOMATION_INTERFACE";

export type RecipeName = "VISUAL_SCAN_MODULE" | "AUTOMATION_INTERFACE" | "CONTROL_INTERFACE";
export type CraftType = "INTERFACE" | "MODULE";

export type RecipeBase = {
    ingredients: { item: Item, count: number }[];
    story?: WayPoint[];
    description: string;
};

export type RecipeModule = RecipeBase & {
    type: "MODULE";
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
    const nav = document.getElementById("nav");
    const context = document.getElementById("context");

    const link = document.createElement("div");
    link.textContent = "Control";

    const control = document.createElement("div");
    control.id = "control_control";
    control.classList.add("hidden");
    control.innerHTML = interface_Control;
    link.addEventListener("click", () => onNav(link, "control_control"));

    nav?.appendChild(link);
    context?.appendChild(control);
};

export const onNav = (link: HTMLDivElement, control: string) => {
    Array.from(document.querySelectorAll('div#context > div')).forEach(
        (div) => (div as HTMLDivElement).classList.add("hidden")
    );
    Array.from(document.querySelectorAll("#nav > div")).forEach(
        (nav) => (nav as HTMLDivElement).classList.remove("active")
    );
    document.getElementById(control)?.classList.remove("hidden");
    link.classList.add("active");
}
