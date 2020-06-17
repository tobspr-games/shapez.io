import { Math_abs, Math_degrees, Math_round } from "../../../core/builtins";
import { globalConfig } from "../../../core/config";
import { Signal, STOP_PROPAGATION } from "../../../core/signal";
import { TrackedState } from "../../../core/tracked_state";
import { Vector } from "../../../core/vector";
import { enumMouseButton } from "../../camera";
import { StaticMapEntityComponent } from "../../components/static_map_entity";
import { Entity } from "../../entity";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { defaultBuildingVariant, MetaBuilding } from "../../meta_building";
import { BaseHUDPart } from "../base_hud_part";
import { lerp } from "../../../core/utils";

/**
 * Contains all logic for the building placer - this doesn't include the rendering
 * of info boxes or drawing.
 */
export class HUDBuildingPlacerLogic extends BaseHUDPart {
    /**
     * Initializes the logic
     * @see BaseHUDPart.initialize
     */
    initialize() {
        /**
         * We use a fake entity to get information about how a building will look
         * once placed
         * @type {Entity}
         */
        this.fakeEntity = null;

        // Signals
        this.signals = {
            variantChanged: new Signal(),
            draggingStarted: new Signal(),
        };

        /**
         * The current building
         * @type {TypedTrackedState<MetaBuilding?>}
         */
        this.currentMetaBuilding = new TrackedState(this.onSelectedMetaBuildingChanged, this);

        /**
         * The current rotation
         * @type {number}
         */
        this.currentBaseRotation = 0;

        /**
         * Whether we are currently dragging
         * @type {boolean}
         */
        this.currentlyDragging = false;

        /**
         * Current building variant
         * @type {TypedTrackedState<string>}
         */
        this.currentVariant = new TrackedState(() => this.signals.variantChanged.dispatch());

        /**
         * Whether we are currently drag-deleting
         * @type {boolean}
         */
        this.currentlyDeleting = false;

        /**
         * Stores which variants for each building we prefer, this is based on what
         * the user last selected
         * @type {Object.<string, string>}
         */
        this.preferredVariants = {};

        /**
         * The tile we last dragged from
         * @type {Vector}
         */
        this.lastDragTile = null;

        /**
         * The side for direction lock
         * @type {number} (0|1)
         */
        this.currentDirectionLockSide = 0;

        this.initializeBindings();
    }

    /**
     * Initializes all bindings
     */
    initializeBindings() {
        // KEYBINDINGS
        const keyActionMapper = this.root.keyMapper;
        keyActionMapper.getBinding(KEYMAPPINGS.placement.rotateWhilePlacing).add(this.tryRotate, this);
        keyActionMapper.getBinding(KEYMAPPINGS.placement.cycleBuildingVariants).add(this.cycleVariants, this);
        keyActionMapper
            .getBinding(KEYMAPPINGS.placement.switchDirectionLockSide)
            .add(this.switchDirectionLockSide, this);
        keyActionMapper
            .getBinding(KEYMAPPINGS.placement.abortBuildingPlacement)
            .add(this.abortPlacement, this);
        keyActionMapper.getBinding(KEYMAPPINGS.general.back).add(this.abortPlacement, this);
        this.root.gameState.inputReciever.keyup.add(this.checkForDirectionLockSwitch, this);

        // BINDINGS TO GAME EVENTS
        this.root.hud.signals.buildingsSelectedForCopy.add(this.abortPlacement, this);
        this.root.hud.signals.pasteBlueprintRequested.add(this.abortPlacement, this);
        this.root.signals.storyGoalCompleted.add(() => this.signals.variantChanged.dispatch());
        this.root.signals.upgradePurchased.add(() => this.signals.variantChanged.dispatch());

        // MOUSE BINDINGS
        this.root.camera.downPreHandler.add(this.onMouseDown, this);
        this.root.camera.movePreHandler.add(this.onMouseMove, this);
        this.root.camera.upPostHandler.add(this.onMouseUp, this);
    }

    /**
     * Returns if the direction lock is currently active
     * @returns {boolean}
     */
    get isDirectionLockActive() {
        const metaBuilding = this.currentMetaBuilding.get();
        return (
            metaBuilding &&
            metaBuilding.getHasDirectionLockAvailable() &&
            this.root.keyMapper.getBinding(KEYMAPPINGS.placementModifiers.lockBeltDirection).pressed
        );
    }

