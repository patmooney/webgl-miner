import { Script } from "./script";
import { state } from "./state";

const container = document.getElementById("editor-container") as HTMLDivElement;
const editor = document.getElementById("editor") as HTMLTextAreaElement;
const editorName = document.getElementById("editor-name") as HTMLDivElement;
const save = document.getElementById("editor-save") as HTMLButtonElement;
const cancel = document.getElementById("editor-cancel") as HTMLButtonElement;

export const onEdit = (name: string) => {
    const existing = state.scripts[name] ?? new Script(name, "");
    editor.value = existing.content;
    editorName.textContent = existing.name;
    container.classList.remove("hidden");
}

const onSave = () => {
    const value = editor.value;
    const name = editorName.textContent ?? "UNKNOWN";
    state.saveScript(new Script(name, value));
    onCancel();
};

const onCancel = () => {
   container.classList.add("hidden");
};

save.addEventListener("click", onSave);
cancel.addEventListener("click", onCancel);
