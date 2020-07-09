import { Loader } from "../../core/loader";
import { enumDirection } from "../../core/vector";
import { SOUNDS } from "../../platform/sound";
import { arrayBeltVariantToRotation, MetaBeltBaseBuilding } from "./belt_base";

export class MetaBeltBuilding extends MetaBeltBaseBuilding {
    constructor() {
        super("belt");
    }

    getSilhouetteColor() {
        return "#777";
    }

    getPlacementSound() {
        return SOUNDS.placeBelt;
    }

    getPreviewSprite(rotationVariant) {
        switch (arrayBeltVariantToRotation[rotationVariant]) {
            case enumDirection.top: {
                return Loader.getSprite("sprites/buildings/belt_top.png");
            }
            case enumDirection.left: {
                return Loader.getSprite("sprites/buildings/belt_left.png");
            }
            case enumDirection.right: {
                return Loader.getSprite("sprites/buildings/belt_right.png");
            }
            default: {
                assertAlways(false, "Invalid belt rotation variant");
            }
        }
    }

    getBlueprintSprite(rotationVariant) {
        switch (arrayBeltVariantToRotation[rotationVariant]) {
            case enumDirection.top: {
                return Loader.getSprite("sprites/blueprints/belt_top.png");
            }
            case enumDirection.left: {
                return Loader.getSprite("sprites/blueprints/belt_left.png");
            }
            case enumDirection.right: {
                return Loader.getSprite("sprites/blueprints/belt_right.png");
            }
            default: {
                assertAlways(false, "Invalid belt rotation variant");
            }
        }
    }
}
