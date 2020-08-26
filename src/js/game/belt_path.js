import { globalConfig } from "../core/config";
import { DrawParameters } from "../core/draw_parameters";
import { createLogger } from "../core/logging";
import { Rectangle } from "../core/rectangle";
import { epsilonCompare, round4Digits } from "../core/utils";
import { enumDirection, enumDirectionToVector, enumInvertedDirections, Vector } from "../core/vector";
import { BasicSerializableObject, types } from "../savegame/serialization";
import { BaseItem } from "./base_item";
import { Entity } from "./entity";
import { typeItemSingleton } from "./item_resolver";
import { GameRoot } from "./root";

const logger = createLogger("belt_path");

// Helpers for more semantic access into interleaved arrays
const _nextDistance = 0;
const _item = 1;

const DEBUG = G_IS_DEV && false;

/**
 * Stores a path of belts, used for optimizing performance
 */
export class BeltPath extends BasicSerializableObject {
    static getId() {
        return "BeltPath";
    }

    static getSchema() {
        return {
            entityPath: types.array(types.entity),
            items: types.array(types.pair(types.ufloat, typeItemSingleton)),
            spacingToFirstItem: types.ufloat,
        };
    }

    /**
     * Creates a path from a serialized object
     * @param {GameRoot} root
     * @param {Object} data
     * @returns {BeltPath|string}
     */
    static fromSerialized(root, data) {
        // Create fake object which looks like a belt path but skips the constructor
        const fakeObject = /** @type {BeltPath} */ (Object.create(BeltPath.prototype));
        fakeObject.root = root;

        // Deserialize the data
        const errorCodeDeserialize = fakeObject.deserialize(data);
        if (errorCodeDeserialize) {
            return errorCodeDeserialize;
        }

        // Compute other properties
        fakeObject.init(false);

        return fakeObject;
    }

    /**
     * @param {GameRoot} root
     * @param {Array<Entity>} entityPath
     */
    constructor(root, entityPath) {
        super();
        this.root = root;

        assert(entityPath.length > 0, "invalid entity path");
        this.entityPath = entityPath;

        /**
         * Stores the items sorted, and their distance to the previous item (or start)
         * Layout: [distanceToNext, item]
         * @type {Array<[number, BaseItem]>}
         */
        this.items = [];

        /**
         * Stores the spacing to the first item
         */

        this.init();

        if (G_IS_DEV && globalConfig.debug.checkBeltPaths) {
            this.debug_checkIntegrity("constructor");
        }
    }
    /**
     * Initializes the path by computing the properties which are not saved
     * @param {boolean} computeSpacing Whether to also compute the spacing
     */
    init(computeSpacing = true) {
        this.onPathChanged();

        this.totalLength = this.computeTotalLength();

        if (computeSpacing) {
            this.spacingToFirstItem = this.totalLength;
        }

        /**
         * Current bounds of this path
         * @type {Rectangle}
         */
        this.worldBounds = this.computeBounds();

        // Connect the belts
        for (let i = 0; i < this.entityPath.length; ++i) {
            this.entityPath[i].components.Belt.assignedPath = this;
        }
    }

    /**
     * Returns whether this path can accept a new item
     * @returns {boolean}
     */
    canAcceptItem() {
        return this.spacingToFirstItem >= globalConfig.itemSpacingOnBelts;
    }

    /**
     * Tries to accept the item
     * @param {BaseItem} item
     */
    tryAcceptItem(item) {
        if (this.spacingToFirstItem >= globalConfig.itemSpacingOnBelts) {
            // So, since we already need one tick to accept this item we will add this directly.
            const beltProgressPerTick =
                this.root.hubGoals.getBeltBaseSpeed() *
                this.root.dynamicTickrate.deltaSeconds *
                globalConfig.itemSpacingOnBelts;

            // First, compute how much progress we can make *at max*
            const maxProgress = Math.max(0, this.spacingToFirstItem - globalConfig.itemSpacingOnBelts);
            const initialProgress = Math.min(maxProgress, beltProgressPerTick);

            this.items.unshift([this.spacingToFirstItem - initialProgress, item]);
            this.spacingToFirstItem = initialProgress;

            if (G_IS_DEV && globalConfig.debug.checkBeltPaths) {
                this.debug_checkIntegrity("accept-item");
            }

            return true;
        }
        return false;
    }

    /**
     * SLOW / Tries to find the item closest to the given tile
     * @param {Vector} tile
     * @returns {BaseItem|null}
     */
    findItemAtTile(tile) {
        // @TODO: This breaks color blind mode otherwise
        return null;
    }

