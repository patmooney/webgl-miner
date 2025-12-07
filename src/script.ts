import type { Entity } from "./entity";
import { isLabel, parse, type LineType, type Memory, type ValidationType } from "./script/validation";

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

export class ScriptExecutor {
    script: Script;
    entity: Entity;
    lineIdx: number | undefined;

    memory: number[];

    constructor(e: Entity, s: Script) {
        this.entity = e;
        this.script = s;
        this.memory = [];
    }
    run(lineN = 0): void {
        if (lineN >= this.script.lines.length) {
            return;
        }
        const [cmd] = this.script.lines[lineN];
        if (isLabel(cmd)) {
            return this.run(lineN + 1);
        }
        this.lineIdx = lineN;
        return;
    }
    getMemory(mem: Memory) {
        const add = parseInt(mem.replace(/[^\d]+/, ""));
        if (add) {
            return this.memory[add];
        }
        return undefined;
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
