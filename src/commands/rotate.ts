import type { Action } from "../actions";
import { ANGLE_TO_RAD, FULL_ROTATION, type Angle } from "../constants";
import type { Entity } from "../entity";

export const command_Rotate = function (this: Entity, action: Action) {
    let t: number | undefined = this.targetR;
    if (!action.isStarted) {
        t = this.angle + action.value!;
        if (t < 0) {
            t = 4 + t;
        }
        if (t > 3) {
            t = t - 4;
        }
        action.start();
    }

    if (t === undefined) {
        action.complete();
        return;
    }
    this.targetR = t as Angle;
    const targetRad = ANGLE_TO_RAD[this.targetR];

    let rDelta = 0;
    if (action.value! < 0) {
        let rad = (this.rad < targetRad) ? this.rad + FULL_ROTATION: this.rad;
        rDelta = -0.05;
        if ((rad + rDelta) <= targetRad) {
            action.complete();
        }
    } else {
        let rad = (this.rad > targetRad) ? this.rad - FULL_ROTATION : this.rad;
        rDelta = 0.05;
        if ((rad + rDelta) >= targetRad) {
            action.complete();
        }
    }
    if (action.isComplete) {
        this.rad = ANGLE_TO_RAD[this.targetR];
        this.angle = this.targetR;
        this.targetR = undefined;
    } else {
        this.rad += rDelta;
    }

    this.rotation[0] = Math.sin(this.rad);
    this.rotation[1] = Math.cos(this.rad);
}
