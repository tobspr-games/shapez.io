import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { Loader } from "../../core/loader";
import { Rectangle } from "../../core/rectangle";
import { FULL_CLIP_RECT } from "../../core/sprites";
import { StaleAreaDetector } from "../../core/stale_area_detector";
import { enumDirection, enumDirectionToAngle, enumDirectionToVector, enumInvertedDirections, Vector, } from "../../core/vector";
import { BeltComponent } from "../components/belt";
import { BeltUnderlaysComponent, enumClippedBeltUnderlayType } from "../components/belt_underlays";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { Entity } from "../entity";
import { GameSystem } from "../game_system";
import { MapChunkView } from "../map_chunk_view";
import { BELT_ANIM_COUNT } from "./belt";
/**
 * Mapping from underlay type to clip rect
 */
const enumUnderlayTypeToClipRect: {
    [idx: enumClippedBeltUnderlayType]: Rectangle;
} = {
    [enumClippedBeltUnderlayType.none]: null,
    [enumClippedBeltUnderlayType.full]: FULL_CLIP_RECT,
    [enumClippedBeltUnderlayType.topOnly]: new Rectangle(0, 0, 1, 0.5),
    [enumClippedBeltUnderlayType.bottomOnly]: new Rectangle(0, 0.5, 1, 0.5),
};
export class BeltUnderlaysSystem extends GameSystem {
    public underlayBeltSprites = [];
    public staleArea = new StaleAreaDetector({
        root,
        name: "belt-underlay",
        recomputeMethod: this.recomputeStaleArea.bind(this),
    });