    /**
     * Computes the tile bounds of the path
     * @returns {Rectangle}
     */
    computeBounds() {
        let bounds = this.entityPath[0].components.StaticMapEntity.getTileSpaceBounds();
        for (let i = 1; i < this.entityPath.length; ++i) {
            const staticComp = this.entityPath[i].components.StaticMapEntity;
            const otherBounds = staticComp.getTileSpaceBounds();
            bounds = bounds.getUnion(otherBounds);
        }
        return bounds.allScaled(globalConfig.tileSize);
    }

    /**
     * Recomputes cache variables once the path was changed
     */
    onPathChanged() {
        this.acceptorTarget = this.computeAcceptingEntityAndSlot();
    }

    /**
     * Called by the belt system when the surroundings changed
     */
    onSurroundingsChanged() {
        this.onPathChanged();
    }

    /**
     * Finds the entity which accepts our items
     * @return {{ entity: Entity, slot: number, direction?: enumDirection }}
     */
    computeAcceptingEntityAndSlot() {
        const lastEntity = this.entityPath[this.entityPath.length - 1];
        const lastStatic = lastEntity.components.StaticMapEntity;
        const lastBeltComp = lastEntity.components.Belt;

        // Figure out where and into which direction we eject items
        const ejectSlotWsTile = lastStatic.localTileToWorld(new Vector(0, 0));
        const ejectSlotWsDirection = lastStatic.localDirectionToWorld(lastBeltComp.direction);
        const ejectSlotWsDirectionVector = enumDirectionToVector[ejectSlotWsDirection];
        const ejectSlotTargetWsTile = ejectSlotWsTile.add(ejectSlotWsDirectionVector);

        // Try to find the given acceptor component to take the item
        const targetEntity = this.root.map.getLayerContentXY(
            ejectSlotTargetWsTile.x,
            ejectSlotTargetWsTile.y,
            "regular"
        );

        if (targetEntity) {
            const targetStaticComp = targetEntity.components.StaticMapEntity;
            const targetBeltComp = targetEntity.components.Belt;

            // Check for belts (special case)
            if (targetBeltComp) {
                const beltAcceptingDirection = targetStaticComp.localDirectionToWorld(enumDirection.top);
                if (ejectSlotWsDirection === beltAcceptingDirection) {
                    return {
                        entity: targetEntity,
                        direction: null,
                        slot: 0,
                    };
                }
            }

            // Check for item acceptors
            const targetAcceptorComp = targetEntity.components.ItemAcceptor;
            if (!targetAcceptorComp) {
                // Entity doesn't accept items
                return;
            }

            const ejectingDirection = targetStaticComp.worldDirectionToLocal(ejectSlotWsDirection);
            const matchingSlot = targetAcceptorComp.findMatchingSlot(
                targetStaticComp.worldToLocalTile(ejectSlotTargetWsTile),
                ejectingDirection
            );

            if (!matchingSlot) {
                // No matching slot found
                return;
            }

            return {
                entity: targetEntity,
                slot: matchingSlot.index,
                direction: enumInvertedDirections[ejectingDirection],
            };
        }
    }

    // Following code will be compiled out outside of dev versions
    /* dev:start */

    /**
     * Helper to throw an error on mismatch
     * @param {string} change
     * @param {Array<any>} reason
     */
    debug_failIntegrity(change, ...reason) {
        throw new Error("belt path invalid (" + change + "): " + reason.map(i => "" + i).join(" "));
    }

