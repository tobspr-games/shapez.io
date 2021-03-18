/* typehints:start */
import { GameRoot } from "../root";
/* typehints:end */

import { PuzzleGameMode } from "./puzzle";
import { enumGameModeIds } from "../game_mode";

export class PuzzleEditGameMode extends PuzzleGameMode {
    static getId() {
        return enumGameModeIds.puzzleEdit;
    }

    /** @param {GameRoot} root */
    constructor(root) {
        super(root);
    }
}
