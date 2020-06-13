import { Math_abs, Math_degrees, Math_radians } from "../../../core/builtins";
import { globalConfig } from "../../../core/config";
import { DrawParameters } from "../../../core/draw_parameters";
import { drawRotatedSprite } from "../../../core/draw_utils";
import { Loader } from "../../../core/loader";
import { STOP_PROPAGATION } from "../../../core/signal";
import { TrackedState } from "../../../core/tracked_state";
import { makeDiv, removeAllChildren } from "../../../core/utils";
import {
    enumDirectionToAngle,
    enumDirectionToVector,
    enumInvertedDirections,
    Vector,
} from "../../../core/vector";
import { enumMouseButton } from "../../camera";
import { StaticMapEntityComponent } from "../../components/static_map_entity";
import { Entity } from "../../entity";
import { defaultBuildingVariant, MetaBuilding } from "../../meta_building";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { T } from "../../../translations";
import { KEYMAPPINGS } from "../../key_action_mapper";

export class HUDBuildingPlacer extends BaseHUDPart {
    initialize() {
        /** @type {TypedTrackedState<MetaBuilding?>} */
        this.currentMetaBuilding = new TrackedState(this.onSelectedMetaBuildingChanged, this);
        this.currentBaseRotation = 0;

        /** @type {Entity} */
        this.fakeEntity = null;

        const keyActionMapper = this.root.keyMapper;
        keyActionMapper
            .getBinding(KEYMAPPINGS.placement.abortBuildingPlacement)
            .add(this.abortPlacement, this);
        keyActionMapper.getBinding(KEYMAPPINGS.general.back).add(this.abortPlacement, this);

        keyActionMapper.getBinding(KEYMAPPINGS.placement.rotateWhilePlacing).add(this.tryRotate, this);
        keyActionMapper.getBinding(KEYMAPPINGS.placement.cycleBuildingVariants).add(this.cycleVariants, this);

        this.root.hud.signals.buildingsSelectedForCopy.add(this.abortPlacement, this);
        this.root.hud.signals.pasteBlueprintRequested.add(this.abortPlacement, this);

        this.domAttach = new DynamicDomAttach(this.root, this.element, {});

        this.root.camera.downPreHandler.add(this.onMouseDown, this);
        this.root.camera.movePreHandler.add(this.onMouseMove, this);
        this.root.camera.upPostHandler.add(this.abortDragging, this);

        this.currentlyDragging = false;
        this.currentVariant = new TrackedState(this.rerenderVariants, this);

        this.variantsAttach = new DynamicDomAttach(this.root, this.variantsElement, {});

        /**
         * Whether we are currently drag-deleting
         */
        this.currentlyDeleting = false;

        /**
         * Stores which variants for each building we prefer, this is based on what
         * the user last selected
         */
        this.preferredVariants = {};

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

        this.root.signals.storyGoalCompleted.add(this.rerenderVariants, this);
        this.root.signals.upgradePurchased.add(this.rerenderVariants, this);
    }

    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_PlacementHints", [], ``);

        this.buildingInfoElements = {};
        this.buildingInfoElements.label = makeDiv(this.element, null, ["buildingLabel"], "Extract");
        this.buildingInfoElements.desc = makeDiv(this.element, null, ["description"], "");
        this.buildingInfoElements.descText = makeDiv(this.buildingInfoElements.desc, null, ["text"], "");
        this.buildingInfoElements.additionalInfo = makeDiv(
            this.buildingInfoElements.desc,
            null,
            ["additionalInfo"],
            ""
        );
        this.buildingInfoElements.hotkey = makeDiv(this.buildingInfoElements.desc, null, ["hotkey"], "");
        this.buildingInfoElements.tutorialImage = makeDiv(this.element, null, ["buildingImage"]);

