/* typehints:start */
import { GameRoot } from "./root";
/* typehints:end */

import { Vector } from "../core/vector";
import { SOUNDS } from "../platform/sound";

const avgSoundDurationSeconds = 0.25;
const maxOngoingSounds = 10;

// Proxy to the application sound instance
export class SoundProxy {
    /**
     * @param {GameRoot} root
     */
    constructor(root) {
        this.root = root;

        // Store a list of sounds and when we started them
        this.playingSounds = [];
    }

    /**
     * Plays a new ui sound
     * @param {string} id Sound ID
     */
    playUi(id) {
        assert(typeof id === "string", "Not a valid sound id: " + id);
        this.root.app.sound.playUiSound(id);
    }

    /**
     * Plays the ui click sound
     */
    playUiClick() {
        this.playUi(SOUNDS.uiClick);
    }

    /**
     * Plays the ui error sound
     */
    playUiError() {
        this.playUi(SOUNDS.uiError);
    }

    /**
     * Plays a 3D sound whose volume is scaled based on where it was emitted
     * @param {string} id Sound ID
     * @param {Vector} pos World space position
     */
    play3D(id, pos) {
        assert(typeof id === "string", "Not a valid sound id: " + id);
        assert(pos instanceof Vector, "Invalid sound position");
        this.internalUpdateOngoingSounds();

        if (this.playingSounds.length > maxOngoingSounds) {
            // Too many ongoing sounds
            // console.warn(
            //   "Not playing",
            //   id,
            //   "because there are too many sounds playing"
            // );
            return false;
        }

        this.root.app.sound.play3DSound(id, pos, this.root);
        this.playingSounds.push(this.root.time.realtimeNow());
        return true;
    }

    /**
     * Updates the list of ongoing sounds
     */
    internalUpdateOngoingSounds() {
        const now = this.root.time.realtimeNow();
        for (let i = 0; i < this.playingSounds.length; ++i) {
            if (now - this.playingSounds[i] > avgSoundDurationSeconds) {
                this.playingSounds.splice(i, 1);
                i -= 1;
            }
        }
    }
}
