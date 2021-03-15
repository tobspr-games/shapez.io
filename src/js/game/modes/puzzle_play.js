import { GameMode } from "../game_mode";

export class PuzzlePlayGameMode extends GameMode {
    static getId() {
        return "PuzzlePlay";
    }

    /** param {GameRoot} root */
    constructor(root) {
        super(root);
    }
}
