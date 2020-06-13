/* typehints:start */
import { GameRoot } from "./root";
import { DrawParameters } from "../core/draw_parameters";
import { Component } from "./component";
/* typehints:end */

import { globalConfig } from "../core/config";
import { enumDirectionToVector, enumDirectionToAngle } from "../core/vector";
import { BasicSerializableObject, types } from "../savegame/serialization";
import { EntityComponentStorage } from "./entity_components";
import { Loader } from "../core/loader";
import { drawRotatedSprite } from "../core/draw_utils";
import { Math_radians } from "../core/builtins";
import { gComponentRegistry } from "../core/global_registries";

export class Entity extends BasicSerializableObject {
    /**
     * @param {GameRoot} root
     */
    constructor(root) {
        super();

        /**
         * Handle to the global game root
         */
        this.root = root;

        /**
         * The components of the entity
         */
        this.components = new EntityComponentStorage();

        /**
         * Whether this entity was registered on the @see EntityManager so far
         */
        this.registered = false;

        /**
         * Internal entity unique id, set by the @see EntityManager
         */
        this.uid = 0;

        /* typehints:start */

        /**
         * Stores if this entity is destroyed, set by the @see EntityManager
         * @type {boolean} */
        this.destroyed;

        /**
         * Stores if this entity is queued to get destroyed in the next tick
         * of the @see EntityManager
         * @type {boolean} */
        this.queuedForDestroy;

        /**
         * Stores the reason why this entity was destroyed
         * @type {string} */
        this.destroyReason;

        /* typehints:end */
    }

    static getId() {
        return "Entity";
    }

    /**
     * @see BasicSerializableObject.getSchema
     * @returns {import("../savegame/serialization").Schema}
     */
    static getSchema() {
        return {
            uid: types.uint,
            components: types.keyValueMap(types.objData(gComponentRegistry)),
        };
    }

    /**
     * Returns a clone of this entity without contents
     */
    duplicateWithoutContents() {
        const clone = new Entity(this.root);
        for (const key in this.components) {
            clone.components[key] = this.components[key].duplicateWithoutContents();
        }
        return clone;
    }

    /**
     * Internal destroy callback
     */
    internalDestroyCallback() {
        assert(!this.destroyed, "Can not destroy entity twice");
        this.destroyed = true;
    }

    /**
     * Adds a new component, only possible until the entity is registered on the entity manager,
     * after that use @see EntityManager.addDynamicComponent
     * @param {Component} componentInstance
     * @param {boolean} force Used by the entity manager. Internal parameter, do not change
     */
    addComponent(componentInstance, force = false) {
        if (!force && this.registered) {
            this.root.entityMgr.attachDynamicComponent(this, componentInstance);
            return;
        }
        assert(force || !this.registered, "Entity already registered, use EntityManager.addDynamicComponent");
        const id = /** @type {typeof Component} */ (componentInstance.constructor).getId();
        assert(!this.components[id], "Component already present");
        this.components[id] = componentInstance;
    }

    /**
     * Removes a given component, only possible until the entity is registered on the entity manager,
     * after that use @see EntityManager.removeDynamicComponent
     * @param {typeof Component} componentClass
     * @param {boolean} force
     */
    removeComponent(componentClass, force = false) {
        if (!force && this.registered) {
            this.root.entityMgr.removeDynamicComponent(this, componentClass);
            return;
        }
        assert(
            force || !this.registered,
            "Entity already registered, use EntityManager.removeDynamicComponent"
        );
        const id = componentClass.getId();
        assert(this.components[id], "Component does not exist on entity");
        delete this.components[id];
    }

    /**
     * Draws the entity, to override use @see Entity.drawImpl
     * @param {DrawParameters} parameters
     */
    drawDebugOverlays(parameters) {
        const context = parameters.context;
        const staticComp = this.components.StaticMapEntity;

        if (G_IS_DEV && staticComp && globalConfig.debug.showEntityBounds) {
            if (staticComp) {
                const transformed = staticComp.getTileSpaceBounds();
                context.strokeStyle = "rgba(255, 0, 0, 0.5)";
                context.lineWidth = 2;
                // const boundsSize = 20;
                context.beginPath();
                context.rect(
                    transformed.x * globalConfig.tileSize,
                    transformed.y * globalConfig.tileSize,
                    transformed.w * globalConfig.tileSize,
                    transformed.h * globalConfig.tileSize
                );
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
                    const angle = Math_radians(enumDirectionToAngle[direction]);

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
                const acceptorSprite = Loader.getSprite("sprites/debug/acceptor_slot.png");
                for (let i = 0; i < acceptorComp.slots.length; ++i) {
                    const slot = acceptorComp.slots[i];
                    const slotTile = staticComp.localTileToWorld(slot.pos);
                    for (let k = 0; k < slot.directions.length; ++k) {
                        const direction = staticComp.localDirectionToWorld(slot.directions[k]);
                        const directionVector = enumDirectionToVector[direction];
                        const angle = Math_radians(enumDirectionToAngle[direction] + 180);
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
            }

            context.globalAlpha = 1;
        }
        // this.drawImpl(parameters);
    }

    ///// Helper interfaces

    ///// Interface to override by subclasses

    /**
     * override, should draw the entity
     * @param {DrawParameters} parameters
     */
    drawImpl(parameters) {
        abstract;
    }
}
