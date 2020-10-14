import { Loader } from "../../core/loader";
import { generateMatrixRotations } from "../../core/utils";
import { enumDirection, Vector } from "../../core/vector";
import { SOUNDS } from "../../platform/sound";
import { enumWireType, enumWireVariant, WireComponent } from "../components/wire";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";

export const arrayWireRotationVariantToType = [
    enumWireType.forward,
    enumWireType.turn,
    enumWireType.split,
    enumWireType.cross,
];

export const wireOverlayMatrices = {
    [enumWireType.forward]: generateMatrixRotations([0, 1, 0, 0, 1, 0, 0, 1, 0]),
    [enumWireType.split]: generateMatrixRotations([0, 0, 0, 1, 1, 1, 0, 1, 0]),
    [enumWireType.turn]: generateMatrixRotations([0, 0, 0, 0, 1, 1, 0, 1, 0]),
    [enumWireType.cross]: generateMatrixRotations([0, 1, 0, 1, 1, 1, 0, 1, 0]),
};

/** @enum {string} */
export const wireVariants = {
    second: "second",
    third: "third"
};

const enumWireVariantToVariant = {
    [defaultBuildingVariant]: enumWireVariant.first,
    [wireVariants.second]: enumWireVariant.second,
    [wireVariants.third]: enumWireVariant.third,
};

export class MetaWireBuilding extends MetaBuilding {
    constructor() {
        super("wire");
    }

    getHasDirectionLockAvailable() {
        return true;
    }

    getSilhouetteColor() {
        return "#61ef6f";
    }

    getAvailableVariants() {
        return [defaultBuildingVariant, wireVariants.second, wireVariants.third];
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
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_wires_painter_and_levers);
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(new WireComponent({}));
    }

    /**
     *
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        entity.components.Wire.type = arrayWireRotationVariantToType[rotationVariant];
        entity.components.Wire.variant = enumWireVariantToVariant[variant];
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

    /**
     *
     * @param {number} rotationVariant
     * @param {string} variant
     * @returns {import("../../core/draw_utils").AtlasSprite}
     */
    getPreviewSprite(rotationVariant, variant) {
        const wireVariant = enumWireVariantToVariant[variant];
        switch (arrayWireRotationVariantToType[rotationVariant]) {
            case enumWireType.forward: {
                return Loader.getSprite("sprites/wires/sets/" + wireVariant + "_forward.png");
            }
            case enumWireType.turn: {
                return Loader.getSprite("sprites/wires/sets/" + wireVariant + "_turn.png");
            }
            case enumWireType.split: {
                return Loader.getSprite("sprites/wires/sets/" + wireVariant + "_split.png");
            }
            case enumWireType.cross: {
                return Loader.getSprite("sprites/wires/sets/" + wireVariant + "_cross.png");
            }
            default: {
                assertAlways(false, "Invalid wire rotation variant");
            }
        }
    }

    getBlueprintSprite(rotationVariant, variant) {
        return this.getPreviewSprite(rotationVariant, variant);
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
        const wireVariant = enumWireVariantToVariant[variant];
        const connections = {
            top: root.logic.computeWireEdgeStatus({ tile, wireVariant, edge: enumDirection.top }),
            right: root.logic.computeWireEdgeStatus({ tile, wireVariant, edge: enumDirection.right }),
            bottom: root.logic.computeWireEdgeStatus({ tile, wireVariant, edge: enumDirection.bottom }),
            left: root.logic.computeWireEdgeStatus({ tile, wireVariant, edge: enumDirection.left }),
        };

        let flag = 0;
        flag |= connections.top ? 0b1000 : 0;
        flag |= connections.right ? 0b100 : 0;
        flag |= connections.bottom ? 0b10 : 0;
        flag |= connections.left ? 0b1 : 0;

        let targetType = enumWireType.forward;

        // First, reset rotation
        rotation = 0;

        switch (flag) {
            case 0b0000:
                // Nothing
                break;

            case 0b0001:
                // Left
                rotation += 90;
                break;

            case 0b0010:
                // Bottom
                // END
                break;

            case 0b0011:
                // Bottom | Left
                targetType = enumWireType.turn;
                rotation += 90;
                break;

            case 0b0100:
                // Right
                rotation += 90;
                break;

            case 0b0101:
                // Right | Left
                rotation += 90;
                break;

            case 0b0110:
                // Right | Bottom
                targetType = enumWireType.turn;
                break;

            case 0b0111:
                // Right | Bottom | Left
                targetType = enumWireType.split;
                break;

            case 0b1000:
                // Top
                break;

            case 0b1001:
                // Top | Left
                targetType = enumWireType.turn;
                rotation += 180;
                break;

            case 0b1010:
                // Top | Bottom
                break;

            case 0b1011:
                // Top | Bottom | Left
                targetType = enumWireType.split;
                rotation += 90;
                break;

            case 0b1100:
                // Top | Right
                targetType = enumWireType.turn;
                rotation -= 90;
                break;

            case 0b1101:
                // Top | Right | Left
                targetType = enumWireType.split;
                rotation += 180;
                break;

            case 0b1110:
                // Top | Right | Bottom
                targetType = enumWireType.split;
                rotation -= 90;
                break;

            case 0b1111:
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
}
