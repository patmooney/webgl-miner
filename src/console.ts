import type { Action, ActionType } from "./actions";
import type { Entity } from "./entity";
import { ItemLabels, type Item } from "./invent";
import { state } from "./state";
import { onCraft, Recipes, type RecipeInterface, type RecipeName } from "./story";

const output = document.querySelector('#control_console div#output');

export const parseCmd = (val: string) => {
    print(" ");
    print(` > ${val}`);
    const [rawCmd, value] = val.split(" ");
    const cmd = rawCmd.toLowerCase();

    const isMeta = metaCommand(cmd, value);
    if (isMeta === false) {
        printError("Invalid argument");
        return;
    } else if (isMeta) {
        return;
    }
    const isCommand = entityCommand(cmd, value);
    if (isCommand === false) {
        printError("No entity selected!");
        return;
    } else if (isCommand) {
        return;
    }

    printError(`Unknown command: ${cmd}`);
};

export const printWarning = (str: string) => {
    print (`[WARNING] ${str}`, "warning");
}

export const printError = (str: string) => {
    print(`[ERROR] ${str}`, "error");
}

const entityCommand = (cmd: string, value: string): boolean | undefined => {
    const selected = state.selectedEntity !== undefined ? state.entities.find((e) => e.id === state.selectedEntity) : undefined;
    if (!selected) {
        return undefined;
    }

    const addAction = (actionType: ActionType) => {
        const intVal = parseInt(value ?? 0);
        const action = state.actions.addAction(actionType, { entityId: selected.id, timeEnd: Date.now() + 100000, value: parseInt(value ?? 0) });
        if (actionType === "MOVE" || actionType === "ROTATE") {
            // OK the value for these is how many times to repeat
            for (let i = 1; i < intVal; i++) {
                state.actions.addSilentAction(actionType, { entityId: selected.id, timeEnd: Date.now() + 100000, value: parseInt(value ?? 0) }, action.id);
            }
        }
        return true;
    };

    if (selected.actions.includes(cmd.toUpperCase() as ActionType)) {
        return addAction(cmd.toUpperCase() as ActionType);
    }

    return undefined;
};

const metaCommand = (cmd: string, value: string): boolean | undefined => {
    switch (cmd) {
        case "help": command_Help(); return true;
        case "list": command_List(); return true;
        case "selected": command_Selected(); return true;
        case "commands": command_Commands(); return true;
        case "storage": command_Storage(); return true;
        case "inventory": command_Inventory(); return true;
        case "battery": command_Battery(); return true;
        case "cancel": command_Cancel(); return true;
        case "halt": command_Halt(); return true;
        case "select": return selectEntity(parseInt(value));
        case "crafting": return command_Crafting(value);
        default: return undefined;
    };
};

const selectEntity = (entityId: number) => {
    if (isNaN(entityId)) {
        return false;
    }
    const entity = state.entities.find((e) => e.id === entityId);
    if (!entity) {
        return false;
    }
    state.selectEntity(entityId);
    print(`Entity ${entityId} selected`);
    return true;
}

export const printAction = (e: Entity, a: Action | undefined) => {
    if (!a || a.isSilent) {
        return;
    }
    print(`[${(Date.now() / 1000).toFixed(0)}] Entity [${e.id}] - ${a.type}: ${a.value}`, "log");
};

export const printEntity = (id: number, msg: string) => {
    print(`[ENTITY:${id}] ${msg}`);
}

export const print = (str: string, className?: string) => {
    str.split("\n").map(
        (line) => {
            const p = document.createElement("p");
            p.textContent = line || "";
            if (className) {
                p.className = className;
            }
            output?.appendChild(p);
        }
    );
    output?.scrollTo(0, output.scrollHeight ?? 0);
};

export const printImportant = (str: string) => {
    print(str, "important");
};

export const command_Welcome = () => {
    printImportant(`Welcome
========
Type "help" to get started`);
};

export const command_List = () => {
    print(`
ENTITIES
==========

${state.entities.map((e) => `[${e.id}] - ${e.type}`).join("\n")}
`);
};

