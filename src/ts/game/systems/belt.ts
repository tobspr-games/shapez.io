import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { gMetaBuildingRegistry } from "../../core/global_registries";
import { Loader } from "../../core/loader";
import { createLogger } from "../../core/logging";
import { AtlasSprite } from "../../core/sprites";
import { fastArrayDeleteValue } from "../../core/utils";
import { enumDirection, enumDirectionToVector, enumInvertedDirections, Vector } from "../../core/vector";
import { BeltPath } from "../belt_path";
import { arrayBeltVariantToRotation, MetaBeltBuilding } from "../buildings/belt";
import { getCodeFromBuildingData } from "../building_codes";
import { BeltComponent } from "../components/belt";
import { Entity } from "../entity";
import { GameSystem } from "../game_system";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { MapChunkView } from "../map_chunk_view";
import { defaultBuildingVariant } from "../meta_building";
export const BELT_ANIM_COUNT: any = 14;
const logger: any = createLogger("belt");
/**
 * Manages all belts
 */
export class BeltSystem extends GameSystem {
    public beltSprites: {
        [idx: enumDirection]: Array<AtlasSprite>;
    } = {
        [enumDirection.top]: Loader.getSprite("sprites/belt/built/forward_0.png"),
        [enumDirection.left]: Loader.getSprite("sprites/belt/built/left_0.png"),
        [enumDirection.right]: Loader.getSprite("sprites/belt/built/right_0.png"),
    };
    public beltAnimations: {
        [idx: enumDirection]: Array<AtlasSprite>;
    } = {
        [enumDirection.top]: [],
        [enumDirection.left]: [],
        [enumDirection.right]: [],
    };
    public beltPaths: Array<BeltPath> = [];

