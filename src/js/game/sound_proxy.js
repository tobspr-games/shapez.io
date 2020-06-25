/* typehints:start */
import { GameRoot } from "./root";
/* typehints:end */

import { Vector } from "../core/vector";
import { SOUNDS } from "../platform/sound";

const avgSoundDurationSeconds = 0.1;
const maxOngoingSounds = 2;
const maxOngoingUiSounds = 5;

// Proxy to the application sound instance
export class SoundProxy {
    /**
     * @param {GameRoot} root
     */
    constructor(root) {
        this.root = root;

        // Store a list of sounds and when we started them
        this.playing3DSounds = [];
        this.playingUiSounds = [];
    }

    /**
     * Plays a new ui sound
     * @param {string} id Sound ID
     */
    playUi(id) {
        assert(typeof id === "string", "Not a valid sound id: " + id);
        this.internalUpdateOngoingSounds();
        if (this.playingUiSounds.length > maxOngoingUiSounds) {
            // Too many ongoing sounds
            return false;
        }

        this.root.app.sound.playUiSound(id);
        this.playingUiSounds.push(this.root.time.realtimeNow());
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

        if (this.playing3DSounds.length > maxOngoingSounds) {
            // Too many ongoing sounds
            return false;
        }

        this.root.app.sound.play3DSound(id, pos, this.root);
        this.playing3DSounds.push(this.root.time.realtimeNow());
        return true;
    }

    /**
     * Updates the list of ongoing sounds
     */
    internalUpdateOngoingSounds() {
        const now = this.root.time.realtimeNow();
        for (let i = 0; i < this.playing3DSounds.length; ++i) {
            if (now - this.playing3DSounds[i] > avgSoundDurationSeconds) {
                this.playing3DSounds.splice(i, 1);
                i -= 1;
            }
        }

        for (let i = 0; i < this.playingUiSounds.length; ++i) {
            if (now - this.playingUiSounds[i] > avgSoundDurationSeconds) {
                this.playingUiSounds.splice(i, 1);
                i -= 1;
            }
        }
    }
}
