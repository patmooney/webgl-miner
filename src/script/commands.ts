import { entityCommand } from "../console";
import type { ScriptExecutor } from "../script";
import { validationFn, type Memory, type Syntax } from "./validation";


const JMP = (exec: ScriptExecutor, [name]: string[]) => {
    const label = exec.script.labels[name];
    exec.navigateTo(label);
};

const PUT = (exec: ScriptExecutor, args: string[]) => {
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

const JEQ = (exec: ScriptExecutor, args: string[]) => {
    const [from, to, label] = args;
    let [val1, val2] = [from, to].map((arg) => numberOrMemory(exec, arg))
    if (val1 === val2) {
        return JMP(exec, [label!]);
    }
}

const JGT = (exec: ScriptExecutor, args: string[]) => {
    const [from, to, label] = args;
    let [val1, val2] = [from, to].map((arg) => numberOrMemory(exec, arg))
    if (val1 > val2) {
        return JMP(exec, [label!]);
    }
}

const JLT = (exec: ScriptExecutor, args: string[]) => {
    const [from, to, label] = args;
    let [val1, val2] = [from, to].map((arg) => numberOrMemory(exec, arg))
    if (val1 < val2) {
        return JMP(exec, [label!]);
    }
}

const JZE = (exec: ScriptExecutor, args: string[]) => {
    const [from, label] = args;
    let val1 = numberOrMemory(exec, from);
    if (val1 === 0) {
        return JMP(exec, [label!]);
    }
}

const SUB = (exec: ScriptExecutor, args: string[]) => {
    const [from, to, mem] = args;
    let [val1, val2] = [from, to].map((arg) => numberOrMemory(exec, arg));
    exec.putMemory(mem as Memory, val1 - val2);
}

const ADD = (exec: ScriptExecutor, args: string[]) => {
    const [from, to, mem] = args;
    let [val1, val2] = [from, to].map((arg) => numberOrMemory(exec, arg));
    exec.putMemory(mem as Memory, val1 + val2);
}

const MUL = (exec: ScriptExecutor, args: string[]) => {
    const [from, to, mem] = args;
    let [val1, val2] = [from, to].map((arg) => numberOrMemory(exec, arg));
    exec.putMemory(mem as Memory, val1 * val2);
}

const DIV = (exec: ScriptExecutor, args: string[]) => {
    const [from, to, mem] = args;
    let [val1, val2] = [from, to].map((arg) => numberOrMemory(exec, arg));
    exec.putMemory(mem as Memory, Math.round(val1 / val2));
}

const MOD = (exec: ScriptExecutor, args: string[]) => {
    const [from, to, mem] = args;
    let [val1, val2] = [from, to].map((arg) => numberOrMemory(exec, arg));
    exec.putMemory(mem as Memory, val1 % val2);
}

const RUN = (exec: ScriptExecutor, args: string[]) => {
    const [cmd, ...values] = args;
    const actions = entityCommand(exec.entity.id, cmd, values);
    if (actions) {
        exec.awaitActions(actions);
    }
};

export const ScriptCommands: Record<Syntax, (exec: ScriptExecutor, args: string[]) => boolean | void> = {
    JMP, PUT, JEQ, JGT, JLT, JZE, SUB, ADD, MUL, DIV, MOD, RUN
}

const numberOrMemory = (exec: ScriptExecutor, arg: string): number => {
    let val: number | undefined;
    if (validationFn["number"]({}, arg)) {
        val = parseInt(arg);
    } else {
        val = exec.getMemory(arg as Memory);
    }
    return val;
}

