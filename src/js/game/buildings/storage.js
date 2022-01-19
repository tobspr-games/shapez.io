import { formatBigNumber } from "../../core/utils";
import { enumDirection, Vector } from "../../core/vector";
import { T } from "../../translations";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { StorageComponent } from "../components/storage";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";

const storageSize = 5000;

export class MetaStorageBuilding extends MetaBuilding {
    constructor() {
        super("storage");
    }

    static getAllVariantCombinations() {
        return [
            {
                internalId: 21,
                variant: defaultBuildingVariant,
            },
        ];
    }

    getSilhouetteColor() {
        return "#bbdf6d";
    }

    /**
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        return [[T.ingame.buildingPlacement.infoTexts.storage, formatBigNumber(storageSize)]];
    }

    getDimensions() {
        return new Vector(2, 2);
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_storage);
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        // Required, since the item processor needs this.
        entity.addComponent(
            new ItemEjectorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.top,
                    },
                    {
                        pos: new Vector(1, 0),
                        direction: enumDirection.top,
                    },
                ],
            })
        );

        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 1),
                        direction: enumDirection.bottom,
                    },
                    {
                        pos: new Vector(1, 1),
                        direction: enumDirection.bottom,
                    },
                ],
            })
        );

        entity.addComponent(
            new StorageComponent({
                maximumStorage: storageSize,
            })
        );

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
}
