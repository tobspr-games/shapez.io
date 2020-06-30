import { GameSystemWithFilter } from "../game_system_with_filter";
import { ChainableSplitterComponent } from "../components/chainable_splitter";
import { enumDirectionToVector, enumDirection } from "../../core/vector";
import { Entity } from "../entity";
import { DrawParameters } from "../../core/draw_parameters";
import { formatBigNumber, lerp } from "../../core/utils";
import { Loader } from "../../core/loader";
import { enumLayer } from "../root";
import { BaseItem } from "../base_item";
import { globalConfig } from "../../core/config";

export class ChainableSplitterSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [ChainableSplitterComponent]);
    }

    update() {
        const beltSpeed = this.getBeltSpeed();

        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const splitterComp = entity.components.ChainableSplitter;

            // First, try to get rid of received item
            this.tryEject(entity, beltSpeed);

            const item = splitterComp.inputItem;
            if (item === null) {
                continue;
            }

            if (splitterComp.tryReceiveItem(item, 0)) {
                splitterComp.inputItem = null;
                continue;
            }

            let resetEntities = [entity.components.ChainableSplitter];
            let sideEntities = [
                {
                    direction: enumDirection.left,
                    entity: entity,
                },
                {
                    direction: enumDirection.right,
                    entity: entity,
                },
            ];
            send_loop: for (let distance = 1; ; distance++) {
                for (let index = 0; index < sideEntities.length; index++) {
                    const sideEntity = sideEntities[index];

                    sideEntity.entity = this.getAdjacentEntity(sideEntity.entity, sideEntity.direction);
                    let sideSplitterComp;
                    if (
                        sideEntity.entity &&
                        (sideSplitterComp = sideEntity.entity.components.ChainableSplitter)
                    ) {
                        if (sideSplitterComp.tryReceiveItem(item, distance)) {
                            splitterComp.inputItem = null;
                            break send_loop;
                        }
                        resetEntities.push(sideSplitterComp);
                    } else {
                        sideEntities.splice(index, 1);
                        index--;
                    }
                }

                if (sideEntities.length == 0) {
                    for (let index = 0; index < resetEntities.length; index++) {
                        resetEntities[index].resetReceived();
                    }
                    break;
                }
            }
        }
    }

    /**
     *
     * @param {Entity} entity
     * @param {number} progressGrowth
     * @returns {boolean}
     */
    tryEject(entity, progressGrowth) {
        const splitterComp = entity.components.ChainableSplitter;

        if (!splitterComp || splitterComp.receivedItems.length == 0) {
            return false;
        }

        for (let index = 0; index < splitterComp.receivedItems.length; index++) {
            const item = splitterComp.receivedItems[index];
            item.distance -= progressGrowth;
        }

        const item = splitterComp.receivedItems[0];
        if (item.distance > 0) {
            return false;
        }

        const ejectComp = entity.components.ItemEjector;
        if (ejectComp.canEjectOnSlot(0)) {
            if (ejectComp.tryEject(0, item.item)) {
                splitterComp.receivedItems.shift();
                return true;
            }
        }

        return false;
    }

    /** @returns {number} */
    getBeltSpeed() {
        let progressGrowth = 2 * this.root.dynamicTickrate.deltaSeconds;

        if (G_IS_DEV && globalConfig.debug.instantBelts) {
            progressGrowth = 1;
        }

        return (
            progressGrowth *
            this.root.hubGoals.getBeltBaseSpeed(enumLayer.regular) *
            globalConfig.beltItemSpacingByLayer[enumLayer.regular]
        );
    }
}
