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

    static getSchema() {
        return {};
    }

    /** @param {GameRoot} root */
    constructor(root) {
        super(root);

        this.playtest = false;

        this.setBuildings({
            [MetaConstantProducerBuilding.name]: true,
            [MetaGoalAcceptorBuilding.name]: true,
        });
    }

    isZoneRestricted() {
        return !this.playtest;
    }

    isBoundaryRestricted() {
        return this.playtest;
    }

    expandZone(w = 0, h = 0) {
        if (this.zoneWidth + w > 0) {
            this.zoneWidth += w;
        }

        if (this.zoneHeight + h > 0) {
            this.zoneHeight += h;
        }

        this.zone = this.createCenteredRectangle(this.zoneWidth, this.zoneHeight);
    }
}
