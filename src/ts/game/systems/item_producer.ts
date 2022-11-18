import { ItemProducerComponent } from "../components/item_producer";
import { GameSystemWithFilter } from "../game_system_with_filter";
export class ItemProducerSystem extends GameSystemWithFilter {
    public item = null;

    constructor(root) {
        super(root, [ItemProducerComponent]);
    }
    update(): any {
        for (let i: any = 0; i < this.allEntities.length; ++i) {
            const entity: any = this.allEntities[i];
            const ejectorComp: any = entity.components.ItemEjector;
            const pinsComp: any = entity.components.WiredPins;
            if (!pinsComp) {
                continue;
            }
            const pin: any = pinsComp.slots[0];
            const network: any = pin.linkedNetwork;
            if (!network || !network.hasValue()) {
                continue;
            }
            this.item = network.currentValue;
            ejectorComp.tryEject(0, this.item);
        }
    }
}
