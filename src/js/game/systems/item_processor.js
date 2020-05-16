import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { Loader } from "../../core/loader";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { ItemProcessorComponent, enumItemProcessorTypes } from "../components/item_processor";
import { Math_max, Math_radians } from "../../core/builtins";
import { BaseItem } from "../base_item";
import { ShapeItem } from "../items/shape_item";
import { enumDirectionToVector, enumDirection, enumDirectionToAngle } from "../../core/vector";
import { ColorItem } from "../items/color_item";
import { enumColorMixingResults } from "../colors";
import { drawRotatedSprite } from "../../core/draw_utils";

export class ItemProcessorSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [ItemProcessorComponent]);

        this.underlayBeltSprites = [
            Loader.getSprite("sprites/belt/forward_0.png"),
            Loader.getSprite("sprites/belt/forward_1.png"),
            Loader.getSprite("sprites/belt/forward_2.png"),
            Loader.getSprite("sprites/belt/forward_3.png"),
            Loader.getSprite("sprites/belt/forward_4.png"),
            Loader.getSprite("sprites/belt/forward_5.png"),
        ];
    }

    draw(parameters) {
        this.forEachMatchingEntityOnScreen(parameters, this.drawEntity.bind(this));
    }

    drawUnderlays(parameters) {
        this.forEachMatchingEntityOnScreen(parameters, this.drawEntityUnderlays.bind(this));
    }

    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];

            const processorComp = entity.components.ItemProcessor;
            const ejectorComp = entity.components.ItemEjector;

            // First of all, process the current recipe
            processorComp.secondsUntilEject = Math_max(
                0,
                processorComp.secondsUntilEject - globalConfig.physicsDeltaSeconds
            );

            // Also, process item consumption animations to avoid items popping from the belts
            for (let animIndex = 0; animIndex < processorComp.itemConsumptionAnimations.length; ++animIndex) {
                const anim = processorComp.itemConsumptionAnimations[animIndex];
                anim.animProgress +=
                    globalConfig.physicsDeltaSeconds * this.root.hubGoals.getBeltBaseSpeed() * 2;
                if (anim.animProgress > 1) {
                    processorComp.itemConsumptionAnimations.splice(animIndex, 1);
                    animIndex -= 1;
                }
            }

            // Check if we have any finished items we can eject
            if (
                processorComp.secondsUntilEject === 0 && // it was processed in time
                processorComp.itemsToEject.length > 0 // we have some items left to eject
            ) {
                for (let itemIndex = 0; itemIndex < processorComp.itemsToEject.length; ++itemIndex) {
                    const { item, requiredSlot, preferredSlot } = processorComp.itemsToEject[itemIndex];

                    let slot = null;
                    if (requiredSlot !== null && requiredSlot !== undefined) {
                        // We have a slot override, check if that is free
                        if (ejectorComp.canEjectOnSlot(requiredSlot)) {
                            slot = requiredSlot;
                        }
                    } else if (preferredSlot !== null && preferredSlot !== undefined) {
                        // We have a slot preference, try using it but otherwise use a free slot
                        if (ejectorComp.canEjectOnSlot(preferredSlot)) {
                            slot = preferredSlot;
                        } else {
                            slot = ejectorComp.getFirstFreeSlot();
                        }
                    } else {
                        // We can eject on any slot
                        slot = ejectorComp.getFirstFreeSlot();
                    }

                    if (slot !== null) {
                        // Alright, we can actually eject
                        if (!ejectorComp.tryEject(slot, item)) {
                            assert(false, "Failed to eject");
                        } else {
                            processorComp.itemsToEject.splice(itemIndex, 1);
                            itemIndex -= 1;
                        }
                    }
                }
            }

            // Check if we have an empty queue and can start a new charge
            if (processorComp.itemsToEject.length === 0) {
                if (processorComp.inputSlots.length >= processorComp.inputsPerCharge) {
                    this.startNewCharge(entity);
                }
            }
        }
    }

    /**
     * Starts a new charge for the entity
     * @param {Entity} entity
     */
    startNewCharge(entity) {
        const processorComp = entity.components.ItemProcessor;

        // First, take items
        const items = processorComp.inputSlots;
        processorComp.inputSlots = [];

        /** @type {Object.<string, { item: BaseItem, sourceSlot: number }>} */
        const itemsBySlot = {};
        for (let i = 0; i < items.length; ++i) {
            itemsBySlot[items[i].sourceSlot] = items[i];
        }

        const baseSpeed = this.root.hubGoals.getProcessorBaseSpeed(processorComp.type);
        processorComp.secondsUntilEject = 1 / baseSpeed;

        /** @type {Array<{item: BaseItem, requiredSlot?: number, preferredSlot?: number}>} */
        const outItems = [];

        // DO SOME MAGIC

        switch (processorComp.type) {
            // SPLITTER
            case enumItemProcessorTypes.splitter: {
                const availableSlots = entity.components.ItemEjector.slots.length;

                let nextSlot = processorComp.nextOutputSlot++ % availableSlots;
                for (let i = 0; i < items.length; ++i) {
                    outItems.push({
                        item: items[i].item,
                        preferredSlot: (nextSlot + i) % availableSlots,
                    });
                }
                break;
            }

            // CUTTER
            case enumItemProcessorTypes.cutter: {
                const inputItem = /** @type {ShapeItem} */ (items[0].item);
                assert(inputItem instanceof ShapeItem, "Input for cut is not a shape");
                const inputDefinition = inputItem.definition;

                const [cutDefinition1, cutDefinition2] = this.root.shapeDefinitionMgr.shapeActionCutHalf(
                    inputDefinition
                );

                if (!cutDefinition1.isEntirelyEmpty()) {
                    outItems.push({
                        item: new ShapeItem(cutDefinition1),
                        requiredSlot: 0,
                    });
                }

                if (!cutDefinition2.isEntirelyEmpty()) {
                    outItems.push({
                        item: new ShapeItem(cutDefinition2),
                        requiredSlot: 1,
                    });
                }

                break;
            }

            // ROTATER
            case enumItemProcessorTypes.rotater: {
                const inputItem = /** @type {ShapeItem} */ (items[0].item);
                assert(inputItem instanceof ShapeItem, "Input for cut is not a shape");
                const inputDefinition = inputItem.definition;

                const rotatedDefinition = this.root.shapeDefinitionMgr.shapeActionRotateCW(inputDefinition);
                outItems.push({
                    item: new ShapeItem(rotatedDefinition),
                });
                break;
            }

            // STACKER

            case enumItemProcessorTypes.stacker: {
                const lowerItem = /** @type {ShapeItem} */ (itemsBySlot[0].item);
                const upperItem = /** @type {ShapeItem} */ (itemsBySlot[1].item);

                assert(lowerItem instanceof ShapeItem, "Input for lower stack is not a shape");
                assert(upperItem instanceof ShapeItem, "Input for upper stack is not a shape");

                const stackedDefinition = this.root.shapeDefinitionMgr.shapeActionStack(
                    lowerItem.definition,
                    upperItem.definition
                );
                outItems.push({
                    item: new ShapeItem(stackedDefinition),
                });
                break;
            }

            // TRASH

            case enumItemProcessorTypes.trash: {
                // Well this one is easy .. simply do nothing with the item
                break;
            }

            // MIXER

            case enumItemProcessorTypes.mixer: {
                // Find both colors and combine them
                const item1 = /** @type {ColorItem} */ (items[0].item);
                const item2 = /** @type {ColorItem} */ (items[1].item);
                assert(item1 instanceof ColorItem, "Input for color mixer is not a color");
                assert(item2 instanceof ColorItem, "Input for color mixer is not a color");

                const color1 = item1.color;
                const color2 = item2.color;

                // Try finding mixer color, and if we can't mix it we simply return the same color
                const mixedColor = enumColorMixingResults[color1][color2];
                let resultColor = color1;
                if (mixedColor) {
                    resultColor = mixedColor;
                }
                outItems.push({
                    item: new ColorItem(resultColor),
                });

                break;
            }

            // PAINTER

            case enumItemProcessorTypes.painter: {
                const shapeItem = /** @type {ShapeItem} */ (itemsBySlot[0].item);
                const colorItem = /** @type {ColorItem} */ (itemsBySlot[1].item);

                const colorizedDefinition = this.root.shapeDefinitionMgr.shapeActionPaintWith(
                    shapeItem.definition,
                    colorItem.color
                );

                outItems.push({
                    item: new ShapeItem(colorizedDefinition),
                });

                break;
            }

            // PAINTER (DOUBLE)

            case enumItemProcessorTypes.painterDouble: {
                const shapeItem1 = /** @type {ShapeItem} */ (itemsBySlot[0].item);
                const shapeItem2 = /** @type {ShapeItem} */ (itemsBySlot[1].item);
                const colorItem = /** @type {ColorItem} */ (itemsBySlot[2].item);

                assert(shapeItem1 instanceof ShapeItem, "Input for painter is not a shape");
                assert(shapeItem2 instanceof ShapeItem, "Input for painter is not a shape");
                assert(colorItem instanceof ColorItem, "Input for painter is not a color");

                const colorizedDefinition1 = this.root.shapeDefinitionMgr.shapeActionPaintWith(
                    shapeItem1.definition,
                    colorItem.color
                );

                const colorizedDefinition2 = this.root.shapeDefinitionMgr.shapeActionPaintWith(
                    shapeItem2.definition,
                    colorItem.color
                );
                outItems.push({
                    item: new ShapeItem(colorizedDefinition1),
                });

                outItems.push({
                    item: new ShapeItem(colorizedDefinition2),
                });

                break;
            }

            // HUB

            case enumItemProcessorTypes.hub: {
                const shapeItem = /** @type {ShapeItem} */ (items[0].item);

                const hubComponent = entity.components.Hub;
                assert(hubComponent, "Hub item processor has no hub component");

                hubComponent.queueShapeDefinition(shapeItem.definition);
                break;
            }

            default:
                assertAlways(false, "Unkown item processor type: " + processorComp.type);
        }

        // Track produced items
        for (let i = 0; i < outItems.length; ++i) {
            this.root.signals.itemProduced.dispatch(outItems[i].item);
        }

        processorComp.itemsToEject = outItems;
    }

    /**
     * @param {DrawParameters} parameters
     * @param {Entity} entity
     */
    drawEntity(parameters, entity) {
        const staticComp = entity.components.StaticMapEntity;
        const processorComp = entity.components.ItemProcessor;
        const acceptorComp = entity.components.ItemAcceptor;

        for (let animIndex = 0; animIndex < processorComp.itemConsumptionAnimations.length; ++animIndex) {
            const { item, slotIndex, animProgress, direction } = processorComp.itemConsumptionAnimations[
                animIndex
            ];

            const slotData = acceptorComp.slots[slotIndex];
            const slotWorldPos = staticComp.applyRotationToVector(slotData.pos).add(staticComp.origin);

            const fadeOutDirection = enumDirectionToVector[staticComp.localDirectionToWorld(direction)];
            const finalTile = slotWorldPos.subScalars(
                fadeOutDirection.x * (animProgress / 2 - 0.5),
                fadeOutDirection.y * (animProgress / 2 - 0.5)
            );
            item.draw(
                (finalTile.x + 0.5) * globalConfig.tileSize,
                (finalTile.y + 0.5) * globalConfig.tileSize,
                parameters
            );
        }
    }
    /**
     * @param {DrawParameters} parameters
     * @param {Entity} entity
     */
    drawEntityUnderlays(parameters, entity) {
        const staticComp = entity.components.StaticMapEntity;
        const processorComp = entity.components.ItemProcessor;

        const underlays = processorComp.beltUnderlays;
        for (let i = 0; i < underlays.length; ++i) {
            const { pos, direction } = underlays[i];

            const transformedPos = staticComp.localTileToWorld(pos);
            const angle = enumDirectionToAngle[staticComp.localDirectionToWorld(direction)];

            // SYNC with systems/belt.js:drawSingleEntity!
            const animationIndex = Math.floor(
                (this.root.time.now() *
                    this.root.hubGoals.getBeltBaseSpeed() *
                    this.underlayBeltSprites.length *
                    126) /
                    42
            );

            drawRotatedSprite({
                parameters,
                sprite: this.underlayBeltSprites[animationIndex % this.underlayBeltSprites.length],
                x: (transformedPos.x + 0.5) * globalConfig.tileSize,
                y: (transformedPos.y + 0.5) * globalConfig.tileSize,
                angle: Math_radians(angle),
                size: globalConfig.tileSize,
            });
        }
    }
}
