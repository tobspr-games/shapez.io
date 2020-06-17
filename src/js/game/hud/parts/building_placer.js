import { Math_radians } from "../../../core/builtins";
import { globalConfig } from "../../../core/config";
import { DrawParameters } from "../../../core/draw_parameters";
import { drawRotatedSprite } from "../../../core/draw_utils";
import { Loader } from "../../../core/loader";
import { makeDiv, removeAllChildren, pulseAnimation, clamp } from "../../../core/utils";
import {
    enumDirectionToAngle,
    enumDirectionToVector,
    enumInvertedDirections,
    Vector,
} from "../../../core/vector";
import { T } from "../../../translations";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { defaultBuildingVariant } from "../../meta_building";
import { THEME } from "../../theme";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { HUDBuildingPlacerLogic } from "./building_placer_logic";

export class HUDBuildingPlacer extends HUDBuildingPlacerLogic {
    /**
     * @param {HTMLElement} parent
     */
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

    initialize() {
        super.initialize();

        // Bind to signals
        this.signals.variantChanged.add(this.rerenderVariants, this);

        this.domAttach = new DynamicDomAttach(this.root, this.element, {});
        this.variantsAttach = new DynamicDomAttach(this.root, this.variantsElement, {});

        this.currentInterpolatedCornerTile = new Vector();

        this.lockIndicatorSprite = Loader.getSprite("sprites/misc/lock_direction_indicator.png");
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

        // Draw direction lock
        if (this.isDirectionLockActive) {
            this.drawDirectionLock(parameters);
        } else {
            this.drawRegularPlacement(parameters);
        }
    }

    /**
     * @param {DrawParameters} parameters
     */
    drawRegularPlacement(parameters) {
        const mousePosition = this.root.app.mousePosition;
        if (!mousePosition) {
            // Not on screen
            return;
        }

        const metaBuilding = this.currentMetaBuilding.get();

        const worldPos = this.root.camera.screenToWorld(mousePosition);
        const mouseTile = worldPos.toTileSpace();

        // Compute best rotation variant
        const {
            rotation,
            rotationVariant,
            connectedEntities,
        } = metaBuilding.computeOptimalDirectionAndRotationVariantAtTile(
            this.root,
            mouseTile,
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

                const startWsPoint = mouseTile.toWorldSpaceCenterOfTile();

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
        staticComp.origin = mouseTile;
        staticComp.rotation = rotation;
        staticComp.tileSize = metaBuilding.getDimensions(this.currentVariant.get());
        metaBuilding.updateVariants(this.fakeEntity, rotationVariant, this.currentVariant.get());

        // Check if we could place the buildnig
        const canBuild = this.root.logic.checkCanPlaceBuilding({
            origin: mouseTile,
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
        staticComp.origin = mouseTile;

        // Draw ejectors
        if (canBuild) {
            this.drawMatchingAcceptorsAndEjectors(parameters);
        }
    }

    /**
     * @param {DrawParameters} parameters
     */
    drawDirectionLock(parameters) {
        const mousePosition = this.root.app.mousePosition;
        if (!mousePosition) {
            // Not on screen
            return;
        }

        const mouseWorld = this.root.camera.screenToWorld(mousePosition);
        const mouseTile = mouseWorld.toTileSpace();
        parameters.context.fillStyle = THEME.map.directionLock;
        parameters.context.strokeStyle = THEME.map.directionLockTrack;
        parameters.context.lineWidth = 10;

        parameters.context.beginCircle(mouseWorld.x, mouseWorld.y, 4);
        parameters.context.fill();

        if (this.lastDragTile) {
            const startLine = this.lastDragTile.toWorldSpaceCenterOfTile();
            const endLine = mouseTile.toWorldSpaceCenterOfTile();
            const midLine = this.currentDirectionLockCorner.toWorldSpaceCenterOfTile();

            parameters.context.beginCircle(startLine.x, startLine.y, 8);
            parameters.context.fill();

            parameters.context.beginPath();
            parameters.context.moveTo(startLine.x, startLine.y);
            parameters.context.lineTo(midLine.x, midLine.y);
            parameters.context.lineTo(endLine.x, endLine.y);
            parameters.context.stroke();

            parameters.context.beginCircle(endLine.x, endLine.y, 5);
            parameters.context.fill();

            // Draw arrows
            const path = this.computeDirectionLockPath();
            for (let i = 0; i < path.length - 1; i += 1) {
                const { rotation, tile } = path[i];
                const worldPos = tile.toWorldSpaceCenterOfTile();
                drawRotatedSprite({
                    parameters,
                    sprite: this.lockIndicatorSprite,
                    x: worldPos.x,
                    y: worldPos.y,
                    angle: Math_radians(rotation),
                    size: 12,
                    offsetY:
                        -globalConfig.halfTileSize -
                        clamp((this.root.time.now() * 1.5) % 1.0, 0, 1) * 1 * globalConfig.tileSize +
                        globalConfig.halfTileSize,
                });
            }
        }
    }

    /**
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
