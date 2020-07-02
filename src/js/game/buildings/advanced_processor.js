import { formatItemsPerSecond } from "../../core/utils";
import { enumDirection, Vector } from "../../core/vector";
import { T } from "../../translations";
import { enumItemType } from "../base_item";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { MetaBuilding } from "../meta_building";
import { GameRoot, enumLayer } from "../root";
import { WiredPinsComponent, enumPinSlotType } from "../components/wired_pins";
import { EnergyConsumerComponent } from "../components/energy_consumer";

export class MetaAdvancedProcessorBuilding extends MetaBuilding {
    constructor() {
        super("advanced_processor");
    }

    getSilhouetteColor() {
        return "#25d7b8";
    }

    getDimensions(variant) {
        return new Vector(2, 2);
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        const speed = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.advancedProcessor);
        return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        // TODO
        return true;
        // return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_cutter_and_trash);
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new ItemProcessorComponent({
                inputsPerCharge: 1,
                processorType: enumItemProcessorTypes.advancedProcessor,
            })
        );
        entity.addComponent(
            new ItemEjectorComponent({
                slots: [
                    { pos: new Vector(1, 0), direction: enumDirection.right },
                    { pos: new Vector(1, 0), direction: enumDirection.top, layer: enumLayer.wires },
                ],
            })
        );
        entity.addComponent(
            new EnergyConsumerComponent({
                bufferSize: 3,
                perCharge: 0.25,
                batteryPosition: new Vector(4, 6.5),
                acceptorSlotIndex: 1,
                ejectorSlotIndex: 1,
            })
        );

        entity.addComponent(
            new WiredPinsComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.top,
                        type: enumPinSlotType.positiveEnergyAcceptor,
                    },
                    {
                        pos: new Vector(1, 0),
                        direction: enumDirection.top,
                        type: enumPinSlotType.negativeEnergyEjector,
                    },
                ],
            })
        );
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 1),
                        directions: [enumDirection.left],
                        filter: enumItemType.shape,
                    },

                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.top],
                        filter: enumItemType.positiveEnergy,
                        layer: enumLayer.wires,
                    },
                ],
            })
        );
    }
}
