import { GameRoot } from "./root";
import { Entity } from "./entity";
import { Vector, enumDirectionToVector, enumDirection } from "../core/vector";
import { MetaBuilding } from "./meta_building";
import { StaticMapEntityComponent } from "./components/static_map_entity";
import { Math_abs, performanceNow } from "../core/builtins";
import { createLogger } from "../core/logging";
import { MetaBeltBaseBuilding, arrayBeltVariantToRotation } from "./buildings/belt_base";
import { SOUNDS } from "../platform/sound";
import { round2Digits } from "../core/utils";
import { globalConfig } from "../core/config";

const logger = createLogger("ingame/logic");

/**
 * Typing helper
 * @typedef {Array<{
 *  entity: Entity,
 *  slot: import("./components/item_ejector").ItemEjectorSlot,
 *  fromTile: Vector,
 *  toDirection: enumDirection
 * }>} EjectorsAffectingTile
 */

/**
 * Typing helper
 * @typedef {Array<{
 *  entity: Entity,
 *  slot: import("./components/item_acceptor").ItemAcceptorSlot,
 *  toTile: Vector,
 *  fromDirection: enumDirection
 * }>} AcceptorsAffectingTile
 */

/**
 * @typedef {{
 *     acceptors: AcceptorsAffectingTile,
 *     ejectors: EjectorsAffectingTile
 * }} AcceptorsAndEjectorsAffectingTile
 */

export class GameLogic {
    /**
     *
     * @param {GameRoot} root
     */
    constructor(root) {
        this.root = root;
    }

    /**
     * @param {object} param0
     * @param {Vector} param0.origin
     * @param {number} param0.rotation
     * @param {number} param0.rotationVariant
     * @param {string} param0.variant
     * @param {MetaBuilding} param0.building
     * @returns {boolean}
     */
    isAreaFreeToBuild({ origin, rotation, rotationVariant, variant, building }) {
        const checker = new StaticMapEntityComponent({
            origin,
            tileSize: building.getDimensions(variant),
            rotation,
            blueprintSpriteKey: "",
        });

        const rect = checker.getTileSpaceBounds();

        for (let x = rect.x; x < rect.x + rect.w; ++x) {
            for (let y = rect.y; y < rect.y + rect.h; ++y) {
                const contents = this.root.map.getTileContentXY(x, y);
                if (contents) {
                    if (
                        !this.checkCanReplaceBuilding({
                            original: contents,
                            origin,
                            building,
                            rotation,
                            rotationVariant,
                        })
                    ) {
                        // Content already has same rotation
                        return false;
                    }
                }
            }
        }
        return true;
    }

    /**
     * Checks if the given building can be replaced by another
     * @param {object} param0
     * @param {Entity} param0.original
     * @param {Vector} param0.origin
     * @param {number} param0.rotation
     * @param {number} param0.rotationVariant
     * @param {MetaBuilding} param0.building
     * @returns {boolean}
     */
    checkCanReplaceBuilding({ original, origin, building, rotation, rotationVariant }) {
        if (!original.components.ReplaceableMapEntity) {
            // Can not get replaced at all
            return false;
        }

        const staticComp = original.components.StaticMapEntity;
        assert(staticComp, "Building is not static");
        const beltComp = original.components.Belt;
        if (beltComp && building instanceof MetaBeltBaseBuilding) {
            // Its a belt, check if it differs in either rotation or rotation variant
            if (staticComp.rotation !== rotation) {
                return true;
            }
            if (beltComp.direction !== arrayBeltVariantToRotation[rotationVariant]) {
                return true;
            }
        }

        return true;
    }

    /**
     * @param {object} param0
     * @param {Vector} param0.origin
     * @param {number} param0.rotation
     * @param {number} param0.rotationVariant
     * @param {string} param0.variant
     * @param {MetaBuilding} param0.building
     */
    checkCanPlaceBuilding({ origin, rotation, rotationVariant, variant, building }) {
        if (!building.getIsUnlocked(this.root)) {
            return false;
        }

        return this.isAreaFreeToBuild({
            origin,
            rotation,
            rotationVariant,
            variant,
            building,
        });
    }