    /**
     * Checks if this path is valid
     */
    debug_checkIntegrity(currentChange = "change") {
        const fail = (...args) => this.debug_failIntegrity(currentChange, ...args);

        // Check for empty path
        if (this.entityPath.length === 0) {
            return fail("Belt path is empty");
        }

        // Check for mismatching length
        const totalLength = this.computeTotalLength();
        if (!epsilonCompare(this.totalLength, totalLength, 0.01)) {
            return this.debug_failIntegrity(
                currentChange,
                "Total length mismatch, stored =",
                this.totalLength,
                "but correct is",
                totalLength
            );
        }

        // Check for misconnected entities
        for (let i = 0; i < this.entityPath.length - 1; ++i) {
            const entity = this.entityPath[i];
            if (entity.destroyed) {
                return fail("Reference to destroyed entity " + entity.uid);
            }

            const followUp = this.root.systemMgr.systems.belt.findFollowUpEntity(entity);
            if (!followUp) {
                return fail(
                    "Follow up entity for the",
                    i,
                    "-th entity (total length",
                    this.entityPath.length,
                    ") was null!"
                );
            }
            if (followUp !== this.entityPath[i + 1]) {
                return fail(
                    "Follow up entity mismatch, stored is",
                    this.entityPath[i + 1].uid,
                    "but real one is",
                    followUp.uid
                );
            }
            if (entity.components.Belt.assignedPath !== this) {
                return fail(
                    "Entity with uid",
                    entity.uid,
                    "doesn't have this path assigned, but this path contains the entity."
                );
            }
        }

        // Check spacing
        if (this.spacingToFirstItem > this.totalLength + 0.005) {
            return fail(
                currentChange,
                "spacing to first item (",
                this.spacingToFirstItem,
                ") is greater than total length (",
                this.totalLength,
                ")"
            );
        }

        // Check distance if empty
        if (this.items.length === 0 && !epsilonCompare(this.spacingToFirstItem, this.totalLength, 0.01)) {
            return fail(
                currentChange,
                "Path is empty but spacing to first item (",
                this.spacingToFirstItem,
                ") does not equal total length (",
                this.totalLength,
                ")"
            );
        }

        // Check items etc
        let currentPos = this.spacingToFirstItem;
        for (let i = 0; i < this.items.length; ++i) {
            const item = this.items[i];

            if (item[_nextDistance] < 0 || item[_nextDistance] > this.totalLength + 0.02) {
                return fail(
                    "Item has invalid offset to next item: ",
                    item[_nextDistance],
                    "(total length:",
                    this.totalLength,
                    ")"
                );
            }

            currentPos += item[_nextDistance];
        }

        // Check the total sum matches
        if (!epsilonCompare(currentPos, this.totalLength, 0.01)) {
            return fail(
                "total sum (",
                currentPos,
                ") of first item spacing (",
                this.spacingToFirstItem,
                ") and items does not match total length (",
                this.totalLength,
                ") -> items: " + this.items.map(i => i[_nextDistance]).join("|")
            );
        }

        // Check bounds
        const actualBounds = this.computeBounds();
        if (!actualBounds.equalsEpsilon(this.worldBounds, 0.01)) {
            return fail("Bounds are stale");
        }
    }

    /* dev:end */

    /**
     * Extends the belt path by the given belt
     * @param {Entity} entity
     */
    extendOnEnd(entity) {
        DEBUG && logger.log("Extending belt path by entity at", entity.components.StaticMapEntity.origin);

        const beltComp = entity.components.Belt;

        // Append the entity
        this.entityPath.push(entity);
        this.onPathChanged();

        // Extend the path length
        const additionalLength = beltComp.getEffectiveLengthTiles();
        this.totalLength += additionalLength;
        DEBUG && logger.log("  Extended total length by", additionalLength, "to", this.totalLength);

        // If we have no item, just update the distance to the first item
        if (this.items.length === 0) {
            this.spacingToFirstItem = this.totalLength;
            DEBUG && logger.log("  Extended spacing to first to", this.totalLength, "(= total length)");
        } else {
            // Otherwise, update the next-distance of the last item
            const lastItem = this.items[this.items.length - 1];
            DEBUG &&
                logger.log(
                    "  Extended spacing of last item from",
                    lastItem[_nextDistance],
                    "to",
                    lastItem[_nextDistance] + additionalLength
                );
            lastItem[_nextDistance] += additionalLength;
        }

        // Assign reference
        beltComp.assignedPath = this;

        // Update bounds
        this.worldBounds = this.computeBounds();

        if (G_IS_DEV && globalConfig.debug.checkBeltPaths) {
            this.debug_checkIntegrity("extend-on-end");
        }
    }

    /**
     * Extends the path with the given entity on the beginning
     * @param {Entity} entity
     */
    extendOnBeginning(entity) {
        const beltComp = entity.components.Belt;

        DEBUG && logger.log("Extending the path on the beginning");

        // All items on that belt are simply lost (for now)

        const length = beltComp.getEffectiveLengthTiles();

        // Extend the length of this path
        this.totalLength += length;

        // Simply adjust the first item spacing cuz we have no items contained
        this.spacingToFirstItem += length;

        // Set handles and append entity
        beltComp.assignedPath = this;
        this.entityPath.unshift(entity);
        this.onPathChanged();

        // Update bounds
        this.worldBounds = this.computeBounds();

        if (G_IS_DEV && globalConfig.debug.checkBeltPaths) {
            this.debug_checkIntegrity("extend-on-begin");
        }
    }

