import { GameSystemWithFilter } from "../game_system_with_filter";
import { ChainableSplitterComponent } from "../components/chainable_splitter";
import { Entity } from "../entity";
import { DrawParameters } from "../../core/draw_parameters";
import { formatBigNumber, lerp } from "../../core/utils";
import { Loader } from "../../core/loader";
import { enumLayer } from "../root";

export class ChainableSplitterSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [ChainableSplitterComponent]);
    }

    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const splitterComp = entity.components.ChainableSplitter;

            if (splitterComp.inputItem === null) {
                continue;
            }

            const ejectorComp = entity.components.ItemEjector;

            const nextSlot = ejectorComp.getFirstFreeSlot(enumLayer.regular);
            if (nextSlot !== null) {
                if (ejectorComp.tryEject(nextSlot, splitterComp.inputItem)) {
                    splitterComp.inputItem = null;
                }
            }
        }
    }
}
