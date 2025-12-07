import './style.css'

import { init as initInput } from './input';
import { state } from './state';
import * as csl from "./console";

import { onStorage, onStory, type WayPoint, type Item, onDeploy } from './story';
import { Inventory } from './invent';
import { init as initGfx } from './graphics/main';
import { IS_DEV } from './constants';

const run = async () => {
    initInput();
    state.inventory = new Inventory();

    csl.printImportant("Welcome...");
    await delay(500);
    csl.print("Initialising environment...");
    await delay(500);
    csl.printWarning("INIT CONNECTION...");
    await delay(100);
    csl.printWarning("INIT CAMERA...");
    await delay(500);
    initGfx();
    await delay(1500);
    csl.printWarning("INIT COMPLETE");
    await delay(1500);
    csl.command_Clear();
csl.printImportant(`Your first task will be to deploy and construct a mining automation
========
Type "help" to get started
Useful commands: storage, deploy
`);

    const initialStory: WayPoint[] = [];
    const initialStorage: [Item, number][] = [
        ["deployable_automation_hull", 1],
        ["module_basic_drill", 1],
        ["module_basic_motor", 1],
        ["module_basic_store", 1],
        ["module_basic_battery", 1],
    ];

    initialStorage.forEach(([i, c]) => state.inventory.add(i, c));
    initialStory.forEach((w) => state.addWaypoint(w));

    state.inventory.hook = onStorage;
    state.onStory = onStory;
    state.onDeploy = onDeploy;
};

const delay = (timeMs: number) => {
    if (IS_DEV) {
        return;
    }
    return new Promise((res) => setTimeout(res, timeMs));
}

run();
