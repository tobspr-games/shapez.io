import { globalConfig } from "../../core/config";
import { DrawParameters } from "../../core/draw_parameters";
import { drawRotatedSprite } from "../../core/draw_utils";
import { Loader } from "../../core/loader";
import { STOP_PROPAGATION } from "../../core/signal";
import { enumDirectionToAngle, Vector } from "../../core/vector";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { MapChunkView } from "../map_chunk_view";
const enumTypeToSize: {
    [idx: ItemType]: number;
} = {
    boolean: 9,
    shape: 9,
    color: 14,
};
export class WiredPinsSystem extends GameSystemWithFilter {
    public pinSprites = {
        [enumPinSlotType.logicalEjector]: Loader.getSprite("sprites/wires/logical_ejector.png"),
        [enumPinSlotType.logicalAcceptor]: Loader.getSprite("sprites/wires/logical_acceptor.png"),
    };

    constructor(root) {
        super(root, [WiredPinsComponent]);
        this.root.signals.prePlacementCheck.add(this.prePlacementCheck, this);
        this.root.signals.freeEntityAreaBeforeBuild.add(this.freeEntityAreaBeforeBuild, this);
    }
    /**
     * Performs pre-placement checks
     */
    prePlacementCheck(entity: Entity, offset: Vector): any {
        // Compute area of the building
        const rect: any = entity.components.StaticMapEntity.getTileSpaceBounds();
        if (offset) {
            rect.x += offset.x;
            rect.y += offset.y;
        }
        // If this entity is placed on the wires layer, make sure we don't
        // place it above a pin
        if (entity.layer === "wires") {
            for (let x: any = rect.x; x < rect.x + rect.w; ++x) {
                for (let y: any = rect.y; y < rect.y + rect.h; ++y) {
                    // Find which entities are in same tiles of both layers
                    const entities: any = this.root.map.getLayersContentsMultipleXY(x, y);
                    for (let i: any = 0; i < entities.length; ++i) {
                        const otherEntity: any = entities[i];
                        // Check if entity has a wired component
                        const pinComponent: any = otherEntity.components.WiredPins;
                        const staticComp: any = otherEntity.components.StaticMapEntity;
                        if (!pinComponent) {
                            continue;
                        }
                        if (staticComp
                            .getMetaBuilding()
                            .getIsReplaceable(staticComp.getVariant(), staticComp.getRotationVariant())) {
                            // Don't mind here, even if there would be a collision we
                            // could replace it
                            continue;
                        }
                        // Go over all pins and check if they are blocking
                        const pins: any = pinComponent.slots;
                        for (let pinSlot: any = 0; pinSlot < pins.length; ++pinSlot) {
                            const pos: any = staticComp.localTileToWorld(pins[pinSlot].pos);
                            // Occupied by a pin
                            if (pos.x === x && pos.y === y) {
                                return STOP_PROPAGATION;
                            }
                        }
                    }
                }
            }
        }
        // Check for collisions on the wires layer
        if (this.checkEntityPinsCollide(entity, offset)) {
            return STOP_PROPAGATION;
        }
    }
    /**
     * Checks if the pins of the given entity collide on the wires layer
     * {} True if the pins collide
     */
    checkEntityPinsCollide(entity: Entity, offset: Vector=): boolean {
        const pinsComp: any = entity.components.WiredPins;
        if (!pinsComp) {
            return false;
        }
        // Go over all slots
        for (let slotIndex: any = 0; slotIndex < pinsComp.slots.length; ++slotIndex) {
            const slot: any = pinsComp.slots[slotIndex];
            // Figure out which tile this slot is on
            const worldPos: any = entity.components.StaticMapEntity.localTileToWorld(slot.pos);
            if (offset) {
                worldPos.x += offset.x;
                worldPos.y += offset.y;
            }
            // Check if there is any entity on that tile (Wired pins are always on the wires layer)
            const collidingEntity: any = this.root.map.getLayerContentXY(worldPos.x, worldPos.y, "wires");
            // If there's an entity, and it can't get removed -> That's a collision
            if (collidingEntity) {
                const staticComp: any = collidingEntity.components.StaticMapEntity;
                if (!staticComp
                    .getMetaBuilding()
                    .getIsReplaceable(staticComp.getVariant(), staticComp.getRotationVariant())) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Called to free space for the given entity
     */
    freeEntityAreaBeforeBuild(entity: Entity): any {
        const pinsComp: any = entity.components.WiredPins;
        if (!pinsComp) {
            // Entity has no pins
            return;
        }
        // Remove any stuff which collides with the pins
        for (let i: any = 0; i < pinsComp.slots.length; ++i) {
            const slot: any = pinsComp.slots[i];
            const worldPos: any = entity.components.StaticMapEntity.localTileToWorld(slot.pos);
            const collidingEntity: any = this.root.map.getLayerContentXY(worldPos.x, worldPos.y, "wires");
            if (collidingEntity) {
                const staticComp: any = collidingEntity.components.StaticMapEntity;
                assertAlways(staticComp
                    .getMetaBuilding()
                    .getIsReplaceable(staticComp.getVariant(), staticComp.getRotationVariant()), "Tried to replace non-repleaceable entity for pins");
                if (!this.root.logic.tryDeleteBuilding(collidingEntity)) {
                    assertAlways(false, "Tried to replace non-repleaceable entity for pins #2");
                }
            }
        }
    }
    /**
     * Draws a given entity
     */
    drawChunk(parameters: DrawParameters, chunk: MapChunkView): any {
        const contents: any = chunk.containedEntities;
        for (let i: any = 0; i < contents.length; ++i) {
            const entity: any = contents[i];
            const pinsComp: any = entity.components.WiredPins;
            if (!pinsComp) {
                continue;
            }
            const staticComp: any = entity.components.StaticMapEntity;
            const slots: any = pinsComp.slots;
            for (let j: any = 0; j < slots.length; ++j) {
                const slot: any = slots[j];
                const tile: any = staticComp.localTileToWorld(slot.pos);
                if (!chunk.tileSpaceRectangle.containsPoint(tile.x, tile.y)) {
                    // Doesn't belong to this chunk
                    continue;
                }
                const worldPos: any = tile.toWorldSpaceCenterOfTile();
                // Culling
                if (!parameters.visibleRect.containsCircle(worldPos.x, worldPos.y, globalConfig.halfTileSize)) {
                    continue;
                }
                const effectiveRotation: any = Math.radians(staticComp.rotation + enumDirectionToAngle[slot.direction]);
                if (staticComp.getMetaBuilding().getRenderPins()) {
                    drawRotatedSprite({
                        parameters,
                        sprite: this.pinSprites[slot.type],
                        x: worldPos.x,
                        y: worldPos.y,
                        angle: effectiveRotation,
                        size: globalConfig.tileSize + 2,
                        offsetX: 0,
                        offsetY: 0,
                    });
                }
                // Draw contained item to visualize whats emitted
                const value: any = slot.value;
                if (value) {
                    const offset: any = new Vector(0, -9.1).rotated(effectiveRotation);
                    value.drawItemCenteredClipped(worldPos.x + offset.x, worldPos.y + offset.y, parameters, enumTypeToSize[value.getItemType()]);
                }
                // Debug view
                if (G_IS_DEV && globalConfig.debug.renderWireNetworkInfos) {
                    const offset: any = new Vector(0, -10).rotated(effectiveRotation);
                    const network: any = slot.linkedNetwork;
                    parameters.context.fillStyle = "blue";
                    parameters.context.font = "5px Tahoma";
                    parameters.context.textAlign = "center";
                    parameters.context.fillText(network ? "S" + network.uid : "???", (tile.x + 0.5) * globalConfig.tileSize + offset.x, (tile.y + 0.5) * globalConfig.tileSize + offset.y);
                    parameters.context.textAlign = "left";
                }
            }
        }
    }
}
