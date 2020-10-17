import { generateMatrixRotations } from "../../core/utils";
import { Vector } from "../../core/vector";
import { WireTunnelComponent } from "../components/wire_tunnel";
import { Entity } from "../entity";
import { MetaBuilding, defaultBuildingVariant } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";

/** @enum {string} */
export const enumWireTunnelVariants = {
    Elbow: "elbow",
    Straight: "straight",
    DoubleElbow: "double_elbow",
};

const wireTunnelsOverlayMatrix = {
    [defaultBuildingVariant]: generateMatrixRotations([0, 1, 0, 1, 1, 1, 0, 1, 0]),
    [enumWireTunnelVariants.DoubleElbow]: generateMatrixRotations([0, 1, 0, 1, 1, 1, 0, 1, 0]),
    [enumWireTunnelVariants.Elbow]: generateMatrixRotations([0, 1, 0, 0, 1, 1, 0, 0, 0]),
    [enumWireTunnelVariants.Straight]: generateMatrixRotations([0, 1, 0, 0, 1, 0, 0, 1, 0]),
};

/**
 * @enum {Array<Array<Vector>>}
 */
export const ConnectionDirections = {
    [defaultBuildingVariant]: [[new Vector(0, 1), new Vector(0, 1)], [new Vector(1, 0), new Vector(1, 0)]],
    [enumWireTunnelVariants.DoubleElbow]: [[new Vector(0, 1), new Vector(1, 0)], [new Vector(0, -1), new Vector(-1, 0)]],
    [enumWireTunnelVariants.Elbow]: [[new Vector(0, 1), new Vector(1, 0)]],
    [enumWireTunnelVariants.Straight]: [[new Vector(0, 1), new Vector(0, 1)]],
};

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
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
		return [defaultBuildingVariant, enumWireTunnelVariants.Elbow, enumWireTunnelVariants.Straight, enumWireTunnelVariants.DoubleElbow];
        // if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_miner_chainable)) {
        //     return [enumMinerVariants.chainable];
        // }
        // return super.getAvailableVariants(root);
    }

    /**
     *
     * @param {number} rotation
     * @param {number} rotationVariant
     * @param {string} variant
     * @param {Entity} entity
     */
    getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant, entity) {
        return wireTunnelsOverlayMatrix[variant][rotation];
    }

    getIsRotateable() {
        return true;
    }

	getStayInPlacementMode() {
        return true;
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
        entity.addComponent(new WireTunnelComponent({Variant: defaultBuildingVariant, Connections: ConnectionDirections[defaultBuildingVariant]}));
	}
	
	/**
     *
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
		if(entity.components.WireTunnel){
			//a.rotateInplaceFastMultipleOf90(rotationVariant);
			entity.components.WireTunnel.UpdateConnections(variant, ConnectionDirections[variant])
		}
	}
}