    /**
     * Returns if the given entity is the end entity of the path
     * @param {Entity} entity
     * @returns {boolean}
     */
    isEndEntity(entity) {
        return this.entityPath[this.entityPath.length - 1] === entity;
    }

    /**
     * Returns if the given entity is the start entity of the path
     * @param {Entity} entity
     * @returns {boolean}
     */
    isStartEntity(entity) {
        return this.entityPath[0] === entity;
    }

    /**
     * Splits this path at the given entity by removing it, and
     * returning the new secondary paht
     * @param {Entity} entity
     * @returns {BeltPath}
     */
    deleteEntityOnPathSplitIntoTwo(entity) {
        DEBUG && logger.log("Splitting path at entity", entity.components.StaticMapEntity.origin);

        // First, find where the current path ends
        const beltComp = entity.components.Belt;
        beltComp.assignedPath = null;

        const entityLength = beltComp.getEffectiveLengthTiles();
        assert(this.entityPath.indexOf(entity) >= 0, "Entity not contained for split");
        assert(this.entityPath.indexOf(entity) !== 0, "Entity is first");
        assert(this.entityPath.indexOf(entity) !== this.entityPath.length - 1, "Entity is last");

        let firstPathEntityCount = 0;
        let firstPathLength = 0;
        let firstPathEndEntity = null;

        for (let i = 0; i < this.entityPath.length; ++i) {
            const otherEntity = this.entityPath[i];
            if (otherEntity === entity) {
                DEBUG && logger.log("Found entity at", i, "of length", firstPathLength);
                break;
            }

            ++firstPathEntityCount;
            firstPathEndEntity = otherEntity;
            firstPathLength += otherEntity.components.Belt.getEffectiveLengthTiles();
        }

        DEBUG &&
            logger.log(
                "First path ends at",
                firstPathLength,
                "and entity",
                firstPathEndEntity.components.StaticMapEntity.origin,
                "and has",
                firstPathEntityCount,
                "entities"
            );

        // Compute length of second path
        const secondPathLength = this.totalLength - firstPathLength - entityLength;
        const secondPathStart = firstPathLength + entityLength;
        const secondEntities = this.entityPath.splice(firstPathEntityCount + 1);
        DEBUG &&
            logger.log(
                "Second path starts at",
                secondPathStart,
                "and has a length of ",
                secondPathLength,
                "with",
                secondEntities.length,
                "entities"
            );

        // Remove the last item
        this.entityPath.pop();

        DEBUG && logger.log("Splitting", this.items.length, "items");
        DEBUG &&
            logger.log(
                "Old items are",
                this.items.map(i => i[_nextDistance])
            );

        // Create second path
        const secondPath = new BeltPath(this.root, secondEntities);

        // Remove all items which are no longer relevant and transfer them to the second path
        let itemPos = this.spacingToFirstItem;
        for (let i = 0; i < this.items.length; ++i) {
            const item = this.items[i];
            const distanceToNext = item[_nextDistance];

            DEBUG && logger.log("  Checking item at", itemPos, "with distance of", distanceToNext, "to next");

            // Check if this item is past the first path
            if (itemPos >= firstPathLength) {
                // Remove it from the first path
                this.items.splice(i, 1);
                i -= 1;
                DEBUG &&
                    logger.log("     Removed item from first path since its no longer contained @", itemPos);

                // Check if its on the second path (otherwise its on the removed belt and simply lost)
                if (itemPos >= secondPathStart) {
                    // Put item on second path
                    secondPath.items.push([distanceToNext, item[_item]]);
                    DEBUG &&
                        logger.log(
                            "     Put item to second path @",
                            itemPos,
                            "with distance to next =",
                            distanceToNext
                        );

                    // If it was the first item, adjust the distance to the first item
                    if (secondPath.items.length === 1) {
                        DEBUG && logger.log("       Sinc it was the first, set sapcing of first to", itemPos);
                        secondPath.spacingToFirstItem = itemPos - secondPathStart;
                    }
                } else {
                    DEBUG && logger.log("    Item was on the removed belt, so its gone - forever!");
                }
            } else {
                // Seems this item is on the first path (so all good), so just make sure it doesn't
                // have a nextDistance which is bigger than the total path length
                const clampedDistanceToNext = Math.min(itemPos + distanceToNext, firstPathLength) - itemPos;
                if (clampedDistanceToNext < distanceToNext) {
                    DEBUG &&
                        logger.log(
                            "Correcting next distance (first path) from",
                            distanceToNext,
                            "to",
                            clampedDistanceToNext
                        );
                    item[_nextDistance] = clampedDistanceToNext;
                }
            }

            // Advance items
            itemPos += distanceToNext;
        }

        DEBUG &&
            logger.log(
                "New items are",
                this.items.map(i => i[_nextDistance])
            );

        DEBUG &&
            logger.log(
                "And second path items are",
                secondPath.items.map(i => i[_nextDistance])
            );

        // Adjust our total length
        this.totalLength = firstPathLength;

        // Make sure that if we are empty, we set our first distance properly
        if (this.items.length === 0) {
            this.spacingToFirstItem = this.totalLength;
        }

        this.onPathChanged();
        secondPath.onPathChanged();

        // Update bounds
        this.worldBounds = this.computeBounds();

        if (G_IS_DEV && globalConfig.debug.checkBeltPaths) {
            this.debug_checkIntegrity("split-two-first");
            secondPath.debug_checkIntegrity("split-two-second");
        }

        return secondPath;
    }

