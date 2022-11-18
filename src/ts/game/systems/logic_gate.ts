import { BaseItem } from "../base_item";
import { enumColors } from "../colors";
import { enumLogicGateType, LogicGateComponent } from "../components/logic_gate";
import { enumPinSlotType } from "../components/wired_pins";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { BOOL_FALSE_SINGLETON, BOOL_TRUE_SINGLETON, BooleanItem, isTruthyItem } from "../items/boolean_item";
import { ColorItem, COLOR_ITEM_SINGLETONS } from "../items/color_item";
import { ShapeItem } from "../items/shape_item";
import { ShapeDefinition } from "../shape_definition";
export class LogicGateSystem extends GameSystemWithFilter {
    public boundOperations = {
        [enumLogicGateType.and]: this.compute_AND.bind(this),
        [enumLogicGateType.not]: this.compute_NOT.bind(this),
        [enumLogicGateType.xor]: this.compute_XOR.bind(this),
        [enumLogicGateType.or]: this.compute_OR.bind(this),
        [enumLogicGateType.transistor]: this.compute_IF.bind(this),
        [enumLogicGateType.rotater]: this.compute_ROTATE.bind(this),
        [enumLogicGateType.analyzer]: this.compute_ANALYZE.bind(this),
        [enumLogicGateType.cutter]: this.compute_CUT.bind(this),
        [enumLogicGateType.unstacker]: this.compute_UNSTACK.bind(this),
        [enumLogicGateType.compare]: this.compute_COMPARE.bind(this),
        [enumLogicGateType.stacker]: this.compute_STACKER.bind(this),
        [enumLogicGateType.painter]: this.compute_PAINTER.bind(this),
    };

