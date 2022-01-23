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

            for (let i = 0; i < inputs.length; i++) {
                const input = inputs[i];
                input.animProgress += progressGrowth;

                if (input.animProgress < maxProgress) {
                    continue;
                }

                inputs.splice(i, 1);
                i--;
                acceptorComp.completedInputs.push({
                    slotIndex: input.slotIndex,
                    item: input.item,
                    extraProgress: input.animProgress - maxProgress,
                }); // will be handled on the SAME frame due to processor system being afterwards
            }
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
            for (let i = 0; i < acceptorComp.inputs.length; i++) {
                const input = acceptorComp.inputs[i];
                const { item, animProgress, slotIndex } = input;

                const slotData = acceptorComp.slots[slotIndex];
                const realSlotPos = staticComp.localTileToWorld(slotData.pos);

                if (!chunk.tileSpaceRectangle.containsPoint(realSlotPos.x, realSlotPos.y)) {
                    // Not within this chunk
                    return;
                }

                const fadeOutDirection =
                    enumDirectionToVector[staticComp.localDirectionToWorld(slotData.direction)];
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
            }
        }
    }
}
