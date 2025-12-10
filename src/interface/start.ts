import Alpine from "alpinejs";
import { start } from "../main";

const tpl = `<button x-bind="start">Click to start</button>`;

export const interface_Start = () => {
    const modal = document.getElementById("welcome-modal");
    if (!modal) {
        return;
    }
    modal.innerHTML = tpl;
    Alpine.bind("start",  () => ({
        type: "button",
        '@click'() {
            start();
        }
    }));
    Alpine.initTree(modal);
}
