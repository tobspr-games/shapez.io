/* typehints:start */
import { GameRoot } from "../root";
/* typehints:end */

import { MetaConstantProducerBuilding } from "../buildings/constant_producer";
import { enumGameModeIds } from "../game_mode";
import { PuzzleGameMode } from "./puzzle";

export class PuzzleEditGameMode extends PuzzleGameMode {
    static getId() {
        return enumGameModeIds.puzzleEdit;
    }

    /** @param {GameRoot} root */
    constructor(root) {
        super(root);

        this.setBuildings({
            [MetaConstantProducerBuilding.name]: true,
        });
    }
}
