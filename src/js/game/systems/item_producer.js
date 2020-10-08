import { ItemProducerComponent } from "../components/item_producer";
import { GameSystemWithFilter } from "../game_system_with_filter";

export class ItemProducerSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [ItemProducerComponent]);
    }

    update() {
        for (let i = this.allEntitiesArray.length - 1; i >= 0; --i) {
            const entity = this.allEntitiesArray[i];
            const pinsComp = entity.components.WiredPins;
            const pin = pinsComp.slots[0];
            const network = pin.linkedNetwork;

            if (!network || !network.hasValue()) {
                continue;
            }

            const ejectorComp = entity.components.ItemEjector;
            ejectorComp.tryEject(0, network.currentValue);
        }
    }
}
