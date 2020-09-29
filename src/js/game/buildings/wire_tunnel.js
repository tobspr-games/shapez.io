import { generateMatrixRotations } from "../../core/utils";
import { Vector } from "../../core/vector";
import { WireTunnelComponent } from "../components/wire_tunnel";
import { Entity } from "../entity";
import { MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";

const wireTunnelOverlayMatrix = generateMatrixRotations([0, 1, 0, 1, 1, 1, 0, 1, 0]);

export class MetaWireTunnelBuilding extends MetaBuilding {
    constructor() {
        super("wire_tunnel");
    }

    getSilhouetteColor() {
        return "#777a86";
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_wires_painter_and_levers);
    }

    /**
     *
     * @param {number} rotation
     * @param {number} rotationVariant
     * @param {string} variant
     * @param {Entity} entity
     */
    getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant, entity) {
        return wireTunnelOverlayMatrix[rotation];
    }

    getIsRotateable() {
        return false;
    }

    getDimensions() {
        return new Vector(1, 1);
    }

    /** @returns {"wires"} **/
    getLayer() {
        return "wires";
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(new WireTunnelComponent());
    }
}
