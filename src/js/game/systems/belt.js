import { Math_radians, Math_min } from "../../core/builtins";
import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { Loader } from "../../core/loader";
import { AtlasSprite } from "../../core/sprites";
import { BeltComponent } from "../components/belt";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { enumDirection, enumDirectionToVector, Vector } from "../../core/vector";
import { MapChunkView } from "../map_chunk_view";
import { gMetaBuildingRegistry } from "../../core/global_registries";
import { MetaBeltBaseBuilding } from "../buildings/belt_base";
import { defaultBuildingVariant } from "../meta_building";
import { GameRoot } from "../root";

const BELT_ANIM_COUNT = 6;

export class BeltSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [BeltComponent]);
        /**
         * @type {Object.<enumDirection, Array<AtlasSprite>>}
         */
        this.beltSprites = {
            [enumDirection.top]: Loader.getSprite("sprites/belt/forward_0.png"),
            [enumDirection.left]: Loader.getSprite("sprites/belt/left_0.png"),
            [enumDirection.right]: Loader.getSprite("sprites/belt/right_0.png"),
        };
        /**
         * @type {Object.<enumDirection, Array<AtlasSprite>>}
         */
        this.beltAnimations = {
            [enumDirection.top]: [
                Loader.getSprite("sprites/belt/forward_0.png"),
                Loader.getSprite("sprites/belt/forward_1.png"),
                Loader.getSprite("sprites/belt/forward_2.png"),
                Loader.getSprite("sprites/belt/forward_3.png"),
                Loader.getSprite("sprites/belt/forward_4.png"),
                Loader.getSprite("sprites/belt/forward_5.png"),
            ],
            [enumDirection.left]: [
                Loader.getSprite("sprites/belt/left_0.png"),
                Loader.getSprite("sprites/belt/left_1.png"),
                Loader.getSprite("sprites/belt/left_2.png"),
                Loader.getSprite("sprites/belt/left_3.png"),
                Loader.getSprite("sprites/belt/left_4.png"),
                Loader.getSprite("sprites/belt/left_5.png"),
            ],
            [enumDirection.right]: [
                Loader.getSprite("sprites/belt/right_0.png"),
                Loader.getSprite("sprites/belt/right_1.png"),
                Loader.getSprite("sprites/belt/right_2.png"),
                Loader.getSprite("sprites/belt/right_3.png"),
                Loader.getSprite("sprites/belt/right_4.png"),
                Loader.getSprite("sprites/belt/right_5.png"),
            ],
        };

        this.root.signals.entityAdded.add(this.updateSurroundingBeltPlacement, this);
        this.root.signals.entityDestroyed.add(this.updateSurroundingBeltPlacement, this);
    }

    /**
     * Updates the belt placement after an entity has been added / deleted
     * @param {Entity} entity
     */
    updateSurroundingBeltPlacement(entity) {
        if (!this.root.gameInitialized) {
            return;
        }

        const staticComp = entity.components.StaticMapEntity;
        if (!staticComp) {
            return;
        }

        const metaBelt = gMetaBuildingRegistry.findByClass(MetaBeltBaseBuilding);

        // Compute affected area
        const originalRect = staticComp.getTileSpaceBounds();
        const affectedArea = originalRect.expandedInAllDirections(1);
        for (let x = affectedArea.x; x < affectedArea.right(); ++x) {
            for (let y = affectedArea.y; y < affectedArea.bottom(); ++y) {
                if (!originalRect.containsPoint(x, y)) {
                    const targetEntity = this.root.map.getTileContentXY(x, y);
                    if (targetEntity) {
                        const targetBeltComp = targetEntity.components.Belt;
                        if (targetBeltComp) {
                            const targetStaticComp = targetEntity.components.StaticMapEntity;
                            const {
                                rotation,
                                rotationVariant,
                            } = metaBelt.computeOptimalDirectionAndRotationVariantAtTile(
                                this.root,
                                new Vector(x, y),
                                targetStaticComp.originalRotation,
                                defaultBuildingVariant
                            );
                            targetStaticComp.rotation = rotation;
                            metaBelt.updateVariants(targetEntity, rotationVariant, defaultBuildingVariant);
                        }
                    }
                }
            }
        }
    }

    draw(parameters) {
        this.forEachMatchingEntityOnScreen(parameters, this.drawEntityItems.bind(this));
    }

    /**
     * Updates a given entity
     * @param {Entity} entity
     * @param {Set} processedEntities
     */
    updateBelt(entity, processedEntities) {
        if (processedEntities.has(entity.uid)) {
            return;
        }

        processedEntities.add(entity.uid);

        // Divide by item spacing on belts since we use throughput and not speed
        const beltSpeed =
            this.root.hubGoals.getBeltBaseSpeed() *
            this.root.dynamicTickrate.deltaSeconds *
            globalConfig.itemSpacingOnBelts;
        const beltComp = entity.components.Belt;
        const staticComp = entity.components.StaticMapEntity;
        const items = beltComp.sortedItems;

        if (items.length === 0) {
            // Fast out for performance
            return;
        }

        const ejectorComp = entity.components.ItemEjector;
        let maxProgress = 1;

        // When ejecting, we can not go further than the item spacing since it
        // will be on the corner
        if (ejectorComp.isAnySlotEjecting()) {
            maxProgress = 1 - globalConfig.itemSpacingOnBelts;
        } else {
            // Find follow up belt to make sure we don't clash items
            const followUpDirection = staticComp.localDirectionToWorld(beltComp.direction);
            const followUpVector = enumDirectionToVector[followUpDirection];

            const followUpTile = staticComp.origin.add(followUpVector);
            const followUpEntity = this.root.map.getTileContent(followUpTile);

            if (followUpEntity) {
                const followUpBeltComp = followUpEntity.components.Belt;
                if (followUpBeltComp) {
                    // Update follow up belt first
                    this.updateBelt(followUpEntity, processedEntities);

                    const spacingOnBelt = followUpBeltComp.getDistanceToFirstItemCenter();
                    maxProgress = Math_min(1, 1 - globalConfig.itemSpacingOnBelts + spacingOnBelt);
                }
            }
        }

        let speedMultiplier = 1;
        if (beltComp.direction !== enumDirection.top) {
            // Shaped belts are longer, thus being quicker
            speedMultiplier = 1.41;
        }

        for (let itemIndex = items.length - 1; itemIndex >= 0; --itemIndex) {
            const itemAndProgress = items[itemIndex];

            const newProgress = itemAndProgress[0] + speedMultiplier * beltSpeed;
            if (newProgress >= 1.0) {
                // Try to give this item to a new belt
                const freeSlot = ejectorComp.getFirstFreeSlot();

                if (freeSlot === null) {
                    // So, we don't have a free slot - damned!
                    itemAndProgress[0] = 1.0;
                    maxProgress = 1 - globalConfig.itemSpacingOnBelts;
                } else {
                    // We got a free slot, remove this item and keep it on the ejector slot
                    if (!ejectorComp.tryEject(freeSlot, itemAndProgress[1])) {
                        assert(false, "Ejection failed");
                    }
                    items.splice(itemIndex, 1);
                    maxProgress = 1;
                }
            } else {
                itemAndProgress[0] = Math_min(newProgress, maxProgress);
                maxProgress = itemAndProgress[0] - globalConfig.itemSpacingOnBelts;
            }
        }
    }

    update() {
        const processedEntities = new Set();

        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            this.updateBelt(entity, processedEntities);
        }
    }

    /**
     *
     * @param {DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {
        if (parameters.zoomLevel < globalConfig.mapChunkOverviewMinZoom) {
            return;
            1;
        }

        const speedMultiplier = this.root.hubGoals.getBeltBaseSpeed();

        // SYNC with systems/item_acceptor.js:drawEntityUnderlays!
        // 126 / 42 is the exact animation speed of the png animation
        const animationIndex = Math.floor(
            ((this.root.time.now() * speedMultiplier * BELT_ANIM_COUNT * 126) / 42) *
                globalConfig.itemSpacingOnBelts
        );
        const contents = chunk.contents;
        for (let y = 0; y < globalConfig.mapChunkSize; ++y) {
            for (let x = 0; x < globalConfig.mapChunkSize; ++x) {
                const entity = contents[x][y];

                if (entity && entity.components.Belt) {
                    const direction = entity.components.Belt.direction;
                    const sprite = this.beltAnimations[direction][animationIndex % BELT_ANIM_COUNT];

                    entity.components.StaticMapEntity.drawSpriteOnFullEntityBounds(
                        parameters,
                        sprite,
                        0,
                        false
                    );
                }
            }
        }
        1;
    }

    /**
     * @param {DrawParameters} parameters
     * @param {Entity} entity
     */
    drawEntityItems(parameters, entity) {
        const beltComp = entity.components.Belt;
        const staticComp = entity.components.StaticMapEntity;

        const items = beltComp.sortedItems;

        if (items.length === 0) {
            // Fast out for performance
            return;
        }

        for (let i = 0; i < items.length; ++i) {
            const itemAndProgress = items[i];

            // Nice would be const [pos, item] = itemAndPos;  but that gets polyfilled and is super slow then
            const progress = itemAndProgress[0];
            const item = itemAndProgress[1];

            const position = staticComp.applyRotationToVector(beltComp.transformBeltToLocalSpace(progress));

            item.draw(
                (staticComp.origin.x + position.x + 0.5) * globalConfig.tileSize,
                (staticComp.origin.y + position.y + 0.5) * globalConfig.tileSize,
                parameters
            );
        }
    }
}
