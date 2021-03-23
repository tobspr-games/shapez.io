/* typehints:start */
import { GameRoot } from "../root";
/* typehints:end */

// import { MetaBeltBuilding } from "../buildings/belt";
import { MetaConstantProducerBuilding } from "../buildings/constant_producer";
import { MetaGoalAcceptorBuilding } from "../buildings/goal_acceptor";
// import { MetaItemProducerBuilding } from "../buildings/item_producer";
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
            // [MetaBeltBuilding.name]: true,
            [MetaGoalAcceptorBuilding.name]: true,
            // [MetaItemProducerBuilding.name]: true,
        });
    }
}
