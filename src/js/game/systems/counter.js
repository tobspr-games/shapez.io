import { DrawParameters } from "../../core/draw_parameters";
import { ItemCounterComponent } from "../components/counter";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { ShapeItem } from "../items/shape_item";
import { ColorItem } from "../items/color_item";

export class CounterSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [ItemCounterComponent]);
    }

    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const counterComp = entity.components.Counter;
            const ejectorComp = entity.components.ItemEjector;

            const items = counterComp.inputSlots;

            let outItem = null;

            if (items.length > 0) {
                const inputItem = /** @type {ShapeItem|ColorItem} */ (items[0].item);

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

    // Only render the items/s overlay if the entity is on screen
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

        context.font = "bold 8.5px GameFont";
        context.textAlign = "center";
        context.fillStyle = "#64666e";
        context.fillText(counterComp.averageItemsPerSecond.toString(), center.x, center.y + 3);

        context.textAlign = "left";
        context.globalAlpha = 1;
    }
}