export const command_Help = () => {
    const extra: string[] = [];
    if (state.story.STORAGE_FIRST) {
        extra.push(`crafting    - List and craft available recipes`);
    }
    print(`
HELP
=====

- Manage -
list       - List available entities.
storage    - Show current store inventory.

- Entity -
select <n> - Select entity for control.
selected   - Show currently selected entitiy.
commands   - List available commands for selected entity.
inventory  - Show current entity inventory.
battery    - Show current entity battery value.
cancel     - Cancel current action where possible.
halt       - Cancel all queued actions including current where possible.
${extra.join("\n")}
`);
};

export const command_Selected = () => {
    const selected = state.selectedEntity !== undefined ? state.entities.find((e) => e.id === state.selectedEntity) : undefined;
    print(`
SELECTED
=========

${selected ? `[${selected.id}] - ${selected.type}` : "- NONE -"}
`);
};

export const command_Commands = () => {
    const selected = state.selectedEntity !== undefined ? state.entities.find((e) => e.id === state.selectedEntity) : undefined;
    if (!selected) {
        return printError(`No entity selected`);
    }
print(`
COMMANDS
=========

${selected.actions.map((act) => ` - ${act.toLowerCase()}`).join("\n")}
`);
}

export const command_Storage = () => {
    print(`
STORAGE
========

${Object.entries(state.inventory.inventory).map(([k, v]) => `${ItemLabels[k as Item]} - ${v}`).join("\n")}
`);
};

export const command_Inventory = () => {
    const selected = state.selectedEntity !== undefined ? state.entities.find((e) => e.id === state.selectedEntity) : undefined;
    if (!selected) {
        return printError(`No entity selected`);
    }
    print(`
INVENTORY
==========
Slots: ${selected.inventory.total} / ${selected.inventory.limit ?? "-"}

${Object.entries(selected.inventory.inventory).map(([k, v]) => `${ItemLabels[k as Item]} - ${v}`).join("\n")}
`);

};

export const command_Battery = () => {
    const selected = state.selectedEntity !== undefined ? state.entities.find((e) => e.id === state.selectedEntity) : undefined;
    if (!selected) {
        return printError(`No entity selected`);
    }
    print(`Entity [${selected.id}] battery: ${selected.battery} / 100`);
};

export const command_Cancel = () => {
    const selected = state.selectedEntity !== undefined ? state.entities.find((e) => e.id === state.selectedEntity) : undefined;
    if (!selected) {
        return printError(`No entity selected`);
    }
    const action = state.actions.cancelOneForEntity(selected.id);
    if (action) {
        print(`Entity [${selected.id}] request to cancel ${action.type}`);
    }
};

export const command_Halt = () => {
    const selected = state.selectedEntity !== undefined ? state.entities.find((e) => e.id === state.selectedEntity) : undefined;
    if (!selected) {
        return printError(`No entity selected`);
    }
    state.actions.cancelAllForEntity(selected.id);
    print(`Entity [${selected.id}] cancel all queued actions`);
};

export const command_Crafting = (recipe?: string) => {
    if (!state.story.STORAGE_FIRST) {
        return undefined;
    }
    if (recipe?.trim()) {
        if (!Recipes[recipe as RecipeName]) {
            printError(`Unknown recipe: ${recipe}`);
            return true;
        }
        return onCraft(recipe as RecipeName);
    }
    const recipes = Object.entries(Recipes).filter(
        ([, v]) => (v.story ?? []).every((s) => state.story[s])
    ).filter(
        ([, v]) => !(v as RecipeInterface).waypoint || !state.story[(v as RecipeInterface).waypoint]
    ).map(
        ([k, v]) => `${k}\n${v.description}\n${v.ingredients.map((r) => ` - ${r.item} x ${r.count}`).join("\n")}`
    );
    print(`
CRAFTING
=========

Usage: "crafting <recipe>"

${recipes?.length ? "- Recipes -\n\n" + recipes.join("\n\n") : " - No recipes available -"}
`);

    return true;
};