    /**
     * Returns the current direction lock corner, that is, the corner between
     * mouse and original start point
     * @returns {Vector|null}
     */
    get currentDirectionLockCorner() {
        const mousePosition = this.root.app.mousePosition;
        if (!mousePosition) {
            // Not on screen
            return null;
        }

        if (!this.lastDragTile) {
            // Haven't dragged yet
            return null;
        }

        // Figure which points the line visits
        const worldPos = this.root.camera.screenToWorld(mousePosition);
        const mouseTile = worldPos.toTileSpace();

        if (this.currentDirectionLockSide === 0) {
            return new Vector(this.lastDragTile.x, mouseTile.y);
        } else {
            return new Vector(mouseTile.x, this.lastDragTile.y);
        }
    }

    /**
     * Aborts the placement
     */
    abortPlacement() {
        if (this.currentMetaBuilding.get()) {
            this.currentMetaBuilding.set(null);
            return STOP_PROPAGATION;
        }
    }

    /**
     * Aborts any dragging
     */
    abortDragging() {
        this.currentlyDragging = true;
        this.currentlyDeleting = false;
        this.initialPlacementVector = null;
        this.lastDragTile = null;
    }

    /**
     * @see BaseHUDPart.update
     */
    update() {
        // Always update since the camera might have moved
        const mousePos = this.root.app.mousePosition;
        if (mousePos) {
            this.onMouseMove(mousePos);
        }
    }

    /**
     * Tries to rotate the current building
     */
    tryRotate() {
        const selectedBuilding = this.currentMetaBuilding.get();
        if (selectedBuilding) {
            if (this.root.keyMapper.getBinding(KEYMAPPINGS.placement.rotateInverseModifier).pressed) {
                this.currentBaseRotation = (this.currentBaseRotation + 270) % 360;
            } else {
                this.currentBaseRotation = (this.currentBaseRotation + 90) % 360;
            }
            const staticComp = this.fakeEntity.components.StaticMapEntity;
            staticComp.rotation = this.currentBaseRotation;
        }
    }
    /**
     * Tries to delete the building under the mouse
     */
    deleteBelowCursor() {
        const mousePosition = this.root.app.mousePosition;
        if (!mousePosition) {
            // Not on screen
            return;
        }

        const worldPos = this.root.camera.screenToWorld(mousePosition);
        const tile = worldPos.toTileSpace();
        const contents = this.root.map.getTileContent(tile);
        if (contents) {
            this.root.logic.tryDeleteBuilding(contents);
        }
    }

    switchDirectionLockSide() {
        this.currentDirectionLockSide = 1 - this.currentDirectionLockSide;
    }

    /**
     * Checks if the direction lock key got released and if such, resets the placement
     * @param {any} args
     */
    checkForDirectionLockSwitch({ keyCode }) {
        if (
            keyCode ===
            this.root.keyMapper.getBinding(KEYMAPPINGS.placementModifiers.lockBeltDirection).keyCode
        ) {
            this.abortDragging();
        }
    }

    /**
     * Canvas click handler
     * @param {Vector} mousePos
     * @param {boolean} cancelAction
     */
    onCanvasClick(mousePos, cancelAction = false) {
        if (cancelAction) {
            if (this.currentMetaBuilding.get()) {
                this.currentMetaBuilding.set(null);
            } else {
                this.deleteBelowCursor();
            }
            return STOP_PROPAGATION;
        }

        if (!this.currentMetaBuilding.get()) {
            return;
        }

        return STOP_PROPAGATION;
    }

    /**
     * Tries to place the current building at the given tile
     * @param {Vector} tile
     */
    tryPlaceCurrentBuildingAt(tile) {
        if (this.root.camera.zoomLevel < globalConfig.mapChunkOverviewMinZoom) {
            // Dont allow placing in overview mode
            return;
        }

        const metaBuilding = this.currentMetaBuilding.get();
        const { rotation, rotationVariant } = metaBuilding.computeOptimalDirectionAndRotationVariantAtTile(
            this.root,
            tile,
            this.currentBaseRotation,
            this.currentVariant.get()
        );

        const entity = this.root.logic.tryPlaceBuilding({
            origin: tile,
            rotation,
            rotationVariant,
            originalRotation: this.currentBaseRotation,
            building: this.currentMetaBuilding.get(),
            variant: this.currentVariant.get(),
        });

        if (entity) {
            // Succesfully placed, find which entity we actually placed
            this.root.signals.entityManuallyPlaced.dispatch(entity);

            // Check if we should flip the orientation (used for tunnels)
            if (
                metaBuilding.getFlipOrientationAfterPlacement() &&
                !this.root.keyMapper.getBinding(
                    KEYMAPPINGS.placementModifiers.placementDisableAutoOrientation
                ).pressed
            ) {
                this.currentBaseRotation = (180 + this.currentBaseRotation) % 360;
            }

            // Check if we should stop placement
            if (
                !metaBuilding.getStayInPlacementMode() &&
                !this.root.keyMapper.getBinding(KEYMAPPINGS.placementModifiers.placeMultiple).pressed &&
                !this.root.app.settings.getAllSettings().alwaysMultiplace
            ) {
                // Stop placement
                this.currentMetaBuilding.set(null);
            }
            return true;
        } else {
            return false;
        }
    }

