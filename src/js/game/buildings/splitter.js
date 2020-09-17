import { enumDirection, Vector } from "../../core/vector";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { MetaBuilding, defaultBuildingVariant, MetaBuildingVariant } from "../meta_building";
import { GameRoot } from "../root";
import { enumHubGoalRewards } from "../tutorial_goals";
import { T } from "../../translations";
import { formatItemsPerSecond } from "../../core/utils";
import { BeltUnderlaysComponent } from "../components/belt_underlays";

/** @enum {string} */
export const enumSplitterVariants = {
    compact: "compact",
    compactInverse: "compact-inverse",
    compactMerge: "compact-merge",
    compactMergeInverse: "compact-merge-inverse",
};

export class MetaSplitterBuilding extends MetaBuilding {
    constructor() {
        super("splitter");
    }

    getSilhouetteColor() {
        return "#444";
    }

    /**
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        let variants = [DefaultSplitterVariant];

        if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_splitter_compact)) {
            variants.push(CompactSplitterVariant, CompactInverseSplitterVariant);
        }

        if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_merger_compact)) {
            variants.push(CompactMergerVariant, CompactInverseMergerVariant);
        }

        return variants;
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_splitter);
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [], // set later
            })
        );

        entity.addComponent(
            new ItemProcessorComponent({
                inputsPerCharge: 1,
                processorType: enumItemProcessorTypes.splitter,
            })
        );

        entity.addComponent(
            new ItemEjectorComponent({
                slots: [], // set later
            })
        );

        entity.addComponent(new BeltUnderlaysComponent({ underlays: [] }));
    }
}

export class DefaultSplitterVariant extends MetaBuildingVariant {
    static getId() {
        return defaultBuildingVariant;
    }

    static getDimensions() {
        return new Vector(2, 1);
    }

    /**
     * @param {GameRoot} root
     * @returns {Array<[string, string]>}
     */
    static getAdditionalStatistics(root) {
        const speed = root.hubGoals.getProcessorBaseSpeed(enumItemProcessorTypes.splitter);
        return [[T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(speed)]];
    }

    /**
     * @param {Entity} entity
     * @param {number} rotationVariant
     */
    static updateEntityComponents(entity, rotationVariant) {
        entity.components.ItemAcceptor.setSlots([
            {
                pos: new Vector(0, 0),
                directions: [enumDirection.bottom],
            },
            {
                pos: new Vector(1, 0),
                directions: [enumDirection.bottom],
            },
        ]);

        entity.components.ItemEjector.setSlots([
            { pos: new Vector(0, 0), direction: enumDirection.top },
            { pos: new Vector(1, 0), direction: enumDirection.top },
        ]);

        entity.components.BeltUnderlays.underlays = [
            { pos: new Vector(0, 0), direction: enumDirection.top },
            { pos: new Vector(1, 0), direction: enumDirection.top },
        ];
    }
}

export class CompactSplitterVariant extends DefaultSplitterVariant {
    static getId() {
        return enumSplitterVariants.compact;
    }

    static getDimensions() {
        return new Vector(1, 1);
    }

    /**
     * @param {Entity} entity
     * @param {number} rotationVariant
     */
    static updateEntityComponents(entity, rotationVariant) {
        entity.components.ItemAcceptor.setSlots([
            {
                pos: new Vector(0, 0),
                directions: [enumDirection.bottom],
            },
            {
                pos: new Vector(0, 0),
                directions: [enumDirection.right],
            },
        ]);

        entity.components.ItemEjector.setSlots([{ pos: new Vector(0, 0), direction: enumDirection.top }]);

        entity.components.BeltUnderlays.underlays = [{ pos: new Vector(0, 0), direction: enumDirection.top }];
    }
}

export class CompactInverseSplitterVariant extends CompactSplitterVariant {
    static getId() {
        return enumSplitterVariants.compactInverse;
    }

    /**
     * @param {Entity} entity
     * @param {number} rotationVariant
     */
    static updateEntityComponents(entity, rotationVariant) {
        entity.components.ItemAcceptor.setSlots([
            {
                pos: new Vector(0, 0),
                directions: [enumDirection.bottom],
            },
            {
                pos: new Vector(0, 0),
                directions: [enumDirection.left],
            },
        ]);

        entity.components.ItemEjector.setSlots([{ pos: new Vector(0, 0), direction: enumDirection.top }]);

        entity.components.BeltUnderlays.underlays = [{ pos: new Vector(0, 0), direction: enumDirection.top }];
    }
}

export class CompactMergerVariant extends CompactSplitterVariant {
    static getId() {
        return enumSplitterVariants.compactMerge;
    }

    /**
     * @param {Entity} entity
     * @param {number} rotationVariant
     */
    static updateEntityComponents(entity, rotationVariant) {
        entity.components.ItemAcceptor.setSlots([
            {
                pos: new Vector(0, 0),
                directions: [enumDirection.bottom],
            },
        ]);

        entity.components.ItemEjector.setSlots([
            {
                pos: new Vector(0, 0),
                direction: enumDirection.top,
            },
            {
                pos: new Vector(0, 0),
                direction: enumDirection.right,
            },
        ]);

        entity.components.BeltUnderlays.underlays = [{ pos: new Vector(0, 0), direction: enumDirection.top }];
    }
}

export class CompactInverseMergerVariant extends CompactSplitterVariant {
    static getId() {
        return enumSplitterVariants.compactMergeInverse;
    }

    /**
     * @param {Entity} entity
     * @param {number} rotationVariant
     */
    static updateEntityComponents(entity, rotationVariant) {
        entity.components.ItemAcceptor.setSlots([
            {
                pos: new Vector(0, 0),
                directions: [enumDirection.bottom],
            },
        ]);

        entity.components.ItemEjector.setSlots([
            {
                pos: new Vector(0, 0),
                direction: enumDirection.top,
            },
            {
                pos: new Vector(0, 0),
                direction: enumDirection.left,
            },
        ]);

        entity.components.BeltUnderlays.underlays = [{ pos: new Vector(0, 0), direction: enumDirection.top }];
    }
}
