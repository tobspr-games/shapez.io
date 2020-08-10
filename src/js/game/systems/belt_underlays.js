import { GameSystemWithFilter } from "../game_system_with_filter";
import { BeltUnderlaysComponent } from "../components/belt_underlays";
import { BELT_ANIM_COUNT } from "./belt";
import { Loader } from "../../core/loader";
import { enumLayer } from "../root";
import { Entity } from "../entity";
import { enumDirectionToAngle } from "../../core/vector";
import { globalConfig } from "../../core/config";
import { drawRotatedSprite } from "../../core/draw_utils";

export class BeltUnderlaysSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [BeltUnderlaysComponent]);

        this.underlayBeltSprites = [];

        for (let i = 0; i < BELT_ANIM_COUNT; ++i) {
            this.underlayBeltSprites.push(Loader.getSprite("sprites/belt/forward_" + i + ".png"));
        }
    }

    /**
     * Draws the acceptor underlays
     * @param {import("../../core/draw_utils").DrawParameters} parameters
     * @param {enumLayer} layer
     */
    drawUnderlays(parameters, layer) {
        this.forEachMatchingEntityOnScreen(parameters, this.drawEntityUnderlays.bind(this, layer));
    }

    /**
     * @param {enumLayer} layer
     * @param {import("../../core/draw_utils").DrawParameters} parameters
     * @param {Entity} entity
     */
    drawEntityUnderlays(layer, parameters, entity) {
        const staticComp = entity.components.StaticMapEntity;
        const underlayComp = entity.components.BeltUnderlays;

        if (entity.layer !== layer) {
            // Not our layer
            return;
        }

        if (!staticComp.shouldBeDrawn(parameters)) {
            return;
        }

        // Limit speed to avoid belts going backwards
        const speedMultiplier = Math.min(this.root.hubGoals.getBeltBaseSpeed(layer), 10);

        const underlays = underlayComp.underlays;
        for (let i = 0; i < underlays.length; ++i) {
            const { pos, direction } = underlays[i];

            const transformedPos = staticComp.localTileToWorld(pos);
            const angle = enumDirectionToAngle[staticComp.localDirectionToWorld(direction)];

            // SYNC with systems/belt.js:drawSingleEntity!
            const animationIndex = Math.floor(
                ((this.root.time.realtimeNow() * speedMultiplier * BELT_ANIM_COUNT * 126) / 42) *
                    globalConfig.beltItemSpacingByLayer[layer]
            );

            drawRotatedSprite({
                parameters,
                sprite: this.underlayBeltSprites[animationIndex % this.underlayBeltSprites.length],
                x: (transformedPos.x + 0.5) * globalConfig.tileSize,
                y: (transformedPos.y + 0.5) * globalConfig.tileSize,
                angle: Math.radians(angle),
                size: globalConfig.tileSize,
            });
        }
    }
}
