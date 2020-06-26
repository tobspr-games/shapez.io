import { globalConfig } from "../core/config";
import { DrawParameters } from "../core/draw_parameters";
import { Vector } from "../core/vector";
import { BaseItem } from "./base_item";
import { Entity } from "./entity";
import { GameRoot } from "./root";
import { round4Digits, epsilonCompare } from "../core/utils";
import { Math_min } from "../core/builtins";
import { createLogger, logSection } from "../core/logging";

const logger = createLogger("belt_path");

// Helpers for more semantic access into interleaved arrays
const NEXT_ITEM_OFFSET_INDEX = 0;
const ITEM_INDEX = 1;

/**
 * Stores a path of belts, used for optimizing performance
 */
export class BeltPath {
    /**
     * @param {GameRoot} root
     * @param {Array<Entity>} entityPath
     */
    constructor(root, entityPath) {
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

        // Find acceptor and ejector

        this.ejectorComp = this.entityPath[this.entityPath.length - 1].components.ItemEjector;
        this.ejectorSlot = this.ejectorComp.slots[0];
        this.initialBeltComponent = this.entityPath[0].components.Belt;

        this.totalLength = this.computeTotalLength();
        this.spacingToFirstItem = this.totalLength;

        // Connect the belts
        for (let i = 0; i < this.entityPath.length; ++i) {
            this.entityPath[i].components.Belt.assignedPath = this;
        }

        this.debug_checkIntegrity("constructor");
    }

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
        if (!G_IS_DEV) {
            return;
        }

        const fail = (...args) => this.debug_failIntegrity(currentChange, ...args);

        // Check for empty path
        if (this.entityPath.length === 0) {
            return fail("Belt path is empty");
        }

        // Check for mismatching length
        const totalLength = this.computeTotalLength();
        if (this.totalLength !== totalLength) {
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

        // Check for right ejector component and slot
        if (this.ejectorComp !== this.entityPath[this.entityPath.length - 1].components.ItemEjector) {
            return fail("Stale ejectorComp handle");
        }
        if (this.ejectorSlot !== this.ejectorComp.slots[0]) {
            return fail("Stale ejector slot handle");
        }
        if (!this.ejectorComp) {
            return fail("Ejector comp not set");
        }
        if (!this.ejectorSlot) {
            return fail("Ejector slot not set");
        }
        if (this.initialBeltComponent !== this.entityPath[0].components.Belt) {
            return fail("Stale initial belt component handle");
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
        if (this.items.length === 0 && !epsilonCompare(this.spacingToFirstItem, this.totalLength)) {
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

            if (item[NEXT_ITEM_OFFSET_INDEX] < 0 || item[NEXT_ITEM_OFFSET_INDEX] > this.totalLength) {
                return fail(
                    "Item has invalid offset to next item: ",
                    item[0],
                    "(total length:",
                    this.totalLength,
                    ")"
                );
            }

            currentPos += item[0];
        }

        // Check the total sum matches
        if (!epsilonCompare(currentPos, this.totalLength)) {
            return fail(
                "total sum (",
                currentPos,
                ") of first item spacing (",
                this.spacingToFirstItem,
                ") and items does not match total length (",
                this.totalLength,
                ")"
            );
        }
    }

    /**
     * Extends the belt path by the given belt
     * @param {Entity} entity
     */
    extendOnEnd(entity) {
        logger.log("Extending belt path by entity at", entity.components.StaticMapEntity.origin);

        const beltComp = entity.components.Belt;

        // If the last belt has something on its ejector, put that into the path first
        const pendingItem = this.ejectorComp.takeSlotItem(0);
        if (pendingItem) {
            // Ok, so we have a pending item
            logger.log("Taking pending item and putting it back on the path");
            this.items.push([0, pendingItem]);
        }

        // Append the entity
        this.entityPath.push(entity);

        // Extend the path length
        const additionalLength = beltComp.getEffectiveLengthTiles();
        this.totalLength += additionalLength;
        logger.log("  Extended total length by", additionalLength, "to", this.totalLength);

        // If we have no item, just update the distance to the first item
        if (this.items.length === 0) {
            this.spacingToFirstItem = this.totalLength;
            logger.log("  Extended spacing to first to", this.totalLength, "(= total length)");
        } else {
            // Otherwise, update the next-distance of the last item
            const lastItem = this.items[this.items.length - 1];
            logger.log(
                "  Extended spacing of last item from",
                lastItem[NEXT_ITEM_OFFSET_INDEX],
                "to",
                lastItem[NEXT_ITEM_OFFSET_INDEX] + additionalLength
            );
            lastItem[NEXT_ITEM_OFFSET_INDEX] += additionalLength;
        }

        // Update handles
        this.ejectorComp = entity.components.ItemEjector;
        this.ejectorSlot = this.ejectorComp.slots[0];

        // Assign reference
        beltComp.assignedPath = this;

        this.debug_checkIntegrity("extend-on-end");
    }

    /**
     * Extends the path with the given entity on the beginning
     * @param {Entity} entity
     */
    extendOnBeginning(entity) {
        const beltComp = entity.components.Belt;

        logger.log("Extending the path on the beginning");

        // All items on that belt are simply lost (for now)

        const length = beltComp.getEffectiveLengthTiles();

        // Extend the length of this path
        this.totalLength += length;

        // Simply adjust the first item spacing cuz we have no items contained
        this.spacingToFirstItem += length;

        // Set handles and append entity
        beltComp.assignedPath = this;
        this.initialBeltComponent = this.entityPath[0].components.Belt;
        this.entityPath.unshift(entity);

        this.debug_checkIntegrity("extend-on-begin");
    }

    /**
     * Splits this path at the given entity by removing it, and
     * returning the new secondary paht
     * @param {Entity} entity
     * @returns {BeltPath}
     */
    deleteEntityOnPathSplitIntoTwo(entity) {
        logger.log("Splitting path at entity", entity.components.StaticMapEntity.origin);

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
                logger.log("Found entity at", i, "of length", firstPathLength);
                break;
            }

            ++firstPathEntityCount;
            firstPathEndEntity = otherEntity;
            firstPathLength += otherEntity.components.Belt.getEffectiveLengthTiles();
        }

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

