import { Loader } from "../../core/loader";
import { generateMatrixRotations } from "../../core/utils";
import { enumDirection, enumDirectionToAngle, enumDirectionToVector, Vector } from "../../core/vector";
import { SOUNDS } from "../../platform/sound";
import { enumWireType, WireComponent } from "../components/wire";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding, MetaBuildingVariant } from "../meta_building";
import { GameRoot } from "../root";

export const arrayWireRotationVariantToType = [
    enumWireType.regular,
    enumWireType.turn,
    enumWireType.split,
    enumWireType.cross,
];

export const wireOverlayMatrices = {
    [enumWireType.regular]: generateMatrixRotations([0, 1, 0, 0, 1, 0, 0, 1, 0]),
    [enumWireType.split]: generateMatrixRotations([0, 0, 0, 1, 1, 1, 0, 1, 0]),
    [enumWireType.turn]: generateMatrixRotations([0, 0, 0, 0, 1, 1, 0, 1, 0]),
    [enumWireType.cross]: generateMatrixRotations([0, 1, 0, 1, 1, 1, 0, 1, 0]),
};

export class MetaWireBuilding extends MetaBuilding {
    constructor() {
        super("wire");
    }

    getAvailableVariants() {
        return [DefaultWireVariant];
    }

    getHasDirectionLockAvailable() {
        return true;
    }

    getSilhouetteColor() {
        return "#25fff2";
    }

    getStayInPlacementMode() {
        return true;
    }

    getPlacementSound() {
        return SOUNDS.placeBelt;
    }

    /** @returns {"wires"} **/
    getLayer() {
        return "wires";
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
        return true;
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        // @todo
        entity.addComponent(new WireComponent({}));
    }
}

export class DefaultWireVariant extends MetaBuildingVariant {
    /**
     * @returns {string} Variant id
     */
    static getId() {
        return defaultBuildingVariant;
    }

    /**
     * Should update the entity components
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {GameRoot} root
     */
    static updateEntityComponents(entity, rotationVariant, root) {
        entity.components.Wire.type = arrayWireRotationVariantToType[rotationVariant];
    }

    /**
     * Should compute the optimal rotation variant on the given tile
     * @param {object} param0
     * @param {GameRoot} param0.root
     * @param {Vector} param0.tile
     * @param {number} param0.rotation
     * @param {Layer} param0.layer
     * @return {{ rotation: number, rotationVariant: number, connectedEntities?: Array<Entity> }}
     */
    static computeOptimalDirectionAndRotationVariantAtTile({ root, tile, rotation, layer }) {
        const connections = {
            top: root.logic.computeWireEdgeStatus({ tile, rotation, edge: enumDirection.top }),
            right: root.logic.computeWireEdgeStatus({ tile, rotation, edge: enumDirection.right }),
            bottom: root.logic.computeWireEdgeStatus({ tile, rotation, edge: enumDirection.bottom }),
            left: root.logic.computeWireEdgeStatus({ tile, rotation, edge: enumDirection.left }),
        };

        let flag = 0;
        flag |= connections.top ? 0x1000 : 0;
        flag |= connections.right ? 0x100 : 0;
        flag |= connections.bottom ? 0x10 : 0;
        flag |= connections.left ? 0x1 : 0;

        let targetType = enumWireType.regular;

        // First, reset rotation
        rotation = 0;

        switch (flag) {
            case 0x0000:
                // Nothing
                break;

            case 0x0001:
                // Left
                rotation += 90;
                break;

            case 0x0010:
                // Bottom
                // END
                break;

            case 0x0011:
                // Bottom | Left
                targetType = enumWireType.turn;
                rotation += 90;
                break;

            case 0x0100:
                // Right
                rotation += 90;
                break;

            case 0x0101:
                // Right | Left
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
                targetType = enumWireType.cross;
                break;
        }

        return {
            // Clamp rotation
            rotation: (rotation + 360 * 10) % 360,
            rotationVariant: arrayWireRotationVariantToType.indexOf(targetType),
        };
    }

    /**
     * Can return a special interlaved 9 elements overlay matrix for rendering
     * @param {number} rotation
     * @param {number} rotationVariant
     * @param {Entity} entity
     * @returns {Array<number>|null}
     */
    static getSpecialOverlayRenderMatrix(rotation, rotationVariant, entity) {
        return wireOverlayMatrices[entity.components.Wire.type][rotation];
    }

    /**
     * Returns the sprite for a given variant
     * @param {number} rotationVariant
     * @param {MetaBuilding} building
     */
    static getSprite(rotationVariant, building) {
        return null;
    }

    /**
     * Returns the sprite for a given variant
     * @param {number} rotationVariant
     * @param {MetaBuilding} building
     */
    static getBlueprintSprite(rotationVariant, building) {
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
            case enumWireType.cross: {
                return Loader.getSprite("sprites/blueprints/wire-cross.png");
            }
            default: {
                assertAlways(false, "Invalid wire rotation variant");
            }
        }
    }

    /**
     * Returns the sprite for a given variant
     * @param {number} rotationVariant
     * @param {MetaBuilding} building
     */
    static getPreviewSprite(rotationVariant, building) {
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
            case enumWireType.cross: {
                return Loader.getSprite("sprites/buildings/wire-cross.png");
            }
            default: {
                assertAlways(false, "Invalid wire rotation variant");
            }
        }
    }

    /**
     * Whether to rotate automatically in the dragging direction while placing
     */
    static getRotateAutomaticallyWhilePlacing() {
        return true;
    }
}
