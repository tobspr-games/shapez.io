import { Vector } from "../../core/vector";
import { Entity } from "../entity";
import { MetaBuilding } from "../meta_building";
import { GameRoot, enumLayer } from "../root";
import { WireTunnelComponent } from "../components/wire_tunnel";

export class MetaWireTunnelBuilding extends MetaBuilding {
    constructor() {
        super("wire_tunnel");
    }

    getSilhouetteColor() {
        return "#25fff2";
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        // @todo
        return true;
    }

    getIsRotateable() {
        return false;
    }

    getDimensions() {
        return new Vector(1, 1);
    }

    getLayer() {
        return enumLayer.wires;
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(new WireTunnelComponent());
    }
}
