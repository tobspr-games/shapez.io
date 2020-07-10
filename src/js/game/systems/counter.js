import { DrawParameters } from "../../core/draw_parameters";
import { ItemCounterComponent } from "../components/counter";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { ShapeItem } from "../items/shape_item";
import { Loader } from "../../core/loader";

export class CounterSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [ItemCounterComponent]);

        this.storageOverlaySprite = Loader.getSprite("sprites/misc/storage_overlay.png");
    }

    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const counterComp = entity.components.Counter;
            const ejectorComp = entity.components.ItemEjector;

            const items = counterComp.inputSlots;

            let outItem = null;

            if (items.length > 0) {
                const inputItem = /** @type {ShapeItem} */ (items[0].item);
                assert(inputItem instanceof ShapeItem, "Input for counting is not a shape");

                outItem = inputItem;
                let slot = ejectorComp.getFirstFreeSlot(entity.layer);

                if (slot !== null) {
                    if (!ejectorComp.tryEject(slot, outItem)) {
                        assert(false, "Failed to eject");
                    } else {
                        counterComp.countNewItem();
                        counterComp.inputSlots = [];
                    }
                }
            }

            counterComp.tick(this.root.time);
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

        const counterComp = entity.components.Counter;

        context.globalAlpha = 1;
        const center = staticComp.getTileSpaceBounds().getCenter().toWorldSpace();

        this.storageOverlaySprite.drawCached(parameters, center.x - 15, center.y + 15, 30, 15);

        context.font = "bold 10px GameFont";
        context.textAlign = "center";
        context.fillStyle = "#64666e";
        context.fillText(counterComp.averageItemsPerSecond, center.x, center.y + 25.5);

        context.textAlign = "left";
        context.globalAlpha = 1;
    }
}
