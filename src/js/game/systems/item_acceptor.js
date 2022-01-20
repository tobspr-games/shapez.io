import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { enumDirectionToVector } from "../../core/vector";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { MapChunkView } from "../map_chunk_view";

export class ItemAcceptorSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [ItemAcceptorComponent]);
    }

    update() {
        // same code for belts, acceptors and ejectors - add helper method???
        const progressGrowth =
            this.root.dynamicTickrate.deltaSeconds *
            this.root.hubGoals.getBeltBaseSpeed() *
            globalConfig.itemSpacingOnBelts;

        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const acceptorComp = entity.components.ItemAcceptor;
            const inputs = acceptorComp.inputs;
            const maxProgress = 0.5;

            inputs.forEach((values, index) => {
                values.animProgress += progressGrowth;

                if (values.animProgress < maxProgress) return;

                inputs.delete(index);
                acceptorComp.completedInputs.set(index, {
                    item: values.item,
                    extraProgress: values.animProgress - maxProgress,
                }); // will be handled on the SAME frame due to processor system being afterwards
            });
        }
    }

    /**
     * @param {DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {
        if (this.root.app.settings.getAllSettings().simplifiedBelts) {
            // Disabled in potato mode
            return;
        }

        const contents = chunk.containedEntitiesByLayer.regular;
        for (let i = 0; i < contents.length; ++i) {
            const entity = contents[i];
            const acceptorComp = entity.components.ItemAcceptor;
            if (!acceptorComp) {
                continue;
            }

            const staticComp = entity.components.StaticMapEntity;
            acceptorComp.inputs.forEach((values, index) => {
                const { item, animProgress, direction } = values;

                const slotData = acceptorComp.slots[index];
                const realSlotPos = staticComp.localTileToWorld(slotData.pos);

                if (!chunk.tileSpaceRectangle.containsPoint(realSlotPos.x, realSlotPos.y)) {
                    // Not within this chunk
                    return;
                }

                const fadeOutDirection = enumDirectionToVector[staticComp.localDirectionToWorld(direction)];
                const finalTile = realSlotPos.subScalars(
                    fadeOutDirection.x * (animProgress - 0.5),
                    fadeOutDirection.y * (animProgress - 0.5)
                );

                item.drawItemCenteredClipped(
                    (finalTile.x + 0.5) * globalConfig.tileSize,
                    (finalTile.y + 0.5) * globalConfig.tileSize,
                    parameters,
                    globalConfig.defaultItemDiameter
                );
            });
        }
    }
}
