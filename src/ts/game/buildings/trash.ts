import { generateMatrixRotations } from "../../core/utils";
import { enumDirection, Vector } from "../../core/vector";
import { ACHIEVEMENTS } from "../../platform/achievement_provider";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";
const overlayMatrix: any = generateMatrixRotations([1, 1, 0, 1, 1, 1, 0, 1, 1]);
export class MetaTrashBuilding extends MetaBuilding {

    constructor() {
        super("trash");
    }
    static getAllVariantCombinations(): any {
        return [
            {
                internalId: 20,
                variant: defaultBuildingVariant,
            },
        ];
    }
    getIsRotateable(): any {
        return false;
    }
    getSilhouetteColor(): any {
        return "#ed1d5d";
    }
    getDimensions(): any {
        return new Vector(1, 1);
    }
    getSpecialOverlayRenderMatrix(rotation: any): any {
        return overlayMatrix[rotation];
    }
        getIsUnlocked(root: GameRoot): any {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_cutter_and_trash);
    }
    addAchievementReceiver(entity: any): any {
        if (!entity.root) {
            return;
        }
        const itemProcessor: any = entity.components.ItemProcessor;
        const tryTakeItem: any = itemProcessor.tryTakeItem.bind(itemProcessor);
        itemProcessor.tryTakeItem = (): any => {
            const taken: any = tryTakeItem(...arguments);
            if (taken) {
                entity.root.signals.achievementCheck.dispatch(ACHIEVEMENTS.trash1000, 1);
            }
            return taken;
        };
    }
    /**
     * Creates the entity at the given location
     */
    setupEntityComponents(entity: Entity): any {
        entity.addComponent(new ItemAcceptorComponent({
            slots: [
                {
                    pos: new Vector(0, 0),
                    direction: enumDirection.top,
                },
                {
                    pos: new Vector(0, 0),
                    direction: enumDirection.right,
                },
                {
                    pos: new Vector(0, 0),
                    direction: enumDirection.bottom,
                },
                {
                    pos: new Vector(0, 0),
                    direction: enumDirection.left,
                },
            ],
        }));
        entity.addComponent(new ItemProcessorComponent({
            inputsPerCharge: 1,
            processorType: enumItemProcessorTypes.trash,
        }));
        this.addAchievementReceiver(entity);
    }
}