    /**
     * Deletes the last entity
     * @param {Entity} entity
     */
    deleteEntityOnEnd(entity) {
        assert(
            this.entityPath[this.entityPath.length - 1] === entity,
            "Not actually the last entity (instead " + this.entityPath.indexOf(entity) + ")"
        );

        // Ok, first remove the entity
        const beltComp = entity.components.Belt;
        const beltLength = beltComp.getEffectiveLengthTiles();

        DEBUG &&
            logger.log(
                "Deleting last entity on path with length",
                this.entityPath.length,
                "(reducing",
                this.totalLength,
                " by",
                beltLength,
                ")"
            );
        this.totalLength -= beltLength;
        this.entityPath.pop();
        this.onPathChanged();

        DEBUG &&
            logger.log(
                "  New path has length of",
                this.totalLength,
                "with",
                this.entityPath.length,
                "entities"
            );

        // This is just for sanity
        beltComp.assignedPath = null;

        // Clean up items
        if (this.items.length === 0) {
            // Simple case with no items, just update the first item spacing
            this.spacingToFirstItem = this.totalLength;
        } else {
            // Ok, make sure we simply drop all items which are no longer contained
            let itemOffset = this.spacingToFirstItem;
            let lastItemOffset = itemOffset;

            DEBUG && logger.log("  Adjusting", this.items.length, "items");

            for (let i = 0; i < this.items.length; ++i) {
                const item = this.items[i];

                // Get rid of items past this path
                if (itemOffset >= this.totalLength) {
                    DEBUG && logger.log("Dropping item (current index=", i, ")");
                    this.items.splice(i, 1);
                    i -= 1;
                    continue;
                }

                DEBUG && logger.log("Item", i, "is at", itemOffset, "with next offset", item[_nextDistance]);
                lastItemOffset = itemOffset;
                itemOffset += item[_nextDistance];
            }

            // If we still have an item, make sure the last item matches
            if (this.items.length > 0) {
                // We can easily compute the next distance since we know where the last item is now
                const lastDistance = this.totalLength - lastItemOffset;
                assert(
                    lastDistance >= 0.0,
                    "Last item distance mismatch: " +
                        lastDistance +
                        " -> Total length was " +
                        this.totalLength +
                        " and lastItemOffset was " +
                        lastItemOffset
                );

                DEBUG &&
                    logger.log(
                        "Adjusted distance of last item: it is at",
                        lastItemOffset,
                        "so it has a distance of",
                        lastDistance,
                        "to the end (",
                        this.totalLength,
                        ")"
                    );
                this.items[this.items.length - 1][_nextDistance] = lastDistance;
            } else {
                DEBUG && logger.log("  Removed all items so we'll update spacing to total length");

                // We removed all items so update our spacing
                this.spacingToFirstItem = this.totalLength;
            }
        }

        // Update bounds
        this.worldBounds = this.computeBounds();

        if (G_IS_DEV && globalConfig.debug.checkBeltPaths) {
            this.debug_checkIntegrity("delete-on-end");
        }
    }

