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
     * @returns {object}
     */
    generateDumpFromGameRoot(root, sanityChecks = true) {
        // Finalize particles before saving (Like granting destroy indicator rewards)
        // root.particleMgr.finalizeBeforeSave();
        // root.uiParticleMgr.finalizeBeforeSave();

        // Now store generic savegame payload
        const data = {
            camera: root.camera.serialize(),
            time: root.time.serialize(),
            map: root.map.serialize(),
            entityMgr: root.entityMgr.serialize(),
            hubGoals: root.hubGoals.serialize(),
            pinnedShapes: root.hud.parts.pinnedShapes.serialize(),
        };

        data.entities = this.internal.serializeEntityArray(root.entityMgr.entities);

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
     * @param {object} savegame
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
     * @param {import("./savegame_typedefs").SerializedGame} savegame
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

        errorReason = errorReason || root.entityMgr.deserialize(savegame.entityMgr);
        errorReason = errorReason || root.time.deserialize(savegame.time);
        errorReason = errorReason || root.camera.deserialize(savegame.camera);
        errorReason = errorReason || root.map.deserialize(savegame.map);
        errorReason = errorReason || root.hubGoals.deserialize(savegame.hubGoals);
        errorReason = errorReason || root.hud.parts.pinnedShapes.deserialize(savegame.pinnedShapes);
        errorReason = errorReason || this.internal.deserializeEntityArray(root, savegame.entities);

        // Check for errors
        if (errorReason) {
            return ExplainedResult.bad(errorReason);
        }

        return ExplainedResult.good();
    }
}
