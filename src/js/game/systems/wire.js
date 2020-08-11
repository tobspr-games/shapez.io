import { GameSystemWithFilter } from "../game_system_with_filter";
import { WireComponent, enumWireType } from "../components/wire";
import { MapChunkView } from "../map_chunk_view";
import { globalConfig } from "../../core/config";
import { Loader } from "../../core/loader";
import { Entity } from "../entity";
import { gMetaBuildingRegistry } from "../../core/global_registries";
import { MetaWireBuilding, arrayWireRotationVariantToType } from "../buildings/wire";
import { Vector } from "../../core/vector";
import { defaultBuildingVariant } from "../meta_building";

export class WireSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [WireComponent]);

        this.wireSprites = {
            [enumWireType.regular]: Loader.getSprite("sprites/buildings/wire.png"),
            [enumWireType.turn]: Loader.getSprite("sprites/buildings/wire-turn.png"),
            [enumWireType.split]: Loader.getSprite("sprites/buildings/wire-split.png"),
        };

        this.root.signals.entityDestroyed.add(this.updateSurroundingWirePlacement, this);
        this.root.signals.entityAdded.add(this.updateSurroundingWirePlacement, this);
    }

    /**
     * Draws a given chunk
     * @param {import("../../core/draw_utils").DrawParameters} parameters
     * @param {MapChunkView} chunk
     */
    drawChunk(parameters, chunk) {
        const contents = chunk.wireContents;
        for (let y = 0; y < globalConfig.mapChunkSize; ++y) {
            for (let x = 0; x < globalConfig.mapChunkSize; ++x) {
                const entity = contents[x][y];
                if (entity && entity.components.Wire) {
                    const wireType = entity.components.Wire.type;
                    const sprite = this.wireSprites[wireType];
                    entity.components.StaticMapEntity.drawSpriteOnFullEntityBounds(parameters, sprite, 0);
                }
            }
        }
    }

    /**
     * Updates the wire placement after an entity has been added / deleted
     * @param {Entity} entity
     */
    updateSurroundingWirePlacement(entity) {
        if (!this.root.gameInitialized) {
            return;
        }

        const staticComp = entity.components.StaticMapEntity;
        if (!staticComp) {
            return;
        }

        const metaWire = gMetaBuildingRegistry.findByClass(MetaWireBuilding);

        // Compute affected area
        const originalRect = staticComp.getTileSpaceBounds();
        const affectedArea = originalRect.expandedInAllDirections(1);

        for (let x = affectedArea.x; x < affectedArea.right(); ++x) {
            for (let y = affectedArea.y; y < affectedArea.bottom(); ++y) {
                if (originalRect.containsPoint(x, y)) {
                    // Make sure we don't update the original entity
                    continue;
                }

                const targetEntities = this.root.map.getLayersContentsMultipleXY(x, y);
                for (let i = 0; i < targetEntities.length; ++i) {
                    const targetEntity = targetEntities[i];

                    const targetWireComp = targetEntity.components.Wire;
                    const targetStaticComp = targetEntity.components.StaticMapEntity;

                    if (!targetWireComp) {
                        // Not a wire
                        continue;
                    }

                    const {
                        rotation,
                        rotationVariant,
                    } = metaWire.computeOptimalDirectionAndRotationVariantAtTile({
                        root: this.root,
                        tile: new Vector(x, y),
                        rotation: targetStaticComp.originalRotation,
                        variant: defaultBuildingVariant,
                        layer: targetEntity.layer,
                    });

                    // Compute delta to see if anything changed
                    const newType = arrayWireRotationVariantToType[rotationVariant];

                    if (targetStaticComp.rotation !== rotation || newType !== targetWireComp.type) {
                        // Change stuff
                        targetStaticComp.rotation = rotation;
                        metaWire.updateVariants(targetEntity, rotationVariant, defaultBuildingVariant);

                        // Make sure the chunks know about the update
                        this.root.signals.entityChanged.dispatch(targetEntity);
                    }
                }
            }
        }
    }
}
