/* typehints:start */
import { GameRoot } from "../root";
/* typehints:end */

import { enumGameModeIds } from "../game_mode";
import { PuzzleGameMode } from "./puzzle";
import { MetaStorageBuilding } from "../buildings/storage";
import { MetaReaderBuilding } from "../buildings/reader";
import { MetaFilterBuilding } from "../buildings/filter";
import { MetaDisplayBuilding } from "../buildings/display";
import { MetaLeverBuilding } from "../buildings/lever";
import { MetaItemProducerBuilding } from "../buildings/item_producer";
import { MetaMinerBuilding } from "../buildings/miner";
import { MetaWireBuilding } from "../buildings/wire";
import { MetaWireTunnelBuilding } from "../buildings/wire_tunnel";
import { MetaConstantSignalBuilding } from "../buildings/constant_signal";
import { MetaLogicGateBuilding } from "../buildings/logic_gate";
import { MetaVirtualProcessorBuilding } from "../buildings/virtual_processor";
import { MetaAnalyzerBuilding } from "../buildings/analyzer";
import { MetaComparatorBuilding } from "../buildings/comparator";
import { MetaTransistorBuilding } from "../buildings/transistor";

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

        this.hiddenBuildings = [
            MetaStorageBuilding,
            MetaReaderBuilding,
            MetaFilterBuilding,
            MetaDisplayBuilding,
            MetaLeverBuilding,
            MetaItemProducerBuilding,
            MetaMinerBuilding,

            MetaWireBuilding,
            MetaWireTunnelBuilding,
            MetaConstantSignalBuilding,
            MetaLogicGateBuilding,
            MetaVirtualProcessorBuilding,
            MetaAnalyzerBuilding,
            MetaComparatorBuilding,
            MetaTransistorBuilding,
        ];
    }

    adjustZone(w = 0, h = 0) {
        // @todo notify user when zone cannot be shrunk
        if (this.zoneWidth + w <= 0) {
            return;
        }

        if (this.zoneHeight + h <= 0) {
            return;
        }

        const newZone = this.createCenteredRectangle(this.zoneWidth + w, this.zoneHeight + h);
        const entities = this.root.entityMgr.entities;

        // @fixme find a better way to check this
        for (const entity of entities) {
            const staticComp = entity.components.StaticMapEntity;
            const union = newZone.getUnion(staticComp.getTileSpaceBounds());
            if (!union.equalsEpsilon(newZone)) {
                return;
            }
        }

        this.zoneWidth = newZone.w;
        this.zoneHeight = newZone.h;
    }

    getIsEditor() {
        return true;
    }
}
