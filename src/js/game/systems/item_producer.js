/* typehints:start */
import { GameRoot } from "../root";
/* typehints:end */

import { enumItemProducerType, ItemProducerComponent } from "../components/item_producer";
import { GameSystemWithFilter } from "../game_system_with_filter";

export class ItemProducerSystem extends GameSystemWithFilter {
    /** @param {GameRoot} root */
    constructor(root) {
        super(root, [ItemProducerComponent]);
    }

    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];

            if (entity.components.ItemProducer.type === enumItemProducerType.wired) {
                const pinsComp = entity.components.WiredPins;
                const pin = pinsComp.slots[0];
                const network = pin.linkedNetwork;

                if (!network || !network.hasValue()) {
                    continue;
                }

                const ejectorComp = entity.components.ItemEjector;
                ejectorComp.tryEject(0, network.currentValue);
            } else {
                // TODO: entity w/ wireless item producer (e.g. ConstantProducer)
            }
        }
    }
}
