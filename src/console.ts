import type { Action, ActionType } from "./actions";
import { CONSOLE_LINES, IS_DEV } from "./constants";
import { Entity } from "./entity";
import { end } from "./graphics/main";
import { coordToTile, getTileAt, TILE_TYPE } from "./map";
import { state } from "./state";
import { onCraft, type Item, Items, type ItemInfoModule, type ItemInfoCraftable, type ItemInfoInterface, type ItemInfoBase, type Item_Module, start } from "./story";
import { clearTexMap } from "./utils/webgl";

const output = document.querySelector('#control_console div#output');

type commandsType = "list" | "storage" | "deploy" | "select" | "selected" | "commands" | "inventory" | "uninstall" |
    "actions" | "battery" | "cancel" | "halt" | "modules" | "focus" | "exec" | "install" | "save";
type commandGroup = "Manage" | "Entity";

const ConsoleHelp: Record<commandGroup, [commandsType, string, string][]> = {
    Manage: [
        ["list", "List available entities.", ""],
        ["storage", "Show current store inventory.", ""],
        ["deploy", "Deploy from storage. Ex. deploy <deployable_name> <label>", "str, str?"],
        ["select", "Select entity for control.", "int"],
        ["selected","Show currently selected entitiy.", ""],
    ],
    Entity: [
        ["commands","List available commands for selected entity.", ""],
        ["inventory","Show current entity inventory.", ""],
        ["battery","Show current entity battery value.", ""],
        ["modules","List currently installed modules and stats.", ""],
        ["exec","Execute a named script.", ""],
        ["install","Install a module from the main storage", "str"],
        ["uninstall", "Remove an installed module", "str"],
        ["actions", "Display queue of actions", ""],
        ["focus","Move camera and follow selected entity.", ""],
        ["cancel","Cancel current action where possible.", ""],
        ["halt","Cancel all queued actions where possible.", ""],
    ]
};

const CommandHelp: Record<ActionType, [string, string, string]> = {
    "MINE":     ["mine", "Activate drill <n> times.", "int=1"],
    "MOVE":     ["move", "Move <n> in facing direction.", "int=1"],
    "RECHARGE": ["recharge", "Recharge entity battery <n> units. HOME ONLY.", "int?"],
    "ROTATE":   ["rotate", "Rotate 90 degrees CW <n> or CCW <-n>.", "int [-3, 3]"],
    "UNLOAD":   ["unload", "Move entity inventory to storage. HOME ONLY.", ""]
};

const entityCommands = ConsoleHelp.Entity.map((c) => c.at(0));

export const print = (str: string, className?: string) => {
    const lines = str.split("\n").map(
        (line) => {
            const p = document.createElement("p");
            p.textContent = line || "";
            if (className) {
                p.className = className;
            }
            return p;
        }
    );
    const existing = Array.from(output?.children ?? []);
    const toRemove = (existing.length + lines.length) - CONSOLE_LINES;
    for (let idx = 0; idx < Math.max(toRemove, 0); idx++) {
        existing[idx]?.remove();
    }
    lines.forEach((line) => output?.appendChild(line));
    output?.scrollTo(0, output.scrollHeight ?? 0);
};

export const printImportant = (str: string) => {
    print(str, "important");
};

export const printWarning = (str: string) => {
    print (`[WARNING] ${str}`, "warning");
}

export const printHeader = (str: string, isBold = true) => {
    print(str, isBold ? "bold header white" : "header black");
}

