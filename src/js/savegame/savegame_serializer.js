/* typehints:start */
import { Component } from "../game/component";
import { GameRoot } from "../game/root";
/* typehints:end */

import { JSON_stringify } from "../core/builtins";
import { ExplainedResult } from "../core/explained_result";
import { createLogger } from "../core/logging";
// import { BuildingComponent } from "../components/impl/building";
import { gComponentRegistry } from "../core/global_registries";
import { SerializerInternal } from "./serializer_internal";

const logger = createLogger("savegame_serializer");

/**
 * Allows to serialize a savegame
 */
export class SavegameSerializer {
    constructor() {
        this.internal = new SerializerInternal();
    }

    /**
     * Serializes the game root into a dump
     * @param {GameRoot} root
     * @param {boolean=} sanityChecks Whether to check for validity
     * @returns {SerializedGame}
     */
    generateDumpFromGameRoot(root, sanityChecks = true) {
        // Finalize particles before saving (Like granting destroy indicator rewards)
        // root.particleMgr.finalizeBeforeSave();
        // root.uiParticleMgr.finalizeBeforeSave();

        // Now store generic savegame payload
        const data = /** @type {SerializedGame} */ ({
            camera: root.camera.serialize(),
            time: root.time.serialize(),
            entityMgr: root.entityMgr.serialize(),
            entities: {},
        });

        // Serialize all types of entities
        const serializeEntities = component =>
            this.internal.serializeEntityArray(root.entityMgr.getAllWithComponent(component));
        const serializeEntitiesFixed = component =>
            this.internal.serializeEntityArrayFixedType(root.entityMgr.getAllWithComponent(component));

        // data.entities.resources = serializeEntitiesFixed(RawMaterialComponent);
        // data.entities.buildings = serializeEntities(BuildingComponent);

        if (!G_IS_RELEASE) {
            if (sanityChecks) {
                // Sanity check
                const sanity = this.verifyLogicalErrors(data);
                if (!sanity.result) {
                    logger.error("Created invalid savegame:", sanity.reason, "savegame:", data);
                    return null;
                }
            }
        }

        return data;
    }

    /**
     * Verifies if there are logical errors in the savegame
     * @param {SerializedGame} savegame
     * @returns {ExplainedResult}
     */
    verifyLogicalErrors(savegame) {
        if (!savegame.entities) {
            return ExplainedResult.bad("Savegame has no entities");
        }

        const seenUids = [];

        // Check for duplicate UIDS
        for (const entityListId in savegame.entities) {
            for (let i = 0; i < savegame.entities[entityListId].length; ++i) {
                const list = savegame.entities[entityListId][i];
                for (let k = 0; k < list.length; ++k) {
                    const entity = list[k];
                    const uid = entity.uid;
                    if (!Number.isInteger(uid)) {
                        return ExplainedResult.bad("Entity has invalid uid: " + uid);
                    }
                    if (seenUids.indexOf(uid) >= 0) {
                        return ExplainedResult.bad("Duplicate uid " + uid);
                    }
                    seenUids.push(uid);

                    // Verify components
                    if (!entity.components) {
                        return ExplainedResult.bad(
                            "Entity is missing key 'components': " + JSON_stringify(entity)
                        );
                    }
                    const components = entity.components;
                    for (const componentId in components) {
                        // Verify component data
                        const componentData = components[componentId];
                        const componentClass = gComponentRegistry.findById(componentId);

                        // Check component id is known
                        if (!componentClass) {
                            return ExplainedResult.bad("Unknown component id: " + componentId);
                        }

                        // Check component data is ok
                        const componentVerifyError = /** @type {typeof Component} */ (componentClass).verify(
                            componentData
                        );
                        if (componentVerifyError) {
                            return ExplainedResult.bad(
                                "Component " + componentId + " has invalid data: " + componentVerifyError
                            );
                        }
                    }
                }
            }
        }

        return ExplainedResult.good();
    }

    /**
     * Tries to load the savegame from a given dump
     * @param {SerializedGame} savegame
     * @param {GameRoot} root
     * @returns {ExplainedResult}
     */
    deserialize(savegame, root) {
        // Sanity
        const verifyResult = this.verifyLogicalErrors(savegame);
        if (!verifyResult.result) {
            return ExplainedResult.bad(verifyResult.reason);
        }

        let errorReason = null;

        // entities
        errorReason = errorReason || root.entityMgr.deserialize(savegame.entityMgr);

        // resources
        errorReason =
            errorReason ||
            this.internal.deserializeEntityArrayFixedType(
                root,
                savegame.entities.resources,
                this.internal.deserializeResource
            );

        // buildings
        errorReason =
            errorReason ||
            this.internal.deserializeEntityArray(
                root,
                savegame.entities.buildings,
                this.internal.deserializeBuilding
            );

        // other stuff
        errorReason = errorReason || root.time.deserialize(savegame.time);
        errorReason = errorReason || root.camera.deserialize(savegame.camera);

        // Check for errors
        if (errorReason) {
            return ExplainedResult.bad(errorReason);
        }

        return ExplainedResult.good();
    }

    /////////// MIGRATION HELPERS ///////////

    /**
     * Performs a function on each component (useful to add / remove / alter properties for migration)
     * @param {SerializedGame} savegame
     * @param {typeof Component} componentHandle
     * @param {function} modifier
     */
    migration_migrateComponent(savegame, componentHandle, modifier) {
        const targetId = componentHandle.getId();
        for (const entityListId in savegame.entities) {
            for (let i = 0; i < savegame.entities[entityListId].length; ++i) {
                const list = savegame.entities[entityListId][i];
                for (let k = 0; k < list.length; ++k) {
                    const entity = list[k];
                    const components = entity.components;
                    if (components[targetId]) {
                        modifier(components[targetId]);
                    }
                }
            }
        }
    }

    /**
     * Performs an operation on each object which is a PooledObject (usually Projectiles). Useful to
     * perform migrations
     * @param {Array<any>} pools
     * @param {string} targetClassKey
     * @param {function} modifier
     */
    migration_migrateGenericObjectPool(pools, targetClassKey, modifier) {
        for (let i = 0; i < pools.length; ++i) {
            const pool = pools[i];
            if (pool.key === targetClassKey) {
                const entries = pool.data.entries;
                for (const uid in entries) {
                    modifier(entries[uid]);
                }
            }
        }
    }
}
