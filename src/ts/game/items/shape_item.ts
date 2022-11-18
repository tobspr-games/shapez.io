import { DrawParameters } from "../../core/draw_parameters";
import { types } from "../../savegame/serialization";
import { BaseItem } from "../base_item";
import { ShapeDefinition } from "../shape_definition";
import { THEME } from "../theme";
import { globalConfig } from "../../core/config";
export class ShapeItem extends BaseItem {
    static getId(): any {
        return "shape";
    }
    static getSchema(): any {
        return types.string;
    }
    serialize(): any {
        return this.definition.getHash();
    }
    deserialize(data: any): any {
        this.definition = ShapeDefinition.fromShortKey(data);
    }
    /** {} **/
    getItemType(): "shape" {
        return "shape";
    }
    /**
     * {}
     */
    getAsCopyableKey(): string {
        return this.definition.getHash();
    }
        equalsImpl(other: BaseItem): any {
        return this.definition.getHash() === other as ShapeItem).definition.getHash();
    }
    public definition = definition;

        constructor(definition) {
        super();
    }
    getBackgroundColorAsResource(): any {
        return THEME.map.resources.shape;
    }
    /**
     * Draws the item to a canvas
     */
    drawFullSizeOnCanvas(context: CanvasRenderingContext2D, size: number): any {
        this.definition.drawFullSizeOnCanvas(context, size);
    }
        drawItemCenteredImpl(x: number, y: number, parameters: DrawParameters, diameter: number= = globalConfig.defaultItemDiameter): any {
        this.definition.drawCentered(x, y, parameters, diameter);
    }
}
