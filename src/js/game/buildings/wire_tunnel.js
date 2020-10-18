import { generateMatrixRotations } from "../../core/utils";
import {
    arrayAllDirections,
    enumDirection,
    enumDirectionToVector,
    enumInvertedDirections,
    Vector,
} from "../../core/vector";
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
 * Enum of Objects containing the Tunnel Variant Connections
 * @enum {Object.<string, Vector>}
 */
export const ConnectionDirections = {
    [defaultBuildingVariant]: BuildConnections([
        [new Vector(0, 1), new Vector(0, 1)],
        [new Vector(1, 0), new Vector(1, 0)],
    ]),
    [enumWireTunnelVariants.DoubleElbow]: BuildConnections([
        [new Vector(0, 1), new Vector(1, 0)],
        [new Vector(0, -1), new Vector(-1, 0)],
    ]),
    [enumWireTunnelVariants.Elbow]: BuildConnections([[new Vector(0, 1), new Vector(1, 0)]]),
    [enumWireTunnelVariants.Straight]: BuildConnections([[new Vector(0, 1), new Vector(0, 1)]]),
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
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        return [
            defaultBuildingVariant,
            enumWireTunnelVariants.Elbow,
            enumWireTunnelVariants.Straight,
            enumWireTunnelVariants.DoubleElbow,
        ];
    }

    /**
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
        entity.addComponent(
            new WireTunnelComponent({
                Connections: ConnectionDirections[defaultBuildingVariant],
            })
        );
    }

    /**
     *
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        if (entity.components.WireTunnel) {
            entity.components.WireTunnel.UpdateConnections(ConnectionDirections[variant]);
        }
    }
}

/**
 * Builds the Connection Graph object from the input Array
 * @param {Array<Array<Vector>>} Connections
 * @returns {Object.<string, Vector>}
 */
function BuildConnections(Connections) {
    /**
     * @type {Object.<string, Vector>}
     */
    let res = {};
    for (let i = 0; i < Connections.length; ++i) {
        assert(Connections[i].length == 2, "Connection Wasn't Continuos");
        let [a, b] = Connections[i];

        const ahash = a.toString();
        if (!res[ahash]) {
            res[ahash] = b;
        }
        let alta = a.rotateFastMultipleOf90(180);
        let altb = b.rotateFastMultipleOf90(180);
        const bhash = altb.toString();
        if (!res[bhash]) {
            res[bhash] = alta;
        }
    }
    return res;
}