        this.variantsElement = makeDiv(parent, "ingame_HUD_PlacerVariants");
    }

    abortPlacement() {
        if (this.currentMetaBuilding.get()) {
            this.currentMetaBuilding.set(null);
            return STOP_PROPAGATION;
        }
    }

    /**
     * mouse down pre handler
     * @param {Vector} pos
     * @param {enumMouseButton} button
     */
    onMouseDown(pos, button) {
        if (this.root.camera.getIsMapOverlayActive()) {
            return;
        }

        // Placement
        if (button === enumMouseButton.left && this.currentMetaBuilding.get()) {
            this.currentlyDragging = true;
            this.currentlyDeleting = false;
            this.lastDragTile = this.root.camera.screenToWorld(pos).toTileSpace();

            // Place initial building
            this.tryPlaceCurrentBuildingAt(this.lastDragTile);

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

        const metaBuilding = this.currentMetaBuilding.get();
        if ((metaBuilding || this.currentlyDeleting) && this.lastDragTile) {
            const oldPos = this.lastDragTile;
            const newPos = this.root.camera.screenToWorld(pos).toTileSpace();

            if (this.root.camera.desiredCenter) {
                // Camera is moving
                this.lastDragTile = newPos;
                return;
            }

            if (!oldPos.equals(newPos)) {
                if (
                    metaBuilding &&
                    metaBuilding.getRotateAutomaticallyWhilePlacing(this.currentVariant.get()) &&
                    !this.root.keyMapper
                        .getBinding(KEYMAPPINGS.placementModifiers.placementDisableAutoOrientation)
                        .isCurrentlyPressed()
                ) {
                    const delta = newPos.sub(oldPos);
                    const angleDeg = Math_degrees(delta.angle());
                    this.currentBaseRotation = (Math.round(angleDeg / 90) * 90 + 360) % 360;

                    // Holding alt inverts the placement
                    if (
                        this.root.keyMapper
                            .getBinding(KEYMAPPINGS.placementModifiers.placeInverse)
                            .isCurrentlyPressed()
                    ) {
                        this.currentBaseRotation = (180 + this.currentBaseRotation) % 360;
                    }
                }

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
        this.currentlyDeleting = false;
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
        this.rerenderVariants();
    }

    /**
     * Rerenders the building info dialog
     */
    rerenderInfoDialog() {
        const metaBuilding = this.currentMetaBuilding.get();

        if (!metaBuilding) {
            return;
        }

        const variant = this.currentVariant.get();

        this.buildingInfoElements.label.innerHTML = T.buildings[metaBuilding.id][variant].name;
        this.buildingInfoElements.descText.innerHTML = T.buildings[metaBuilding.id][variant].description;

        const binding = this.root.keyMapper.getBinding(KEYMAPPINGS.buildings[metaBuilding.getId()]);
        this.buildingInfoElements.hotkey.innerHTML = T.ingame.buildingPlacement.hotkeyLabel.replace(
            "<key>",
            "<code class='keybinding'>" + binding.getKeyCodeString() + "</code>"
        );

        this.buildingInfoElements.tutorialImage.setAttribute(
            "data-icon",
            "building_tutorials/" +
                metaBuilding.getId() +
                (variant === defaultBuildingVariant ? "" : "-" + variant) +
                ".png"
        );

        removeAllChildren(this.buildingInfoElements.additionalInfo);
        const additionalInfo = metaBuilding.getAdditionalStatistics(this.root, this.currentVariant.get());
        for (let i = 0; i < additionalInfo.length; ++i) {
            const [label, contents] = additionalInfo[i];
            this.buildingInfoElements.additionalInfo.innerHTML += `
                <label>${label}:</label>
                <span>${contents}</contents>
            `;
        }
    }

    /**
     * Rerenders the variants displayed
     */
    rerenderVariants() {
        removeAllChildren(this.variantsElement);
        this.rerenderInfoDialog();

        const metaBuilding = this.currentMetaBuilding.get();

        if (!metaBuilding) {
            return;
        }
        const availableVariants = metaBuilding.getAvailableVariants(this.root);
        if (availableVariants.length === 1) {
            return;
        }

        makeDiv(
            this.variantsElement,
            null,
            ["explanation"],
            T.ingame.buildingPlacement.cycleBuildingVariants.replace(
                "<key>",
                "<code class='keybinding'>" +
                    this.root.keyMapper
                        .getBinding(KEYMAPPINGS.placement.cycleBuildingVariants)
                        .getKeyCodeString() +
                    "</code>"
            )
        );

        const container = makeDiv(this.variantsElement, null, ["variants"]);

        for (let i = 0; i < availableVariants.length; ++i) {
            const variant = availableVariants[i];

            const element = makeDiv(container, null, ["variant"]);
            element.classList.toggle("active", variant === this.currentVariant.get());
            makeDiv(element, null, ["label"], variant);

            const iconSize = 64;

            const dimensions = metaBuilding.getDimensions(variant);
            const sprite = metaBuilding.getPreviewSprite(0, variant);
            const spriteWrapper = makeDiv(element, null, ["iconWrap"]);
            spriteWrapper.setAttribute("data-tile-w", dimensions.x);
            spriteWrapper.setAttribute("data-tile-h", dimensions.y);

            spriteWrapper.innerHTML = sprite.getAsHTML(iconSize * dimensions.x, iconSize * dimensions.y);
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
     * Tries to rotate
     */
    tryRotate() {
        const selectedBuilding = this.currentMetaBuilding.get();
        if (selectedBuilding) {
            if (
                this.root.keyMapper
                    .getBinding(KEYMAPPINGS.placement.rotateInverseModifier)
                    .isCurrentlyPressed()
            ) {
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
            this.currentBaseRotation,
            this.currentVariant.get()
        );

        if (
            this.root.logic.tryPlaceBuilding({
                origin: tile,
                rotation,
                rotationVariant,
                originalRotation: this.currentBaseRotation,
                building: this.currentMetaBuilding.get(),
                variant: this.currentVariant.get(),
            })
        ) {
            // Succesfully placed

            if (
                metaBuilding.getFlipOrientationAfterPlacement() &&
                !this.root.keyMapper
                    .getBinding(KEYMAPPINGS.placementModifiers.placementDisableAutoOrientation)
                    .isCurrentlyPressed()
            ) {
                this.currentBaseRotation = (180 + this.currentBaseRotation) % 360;
            }

            if (
                !metaBuilding.getStayInPlacementMode() &&
                !this.root.keyMapper
                    .getBinding(KEYMAPPINGS.placementModifiers.placeMultiple)
                    .isCurrentlyPressed() &&
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
     *
     * @param {DrawParameters} parameters
     */
    draw(parameters) {
        if (this.root.camera.zoomLevel < globalConfig.mapChunkOverviewMinZoom) {
            // Dont allow placing in overview mode
            this.domAttach.update(false);
            this.variantsAttach.update(false);
            return;
        }

        this.domAttach.update(this.currentMetaBuilding.get());
        this.variantsAttach.update(this.currentMetaBuilding.get());
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
            this.currentBaseRotation,
            this.currentVariant.get()
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
        staticComp.rotation = rotation;
        staticComp.tileSize = metaBuilding.getDimensions(this.currentVariant.get());
        metaBuilding.updateVariants(this.fakeEntity, rotationVariant, this.currentVariant.get());

        // Check if we could place the buildnig
        const canBuild = this.root.logic.checkCanPlaceBuilding({
            origin: tile,
            rotation,
            rotationVariant,
            building: metaBuilding,
            variant: this.currentVariant.get(),
        });

        // Fade in / out
        parameters.context.lineWidth = 1;
        // parameters.context.globalAlpha = 0.3 + pulseAnimation(this.root.time.realtimeNow(), 0.9) * 0.7;

        // Determine the bounds and visualize them
        const entityBounds = staticComp.getTileSpaceBounds();
        const drawBorder = -3;
        if (canBuild) {
            parameters.context.strokeStyle = "rgba(56, 235, 111, 0.5)";
            parameters.context.fillStyle = "rgba(56, 235, 111, 0.2)";
        } else {
            parameters.context.strokeStyle = "rgba(255, 0, 0, 0.2)";
            parameters.context.fillStyle = "rgba(255, 0, 0, 0.2)";
        }

        parameters.context.beginRoundedRect(
            entityBounds.x * globalConfig.tileSize - drawBorder,
            entityBounds.y * globalConfig.tileSize - drawBorder,
            entityBounds.w * globalConfig.tileSize + 2 * drawBorder,
            entityBounds.h * globalConfig.tileSize + 2 * drawBorder,
            4
        );
        parameters.context.stroke();
        // parameters.context.fill();
        parameters.context.globalAlpha = 1;

        // HACK to draw the entity sprite
        const previewSprite = metaBuilding.getBlueprintSprite(rotationVariant, this.currentVariant.get());
        staticComp.origin = worldPos.divideScalar(globalConfig.tileSize).subScalars(0.5, 0.5);
        staticComp.drawSpriteOnFullEntityBounds(parameters, previewSprite);
        staticComp.origin = tile;

        // Draw ejectors
        if (canBuild) {
            this.drawMatchingAcceptorsAndEjectors(parameters);
        }
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

        const offsetShift = 10;

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
                        offsetY: offsetShift + 13,
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
                    offsetY: offsetShift,
                });
                parameters.context.globalAlpha = 1;
            }
        }
    }
}
