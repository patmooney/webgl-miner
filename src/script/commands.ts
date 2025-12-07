import type { ScriptExecutor } from "../script";
import { validationFn, type Memory } from "./validation";

const script_JMP = (exec: ScriptExecutor, [name]: string[]) => {
    const label = exec.script.labels[name];
    return label ?? false;
}

const script_PUT = (exec: ScriptExecutor, args: string[]) => {
    let [pFrom, pTo] = args;
    let val: number | undefined;
    if (validationFn["number"]({}, pFrom)) {
        val = parseInt(pFrom);
    } else {
        val = exec.getMemory(pFrom as Memory);
    }
    if (val) {
        exec.putMemory(pTo as Memory, val);
    }
};
