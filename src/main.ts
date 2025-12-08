import './style.css'

import { init as initInput } from './input';
import * as story from './story';
import * as csl from "./console";
import { IS_DEV } from './constants';

const run = async () => {
    initInput();
    await story.start();

    if (!IS_DEV){
        csl.command_Load();
    }

    setInterval(() => {
        csl.command_Save();
    }, 60_000);
};

run();