        logger.log("Splitting", this.items.length, "items");
        logger.log(
            "Old items are",
            this.items.map(i => i[NEXT_ITEM_OFFSET_INDEX])
        );

        // Create second path
        const secondPath = new BeltPath(this.root, secondEntities);

        // Remove all items which are no longer relevant and transfer them to the second path
        let itemPos = this.spacingToFirstItem;
        for (let i = 0; i < this.items.length; ++i) {
            const item = this.items[i];
            const distanceToNext = item[NEXT_ITEM_OFFSET_INDEX];

            logger.log("  Checking item at", itemPos, "with distance of", distanceToNext, "to next");

            // Check if this item is past the first path
            if (itemPos >= firstPathLength) {
                // Remove it from the first path
                this.items.splice(i, 1);
                i -= 1;
                logger.log("     Removed item from first path since its no longer contained @", itemPos);

                // Check if its on the second path (otherwise its on the removed belt and simply lost)
                if (itemPos >= secondPathStart) {
                    // Put item on second path
                    secondPath.items.push([distanceToNext, item[ITEM_INDEX]]);
                    logger.log(
                        "     Put item to second path @",
                        itemPos,
                        "with distance to next =",
                        distanceToNext
                    );

                    // If it was the first item, adjust the distance to the first item
                    if (secondPath.items.length === 1) {
                        logger.log("       Sinc it was the first, set sapcing of first to", itemPos);
                        secondPath.spacingToFirstItem = itemPos - secondPathStart;
                    }
                } else {
                    logger.log("    Item was on the removed belt, so its gone - forever!");
                }
            } else {
                // Seems this item is on the first path (so all good), so just make sure it doesn't
                // have a nextDistance which is bigger than the total path length
                const clampedDistanceToNext = Math_min(itemPos + distanceToNext, firstPathLength) - itemPos;
                if (clampedDistanceToNext < distanceToNext) {
                    logger.log(
                        "Correcting next distance (first path) from",
                        distanceToNext,
                        "to",
                        clampedDistanceToNext
                    );
                    item[NEXT_ITEM_OFFSET_INDEX] = clampedDistanceToNext;
                }
            }

            // Advance items
            itemPos += distanceToNext;
        }

        logger.log(
            "New items are",
            this.items.map(i => i[0])
        );

        logger.log(
            "And second path items are",
            secondPath.items.map(i => i[0])
        );

        // Adjust our total length
        this.totalLength = firstPathLength;

        // Make sure that if we are empty, we set our first distance properly
        if (this.items.length === 0) {
            this.spacingToFirstItem = this.totalLength;
        }

