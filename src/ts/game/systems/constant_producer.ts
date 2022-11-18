import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { Vector } from "../../core/vector";
import { ConstantSignalComponent } from "../components/constant_signal";
import { ItemProducerComponent } from "../components/item_producer";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { MapChunk } from "../map_chunk";
export class ConstantProducerSystem extends GameSystemWithFilter {

    constructor(root) {
        super(root, [ConstantSignalComponent, ItemProducerComponent]);
    }
    update(): any {
        for (let i: any = 0; i < this.allEntities.length; ++i) {
            const entity: any = this.allEntities[i];
            const signalComp: any = entity.components.ConstantSignal;
            const ejectorComp: any = entity.components.ItemEjector;
            if (!ejectorComp) {
                continue;
            }
            ejectorComp.tryEject(0, signalComp.signal);
        }
    }
    /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {} parameters
     * @par@ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {DrawParameters} parameters
     * @par@returns
     */
    drawChDra /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {} parameters
     * @param {} @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {DrawParameters} parameters
     * @param {MapChunk} @returns
     */
    drawChmeters: DrawParam /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {} parameters
     * @param {} @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {DrawParameters} parameters
     * @param {MapChunk} @returns
     */
    drawChmeters: DrawParam /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {} parameters
     * @param {} chunk
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @ /**
     *
     * @param {DrawParameters} parameters
     * @param {MapChunk} chunk
     * @returns
     */
    drawChunk(parameters: DrawParameters, chunk: MapChunk): any {
        const contents: any = chunk.containedEntitiesByLayer.regular;
        for (let i: any = 0; i < contents.length; ++i) {
            const producerComp: any = contents[i].components.ItemProducer;
            const signalComp: any = contents[i].components.ConstantSignal;
            if (!producerComp || !signalComp) {
                continue;
            }
            const staticComp: any = contents[i].components.StaticMapEntity;
            const item: any = signalComp.signal;
            if (!item) {
                continue;
            }
            const center: any = staticComp.getTileSpaceBounds().getCenter().toWorldSpace();
            const localOffset: any = new Vector(0, 1).rotateFastMultipleOf90(staticComp.rotation);
            item.drawItemCenteredClipped(center.x + localOffset.x, center.y + localOffset.y, parameters, globalConfig.tileSize * 0.65);
        }
    }
}
