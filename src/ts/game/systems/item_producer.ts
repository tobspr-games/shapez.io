import { ItemProducerComponent } from "../components/item_producer";
import { GameSystemWithFilter } from "../game_system_with_filter";
export class ItemProducerSystem extends GameSystemWithFilter {
    public item = null;

    constructor(root) {
        super(root, [ItemProducerComponent]);
    }
    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const ejectorComp = entity.components.ItemEjector;
            const pinsComp = entity.components.WiredPins;
            if (!pinsComp) {
                continue;
            }
            const pin = pinsComp.slots[0];
            const network = pin.linkedNetwork;
            if (!network || !network.hasValue()) {
                continue;
            }
            this.item = network.currentValue;
            ejectorComp.tryEject(0, this.item);
        }
    }
}
