/* typehints:start */
import type { GameRoot } from "./root";
/* typehints:end */
import { Vector } from "../core/vector";
import { SOUNDS } from "../platform/sound";
const avgSoundDurationSeconds: any = 0.1;
const maxOngoingSounds: any = 2;
const maxOngoingUiSounds: any = 5;
// Proxy to the application sound instance
export class SoundProxy {
    public root = root;
    public playing3DSounds = [];
    public playingUiSounds = [];

        constructor(root) {
    }
    /**
     * Plays a new ui sound
     */
    playUi(id: string): any {
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
    playUiClick(): any {
        this.playUi(SOUNDS.uiClick);
    }
    /**
     * Plays the ui error sound
     */
    playUiError(): any {
        this.playUi(SOUNDS.uiError);
    }
    /**
     * Plays a 3D sound whose volume is scaled based on where it was emitted
     */
    play3D(id: string, pos: Vector): any {
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
    internalUpdateOngoingSounds(): any {
        const now: any = this.root.time.realtimeNow();
        for (let i: any = 0; i < this.playing3DSounds.length; ++i) {
            if (now - this.playing3DSounds[i] > avgSoundDurationSeconds) {
                this.playing3DSounds.splice(i, 1);
                i -= 1;
            }
        }
        for (let i: any = 0; i < this.playingUiSounds.length; ++i) {
            if (now - this.playingUiSounds[i] > avgSoundDurationSeconds) {
                this.playingUiSounds.splice(i, 1);
                i -= 1;
            }
        }
    }
}