        // Set new ejector and acceptor handles
        this.ejectorComp = firstPathEndEntity.components.ItemEjector;
        this.ejectorSlot = this.ejectorComp.slots[0];

        this.debug_checkIntegrity("split-two-first");
        secondPath.debug_checkIntegrity("split-two-second");

        return secondPath;
    }

    /**
     * Extends the path by the given other path
     * @param {BeltPath} otherPath
     */
    extendByPath(otherPath) {
        const entities = otherPath.entityPath;
        logger.log("Extending path by other path, starting to add entities");
        const oldLength = this.totalLength;
        const oldLastItem = this.items[this.items.length - 1];

        for (let i = 0; i < entities.length; ++i) {
            this.extendOnEnd(entities[i]);
        }

        logger.log("  Transferring new items:", otherPath.items);

        // Check if we have no items and thus need to adjust the spacing
        if (this.items.length === 0) {
            // This one is easy - Since our first path is empty, we can just
            // set the spacing to the first one to the whole first part length
            // and add the spacing on the second path (Which might be the whole second part
            // length if its entirely empty, too)
            this.spacingToFirstItem = this.totalLength + otherPath.spacingToFirstItem;
            logger.log("  Extended spacing to first to", this.totalLength, "(= total length)");

            // Simply copy over all items
            for (let i = 0; i < otherPath.items.length; ++i) {
                const item = otherPath.items[0];
                this.items.push([item[0], item[1]]);
            }
        } else {
            console.error("TODO4");

            // Adjust the distance from our last item to the first item of the second path.
            // First, find the absolute position of the first item:
            let itemPosition = this.spacingToFirstItem;
            for (let i = 0; i < this.items.length; ++i) {
                itemPosition += this.items[i][0];
            }
        }

        this.debug_checkIntegrity("extend-by-path");
    }

    /**
     * Computes the total length of the path
     * @returns {number}
     */
    computeTotalLength() {
        let length = 0;
        for (let i = 0; i < this.entityPath.length; ++i) {
            length += this.entityPath[i].components.Belt.getEffectiveLengthTiles();
        }
        return length;
    }

    /**
     * Performs one tick
     */
    update() {
        this.debug_checkIntegrity("pre-update");
        const firstBeltItems = this.initialBeltComponent.sortedItems;
        const transferItemAndProgress = firstBeltItems[0];

        // Check if the first belt took a new item
        if (transferItemAndProgress) {
            const transferItem = transferItemAndProgress[1];

            if (this.spacingToFirstItem >= globalConfig.itemSpacingOnBelts) {
                // Can take new item
                firstBeltItems.splice(0, 1);

                this.items.unshift([this.spacingToFirstItem, transferItem]);
                this.spacingToFirstItem = 0;
            }
        }

        // Divide by item spacing on belts since we use throughput and not speed
        let beltSpeed =
            this.root.hubGoals.getBeltBaseSpeed() *
            this.root.dynamicTickrate.deltaSeconds *
            globalConfig.itemSpacingOnBelts;

        if (G_IS_DEV && globalConfig.debug.instantBelts) {
            beltSpeed *= 100;
        }

        let minimumDistance = this.ejectorSlot.item ? globalConfig.itemSpacingOnBelts : 0;

        // Try to reduce spacing
        let remainingAmount = beltSpeed;
        for (let i = this.items.length - 1; i >= 0; --i) {
            const nextDistanceAndItem = this.items[i];
            const minimumSpacing = minimumDistance;

            const takeAway = Math.max(0, Math.min(remainingAmount, nextDistanceAndItem[0] - minimumSpacing));

            remainingAmount -= takeAway;
            nextDistanceAndItem[0] -= takeAway;

            this.spacingToFirstItem += takeAway;
            if (remainingAmount === 0.0) {
                break;
            }

            minimumDistance = globalConfig.itemSpacingOnBelts;
        }

        const lastItem = this.items[this.items.length - 1];
        if (lastItem && lastItem[0] === 0.0) {
            // Take over
            if (this.ejectorComp.tryEject(0, lastItem[1])) {
                this.items.pop();
            }
        }

        this.debug_checkIntegrity("post-update");
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
                const localProgress = Math_min(1.0, progress - currentLength);

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
                "" + round4Digits(nextDistanceAndItem[0]),
                worldPos.x + 5,
                worldPos.y + 2
            );
            progress += nextDistanceAndItem[0];
            nextDistanceAndItem[1].draw(worldPos.x, worldPos.y, parameters, 10);
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
}
