import { globalConfig } from "../../core/config";
import { BaseItem } from "../base_item";
import { enumColorMixingResults } from "../colors";
import { ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { BOOL_TRUE_SINGLETON } from "../items/boolean_item";
import { ColorItem, COLOR_ITEM_SINGLETONS } from "../items/color_item";
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

        // Whether to track the production towards the analytics
        let trackProduction = true;

        // DO SOME MAGIC

        switch (processorComp.type) {
            // SPLITTER
            case "splitterWires":
            case "splitter": {
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
            case "cutter": {
                const inputItem = /** @type {ShapeItem} */ (items[0].item);
                assert(inputItem instanceof ShapeItem, "Input for cut is not a shape");
                const inputDefinition = inputItem.definition;

                const cutDefinitions = this.root.shapeDefinitionMgr.shapeActionCutHalf(inputDefinition);

                for (let i = 0; i < cutDefinitions.length; ++i) {
                    const definition = cutDefinitions[i];
                    if (!definition.isEntirelyEmpty()) {
                        outItems.push({
                            item: this.root.shapeDefinitionMgr.getShapeItemFromDefinition(definition),
                            requiredSlot: i,
                        });
                    }
                }

                break;
            }

            // CUTTER (Quad)
            case "cutterQuad": {
                const inputItem = /** @type {ShapeItem} */ (items[0].item);
                assert(inputItem instanceof ShapeItem, "Input for cut is not a shape");
                const inputDefinition = inputItem.definition;

                const cutDefinitions = this.root.shapeDefinitionMgr.shapeActionCutQuad(inputDefinition);

                for (let i = 0; i < cutDefinitions.length; ++i) {
                    const definition = cutDefinitions[i];
                    if (!definition.isEntirelyEmpty()) {
                        outItems.push({
                            item: this.root.shapeDefinitionMgr.getShapeItemFromDefinition(definition),
                            requiredSlot: i,
                        });
                    }
                }

                break;
            }

            // ROTATER
            case "rotater": {
                const inputItem = /** @type {ShapeItem} */ (items[0].item);
                assert(inputItem instanceof ShapeItem, "Input for rotation is not a shape");
                const inputDefinition = inputItem.definition;

                const rotatedDefinition = this.root.shapeDefinitionMgr.shapeActionRotateCW(inputDefinition);
                outItems.push({
                    item: this.root.shapeDefinitionMgr.getShapeItemFromDefinition(rotatedDefinition),
                });
                break;
            }

            // ROTATER (CCW)
            case "rotaterCCW": {
                const inputItem = /** @type {ShapeItem} */ (items[0].item);
                assert(inputItem instanceof ShapeItem, "Input for rotation is not a shape");
                const inputDefinition = inputItem.definition;

                const rotatedDefinition = this.root.shapeDefinitionMgr.shapeActionRotateCCW(inputDefinition);
                outItems.push({
                    item: this.root.shapeDefinitionMgr.getShapeItemFromDefinition(rotatedDefinition),
                });
                break;
            }

            // ROTATER (FL)
            case "rotaterFL": {
                const inputItem = /** @type {ShapeItem} */ (items[0].item);
                assert(inputItem instanceof ShapeItem, "Input for rotation is not a shape");
                const inputDefinition = inputItem.definition;

                const rotatedDefinition = this.root.shapeDefinitionMgr.shapeActionRotateFL(inputDefinition);
                outItems.push({
                    item: this.root.shapeDefinitionMgr.getShapeItemFromDefinition(rotatedDefinition),
                });
                break;
            }

            // STACKER

            case "stacker": {
                const lowerItem = /** @type {ShapeItem} */ (itemsBySlot[0].item);
                const upperItem = /** @type {ShapeItem} */ (itemsBySlot[1].item);

                assert(lowerItem instanceof ShapeItem, "Input for lower stack is not a shape");
                assert(upperItem instanceof ShapeItem, "Input for upper stack is not a shape");

                const stackedDefinition = this.root.shapeDefinitionMgr.shapeActionStack(
                    lowerItem.definition,
                    upperItem.definition
                );
                outItems.push({
                    item: this.root.shapeDefinitionMgr.getShapeItemFromDefinition(stackedDefinition),
                });
                break;
            }

            // TRASH

            case "trash": {
                // Well this one is easy .. simply do nothing with the item
                break;
            }

            // MIXER

            case "mixer": {
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
                    item: COLOR_ITEM_SINGLETONS[resultColor],
                });

                break;
            }

            // PAINTER

            case "painter": {
                const shapeItem = /** @type {ShapeItem} */ (itemsBySlot[0].item);
                const colorItem = /** @type {ColorItem} */ (itemsBySlot[1].item);

                const colorizedDefinition = this.root.shapeDefinitionMgr.shapeActionPaintWith(
                    shapeItem.definition,
                    colorItem.color
                );

                outItems.push({
                    item: this.root.shapeDefinitionMgr.getShapeItemFromDefinition(colorizedDefinition),
                });

                break;
            }

            // PAINTER (DOUBLE)

            case "painterDouble": {
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
                    item: this.root.shapeDefinitionMgr.getShapeItemFromDefinition(colorizedDefinition1),
                });

                outItems.push({
                    item: this.root.shapeDefinitionMgr.getShapeItemFromDefinition(colorizedDefinition2),
                });

                break;
            }

            // PAINTER (QUAD)

            case "painterQuad": {
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
                    item: this.root.shapeDefinitionMgr.getShapeItemFromDefinition(colorizedDefinition),
                });

                break;
            }

            // FILTER
            case "filter": {
                // TODO
                trackProduction = false;

                const item = itemsBySlot[0].item;

                const network = entity.components.WiredPins.slots[0].linkedNetwork;
                if (!network || !network.currentValue) {
                    outItems.push({
                        item,
                        requiredSlot: 1,
                    });
                    break;
                }

                const value = network.currentValue;
                if (value.equals(BOOL_TRUE_SINGLETON) || value.equals(item)) {
                    outItems.push({
                        item,
                        requiredSlot: 0,
                    });
                } else {
                    outItems.push({
                        item,
                        requiredSlot: 1,
                    });
                }

                break;
            }

            // HUB

            case "hub": {
                trackProduction = false;

                const hubComponent = entity.components.Hub;
                assert(hubComponent, "Hub item processor has no hub component");

                for (let i = 0; i < items.length; ++i) {
                    const item = /** @type {ShapeItem} */ (items[i].item);
                    this.root.hubGoals.handleDefinitionDelivered(item.definition);
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
