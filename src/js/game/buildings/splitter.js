import { globalConfig } from "../../core/config";
import { Vector } from "../../core/vector";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { MetaBuilding, defaultBuildingVariant } from "../meta_building";
import { enumHubGoalRewards } from "../tutorial_goals";
import { T } from "../../translations";
import { formatItemsPerSecond } from "../../core/utils";

/**
 * @typedef {import("../root").GameRoot} GameRoot
 */

/** @enum {string} */
export const enumSplitterVariants = { compact: "compact", compactInverse: "compact-inverse" };

export class MetaSplitterBuilding extends MetaBuilding {
    constructor() {
        super("splitter");
    }

    getDimensions(variant) {
        switch (variant) {
            case defaultBuildingVariant:
                return new Vector(2, 1);
            case enumSplitterVariants.compact:
            case enumSplitterVariants.compactInverse:
                return new Vector(1, 1);
            default:
                assertAlways(false, "Unknown splitter variant: " + variant);
        }
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        const speed = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.splitter);
        return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
    }

    getSilhouetteColor() {
        return "#444";
    }

    /**
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_splitter_compact)) {
            return [
                defaultBuildingVariant,
                enumSplitterVariants.compact,
                enumSplitterVariants.compactInverse,
            ];
        }
        return super.getAvailableVariants(root);
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_splitter);
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [], // set later
            })
        );

        entity.addComponent(
            new ItemProcessorComponent({
                inputsPerCharge: 1,
                processorType: enumItemProcessorTypes.splitter,
            })
        );

        entity.addComponent(
            new ItemEjectorComponent({
                slots: [], // set later
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
                entity.components.ItemAcceptor.setSlots([
                    {
                        pos: new Vector(0, 0),
                        directions: ["bottom"],
                    },
                    {
                        pos: new Vector(1, 0),
                        directions: ["bottom"],
                    },
                ]);

                entity.components.ItemEjector.setSlots([
                    { pos: new Vector(0, 0), direction: "top" },
                    { pos: new Vector(1, 0), direction: "top" },
                ]);

                entity.components.ItemAcceptor.beltUnderlays = [
                    { pos: new Vector(0, 0), direction: "top", layer: "regular" },
                    { pos: new Vector(1, 0), direction: "top", layer: "regular" },
                ];

                break;
            }
            case enumSplitterVariants.compact:
            case enumSplitterVariants.compactInverse: {
                entity.components.ItemAcceptor.setSlots([
                    {
                        pos: new Vector(0, 0),
                        directions: ["bottom"],
                    },
                    {
                        pos: new Vector(0, 0),
                        directions: [variant === enumSplitterVariants.compactInverse ? "left" : "right"],
                    },
                ]);

                entity.components.ItemEjector.setSlots([{ pos: new Vector(0, 0), direction: "top" }]);

                entity.components.ItemAcceptor.beltUnderlays = [
                    { pos: new Vector(0, 0), direction: "top", layer: "regular" },
                ];

                break;
            }
            default:
                assertAlways(false, "Unknown painter variant: " + variant);
        }
    }
}
