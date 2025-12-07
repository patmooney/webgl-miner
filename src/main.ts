import './style.css'

import { init as initInput } from './input';
import * as story from './story';
import * as csl from "./console";
import { state } from './state';
import { Entity } from './entity';

const run = async () => {
    initInput();
    await story.start();
    csl.command_Load();
   
    for (let i = 0; i < 4; i++) {
        const e = new Entity(state.entityGfx!, i, `m${i}`, [], ["module_basic_drill", "module_basic_motor", "module_basic_store", "module_basic_battery"]);
        e.battery = 100;
        e.init();
        state.entities.push(e);
    }
    setInterval(() => {
        csl.command_Save();
    }, 60_000);
};

run();
