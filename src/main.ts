import './style.css'

import { init as initInput } from './input';
import * as story from './story';
import * as csl from "./console";

const run = async () => {
    initInput();
    await story.start();
    csl.command_Load();
    setInterval(() => {
        csl.command_Save();
    }, 60_000);
};

run();
