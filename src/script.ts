import { Action, ACTION_COMPLETE_EVENT } from "./actions";
import type { Entity } from "./entity";
import { ScriptCommands } from "./script/commands";
import { isLabel, parse, type LineType, type Memory, type ValidationType } from "./script/validation";
import { state } from "./state";

// comments start with #

// memmory is upgradable and is marked as "M_<n>"... start with 3?
// M_R stores the result of any maths
// M_I stores value given from interrupt

export class Script {
    lines: LineType[];
    errors: [number, string, [string, ValidationType]?][];
    labels: Record<string, number>;
    constructor(script: string) {
        const [lines, errors, labels] = parse(script);
        this.labels = labels;
        this.lines = lines;
        this.errors = errors;
    }
}

const EXEC_TIME = 500;

export class ScriptExecutor {
    script: Script;
    entity: Entity;
    lineIdx: number = 0;
    actions: string[];
    memory: number[];
    execTime: number | undefined;
    isComplete: boolean = false;

    constructor(e: Entity, s: Script) {
        this.entity = e;
        this.script = s;
        this.memory = [];
        this.actions = [];
        state.actions.hook.addEventListener(ACTION_COMPLETE_EVENT, (e: Event) => {
            const action: Action = (e as CustomEvent).detail;
            this.actions = this.actions.filter((a) => a !== action.id);
        });
    }
    run(): void {
        if (this.lineIdx >= this.script.lines.length) {
            this.isComplete = true;
            // End of script
            return;
        }
        if (this.execTime && Date.now() < this.execTime) {
            // Not ready to run yet
            return;
        }

        this.execTime = Date.now() + EXEC_TIME;
        if (this.actions.length) {
            // Awaiting actions
            return;
        }

        const [cmd, args] = this.script.lines[this.lineIdx];
        if (isLabel(cmd)) {
            // Ignore label lines
            this.lineIdx++;
            return this.run();
        }
        ScriptCommands[cmd](this, args);

        this.lineIdx++;
    }
    navigateTo(lineNumber: number) {
        this.lineIdx = lineNumber;
    }
    awaitActions(actions: string[]) {
        this.actions.push(...actions);
    }
    getMemory(mem: Memory) {
        const add = parseInt(mem.replace(/[^\d]+/, ""));
        if (add) {
            return this.memory[add];
        }
        return 0;
    }
    putMemory(mem: Memory, val: number) {
        if (!isNaN(val)) {
            return;
        }
        const add = parseInt(mem.replace(/[^\d]+/, ""));
        if (add) {
            this.memory[add] = val;
        }
    }
}
