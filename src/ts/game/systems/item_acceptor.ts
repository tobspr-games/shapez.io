import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { fastArrayDelete } from "../../core/utils";
import { enumDirectionToVector } from "../../core/vector";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { MapChunkView } from "../map_chunk_view";
export class ItemAcceptorSystem extends GameSystemWithFilter {
    public accumulatedTicksWhileInMapOverview = 0;

    constructor(root) {
        super(root, [ItemAcceptorComponent]);
    }
    update(): any {
        if (this.root.app.settings.getAllSettings().simplifiedBelts) {
            // Disabled in potato mode
            return;
        }
        // This system doesn't render anything while in map overview,
        // so simply accumulate ticks
        if (this.root.camera.getIsMapOverlayActive()) {
            ++this.accumulatedTicksWhileInMapOverview;
            return;
        }
        // Compute how much ticks we missed
        const numTicks: any = 1 + this.accumulatedTicksWhileInMapOverview;
        const progress: any = this.root.dynamicTickrate.deltaSeconds *
            2 *
            this.root.hubGoals.getBeltBaseSpeed() *
            globalConfig.itemSpacingOnBelts * // * 2 because its only a half tile
            numTicks;
        // Reset accumulated ticks
        this.accumulatedTicksWhileInMapOverview = 0;
        for (let i: any = 0; i < this.allEntities.length; ++i) {
            const entity: any = this.allEntities[i];
            const aceptorComp: any = entity.components.ItemAcceptor;
            const animations: any = aceptorComp.itemConsumptionAnimations;
            // Process item consumption animations to avoid items popping from the belts
            for (let animIndex: any = 0; animIndex < animations.length; ++animIndex) {
                const anim: any = animations[animIndex];
                anim.animProgress += progress;
                if (anim.animProgress > 1) {
                    fastArrayDelete(animations, animIndex);
                    animIndex -= 1;
                }
            }
        }
    }
        drawChunk(parameters: DrawParameters, chunk: MapChunkView): any {
        if (this.root.app.settings.getAllSettings().simplifiedBelts) {
            // Disabled in potato mode
            return;
        }
        const contents: any = chunk.containedEntitiesByLayer.regular;
        for (let i: any = 0; i < contents.length; ++i) {
            const entity: any = contents[i];
            const acceptorComp: any = entity.components.ItemAcceptor;
            if (!acceptorComp) {
                continue;
            }
            const staticComp: any = entity.components.StaticMapEntity;
            for (let animIndex: any = 0; animIndex < acceptorComp.itemConsumptionAnimations.length; ++animIndex) {
                const { item, slotIndex, animProgress, direction }: any = acceptorComp.itemConsumptionAnimations[animIndex];
                const slotData: any = acceptorComp.slots[slotIndex];
                const realSlotPos: any = staticComp.localTileToWorld(slotData.pos);
                if (!chunk.tileSpaceRectangle.containsPoint(realSlotPos.x, realSlotPos.y)) {
                    // Not within this chunk
                    continue;
                }
                const fadeOutDirection: any = enumDirectionToVector[staticComp.localDirectionToWorld(direction)];
                const finalTile: any = realSlotPos.subScalars(fadeOutDirection.x * (animProgress / 2 - 0.5), fadeOutDirection.y * (animProgress / 2 - 0.5));
                item.drawItemCenteredClipped((finalTile.x + 0.5) * globalConfig.tileSize, (finalTile.y + 0.5) * globalConfig.tileSize, parameters, globalConfig.defaultItemDiameter);
            }
        }
    }
}
