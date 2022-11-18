import { enumDirection, Vector } from "../../core/vector";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { BeltUnderlaysComponent } from "../components/belt_underlays";
import { BeltReaderComponent } from "../components/belt_reader";
import { enumHubGoalRewards } from "../tutorial_goals";
import { generateMatrixRotations } from "../../core/utils";
const overlayMatrix = generateMatrixRotations([0, 1, 0, 0, 1, 0, 0, 1, 0]);
export class MetaReaderBuilding extends MetaBuilding {

    constructor() {
        super("reader");
    }
    static getAllVariantCombinations() {
        return [
            {
                internalId: 49,
                variant: defaultBuildingVariant,
            },
        ];
    }
    getSilhouetteColor() {
        return "#25fff2";
    }
        getIsUnlocked(root: GameRoot) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_belt_reader);
    }
    getDimensions() {
        return new Vector(1, 1);
    }
    getShowWiresLayerPreview() {
        return true;
    }
    /**
     * {}
     */
    getSpecialOverlayRenderMatrix(rotation: number, rotationVariant: number, variant: string, entity: Entity): Array<number> | null {
        return overlayMatrix[rotation];
    }
    /**
     * Creates the entity at the given location
     */
    setupEntityComponents(entity: Entity) {
        entity.addComponent(new WiredPinsComponent({
            slots: [
                {
                    pos: new Vector(0, 0),
                    direction: enumDirection.right,
                    type: enumPinSlotType.logicalEjector,
                },
                {
                    pos: new Vector(0, 0),
                    direction: enumDirection.left,
                    type: enumPinSlotType.logicalEjector,
                },
            ],
        }));
        entity.addComponent(new ItemAcceptorComponent({
            slots: [
                {
                    pos: new Vector(0, 0),
                    direction: enumDirection.bottom,
                },
            ],
        }));
        entity.addComponent(new ItemEjectorComponent({
            slots: [
                {
                    pos: new Vector(0, 0),
                    direction: enumDirection.top,
                },
            ],
        }));
        entity.addComponent(new ItemProcessorComponent({
            processorType: enumItemProcessorTypes.reader,
            inputsPerCharge: 1,
        }));
        entity.addComponent(new BeltUnderlaysComponent({
            underlays: [
                {
                    pos: new Vector(0, 0),
                    direction: enumDirection.top,
                },
            ],
        }));
        entity.addComponent(new BeltReaderComponent());
    }
}
