import { globalConfig } from "../../core/config";
import { drawRotatedSprite } from "../../core/draw_utils";
import { Loader } from "../../core/loader";
import { enumDirectionToAngle } from "../../core/vector";
import { BeltUnderlaysComponent } from "../components/belt_underlays";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { BELT_ANIM_COUNT } from "./belt";

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
     */
    drawUnderlays(parameters) {
        this.forEachMatchingEntityOnScreen(parameters, this.drawEntityUnderlays.bind(this));
    }

    /**
     * @param {import("../../core/draw_utils").DrawParameters} parameters
     * @param {Entity} entity
     */
    drawEntityUnderlays(parameters, entity) {
        const staticComp = entity.components.StaticMapEntity;
        const underlayComp = entity.components.BeltUnderlays;

        if (!staticComp.shouldBeDrawn(parameters)) {
            return;
        }

        // Limit speed to avoid belts going backwards
        const speedMultiplier = Math.min(this.root.hubGoals.getBeltBaseSpeed(), 10);

        const underlays = underlayComp.underlays;
        for (let i = 0; i < underlays.length; ++i) {
            const { pos, direction } = underlays[i];

            const transformedPos = staticComp.localTileToWorld(pos);
            const angle = enumDirectionToAngle[staticComp.localDirectionToWorld(direction)];

            // SYNC with systems/belt.js:drawSingleEntity!
            const animationIndex = Math.floor(
                ((this.root.time.realtimeNow() * speedMultiplier * BELT_ANIM_COUNT * 126) / 42) *
                    globalConfig.itemSpacingOnBelts
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
