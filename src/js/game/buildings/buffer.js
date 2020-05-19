import { enumDirection, Vector } from "../../core/vector";
import { ItemAcceptorComponent, enumItemAcceptorItemFilter } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { BufferComponent } from "../components/item_buffer";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { MetaBuilding } from "../meta_building";
import { GameRoot } from "../root";

export class MetaBufferBuilding extends MetaBuilding {
    constructor() {
        super("buffer");
    }

    getSilhouetteColor() {
        return "#621940";
    }

    getDimensions() {
        return new Vector(3, 3);
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        // TODO: Add as level reward
        // return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_stacker);
        return true;
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        // TODO: Use custom component here to allow for smooth output
        entity.addComponent(new BufferComponent());
        entity.addComponent(
            new ItemProcessorComponent({
                inputsPerCharge: 1,
                chargeWhenBlocked: true,
                processorType: enumItemProcessorTypes.buffer,
            })
        );

        entity.addComponent(
            new ItemEjectorComponent({
                slots: [{ pos: new Vector(1, 0), direction: enumDirection.top }],
            })
        );

        // We render the sprite our self
        // entity.components.StaticMapEntity.spriteKey = null;

        // TODO: Replace item filters with custom filter to only allow one type of item to be collected.
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 1),
                        directions: [enumDirection.left],
                        filter: enumItemAcceptorItemFilter.any,
                    },
                    {
                        pos: new Vector(1, 2),
                        directions: [enumDirection.bottom],
                        filter: enumItemAcceptorItemFilter.any,
                    },
                    {
                        pos: new Vector(2, 1),
                        directions: [enumDirection.right],
                        filter: enumItemAcceptorItemFilter.any,
                    },
                ],
            })
        );
    }
}
