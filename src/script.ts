type Logic = 
    "PUT" | // into memory
    "JEQ" | // jump if equal
    "JGT" | // jump if greater than
    "JLT" | // jump if lower than
    "JZE" | // jump if zero
    "SUB" | // subtract A from B
    "MUL" | // multiply A with B
    "ADD" | // add A to B
    "DIV" | // divide A by B
    "MOD"; // A % B

type ValidationType = "number_memory" | "label" | "memory";
const validation: Record<Logic, ValidationType[]> = {
    "PUT": ["number_memory", "memory"],
    "JEQ": ["number_memory", "number_memory", "label"],
    "JGT": ["number_memory", "number_memory", "label"],
    "JLT": ["number_memory", "number_memory", "label"],
    "JZE": ["number_memory", "label"],
    "SUB": ["number_memory", "number_memory", "memory"],
    "MUL": ["number_memory", "number_memory", "memory"],
    "ADD": ["number_memory", "number_memory", "memory"],
    "DIV": ["number_memory", "number_memory", "memory"],
    "MOD": ["number_memory", "number_memory", "memory"]
};

const labelRe = /^[A-Za-z][A-Za-z_0-9]*\:/;
const memoryRe = /^M_\d+/;

type ValidationContext = {
    labels: string[];
}
const validationFn: Record<ValidationType, (ctx: ValidationContext, arg: string) => boolean> = {
    "label": (ctx: ValidationContext, arg: string) => ctx.labels.includes(arg),
    "memory": (_: ValidationContext, arg: string) => memoryRe.test(arg),
    "number_memory": (_: ValidationContext, arg: string) => memoryRe.test(arg) || /^\d+/.test(arg)
}

// comments start with #

// memmory is upgradable and is marked as "M_<n>"... start with 3?
// M_R stores the result of any maths
// M_I stores value given from interrupt

export class Script {
    lines: string[];
    errors: [number, string, [string, ValidationType]?][];
    constructor(script: string) {
        const [lines, errors] = parse(script);
        this.lines = lines;
        this.errors = errors;
    }
}

export type ErrorType = "UNKNOWN" | "INVALID" | "DUPLICATE_LABEL";
export const Errors: Record<ErrorType, string> = {
    "UNKNOWN": "Unknown command or label",
    "INVALID": "Command is invalid",
    "DUPLICATE_LABEL": "Label is used more than once"
};

const parse = (script: string): [string[], [number,ErrorType,[string, ValidationType]?][]] => {
    const lines = script.split("\n")
        .map(line => line.replace(/#.+/g,"").trim())
        .filter(Boolean);

    const labelsMap: Record<string, boolean> = {};
    const unknownErrs = lines.reduce<[number, ErrorType][]>(
        (acc, rawLine, idx) => {
            const line = rawLine.replace(/#.+/g,"").trim();
            if ((line ?? "") === "") {
                return acc;
            }
            const [cmd] = line.split(" ");
            if (!validation[cmd as Logic] && !labelRe.test(cmd)) {
                acc.push([idx, "UNKNOWN"]);
                return acc;
            }
            if (labelRe.test(cmd)) {
                const labelCmd = cmd.replace(/:$/, "");
                if (labelsMap[labelCmd]) {
                    acc.push([idx, "DUPLICATE_LABEL"]);
                    return acc;
                } else {
                    labelsMap[labelCmd] = true;
                }
            }

            return acc;
        }, []
    );

    const errors = lines.reduce<[number, ErrorType, [string, ValidationType]?][]>(
        (acc, rawLine, idx) => {
            const line = rawLine.replace(/#.+/g,"").trim();
            if ((line ?? "") === "") {
                return acc;
            }
            const [cmd, ...args] = line.split(" ");
            if (labelRe.test(cmd)) {
                return acc;
            }
            if (validation[cmd as Logic]) {
                const v = validation[cmd as Logic];
                if (args.length !== v.length) {
                    acc.push([idx, "INVALID"]);
                    return acc;
                }
                for (let argIdx in args) {
                    if (!validationFn[v[argIdx]]({ labels: Object.keys(labelsMap) }, args[argIdx])) {
                        acc.push([idx, "INVALID",[args[argIdx], v[argIdx]]]);
                    }
                }
            }
            return acc;
        }, unknownErrs
    );

    return [lines, errors];
};
