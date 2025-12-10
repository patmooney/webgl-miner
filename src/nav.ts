export type NavType = "terminal" | "crafting";
import { display_Crafting } from "./interface/crafting";

export type NavInfo = {
    name: NavType;
    label: string;
    display: () => void;
}

const navBar = document.getElementById("nav");
const screenModal = document.getElementById("screen-modal") as HTMLDivElement;

export const Navs: Record<NavType, NavInfo> = {
    terminal: {
        name: "terminal",
        label: "Terminal",
        display: () => screenModal?.classList.add("hidden")
    },
    crafting: {
        name: "crafting",
        label: "Crafting",
        display: () => display_Crafting(screenModal!)
    }
};

export class Nav {
    navs: NavType[];
    selected: NavType;
    constructor() {
        this.navs = [];
        this.addNav("terminal");
        this.navTo("terminal");
        this.selected = "terminal";
    }
    addNav(nav: NavType) {
        this.navs.push(nav);
        const div = document.createElement("div");
        div.dataset.nav = nav;
        div.textContent = Navs[nav].label;
        div.addEventListener("click", () => this.navTo(nav));
        navBar?.appendChild(div);
    }
    navTo(nav: NavType) {
        if (this.navs.includes(nav) && this.selected !== nav) {
            Array.from(navBar?.querySelectorAll("div") ?? []).forEach((el) => el.classList.remove("active"));
            navBar?.querySelector(`div[data-nav="${nav}"]`)?.classList.add("active");
            this.selected = nav;
            Navs[nav].display();
        }
    }
}
