import { formatItemsPerSecond, generateMatrixRotations } from "../../core/utils";
import { enumDirection, Vector } from "../../core/vector";
import { T } from "../../translations";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";
/** @enum {string} */
export const enumRotaterVariants: any = { ccw: "ccw", rotate180: "rotate180" };
const overlayMatrices: any = {
    [defaultBuildingVariant]: generateMatrixRotations([0, 1, 1, 1, 1, 0, 0, 1, 1]),
    [enumRotaterVariants.ccw]: generateMatrixRotations([1, 1, 0, 0, 1, 1, 1, 1, 0]),
    [enumRotaterVariants.rotate180]: generateMatrixRotations([1, 1, 0, 1, 1, 1, 0, 1, 1]),
};
export class MetaRotaterBuilding extends MetaBuilding {

    constructor() {
        super("rotater");
    }
    static getAllVariantCombinations(): any {
        return [
            {
                internalId: 11,
                variant: defaultBuildingVariant,
            },
            {
                internalId: 12,
                variant: enumRotaterVariants.ccw,
            },
            {
                internalId: 13,
                variant: enumRotaterVariants.rotate180,
            },
        ];
    }
    getSilhouetteColor(): any {
        return "#7dc6cd";
    }
    /**
     * {}
     */
    getSpecialOverlayRenderMatrix(rotation: number, rotationVariant: number, variant: string, entity: Entity): Array<number> | null {
        const matrix: any = overlayMatrices[variant];
        if (matrix) {
            return matrix[rotation];
        }
        return null;
    }
    /**
     * {}
     */
    getAdditionalStatistics(root: GameRoot, variant: string): Array<[
        string,
        string
    ]> {
        if (root.gameMode.throughputDoesNotMatter()) {
            return [];
        }
        switch (variant) {
            case defaultBuildingVariant: {
                const speed: any = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.rotater);
                return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
            }
            case enumRotaterVariants.ccw: {
                const speed: any = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.rotaterCCW);
                return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
            }
            case enumRotaterVariants.rotate180: {
                const speed: any = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.rotater180);
                return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
            }
        }
    }
        getAvailableVariants(root: GameRoot): any {
        let variants: any = [defaultBuildingVariant];
        if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_rotater_ccw)) {
            variants.push(enumRotaterVariants.ccw);
        }
        if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_rotater_180)) {
            variants.push(enumRotaterVariants.rotate180);
        }
        return variants;
    }
        getIsUnlocked(root: GameRoot): any {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_rotater);
    }
    /**
     * Creates the entity at the given location
     */
    setupEntityComponents(entity: Entity): any {
        entity.addComponent(new ItemProcessorComponent({
            inputsPerCharge: 1,
            processorType: enumItemProcessorTypes.rotater,
        }));
        entity.addComponent(new ItemEjectorComponent({
            slots: [{ pos: new Vector(0, 0), direction: enumDirection.top }],
        }));
        entity.addComponent(new ItemAcceptorComponent({
            slots: [
                {
                    pos: new Vector(0, 0),
                    direction: enumDirection.bottom,
                    filter: "shape",
                },
            ],
        }));
    }
        updateVariants(entity: Entity, rotationVariant: number, variant: string): any {
        switch (variant) {
            case defaultBuildingVariant: {
                entity.components.ItemProcessor.type = enumItemProcessorTypes.rotater;
                break;
            }
            case enumRotaterVariants.ccw: {
                entity.components.ItemProcessor.type = enumItemProcessorTypes.rotaterCCW;
                break;
            }
            case enumRotaterVariants.rotate180: {
                entity.components.ItemProcessor.type = enumItemProcessorTypes.rotater180;
                break;
            }
            default:
                assertAlways(false, "Unknown rotater variant: " + variant);
        }
    }
}
