import { formatItemsPerSecond } from "../../core/utils";
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
export const enumCutterVariants: any = { quad: "quad" };
export class MetaCutterBuilding extends MetaBuilding {

    constructor() {
        super("cutter");
    }
    static getAllVariantCombinations(): any {
        return [
            {
                internalId: 9,
                variant: defaultBuildingVariant,
            },
            {
                internalId: 10,
                variant: enumCutterVariants.quad,
            },
        ];
    }
    getSilhouetteColor(): any {
        return "#7dcda2";
    }
    getDimensions(variant: any): any {
        switch (variant) {
            case defaultBuildingVariant:
                return new Vector(2, 1);
            case enumCutterVariants.quad:
                return new Vector(4, 1);
            default:
                assertAlways(false, "Unknown cutter variant: " + variant);
        }
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
        const speed: any = root.hubGoals.getProcessorBaseSpeed(variant === enumCutterVariants.quad
            ? enumItemProcessorTypes.cutterQuad
            : enumItemProcessorTypes.cutter);
        return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
    }
        getAvailableVariants(root: GameRoot): any {
        if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_cutter_quad)) {
            return [defaultBuildingVariant, enumCutterVariants.quad];
        }
        return super.getAvailableVariants(root);
    }
        getIsUnlocked(root: GameRoot): any {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_cutter_and_trash);
    }
    /**
     * Creates the entity at the given location
     */
    setupEntityComponents(entity: Entity): any {
        entity.addComponent(new ItemProcessorComponent({
            inputsPerCharge: 1,
            processorType: enumItemProcessorTypes.cutter,
        }));
        entity.addComponent(new ItemEjectorComponent({}));
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
                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                    { pos: new Vector(1, 0), direction: enumDirection.top },
                ]);
                entity.components.ItemProcessor.type = enumItemProcessorTypes.cutter;
                break;
            }
            case enumCutterVariants.quad: {
                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                    { pos: new Vector(1, 0), direction: enumDirection.top },
                    { pos: new Vector(2, 0), direction: enumDirection.top },
                    { pos: new Vector(3, 0), direction: enumDirection.top },
                ]);
                entity.components.ItemProcessor.type = enumItemProcessorTypes.cutterQuad;
                break;
            }
            default:
                assertAlways(false, "Unknown painter variant: " + variant);
        }
    }
}
