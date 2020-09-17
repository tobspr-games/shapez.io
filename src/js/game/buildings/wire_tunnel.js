import { Vector } from "../../core/vector";
import { Entity } from "../entity";
import { MetaBuilding, defaultBuildingVariant, MetaBuildingVariant } from "../meta_building";
import { GameRoot } from "../root";
import { WireTunnelComponent } from "../components/wire_tunnel";
import { generateMatrixRotations } from "../../core/utils";

/** @enum {string} */
export const enumWireTunnelVariants = {
    coating: "coating",
};

const wireTunnelOverlayMatrices = {
    [defaultBuildingVariant]: generateMatrixRotations([0, 1, 0, 1, 1, 1, 0, 1, 0]),
    [enumWireTunnelVariants.coating]: generateMatrixRotations([0, 1, 0, 0, 1, 0, 0, 1, 0]),
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
        // @todo
        return true;
    }

    getAvailableVariants() {
        return [DefaultWireTunnelVariant, CoatedWireTunnelVariant];
    }

    /** @returns {"wires"} **/
    getLayer() {
        return "wires";
    }

    getStayInPlacementMode() {
        return true;
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(new WireTunnelComponent({}));
    }
}

export class DefaultWireTunnelVariant extends MetaBuildingVariant {
    /**
     * @returns {string} Variant id
     */
    static getId() {
        return defaultBuildingVariant;
    }

    /**
     *
     * @param {number} rotation
     * @param {number} rotationVariant
     * @param {Entity} entity
     */
    static getSpecialOverlayRenderMatrix(rotation, rotationVariant, entity) {
        return wireTunnelOverlayMatrices[this.getId()][rotation];
    }

    static getRotateAutomaticallyWhilePlacing() {
        return true;
    }

    /**
     * @param {Entity} entity
     */
    static updateEntityComponents(entity) {
        entity.components.WireTunnel.multipleDirections = true;
    }

    static getIsRotateable() {
        return false;
    }
}

export class CoatedWireTunnelVariant extends DefaultWireTunnelVariant {
    /**
     * @returns {string} Variant id
     */
    static getId() {
        return "coating";
    }

    /**
     * @param {Entity} entity
     */
    static updateEntityComponents(entity) {
        entity.components.WireTunnel.multipleDirections = false;
    }

    static getIsRotateable() {
        return true;
    }
}
