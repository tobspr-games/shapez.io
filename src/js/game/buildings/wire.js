import { Vector } from "../../core/vector";
import { SOUNDS } from "../../platform/sound";
import { enumWireType, WireComponent } from "../components/wire";
import { Entity } from "../entity";
import { MetaBuilding } from "../meta_building";
import { enumLayer, GameRoot } from "../root";
import { beltOverlayMatrices } from "./belt_base";

export const arrayWireRotationVariantToType = [enumWireType.regular, enumWireType.turn, enumWireType.split];

export const wireOverlayMatrices = {
    [enumWireType.regular]: {
        0: [0, 1, 0, 0, 1, 0, 0, 1, 0],
        90: [0, 0, 0, 1, 1, 1, 0, 0, 0],
        180: [0, 1, 0, 0, 1, 0, 0, 1, 0],
        270: [0, 0, 0, 1, 1, 1, 0, 0, 0],
    },

    [enumWireType.split]: {
        0: [0, 0, 0, 1, 1, 1, 0, 1, 0],
        90: [0, 1, 0, 1, 1, 0, 0, 1, 0],
        180: [0, 1, 0, 1, 1, 1, 0, 0, 0],
        270: [0, 1, 0, 0, 1, 1, 0, 1, 0],
    },

    [enumWireType.turn]: {
        0: [0, 0, 0, 0, 1, 1, 0, 1, 0],
        90: [0, 0, 0, 1, 1, 0, 0, 1, 0],
        180: [0, 1, 0, 1, 1, 0, 0, 0, 0],
        270: [0, 1, 0, 0, 1, 1, 0, 0, 0],
    },
};

export class MetaWireBuilding extends MetaBuilding {
    constructor() {
        super("wire");
    }

    getHasDirectionLockAvailable() {
        return true;
    }

    getSilhouetteColor() {
        return "#25fff2";
    }

    getDimensions() {
        return new Vector(1, 1);
    }

    getStayInPlacementMode() {
        return true;
    }

    getPlacementSound() {
        return SOUNDS.placeBelt;
    }

    getRotateAutomaticallyWhilePlacing() {
        return true;
    }

    getLayer() {
        return enumLayer.wires;
    }

    getSprite() {
        return null;
    }

    getIsReplaceable() {
        return true;
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        // @todo
        return G_IS_DEV;
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        // @todo
        entity.addComponent(new WireComponent({}));
    }

    /**
     *
     * @param {Entity} entity
     * @param {number} rotationVariant
     */
    updateVariants(entity, rotationVariant) {
        entity.components.Wire.type = arrayWireRotationVariantToType[rotationVariant];
    }

    /**
     *
     * @param {number} rotation
     * @param {number} rotationVariant
     * @param {string} variant
     * @param {Entity} entity
     */
    getSpecialOverlayRenderMatrix(rotation, rotationVariant, variant, entity) {
        return wireOverlayMatrices[entity.components.Wire.type][rotation];
    }
}
