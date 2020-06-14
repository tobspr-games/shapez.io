import { globalConfig } from "../../core/config";
import { enumDirection, Vector } from "../../core/vector";
import { ItemAcceptorComponent, enumItemAcceptorItemFilter } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { MetaBuilding, defaultBuildingVariant } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";
import { T } from "../../translations";
import { formatItemsPerSecond } from "../../core/utils";

/** @enum {string} */
export const enumMixerVariants = { incinerator: "incinerator" };

export class MetaMixerBuilding extends MetaBuilding {
    constructor() {
        super("mixer");
    }

    getDimensions(variant) {
        switch (variant) {
            case defaultBuildingVariant:
            case enumMixerVariants.incinerator:
                return new Vector(2, 1);
            default:
                assertAlways(false, "Unknown mixer variant: " + variant);
        }
    }

    getSilhouetteColor() {
        return "#cdbb7d";
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_mixer);
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        switch (variant) {
            case defaultBuildingVariant: {
                const speed = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.mixer);
                return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
            }
            case enumMixerVariants.incinerator: {
                const speed = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.dyeIncinerator);
                return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
            }
        }
    }

    getAvailableVariants(root) {
        let variants = [defaultBuildingVariant];
        if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_dye_incinerator)) {
            variants.push(enumMixerVariants.incinerator);
        }
        return variants;
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new ItemProcessorComponent({
                inputsPerCharge: 2,
                processorType: enumItemProcessorTypes.mixer,
            })
        );
        entity.addComponent(new ItemEjectorComponent({}));
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.bottom],
                        filter: enumItemAcceptorItemFilter.color,
                    },
                    {
                        pos: new Vector(1, 0),
                        directions: [enumDirection.bottom],
                        filter: enumItemAcceptorItemFilter.color,
                    },
                ],
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
        switch (variant) {
            case defaultBuildingVariant: {
                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: enumDirection.top },
                ]);
                break;
            }
            case enumMixerVariants.incinerator: {
                entity.components.ItemProcessor.type = enumItemProcessorTypes.dyeIncinerator;
                entity.components.ItemProcessor.inputsPerCharge = 1;
                entity.components.ItemAcceptor.setSlots([
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.left],
                        filter: enumItemAcceptorItemFilter.color,
                    },
                ]);
                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(1, 0), direction: enumDirection.right },
                ]);
                break;
            }
            default: {
                assertAlways(false, "Unknown mixer variant: " + variant);
            }
        }
    }
}
