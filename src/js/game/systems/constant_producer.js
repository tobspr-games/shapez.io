/* typehints:start */
/* typehints:end */
import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { ConstantSignalComponent } from "../components/constant_signal";
import { ItemProducerComponent } from "../components/item_producer";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { MapChunk } from "../map_chunk";
import { GameRoot } from "../root";

export class ConstantProducerSystem extends GameSystemWithFilter {
    /** @param {GameRoot} root */
    constructor(root) {
        super(root, [ConstantSignalComponent, ItemProducerComponent]);
    }

    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const producerComp = entity.components.ItemProducer;
            const signalComp = entity.components.ConstantSignal;

            if (!producerComp.isWireless() || !signalComp.isWireless()) {
                continue;
            }

            const ejectorComp = entity.components.ItemEjector;

            ejectorComp.tryEject(0, signalComp.signal);
        }
    }

    /**
     *
     * @param {DrawParameters} parameters
     * @param {MapChunk} chunk
     * @returns
     */
    drawChunk(parameters, chunk) {
        const contents = chunk.containedEntitiesByLayer.regular;
        for (let i = 0; i < contents.length; ++i) {
            const producerComp = contents[i].components.ItemProducer;
            const signalComp = contents[i].components.ConstantSignal;

            if (!producerComp || !producerComp.isWireless() || !signalComp || !signalComp.isWireless()) {
                return;
            }

            const staticComp = contents[i].components.StaticMapEntity;
            const item = signalComp.signal;

            if (!item) {
                return;
            }

            // TODO: Better looking overlay
            const center = staticComp.getTileSpaceBounds().getCenter().toWorldSpace();
            item.drawItemCenteredClipped(center.x, center.y + 1, parameters, globalConfig.tileSize * 0.65);
        }
    }
}
