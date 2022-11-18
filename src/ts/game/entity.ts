/* typehints:start */
import type { DrawParameters } from "../core/draw_parameters";
import type { Component } from "./component";
/* typehints:end */
import { GameRoot } from "./root";
import { globalConfig } from "../core/config";
import { enumDirectionToVector, enumDirectionToAngle } from "../core/vector";
import { BasicSerializableObject, types } from "../savegame/serialization";
import { EntityComponentStorage } from "./entity_components";
import { Loader } from "../core/loader";
import { drawRotatedSprite } from "../core/draw_utils";
import { gComponentRegistry } from "../core/global_registries";
import { getBuildingDataFromCode } from "./building_codes";
export class Entity extends BasicSerializableObject {
    public root = root;
    public components = new EntityComponentStorage();
    public registered = false;
    public layer: Layer = "regular";
    public uid = 0;
    public destroyed: boolean;
    public queuedForDestroy: boolean;
    public destroyReason: string;

        constructor(root) {
        super();
    }
    static getId() {
        return "Entity";
    }
    /**
     * @see BasicSerializableObject.getSchema
     * {}
     */
    static getSchema(): import("../savegame/serialization").Schema {
        return {
            uid: types.uint,
            components: types.keyValueMap(types.objData(gComponentRegistry), false),
        };
    }
    /**
     * Returns a clone of this entity
     */
    clone() {
        const staticComp = this.components.StaticMapEntity;
        const buildingData = getBuildingDataFromCode(staticComp.code);
        const clone = buildingData.metaInstance.createEntity({
            root: this.root,
            origin: staticComp.origin,
            originalRotation: staticComp.originalRotation,
            rotation: staticComp.rotation,
            rotationVariant: buildingData.rotationVariant,
            variant: buildingData.variant,
        });
        for (const key in this.components) {
            this.components[key] as Component).copyAdditionalStateTo(clone.components[key]);
        }
        return clone;
    }
    /**
     * Adds a new component, only possible until the entity is registered on the entity manager,
     * after that use @see EntityManager.addDynamicComponent
     */
    addComponent(componentInstance: Component, force: boolean = false) {
        if (!force && this.registered) {
            this.root.entityMgr.attachDynamicComponent(this, componentInstance);
            return;
        }
        assert(force || !this.registered, "Entity already registered, use EntityManager.addDynamicComponent");

        const id = componentInstance.constructor as typeof Component).getId();
        assert(!this.components[id], "Component already present");
        this.components[id] = componentInstance;
    }
    /**
     * Removes a given component, only possible until the entity is registered on the entity manager,
     * after that use @see EntityManager.removeDynamicComponent
     */
    removeComponent(componentClass: typeof Component, force: boolean = false) {
        if (!force && this.registered) {
            this.root.entityMgr.removeDynamicComponent(this, componentClass);
            return;
        }
        assert(force || !this.registered, "Entity already registered, use EntityManager.removeDynamicComponent");
        const id = componentClass.getId();
        assert(this.components[id], "Component does not exist on entity");
        delete this.components[id];
    }
    /**
     * Draws the entity, to override use @see Entity.drawImpl
     */
    drawDebugOverlays(parameters: DrawParameters) {
        const context = parameters.context;
        const staticComp = this.components.StaticMapEntity;
        if (G_IS_DEV && staticComp && globalConfig.debug.showEntityBounds) {
            if (staticComp) {
                const transformed = staticComp.getTileSpaceBounds();
                context.strokeStyle = "rgba(255, 0, 0, 0.5)";
                context.lineWidth = 2;
                // const boundsSize = 20;
                context.beginPath();
                context.rect(transformed.x * globalConfig.tileSize, transformed.y * globalConfig.tileSize, transformed.w * globalConfig.tileSize, transformed.h * globalConfig.tileSize);
                context.stroke();
            }
        }
        if (G_IS_DEV && staticComp && globalConfig.debug.showAcceptorEjectors) {
            const ejectorComp = this.components.ItemEjector;
            if (ejectorComp) {
                const ejectorSprite = Loader.getSprite("sprites/debug/ejector_slot.png");
                for (let i = 0; i < ejectorComp.slots.length; ++i) {
                    const slot = ejectorComp.slots[i];
                    const slotTile = staticComp.localTileToWorld(slot.pos);
                    const direction = staticComp.localDirectionToWorld(slot.direction);
                    const directionVector = enumDirectionToVector[direction];
                    const angle = Math.radians(enumDirectionToAngle[direction]);
                    context.globalAlpha = slot.item ? 1 : 0.2;
                    drawRotatedSprite({
                        parameters,
                        sprite: ejectorSprite,
                        x: (slotTile.x + 0.5 + directionVector.x * 0.37) * globalConfig.tileSize,
                        y: (slotTile.y + 0.5 + directionVector.y * 0.37) * globalConfig.tileSize,
                        angle,
                        size: globalConfig.tileSize * 0.25,
                    });
                }
            }
            const acceptorComp = this.components.ItemAcceptor;
            if (acceptorComp) {
                const acceptorSprite = Loader.getSprite("sprites/misc/acceptor_slot.png");
                for (let i = 0; i < acceptorComp.slots.length; ++i) {
                    const slot = acceptorComp.slots[i];
                    const slotTile = staticComp.localTileToWorld(slot.pos);
                    const direction = staticComp.localDirectionToWorld(slot.direction);
                    const directionVector = enumDirectionToVector[direction];
                    const angle = Math.radians(enumDirectionToAngle[direction] + 180);
                    context.globalAlpha = 0.4;
                    drawRotatedSprite({
                        parameters,
                        sprite: acceptorSprite,
                        x: (slotTile.x + 0.5 + directionVector.x * 0.37) * globalConfig.tileSize,
                        y: (slotTile.y + 0.5 + directionVector.y * 0.37) * globalConfig.tileSize,
                        angle,
                        size: globalConfig.tileSize * 0.25,
                    });
                }
            }
            context.globalAlpha = 1;
        }
        // this.drawImpl(parameters);
    }
    ///// Helper interfaces
    ///// Interface to override by subclasses
    /**
     * override, should draw the entity
     * @abstract
     */
    drawImpl(parameters: DrawParameters) {
        abstract;
    }
}
