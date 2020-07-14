import { globalConfig } from "../../core/config";
import { BaseItem, enumItemType } from "../base_item";
import { enumColorMixingResults, enumInvertedColors } from "../colors";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { ColorItem } from "../items/color_item";
import { ShapeItem } from "../items/shape_item";

export class ItemProcessorSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [ItemProcessorComponent]);
    }

    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];

            const processorComp = entity.components.ItemProcessor;
            const ejectorComp = entity.components.ItemEjector;

            // First of all, process the current recipe
            processorComp.secondsUntilEject = Math.max(
                0,
                processorComp.secondsUntilEject - this.root.dynamicTickrate.deltaSeconds
            );

            if (G_IS_DEV && globalConfig.debug.instantProcessors) {
                processorComp.secondsUntilEject = 0;
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
                            slot = ejectorComp.getFirstFreeSlot(entity.layer);
                        }
                    } else {
                        // We can eject on any slot
                        slot = ejectorComp.getFirstFreeSlot(entity.layer);
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
                    const energyConsumerComp = entity.components.EnergyConsumer;
                    if (energyConsumerComp) {
                        // Check if we have enough energy
                        if (energyConsumerComp.tryStartNextCharge()) {
                            this.startNewCharge(entity);
                        }
                    } else {
                        // No further checks required
                        this.startNewCharge(entity);
                    }
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

        // Whether to track the production towards the analytics
        let trackProduction = true;

        // DO SOME MAGIC

        switch (processorComp.type) {
            // SPLITTER
            case enumItemProcessorTypes.splitterWires:
            case enumItemProcessorTypes.splitter: {
                trackProduction = false;
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

                const cutDefinitions = this.root.shapeDefinitionMgr.shapeActionCutHalf(inputDefinition);

                for (let i = 0; i < cutDefinitions.length; ++i) {
                    const definition = cutDefinitions[i];
                    if (!definition.isEntirelyEmpty()) {
                        outItems.push({
                            item: new ShapeItem(definition),
                            requiredSlot: i,
                        });
                    }
                }

                break;
            }

            // CUTTER (Quad)
            case enumItemProcessorTypes.cutterQuad: {
                const inputItem = /** @type {ShapeItem} */ (items[0].item);
                assert(inputItem instanceof ShapeItem, "Input for cut is not a shape");
                const inputDefinition = inputItem.definition;

                const cutDefinitions = this.root.shapeDefinitionMgr.shapeActionCutQuad(inputDefinition);

                for (let i = 0; i < cutDefinitions.length; ++i) {
                    const definition = cutDefinitions[i];
                    if (!definition.isEntirelyEmpty()) {
                        outItems.push({
                            item: new ShapeItem(definition),
                            requiredSlot: i,
                        });
                    }
                }

                break;
            }

            // ROTATER
            case enumItemProcessorTypes.rotater: {
                const inputItem = /** @type {ShapeItem} */ (items[0].item);
                assert(inputItem instanceof ShapeItem, "Input for rotation is not a shape");
                const inputDefinition = inputItem.definition;

                const rotatedDefinition = this.root.shapeDefinitionMgr.shapeActionRotateCW(inputDefinition);
                outItems.push({
                    item: new ShapeItem(rotatedDefinition),
                });
                break;
            }

            // ROTATER (CCW)
            case enumItemProcessorTypes.rotaterCCW: {
                const inputItem = /** @type {ShapeItem} */ (items[0].item);
                assert(inputItem instanceof ShapeItem, "Input for rotation is not a shape");
                const inputDefinition = inputItem.definition;

                const rotatedDefinition = this.root.shapeDefinitionMgr.shapeActionRotateCCW(inputDefinition);
                outItems.push({
                    item: new ShapeItem(rotatedDefinition),
                });
                break;
            }

            // ROTATER (FL)
            case enumItemProcessorTypes.rotaterFL: {
                const inputItem = /** @type {ShapeItem} */ (items[0].item);
                assert(inputItem instanceof ShapeItem, "Input for rotation is not a shape");
                const inputDefinition = inputItem.definition;

                const rotatedDefinition = this.root.shapeDefinitionMgr.shapeActionRotateFL(inputDefinition);
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

            // PAINTER (QUAD)

            case enumItemProcessorTypes.painterQuad: {
                const shapeItem = /** @type {ShapeItem} */ (itemsBySlot[0].item);
                const colorItem1 = /** @type {ColorItem} */ (itemsBySlot[1].item);
                const colorItem2 = /** @type {ColorItem} */ (itemsBySlot[2].item);
                const colorItem3 = /** @type {ColorItem} */ (itemsBySlot[3].item);
                const colorItem4 = /** @type {ColorItem} */ (itemsBySlot[4].item);

                assert(shapeItem instanceof ShapeItem, "Input for painter is not a shape");
                assert(colorItem1 instanceof ColorItem, "Input for painter is not a color");
                assert(colorItem2 instanceof ColorItem, "Input for painter is not a color");
                assert(colorItem3 instanceof ColorItem, "Input for painter is not a color");
                assert(colorItem4 instanceof ColorItem, "Input for painter is not a color");

                const colorizedDefinition = this.root.shapeDefinitionMgr.shapeActionPaintWith4Colors(
                    shapeItem.definition,
                    [colorItem2.color, colorItem3.color, colorItem4.color, colorItem1.color]
                );

                outItems.push({
                    item: new ShapeItem(colorizedDefinition),
                });

                break;
            }

            // HUB

            case enumItemProcessorTypes.hub: {
                trackProduction = false;

                const hubComponent = entity.components.Hub;
                assert(hubComponent, "Hub item processor has no hub component");

                for (let i = 0; i < items.length; ++i) {
                    const shapeItem = /** @type {ShapeItem} */ (items[i].item);
                    hubComponent.queueShapeDefinition(shapeItem.definition);
                }

                break;
            }

            // ADVANCED PROCESSING

            case enumItemProcessorTypes.advancedProcessor: {
                const item = items[0].item;

                if (item.getItemType() === enumItemType.color) {
                    const colorItem = /** @type {ColorItem} */ (items[0].item);
                    const newColor = enumInvertedColors[colorItem.color];
                    outItems.push({
                        item: new ColorItem(newColor),
                        requiredSlot: 0,
                    });
                } else if (item.getItemType() === enumItemType.shape) {
                    const shapeItem = /** @type {ShapeItem} */ (items[0].item);
                    const newItem = this.root.shapeDefinitionMgr.shapeActionInvertColors(
                        shapeItem.definition
                    );

                    outItems.push({
                        item: new ShapeItem(newItem),
                        requiredSlot: 0,
                    });
                } else {
                    assertAlways(false, "Bad item type: " + item.getItemType() + " for advanced processor.");
                }

                break;
            }

            default:
                assertAlways(false, "Unkown item processor type: " + processorComp.type);
        }

        // Track produced items
        if (trackProduction) {
            for (let i = 0; i < outItems.length; ++i) {
                this.root.signals.itemProduced.dispatch(outItems[i].item);
            }
        }

        processorComp.itemsToEject = outItems;
    }
}