    /**
     * Deletes the entity of the start of the path
     * @see deleteEntityOnEnd
     * @param {Entity} entity
     */
    deleteEntityOnStart(entity) {
        assert(
            entity === this.entityPath[0],
            "Not actually the start entity (instead " + this.entityPath.indexOf(entity) + ")"
        );

        // Ok, first remove the entity
        const beltComp = entity.components.Belt;
        const beltLength = beltComp.getEffectiveLengthTiles();

        DEBUG &&
            logger.log(
                "Deleting first entity on path with length",
                this.entityPath.length,
                "(reducing",
                this.totalLength,
                " by",
                beltLength,
                ")"
            );
        this.totalLength -= beltLength;
        this.entityPath.shift();
        this.onPathChanged();

        DEBUG &&
            logger.log(
                "  New path has length of",
                this.totalLength,
                "with",
                this.entityPath.length,
                "entities"
            );

        // This is just for sanity
        beltComp.assignedPath = null;

        // Clean up items
        if (this.items.length === 0) {
            // Simple case with no items, just update the first item spacing
            this.spacingToFirstItem = this.totalLength;
        } else {
            // Simple case, we had no item on the beginning -> all good
            if (this.spacingToFirstItem >= beltLength) {
                DEBUG &&
                    logger.log(
                        "  No item on the first place, so we can just adjust the spacing (spacing=",
                        this.spacingToFirstItem,
                        ") removed =",
                        beltLength
                    );
                this.spacingToFirstItem -= beltLength;
            } else {
                // Welp, okay we need to drop all items which are < beltLength and adjust
                // the other item offsets as well

                DEBUG &&
                    logger.log(
                        "  We have at least one item in the beginning, drop those and adjust spacing (first item @",
                        this.spacingToFirstItem,
                        ") since we removed",
                        beltLength,
                        "length from path"
                    );
                DEBUG &&
                    logger.log(
                        "    Items:",
                        this.items.map(i => i[_nextDistance])
                    );

                // Find offset to first item
                let itemOffset = this.spacingToFirstItem;
                for (let i = 0; i < this.items.length; ++i) {
                    const item = this.items[i];
                    if (itemOffset <= beltLength) {
                        DEBUG &&
                            logger.log(
                                "  -> Dropping item with index",
                                i,
                                "at",
                                itemOffset,
                                "since it was on the removed belt"
                            );
                        // This item must be dropped
                        this.items.splice(i, 1);
                        i -= 1;
                        itemOffset += item[_nextDistance];
                        continue;
                    } else {
                        // This item can be kept, thus its the first we know
                        break;
                    }
                }

                if (this.items.length > 0) {
                    DEBUG &&
                        logger.log(
                            "  Offset of first non-dropped item was at:",
                            itemOffset,
                            "-> setting spacing to it (total length=",
                            this.totalLength,
                            ")"
                        );

                    this.spacingToFirstItem = itemOffset - beltLength;
                    assert(
                        this.spacingToFirstItem >= 0.0,
                        "Invalid spacing after delete on start: " + this.spacingToFirstItem
                    );
                } else {
                    DEBUG && logger.log("  We dropped all items, simply set spacing to total length");
                    // We dropped all items, simple one
                    this.spacingToFirstItem = this.totalLength;
                }
            }
        }

        // Update bounds
        this.worldBounds = this.computeBounds();

        if (G_IS_DEV && globalConfig.debug.checkBeltPaths) {
            this.debug_checkIntegrity("delete-on-start");
        }
    }

    /**
     * Extends the path by the given other path
     * @param {BeltPath} otherPath
     */
    extendByPath(otherPath) {
        assert(otherPath !== this, "Circular path dependency");

        const entities = otherPath.entityPath;
        DEBUG && logger.log("Extending path by other path, starting to add entities");

        const oldLength = this.totalLength;

        DEBUG && logger.log("  Adding", entities.length, "new entities, current length =", this.totalLength);

        // First, append entities
        for (let i = 0; i < entities.length; ++i) {
            const entity = entities[i];
            const beltComp = entity.components.Belt;

            // Add to path and update references
            this.entityPath.push(entity);
            beltComp.assignedPath = this;

            // Update our length
            const additionalLength = beltComp.getEffectiveLengthTiles();
            this.totalLength += additionalLength;
        }

        DEBUG &&
            logger.log(
                "  Path is now",
                this.entityPath.length,
                "entities and has a length of",
                this.totalLength
            );

        // Now, update the distance of our last item
        if (this.items.length !== 0) {
            const lastItem = this.items[this.items.length - 1];
            lastItem[_nextDistance] += otherPath.spacingToFirstItem;
            DEBUG &&
                logger.log("  Add distance to last item, effectively being", lastItem[_nextDistance], "now");
        } else {
            // Seems we have no items, update our first item distance
            this.spacingToFirstItem = oldLength + otherPath.spacingToFirstItem;
            DEBUG &&
                logger.log(
                    "  We had no items, so our new spacing to first is old length (",
                    oldLength,
                    ") plus others spacing to first (",
                    otherPath.spacingToFirstItem,
                    ") =",
                    this.spacingToFirstItem
                );
        }

        DEBUG && logger.log("  Pushing", otherPath.items.length, "items from other path");

        // Aaand push the other paths items
        for (let i = 0; i < otherPath.items.length; ++i) {
            const item = otherPath.items[i];
            this.items.push([item[_nextDistance], item[_item]]);
        }

        // Update bounds
        this.worldBounds = this.computeBounds();

        this.onPathChanged();

        if (G_IS_DEV && globalConfig.debug.checkBeltPaths) {
            this.debug_checkIntegrity("extend-by-path");
        }
    }

