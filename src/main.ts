import './style.css'

import Alpine from "alpinejs";

import { init as initInput } from './input';
import * as story from './story';
import * as csl from "./console";
import { IS_DEV } from './constants';
import { sound } from './sound';
import { interface_Start } from './interface/start';
import { state } from './state';
import { INVENTORY_EVENT } from './invent';

const welcome = document.getElementById("welcome-modal");

export const start = async () => {
    welcome?.classList.add("hidden");
    if (!IS_DEV) {
        document.addEventListener("contextmenu", (e) => e.preventDefault());
    }
    sound.music();
    initInput();
    await story.start();

    if (!IS_DEV){
        csl.command_Load();
    }

    story.onStory("STORAGE_FIRST");

    Alpine.store("inventory", {
        items: state.inventory.inventory,
        craftable: {}
    });

    state.inventory.hook.addEventListener(INVENTORY_EVENT, () => {
        const craftable = Object.values(story.Items)
            .filter((i) => (i as story.ItemInfoCraftable).ingredients?.length)
            .reduce<{ [key in story.Item]?: boolean }>(
                (acc, i) => {
                    acc[i.name] = (i as story.ItemInfoCraftable).ingredients.every(
                        (ing) => (state.inventory.inventory[ing.item] ?? 0) >= ing.count
                    );
                    return acc;
                }, {}
            );
 
        Alpine.store("inventory", {
            items: state.inventory.inventory,
            craftable
        });
    });

    setInterval(() => {
        csl.command_Save();
    }, 60_000);
};

declare global {
    interface Window { Alpine: typeof Alpine }
}

if (typeof window.Alpine === "undefined") {
    window.Alpine = Alpine;
    Alpine.start();
}

if (import.meta.hot) {
    // Ensure hot-reload works after alpine fuckery
    import.meta.hot.accept(() => {
        import.meta.hot?.invalidate();
    })
}

interface_Start();
