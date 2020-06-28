import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { WiredPinsComponent, enumPinSlotType } from "../components/wired_pins";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { MapChunkView } from "../map_chunk_view";
import { Loader } from "../../core/loader";

export class WiredPinsSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [WiredPinsComponent]);

        this.pinSprites = {
            [enumPinSlotType.positiveEnergyEjector]: Loader.getSprite(
                "sprites/wires/pin-positive-energy.png"
            ),
            [enumPinSlotType.negativeEnergyAcceptor]: Loader.getSprite(
                "sprites/wires/pin-negative-energy.png"
            ),
        };
    }

    update() {
        // TODO
    }

    /**
     * Draws the given layer
     * @param {DrawParameters} parameters
     */
    draw(parameters) {
        this.forEachMatchingEntityOnScreen(parameters, this.drawSingleEntity.bind(this));
    }

    /**
     * Draws a given chunk
     * @param {DrawParameters} parameters
     * @param {Entity} entity
     */
    drawSingleEntity(parameters, entity) {
        const staticComp = entity.components.StaticMapEntity;
        const slots = entity.components.WiredPins.slots;

        for (let i = 0; i < slots.length; ++i) {
            const slot = slots[i];
            const tile = staticComp.localTileToWorld(slot.pos);

            const worldPos = tile.toWorldSpaceCenterOfTile();

            this.pinSprites[slot.type].drawCachedCentered(
                parameters,
                worldPos.x,
                worldPos.y,
                globalConfig.tileSize
            );
        }
    }
}