    /**
     * Cycles through the variants
     */
    cycleVariants() {
        const metaBuilding = this.currentMetaBuilding.get();
        if (!metaBuilding) {
            this.currentVariant.set(defaultBuildingVariant);
        } else {
            const availableVariants = metaBuilding.getAvailableVariants(this.root);
            const index = availableVariants.indexOf(this.currentVariant.get());
            assert(
                index >= 0,
                "Current variant was invalid: " + this.currentVariant.get() + " out of " + availableVariants
            );
            const newIndex = (index + 1) % availableVariants.length;
            const newVariant = availableVariants[newIndex];
            this.currentVariant.set(newVariant);

            this.preferredVariants[metaBuilding.getId()] = newVariant;
        }
    }

    /**
     * Performs the direction locked placement between two points after
     * releasing the mouse
     */
    executeDirectionLockedPlacement() {
        const path = this.computeDirectionLockPath();
        this.root.logic.performBulkOperation(() => {
            for (let i = 0; i < path.length; ++i) {
                const { rotation, tile } = path[i];

                this.currentBaseRotation = rotation;
                this.tryPlaceCurrentBuildingAt(tile);
            }
        });
    }

    /**
     * Finds the path which the current direction lock will use
     * @returns {Array<{ tile: Vector, rotation: number }>}
     */
    computeDirectionLockPath() {
        const mousePosition = this.root.app.mousePosition;
        if (!mousePosition) {
            // Not on screen
            return [];
        }

        let result = [];

        // Figure which points the line visits
        const worldPos = this.root.camera.screenToWorld(mousePosition);
        const mouseTile = worldPos.toTileSpace();
        const startTile = this.lastDragTile;

        // Place from start to corner
        const pathToCorner = this.currentDirectionLockCorner.sub(startTile);
        const deltaToCorner = pathToCorner.normalize().round();
        const lengthToCorner = Math_round(pathToCorner.length());
        let currentPos = startTile.copy();

        let rotation = (Math.round(Math_degrees(deltaToCorner.angle()) / 90) * 90 + 360) % 360;

        if (lengthToCorner > 0) {
            for (let i = 0; i < lengthToCorner; ++i) {
                result.push({
                    tile: currentPos.copy(),
                    rotation,
                });
                currentPos.addInplace(deltaToCorner);
            }
        }

        // Place from corner to end
        const pathFromCorner = mouseTile.sub(this.currentDirectionLockCorner);
        const deltaFromCorner = pathFromCorner.normalize().round();
        const lengthFromCorner = Math_round(pathFromCorner.length());

        if (lengthFromCorner > 0) {
            rotation = (Math.round(Math_degrees(deltaFromCorner.angle()) / 90) * 90 + 360) % 360;
            for (let i = 0; i < lengthFromCorner + 1; ++i) {
                result.push({
                    tile: currentPos.copy(),
                    rotation,
                });
                currentPos.addInplace(deltaFromCorner);
            }
        } else {
            // Finish last one
            result.push({
                tile: currentPos.copy(),
                rotation,
            });
        }
        return result;
    }

    /**
     * Selects a given building
     * @param {MetaBuilding} metaBuilding
     */
    startSelection(metaBuilding) {
        this.currentMetaBuilding.set(metaBuilding);
    }

    /**
     * Called when the selected buildings changed
     * @param {MetaBuilding} metaBuilding
     */
    onSelectedMetaBuildingChanged(metaBuilding) {
        this.abortDragging();
        this.root.hud.signals.selectedPlacementBuildingChanged.dispatch(metaBuilding);
        if (metaBuilding) {
            const variant = this.preferredVariants[metaBuilding.getId()] || defaultBuildingVariant;
            this.currentVariant.set(variant);

            this.fakeEntity = new Entity(null);
            metaBuilding.setupEntityComponents(this.fakeEntity, null);

            this.fakeEntity.addComponent(
                new StaticMapEntityComponent({
                    origin: new Vector(0, 0),
                    rotation: 0,
                    tileSize: metaBuilding.getDimensions(this.currentVariant.get()).copy(),
                    blueprintSpriteKey: "",
                })
            );
            metaBuilding.updateVariants(this.fakeEntity, 0, this.currentVariant.get());
        } else {
            this.fakeEntity = null;
        }

        // Since it depends on both, rerender twice
        this.signals.variantChanged.dispatch();
    }

