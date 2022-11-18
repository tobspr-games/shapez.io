import { globalConfig } from "../core/config";
import { DrawParameters } from "../core/draw_parameters";
import { findNiceIntegerValue } from "../core/utils";
import { Vector } from "../core/vector";
import { Entity } from "./entity";
import { ACHIEVEMENTS } from "../platform/achievement_provider";
import { GameRoot } from "./root";
export class Blueprint {
    public entities = entities;

        constructor(entities) {
    }
    /**
     * Returns the layer of this blueprint
     * {}
     */
    get layer() {
        if (this.entities.length === 0) {
            return "regular";
        }
        return this.entities[0].layer;
    }
    /**
     * Creates a new blueprint from the given entity uids
     */
    static fromUids(root: GameRoot, uids: Array<number>): any {
        const newEntities: any = [];
        let averagePosition: any = new Vector();
        // First, create a copy
        for (let i: any = 0; i < uids.length; ++i) {
            const entity: any = root.entityMgr.findByUid(uids[i]);
            assert(entity, "Entity for blueprint not found:" + uids[i]);
            const clone: any = entity.clone();
            newEntities.push(clone);
            const pos: any = entity.components.StaticMapEntity.getTileSpaceBounds().getCenter();
            averagePosition.addInplace(pos);
        }
        averagePosition.divideScalarInplace(uids.length);
        const blueprintOrigin: any = averagePosition.subScalars(0.5, 0.5).floor();
        for (let i: any = 0; i < uids.length; ++i) {
            newEntities[i].components.StaticMapEntity.origin.subInplace(blueprintOrigin);
        }
        // Now, make sure the origin is 0,0
        return new Blueprint(newEntities);
    }
    /**
     * Returns the cost of this blueprint in shapes
     */
    getCost(): any {
        if (G_IS_DEV && globalConfig.debug.blueprintsNoCost) {
            return 0;
        }
        return findNiceIntegerValue(4 * Math.pow(this.entities.length, 1.1));
    }
    /**
     * Draws the blueprint at the given origin
     */
    draw(parameters: DrawParameters, tile: any): any {
        parameters.context.globalAlpha = 0.8;
        for (let i: any = 0; i < this.entities.length; ++i) {
            const entity: any = this.entities[i];
            const staticComp: any = entity.components.StaticMapEntity;
            const newPos: any = staticComp.origin.add(tile);
            const rect: any = staticComp.getTileSpaceBounds();
            rect.moveBy(tile.x, tile.y);
            if (!parameters.root.logic.checkCanPlaceEntity(entity, { offset: tile })) {
                parameters.context.globalAlpha = 0.3;
            }
            else {
                parameters.context.globalAlpha = 1;
            }
            staticComp.drawSpriteOnBoundsClipped(parameters, staticComp.getBlueprintSprite(), 0, newPos);
        }
        parameters.context.globalAlpha = 1;
    }
    /**
     * Rotates the blueprint clockwise
     */
    rotateCw(): any {
        for (let i: any = 0; i < this.entities.length; ++i) {
            const entity: any = this.entities[i];
            const staticComp: any = entity.components.StaticMapEntity;
            // Actually keeping this in as an easter egg to rotate the trash can
            // if (staticComp.getMetaBuilding().getIsRotateable()) {
            staticComp.rotation = (staticComp.rotation + 90) % 360;
            staticComp.originalRotation = (staticComp.originalRotation + 90) % 360;
            // }
            staticComp.origin = staticComp.origin.rotateFastMultipleOf90(90);
        }
    }
    /**
     * Rotates the blueprint counter clock wise
     */
    rotateCcw(): any {
        // Well ...
        for (let i: any = 0; i < 3; ++i) {
            this.rotateCw();
        }
    }
    /**
     * Checks if the blueprint can be placed at the given tile
     */
    canPlace(root: GameRoot, tile: Vector): any {
        let anyPlaceable: any = false;
        for (let i: any = 0; i < this.entities.length; ++i) {
            const entity: any = this.entities[i];
            if (root.logic.checkCanPlaceEntity(entity, { offset: tile })) {
                anyPlaceable = true;
            }
        }
        return anyPlaceable;
    }
        canAfford(root: GameRoot): any {
        if (root.gameMode.getHasFreeCopyPaste()) {
            return true;
        }
        return root.hubGoals.getShapesStoredByKey(root.gameMode.getBlueprintShapeKey()) >= this.getCost();
    }
    /**
     * Attempts to place the blueprint at the given tile
     */
    tryPlace(root: GameRoot, tile: Vector): any {
        return root.logic.performBulkOperation((): any => {
            return root.logic.performImmutableOperation((): any => {
                let count: any = 0;
                for (let i: any = 0; i < this.entities.length; ++i) {
                    const entity: any = this.entities[i];
                    if (!root.logic.checkCanPlaceEntity(entity, { offset: tile })) {
                        continue;
                    }
                    const clone: any = entity.clone();
                    clone.components.StaticMapEntity.origin.addInplace(tile);
                    root.logic.freeEntityAreaBeforeBuild(clone);
                    root.map.placeStaticEntity(clone);
                    root.entityMgr.registerEntity(clone);
                    count++;
                }
                root.signals.bulkAchievementCheck.dispatch(ACHIEVEMENTS.placeBlueprint, count, ACHIEVEMENTS.placeBp1000, count);
                return count !== 0;
            });
        });
    }
}
