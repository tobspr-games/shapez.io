import { GameSystemWithFilter } from "../game_system_with_filter";
import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { Entity } from "../entity";
import { enumDirectionToVector, enumDirectionToAngle } from "../../core/vector";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { Loader } from "../../core/loader";
import { drawRotatedSprite } from "../../core/draw_utils";
import { Math_radians } from "../../core/builtins";

export class ItemAcceptorSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [ItemAcceptorComponent]);

        this.underlayBeltSprites = [
            Loader.getSprite("sprites/belt/forward_0.png"),
            Loader.getSprite("sprites/belt/forward_1.png"),
            Loader.getSprite("sprites/belt/forward_2.png"),
            Loader.getSprite("sprites/belt/forward_3.png"),
            Loader.getSprite("sprites/belt/forward_4.png"),
            Loader.getSprite("sprites/belt/forward_5.png"),
        ];
    }

    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const aceptorComp = entity.components.ItemAcceptor;

            // Process item consumption animations to avoid items popping from the belts
            for (let animIndex = 0; animIndex < aceptorComp.itemConsumptionAnimations.length; ++animIndex) {
                const anim = aceptorComp.itemConsumptionAnimations[animIndex];
                anim.animProgress +=
                    globalConfig.physicsDeltaSeconds * this.root.hubGoals.getBeltBaseSpeed() * 2;
                if (anim.animProgress > 1) {
                    aceptorComp.itemConsumptionAnimations.splice(animIndex, 1);
                    animIndex -= 1;
                }
            }
        }
    }

    draw(parameters) {
        this.forEachMatchingEntityOnScreen(parameters, this.drawEntity.bind(this));
    }

    drawUnderlays(parameters) {
        this.forEachMatchingEntityOnScreen(parameters, this.drawEntityUnderlays.bind(this));
    }

    /**
     * @param {DrawParameters} parameters
     * @param {Entity} entity
     */
    drawEntity(parameters, entity) {
        const staticComp = entity.components.StaticMapEntity;
        const acceptorComp = entity.components.ItemAcceptor;

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

    /**
     * @param {DrawParameters} parameters
     * @param {Entity} entity
     */
    drawEntityUnderlays(parameters, entity) {
        const staticComp = entity.components.StaticMapEntity;
        const acceptorComp = entity.components.ItemAcceptor;

        const underlays = acceptorComp.beltUnderlays;
        for (let i = 0; i < underlays.length; ++i) {
            const { pos, direction } = underlays[i];

            const transformedPos = staticComp.localTileToWorld(pos);
            const angle = enumDirectionToAngle[staticComp.localDirectionToWorld(direction)];

            // SYNC with systems/belt.js:drawSingleEntity!
            const animationIndex = Math.floor(
                (this.root.time.now() *
                    this.root.hubGoals.getBeltBaseSpeed() *
                    this.underlayBeltSprites.length *
                    126) /
                    42
            );

            drawRotatedSprite({
                parameters,
                sprite: this.underlayBeltSprites[animationIndex % this.underlayBeltSprites.length],
                x: (transformedPos.x + 0.5) * globalConfig.tileSize,
                y: (transformedPos.y + 0.5) * globalConfig.tileSize,
                angle: Math_radians(angle),
                size: globalConfig.tileSize,
            });
        }
    }
}
