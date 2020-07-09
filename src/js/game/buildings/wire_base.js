import { Loader } from "../../core/loader";
import { enumDirection } from "../../core/vector";
import { enumLayer } from "../root";
import { arrayBeltVariantToRotation, MetaBeltBaseBuilding } from "./belt_base";

export class MetaWireBaseBuilding extends MetaBeltBaseBuilding {
    constructor() {
        super("wire");
    }

    getSilhouetteColor() {
        return "#c425d7";
    }

    getLayer() {
        return enumLayer.wires;
    }

    getPreviewSprite(rotationVariant) {
        switch (arrayBeltVariantToRotation[rotationVariant]) {
            case enumDirection.top: {
                return Loader.getSprite("sprites/buildings/wire_top.png");
            }
            case enumDirection.left: {
                return Loader.getSprite("sprites/buildings/wire_left.png");
            }
            case enumDirection.right: {
                return Loader.getSprite("sprites/buildings/wire_right.png");
            }
            default: {
                assertAlways(false, "Invalid belt rotation variant");
            }
        }
    }

    getBlueprintSprite(rotationVariant) {
        switch (arrayBeltVariantToRotation[rotationVariant]) {
            case enumDirection.top: {
                return Loader.getSprite("sprites/blueprints/wire_top.png");
            }
            case enumDirection.left: {
                return Loader.getSprite("sprites/blueprints/wire_left.png");
            }
            case enumDirection.right: {
                return Loader.getSprite("sprites/blueprints/wire_right.png");
            }
            default: {
                assertAlways(false, "Invalid belt rotation variant");
            }
        }
    }
}
