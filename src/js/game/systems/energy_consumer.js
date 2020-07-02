import { DrawParameters } from "../../core/draw_parameters";
import { Loader } from "../../core/loader";
import { clamp } from "../../core/utils";
import { enumItemType } from "../base_item";
import { EnergyConsumerComponent } from "../components/energy_consumer";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { NEGATIVE_ENERGY_ITEM_SINGLETON } from "../items/negative_energy_item";
import { POSITIVE_ENERGY_ITEM_SINGLETON } from "../items/positive_energy_item";

export class EnergyConsumerSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [EnergyConsumerComponent]);

        this.batterySprites = [
            Loader.getSprite("sprites/wires/battery_empty.png"),
            Loader.getSprite("sprites/wires/battery_low.png"),
            Loader.getSprite("sprites/wires/battery_medium.png"),
            Loader.getSprite("sprites/wires/battery_full.png"),
        ];

        this.piledWasteSprite = Loader.getSprite("sprites/wires/waste_piled.png");
    }

    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const energyConsumerComp = entity.components.EnergyConsumer;

            if (energyConsumerComp.piledOutput >= 1.0) {
                // Try to get rid of waste

                const ejectorComp = entity.components.ItemEjector;
                const item = this.getItemSingletonByType(energyConsumerComp.wasteType);
                if (ejectorComp.tryEject(energyConsumerComp.ejectorSlotIndex, item)) {
                    // Got rid of waste
                    energyConsumerComp.reduceWaste(1.0);
                }
            }
        }
    }

    /**
     *
     * @param {enumItemType} itemType
     */
    getItemSingletonByType(itemType) {
        switch (itemType) {
            case enumItemType.positiveEnergy:
                return POSITIVE_ENERGY_ITEM_SINGLETON;
            case enumItemType.negativeEnergy:
                return NEGATIVE_ENERGY_ITEM_SINGLETON;
            default:
                assertAlways(false, "Bad item type: " + itemType);
        }
    }

    /**
     * Draws everything
     * @param {DrawParameters} parameters
     */
    draw(parameters) {
        this.forEachMatchingEntityOnScreen(parameters, this.drawSingleEntity.bind(this));
    }

    /**
     * Draws a given entity
     * @param {DrawParameters} parameters
     * @param {Entity} entity
     */
    drawSingleEntity(parameters, entity) {
        const staticComp = entity.components.StaticMapEntity;
        const consumerComp = entity.components.EnergyConsumer;

        const position = staticComp
            .getTileSpaceBounds()
            .getCenter()
            .toWorldSpace()
            .add(consumerComp.batteryPosition);

        if (consumerComp.hasTooMuchWastePiled()) {
            this.piledWasteSprite.drawCachedCentered(parameters, position.x, position.y, 12);
        } else {
            const percentage = consumerComp.stored / consumerComp.bufferSize;
            const index = clamp(
                Math.round(percentage * this.batterySprites.length),
                0,
                this.batterySprites.length - 1
            );

            this.batterySprites[index].drawCachedCentered(parameters, position.x, position.y, 12);
        }
    }
}