    /**
     * Computes the total length of the path
     * @returns {number}
     */
    computeTotalLength() {
        let length = 0;
        for (let i = 0; i < this.entityPath.length; ++i) {
            const entity = this.entityPath[i];
            length += entity.components.Belt.getEffectiveLengthTiles();
        }
        return length;
    }

    /**
     * Performs one tick
     */
    update() {
        if (G_IS_DEV && globalConfig.debug.checkBeltPaths) {
            this.debug_checkIntegrity("pre-update");
        }

        // Divide by item spacing on belts since we use throughput and not speed
        let beltSpeed =
            this.root.hubGoals.getBeltBaseSpeed() *
            this.root.dynamicTickrate.deltaSeconds *
            globalConfig.itemSpacingOnBelts;

        if (G_IS_DEV && globalConfig.debug.instantBelts) {
            beltSpeed *= 100;
        }

        let minimumDistance = 0;

        // Try to reduce spacing
        let remainingAmount = beltSpeed;
        for (let i = this.items.length - 1; i >= 0; --i) {
            const nextDistanceAndItem = this.items[i];
            const minimumSpacing = minimumDistance;

            const takeAway = Math.max(
                0,
                Math.min(remainingAmount, nextDistanceAndItem[_nextDistance] - minimumSpacing)
            );

            remainingAmount -= takeAway;
            nextDistanceAndItem[_nextDistance] -= takeAway;

            this.spacingToFirstItem += takeAway;
            if (remainingAmount < 0.01) {
                break;
            }

            minimumDistance = globalConfig.itemSpacingOnBelts;
        }

        // Check if we have an item which is ready to be emitted
        const lastItem = this.items[this.items.length - 1];
        if (lastItem && lastItem[_nextDistance] === 0 && this.acceptorTarget) {
            if (this.tryHandOverItem(lastItem[_item])) {
                this.items.pop();
            }
        }

        if (G_IS_DEV && globalConfig.debug.checkBeltPaths) {
            this.debug_checkIntegrity("post-update");
        }
    }

    /**
     * Tries to hand over the item to the end entity
     * @param {BaseItem} item
     */
    tryHandOverItem(item) {
        if (!this.acceptorTarget) {
            return;
        }

        const targetAcceptorComp = this.acceptorTarget.entity.components.ItemAcceptor;

        // Check if the acceptor has a filter for example
        if (targetAcceptorComp && !targetAcceptorComp.canAcceptItem(this.acceptorTarget.slot, item)) {
            // Well, this item is not accepted
            return false;
        }

        // Try to pass over
        if (
            this.root.systemMgr.systems.itemEjector.tryPassOverItem(
                item,
                this.acceptorTarget.entity,
                this.acceptorTarget.slot
            )
        ) {
            // Trigger animation on the acceptor comp
            const targetAcceptorComp = this.acceptorTarget.entity.components.ItemAcceptor;
            if (targetAcceptorComp) {
                targetAcceptorComp.onItemAccepted(
                    this.acceptorTarget.slot,
                    this.acceptorTarget.direction,
                    item
                );
            }

            return true;
        }

        return false;
    }

    /**
     * Computes a world space position from the given progress
     * @param {number} progress
     * @returns {Vector}
     */
    computePositionFromProgress(progress) {
        let currentLength = 0;

        // floating point issuses ..
        assert(progress <= this.totalLength + 0.02, "Progress too big: " + progress);

        for (let i = 0; i < this.entityPath.length; ++i) {
            const beltComp = this.entityPath[i].components.Belt;
            const localLength = beltComp.getEffectiveLengthTiles();

            if (currentLength + localLength >= progress || i === this.entityPath.length - 1) {
                // Min required here due to floating point issues
                const localProgress = Math.min(1.0, progress - currentLength);

                assert(localProgress >= 0.0, "Invalid local progress: " + localProgress);
                const localSpace = beltComp.transformBeltToLocalSpace(localProgress);
                return this.entityPath[i].components.StaticMapEntity.localTileToWorld(localSpace);
            }
            currentLength += localLength;
        }

        assert(false, "invalid progress: " + progress + " (max: " + this.totalLength + ")");
    }

