import { GameSystemWithFilter } from "../game_system_with_filter";
import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { Entity } from "../entity";
import { enumDirectionToVector, enumDirectionToAngle } from "../../core/vector";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { Loader } from "../../core/loader";
import { drawRotatedSprite } from "../../core/draw_utils";
import { BELT_ANIM_COUNT } from "./belt";
import { fastArrayDelete } from "../../core/utils";
import { enumLayer } from "../root";

export class ItemAcceptorSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [ItemAcceptorComponent]);

        this.underlayBeltSprites = [];

        for (let i = 0; i < BELT_ANIM_COUNT; ++i) {
            this.underlayBeltSprites.push(Loader.getSprite("sprites/belt/forward_" + i + ".png"));
        }
    }

    update() {
        const progress = this.root.dynamicTickrate.deltaSeconds * 2; // * 2 because its only a half tile

        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const aceptorComp = entity.components.ItemAcceptor;
            const animations = aceptorComp.itemConsumptionAnimations;

            // Process item consumption animations to avoid items popping from the belts
            for (let animIndex = 0; animIndex < animations.length; ++animIndex) {
                const anim = animations[animIndex];
                const layer = aceptorComp.slots[anim.slotIndex].layer;
                anim.animProgress +=
                    progress *
                    this.root.hubGoals.getBeltBaseSpeed(layer) *
                    globalConfig.beltItemSpacingByLayer[layer];
                if (anim.animProgress > 1) {
                    // Original
                    // animations.splice(animIndex, 1);

                    // Faster variant
                    fastArrayDelete(animations, animIndex);

                    animIndex -= 1;
                }
            }
        }
    }

    /**
     * Draws the acceptor items
     * @param {DrawParameters} parameters
     * @param {enumLayer} layer
     */
    drawLayer(parameters, layer) {
        this.forEachMatchingEntityOnScreen(parameters, this.drawEntityRegularLayer.bind(this, layer));
    }

    /**
     * Draws the acceptor underlays
     * @param {DrawParameters} parameters
     * @param {enumLayer} layer
     */
    drawUnderlays(parameters, layer) {
        this.forEachMatchingEntityOnScreen(parameters, this.drawEntityUnderlays.bind(this, layer));
    }

    /**
     * @param {enumLayer} layer
     * @param {DrawParameters} parameters
     * @param {Entity} entity
     */
    drawEntityRegularLayer(layer, parameters, entity) {
        const staticComp = entity.components.StaticMapEntity;
        const acceptorComp = entity.components.ItemAcceptor;

        if (!staticComp.shouldBeDrawn(parameters)) {
            return;
        }

        for (let animIndex = 0; animIndex < acceptorComp.itemConsumptionAnimations.length; ++animIndex) {
            const { item, slotIndex, animProgress, direction } = acceptorComp.itemConsumptionAnimations[
                animIndex
            ];

            const slotData = acceptorComp.slots[slotIndex];
            if (slotData.layer !== layer) {
                // Don't draw non-regular slots for now
                continue;
            }

            const slotWorldPos = staticComp.applyRotationToVector(slotData.pos).add(staticComp.origin);
            const fadeOutDirection = enumDirectionToVector[staticComp.localDirectionToWorld(direction)];
            const finalTile = slotWorldPos.subScalars(
                fadeOutDirection.x * (animProgress / 2 - 0.5),
                fadeOutDirection.y * (animProgress / 2 - 0.5)
            );
            item.draw(
                (finalTile.x + 0.5) * globalConfig.tileSize,
                (finalTile.y + 0.5) * globalConfig.tileSize,
                parameters
            );
        }
    }

    /**
     * @param {enumLayer} layer
     * @param {DrawParameters} parameters
     * @param {Entity} entity
     */
    drawEntityUnderlays(layer, parameters, entity) {
        const staticComp = entity.components.StaticMapEntity;
        const acceptorComp = entity.components.ItemAcceptor;

        if (!staticComp.shouldBeDrawn(parameters)) {
            return;
        }

        // Limit speed to avoid belts going backwards
        const speedMultiplier = Math.min(this.root.hubGoals.getBeltBaseSpeed(layer), 10);

        const underlays = acceptorComp.beltUnderlays;
        for (let i = 0; i < underlays.length; ++i) {
            const { pos, direction, layer: underlayLayer } = underlays[i];
            if (underlayLayer !== layer) {
                // Not our layer
                continue;
            }

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
