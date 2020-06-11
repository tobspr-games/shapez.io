import { Loader } from "../../core/loader";
import { enumDirection, Vector, enumAngleToDirection, enumDirectionToVector } from "../../core/vector";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumUndergroundBeltMode, UndergroundBeltComponent } from "../components/underground_belt";
import { Entity } from "../entity";
import { MetaBuilding, defaultBuildingVariant } from "../meta_building";
import { GameRoot } from "../root";
import { globalConfig } from "../../core/config";
import { enumHubGoalRewards } from "../tutorial_goals";
import { formatItemsPerSecond } from "../../core/utils";
import { T } from "../../translations";

/** @enum {string} */
export const arrayUndergroundRotationVariantToMode = [
    enumUndergroundBeltMode.sender,
    enumUndergroundBeltMode.receiver,
];

/** @enum {string} */
export const enumUndergroundBeltVariants = { tier2: "tier2" };

export const enumUndergroundBeltVariantToTier = {
    [defaultBuildingVariant]: 0,
    [enumUndergroundBeltVariants.tier2]: 1,
};

export class MetaUndergroundBeltBuilding extends MetaBuilding {
    constructor() {
        super("underground_belt");
    }

    getSilhouetteColor() {
        return "#555";
    }

    getFlipOrientationAfterPlacement() {
        return true;
    }

    getStayInPlacementMode() {
        return true;
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        const rangeTiles =
            globalConfig.undergroundBeltMaxTilesByTier[enumUndergroundBeltVariantToTier[variant]];

        const beltSpeed = root.hubGoals.getUndergroundBeltBaseSpeed();
        return [
            [
                T.ingame.buildingPlacement.infoTexts.range,
                T.ingame.buildingPlacement.infoTexts.tiles.replace("<x>", "" + rangeTiles),
            ],
            [T.ingame.buildingPlacement.infoTexts.speed, formatItemsPerSecond(beltSpeed)],
        ];
    }

    /**
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_underground_belt_tier_2)) {
            return [defaultBuildingVariant, enumUndergroundBeltVariants.tier2];
        }
        return super.getAvailableVariants(root);
    }

    getPreviewSprite(rotationVariant, variant) {
        let suffix = "";
        if (variant !== defaultBuildingVariant) {
            suffix = "-" + variant;
        }

        switch (arrayUndergroundRotationVariantToMode[rotationVariant]) {
            case enumUndergroundBeltMode.sender:
                return Loader.getSprite("sprites/buildings/underground_belt_entry" + suffix + ".png");
            case enumUndergroundBeltMode.receiver:
                return Loader.getSprite("sprites/buildings/underground_belt_exit" + suffix + ".png");
            default:
                assertAlways(false, "Invalid rotation variant");
        }
    }

    getBlueprintSprite(rotationVariant, variant) {
        let suffix = "";
        if (variant !== defaultBuildingVariant) {
            suffix = "-" + variant;
        }

        switch (arrayUndergroundRotationVariantToMode[rotationVariant]) {
            case enumUndergroundBeltMode.sender:
                return Loader.getSprite("sprites/blueprints/underground_belt_entry" + suffix + ".png");
            case enumUndergroundBeltMode.receiver:
                return Loader.getSprite("sprites/blueprints/underground_belt_exit" + suffix + ".png");
            default:
                assertAlways(false, "Invalid rotation variant");
        }
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_tunnel);
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        // Required, since the item processor needs this.
        entity.addComponent(
            new ItemEjectorComponent({
                slots: [],
            })
        );

        entity.addComponent(new UndergroundBeltComponent({}));
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [],
            })
        );
    }

    /**
     * @param {GameRoot} root
     * @param {Vector} tile
     * @param {number} rotation
     * @param {string} variant
     * @return {{ rotation: number, rotationVariant: number, connectedEntities?: Array<Entity> }}
     */
    computeOptimalDirectionAndRotationVariantAtTile(root, tile, rotation, variant) {
        const searchDirection = enumAngleToDirection[rotation];
        const searchVector = enumDirectionToVector[searchDirection];
        const tier = enumUndergroundBeltVariantToTier[variant];

        const targetRotation = (rotation + 180) % 360;
        const targetSenderRotation = rotation;

        for (
            let searchOffset = 1;
            searchOffset <= globalConfig.undergroundBeltMaxTilesByTier[tier];
            ++searchOffset
        ) {
            tile = tile.addScalars(searchVector.x, searchVector.y);

            const contents = root.map.getTileContent(tile);
            if (contents) {
                const undergroundComp = contents.components.UndergroundBelt;
                if (undergroundComp && undergroundComp.tier === tier) {
                    const staticComp = contents.components.StaticMapEntity;
                    if (staticComp.rotation === targetRotation) {
                        if (undergroundComp.mode !== enumUndergroundBeltMode.sender) {
                            // If we encounter an underground receiver on our way which is also faced in our direction, we don't accept that
                            break;
                        }
                        return {
                            rotation: targetRotation,
                            rotationVariant: 1,
                            connectedEntities: [contents],
                        };
                    } else if (staticComp.rotation === targetSenderRotation) {
                        // Draw connections to receivers
                        if (undergroundComp.mode === enumUndergroundBeltMode.receiver) {
                            return {
                                rotation: rotation,
                                rotationVariant: 0,
                                connectedEntities: [contents],
                            };
                        } else {
                            break;
                        }
                    }
                }
            }
        }

        return {
            rotation,
            rotationVariant: 0,
        };
    }

    /**
     *
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        entity.components.UndergroundBelt.tier = enumUndergroundBeltVariantToTier[variant];
        entity.components.StaticMapEntity.spriteKey = this.getPreviewSprite(
            rotationVariant,
            variant
        ).spriteName;

        switch (arrayUndergroundRotationVariantToMode[rotationVariant]) {
            case enumUndergroundBeltMode.sender: {
                entity.components.UndergroundBelt.mode = enumUndergroundBeltMode.sender;
                entity.components.ItemEjector.setSlots([]);
                entity.components.ItemAcceptor.setSlots([
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.bottom],
                    },
                ]);
                return;
            }
            case enumUndergroundBeltMode.receiver: {
                entity.components.UndergroundBelt.mode = enumUndergroundBeltMode.receiver;
                entity.components.ItemAcceptor.setSlots([]);
                entity.components.ItemEjector.setSlots([
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.top,
                    },
                ]);
                return;
            }
            default:
                assertAlways(false, "Invalid rotation variant");
        }
    }
}
