import { Vector } from "../../core/vector";
import { enumItemType } from "../base_item";
import { EnergyGeneratorComponent } from "../components/energy_generator";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { MetaBuilding } from "../meta_building";
import { enumLayer, GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";

export class MetaEnergyGenerator extends MetaBuilding {
    constructor() {
        super("energy_generator");
    }

    getSilhouetteColor() {
        return "#c425d7";
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        // TODO
        return [];
    }

    getDimensions(variant) {
        return new Vector(2, 2);
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return true;
        // return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_cutter_and_trash);
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 1),
                        directions: ["bottom"],
                        filter: enumItemType.shape,
                    },
                    {
                        pos: new Vector(1, 1),
                        directions: ["bottom"],
                        filter: enumItemType.shape,
                    },
                    {
                        pos: new Vector(1, 0),
                        directions: ["top"],
                        layer: enumLayer.wires,
                        filter: enumItemType.negativeEnergy,
                    },
                ],
            })
        );

        entity.addComponent(
            new ItemEjectorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        direction: "top",
                        layer: enumLayer.wires,
                    },
                ],
                instantEject: true,
            })
        );

        entity.addComponent(
            new EnergyGeneratorComponent({
                // Set by the energy generator system later
                requiredKey: null,
                wasteAcceptorSlotIndex: 2,
            })
        );

        entity.addComponent(
            new WiredPinsComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        type: enumPinSlotType.positiveEnergyEjector,
                        direction: "top",
                    },
                    {
                        pos: new Vector(1, 0),
                        type: enumPinSlotType.negativeEnergyAcceptor,
                        direction: "top",
                    },
                ],
            })
        );
    }
}
