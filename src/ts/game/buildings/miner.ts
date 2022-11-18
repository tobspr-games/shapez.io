import { enumDirection, Vector } from "../../core/vector";
import { ItemEjectorComponent } from "../components/item_ejector";
import { MinerComponent } from "../components/miner";
import { Entity } from "../entity";
import { MetaBuilding, defaultBuildingVariant } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";
import { T } from "../../translations";
import { formatItemsPerSecond, generateMatrixRotations } from "../../core/utils";
/** @enum {string} */
export const enumMinerVariants: any = { chainable: "chainable" };
const overlayMatrix: any = {
    [defaultBuildingVariant]: generateMatrixRotations([1, 1, 1, 1, 0, 1, 1, 1, 1]),
    [enumMinerVariants.chainable]: generateMatrixRotations([0, 1, 0, 1, 1, 1, 1, 1, 1]),
};
export class MetaMinerBuilding extends MetaBuilding {

    constructor() {
        super("miner");
    }
    static getAllVariantCombinations(): any {
        return [
            {
                internalId: 7,
                variant: defaultBuildingVariant,
            },
            {
                internalId: 8,
                variant: enumMinerVariants.chainable,
            },
        ];
    }
    getSilhouetteColor(): any {
        return "#b37dcd";
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
        const speed: any = root.hubGoals.getMinerBaseSpeed();
        return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
    }
        getAvailableVariants(root: GameRoot): any {
        if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_miner_chainable)) {
            return [enumMinerVariants.chainable];
        }
        return super.getAvailableVariants(root);
    }
        getSpecialOverlayRenderMatrix(rotation: number, rotationVariant: number, variant: string, entity: Entity): any {
        return overlayMatrix[variant][rotation];
    }
    /**
     * Creates the entity at the given location
     */
    setupEntityComponents(entity: Entity): any {
        entity.addComponent(new MinerComponent({}));
        entity.addComponent(new ItemEjectorComponent({
            slots: [{ pos: new Vector(0, 0), direction: enumDirection.top }],
        }));
    }
        updateVariants(entity: Entity, rotationVariant: number, variant: string): any {
        entity.components.Miner.chainable = variant === enumMinerVariants.chainable;
    }
}