    /**
     * mouse down pre handler
     * @param {Vector} pos
     * @param {enumMouseButton} button
     */
    onMouseDown(pos, button) {
        if (this.root.camera.getIsMapOverlayActive()) {
            // We do not allow dragging if the overlay is active
            return;
        }

        const metaBuilding = this.currentMetaBuilding.get();

        // Placement
        if (button === enumMouseButton.left && metaBuilding) {
            this.currentlyDragging = true;
            this.currentlyDeleting = false;
            this.lastDragTile = this.root.camera.screenToWorld(pos).toTileSpace();

            // Place initial building, but only if direction lock is not active
            if (!this.isDirectionLockActive) {
                this.tryPlaceCurrentBuildingAt(this.lastDragTile);
            }
            return STOP_PROPAGATION;
        }

        // Deletion
        if (button === enumMouseButton.right && !this.currentMetaBuilding.get()) {
            this.currentlyDragging = true;
            this.currentlyDeleting = true;
            this.lastDragTile = this.root.camera.screenToWorld(pos).toTileSpace();
            this.currentMetaBuilding.set(null);
            return STOP_PROPAGATION;
        }
    }

    /**
     * mouse move pre handler
     * @param {Vector} pos
     */
    onMouseMove(pos) {
        if (this.root.camera.getIsMapOverlayActive()) {
            return;
        }

        // Check for direction lock
        if (this.isDirectionLockActive) {
            return;
        }

        const metaBuilding = this.currentMetaBuilding.get();
        if ((metaBuilding || this.currentlyDeleting) && this.lastDragTile) {
            const oldPos = this.lastDragTile;
            let newPos = this.root.camera.screenToWorld(pos).toTileSpace();

            // Check if camera is moving, since then we do nothing
            if (this.root.camera.desiredCenter) {
                this.lastDragTile = newPos;
                return;
            }

            // Check if anything changed
            if (!oldPos.equals(newPos)) {
                // Automatic Direction
                if (
                    metaBuilding &&
                    metaBuilding.getRotateAutomaticallyWhilePlacing(this.currentVariant.get()) &&
                    !this.root.keyMapper.getBinding(
                        KEYMAPPINGS.placementModifiers.placementDisableAutoOrientation
                    ).pressed
                ) {
                    const delta = newPos.sub(oldPos);
                    const angleDeg = Math_degrees(delta.angle());
                    this.currentBaseRotation = (Math.round(angleDeg / 90) * 90 + 360) % 360;

                    // Holding alt inverts the placement
                    if (this.root.keyMapper.getBinding(KEYMAPPINGS.placementModifiers.placeInverse).pressed) {
                        this.currentBaseRotation = (180 + this.currentBaseRotation) % 360;
                    }
                }

                // bresenham
                let x0 = oldPos.x;
                let y0 = oldPos.y;
                let x1 = newPos.x;
                let y1 = newPos.y;

                var dx = Math_abs(x1 - x0);
                var dy = Math_abs(y1 - y0);
                var sx = x0 < x1 ? 1 : -1;
                var sy = y0 < y1 ? 1 : -1;
                var err = dx - dy;

                while (this.currentlyDeleting || this.currentMetaBuilding.get()) {
                    if (this.currentlyDeleting) {
                        const contents = this.root.map.getTileContentXY(x0, y0);
                        if (contents && !contents.queuedForDestroy && !contents.destroyed) {
                            this.root.logic.tryDeleteBuilding(contents);
                        }
                    } else {
                        this.tryPlaceCurrentBuildingAt(new Vector(x0, y0));
                    }
                    if (x0 === x1 && y0 === y1) break;
                    var e2 = 2 * err;
                    if (e2 > -dy) {
                        err -= dy;
                        x0 += sx;
                    }
                    if (e2 < dx) {
                        err += dx;
                        y0 += sy;
                    }
                }
            }

            this.lastDragTile = newPos;
            return STOP_PROPAGATION;
        }
    }

    /**
     * Mouse up handler
     */
    onMouseUp() {
        if (this.root.camera.getIsMapOverlayActive()) {
            return;
        }

        // Check for direction lock
        if (this.lastDragTile && this.currentlyDragging && this.isDirectionLockActive) {
            this.executeDirectionLockedPlacement();
        }

        this.abortDragging();
    }
}
