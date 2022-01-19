import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { enumDirectionToVector } from "../../core/vector";
import { ACHIEVEMENTS } from "../../platform/achievement_provider";
import {
    enumItemAcceptorTypes,
    ItemAcceptorComponent,
    InputCompletedArgs,
} from "../components/item_acceptor";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { ShapeItem } from "../items/shape_item";
import { MapChunkView } from "../map_chunk_view";

export class ItemAcceptorSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [ItemAcceptorComponent]);

        /**
         * @type {Object<enumItemAcceptorTypes, function(InputCompletedArgs) : string>}
         */
        this.handlers = {
            [enumItemAcceptorTypes.itemProcessor]: this.input_ITEMPROCESSOR,
            [enumItemAcceptorTypes.hub]: this.input_HUB,
            [enumItemAcceptorTypes.trash]: this.input_TRASH,
        };

        // Bind all handlers
        for (const key in this.handlers) {
            this.handlers[key] = this.handlers[key].bind(this);
        }
    }

    update() {
        // * 2 because its only a half tile - (same code as ejector)
        const progressGrowth =
            2 *
            this.root.dynamicTickrate.deltaSeconds *
            this.root.hubGoals.getBeltBaseSpeed() *
            globalConfig.itemSpacingOnBelts;

        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const acceptorComp = entity.components.ItemAcceptor;
            const inputs = acceptorComp.inputs;

            inputs.forEach((values, index) => {
                values.animProgress += progressGrowth;

                if (values.animProgress < 1) return;

                inputs.delete(index);
                acceptorComp.completedInputs.set(index, {
                    item: values.item,
                    extraProgress: values.animProgress - 1,
                }); // will be handled on the SAME frame due to processor being afterwards

                /** @type {function(InputCompletedArgs) : string} */
                const handler = this.handlers[acceptorComp.type];
                assert(handler, "No handler for acceptor type defined: " + acceptorComp.type);

                // Call implementation
                handler({
                    root: this.root,
                    entity,
                    item: values.item,
                    slotIndex: index,
                    extraProgress: values.animProgress - 1,
                });
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
                    fadeOutDirection.x * (animProgress / 2 - 0.5),
                    fadeOutDirection.y * (animProgress / 2 - 0.5)
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

    /**
     * @param {InputCompletedArgs} args
     */
    input_ITEMPROCESSOR(args) {}
    //@SENSETODO this isn't set up like it should be yet

    /**
     * @param {InputCompletedArgs} args
     */
    input_HUB(args) {
        const item = /** @type {ShapeItem} */ (args.item);
        assert(item instanceof ShapeItem, "Input for hub is not a shape");

        this.root.hubGoals.handleDefinitionDelivered(item.definition);

        const acceptorComp = args.entity.components.ItemAcceptor;
        acceptorComp.inputs.delete(args.slotIndex);
    }

    /**
     * @param {InputCompletedArgs} args
     */
    input_TRASH(args) {
        // just remove the item
        const acceptorComp = args.entity.components.ItemAcceptor;
        acceptorComp.inputs.delete(args.slotIndex);
        args.entity.root.signals.achievementCheck.dispatch(ACHIEVEMENTS.trash1000, 1);
    }

    //storage

    //underground belt
}