    /**
     *
     * @param {DrawParameters} parameters
     */
    drawDebug(parameters) {
        if (!parameters.visibleRect.containsRect(this.worldBounds)) {
            return;
        }

        parameters.context.fillStyle = "#d79a25";
        parameters.context.strokeStyle = "#d79a25";
        parameters.context.beginPath();

        for (let i = 0; i < this.entityPath.length; ++i) {
            const entity = this.entityPath[i];
            const pos = entity.components.StaticMapEntity;
            const worldPos = pos.origin.toWorldSpaceCenterOfTile();

            if (i === 0) {
                parameters.context.moveTo(worldPos.x, worldPos.y);
            } else {
                parameters.context.lineTo(worldPos.x, worldPos.y);
            }
        }
        parameters.context.stroke();

        // Items
        let progress = this.spacingToFirstItem;
        for (let i = 0; i < this.items.length; ++i) {
            const nextDistanceAndItem = this.items[i];
            const worldPos = this.computePositionFromProgress(progress).toWorldSpaceCenterOfTile();
            parameters.context.fillStyle = "#268e4d";
            parameters.context.beginRoundedRect(worldPos.x - 5, worldPos.y - 5, 10, 10, 3);
            parameters.context.fill();
            parameters.context.font = "6px GameFont";
            parameters.context.fillStyle = "#111";
            parameters.context.fillText(
                "" + round4Digits(nextDistanceAndItem[_nextDistance]),
                worldPos.x + 5,
                worldPos.y + 2
            );
            progress += nextDistanceAndItem[_nextDistance];
        }

        for (let i = 0; i < this.entityPath.length; ++i) {
            const entity = this.entityPath[i];
            parameters.context.fillStyle = "#d79a25";
            const pos = entity.components.StaticMapEntity;
            const worldPos = pos.origin.toWorldSpaceCenterOfTile();
            parameters.context.beginCircle(worldPos.x, worldPos.y, i === 0 ? 5 : 3);
            parameters.context.fill();
        }

        for (let progress = 0; progress <= this.totalLength + 0.01; progress += 0.2) {
            const worldPos = this.computePositionFromProgress(progress).toWorldSpaceCenterOfTile();
            parameters.context.fillStyle = "red";
            parameters.context.beginCircle(worldPos.x, worldPos.y, 1);
            parameters.context.fill();
        }

        const firstItemIndicator = this.computePositionFromProgress(
            this.spacingToFirstItem
        ).toWorldSpaceCenterOfTile();
        parameters.context.fillStyle = "purple";
        parameters.context.fillRect(firstItemIndicator.x - 3, firstItemIndicator.y - 1, 6, 2);
    }

    /**
     * Draws the path
     * @param {DrawParameters} parameters
     */
    draw(parameters) {
        if (!parameters.visibleRect.containsRect(this.worldBounds)) {
            return;
        }

        if (this.items.length === 0) {
            // Early out
            return;
        }

        let currentItemPos = this.spacingToFirstItem;
        let currentItemIndex = 0;

        let trackPos = 0.0;

        // Iterate whole track and check items
        for (let i = 0; i < this.entityPath.length; ++i) {
            const entity = this.entityPath[i];
            const beltComp = entity.components.Belt;
            const beltLength = beltComp.getEffectiveLengthTiles();

            // Check if the current items are on the belt
            while (trackPos + beltLength >= currentItemPos - 1e-5) {
                // Its on the belt, render it now
                const staticComp = entity.components.StaticMapEntity;
                assert(
                    currentItemPos - trackPos >= 0,
                    "invalid track pos: " + currentItemPos + " vs " + trackPos + " (l  =" + beltLength + ")"
                );

                const localPos = beltComp.transformBeltToLocalSpace(currentItemPos - trackPos);
                const worldPos = staticComp.localTileToWorld(localPos).toWorldSpaceCenterOfTile();

                const distanceAndItem = this.items[currentItemIndex];

                distanceAndItem[_item].drawItemCenteredClipped(
                    worldPos.x,
                    worldPos.y,
                    parameters,
                    globalConfig.defaultItemDiameter
                );

                // Check for the next item
                currentItemPos += distanceAndItem[_nextDistance];
                ++currentItemIndex;

                if (currentItemIndex >= this.items.length) {
                    // We rendered all items
                    return;
                }
            }

            trackPos += beltLength;
        }
    }
}
