import { ExplainedResult } from "../core/explained_result";
import { createLogger } from "../core/logging";
import { gComponentRegistry } from "../core/global_registries";
import { SerializerInternal } from "./serializer_internal";

/**
 * @typedef {import("../game/component").Component} Component
 * @typedef {import("../game/component").StaticComponent} StaticComponent
 * @typedef {import("../game/entity").Entity} Entity
 * @typedef {import("../game/root").GameRoot} GameRoot
 * @typedef {import("../savegame/savegame_typedefs").SerializedGame} SerializedGame
 */

const logger = createLogger("savegame_serializer");

/**
 * Serializes a savegame
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
        /** @type {SerializedGame} */
        const data = {
            camera: root.camera.serialize(),
            time: root.time.serialize(),
            map: root.map.serialize(),
            entityMgr: root.entityMgr.serialize(),
            hubGoals: root.hubGoals.serialize(),
            pinnedShapes: root.hud.parts.pinnedShapes.serialize(),
            waypoints: root.hud.parts.waypoints.serialize(),
            entities: this.internal.serializeEntityArray(root.entityMgr.entities),
            beltPaths: root.systemMgr.systems.belt.serializePaths(),
        };

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
        for (let i = 0; i < savegame.entities.length; ++i) {
            /** @type {Entity} */
            const entity = savegame.entities[i];

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
                return ExplainedResult.bad("Entity is missing key 'components': " + JSON.stringify(entity));
            }

            const components = entity.components;
            for (const componentId in components) {
                const componentClass = gComponentRegistry.findById(componentId);

                // Check component id is known
                if (!componentClass) {
                    return ExplainedResult.bad("Unknown component id: " + componentId);
                }

                // Verify component data
                const componentData = components[componentId];
                const componentVerifyError = /** @type {StaticComponent} */ (componentClass).verify(
                    componentData
                );

                // Check component data is ok
                if (componentVerifyError) {
                    return ExplainedResult.bad(
                        "Component " + componentId + " has invalid data: " + componentVerifyError
                    );
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

        errorReason = errorReason || root.entityMgr.deserialize(savegame.entityMgr);
        errorReason = errorReason || root.time.deserialize(savegame.time);
        errorReason = errorReason || root.camera.deserialize(savegame.camera);
        errorReason = errorReason || root.map.deserialize(savegame.map);
        errorReason = errorReason || root.hubGoals.deserialize(savegame.hubGoals);
        errorReason = errorReason || root.hud.parts.pinnedShapes.deserialize(savegame.pinnedShapes);
        errorReason = errorReason || root.hud.parts.waypoints.deserialize(savegame.waypoints);
        errorReason = errorReason || this.internal.deserializeEntityArray(root, savegame.entities);
        errorReason = errorReason || root.systemMgr.systems.belt.deserializePaths(savegame.beltPaths);

        // Check for errors
        if (errorReason) {
            return ExplainedResult.bad(errorReason);
        }

        return ExplainedResult.good();
    }
}
