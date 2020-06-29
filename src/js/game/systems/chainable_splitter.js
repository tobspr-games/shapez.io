import { GameSystemWithFilter } from "../game_system_with_filter";
import { ChainableSplitterComponent } from "../components/chainable_splitter";
import { enumDirectionToVector, enumDirection } from "../../core/vector";
import { Entity } from "../entity";
import { DrawParameters } from "../../core/draw_parameters";
import { formatBigNumber, lerp } from "../../core/utils";
import { Loader } from "../../core/loader";
import { enumLayer } from "../root";
import { BaseItem } from "../base_item";

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

            const leftEdgeEntity = this.getLeftEdgeEntity(entity);
            this.reset = true;
            if (this.tryEject(leftEdgeEntity, splitterComp.inputItem)) {
                splitterComp.inputItem = null;
            }
        }
    }

    /**
     *
     * @param {Entity} entity
     * @returns {Entity}
     */
    getLeftEdgeEntity(entity) {
        const leftEntity = this.getAdjacentEntity(entity, enumDirection.left);
        if (leftEntity === null || !leftEntity.components.ChainableSplitter) {
            return entity;
        }

        return this.getLeftEdgeEntity(leftEntity);
    }

    /**
     *
     * @param {Entity} entity
     * @param {BaseItem} item
     * @returns {boolean}
     */
    tryEject(entity, item) {
        const splitterComp = entity.components.ChainableSplitter;
        if (!splitterComp.ejected) {
            this.reset = false;
            const ejectComp = entity.components.ItemEjector;

            if (ejectComp.canEjectOnSlot(0)) {
                if (ejectComp.tryEject(0, item)) {
                    splitterComp.ejected = true;
                    return true;
                }
            }
        }

        const rightEntity = this.getAdjacentEntity(entity, enumDirection.right);
        if (
            rightEntity !== null &&
            rightEntity.components.ChainableSplitter &&
            this.tryEject(rightEntity, item)
        ) {
            return true;
        }

        if (this.reset) {
            splitterComp.ejected = false;
        }
        return false;
    }
}
