import { formatItemsPerSecond } from "../../core/utils";
import { enumDirection, Vector } from "../../core/vector";
import { T } from "../../translations";
import { FilterComponent } from "../components/filter";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { defaultBuildingVariant, MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";
export class MetaFilterBuilding extends MetaBuilding {

    constructor() {
        super("filter");
    }
    static getAllVariantCombinations(): any {
        return [
            {
                internalId: 37,
                variant: defaultBuildingVariant,
            },
        ];
    }
    getSilhouetteColor(): any {
        return "#c45c2e";
    }
        getIsUnlocked(root: GameRoot): any {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_filter);
    }
    getDimensions(): any {
        return new Vector(2, 1);
    }
    getShowWiresLayerPreview(): any {
        return true;
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
        const beltSpeed: any = root.hubGoals.getBeltBaseSpeed();
        return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(beltSpeed)]];
    }
    /**
     * Creates the entity at the given location
     */
    setupEntityComponents(entity: Entity): any {
        entity.addComponent(new WiredPinsComponent({
            slots: [
                {
                    pos: new Vector(0, 0),
                    direction: enumDirection.left,
                    type: enumPinSlotType.logicalAcceptor,
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
                {
                    pos: new Vector(1, 0),
                    direction: enumDirection.right,
                },
            ],
        }));
        entity.addComponent(new FilterComponent());
    }
}
