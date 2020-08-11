import { Loader } from "../../core/loader";
import { rotateDirectionalObject } from "../../core/utils";
import { Vector } from "../../core/vector";
import { SOUNDS } from "../../platform/sound";
import { enumWireType, WireComponent } from "../components/wire";
import { Entity } from "../entity";
import { MetaBuilding } from "../meta_building";
import { enumLayer, GameRoot } from "../root";

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

    getPreviewSprite(rotationVariant) {
        switch (arrayWireRotationVariantToType[rotationVariant]) {
            case enumWireType.regular: {
                return Loader.getSprite("sprites/buildings/wire.png");
            }
            case enumWireType.turn: {
                return Loader.getSprite("sprites/buildings/wire-turn.png");
            }
            case enumWireType.split: {
                return Loader.getSprite("sprites/buildings/wire-split.png");
            }
            default: {
                assertAlways(false, "Invalid belt rotation variant");
            }
        }
    }

    getBlueprintSprite(rotationVariant) {
        switch (arrayWireRotationVariantToType[rotationVariant]) {
            case enumWireType.regular: {
                return Loader.getSprite("sprites/blueprints/wire.png");
            }
            case enumWireType.turn: {
                return Loader.getSprite("sprites/blueprints/wire-turn.png");
            }
            case enumWireType.split: {
                return Loader.getSprite("sprites/blueprints/wire-split.png");
            }
            default: {
                assertAlways(false, "Invalid belt rotation variant");
            }
        }
    }

    /**
     * Should compute the optimal rotation variant on the given tile
     * @param {object} param0
     * @param {GameRoot} param0.root
     * @param {Vector} param0.tile
     * @param {number} param0.rotation
     * @param {string} param0.variant
     * @param {string} param0.layer
     * @return {{ rotation: number, rotationVariant: number, connectedEntities?: Array<Entity> }}
     */
    computeOptimalDirectionAndRotationVariantAtTile({ root, tile, rotation, variant, layer }) {
        const connections = root.logic.getLocalWireConnectionsAtTile(tile);

        const d = rotateDirectionalObject(connections, rotation);

        // "Sticky" bottom
        connections.bottom = true;

        let flag = 0;
        flag |= d.top ? 0x1000 : 0;
        flag |= d.right ? 0x100 : 0;
        flag |= d.bottom ? 0x10 : 0;
        flag |= d.left ? 0x1 : 0;

        let targetType = enumWireType.regular;

        switch (flag) {
            case 0x0000:
                // Nothing
                break;

            case 0x0001:
                // Left
                targetType = enumWireType.turn;
                rotation += 90;
                break;

            case 0x0010:
                // Bottom
                break;

            case 0x0011:
                // Bottom | Left
                targetType = enumWireType.turn;
                rotation += 90;
                break;

            case 0x0100:
                // Right
                targetType = enumWireType.turn;
                break;

            case 0x0101:
                // Right | Left
                // @todo: Might want to do rotation += 90 here
                rotation += 90;
                break;

            case 0x0110:
                // Right | Bottom
                targetType = enumWireType.turn;
                break;

            case 0x0111:
                // Right | Bottom | Left
                targetType = enumWireType.split;
                break;

            case 0x1000:
                // Top
                break;

            case 0x1001:
                // Top | Left
                targetType = enumWireType.turn;
                rotation += 180;
                break;

            case 0x1010:
                // Top | Bottom
                break;

            case 0x1011:
                // Top | Bottom | Left
                targetType = enumWireType.split;
                rotation += 90;
                break;

            case 0x1100:
                // Top | Right
                targetType = enumWireType.turn;
                rotation -= 90;
                break;

            case 0x1101:
                // Top | Right | Left
                targetType = enumWireType.split;
                rotation += 180;
                break;

            case 0x1110:
                // Top | Right | Bottom
                targetType = enumWireType.split;
                rotation -= 90;
                break;

            case 0x1111:
                // Top | Right | Bottom | Left
                // @todo: Crossing
                break;
        }

        return {
            // Clamp rotation
            rotation: (rotation + 360 * 10) % 360,
            rotationVariant: arrayWireRotationVariantToType.indexOf(targetType),
        };
    }
}
