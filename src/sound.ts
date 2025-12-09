import { Howl } from "howler";

import sound_Drill from "./assets/drill.mp3";
import sound_Music from "./assets/music.mp3";
import sound_VisualScan from "./assets/visual_scan.mp3";
import sound_TrackMove from "./assets/track-move.mp3";

import type { Vec2D } from "./constants";

export type SoundType = "drill" | "music" | "visual_scan" | "track_move";

class GameSound {
    sounds: Record<SoundType, Howl>;

    constructor() {
        this.sounds = {
            "drill": new Howl({
                src: [sound_Drill],
            }),
            "music": new Howl({
                src: [sound_Music],
                volume: 0.1,
                loop: true
            }),
            "visual_scan": new Howl({
                src: [sound_VisualScan],
            }),
            "track_move": new Howl({
                src: [sound_TrackMove],
                volume: 0.5,
                loop: true
            })
        };
    }

    music() {
        if (!this.sounds.music.playing()) {
            this.sounds.music.play();
        }
    }

    play(name: SoundType, pos: Vec2D): number {
        const s = this.sounds[name];
        s.pos(pos[0], pos[1], 0.5);
        return s.play();
    }

    moveSound(id: number, name: SoundType, pos: Vec2D) {
        const s = this.sounds[name];
        s.pos(pos[0], pos[1], 0.5, id);
    }

    stopSound(id: number, name: SoundType) {
        const s = this.sounds[name];
        s.stop(id);
    }
}

export const sound = new GameSound();
