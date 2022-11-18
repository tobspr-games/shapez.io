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
};
const enumWireVariantToVariant = {
    [defaultBuildingVariant]: enumWireVariant.first,
    [wireVariants.second]: enumWireVariant.second,
};
export class MetaWireBuilding extends MetaBuilding {

    constructor() {
        super("wire");
    }
    static getAllVariantCombinations() {
        return [
            {
                internalId: 27,
                variant: defaultBuildingVariant,
                rotationVariant: 0,
            },
            {
                internalId: 28,
                variant: defaultBuildingVariant,
                rotationVariant: 1,
            },
            {
                internalId: 29,
                variant: defaultBuildingVariant,
                rotationVariant: 2,
            },
            {
                internalId: 30,
                variant: defaultBuildingVariant,
                rotationVariant: 3,
            },
            {
                internalId: 52,
                variant: enumWireVariant.second,
                rotationVariant: 0,
            },
            {
                internalId: 53,
                variant: enumWireVariant.second,
                rotationVariant: 1,
            },
            {
                internalId: 54,
                variant: enumWireVariant.second,
                rotationVariant: 2,
            },
            {
                internalId: 55,
                variant: enumWireVariant.second,
                rotationVariant: 3,
            },
        ];
    }
    getHasDirectionLockAvailable() {
        return true;
    }
    getSilhouetteColor() {
        return "#61ef6f";
    }
    getAvailableVariants() {
        return [defaultBuildingVariant, wireVariants.second];
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
    /** {} **/
    getLayer(): "wires" {
        return "wires";
    }
    getSprite() {
        return null;
    }
    getIsReplaceable() {
        return true;
    }
        getIsUnlocked(root: GameRoot) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_wires_painter_and_levers);
    }
    /**
     * Creates the entity at the given location
     */
    setupEntityComponents(entity: Entity) {
        entity.addComponent(new WireComponent({}));
    }
        updateVariants(entity: Entity, rotationVariant: number, variant: string) {
        entity.components.Wire.type = arrayWireRotationVariantToType[rotationVariant];
        entity.components.Wire.variant = enumWireVariantToVariant[variant];
    }
        getSpecialOverlayRenderMatrix(rotation: number, rotationVariant: number, variant: string, entity: Entity) {
        return wireOverlayMatrices[entity.components.Wire.type][rotation];
    }
    /**
     *
     * {}
     */
    getPreviewSprite(rotationVariant: number, variant: string): import("../../core/draw_utils").AtlasSprite {
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
     * @return {{ rotation: number, rotationVariant: number, connectedEntities?: Array<Entity> }}
     */
    computeOptimalDirectionAndRotationVariantAtTile({ root, tile, rotation, variant, layer }: {
        root: GameRoot;
        tile: Vector;
        rotation: number;
        variant: string;
        layer: string;
    }): {
        rotation: number;
        rotationVariant: number;
        connectedEntities?: Array<Entity>;
    } {
        const wireVariant = enumWireVariantToVariant[variant];
        const connections = {
            top: root.logic.computeWireEdgeStatus({ tile, wireVariant, edge: enumDirection.top }),
            right: root.logic.computeWireEdgeStatus({ tile, wireVariant, edge: enumDirection.right }),
            bottom: root.logic.computeWireEdgeStatus({ tile, wireVariant, edge: enumDirection.bottom }),
            left: root.logic.computeWireEdgeStatus({ tile, wireVariant, edge: enumDirection.left }),
        };
        let flag = 0;
        flag |= connections.top ? 0x1000 : 0;
        flag |= connections.right ? 0x100 : 0;
        flag |= connections.bottom ? 0x10 : 0;
        flag |= connections.left ? 0x1 : 0;
        let targetType = enumWireType.forward;
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
}
