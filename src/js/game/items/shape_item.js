import { BaseItem } from "../base_item";
import { DrawParameters } from "../../core/draw_parameters";
import { extendSchema } from "../../savegame/serialization";
import { ShapeDefinition } from "../shape_definition";
import { createLogger } from "../../core/logging";

const logger = createLogger("shape_item");

export class ShapeItem extends BaseItem {
    static getId() {
        return "shape";
    }

    static getSchema() {
        return extendSchema(BaseItem.getCachedSchema(), {
            // TODO
        });
    }

    /**
     * @param {ShapeDefinition} definition
     */
    constructor(definition) {
        super();
        // logger.log("New shape item for shape definition", definition.generateId(), "created");

        /**
         * This property must not be modified on runtime, you have to clone the class in order to change the definition
         */
        this.definition = definition;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {DrawParameters} parameters
     * @param {number=} size
     */
    draw(x, y, parameters, size) {
        this.definition.draw(x, y, parameters, size);
    }
}