    constructor(root) {
        super(root);
        for (let i: any = 0; i < BELT_ANIM_COUNT; ++i) {
            this.underlayBeltSprites.push(Loader.getSprite("sprites/belt/built/forward_" + i + ".png"));
        }
        this.staleArea.recomputeOnComponentsChanged([BeltUnderlaysComponent, BeltComponent, ItemAcceptorComponent, ItemEjectorComponent], 1);
    }
    update(): any {
        this.staleArea.update();
    }
    /**
     * Called when an area changed - Resets all caches in the given area
     */
    recomputeStaleArea(area: Rectangle): any {
        for (let x: any = 0; x < area.w; ++x) {
            for (let y: any = 0; y < area.h; ++y) {
                const tileX: any = area.x + x;
                const tileY: any = area.y + y;
                const entity: any = this.root.map.getLayerContentXY(tileX, tileY, "regular");
                if (entity) {
                    const underlayComp: any = entity.components.BeltUnderlays;
                    if (underlayComp) {
                        for (let i: any = 0; i < underlayComp.underlays.length; ++i) {
                            underlayComp.underlays[i].cachedType = null;
                        }
                    }
                }
            }
        }
    }
    /**
     * Checks if a given tile is connected and has an acceptor
     * {}
     */
    checkIsAcceptorConnected(tile: Vector, fromDirection: enumDirection): boolean {
        const contents: any = this.root.map.getLayerContentXY(tile.x, tile.y, "regular");
        if (!contents) {
            return false;
        }
        const staticComp: any = contents.components.StaticMapEntity;
        // Check if its a belt, since then its simple
        const beltComp: any = contents.components.Belt;
        if (beltComp) {
            return staticComp.localDirectionToWorld(enumDirection.bottom) === fromDirection;
        }
        // Check if there's an item acceptor
        const acceptorComp: any = contents.components.ItemAcceptor;
        if (acceptorComp) {
            // Check each slot to see if its connected
            for (let i: any = 0; i < acceptorComp.slots.length; ++i) {
                const slot: any = acceptorComp.slots[i];
                const slotTile: any = staticComp.localTileToWorld(slot.pos);
                // Step 1: Check if the tile matches
                if (!slotTile.equals(tile)) {
                    continue;
                }
                // Step 2: Check if the direction matches
                const slotDirection: any = staticComp.localDirectionToWorld(slot.direction);
                if (slotDirection === fromDirection) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Checks if a given tile is connected and has an ejector
     * {}
     */
    checkIsEjectorConnected(tile: Vector, toDirection: enumDirection): boolean {
        const contents: any = this.root.map.getLayerContentXY(tile.x, tile.y, "regular");
        if (!contents) {
            return false;
        }
        const staticComp: any = contents.components.StaticMapEntity;
        // Check if its a belt, since then its simple
        const beltComp: any = contents.components.Belt;
        if (beltComp) {
            return staticComp.localDirectionToWorld(beltComp.direction) === toDirection;
        }
        // Check for an ejector
        const ejectorComp: any = contents.components.ItemEjector;
        if (ejectorComp) {
            // Check each slot to see if its connected
            for (let i: any = 0; i < ejectorComp.slots.length; ++i) {
                const slot: any = ejectorComp.slots[i];
                const slotTile: any = staticComp.localTileToWorld(slot.pos);
                // Step 1: Check if the tile matches
                if (!slotTile.equals(tile)) {
                    continue;
                }
                // Step 2: Check if the direction matches
                const slotDirection: any = staticComp.localDirectionToWorld(slot.direction);
                if (slotDirection === toDirection) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Computes the flag for a given tile
     * {} The type of the underlay
     */
    computeBeltUnderlayType(entity: Entity, underlayTile: import("../components/belt_underlays").BeltUnderlayTile): enumClippedBeltUnderlayType {
        if (underlayTile.cachedType) {
            return underlayTile.cachedType;
        }
        const staticComp: any = entity.components.StaticMapEntity;
        const transformedPos: any = staticComp.localTileToWorld(underlayTile.pos);
        const destX: any = transformedPos.x * globalConfig.tileSize;
        const destY: any = transformedPos.y * globalConfig.tileSize;
        // Extract direction and angle
        const worldDirection: any = staticComp.localDirectionToWorld(underlayTile.direction);
        const worldDirectionVector: any = enumDirectionToVector[worldDirection];
        // Figure out if there is anything connected at the top
        const connectedTop: any = this.checkIsAcceptorConnected(transformedPos.add(worldDirectionVector), enumInvertedDirections[worldDirection]);
        // Figure out if there is anything connected at the bottom
        const connectedBottom: any = this.checkIsEjectorConnected(transformedPos.sub(worldDirectionVector), worldDirection);
        let flag: any = enumClippedBeltUnderlayType.none;
        if (connectedTop && connectedBottom) {
            flag = enumClippedBeltUnderlayType.full;
        }
        else if (connectedTop) {
            flag = enumClippedBeltUnderlayType.topOnly;
        }
        else if (connectedBottom) {
            flag = enumClippedBeltUnderlayType.bottomOnly;
        }
        return (underlayTile.cachedType = flag);
    }
    /**
     * Draws a given chunk
     */
    drawChunk(parameters: DrawParameters, chunk: MapChunkView): any {
        // Limit speed to avoid belts going backwards
        const speedMultiplier: any = Math.min(this.root.hubGoals.getBeltBaseSpeed(), 10);
        const contents: any = chunk.containedEntitiesByLayer.regular;
        for (let i: any = 0; i < contents.length; ++i) {
            const entity: any = contents[i];
            const underlayComp: any = entity.components.BeltUnderlays;
            if (!underlayComp) {
                continue;
            }
            const staticComp: any = entity.components.StaticMapEntity;
            const underlays: any = underlayComp.underlays;
            for (let i: any = 0; i < underlays.length; ++i) {
                // Extract underlay parameters
                const { pos, direction }: any = underlays[i];
                const transformedPos: any = staticComp.localTileToWorld(pos);
                const destX: any = transformedPos.x * globalConfig.tileSize;
                const destY: any = transformedPos.y * globalConfig.tileSize;
                // Culling, Part 1: Check if the chunk contains the tile
                if (!chunk.tileSpaceRectangle.containsPoint(transformedPos.x, transformedPos.y)) {
                    continue;
                }
                // Culling, Part 2: Check if the overlay is visible
                if (!parameters.visibleRect.containsRect4Params(destX, destY, globalConfig.tileSize, globalConfig.tileSize)) {
                    continue;
                }
                // Extract direction and angle
                const worldDirection: any = staticComp.localDirectionToWorld(direction);
                const angle: any = enumDirectionToAngle[worldDirection];
                const underlayType: any = this.computeBeltUnderlayType(entity, underlays[i]);
                const clipRect: any = enumUnderlayTypeToClipRect[underlayType];
                if (!clipRect) {
                    // Empty
                    continue;
                }
                // Actually draw the sprite
                const x: any = destX + globalConfig.halfTileSize;
                const y: any = destY + globalConfig.halfTileSize;
                const angleRadians: any = Math.radians(angle);
                // SYNC with systems/belt.js:drawSingleEntity!
                const animationIndex: any = Math.floor(((this.root.time.realtimeNow() * speedMultiplier * BELT_ANIM_COUNT * 126) / 42) *
                    globalConfig.itemSpacingOnBelts);
                parameters.context.translate(x, y);
                parameters.context.rotate(angleRadians);
                this.underlayBeltSprites[animationIndex % this.underlayBeltSprites.length].drawCachedWithClipRect(parameters, -globalConfig.halfTileSize, -globalConfig.halfTileSize, globalConfig.tileSize, globalConfig.tileSize, clipRect);
                parameters.context.rotate(-angleRadians);
                parameters.context.translate(-x, -y);
            }
        }
    }
}