    /**
     *
     * @param {object} param0
     * @param {Vector} param0.origin
     * @param {number} param0.rotation
     * @param {number} param0.originalRotation
     * @param {number} param0.rotationVariant
     * @param {string} param0.variant
     * @param {MetaBuilding} param0.building
     */
    tryPlaceBuilding({ origin, rotation, rotationVariant, originalRotation, variant, building }) {
        if (this.checkCanPlaceBuilding({ origin, rotation, rotationVariant, variant, building })) {
            // Remove any removeable entities below
            const checker = new StaticMapEntityComponent({
                origin,
                tileSize: building.getDimensions(variant),
                rotation,
                blueprintSpriteKey: "",
            });

            const rect = checker.getTileSpaceBounds();

            for (let x = rect.x; x < rect.x + rect.w; ++x) {
                for (let y = rect.y; y < rect.y + rect.h; ++y) {
                    const contents = this.root.map.getTileContentXY(x, y);
                    if (contents) {
                        if (!this.tryDeleteBuilding(contents)) {
                            logger.error("Building has replaceable component but is also unremovable");
                            return false;
                        }
                    }
                }
            }

            building.createAndPlaceEntity({
                root: this.root,
                origin,
                rotation,
                rotationVariant,
                originalRotation,
                variant,
            });

            this.root.soundProxy.playUi(building.getPlacementSound());

            return true;
        }
        return false;
    }

    /**
     * Performs a bulk operation, not updating caches in the meantime
     * @param {function} operation
     */
    performBulkOperation(operation) {
        logger.log("Running bulk operation ...");
        assert(!this.root.bulkOperationRunning, "Can not run two bulk operations twice");
        this.root.bulkOperationRunning = true && !globalConfig.debug.disableBulkOperations;
        const now = performanceNow();
        const returnValue = operation();
        const duration = performanceNow() - now;
        logger.log("Done in", round2Digits(duration), "ms");
        assert(
            this.root.bulkOperationRunning || globalConfig.debug.disableBulkOperations,
            "Bulk operation = false while bulk operation was running"
        );
        this.root.bulkOperationRunning = false;
        this.root.signals.bulkOperationFinished.dispatch();
        return returnValue;
    }

    /**
     * Returns whether the given building can get removed
     * @param {Entity} building
     */
    canDeleteBuilding(building) {
        return building.components.StaticMapEntity && !building.components.Unremovable;
    }

    /**
     * Tries to delete the given building
     * @param {Entity} building
     */
    tryDeleteBuilding(building) {
        if (!this.canDeleteBuilding(building)) {
            return false;
        }
        this.root.map.removeStaticEntity(building);
        this.root.entityMgr.destroyEntity(building);
        return true;
    }

    /**
     * Returns the acceptors and ejectors which affect the current tile
     * @param {Vector} tile
     * @returns {AcceptorsAndEjectorsAffectingTile}
     */
    getEjectorsAndAcceptorsAtTile(tile) {
        /** @type {EjectorsAffectingTile} */
        let ejectors = [];
        /** @type {AcceptorsAffectingTile} */
        let acceptors = [];

        for (let dx = -1; dx <= 1; ++dx) {
            for (let dy = -1; dy <= 1; ++dy) {
                if (Math_abs(dx) + Math_abs(dy) !== 1) {
                    continue;
                }

                const entity = this.root.map.getTileContentXY(tile.x + dx, tile.y + dy);
                if (entity) {
                    const staticComp = entity.components.StaticMapEntity;
                    const itemEjector = entity.components.ItemEjector;
                    if (itemEjector) {
                        for (let ejectorSlot = 0; ejectorSlot < itemEjector.slots.length; ++ejectorSlot) {
                            const slot = itemEjector.slots[ejectorSlot];
                            const wsTile = staticComp.localTileToWorld(slot.pos);
                            const wsDirection = staticComp.localDirectionToWorld(slot.direction);
                            const targetTile = wsTile.add(enumDirectionToVector[wsDirection]);
                            if (targetTile.equals(tile)) {
                                ejectors.push({
                                    entity,
                                    slot,
                                    fromTile: wsTile,
                                    toDirection: wsDirection,
                                });
                            }
                        }
                    }

                    const itemAcceptor = entity.components.ItemAcceptor;
                    if (itemAcceptor) {
                        for (let acceptorSlot = 0; acceptorSlot < itemAcceptor.slots.length; ++acceptorSlot) {
                            const slot = itemAcceptor.slots[acceptorSlot];
                            const wsTile = staticComp.localTileToWorld(slot.pos);
                            for (let k = 0; k < slot.directions.length; ++k) {
                                const direction = slot.directions[k];
                                const wsDirection = staticComp.localDirectionToWorld(direction);

                                const sourceTile = wsTile.add(enumDirectionToVector[wsDirection]);
                                if (sourceTile.equals(tile)) {
                                    acceptors.push({
                                        entity,
                                        slot,
                                        toTile: wsTile,
                                        fromDirection: wsDirection,
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
        return { ejectors, acceptors };
    }
}