export const printError = (str: string) => {
    print(`[ERROR] ${str}`, "error");
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

export const printTable = (rows: string[][], headers?: string[], div = " ") => {
    const colWidths = [...(headers ? [headers] : []), ...rows].reduce<number[]>(
        (acc, row) => {
            row.forEach((s, idx) => {
                acc[idx] = Math.max(acc[idx] ?? 0, s.length);
            });
            return acc;
        }, []
    );
    if (headers) {
        printHeader(
            headers.map(
                (col, idx) => col.padEnd(colWidths[idx] ?? 0)
            ).join(div), false
        )
    }
    rows.forEach((row) => {
        print(
            row.map(
                (col, idx) => col.padEnd(colWidths[idx] ?? 0)
            ).join(div)
        )
    });
};

export const parseCmd = (val: string) => {
    print(" ");
    print(` > ${val}`);
    const [rawCmd, ...values] = val.split(" ");
    const cmd = rawCmd.toLowerCase();

    const isMeta = metaCommand(cmd, values);
    if (isMeta === false) {
        printError("Invalid argument");
        return;
    } else if (isMeta) {
        return;
    }
    const isCommand = entityCommand(cmd, values);
    if (isCommand === false) {
        printError("No entity selected!");
        return;
    } else if (isCommand) {
        return;
    }

    printError(`Unknown command: ${cmd}`);
};



const entityCommand = (cmd: string, values: string[]): boolean | undefined => {
    const selected = state.selectedEntity !== undefined ? state.entities.find((e) => e.id === state.selectedEntity) : undefined;
    if (!selected) {
        return undefined;
    }
    const [value] = values;

    const addAction = (actionType: ActionType) => {
        const intVal = parseInt(value ?? 0);
        const action = state.actions.addAction(actionType, { entityId: selected.id, timeEnd: Date.now() + 100000, value: intVal });
        if (actionType === "MOVE" || actionType === "ROTATE" || actionType === "MINE") {
            // OK the value for these is how many times to repeat
            for (let i = 1; i < (action.value ?? intVal); i++) {
                state.actions.addSilentAction(actionType, { entityId: selected.id, timeEnd: Date.now() + 100000, value: intVal }, action.id);
            }
        }
        return true;
    };

    if (selected.actions.includes(cmd.toUpperCase() as ActionType)) {
        return addAction(cmd.toUpperCase() as ActionType);
    }

    return undefined;
};

const metaCommand = (cmd: string, values: string[]): boolean | undefined => {
    const [value] = values;
    switch (cmd) {
        case "help": command_Help(); return true;
        case "list": command_List(); return true;
        case "select": return selectEntity(parseInt(value));
        case "storage": command_Storage(); return true;
        case "deploy": return command_Deploy(values);
        case "clear": command_Clear(); return true;
        case "crafting": return command_Crafting(value);
        case "selected": command_Selected(); return true;
        case "dev_spawn": return command_DEV_SPAWN();
        case "save": command_Save(); return true;
        case "load": command_Load(); return true;
        case "reset": command_Reset(); return true;
    };

    if (entityCommands.includes(cmd)) {
        const selected = state.selectedEntity !== undefined ? state.entities.find((e) => e.id === state.selectedEntity) : undefined;
        if (selected) {
            switch(cmd) {
                case "commands": command_Commands(selected, value); return true;
                case "inventory": command_Inventory(selected, value); return true;
                case "battery": command_Battery(selected, value); return true;
                case "cancel": command_Cancel(selected, value); return true;
                case "halt": command_Halt(selected, value); return true;
                case "focus": command_Focus(selected, value); return true;
                case "modules": command_Modules(selected, value); return true;
                case "actions": command_Actions(selected); return true;
                case "exec": return command_Exec(selected, value);
                case "install": return command_Install(selected, value);
                case "uninstall": return command_Uninstall(selected, value);
            }
        } else {
            printError(`No entity selected.`);
            return true;
        }
    }

    return undefined;
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

export const command_List = () => {
    printHeader("Entities");
    print(state.entities.map((e) => `[${e.id}] - ${e.name}`).join("\n"));
}

export const command_Help = () => {
    const extra: string[] = [];
    if (state.story.STORAGE_FIRST) {
        extra.push(`crafting    - List and craft available recipes`);
    }
    printHeader("Help");
    print(` - Manage -
`);
    printTable(ConsoleHelp.Manage, ["Command", "Description", "Args"], " | ");
    print(`
- Entity -
`);
    printTable(ConsoleHelp.Entity, ["Command", "Description", "Args"], " | ");
};

export const command_Deploy = ([value, label]: string[]) => {
    if (value && Items[value as Item]?.type === "DEPLOYABLE") {
        state.deploy(value as Item, label);
        return true;
    }
    printError(`"${value}" is not recognised as a deployable item.`);
    return true;
}

export const command_Selected = () => {
    const selected = state.selectedEntity !== undefined ? state.entities.find((e) => e.id === state.selectedEntity) : undefined;
    printHeader("Selected");
    print(selected ? `[${selected.id}] - ${selected.name}` : "- NONE -");
};

export const command_Commands = (selected: Entity, _2: string) => {
    printHeader("Commands");
    const actions = selected.actions;
    printTable(actions.map((action) => CommandHelp[action]), ["Command", "Description", "Args"], " | ");
}

export const command_Storage = () => {
    printHeader("Storage");
    printItems(Object.entries(state.inventory.inventory).map<[Item, number]>(([k, v]) => ([k as Item, v])));
};

const printItems = (items: [Item, number][]) => {
    const rows = items.map(([k, v]) => (
        [`[${k}]`, Items[k].label, Items[k].type, (Items[k] as ItemInfoModule).quality ?? "", v.toString()]
    ));
    printTable(rows, ["Name", "Label", "Type", "Quality", "Quantity"], " | ");
};

export const command_Focus = (selected: Entity, _: string) => {
    state.focusEntity(selected.id);
}

export const command_Inventory = (selected: Entity, _: string) => {
    printHeader("Inventory");
    print(`Slots: ${selected.inventory.total} / ${selected.inventory.limit ?? "-"}`);
    printItems(Object.entries(selected.inventory.inventory).map<[Item, number]>(([k, v]) => ([k as Item, v])));
};

export const command_Battery = (selected: Entity, _: string) => {
    print(`Entity [${selected.id}] battery: ${selected.battery} / ${selected.maxBattery}`)
};

export const command_Modules = (selected: Entity, _: string) => {
    printHeader("Installed Modules");
    printTable(
        selected.modules.map((name) => {
            const mod = Items[name] as ItemInfoModule;
            return [name, mod.label, mod.quality, mod.moduleType];
        }),
        ["Name", "Label", "Quality", "Type"],
        " | "
    );
    print(`[ Movement: ${selected.speed} ] [ Battery: ${selected.battery} / ${selected.maxBattery} ] [ Charge Speed: ${selected.rechargeSpeed} ]`);
    print (`[ Drill Power: ${selected.drillPower} ] [ Drill Speed: ${selected.drillSpeed} ]`);
};


export const command_Cancel = (selected: Entity, _: string) => {
    const action = state.actions.cancelOneForEntity(selected.id);
    if (action) {
        print(`Entity [${selected.id}] request to cancel ${action.type}`);
    }
};

export const command_Halt = (selected: Entity, _: string) => {
    state.actions.cancelAllForEntity(selected.id);
    print(`Entity [${selected.id}] cancel all queued actions`);
};

export const command_Install = (selected: Entity, mod: string) => {
    const tileCoord = coordToTile(selected.coords);
    const tile = getTileAt(tileCoord);
    if (tile.type !== TILE_TYPE.HOME) {
        printError(`Unable to install modules here`);
        return true;
    }
    if (!Items[mod as Item_Module]) {
        printError(`Unknown or missing module - "${mod}"`);
    }
    if (!state.inventory.remove(mod as Item, 1)) {
        printError(`Unknown or missing module - "${mod}"`);
    }
    if (!selected.installModule(mod as Item_Module)) {
        printError(`Unable to install ${mod}, slot already used or incompatible`);
        state.inventory.add(mod as Item, 1);
    }
    return true;
};

export const command_Uninstall = (selected: Entity, mod: string) => {
    const tileCoord = coordToTile(selected.coords);
    const tile = getTileAt(tileCoord);
    if (tile.type !== TILE_TYPE.HOME) {
        printError(`Unable to uninstall modules here`);
        return true;
    }
    if (!selected.uninstallModule(mod as Item_Module)) {
        printError(`No module called "${mod}" is installed on this automation`);
        return true;
    }
    state.inventory.add(mod as Item, 1);
    return true;
};

export const command_DEV_SPAWN = (): boolean | undefined => {
    if (!state.gl || !state.entityGfx) {
        return;
    }
    if (!IS_DEV) {
        return;
    }
    const e =  new Entity(
        state.entityGfx,
        state.entities.length, "DEVBOT",
        ["ROTATE", "MOVE", "MINE", "UNLOAD", "RECHARGE"],
        ["module_dev"]
    );
    e.init();
    state.entities.push(e);
    state.updateLights();
    selectEntity(e.id);
    return true;
};

export const command_Crafting = (recipe?: string) => {
    if (!state.story.STORAGE_FIRST) {
        return undefined;
    }
    if (recipe?.trim()) {
        if (!(Items[recipe as Item] as ItemInfoCraftable).ingredients) {
            printError(`Unknown recipe: ${recipe}`);
            return true;
        }
        return onCraft(recipe as Item);
    }
    const recipes = Object.entries(Items)
    .filter(
        ([, v]) => (v as ItemInfoCraftable).ingredients?.length
    ).filter(
        ([, v]) => (v.story ?? []).every((s) => state.story[s])
    ).filter(
        ([, v]) => !(v as ItemInfoInterface).waypoint || !state.story[(v as ItemInfoInterface).waypoint]
    ).map(
        ([k]) => {
            const item = Items[k as Item] as ItemInfoCraftable & ItemInfoBase;
            return [k, item.description, item.ingredients.map((r) => `${r.item}[${r.count}]`).join(",")];
        }
    );
    printHeader("Crafting");
    print(`Usage: "crafting <recipe>"`);
    printTable(recipes, ["Name", "Description", "Recipe"], " | ");
    return true;
};

export const command_Exec = (_: Entity, name: string) => {
    if (!state.scripts[name]) {
        printError(`Unknown script ${name}`);
        return true;
    }
    return true;
}

export const command_Clear = () => {
    if (output) {
        output.innerHTML = "";
    }
}

export const command_Save = () => {
    window.localStorage.setItem("save", btoa(JSON.stringify(state.getSave())));
    printWarning("Game saved.");
};

export const command_Reset = async () => {
    printWarning("RESETTING GAME");
    window.localStorage.setItem("save", "");
    clearTexMap();
    state.reset();
    await end();
    command_Clear();
    start();
};

export const command_Load = () => {
    const save = window.localStorage.getItem("save");
    if (save?.length) {
        const raw = JSON.parse(atob(save));
        if (Object.keys(raw.story ?? {}).length) {
            command_Clear();
            state.onLoad(raw);
            printWarning("Game loaded.");
        }
    }
};

export const command_Actions = (selected: Entity) => {
    const actions = state.actions.getActions().filter((a) => a.entityId === selected.id).filter((a) => !a.isSilent);
    printHeader("Actions");
    actions.forEach((a) => {
        print(` - ${a.type} [${a.value}]`);
    });
};
