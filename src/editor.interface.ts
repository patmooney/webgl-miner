import { Script } from "./script";
import { state } from "./state";

const container = document.getElementById("editor-container") as HTMLDivElement;
const editor = document.getElementById("editor") as HTMLTextAreaElement;
const editorName = document.getElementById("editor-name") as HTMLDivElement;
const save = document.getElementById("editor-save") as HTMLButtonElement;
const cancel = document.getElementById("editor-cancel") as HTMLButtonElement;
const errors = document.getElementById("editor-errors") as HTMLDivElement;

export const onEdit = (name: string) => {
    const existing = state.scripts[name] ?? new Script(name, "");
    editScript(existing);
}

const editScript = (script: Script) => {
    editor.classList.remove("hidden");
    errors.classList.add("hidden");
    editor.value = script.content;
    editorName.textContent = script.name;
    errors.innerHTML = "";
    container.classList.remove("hidden");
    save.textContent = "Save";
    save.addEventListener("click", onSave, { once: true });
}

const onSave = () => {
    const value = editor.value;
    const name = editorName.textContent ?? "UNKNOWN";
    const script = new Script(name, value);
    if (script.errors.length) {
        errors.innerHTML = "";
        script.content.split("\n").forEach(
            (line, idx) => {
                const err = script.errors.find((e) => e[0] === idx);
                const p = document.createElement("p");
                if (err) {
                    const [_1, _2, argErr] = err;
                    const [spaces] = line.match(/^\s+/) ?? [];
                    const [cmd, ...args] = line.trim().split(" ");
                    p.append(
                        document.createTextNode(spaces ?? ""),
                        ...[cmd].filter(Boolean).map(
                            (el) => {
                                const s = document.createElement("span");
                                s.classList.add("mr");
                                s.textContent = el!;
                                return s;
                            }
                        ),
                        ...args.filter(Boolean).map(
                            (el, idx) => {
                                const s = document.createElement("span");
                                if (argErr?.[0] === idx) {
                                    s.classList.add("err-arg");
                                    s.title = argErr?.[1] ?? "";
                                }
                                s.classList.add("mr");
                                s.textContent = el!;
                                return s;
                            }
                        ),
                    );
                    p.classList.add("is-error");
                    p.title = err[1];
                } else {
                    p.textContent = line;
                }
                errors.appendChild(p);
            }
        );
        save.textContent = "Edit";
        save.addEventListener("click", () => editScript(script), { once: true });
        errors.classList.remove("hidden");
        editor.classList.add("hidden");
        return;
    }
    state.saveScript(script);
    onCancel();
};

const onCancel = () => {
   container.classList.add("hidden");
};

cancel.addEventListener("click", onCancel);
