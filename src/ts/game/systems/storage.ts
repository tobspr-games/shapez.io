import { DrawParameters } from "../../core/draw_parameters";
import { Loader } from "../../core/loader";
import { formatBigNumber, lerp } from "../../core/utils";
import { StorageComponent } from "../components/storage";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { BOOL_FALSE_SINGLETON, BOOL_TRUE_SINGLETON } from "../items/boolean_item";
import { MapChunkView } from "../map_chunk_view";
export class StorageSystem extends GameSystemWithFilter {
    public storageOverlaySprite = Loader.getSprite("sprites/misc/storage_overlay.png");
    public drawnUids: Set<number> = new Set();

    constructor(root) {
        super(root, [StorageComponent]);
        this.root.signals.gameFrameStarted.add(this.clearDrawnUids, this);
    }
    clearDrawnUids() {
        this.drawnUids.clear();
    }
    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const storageComp = entity.components.Storage;
            const pinsComp = entity.components.WiredPins;
            // Eject from storage
            if (storageComp.storedItem && storageComp.storedCount > 0) {
                const ejectorComp = entity.components.ItemEjector;
                const nextSlot = ejectorComp.getFirstFreeSlot();
                if (nextSlot !== null) {
                    if (ejectorComp.tryEject(nextSlot, storageComp.storedItem)) {
                        storageComp.storedCount--;
                        if (storageComp.storedCount === 0) {
                            storageComp.storedItem = null;
                        }
                    }
                }
            }
            let targetAlpha = storageComp.storedCount > 0 ? 1 : 0;
            storageComp.overlayOpacity = lerp(storageComp.overlayOpacity, targetAlpha, 0.05);
            // a wired pins component is not guaranteed, but if its there, set the value
            if (pinsComp) {
                pinsComp.slots[0].value = storageComp.storedItem;
                pinsComp.slots[1].value = storageComp.getIsFull()
                    ? BOOL_TRUE_SINGLETON
                    : BOOL_FALSE_SINGLETON;
            }
        }
    }
        drawChunk(parameters: DrawParameters, chunk: MapChunkView) {
        const contents = chunk.containedEntitiesByLayer.regular;
        for (let i = 0; i < contents.length; ++i) {
            const entity = contents[i];
            const storageComp = entity.components.Storage;
            if (!storageComp) {
                continue;
            }
            const storedItem = storageComp.storedItem;
            if (!storedItem) {
                continue;
            }
            if (this.drawnUids.has(entity.uid)) {
                continue;
            }
            this.drawnUids.add(entity.uid);
            const staticComp = entity.components.StaticMapEntity;
            const context = parameters.context;
            context.globalAlpha = storageComp.overlayOpacity;
            const center = staticComp.getTileSpaceBounds().getCenter().toWorldSpace();
            storedItem.drawItemCenteredClipped(center.x, center.y, parameters, 30);
            this.storageOverlaySprite.drawCached(parameters, center.x - 15, center.y + 15, 30, 15);
            if (parameters.visibleRect.containsCircle(center.x, center.y + 25, 20)) {
                context.font = "bold 10px GameFont";
                context.textAlign = "center";
                context.fillStyle = "#64666e";
                context.fillText(formatBigNumber(storageComp.storedCount), center.x, center.y + 25.5);
                context.textAlign = "left";
            }
            context.globalAlpha = 1;
        }
    }
}
