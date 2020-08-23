import { globalConfig } from "../../core/config";
import { gMetaBuildingRegistry } from "../../core/global_registries";
import { Loader } from "../../core/loader";
import { createLogger } from "../../core/logging";
import { Rectangle } from "../../core/rectangle";
import { StaleAreaDetector } from "../../core/stale_area_detector";
import { fastArrayDeleteValueIfContained } from "../../core/utils";
import {
    arrayAllDirections,
    enumDirection,
    enumDirectionToVector,
    enumInvertedDirections,
    Vector,
} from "../../core/vector";
import { BaseItem } from "../base_item";
import { BooleanItem } from "../items/boolean_item";
import { arrayWireRotationVariantToType, MetaWireBuilding } from "../buildings/wire";
import { getCodeFromBuildingData } from "../building_codes";
import { enumWireType, WireComponent } from "../components/wire";
import { enumPinSlotType, WiredPinsComponent } from "../components/wired_pins";
import { WireTunnelComponent } from "../components/wire_tunnel";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { MapChunkView } from "../map_chunk_view";
import { defaultBuildingVariant } from "../meta_building";

const logger = createLogger("wires");

let networkUidCounter = 0;

const VERBOSE_WIRES = G_IS_DEV && false;

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
         * All connected tunnels
         * @type {Array<Entity>}
         */
        this.tunnels = [];

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
            regular: {
                [enumWireType.regular]: Loader.getSprite("sprites/wires/sets/regular_forward.png"),
                [enumWireType.turn]: Loader.getSprite("sprites/wires/sets/regular_turn.png"),
                [enumWireType.split]: Loader.getSprite("sprites/wires/sets/regular_split.png"),
                [enumWireType.cross]: Loader.getSprite("sprites/wires/sets/regular_cross.png"),
            },
            conflict: {
                [enumWireType.regular]: Loader.getSprite("sprites/wires/sets/conflict_forward.png"),
                [enumWireType.turn]: Loader.getSprite("sprites/wires/sets/conflict_turn.png"),
                [enumWireType.split]: Loader.getSprite("sprites/wires/sets/conflict_split.png"),
                [enumWireType.cross]: Loader.getSprite("sprites/wires/sets/conflict_cross.png"),
            },
            shape: {
                [enumWireType.regular]: Loader.getSprite("sprites/wires/sets/shape_forward.png"),
                [enumWireType.turn]: Loader.getSprite("sprites/wires/sets/shape_turn.png"),
                [enumWireType.split]: Loader.getSprite("sprites/wires/sets/shape_split.png"),
                [enumWireType.cross]: Loader.getSprite("sprites/wires/sets/shape_cross.png"),
            },
            color: {
                [enumWireType.regular]: Loader.getSprite("sprites/wires/sets/color_forward.png"),
                [enumWireType.turn]: Loader.getSprite("sprites/wires/sets/color_turn.png"),
                [enumWireType.split]: Loader.getSprite("sprites/wires/sets/color_split.png"),
                [enumWireType.cross]: Loader.getSprite("sprites/wires/sets/color_cross.png"),
            },
        };

        this.root.signals.entityDestroyed.add(this.queuePlacementUpdate, this);
        this.root.signals.entityAdded.add(this.queuePlacementUpdate, this);

        this.root.signals.entityDestroyed.add(this.queueRecomputeIfWire, this);
        this.root.signals.entityChanged.add(this.queueRecomputeIfWire, this);
        this.root.signals.entityAdded.add(this.queueRecomputeIfWire, this);

        this.needsRecompute = true;

        this.staleArea = new StaleAreaDetector({
            root: this.root,
            name: "wires",
            recomputeMethod: this.updateSurroundingWirePlacement.bind(this),
        });

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

        if (this.isEntityRelevantForWires(entity)) {
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

        const tunnelEntities = this.root.entityMgr.getAllWithComponent(WireTunnelComponent);
        for (let i = 0; i < tunnelEntities.length; ++i) {
            tunnelEntities[i].components.WireTunnel.linkedNetworks = [];
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
                const newTargets = this.findSurroundingWireTargets(
                    newSearchTile,
                    newSearchDirections,
                    currentNetwork
                );

                VERBOSE_WIRES && logger.log("   Found", newTargets, "new targets to visit!");
                for (let i = 0; i < newTargets.length; ++i) {
                    entitiesToVisit.push(newTargets[i]);
                }
            }
        }

        if (
            currentNetwork.providers.length > 0 &&
            (currentNetwork.wires.length > 0 ||
                currentNetwork.receivers.length > 0 ||
                currentNetwork.tunnels.length > 0)
        ) {
            this.networks.push(currentNetwork);
            VERBOSE_WIRES && logger.log("Attached new network with uid", currentNetwork);
        } else {
            // Unregister network again
            for (let i = 0; i < currentNetwork.wires.length; ++i) {
                currentNetwork.wires[i].components.Wire.linkedNetwork = null;
            }

            for (let i = 0; i < currentNetwork.tunnels.length; ++i) {
                fastArrayDeleteValueIfContained(
                    currentNetwork.tunnels[i].components.WireTunnel.linkedNetworks,
                    currentNetwork
                );
            }

            for (let i = 0; i < currentNetwork.allSlots.length; ++i) {
                currentNetwork.allSlots[i].slot.linkedNetwork = null;
            }
        }
    }

    /**
     * Finds surrounding entities which are not yet assigned to a network
     * @param {Vector} initialTile
     * @param {Array<enumDirection>} directions
     * @param {WireNetwork} network
     * @returns {Array<any>}
     */
    findSurroundingWireTargets(initialTile, directions, network) {
        let result = [];

        VERBOSE_WIRES &&
            logger.log("    Searching for new targets at", initialTile.toString(), "and d=", directions);

        // Go over all directions we should search for
        for (let i = 0; i < directions.length; ++i) {
            const direction = directions[i];
            const offset = enumDirectionToVector[direction];
            const initialSearchTile = initialTile.add(offset);

            // Store which tunnels we already visited to avoid infinite loops
            const visitedTunnels = new Set();

            // First, find the initial connected entities
            const initialContents = this.root.map.getLayersContentsMultipleXY(
                initialSearchTile.x,
                initialSearchTile.y
            );

            // Link the initial tile to the initial entities, since it may change
            /** @type {Array<{entity: Entity, tile: Vector}>} */
            const contents = [];
            for (let j = 0; j < initialContents.length; ++j) {
                contents.push({
                    entity: initialContents[j],
                    tile: initialSearchTile,
                });
            }

            for (let k = 0; k < contents.length; ++k) {
                const { entity, tile } = contents[k];
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
                        if (!pinPos.equals(tile)) {
                            continue;
                        }

                        // Check if the direction (inverted) matches
                        const pinDirection = staticComp.localDirectionToWorld(slot.direction);
                        if (pinDirection !== enumInvertedDirections[direction]) {
                            continue;
                        }

                        if (!slot.linkedNetwork) {
                            result.push({
                                entity,
                                slot,
                            });
                        }
                    }

                    // Pin slots mean it can be nothing else
                    continue;
                }

                // Check if its a tunnel, if so, go to the forwarded item
                const tunnelComp = entity.components.WireTunnel;
                if (tunnelComp) {
                    if (visitedTunnels.has(entity.uid)) {
                        continue;
                    }

                    const staticComp = entity.components.StaticMapEntity;

                    if (
                        !tunnelComp.multipleDirections &&
                        !(
                            direction === staticComp.localDirectionToWorld(enumDirection.top) ||
                            direction === staticComp.localDirectionToWorld(enumDirection.bottom)
                        )
                    ) {
                        // It's a coating, and it doesn't connect here
                        continue;
                    }

                    // Compute where this tunnel connects to
                    const forwardedTile = staticComp.origin.add(offset);
                    VERBOSE_WIRES &&
                        logger.log(
                            "   Found tunnel",
                            entity.uid,
                            "at",
                            tile,
                            "-> forwarding to",
                            forwardedTile
                        );

                    // Figure out which entities are connected
                    const connectedContents = this.root.map.getLayersContentsMultipleXY(
                        forwardedTile.x,
                        forwardedTile.y
                    );

                    // Attach the entities and the tile we search at, because it may change
                    for (let h = 0; h < connectedContents.length; ++h) {
                        contents.push({
                            entity: connectedContents[h],
                            tile: forwardedTile,
                        });
                    }

                    // Add the tunnel to the network
                    if (tunnelComp.linkedNetworks.indexOf(network) < 0) {
                        tunnelComp.linkedNetworks.push(network);
                    }
                    if (network.tunnels.indexOf(entity) < 0) {
                        network.tunnels.push(entity);
                    }

                    // Remember this tunnel
                    visitedTunnels.add(entity.uid);
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
        this.staleArea.update();

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
     * Returns the given tileset and opacity
     * @param {WireComponent} wireComp
     * @returns {{ spriteSet: Object<enumWireType, import("../../core/draw_utils").AtlasSprite>, opacity: number}}
     */
    getSpriteSetAndOpacityForWire(wireComp) {
        if (!wireComp.linkedNetwork) {
            // There is no network, it's empty
            return {
                spriteSet: this.wireSprites.regular,
                opacity: 0.3,
            };
        }

        const network = wireComp.linkedNetwork;
        if (network.valueConflict) {
            // There is a conflict
            return {
                spriteSet: this.wireSprites.conflict,
                opacity: 1,
            };
        }

        const value = network.currentValue;
        if (!value) {
            // There is no value stored
            return {
                spriteSet: this.wireSprites.regular,
                opacity: 0.3,
            };
        }

        const valueType = value.getItemType();
        if (valueType === "shape") {
            return {
                spriteSet: this.wireSprites.shape,
                opacity: 1,
            };
        } else if (valueType === "color") {
            return {
                spriteSet: this.wireSprites.color,
                opacity: 1,
            };
        } else if (valueType === "boolean") {
            return {
                spriteSet: this.wireSprites.regular,
                opacity: /** @type {BooleanItem} */ (value).value ? 1 : 0.5,
            };
        } else {
            assertAlways(false, "Unknown item type: " + valueType);
        }

        return {
            spriteSet: this.wireSprites.regular,
            opacity: 1,
        };
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

                    const { opacity, spriteSet } = this.getSpriteSetAndOpacityForWire(wireComp);

                    const sprite = spriteSet[wireType];

                    assert(sprite, "Unknown wire type: " + wireType);
                    const staticComp = entity.components.StaticMapEntity;
                    parameters.context.globalAlpha = opacity;
                    staticComp.drawSpriteOnBoundsClipped(parameters, sprite, 0);
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
     * Returns whether this entity is relevant for the wires network
     * @param {Entity} entity
     */
    isEntityRelevantForWires(entity) {
        return entity.components.Wire || entity.components.WiredPins || entity.components.WireTunnel;
    }

    /**
     *
     * @param {Entity} entity
     */
    queuePlacementUpdate(entity) {
        if (!this.root.gameInitialized) {
            return;
        }

        if (!this.isEntityRelevantForWires(entity)) {
            return;
        }

        const staticComp = entity.components.StaticMapEntity;
        if (!staticComp) {
            return;
        }

        // Invalidate affected area
        const originalRect = staticComp.getTileSpaceBounds();
        const affectedArea = originalRect.expandedInAllDirections(1);
        this.staleArea.invalidate(affectedArea);
    }

    /**
     * Updates the wire placement after an entity has been added / deleted
     * @param {Rectangle} affectedArea
     */
    updateSurroundingWirePlacement(affectedArea) {
        const metaWire = gMetaBuildingRegistry.findByClass(MetaWireBuilding);

        for (let x = affectedArea.x; x < affectedArea.right(); ++x) {
            for (let y = affectedArea.y; y < affectedArea.bottom(); ++y) {
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
