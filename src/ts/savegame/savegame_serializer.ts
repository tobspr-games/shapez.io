import { ExplainedResult } from "../core/explained_result";
import { gComponentRegistry } from "../core/global_registries";
import { createLogger } from "../core/logging";
import { MOD_SIGNALS } from "../mods/mod_signals";
import { SerializerInternal } from "./serializer_internal";
export type Component = import("../game/component").Component;
export type StaticComponent = import("../game/component").StaticComponent;
export type Entity = import("../game/entity").Entity;
export type GameRoot = import("../game/root").GameRoot;
export type SerializedGame = import("./savegame_typedefs").SerializedGame;

const logger: any = createLogger("savegame_serializer");
/**
 * Serializes a savegame
 */
export class SavegameSerializer {
    public internal = new SerializerInternal();

    constructor() {
    }
    /**
     * Serializes the game root into a dump
     * {}
     */
    generateDumpFromGameRoot(root: GameRoot, sanityChecks: boolean= = true): object {
                const data: SerializedGame = {
            camera: root.camera.serialize(),
            time: root.time.serialize(),
            map: root.map.serialize(),
            gameMode: root.gameMode.serialize(),
            entityMgr: root.entityMgr.serialize(),
            hubGoals: root.hubGoals.serialize(),
            entities: this.internal.serializeEntityArray(root.entityMgr.entities),
            beltPaths: root.systemMgr.systems.belt.serializePaths(),
            pinnedShapes: root.hud.parts.pinnedShapes ? root.hud.parts.pinnedShapes.serialize() : null,
            waypoints: root.hud.parts.waypoints ? root.hud.parts.waypoints.serialize() : null,
            modExtraData: {},
        };
        MOD_SIGNALS.gameSerialized.dispatch(root, data);
        if (G_IS_DEV) {
            if (sanityChecks) {
                // Sanity check
                const sanity: any = this.verifyLogicalErrors(data);
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
     * {}
     */
    verifyLogicalErrors(savegame: SerializedGame): ExplainedResult {
        if (!savegame.entities) {
            return ExplainedResult.bad("Savegame has no entities");
        }
        const seenUids: any = new Set();
        // Check for duplicate UIDS
        for (let i: any = 0; i < savegame.entities.length; ++i) {
                        const entity: Entity = savegame.entities[i];
            const uid: any = entity.uid;
            if (!Number.isInteger(uid)) {
                return ExplainedResult.bad("Entity has invalid uid: " + uid);
            }
            if (seenUids.has(uid)) {
                return ExplainedResult.bad("Duplicate uid " + uid);
            }
            seenUids.add(uid);
            // Verify components
            if (!entity.components) {
                return ExplainedResult.bad("Entity is missing key 'components': " + JSON.stringify(entity));
            }
            const components: any = entity.components;
            for (const componentId: any in components) {
                const componentClass: any = gComponentRegistry.findById(componentId);
                // Check component id is known
                if (!componentClass) {
                    return ExplainedResult.bad("Unknown component id: " + componentId);
                }
                // Verify component data
                const componentData: any = components[componentId];
                const componentVerifyError: any = (componentClass as StaticComponent).verify(componentData);
                // Check component data is ok
                if (componentVerifyError) {
                    return ExplainedResult.bad("Component " + componentId + " has invalid data: " + componentVerifyError);
                }
            }
        }
        return ExplainedResult.good();
    }
    /**
     * Tries to load the savegame from a given dump
     * {}
     */
    deserialize(savegame: SerializedGame, root: GameRoot): ExplainedResult {
        // Sanity
        const verifyResult: any = this.verifyLogicalErrors(savegame);
        if (!verifyResult.result) {
            return ExplainedResult.bad(verifyResult.reason);
        }
        let errorReason: any = null;
        errorReason = errorReason || root.entityMgr.deserialize(savegame.entityMgr);
        errorReason = errorReason || root.time.deserialize(savegame.time);
        errorReason = errorReason || root.camera.deserialize(savegame.camera);
        errorReason = errorReason || root.map.deserialize(savegame.map);
        errorReason = errorReason || root.gameMode.deserialize(savegame.gameMode);
        errorReason = errorReason || root.hubGoals.deserialize(savegame.hubGoals, root);
        errorReason = errorReason || this.internal.deserializeEntityArray(root, savegame.entities);
        errorReason = errorReason || root.systemMgr.systems.belt.deserializePaths(savegame.beltPaths);
        if (root.hud.parts.pinnedShapes) {
            errorReason = errorReason || root.hud.parts.pinnedShapes.deserialize(savegame.pinnedShapes);
        }
        if (root.hud.parts.waypoints) {
            errorReason = errorReason || root.hud.parts.waypoints.deserialize(savegame.waypoints);
        }
        // Check for errors
        if (errorReason) {
            return ExplainedResult.bad(errorReason);
        }
        // Mods
        MOD_SIGNALS.gameDeserialized.dispatch(root, savegame);
        return ExplainedResult.good();
    }
}
