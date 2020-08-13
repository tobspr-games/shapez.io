import { GameSystemWithFilter } from "../game_system_with_filter";
import { WireComponent, enumWireType } from "../components/wire";
import { MapChunkView } from "../map_chunk_view";
import { globalConfig } from "../../core/config";
import { Loader } from "../../core/loader";
import { Entity } from "../entity";
import { gMetaBuildingRegistry } from "../../core/global_registries";
import { MetaWireBuilding, arrayWireRotationVariantToType } from "../buildings/wire";
import {
    Vector,
    enumDirection,
    enumDirectionToVector,
    arrayAllDirections,
    enumInvertedDirections,
} from "../../core/vector";
import { defaultBuildingVariant } from "../meta_building";
import { createLogger } from "../../core/logging";
import { WiredPinsComponent, enumPinSlotType } from "../components/wired_pins";
import { getCodeFromBuildingData } from "../building_codes";
import { BaseItem, enumItemType } from "../base_item";

const logger = createLogger("wires");

let networkUidCounter = 0;

const VERBOSE_WIRES = false;

export class WireNetwork {
    constructor() {
        /**
         * Who contributes to this network
         * @type {Array<{ entity: Entity, slot: import("../components/wired_pins").WirePinSlot }>} */
        this.providers = [];

        /**
         * Who takes values from this network
         * @type {Array<{ entity: Entity, slot: import("../components/wired_pins").WirePinSlot }>} */
        this.receivers = [];

        /**
         * All connected slots
         * @type {Array<{ entity: Entity, slot: import("../components/wired_pins").WirePinSlot }>}
         */
        this.allSlots = [];

        /**
         * Which wires are in this network
         * @type {Array<Entity>}
         */
        this.wires = [];

        /**
         * The current value of this network
         * @type {BaseItem}
         */
        this.currentValue = null;

        /**
         * Whether this network has a value conflict, that is, more than one
         * sender has sent a value
         * @type {boolean}
         */
        this.valueConflict = false;

        /**
         * Unique network identifier
         * @type {number}
         */
        this.uid = ++networkUidCounter;
    }
}

