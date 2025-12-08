export type Logic = 
    "JMP" | // goto label
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

export type Special = "RUN"; // execute entity command with args

export type Syntax = Logic | Special;

export type Label = `${string}:`;
export type Memory = `M_${number}`;
export type LineType = [Syntax | Label, string[]];

export type ValidationType = "number_memory" | "label" | "memory" | "number" | "any" | "memory_or_null";
export const validation: Record<Syntax, ValidationType[] | undefined> = {
    "RUN": ["any", "any", "memory_or_null"],
    "JMP": ["label"],
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

export const labelRe = /^[A-Za-z][A-Za-z_0-9]*\:/;
export const memoryRe = /^M_\d+/;

export type ValidationContext = {
    labels?: string[];
}
export const validationFn: Record<ValidationType, (ctx: ValidationContext, arg: string) => boolean> = {
    "label": (ctx: ValidationContext, arg: string) => !!ctx.labels?.includes(arg),
    "memory": (_: ValidationContext, arg: string) => memoryRe.test(arg),
    "number_memory": (_: ValidationContext, arg: string) => memoryRe.test(arg) || /^\d+/.test(arg),
    "number": (_: ValidationContext, arg: string) => /^\d+/.test(arg),
    "any": () => true,
    "memory_or_null": (_: ValidationContext, arg: string) => memoryRe.test(arg) || arg === undefined || arg === ""
}

export const isLabel = (l: Label | Syntax): l is Label => labelRe.test(l);

export type ErrorType = "UNKNOWN" | "INVALID" | "DUPLICATE_LABEL";
export const Errors: Record<ErrorType, string> = {
    "UNKNOWN": "Unknown command or label",
    "INVALID": "Command is invalid",
    "DUPLICATE_LABEL": "Label is used more than once"
};

export const parse = (script: string): [LineType[], [number,ErrorType,[number, ValidationType]?][], Record<string, number>] => {
    const lines = script.split("\n");

    const labelsMap: Record<string, number> = {};
    const unknownErrs = lines.reduce<[number, ErrorType][]>(
        (acc, line, idx) => {
            line = line.replace(/#.+/g,"").trim();
            if (!line) {
                return acc;
            }
            const [cmd] = line.split(" ");
            if (!validation[cmd as Syntax] && !labelRe.test(cmd)) {
                acc.push([idx, "UNKNOWN"]);
                return acc;
            }
            if (labelRe.test(cmd)) {
                const labelCmd = cmd.replace(/:$/, "");
                if (labelsMap[labelCmd]) {
                    acc.push([idx, "DUPLICATE_LABEL"]);
                    return acc;
                } else {
                    labelsMap[labelCmd] = idx;
                }
            }
            return acc;
        }, []
    );

    const errors = lines.reduce<[number, ErrorType, [number, ValidationType]?][]>(
        (acc, line, idx) => {
            line = line.replace(/#.+/g,"").trim();
            if (!line) {
                return acc;
            }
            const [cmd, ...args] = line.split(" ");

            if (labelRe.test(cmd)) {
                return acc;
            }
            if (validation[cmd as Syntax]) {
                const v = validation[cmd as Syntax];
                if (!v) {
                    // No validation then no problem
                    return acc;
                }
                if (args.length !== v.length) {
                    acc.push([idx, "INVALID"]);
                    return acc;
                }
                for (let argIdx = 0; argIdx < args.length; argIdx++) {
                    if (!validationFn[v[argIdx]]({ labels: Object.keys(labelsMap) }, args[argIdx])) {
                        acc.push([idx, "INVALID",[argIdx, v[argIdx]]]);
                    }
                }
            }
            return acc;
        }, unknownErrs
    );

    const filtered = lines.map(line => line.replace(/#.+/g,"").trim())
        .filter(Boolean)
        .map<LineType>(
            (line) => {
                const [cmd, ...args] = line.split(" ");
                return [cmd as Syntax | Label, args];
            }
        );

    return [errors.length ? [] : filtered as LineType[], errors, labelsMap];
};
