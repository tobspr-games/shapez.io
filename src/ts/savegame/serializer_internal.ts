import { globalConfig } from "../core/config";
import { createLogger } from "../core/logging";
import { Vector } from "../core/vector";
import { getBuildingDataFromCode } from "../game/building_codes";
import { Entity } from "../game/entity";
import { GameRoot } from "../game/root";
const logger: any = createLogger("serializer_internal");
// Internal serializer methods
export class SerializerInternal {
    /**
     * Serializes an array of entities
     */
    serializeEntityArray(array: Array<Entity>): any {
        const serialized: any = [];
        for (let i: any = 0; i < array.length; ++i) {
            const entity: any = array[i];
            if (!entity.queuedForDestroy && !entity.destroyed) {
                serialized.push(entity.serialize());
            }
        }
        return serialized;
    }
    /**
     *
     * {}
     */
    deserializeEntityArray(root: GameRoot, array: Array<Entity>): string | void {
        for (let i: any = 0; i < array.length; ++i) {
            this.deserializeEntity(root, array[i]);
        }
    }
        deserializeEntity(root: GameRoot, payload: Entity): any {
        const staticData: any = payload.components.StaticMapEntity;
        assert(staticData, "entity has no static data");
        const code: any = staticData.code;
        const data: any = getBuildingDataFromCode(code);
        const metaBuilding: any = data.metaInstance;
        const entity: any = metaBuilding.createEntity({
            root,
            origin: Vector.fromSerializedObject(staticData.origin),
            rotation: staticData.rotation,
            originalRotation: staticData.originalRotation,
            rotationVariant: data.rotationVariant,
            variant: data.variant,
        });
        entity.uid = payload.uid;
        this.deserializeComponents(root, entity, payload.components);
        root.entityMgr.registerEntity(entity, payload.uid);
        root.map.placeStaticEntity(entity);
    }
    /////// COMPONENTS ////
    /**
     * Deserializes components of an entity
     * {}
     */
    deserializeComponents(root: GameRoot, entity: Entity, data: {
        [idx: string]: any;
    }): string | void {
        for (const componentId: any in data) {
            if (!entity.components[componentId]) {
                if (G_IS_DEV && !globalConfig.debug.disableSlowAsserts) {
                    // @ts-ignore
                    if (++window.componentWarningsShown < 100) {
                        logger.warn("Entity no longer has component:", componentId);
                    }
                }
                continue;
            }
            const errorStatus: any = entity.components[componentId].deserialize(data[componentId], root);
            if (errorStatus) {
                return errorStatus;
            }
        }
    }
}