export class WireSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [WireComponent]);

        this.wireSprites = {
            [enumWireType.regular]: Loader.getSprite("sprites/buildings/wire.png"),
            [enumWireType.turn]: Loader.getSprite("sprites/buildings/wire-turn.png"),
            [enumWireType.split]: Loader.getSprite("sprites/buildings/wire-split.png"),
            [enumWireType.cross]: Loader.getSprite("sprites/buildings/wire-cross.png"),
        };

        this.root.signals.entityDestroyed.add(this.updateSurroundingWirePlacement, this);
        this.root.signals.entityAdded.add(this.updateSurroundingWirePlacement, this);

        this.root.signals.entityDestroyed.add(this.queueRecomputeIfWire, this);
        this.root.signals.entityChanged.add(this.queueRecomputeIfWire, this);
        this.root.signals.entityAdded.add(this.queueRecomputeIfWire, this);

        this.needsRecompute = true;

        /**
         * @type {Array<WireNetwork>}
         */
        this.networks = [];
    }

    /**
     * Invalidates the wires network if the given entity is relevant for it
     * @param {Entity} entity
     */
    queueRecomputeIfWire(entity) {
        if (!this.root.gameInitialized) {
            return;
        }
        if (entity.components.Wire || entity.components.WiredPins) {
            this.needsRecompute = true;
            this.networks = [];
        }
    }

    /**
     * Recomputes the whole wires network
     */
    recomputeWiresNetwork() {
        this.needsRecompute = false;
        logger.log("Recomputing wires network");

        this.networks = [];

        // Clear all network references
        const wireEntities = this.root.entityMgr.getAllWithComponent(WireComponent);
        for (let i = 0; i < wireEntities.length; ++i) {
            wireEntities[i].components.Wire.linkedNetwork = null;
        }

        const pinEntities = this.root.entityMgr.getAllWithComponent(WiredPinsComponent);
        for (let i = 0; i < pinEntities.length; ++i) {
            const slots = pinEntities[i].components.WiredPins.slots;
            for (let k = 0; k < slots.length; ++k) {
                slots[k].linkedNetwork = null;
            }
        }

        VERBOSE_WIRES && logger.log("Recomputing slots");

        // Iterate over all ejector slots
        for (let i = 0; i < pinEntities.length; ++i) {
            const entity = pinEntities[i];
            const slots = entity.components.WiredPins.slots;
            for (let k = 0; k < slots.length; ++k) {
                const slot = slots[k];

                // Ejectors are computed directly, acceptors are just set
                if (slot.type === enumPinSlotType.logicalEjector && !slot.linkedNetwork) {
                    this.findNetworkForEjector(entity, slot);
                }
            }
        }
    }

    /**
     * Finds the network for the given slot
     * @param {Entity} initialEntity
     * @param {import("../components/wired_pins").WirePinSlot} slot
     */
    findNetworkForEjector(initialEntity, slot) {
        let currentNetwork = new WireNetwork();
        VERBOSE_WIRES &&
            logger.log(
                "Finding network for entity",
                initialEntity.uid,
                initialEntity.components.StaticMapEntity.origin.toString(),
                "(nw-id:",
                currentNetwork.uid,
                ")"
            );
        const entitiesToVisit = [
            {
                entity: initialEntity,
                slot,
            },
        ];

        while (entitiesToVisit.length > 0) {
            const nextData = entitiesToVisit.pop();
            const nextEntity = nextData.entity;

            const wireComp = nextEntity.components.Wire;
            const staticComp = nextEntity.components.StaticMapEntity;

            VERBOSE_WIRES && logger.log("Visiting", staticComp.origin.toString(), "(", nextEntity.uid, ")");

            // Where to search for neighbours
            let newSearchDirections = [];
            let newSearchTile = null;

            //// WIRE
            if (wireComp) {
                // Sanity check
                assert(
                    !wireComp.linkedNetwork || wireComp.linkedNetwork === currentNetwork,
                    "Mismatching wire network on wire entity " +
                        (wireComp.linkedNetwork ? wireComp.linkedNetwork.uid : "<empty>") +
                        " vs " +
                        currentNetwork.uid +
                        " @ " +
                        staticComp.origin.toString()
                );

                if (!wireComp.linkedNetwork) {
                    // This one is new! :D
                    VERBOSE_WIRES && logger.log("  Visited new wire:", staticComp.origin.toString());
                    wireComp.linkedNetwork = currentNetwork;
                    currentNetwork.wires.push(nextEntity);

                    newSearchDirections = arrayAllDirections;
                    newSearchTile = nextEntity.components.StaticMapEntity.origin;
                }
            }

            //// PINS
            const pinsComp = nextEntity.components.WiredPins;
            if (pinsComp) {
                const slot = nextData.slot;
                assert(slot, "No slot set for next entity");

                if (slot.type === enumPinSlotType.logicalEjector) {
                    VERBOSE_WIRES &&
                        logger.log("  Visiting ejector slot", staticComp.origin.toString(), "->", slot.type);
                } else if (slot.type === enumPinSlotType.logicalAcceptor) {
                    VERBOSE_WIRES &&
                        logger.log("  Visiting acceptor slot", staticComp.origin.toString(), "->", slot.type);
                } else {
                    assertAlways(false, "Bad slot type: " + slot.type);
                }

                // Sanity check
                assert(
                    !slot.linkedNetwork || slot.linkedNetwork === currentNetwork,
                    "Mismatching wire network on pin slot entity " +
                        (slot.linkedNetwork ? slot.linkedNetwork.uid : "<empty>") +
                        " vs " +
                        currentNetwork.uid
                );
                if (!slot.linkedNetwork) {
                    // This one is new
                    VERBOSE_WIRES && logger.log("  Visited new slot:", staticComp.origin.toString());

                    // Add to the right list
                    if (slot.type === enumPinSlotType.logicalEjector) {
                        currentNetwork.providers.push({ entity: nextEntity, slot });
                    } else if (slot.type === enumPinSlotType.logicalAcceptor) {
                        currentNetwork.receivers.push({ entity: nextEntity, slot });
                    } else {
                        assertAlways(false, "unknown slot type:" + slot.type);
                    }

                    // Register on the network
                    currentNetwork.allSlots.push({ entity: nextEntity, slot });
                    slot.linkedNetwork = currentNetwork;

                    // Specify where to search next
                    newSearchDirections = [staticComp.localDirectionToWorld(slot.direction)];
                    newSearchTile = staticComp.localTileToWorld(slot.pos);
                }
            }

            if (newSearchTile) {
                // Find new surrounding wire targets
                const newTargets = this.findSurroundingWireTargets(newSearchTile, newSearchDirections);

                VERBOSE_WIRES && logger.log("   Found", newTargets, "new targets to visit!");
                for (let i = 0; i < newTargets.length; ++i) {
                    entitiesToVisit.push(newTargets[i]);
                }
            }
        }

        if (
            currentNetwork.providers.length > 0 &&
            (currentNetwork.wires.length > 0 || currentNetwork.receivers.length > 0)
        ) {
            this.networks.push(currentNetwork);
            VERBOSE_WIRES && logger.log("Attached new network with uid", currentNetwork);
        } else {
            // Unregister network again
            for (let i = 0; i < currentNetwork.wires.length; ++i) {
                currentNetwork.wires[i].components.Wire.linkedNetwork = null;
            }

            for (let i = 0; i < currentNetwork.allSlots.length; ++i) {
                currentNetwork.allSlots[i].slot.linkedNetwork = null;
            }
        }
    }

    /**
     * Finds surrounding entities which are not yet assigned to a network
     * @param {Vector} tile
     * @param {Array<enumDirection>} directions
     * @returns {Array<any>}
     */
    findSurroundingWireTargets(tile, directions) {
        let result = [];

        VERBOSE_WIRES &&
            logger.log("    Searching for new targets at", tile.toString(), "and d=", directions);

        for (let i = 0; i < directions.length; ++i) {
            const direction = directions[i];
            const offset = enumDirectionToVector[direction];
            const searchTile = tile.add(offset);

            const contents = this.root.map.getLayersContentsMultipleXY(searchTile.x, searchTile.y);
            for (let k = 0; k < contents.length; ++k) {
                const entity = contents[k];
                const wireComp = entity.components.Wire;

                // Check for wire
                if (wireComp && !wireComp.linkedNetwork) {
                    // Wires accept connections from everywhere
                    result.push({
                        entity,
                    });
                }

                // Check for connected slots
                const pinComp = entity.components.WiredPins;
                if (pinComp) {
                    const staticComp = entity.components.StaticMapEntity;

                    // Go over all slots and see if they are connected
                    const pinSlots = pinComp.slots;
                    for (let j = 0; j < pinSlots.length; ++j) {
                        const slot = pinSlots[j];

                        // Check if the position matches
                        const pinPos = staticComp.localTileToWorld(slot.pos);
                        if (!pinPos.equals(searchTile)) {
                            continue;
                        }

                        // Check if the direction (inverted) matches
                        const pinDirection = staticComp.localDirectionToWorld(slot.direction);
                        if (pinDirection !== enumInvertedDirections[direction]) {
                            continue;
                        }

                        result.push({
                            entity,
                            slot,
                        });
                    }
                }
            }
        }

        VERBOSE_WIRES && logger.log("     -> Found", result.length);

        return result;
    }

    /**
     * Updates the wires network
     */
    update() {
        if (this.needsRecompute) {
            this.recomputeWiresNetwork();
        }

        // Re-compute values of all networks
        for (let i = 0; i < this.networks.length; ++i) {
            const network = this.networks[i];

            // Reset conflicts
            network.valueConflict = false;

            // Aggregate values of all senders
            const senders = network.providers;
            let value = null;
            for (let k = 0; k < senders.length; ++k) {
                const senderSlot = senders[k];
                const slotValue = senderSlot.slot.value;

                // The first sender can just put in his value
                if (!value) {
                    value = slotValue;
                    continue;
                }

                // If the slot is empty itself, just skip it
                if (!slotValue) {
                    continue;
                }

                // If there is already an value, compare if it matches ->
                // otherwise there is a conflict
                if (value.equals(slotValue)) {
                    // All good
                    continue;
                }

                // There is a conflict, this means the value will be null anyways
                network.valueConflict = true;
                break;
            }

            // Assign value
            if (network.valueConflict) {
                network.currentValue = null;
            } else {
                network.currentValue = value;
            }
        }
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
                    const wireComp = entity.components.Wire;
                    const wireType = wireComp.type;
                    const network = wireComp.linkedNetwork;

                    let opacity = 1;
                    let spriteSet = this.wireSprites;

                    if (!network) {
                        opacity = 0.3;
                    } else {
                        if (network.valueConflict) {
                            opacity = 1;
                            // TODO
                        } else {
                            if (network.currentValue) {
                                if (
                                    network.currentValue.getItemType() === enumItemType.boolean &&
                                    // @ts-ignore
                                    network.currentValue.value === 0
                                ) {
                                    opacity = 0.5;
                                } else {
                                    opacity = 1;
                                }
                            } else {
                                opacity = 0.5;
                            }
                        }
                    }

                    const sprite = spriteSet[wireType];

                    assert(sprite, "Unknown wire type: " + wireType);
                    const staticComp = entity.components.StaticMapEntity;
                    parameters.context.globalAlpha = opacity;
                    staticComp.drawSpriteOnFullEntityBounds(parameters, sprite, 0);
                    parameters.context.globalAlpha = 1;

                    if (G_IS_DEV && globalConfig.debug.renderWireRotations) {
                        parameters.context.fillStyle = "red";
                        parameters.context.font = "5px Tahoma";
                        parameters.context.fillText(
                            "" + staticComp.originalRotation,
                            staticComp.origin.x * globalConfig.tileSize,
                            staticComp.origin.y * globalConfig.tileSize + 5
                        );

                        parameters.context.fillStyle = "rgba(255, 0, 0, 0.2)";
                        if (staticComp.originalRotation % 180 === 0) {
                            parameters.context.fillRect(
                                (staticComp.origin.x + 0.5) * globalConfig.tileSize,
                                staticComp.origin.y * globalConfig.tileSize,
                                3,
                                globalConfig.tileSize
                            );
                        } else {
                            parameters.context.fillRect(
                                staticComp.origin.x * globalConfig.tileSize,
                                (staticComp.origin.y + 0.5) * globalConfig.tileSize,
                                globalConfig.tileSize,
                                3
                            );
                        }
                    }
                }

                // DEBUG Rendering
                if (G_IS_DEV && globalConfig.debug.renderWireNetworkInfos) {
                    if (entity) {
                        const staticComp = entity.components.StaticMapEntity;
                        const wireComp = entity.components.Wire;

                        // Draw network info for wires
                        if (wireComp && wireComp.linkedNetwork) {
                            parameters.context.fillStyle = "red";
                            parameters.context.font = "5px Tahoma";
                            parameters.context.fillText(
                                "W" + wireComp.linkedNetwork.uid,
                                (staticComp.origin.x + 0.5) * globalConfig.tileSize,
                                (staticComp.origin.y + 0.5) * globalConfig.tileSize
                            );
                        }
                    }
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

        logger.log("Updating surrounding wire placement");

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

                        // Update code as well
                        targetStaticComp.code = getCodeFromBuildingData(
                            metaWire,
                            defaultBuildingVariant,
                            rotationVariant
                        );

                        // Make sure the chunks know about the update
                        this.root.signals.entityChanged.dispatch(targetEntity);
                    }
                }
            }
        }
    }
}
