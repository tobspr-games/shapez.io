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
    static getId(): any {
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
    clone(): any {
        const staticComp: any = this.components.StaticMapEntity;
        const buildingData: any = getBuildingDataFromCode(staticComp.code);
        const clone: any = buildingData.metaInstance.createEntity({
            root: this.root,
            origin: staticComp.origin,
            originalRotation: staticComp.originalRotation,
            rotation: staticComp.rotation,
            rotationVariant: buildingData.rotationVariant,
            variant: buildingData.variant,
        });
        for (const key: any in this.components) {
            this.components[key] as Component).copyAdditionalStateTo(clone.components[key]);
        }
        return clone;
    }
    /**
     * Adds a new component, only possible until the entity is registered on the entity manager,
     * after that use @see EntityManager.addDynamicComponent
     */
    addComponent(componentInstance: Component, force: boolean = false): any {
        if (!force && this.registered) {
            this.root.entityMgr.attachDynamicComponent(this, componentInstance);
            return;
        }
        assert(force || !this.registered, "Entity already registered, use EntityManager.addDynamicComponent");

        const id: any = (componentInstance.constructor as typeof Component).getId();
        assert(!this.components[id], "Component already present");
        this.components[id] = componentInstance;
    }
    /**
     * Removes a given component, only possible until the entity is registered on the entity manager,
     * after that use @see EntityManager.removeDynamicComponent
     */
    removeComponent(componentClass: typeof Component, force: boolean = false): any {
        if (!force && this.registered) {
            this.root.entityMgr.removeDynamicComponent(this, componentClass);
            return;
        }
        assert(force || !this.registered, "Entity already registered, use EntityManager.removeDynamicComponent");
        const id: any = componentClass.getId();
        assert(this.components[id], "Component does not exist on entity");
        delete this.components[id];
    }
    /**
     * Draws the entity, to override use @see Entity.drawImpl
     */
    drawDebugOverlays(parameters: DrawParameters): any {
        const context: any = parameters.context;
        const staticComp: any = this.components.StaticMapEntity;
        if (G_IS_DEV && staticComp && globalConfig.debug.showEntityBounds) {
            if (staticComp) {
                const transformed: any = staticComp.getTileSpaceBounds();
                context.strokeStyle = "rgba(255, 0, 0, 0.5)";
                context.lineWidth = 2;
                // const boundsSize = 20;
                context.beginPath();
                context.rect(transformed.x * globalConfig.tileSize, transformed.y * globalConfig.tileSize, transformed.w * globalConfig.tileSize, transformed.h * globalConfig.tileSize);
                context.stroke();
            }
        }
        if (G_IS_DEV && staticComp && globalConfig.debug.showAcceptorEjectors) {
            const ejectorComp: any = this.components.ItemEjector;
            if (ejectorComp) {
                const ejectorSprite: any = Loader.getSprite("sprites/debug/ejector_slot.png");
                for (let i: any = 0; i < ejectorComp.slots.length; ++i) {
                    const slot: any = ejectorComp.slots[i];
                    const slotTile: any = staticComp.localTileToWorld(slot.pos);
                    const direction: any = staticComp.localDirectionToWorld(slot.direction);
                    const directionVector: any = enumDirectionToVector[direction];
                    const angle: any = Math.radians(enumDirectionToAngle[direction]);
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
            const acceptorComp: any = this.components.ItemAcceptor;
            if (acceptorComp) {
                const acceptorSprite: any = Loader.getSprite("sprites/misc/acceptor_slot.png");
                for (let i: any = 0; i < acceptorComp.slots.length; ++i) {
                    const slot: any = acceptorComp.slots[i];
                    const slotTile: any = staticComp.localTileToWorld(slot.pos);
                    const direction: any = staticComp.localDirectionToWorld(slot.direction);
                    const directionVector: any = enumDirectionToVector[direction];
                    const angle: any = Math.radians(enumDirectionToAngle[direction] + 180);
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
    drawImpl(parameters: DrawParameters): any {
        abstract;
    }
}
