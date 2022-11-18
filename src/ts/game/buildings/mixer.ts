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
export class MetaMixerBuilding extends MetaBuilding {

    constructor() {
        super("mixer");
    }
    static getAllVariantCombinations(): any {
        return [
            {
                internalId: 15,
                variant: defaultBuildingVariant,
            },
        ];
    }
    getDimensions(): any {
        return new Vector(2, 1);
    }
    getSilhouetteColor(): any {
        return "#cdbb7d";
    }
        getIsUnlocked(root: GameRoot): any {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_mixer);
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
        const speed: any = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.mixer);
        return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
    }
    /**
     * Creates the entity at the given location
     */
    setupEntityComponents(entity: Entity): any {
        entity.addComponent(new ItemProcessorComponent({
            inputsPerCharge: 2,
            processorType: enumItemProcessorTypes.mixer,
        }));
        entity.addComponent(new ItemEjectorComponent({
            slots: [{ pos: new Vector(0, 0), direction: enumDirection.top }],
        }));
        entity.addComponent(new ItemAcceptorComponent({
            slots: [
                {
                    pos: new Vector(0, 0),
                    direction: enumDirection.bottom,
                    filter: "color",
                },
                {
                    pos: new Vector(1, 0),
                    direction: enumDirection.bottom,
                    filter: "color",
                },
            ],
        }));
    }
}
