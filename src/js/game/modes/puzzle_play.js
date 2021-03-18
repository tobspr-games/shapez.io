/* typehints:start */
import { GameRoot } from "../root";
/* typehints:end */

import { PuzzleGameMode } from "./puzzle";
import { enumGameModeIds } from "../game_mode";

export class PuzzlePlayGameMode extends PuzzleGameMode {
    static getId() {
        return enumGameModeIds.puzzlePlay;
    }

    /** @param {GameRoot} root */
    constructor(root) {
        super(root);
        this.initialize();
    }
}
