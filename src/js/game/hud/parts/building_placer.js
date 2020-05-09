import { BaseHUDPart } from "../base_hud_part";
import { MetaBuilding } from "../../meta_building";
import { DrawParameters } from "../../../core/draw_parameters";
import { globalConfig } from "../../../core/config";
import { StaticMapEntityComponent } from "../../components/static_map_entity";
import { STOP_PROPAGATION, Signal } from "../../../core/signal";
import {
    Vector,
    enumDirectionToAngle,
    enumInvertedDirections,
    enumDirectionToVector,
} from "../../../core/vector";
import { pulseAnimation, makeDiv } from "../../../core/utils";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { TrackedState } from "../../../core/tracked_state";
import { Math_abs, Math_radians } from "../../../core/builtins";
import { Loader } from "../../../core/loader";
import { drawRotatedSprite } from "../../../core/draw_utils";
import { Entity } from "../../entity";

export class HUDBuildingPlacer extends BaseHUDPart {
    initialize() {
        /** @type {TypedTrackedState<MetaBuilding?>} */
        this.currentMetaBuilding = new TrackedState(this.onSelectedMetaBuildingChanged, this);
        this.currentBaseRotation = 0;

        /** @type {Entity} */
        this.fakeEntity = null;

        const keyActionMapper = this.root.gameState.keyActionMapper;
        keyActionMapper.getBinding("building_abort_placement").add(() => this.currentMetaBuilding.set(null));
        keyActionMapper.getBinding("back").add(() => this.currentMetaBuilding.set(null));

        keyActionMapper.getBinding("rotate_while_placing").add(this.tryRotate, this);

        this.domAttach = new DynamicDomAttach(this.root, this.element, {});

        this.root.camera.downPreHandler.add(this.onMouseDown, this);
        this.root.camera.movePreHandler.add(this.onMouseMove, this);
        this.root.camera.upPostHandler.add(this.abortDragging, this);

        this.currentlyDragging = false;

        /**
         * The tile we last dragged onto
         * @type {Vector}
         *  */
        this.lastDragTile = null;

        /**
         * The tile we initially dragged from
         * @type {Vector}
         */
        this.initialDragTile = null;
    }

    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_building_placer", [], ``);

