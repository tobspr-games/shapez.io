import { GameSystemWithFilter } from "../game_system_with_filter";
import { EnergyConsumerComponent } from "../components/energy_consumer";
import { Loader } from "../../core/loader";
import { DrawParameters } from "../../core/draw_parameters";
import { Entity } from "../entity";
import { enableImageSmoothing } from "../../core/buffer_utils";

export class EnergyConsumerSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [EnergyConsumerComponent]);

        this.batterySprites = [
            Loader.getSprite("sprites/wires/battery_empty.png"),
            Loader.getSprite("sprites/wires/battery_low.png"),
            Loader.getSprite("sprites/wires/battery_medium.png"),
            Loader.getSprite("sprites/wires/battery_full.png"),
        ];
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

        const percentage = consumerComp.stored / consumerComp.bufferSize;

        const index = Math.floor(percentage * this.batterySprites.length);
        this.batterySprites[index].drawCachedCentered(parameters, position.x, position.y, 12);
    }
}
