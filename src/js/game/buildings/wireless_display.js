import { enumDirection, Vector } from "../../core/vector";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { WirelessDisplayComponent } from "../components/wireless_display";
import { enumHubGoalRewards } from "../tutorial_goals";
import { formatItemsPerSecond, generateMatrixRotations } from "../../core/utils";


/** @enum {string} */
export const enumWirelessDisplayVariants = {
    remote_control: "remote_control",
};

const overlayMatrices = {
    [defaultBuildingVariant]: null,
    [enumWirelessDisplayVariants.remote_control]: generateMatrixRotations([0, 1, 0, 0, 1, 1, 0, 1, 0]),
};

export class MetaWirelessDisplayBuilding extends MetaBuilding {
    constructor() {
        super("wireless_display");
    }

    getSilhouetteColor() {
        return "#aaaaaa";
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_display);
    }

    /**
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        let available = [defaultBuildingVariant];

        if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_display)) {
            available.push(enumWirelessDisplayVariants.remote_control);
        }

        return available;
    }

    getDimensions() {
        return new Vector(1, 1);
    }

    getShowWiresLayerPreview() {
        return true;
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(new WirelessDisplayComponent({}));
    }

    /**
     *
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        if (variant == enumWirelessDisplayVariants.remote_control && !entity.components.WiredPins) {
            entity.addComponent(
                new WiredPinsComponent({
                    slots: [
                        {
                            pos: new Vector(0, 0),
                            direction: enumDirection.bottom,
                            type: enumPinSlotType.logicalAcceptor,
                        },
                    ],
                })
            );
        }
    }
}
