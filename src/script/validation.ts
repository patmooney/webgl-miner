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
export type LineType = [Logic | Label, string[]];

export type ValidationType = "number_memory" | "label" | "memory" | "number";
export const validation: Record<Syntax, ValidationType[] | undefined> = {
    "RUN": undefined,
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
    "number": (_: ValidationContext, arg: string) => /^\d+/.test(arg)
}

export const isLabel = (l: Label | Logic): l is Label => labelRe.test(l);

export type ErrorType = "UNKNOWN" | "INVALID" | "DUPLICATE_LABEL";
export const Errors: Record<ErrorType, string> = {
    "UNKNOWN": "Unknown command or label",
    "INVALID": "Command is invalid",
    "DUPLICATE_LABEL": "Label is used more than once"
};

export const parse = (script: string): [LineType[], [number,ErrorType,[string, ValidationType]?][], Record<string, number>] => {
    const lines = script.split("\n")
        .map(line => line.replace(/#.+/g,"").trim())
        .filter(Boolean)
        .map<[string, string[]]>(
            line => {
                const [cmd, ...args] = line.split(" ");
                return [cmd, args];
            }
        );

    const labelsMap: Record<string, number> = {};
    const unknownErrs = lines.reduce<[number, ErrorType][]>(
        (acc, [cmd], idx) => {
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

    const errors = lines.reduce<[number, ErrorType, [string, ValidationType]?][]>(
        (acc, [cmd, args], idx) => {
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
                for (let argIdx in args) {
                    if (!validationFn[v[argIdx]]({ labels: Object.keys(labelsMap) }, args[argIdx])) {
                        acc.push([idx, "INVALID",[args[argIdx], v[argIdx]]]);
                    }
                }
            }
            return acc;
        }, unknownErrs
    );

    return [errors.length ? [] : lines as LineType[], errors, labelsMap];
};
