import { GameSystemWithFilter } from "../game_system_with_filter";
import { StorageComponent, enumStorageDisplayType } from "../components/storage";
import { Entity } from "../entity";
import { DrawParameters } from "../../core/draw_parameters";
import { formatBigNumber, lerp } from "../../core/utils";
import { Loader } from "../../core/loader";
import { enumLayer } from "../root";
import { enumAnalyticsDataSource } from "../production_analytics";
import { globalConfig } from "../../core/config";
import { enumItemType } from "../base_item";
import { ShapeItem } from "../items/shape_item";

export class StorageSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [StorageComponent]);

        this.storageOverlaySprite = Loader.getSprite("sprites/misc/storage_overlay.png");
    }

    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const storageComp = entity.components.Storage;

            // Analytics hook
            if (storageComp.itemsToAnalyze > 0) {
                this.root.signals.itemDeliveredToStorage.dispatch(entity.uid, storageComp.itemsToAnalyze);
                storageComp.itemsToAnalyze = 0;
            }

            // Eject from storage
            if (storageComp.storedItem && storageComp.storedCount > 0) {
                const ejectorComp = entity.components.ItemEjector;

                /* FIXME: WIRES */
                const nextSlot = ejectorComp.getFirstFreeSlot(enumLayer.regular);
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
        }
    }

    draw(parameters) {
        this.forEachMatchingEntityOnScreen(parameters, this.drawEntity.bind(this));
    }

    /**
     * @param {DrawParameters} parameters
     * @param {Entity} entity
     */
    drawEntity(parameters, entity) {
        const context = parameters.context;
        const staticComp = entity.components.StaticMapEntity;

        if (!staticComp.shouldBeDrawn(parameters)) {
            return;
        }

        const storageComp = entity.components.Storage;

        const storedItem = storageComp.storedItem;
        const center = staticComp.getTileSpaceBounds().getCenter().toWorldSpace();

        if (storedItem !== null) {
            context.globalAlpha = storageComp.overlayOpacity;
            storedItem.draw(center.x, center.y, parameters, 30);
        }

        switch (storageComp.displayType) {
            case enumStorageDisplayType.count: {
                if (storedItem !== null) {
                    this.storageOverlaySprite.drawCached(parameters, center.x - 15, center.y + 15, 30, 15);

                    context.font = "bold 10px GameFont";
                    context.textAlign = "center";
                    context.fillStyle = "#64666e";
                    context.fillText(formatBigNumber(storageComp.storedCount), center.x, center.y + 25.5);
                    context.textAlign = "left";
                    context.globalAlpha = 1;
                }
                break;
            }

            case enumStorageDisplayType.rate: {
                context.globalAlpha = 1;
                this.storageOverlaySprite.drawCached(parameters, center.x - 15, center.y + 15, 30, 15);

                let rate =
                    (this.root.productionAnalytics.getCurrentShapeRate(
                        enumAnalyticsDataSource.deliveredToStorage,
                        entity.uid.toString()
                    ) /
                        globalConfig.analyticsSliceDurationSeconds) *
                    60;
                context.font = "bold 7px GameFont";
                context.textAlign = "center";
                context.fillStyle = "#64666e";
                context.fillText("" + formatBigNumber(rate) + " /m", center.x, center.y + 24.5);
                context.textAlign = "left";
                context.globalAlpha = 1;
                break;
            }
        }
    }
}