    constructor(root) {
        super(root, [LogicGateComponent]);
    }
    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const logicComp = entity.components.LogicGate;
            const slotComp = entity.components.WiredPins;
            const slotValues = [];
            // Store if any conflict was found
            let anyConflict = false;
            // Gather inputs from all connected networks
            for (let i = 0; i < slotComp.slots.length; ++i) {
                const slot = slotComp.slots[i];
                if (slot.type !== enumPinSlotType.logicalAcceptor) {
                    continue;
                }
                const network = slot.linkedNetwork;
                if (network) {
                    if (network.valueConflict) {
                        anyConflict = true;
                        break;
                    }
                    slotValues.push(network.currentValue);
                }
                else {
                    slotValues.push(null);
                }
            }
            // Handle conflicts
            if (anyConflict) {
                for (let i = 0; i < slotComp.slots.length; ++i) {
                    const slot = slotComp.slots[i];
                    if (slot.type !== enumPinSlotType.logicalEjector) {
                        continue;
                    }
                    slot.value = null;
                }
                continue;
            }
            // Compute actual result
            const result = this.boundOperations[logicComp.type](slotValues);
            if (Array.isArray(result)) {
                let resultIndex = 0;
                for (let i = 0; i < slotComp.slots.length; ++i) {
                    const slot = slotComp.slots[i];
                    if (slot.type !== enumPinSlotType.logicalEjector) {
                        continue;
                    }
                    slot.value = result[resultIndex++];
                }
            }
            else {
                // @TODO: For now we hardcode the value to always be slot 0
                assert(slotValues.length === slotComp.slots.length - 1, "Bad slot config, should have N acceptor slots and 1 ejector");
                assert(slotComp.slots[0].type === enumPinSlotType.logicalEjector, "Slot 0 should be ejector");
                slotComp.slots[0].value = result;
            }
        }
    }
    /**
     * {}
     */
    compute_AND(parameters: Array<BaseItem | null>): BaseItem {
        assert(parameters.length === 2, "bad parameter count for AND");
        return isTruthyItem(parameters[0]) && isTruthyItem(parameters[1])
            ? BOOL_TRUE_SINGLETON
            : BOOL_FALSE_SINGLETON;
    }
    /**
     * {}
     */
    compute_NOT(parameters: Array<BaseItem | null>): BaseItem {
        return isTruthyItem(parameters[0]) ? BOOL_FALSE_SINGLETON : BOOL_TRUE_SINGLETON;
    }
    /**
     * {}
     */
    compute_XOR(parameters: Array<BaseItem | null>): BaseItem {
        assert(parameters.length === 2, "bad parameter count for XOR");
        return isTruthyItem(parameters[0]) !== isTruthyItem(parameters[1])
            ? BOOL_TRUE_SINGLETON
            : BOOL_FALSE_SINGLETON;
    }
    /**
     * {}
     */
    compute_OR(parameters: Array<BaseItem | null>): BaseItem {
        assert(parameters.length === 2, "bad parameter count for OR");
        return isTruthyItem(parameters[0]) || isTruthyItem(parameters[1])
            ? BOOL_TRUE_SINGLETON
            : BOOL_FALSE_SINGLETON;
    }
    /**
     * {}
     */
    compute_IF(parameters: Array<BaseItem | null>): BaseItem {
        assert(parameters.length === 2, "bad parameter count for IF");
        const flag = parameters[0];
        const value = parameters[1];
        // pass through item
        if (isTruthyItem(flag)) {
            return value;
        }
        return null;
    }
    /**
     * {}
     */
    compute_ROTATE(parameters: Array<BaseItem | null>): BaseItem {
        const item = parameters[0];
        if (!item || item.getItemType() !== "shape") {
            // Not a shape
            return null;
        }
        const definition = item as ShapeItem).definition;
        const rotatedDefinitionCW = this.root.shapeDefinitionMgr.shapeActionRotateCW(definition);
        return this.root.shapeDefinitionMgr.getShapeItemFromDefinition(rotatedDefinitionCW);
    }
    /**
     * {}
     */
    compute_ANALYZE(parameters: Array<BaseItem | null>): [
        BaseItem,
        BaseItem
    ] {
        const item = parameters[0];
        if (!item || item.getItemType() !== "shape") {
            // Not a shape
            return [null, null];
        }
        const definition = item as ShapeItem).definition;
        const lowerLayer = definition.layers[0] as import("../shape_definition").ShapeLayer);
        if (!lowerLayer) {
            return [null, null];
        }
        const topRightContent = lowerLayer[0];
        if (!topRightContent || topRightContent.subShape === null) {
            return [null, null];
        }
        const newDefinition = new ShapeDefinition({
            layers: [
                [
                    { subShape: topRightContent.subShape, color: enumColors.uncolored },
                    { subShape: topRightContent.subShape, color: enumColors.uncolored },
                    { subShape: topRightContent.subShape, color: enumColors.uncolored },
                    { subShape: topRightContent.subShape, color: enumColors.uncolored },
                ],
            ],
        });
        return [
            COLOR_ITEM_SINGLETONS[topRightContent.color],
            this.root.shapeDefinitionMgr.getShapeItemFromDefinition(newDefinition),
        ];
    }
    /**
     * {}
     */
    compute_CUT(parameters: Array<BaseItem | null>): [
        BaseItem,
        BaseItem
    ] {
        const item = parameters[0];
        if (!item || item.getItemType() !== "shape") {
            // Not a shape
            return [null, null];
        }
        const definition = item as ShapeItem).definition;
        const result = this.root.shapeDefinitionMgr.shapeActionCutHalf(definition);
        return [
            result[0].isEntirelyEmpty()
                ? null
                : this.root.shapeDefinitionMgr.getShapeItemFromDefinition(result[0]),
            result[1].isEntirelyEmpty()
                ? null
                : this.root.shapeDefinitionMgr.getShapeItemFromDefinition(result[1]),
        ];
    }
    /**
     * {}
     */
    compute_UNSTACK(parameters: Array<BaseItem | null>): [
        BaseItem,
        BaseItem
    ] {
        const item = parameters[0];
        if (!item || item.getItemType() !== "shape") {
            // Not a shape
            return [null, null];
        }
        const definition = item as ShapeItem).definition;
        const layers = definition.layers as Array<import("../shape_definition").ShapeLayer>);
        const upperLayerDefinition = new ShapeDefinition({
            layers: [layers[layers.length - 1]],
        });
        const lowerLayers = layers.slice(0, layers.length - 1);
        const lowerLayerDefinition = lowerLayers.length > 0 ? new ShapeDefinition({ layers: lowerLayers }) : null;
        return [
            lowerLayerDefinition
                ? this.root.shapeDefinitionMgr.getShapeItemFromDefinition(lowerLayerDefinition)
                : null,
            this.root.shapeDefinitionMgr.getShapeItemFromDefinition(upperLayerDefinition),
        ];
    }
    /**
     * {}
     */
    compute_STACKER(parameters: Array<BaseItem | null>): BaseItem {
        const lowerItem = parameters[0];
        const upperItem = parameters[1];
        if (!lowerItem || !upperItem) {
            // Empty
            return null;
        }
        if (lowerItem.getItemType() !== "shape" || upperItem.getItemType() !== "shape") {
            // Bad type
            return null;
        }
        const stackedShape = this.root.shapeDefinitionMgr.shapeActionStack(
        lowerItem as ShapeItem).definition, 
        upperItem as ShapeItem).definition);
        return this.root.shapeDefinitionMgr.getShapeItemFromDefinition(stackedShape);
    }
    /**
     * {}
     */
    compute_PAINTER(parameters: Array<BaseItem | null>): BaseItem {
        const shape = parameters[0];
        const color = parameters[1];
        if (!shape || !color) {
            // Empty
            return null;
        }
        if (shape.getItemType() !== "shape" || color.getItemType() !== "color") {
            // Bad type
            return null;
        }
        const coloredShape = this.root.shapeDefinitionMgr.shapeActionPaintWith(
        shape as ShapeItem).definition, 
        color as ColorItem).color);
        return this.root.shapeDefinitionMgr.getShapeItemFromDefinition(coloredShape);
    }
    /**
     * {}
     */
    compute_COMPARE(parameters: Array<BaseItem | null>): BaseItem {
        const itemA = parameters[0];
        const itemB = parameters[1];
        if (!itemA || !itemB) {
            // Empty
            return null;
        }
        if (itemA.getItemType() !== itemB.getItemType()) {
            // Not the same type
            return BOOL_FALSE_SINGLETON;
        }
        switch (itemA.getItemType()) {
            case "shape": {
                return itemA as ShapeItem).definition.getHash() ===
                    itemB as ShapeItem).definition.getHash()
                    ? BOOL_TRUE_SINGLETON
                    : BOOL_FALSE_SINGLETON;
            }
            case "color": {
                return itemA as ColorItem).color === itemB as ColorItem).color
                    ? BOOL_TRUE_SINGLETON
                    : BOOL_FALSE_SINGLETON;
            }
            case "boolean": {
                return itemA as BooleanItem).value === itemB as BooleanItem).value
                    ? BOOL_TRUE_SINGLETON
                    : BOOL_FALSE_SINGLETON;
            }
            default: {
                assertAlways(false, "Bad item type: " + itemA.getItemType());
            }
        }
    }
}