        this.buildingLabel = makeDiv(this.element, null, ["buildingLabel"], "Extract");
        this.buildingDescription = makeDiv(this.element, null, ["description"], "");
    }

    /**
     * mouse down pre handler
     * @param {Vector} pos
     */
    onMouseDown(pos) {
        if (this.root.camera.getIsMapOverlayActive()) {
            return;
        }

        if (this.currentMetaBuilding.get()) {
            this.currentlyDragging = true;
            this.lastDragTile = this.root.camera.screenToWorld(pos).toTileSpace();

            // Place initial building
            this.tryPlaceCurrentBuildingAt(this.lastDragTile);

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

        if (this.currentMetaBuilding.get() && this.lastDragTile) {
            const oldPos = this.lastDragTile;
            const newPos = this.root.camera.screenToWorld(pos).toTileSpace();

            if (!oldPos.equals(newPos)) {
                const delta = newPos.sub(oldPos);
                // - Using bresenhams algorithmus

                let x0 = oldPos.x;
                let y0 = oldPos.y;
                let x1 = newPos.x;
                let y1 = newPos.y;

                var dx = Math_abs(x1 - x0);
                var dy = Math_abs(y1 - y0);
                var sx = x0 < x1 ? 1 : -1;
                var sy = y0 < y1 ? 1 : -1;
                var err = dx - dy;

                while (true) {
                    this.tryPlaceCurrentBuildingAt(new Vector(x0, y0));
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

    update() {
        // ALways update since the camera might have moved
        const mousePos = this.root.app.mousePosition;
        if (mousePos) {
            this.onMouseMove(mousePos);
        }
    }

    /**
     * aborts any dragging op
     */
    abortDragging() {
        this.currentlyDragging = true;
        this.lastDragTile = null;
    }

    /**
     *
     * @param {MetaBuilding} metaBuilding
     */
    startSelection(metaBuilding) {
        this.currentMetaBuilding.set(metaBuilding);
    }

    /**
     *
     * @param {MetaBuilding} metaBuilding
     */
    onSelectedMetaBuildingChanged(metaBuilding) {
        this.root.hud.signals.selectedPlacementBuildingChanged.dispatch(metaBuilding);
        if (metaBuilding) {
            this.buildingLabel.innerHTML = metaBuilding.getName();
            this.buildingDescription.innerHTML = metaBuilding.getDescription();

            this.fakeEntity = new Entity(null);
            metaBuilding.setupEntityComponents(this.fakeEntity, null);
            this.fakeEntity.addComponent(
                new StaticMapEntityComponent({
                    origin: new Vector(0, 0),
                    rotationDegrees: 0,
                    tileSize: metaBuilding.getDimensions().copy(),
                })
            );
        } else {
            this.currentlyDragging = false;
            this.fakeEntity = null;
        }
    }

    /**
     * Tries to rotate
     */
    tryRotate() {
        const selectedBuilding = this.currentMetaBuilding.get();
        if (selectedBuilding) {
            this.currentBaseRotation = (this.currentBaseRotation + 90) % 360;
            const staticComp = this.fakeEntity.components.StaticMapEntity;
            staticComp.rotationDegrees = this.currentBaseRotation;
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
        // Transform to world space

        const metaBuilding = this.currentMetaBuilding.get();

        const { rotation, rotationVariant } = metaBuilding.computeOptimalDirectionAndRotationVariantAtTile(
            this.root,
            tile,
            this.currentBaseRotation
        );

        if (
            this.root.logic.tryPlaceBuilding({
                origin: tile,
                rotation,
                rotationVariant,
                building: this.currentMetaBuilding.get(),
            })
        ) {
            // Succesfully placed

            if (metaBuilding.getFlipOrientationAfterPlacement()) {
                this.currentBaseRotation = (180 + this.currentBaseRotation) % 360;
            }

            if (!metaBuilding.getStayInPlacementMode() && !this.root.app.inputMgr.shiftIsDown) {
                // Stop placement
                this.currentMetaBuilding.set(null);
            }

            return true;
        } else {
            return false;
        }
    }

    /**
     *
     * @param {DrawParameters} parameters
     */
    draw(parameters) {
        if (this.root.camera.zoomLevel < globalConfig.mapChunkOverviewMinZoom) {
            // Dont allow placing in overview mode
            this.domAttach.update(false);
            return;
        }

        this.domAttach.update(this.currentMetaBuilding.get());
        const metaBuilding = this.currentMetaBuilding.get();

        if (!metaBuilding) {
            return;
        }

        const mousePosition = this.root.app.mousePosition;
        if (!mousePosition) {
            // Not on screen
            return;
        }

        const worldPos = this.root.camera.screenToWorld(mousePosition);
        const tile = worldPos.toTileSpace();

        // Compute best rotation variant
        const {
            rotation,
            rotationVariant,
            connectedEntities,
        } = metaBuilding.computeOptimalDirectionAndRotationVariantAtTile(
            this.root,
            tile,
            this.currentBaseRotation
        );

        // Check if there are connected entities
        if (connectedEntities) {
            for (let i = 0; i < connectedEntities.length; ++i) {
                const connectedEntity = connectedEntities[i];
                const connectedWsPoint = connectedEntity.components.StaticMapEntity.getTileSpaceBounds()
                    .getCenter()
                    .toWorldSpace();

                const startWsPoint = tile.toWorldSpaceCenterOfTile();

                const startOffset = connectedWsPoint
                    .sub(startWsPoint)
                    .normalize()
                    .multiplyScalar(globalConfig.tileSize * 0.3);
                const effectiveStartPoint = startWsPoint.add(startOffset);
                const effectiveEndPoint = connectedWsPoint.sub(startOffset);

                parameters.context.globalAlpha = 0.6;

                // parameters.context.lineCap = "round";
                parameters.context.strokeStyle = "#7f7";
                parameters.context.lineWidth = 10;
                parameters.context.beginPath();
                parameters.context.moveTo(effectiveStartPoint.x, effectiveStartPoint.y);
                parameters.context.lineTo(effectiveEndPoint.x, effectiveEndPoint.y);
                parameters.context.stroke();
                parameters.context.globalAlpha = 1;
                // parameters.context.lineCap = "square";
            }
        }

        // Synchronize rotation and origin
        const staticComp = this.fakeEntity.components.StaticMapEntity;
        staticComp.origin = tile;
        staticComp.rotationDegrees = rotation;
        metaBuilding.updateRotationVariant(this.fakeEntity, rotationVariant);

        // Check if we could place the buildnig
        const canBuild = this.root.logic.checkCanPlaceBuilding(tile, rotation, metaBuilding);

        // Determine the bounds and visualize them
        const entityBounds = staticComp.getTileSpaceBounds();
        const drawBorder = 2;
        parameters.context.globalAlpha = 0.5;
        if (canBuild) {
            parameters.context.fillStyle = "rgba(0, 255, 0, 0.2)";
        } else {
            parameters.context.fillStyle = "rgba(255, 0, 0, 0.2)";
        }
        parameters.context.fillRect(
            entityBounds.x * globalConfig.tileSize - drawBorder,
            entityBounds.y * globalConfig.tileSize - drawBorder,
            entityBounds.w * globalConfig.tileSize + 2 * drawBorder,
            entityBounds.h * globalConfig.tileSize + 2 * drawBorder
        );

        // Draw ejectors
        if (canBuild) {
            this.drawMatchingAcceptorsAndEjectors(parameters);
        }

        // HACK to draw the entity sprite
        const previewSprite = metaBuilding.getPreviewSprite(rotationVariant);
        parameters.context.globalAlpha = 0.8 + pulseAnimation(this.root.time.realtimeNow(), 1) * 0.1;
        staticComp.origin = worldPos.divideScalar(globalConfig.tileSize).subScalars(0.5, 0.5);
        staticComp.drawSpriteOnFullEntityBounds(parameters, previewSprite);
        staticComp.origin = tile;
        parameters.context.globalAlpha = 1;
    }

    /**
     *
     * @param {DrawParameters} parameters
     */
    drawMatchingAcceptorsAndEjectors(parameters) {
        const acceptorComp = this.fakeEntity.components.ItemAcceptor;
        const ejectorComp = this.fakeEntity.components.ItemEjector;
        const staticComp = this.fakeEntity.components.StaticMapEntity;

        const goodArrowSprite = Loader.getSprite("sprites/misc/slot_good_arrow.png");
        const badArrowSprite = Loader.getSprite("sprites/misc/slot_bad_arrow.png");

        // Just ignore this code ...

        if (acceptorComp) {
            const slots = acceptorComp.slots;
            for (let acceptorSlotIndex = 0; acceptorSlotIndex < slots.length; ++acceptorSlotIndex) {
                const slot = slots[acceptorSlotIndex];
                const acceptorSlotWsTile = staticComp.localTileToWorld(slot.pos);
                const acceptorSlotWsPos = acceptorSlotWsTile.toWorldSpaceCenterOfTile();

                for (
                    let acceptorDirectionIndex = 0;
                    acceptorDirectionIndex < slot.directions.length;
                    ++acceptorDirectionIndex
                ) {
                    const direction = slot.directions[acceptorDirectionIndex];
                    const worldDirection = staticComp.localDirectionToWorld(direction);

                    const sourceTile = acceptorSlotWsTile.add(enumDirectionToVector[worldDirection]);
                    const sourceEntity = this.root.map.getTileContent(sourceTile);

                    let sprite = goodArrowSprite;
                    let alpha = 0.5;

                    if (sourceEntity) {
                        sprite = badArrowSprite;
                        const sourceEjector = sourceEntity.components.ItemEjector;
                        const sourceStaticComp = sourceEntity.components.StaticMapEntity;
                        const ejectorAcceptLocalTile = sourceStaticComp.worldToLocalTile(acceptorSlotWsTile);
                        if (sourceEjector && sourceEjector.anySlotEjectsToLocalTile(ejectorAcceptLocalTile)) {
                            sprite = goodArrowSprite;
                        }
                        alpha = 1.0;
                    }

                    parameters.context.globalAlpha = alpha;
                    drawRotatedSprite({
                        parameters,
                        sprite,
                        x: acceptorSlotWsPos.x,
                        y: acceptorSlotWsPos.y,
                        angle: Math_radians(enumDirectionToAngle[enumInvertedDirections[worldDirection]]),
                        size: 13,
                        offsetY: 15,
                    });
                    parameters.context.globalAlpha = 1;
                }
            }
        }

        if (ejectorComp) {
            const slots = ejectorComp.slots;
            for (let ejectorSlotIndex = 0; ejectorSlotIndex < slots.length; ++ejectorSlotIndex) {
                const slot = ejectorComp.slots[ejectorSlotIndex];

                const ejectorSlotWsTile = staticComp.localTileToWorld(
                    ejectorComp.getSlotTargetLocalTile(ejectorSlotIndex)
                );
                const ejectorSLotWsPos = ejectorSlotWsTile.toWorldSpaceCenterOfTile();
                const ejectorSlotWsDirection = staticComp.localDirectionToWorld(slot.direction);

                const destEntity = this.root.map.getTileContent(ejectorSlotWsTile);

                let sprite = goodArrowSprite;
                let alpha = 0.5;
                if (destEntity) {
                    alpha = 1;
                    const destAcceptor = destEntity.components.ItemAcceptor;
                    const destStaticComp = destEntity.components.StaticMapEntity;

                    if (destAcceptor) {
                        const destLocalTile = destStaticComp.worldToLocalTile(ejectorSlotWsTile);
                        const destLocalDir = destStaticComp.worldDirectionToLocal(ejectorSlotWsDirection);
                        if (destAcceptor.findMatchingSlot(destLocalTile, destLocalDir)) {
                            sprite = goodArrowSprite;
                        } else {
                            sprite = badArrowSprite;
                        }
                    }
                }

                parameters.context.globalAlpha = alpha;
                drawRotatedSprite({
                    parameters,
                    sprite,
                    x: ejectorSLotWsPos.x,
                    y: ejectorSLotWsPos.y,
                    angle: Math_radians(enumDirectionToAngle[ejectorSlotWsDirection]),
                    size: 13,
                    offsetY: 15,
                });
                parameters.context.globalAlpha = 1;
            }
        }
    }
}