    constructor(root) {
        super(root);
        for (let i: any = 0; i < BELT_ANIM_COUNT; ++i) {
            this.beltAnimations[enumDirection.top].push(Loader.getSprite("sprites/belt/built/forward_" + i + ".png"));
            this.beltAnimations[enumDirection.left].push(Loader.getSprite("sprites/belt/built/left_" + i + ".png"));
            this.beltAnimations[enumDirection.right].push(Loader.getSprite("sprites/belt/built/right_" + i + ".png"));
        }
        this.root.signals.entityDestroyed.add(this.onEntityDestroyed, this);
        this.root.signals.entityDestroyed.add(this.updateSurroundingBeltPlacement, this);
        // Notice: These must come *after* the entity destroyed signals
        this.root.signals.entityAdded.add(this.onEntityAdded, this);
        this.root.signals.entityAdded.add(this.updateSurroundingBeltPlacement, this);
    }
    /**
     * Serializes all belt paths
     * {}
     */
    serializePaths(): Array<object> {
        let data: any = [];
        for (let i: any = 0; i < this.beltPaths.length; ++i) {
            data.push(this.beltPaths[i].serialize());
        }
        return data;
    }
    /**
     * Deserializes all belt paths
     */
    deserializePaths(data: Array<any>): any {
        if (!Array.isArray(data)) {
            return "Belt paths are not an array: " + typeof data;
        }
        for (let i: any = 0; i < data.length; ++i) {
            const path: any = BeltPath.fromSerialized(this.root, data[i]);
            // If path is a string, that means its an error
            if (!(path instanceof BeltPath)) {
                return "Failed to create path from belt data: " + path;
            }
            this.beltPaths.push(path);
        }
        if (this.beltPaths.length === 0) {
            // Old savegames might not have paths yet
            logger.warn("Recomputing belt paths (most likely the savegame is old or empty)");
            this.recomputeAllBeltPaths();
        }
        else {
            logger.warn("Restored", this.beltPaths.length, "belt paths");
        }
        if (G_IS_DEV && globalConfig.debug.checkBeltPaths) {
            this.debug_verifyBeltPaths();
        }
    }
    /**
     * Updates the belt placement after an entity has been added / deleted
     */
    updateSurroundingBeltPlacement(entity: Entity): any {
        if (!this.root.gameInitialized) {
            return;
        }
        const staticComp: any = entity.components.StaticMapEntity;
        if (!staticComp) {
            return;
        }
        const metaBelt: any = gMetaBuildingRegistry.findByClass(MetaBeltBuilding);
        // Compute affected area
        const originalRect: any = staticComp.getTileSpaceBounds();
        const affectedArea: any = originalRect.expandedInAllDirections(1);
                const changedPaths: Set<BeltPath> = new Set();
        for (let x: any = affectedArea.x; x < affectedArea.right(); ++x) {
            for (let y: any = affectedArea.y; y < affectedArea.bottom(); ++y) {
                if (originalRect.containsPoint(x, y)) {
                    // Make sure we don't update the original entity
                    continue;
                }
                const targetEntities: any = this.root.map.getLayersContentsMultipleXY(x, y);
                for (let i: any = 0; i < targetEntities.length; ++i) {
                    const targetEntity: any = targetEntities[i];
                    const targetBeltComp: any = targetEntity.components.Belt;
                    const targetStaticComp: any = targetEntity.components.StaticMapEntity;
                    if (!targetBeltComp) {
                        // Not a belt
                        continue;
                    }
                    const { rotation, rotationVariant, }: any = metaBelt.computeOptimalDirectionAndRotationVariantAtTile({
                        root: this.root,
                        tile: new Vector(x, y),
                        rotation: targetStaticComp.originalRotation,
                        variant: defaultBuildingVariant,
                        layer: targetEntity.layer,
                    });
                    // Compute delta to see if anything changed
                    const newDirection: any = arrayBeltVariantToRotation[rotationVariant];
                    if (!this.root.immutableOperationRunning &&
                        (targetStaticComp.rotation !== rotation || newDirection !== targetBeltComp.direction)) {
                        const originalPath: any = targetBeltComp.assignedPath;
                        // Ok, first remove it from its current path
                        this.deleteEntityFromPath(targetBeltComp.assignedPath, targetEntity);
                        // Change stuff
                        targetStaticComp.rotation = rotation;
                        metaBelt.updateVariants(targetEntity, rotationVariant, defaultBuildingVariant);
                        // Update code as well
                        targetStaticComp.code = getCodeFromBuildingData(metaBelt, defaultBuildingVariant, rotationVariant);
                        // Update the original path since it might have picked up the entit1y
                        originalPath.onPathChanged();
                        // Now add it again
                        this.addEntityToPaths(targetEntity);
                        // Sanity
                        if (G_IS_DEV && globalConfig.debug.checkBeltPaths) {
                            this.debug_verifyBeltPaths();
                        }
                        // Make sure the chunks know about the update
                        this.root.signals.entityChanged.dispatch(targetEntity);
                    }
                    if (targetBeltComp.assignedPath) {
                        changedPaths.add(targetBeltComp.assignedPath);
                    }
                }
            }
        }
        // notify all paths *afterwards* to avoid multi-updates
        changedPaths.forEach((path: any): any => path.onSurroundingsChanged());
        if (G_IS_DEV && globalConfig.debug.checkBeltPaths) {
            this.debug_verifyBeltPaths();
        }
    }
    /**
     * Called when an entity got destroyed
     */
    onEntityDestroyed(entity: Entity): any {
        if (!this.root.gameInitialized) {
            return;
        }
        if (!entity.components.Belt) {
            return;
        }
        const assignedPath: any = entity.components.Belt.assignedPath;
        assert(assignedPath, "Entity has no belt path assigned");
        this.deleteEntityFromPath(assignedPath, entity);
        if (G_IS_DEV && globalConfig.debug.checkBeltPaths) {
            this.debug_verifyBeltPaths();
        }
    }
    /**
     * Attempts to delete the belt from its current path
     */
    deleteEntityFromPath(path: BeltPath, entity: Entity): any {
        if (path.entityPath.length === 1) {
            // This is a single entity path, easy to do, simply erase whole path
            fastArrayDeleteValue(this.beltPaths, path);
            return;
        }
        // Notice: Since there might be circular references, it is important to check
        // which role the entity has
        if (path.isStartEntity(entity)) {
            // We tried to delete the start
            path.deleteEntityOnStart(entity);
        }
        else if (path.isEndEntity(entity)) {
            // We tried to delete the end
            path.deleteEntityOnEnd(entity);
        }
        else {
            // We tried to delete something inbetween
            const newPath: any = path.deleteEntityOnPathSplitIntoTwo(entity);
            this.beltPaths.push(newPath);
        }
        // Sanity
        entity.components.Belt.assignedPath = null;
    }
    /**
     * Adds the given entity to the appropriate paths
     */
    addEntityToPaths(entity: Entity): any {
        const fromEntity: any = this.findSupplyingEntity(entity);
        const toEntity: any = this.findFollowUpEntity(entity);
        // Check if we can add the entity to the previous path
        if (fromEntity) {
            const fromPath: any = fromEntity.components.Belt.assignedPath;
            fromPath.extendOnEnd(entity);
            // Check if we now can extend the current path by the next path
            if (toEntity) {
                const toPath: any = toEntity.components.Belt.assignedPath;
                if (fromPath === toPath) {
                    // This is a circular dependency -> Ignore
                }
                else {
                    fromPath.extendByPath(toPath);
                    // Delete now obsolete path
                    fastArrayDeleteValue(this.beltPaths, toPath);
                }
            }
        }
        else {
            if (toEntity) {
                // Prepend it to the other path
                const toPath: any = toEntity.components.Belt.assignedPath;
                toPath.extendOnBeginning(entity);
            }
            else {
                // This is an empty belt path
                const path: any = new BeltPath(this.root, [entity]);
                this.beltPaths.push(path);
            }
        }
    }
    /**
     * Called when an entity got added
     */
    onEntityAdded(entity: Entity): any {
        if (!this.root.gameInitialized) {
            return;
        }
        if (!entity.components.Belt) {
            return;
        }
        this.addEntityToPaths(entity);
        if (G_IS_DEV && globalConfig.debug.checkBeltPaths) {
            this.debug_verifyBeltPaths();
        }
    }
    /**
     * Draws all belt paths
     */
    drawBeltItems(parameters: DrawParameters): any {
        for (let i: any = 0; i < this.beltPaths.length; ++i) {
            this.beltPaths[i].draw(parameters);
        }
    }
    /**
     * Verifies all belt paths
     */
    debug_verifyBeltPaths(): any {
        for (let i: any = 0; i < this.beltPaths.length; ++i) {
            this.beltPaths[i].debug_checkIntegrity("general-verify");
        }
        const belts: any = this.root.entityMgr.getAllWithComponent(BeltComponent);
        for (let i: any = 0; i < belts.length; ++i) {
            const path: any = belts[i].components.Belt.assignedPath;
            if (!path) {
                throw new Error("Belt has no path: " + belts[i].uid);
            }
            if (this.beltPaths.indexOf(path) < 0) {
                throw new Error("Path of entity not contained: " + belts[i].uid);
            }
        }
    }
    /**
     * Finds the follow up entity for a given belt. Used for building the dependencies
     * {}
     */
    findFollowUpEntity(entity: Entity): Entity | null {
        const staticComp: any = entity.components.StaticMapEntity;
        const beltComp: any = entity.components.Belt;
        const followUpDirection: any = staticComp.localDirectionToWorld(beltComp.direction);
        const followUpVector: any = enumDirectionToVector[followUpDirection];
        const followUpTile: any = staticComp.origin.add(followUpVector);
        const followUpEntity: any = this.root.map.getLayerContentXY(followUpTile.x, followUpTile.y, entity.layer);
        // Check if there's a belt at the tile we point to
        if (followUpEntity) {
            const followUpBeltComp: any = followUpEntity.components.Belt;
            if (followUpBeltComp) {
                const followUpStatic: any = followUpEntity.components.StaticMapEntity;
                const acceptedDirection: any = followUpStatic.localDirectionToWorld(enumDirection.top);
                if (acceptedDirection === followUpDirection) {
                    return followUpEntity;
                }
            }
        }
        return null;
    }
    /**
     * Finds the supplying belt for a given belt. Used for building the dependencies
     * {}
     */
    findSupplyingEntity(entity: Entity): Entity | null {
        const staticComp: any = entity.components.StaticMapEntity;
        const supplyDirection: any = staticComp.localDirectionToWorld(enumDirection.bottom);
        const supplyVector: any = enumDirectionToVector[supplyDirection];
        const supplyTile: any = staticComp.origin.add(supplyVector);
        const supplyEntity: any = this.root.map.getLayerContentXY(supplyTile.x, supplyTile.y, entity.layer);
        // Check if there's a belt at the tile we point to
        if (supplyEntity) {
            const supplyBeltComp: any = supplyEntity.components.Belt;
            if (supplyBeltComp) {
                const supplyStatic: any = supplyEntity.components.StaticMapEntity;
                const otherDirection: any = supplyStatic.localDirectionToWorld(enumInvertedDirections[supplyBeltComp.direction]);
                if (otherDirection === supplyDirection) {
                    return supplyEntity;
                }
            }
        }
        return null;
    }
    /**
     * Recomputes the belt path network. Only required for old savegames
     */
    recomputeAllBeltPaths(): any {
        logger.warn("Recomputing all belt paths");
        const visitedUids: any = new Set();
        const result: any = [];
        const beltEntities: any = this.root.entityMgr.getAllWithComponent(BeltComponent);
        for (let i: any = 0; i < beltEntities.length; ++i) {
            const entity: any = beltEntities[i];
            if (visitedUids.has(entity.uid)) {
                continue;
            }
            // Mark entity as visited
            visitedUids.add(entity.uid);
            // Compute path, start with entity and find precedors / successors
            const path: any = [entity];
            // Prevent infinite loops
            let maxIter: any = 99999;
            // Find precedors
            let prevEntity: any = this.findSupplyingEntity(entity);
            while (prevEntity && --maxIter > 0) {
                if (visitedUids.has(prevEntity.uid)) {
                    break;
                }
                path.unshift(prevEntity);
                visitedUids.add(prevEntity.uid);
                prevEntity = this.findSupplyingEntity(prevEntity);
            }
            // Find succedors
            let nextEntity: any = this.findFollowUpEntity(entity);
            while (nextEntity && --maxIter > 0) {
                if (visitedUids.has(nextEntity.uid)) {
                    break;
                }
                path.push(nextEntity);
                visitedUids.add(nextEntity.uid);
                nextEntity = this.findFollowUpEntity(nextEntity);
            }
            assert(maxIter > 1, "Ran out of iterations");
            result.push(new BeltPath(this.root, path));
        }
        logger.log("Found", this.beltPaths.length, "belt paths");
        this.beltPaths = result;
    }
    /**
     * Updates all belts
     */
    update(): any {
        if (G_IS_DEV && globalConfig.debug.checkBeltPaths) {
            this.debug_verifyBeltPaths();
        }
        for (let i: any = 0; i < this.beltPaths.length; ++i) {
            this.beltPaths[i].update();
        }
        if (G_IS_DEV && globalConfig.debug.checkBeltPaths) {
            this.debug_verifyBeltPaths();
        }
    }
    /**
     * Draws a given chunk
     */
    drawChunk(parameters: DrawParameters, chunk: MapChunkView): any {
        if (G_IS_DEV && globalConfig.debug.doNotRenderStatics) {
            return;
        }
        // Limit speed to avoid belts going backwards
        const speedMultiplier: any = Math.min(this.root.hubGoals.getBeltBaseSpeed(), 10);
        // SYNC with systems/item_acceptor.js:drawEntityUnderlays!
        // 126 / 42 is the exact animation speed of the png animation
        const animationIndex: any = Math.floor(((this.root.time.realtimeNow() * speedMultiplier * BELT_ANIM_COUNT * 126) / 42) *
            globalConfig.itemSpacingOnBelts);
        const contents: any = chunk.containedEntitiesByLayer.regular;
        if (this.root.app.settings.getAllSettings().simplifiedBelts) {
            // POTATO Mode: Only show items when belt is hovered
            let hoveredBeltPath: any = null;
            const mousePos: any = this.root.app.mousePosition;
            if (mousePos && this.root.currentLayer === "regular") {
                const tile: any = this.root.camera.screenToWorld(mousePos).toTileSpace();
                const contents: any = this.root.map.getLayerContentXY(tile.x, tile.y, "regular");
                if (contents && contents.components.Belt) {
                    hoveredBeltPath = contents.components.Belt.assignedPath;
                }
            }
            for (let i: any = 0; i < contents.length; ++i) {
                const entity: any = contents[i];
                if (entity.components.Belt) {
                    const direction: any = entity.components.Belt.direction;
                    let sprite: any = this.beltAnimations[direction][0];
                    if (entity.components.Belt.assignedPath === hoveredBeltPath) {
                        sprite = this.beltAnimations[direction][animationIndex % BELT_ANIM_COUNT];
                    }
                    // Culling happens within the static map entity component
                    entity.components.StaticMapEntity.drawSpriteOnBoundsClipped(parameters, sprite, 0);
                }
            }
        }
        else {
            for (let i: any = 0; i < contents.length; ++i) {
                const entity: any = contents[i];
                if (entity.components.Belt) {
                    const direction: any = entity.components.Belt.direction;
                    const sprite: any = this.beltAnimations[direction][animationIndex % BELT_ANIM_COUNT];
                    // Culling happens within the static map entity component
                    entity.components.StaticMapEntity.drawSpriteOnBoundsClipped(parameters, sprite, 0);
                }
            }
        }
    }
    /**
     * Draws the belt path debug overlays
     */
    drawBeltPathDebug(parameters: DrawParameters): any {
        for (let i: any = 0; i < this.beltPaths.length; ++i) {
            this.beltPaths[i].drawDebug(parameters);
        }
    }
}
