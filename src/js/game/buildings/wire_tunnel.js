import { Vector } from "../../core/vector";
import { Entity } from "../entity";
import { MetaBuilding, defaultBuildingVariant } from "../meta_building";
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

    /**
     *
     * @param {number} rotation
     * @param {number} rotationVariant
     * @param {string} variant
     * @param {Entity} entity
     */
    getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant, entity) {
        return wireTunnelOverlayMatrices[variant][rotation];
    }

    getIsRotateable(variant) {
        return variant !== defaultBuildingVariant;
    }

    getDimensions() {
        return new Vector(1, 1);
    }

    getAvailableVariants() {
        return [defaultBuildingVariant, enumWireTunnelVariants.coating];
    }

    /** @returns {"wires"} **/
    getLayer() {
        return "wires";
    }

    getRotateAutomaticallyWhilePlacing() {
        return true;
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

    /**
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        entity.components.WireTunnel.multipleDirections = variant === defaultBuildingVariant;
    }
}
