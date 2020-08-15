import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { fastArrayDelete } from "../../core/utils";
import { enumDirectionToVector } from "../../core/vector";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";

export class ItemAcceptorSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [ItemAcceptorComponent]);
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
                anim.animProgress +=
                    progress * this.root.hubGoals.getBeltBaseSpeed() * globalConfig.itemSpacingOnBelts;
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
     */
    draw(parameters) {
        this.forEachMatchingEntityOnScreen(parameters, this.drawEntityRegularLayer.bind(this));
    }

    /**
     * @param {DrawParameters} parameters
     * @param {Entity} entity
     */
    drawEntityRegularLayer(parameters, entity) {
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
}
