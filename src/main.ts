import './style.css'

import { init as initInput } from './input';
import * as story from './story';
import * as csl from "./console";
import { IS_DEV } from './constants';
import { sound } from './sound';

const welcome = document.getElementById("welcome-modal");

const run = async () => {
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

    setInterval(() => {
        csl.command_Save();
    }, 60_000);
};

welcome?.querySelector('button')?.addEventListener("click", () => run());
