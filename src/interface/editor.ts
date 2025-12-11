import Alpine from "alpinejs";
import { Script } from "../script";
import "./editor.style.css";

const tpl = `
  <div class="editor-parent" x-data="validation">
    <div class="editor-name">
      <input type="text" placeholder="Script name..." />
      <button>Save</button>
      <button class="danger">Cancel</button>
    </div>
    <div id="editor-container">
      <textarea @keyup.space="validate" @keyup.enter="validate" @keyup.backspace="validate" x-ref="input" spellcheck="false" @scroll="onScroll"></textarea>
      <div id="editor" x-html="styled" @click="focus" x-ref="errors"></div>
    </div>
  </div> 
`;

export const display_Editor = (modal: HTMLDivElement) => {
    modal.classList.remove("hidden");
    modal.innerHTML = tpl;
    Alpine.data("validation", () => ({
        script: new Script("test", ""),
        get styled() {
            return this.script.content.split("\n")
                .map((_, idx) => {
                    const error = this.script.errors.find((e) => e.lineIdx === idx);
                    if (error) {
                        return `<div class="err-container"><div class="err-line"></div><span class="err">!</span>${error.description}</div>`;
                    }
                    return `<div>&nbsp;</div>`;
                }).join("");

        },
        validate: function(e: KeyboardEvent) {
            const s = new Script("test", (e.target as HTMLTextAreaElement).value);
            this.script = s;
        },
        focus: function () {
            this.$refs.input.focus();
        },
        onScroll: function(e: MouseEvent) {
            this.$refs.errors.scrollTop = (e.target as HTMLTextAreaElement).scrollTop;
        }
    }));
    Alpine.initTree(modal);
};
