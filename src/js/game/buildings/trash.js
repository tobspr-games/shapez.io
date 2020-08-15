import { formatBigNumber } from "../../core/utils";
import { enumDirection, Vector } from "../../core/vector";
import { T } from "../../translations";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { StorageComponent } from "../components/storage";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";

/** @enum {string} */
export const enumTrashVariants = { storage: "storage" };

const trashSize = 5000;

export class MetaTrashBuilding extends MetaBuilding {
    constructor() {
        super("trash");
    }

    getIsRotateable(variant) {
        return variant !== defaultBuildingVariant;
    }

    getSilhouetteColor() {
        return "#cd7d86";
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        if (variant === enumTrashVariants.storage) {
            return [[T.ingame.buildingPlacement.infoTexts.storage, formatBigNumber(trashSize)]];
        }
        return [];
    }

    getDimensions(variant) {
        switch (variant) {
            case defaultBuildingVariant:
                return new Vector(1, 1);
            case enumTrashVariants.storage:
                return new Vector(2, 2);
            default:
                assertAlways(false, "Unknown trash variant: " + variant);
        }
    }

    /**
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_storage)) {
            return [defaultBuildingVariant, enumTrashVariants.storage];
        }
        return super.getAvailableVariants(root);
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_cutter_and_trash);
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        // Required, since the item processor needs this.
        entity.addComponent(
            new ItemEjectorComponent({
                slots: [],
            })
        );

        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        directions: [
                            enumDirection.top,
                            enumDirection.right,
                            enumDirection.bottom,
                            enumDirection.left,
                        ],
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
                if (!entity.components.ItemProcessor) {
                    entity.addComponent(
                        new ItemProcessorComponent({
                            inputsPerCharge: 1,
                            processorType: enumItemProcessorTypes.trash,
                        })
                    );
                }
                if (entity.components.Storage) {
                    entity.removeComponent(StorageComponent);
                }
                if (entity.components.WiredPins) {
                    entity.removeComponent(WiredPinsComponent);
                }

                entity.components.ItemAcceptor.setSlots([
                    {
                        pos: new Vector(0, 0),
                        directions: [
                            enumDirection.top,
                            enumDirection.right,
                            enumDirection.bottom,
                            enumDirection.left,
                        ],
                    },
                ]);
                entity.components.ItemEjector.setSlots([]);
                entity.components.ItemProcessor.type = enumItemProcessorTypes.trash;
                break;
            }
            case enumTrashVariants.storage: {
                if (entity.components.ItemProcessor) {
                    entity.removeComponent(ItemProcessorComponent);
                }
                if (!entity.components.Storage) {
                    entity.addComponent(new StorageComponent({}));
                }
                if (!entity.components.WiredPins) {
                    entity.addComponent(
                        new WiredPinsComponent({
                            slots: [
                                {
                                    pos: new Vector(1, 1),
                                    direction: enumDirection.right,
                                    type: enumPinSlotType.logicalEjector,
                                },
                                {
                                    pos: new Vector(0, 1),
                                    direction: enumDirection.left,
                                    type: enumPinSlotType.logicalEjector,
                                },
                            ],
                        })
                    );
                }

                entity.components.Storage.maximumStorage = trashSize;
                entity.components.ItemAcceptor.setSlots([
                    {
                        pos: new Vector(0, 1),
                        directions: [enumDirection.bottom],
                    },
                    {
                        pos: new Vector(1, 1),
                        directions: [enumDirection.bottom],
                    },
                ]);

                entity.components.ItemEjector.setSlots([
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.top,
                    },
                    {
                        pos: new Vector(1, 0),
                        direction: enumDirection.top,
                    },
                ]);
                break;
            }
            default:
                assertAlways(false, "Unknown trash variant: " + variant);
        }
    }
}
