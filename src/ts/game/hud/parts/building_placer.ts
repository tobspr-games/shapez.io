import { ClickDetector } from "../../../core/click_detector";
import { globalConfig } from "../../../core/config";
import { DrawParameters } from "../../../core/draw_parameters";
import { drawRotatedSprite } from "../../../core/draw_utils";
import { Loader } from "../../../core/loader";
import { clamp, makeDiv, removeAllChildren } from "../../../core/utils";
import { enumDirectionToAngle, enumDirectionToVector, enumInvertedDirections, Vector, enumDirection, } from "../../../core/vector";
import { T } from "../../../translations";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { defaultBuildingVariant } from "../../meta_building";
import { THEME } from "../../theme";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { HUDBuildingPlacerLogic } from "./building_placer_logic";
import { makeOffscreenBuffer } from "../../../core/buffer_utils";
import { layers } from "../../root";
import { getCodeFromBuildingData } from "../../building_codes";
export class HUDBuildingPlacer extends HUDBuildingPlacerLogic {
        createElements(parent: HTMLElement): any {
        this.element = makeDiv(parent, "ingame_HUD_PlacementHints", [], ``);
        this.buildingInfoElements = {};
        this.buildingInfoElements.label = makeDiv(this.element, null, ["buildingLabel"], "Extract");
        this.buildingInfoElements.desc = makeDiv(this.element, null, ["description"], "");
        this.buildingInfoElements.descText = makeDiv(this.buildingInfoElements.desc, null, ["text"], "");
        this.buildingInfoElements.additionalInfo = makeDiv(this.buildingInfoElements.desc, null, ["additionalInfo"], "");
        this.buildingInfoElements.hotkey = makeDiv(this.buildingInfoElements.desc, null, ["hotkey"], "");
        this.buildingInfoElements.tutorialImage = makeDiv(this.element, null, ["buildingImage"]);
        this.variantsElement = makeDiv(parent, "ingame_HUD_PlacerVariants");
        const compact: any = this.root.app.settings.getAllSettings().compactBuildingInfo;
        this.element.classList.toggle("compact", compact);
        this.variantsElement.classList.toggle("compact", compact);
    }
    initialize(): any {
        super.initialize();
        // Bind to signals
        this.signals.variantChanged.add(this.rerenderVariants, this);
        this.root.hud.signals.buildingSelectedForPlacement.add(this.startSelection, this);
        this.domAttach = new DynamicDomAttach(this.root, this.element, { trackHover: true });
        this.variantsAttach = new DynamicDomAttach(this.root, this.variantsElement, {});
        this.currentInterpolatedCornerTile = new Vector();
        this.lockIndicatorSprites = {};
        [...layers, "error"].forEach((layer: any): any => {
            this.lockIndicatorSprites[layer] = this.makeLockIndicatorSprite(layer);
        });
        //
        /**
         * Stores the click detectors for the variants so we can clean them up later
         */
        this.variantClickDetectors = [];
    }
    /**
     * Makes the lock indicator sprite for the given layer
     */
    makeLockIndicatorSprite(layer: string): any {
        const dims: any = 48;
        const [canvas, context]: any = makeOffscreenBuffer(dims, dims, {
            smooth: true,
            reusable: false,
            label: "lock-direction-indicator",
        });
        context.fillStyle = THEME.map.directionLock[layer].color;
        context.strokeStyle = THEME.map.directionLock[layer].color;
        context.lineWidth = 2;
        const padding: any = 5;
        const height: any = dims * 0.5;
        const bottom: any = (dims + height) / 2;
        context.moveTo(padding, bottom);
        context.lineTo(dims / 2, bottom - height);
        context.lineTo(dims - padding, bottom);
        context.closePath();
        context.stroke();
        context.fill();
        return canvas;
    }
    /**
     * Rerenders the building info dialog
     */
    rerenderInfoDialog(): any {
        const metaBuilding: any = this.currentMetaBuilding.get();
        if (!metaBuilding) {
            return;
        }
        const variant: any = this.currentVariant.get();
        this.buildingInfoElements.label.innerHTML = T.buildings[metaBuilding.id][variant].name;
        this.buildingInfoElements.descText.innerHTML = T.buildings[metaBuilding.id][variant].description;
        const layer: any = this.root.currentLayer;
        let rawBinding: any = KEYMAPPINGS.buildings[metaBuilding.getId() + "_" + layer];
        if (!rawBinding) {
            rawBinding = KEYMAPPINGS.buildings[metaBuilding.getId()];
        }
        if (rawBinding) {
            const binding: any = this.root.keyMapper.getBinding(rawBinding);
            this.buildingInfoElements.hotkey.innerHTML = T.ingame.buildingPlacement.hotkeyLabel.replace("<key>", "<code class='keybinding'>" + binding.getKeyCodeString() + "</code>");
        }
        else {
            this.buildingInfoElements.hotkey.innerHTML = "";
        }
        this.buildingInfoElements.tutorialImage.setAttribute("data-icon", "building_tutorials/" +
            metaBuilding.getId() +
            (variant === defaultBuildingVariant ? "" : "-" + variant) +
            ".png");
        removeAllChildren(this.buildingInfoElements.additionalInfo);
        const additionalInfo: any = metaBuilding.getAdditionalStatistics(this.root, this.currentVariant.get());
        for (let i: any = 0; i < additionalInfo.length; ++i) {
            const [label, contents]: any = additionalInfo[i];
            this.buildingInfoElements.additionalInfo.innerHTML += `
                <label>${label}:</label>
                <span>${contents}</contents>
            `;
        }
    }
    cleanup(): any {
        super.cleanup();
        this.cleanupVariantClickDetectors();
    }
    /**
     * Cleans up all variant click detectors
     */
    cleanupVariantClickDetectors(): any {
        for (let i: any = 0; i < this.variantClickDetectors.length; ++i) {
            const detector: any = this.variantClickDetectors[i];
            detector.cleanup();
        }
        this.variantClickDetectors = [];
    }
    /**
     * Rerenders the variants displayed
     */
    rerenderVariants(): any {
        removeAllChildren(this.variantsElement);
        this.rerenderInfoDialog();
        const metaBuilding: any = this.currentMetaBuilding.get();
        // First, clear up all click detectors
        this.cleanupVariantClickDetectors();
        if (!metaBuilding) {
            return;
        }
        const availableVariants: any = metaBuilding.getAvailableVariants(this.root);
        if (availableVariants.length === 1) {
            return;
        }
        makeDiv(this.variantsElement, null, ["explanation"], T.ingame.buildingPlacement.cycleBuildingVariants.replace("<key>", "<code class='keybinding'>" +
            this.root.keyMapper
                .getBinding(KEYMAPPINGS.placement.cycleBuildingVariants)
                .getKeyCodeString() +
            "</code>"));
        const container: any = makeDiv(this.variantsElement, null, ["variants"]);
        for (let i: any = 0; i < availableVariants.length; ++i) {
            const variant: any = availableVariants[i];
            const element: any = makeDiv(container, null, ["variant"]);
            element.classList.toggle("active", variant === this.currentVariant.get());
            makeDiv(element, null, ["label"], variant);
            const iconSize: any = 64;
            const dimensions: any = metaBuilding.getDimensions(variant);
            const sprite: any = metaBuilding.getPreviewSprite(0, variant);
            const spriteWrapper: any = makeDiv(element, null, ["iconWrap"]);
            spriteWrapper.setAttribute("data-tile-w", String(dimensions.x));
            spriteWrapper.setAttribute("data-tile-h", String(dimensions.y));
            spriteWrapper.innerHTML = sprite.getAsHTML(iconSize * dimensions.x, iconSize * dimensions.y);
            const detector: any = new ClickDetector(element, {
                consumeEvents: true,
                targetOnly: true,
            });
            detector.click.add((): any => this.setVariant(variant));
        }
    }
        draw(parameters: DrawParameters): any {
        if (this.root.camera.getIsMapOverlayActive()) {
            // Dont allow placing in overview mode
            this.domAttach.update(false);
            this.variantsAttach.update(false);
            return;
        }
        this.domAttach.update(!!this.currentMetaBuilding.get());
        this.variantsAttach.update(!!this.currentMetaBuilding.get());
        const metaBuilding: any = this.currentMetaBuilding.get();
        if (!metaBuilding) {
            return;
        }
        // Draw direction lock
        if (this.isDirectionLockActive) {
            this.drawDirectionLock(parameters);
        }
        else {
            this.drawRegularPlacement(parameters);
        }
        if (metaBuilding.getShowWiresLayerPreview()) {
            this.drawLayerPeek(parameters);
        }
    }
        drawLayerPeek(parameters: DrawParameters): any {
        const mousePosition: any = this.root.app.mousePosition;
        if (!mousePosition) {
            // Not on screen
            return;
        }
        const worldPosition: any = this.root.camera.screenToWorld(mousePosition);
        // Draw peeker
        if (this.root.hud.parts.layerPreview) {
            this.root.hud.parts.layerPreview.renderPreview(parameters, worldPosition, 1 / this.root.camera.zoomLevel);
        }
    }
        drawRegularPlacement(parameters: DrawParameters): any {
        const mousePosition: any = this.root.app.mousePosition;
        if (!mousePosition) {
            // Not on screen
            return;
        }
        const metaBuilding: any = this.currentMetaBuilding.get();
        const worldPos: any = this.root.camera.screenToWorld(mousePosition);
        const mouseTile: any = worldPos.toTileSpace();
        // Compute best rotation variant
        const { rotation, rotationVariant, connectedEntities, }: any = metaBuilding.computeOptimalDirectionAndRotationVariantAtTile({
            root: this.root,
            tile: mouseTile,
            rotation: this.currentBaseRotation,
            variant: this.currentVariant.get(),
            layer: metaBuilding.getLayer(),
        });
        // Check if there are connected entities
        if (connectedEntities) {
            for (let i: any = 0; i < connectedEntities.length; ++i) {
                const connectedEntity: any = connectedEntities[i];
                const connectedWsPoint: any = connectedEntity.components.StaticMapEntity.getTileSpaceBounds()
                    .getCenter()
                    .toWorldSpace();
                const startWsPoint: any = mouseTile.toWorldSpaceCenterOfTile();
                const startOffset: any = connectedWsPoint
                    .sub(startWsPoint)
                    .normalize()
                    .multiplyScalar(globalConfig.tileSize * 0.3);
                const effectiveStartPoint: any = startWsPoint.add(startOffset);
                const effectiveEndPoint: any = connectedWsPoint.sub(startOffset);
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
        this.fakeEntity.layer = metaBuilding.getLayer();
        const staticComp: any = this.fakeEntity.components.StaticMapEntity;
        staticComp.origin = mouseTile;
        staticComp.rotation = rotation;
        metaBuilding.updateVariants(this.fakeEntity, rotationVariant, this.currentVariant.get());
        staticComp.code = getCodeFromBuildingData(this.currentMetaBuilding.get(), this.currentVariant.get(), rotationVariant);
        const canBuild: any = this.root.logic.checkCanPlaceEntity(this.fakeEntity, {});
        // Fade in / out
        parameters.context.lineWidth = 1;
        // Determine the bounds and visualize them
        const entityBounds: any = staticComp.getTileSpaceBounds();
        const drawBorder: any = -3;
        if (canBuild) {
            parameters.context.strokeStyle = "rgba(56, 235, 111, 0.5)";
            parameters.context.fillStyle = "rgba(56, 235, 111, 0.2)";
        }
        else {
            parameters.context.strokeStyle = "rgba(255, 0, 0, 0.2)";
            parameters.context.fillStyle = "rgba(255, 0, 0, 0.2)";
        }
        parameters.context.beginRoundedRect(entityBounds.x * globalConfig.tileSize - drawBorder, entityBounds.y * globalConfig.tileSize - drawBorder, entityBounds.w * globalConfig.tileSize + 2 * drawBorder, entityBounds.h * globalConfig.tileSize + 2 * drawBorder, 4);
        parameters.context.stroke();
        // parameters.context.fill();
        parameters.context.globalAlpha = 1;
        // HACK to draw the entity sprite
        const previewSprite: any = metaBuilding.getBlueprintSprite(rotationVariant, this.currentVariant.get());
        staticComp.origin = worldPos.divideScalar(globalConfig.tileSize).subScalars(0.5, 0.5);
        staticComp.drawSpriteOnBoundsClipped(parameters, previewSprite);
        staticComp.origin = mouseTile;
        // Draw ejectors
        if (canBuild) {
            this.drawMatchingAcceptorsAndEjectors(parameters);
        }
    }
    /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {} from
     * @param {} to
     * @param {} ignor     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignor     * @returns
     *ForObstales(fro, to: gnorePositio /**
    /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {} from
     * @param {} to
     * @param {} ignorePosit     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignor     * @returns
     *ForObstales(fro, to: gnorePositio /**
    /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignorePosit     * @returns
     * checkForObstales(fro, to: Vector, ignorePositio /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {} from
     * @param {} to
     * @param {} ignorePosit     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignor     * @returns
     *ForObstales(fro, to: gnorePositio /**
    /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignorePosit     * @returns
     * checkForObstales(fro, to: Vector, ignorePositio /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignorePosit     * @returns
     * checkForObstales(fro, to: Vector, ignorePositio     * Checks if there a entities in the way,true if there are
   /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {} from
     * @param {} to
     * @param {} ignorePosit     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignor     * @returns
     *ForObstales(fro, to: gnorePositio /**
    /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignorePosit     * @returns
     * checkForObstales(fro, to: Vector, ignorePositio /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignorePosit     * @returns
     * checkForObstales(fro, to: Vector, ignorePositio     * Checks if there a entities in the way,true if there are
   /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignorePosit     * @returns
     * checkForObstales(fro, to: Vector, ignorePositio /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {} from
     * @param {} to
     * @param {} ignorePosit     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignor     * @returns
     *ForObstales(fro, to: gnorePositio /**
    /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignorePosit     * @returns
     * checkForObstales(fro, to: Vector, ignorePositio /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignorePosit     * @returns
     * checkForObstales(fro, to: Vector, ignorePositio     * Checks if there a entities in the way,true if there are
   /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignorePosit     * @returns
     * checkForObstales(fro, to: Vector, ignorePositio /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignorePosit     * @returns
     * checkForObstales(fro, to: Vector, ignorePositio /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {} from
     * @param {} to
     * @param {} ignorePositions
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignor     * @returns
     *ForObstales(fro, to: gnorePositio /**
    /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignorePosit     * @returns
     * checkForObstales(fro, to: Vector, ignorePositio /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignorePosit     * @returns
     * checkForObstales(fro, to: Vector, ignorePositio     * Checks if there a entities in the way,true if there are
   /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignorePosit     * @returns
     * checkForObstales(fro, to: Vector, ignorePositio /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignorePosit     * @returns
     * checkForObstales(fro, to: Vector, ignorePositio /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignorePositions
     * @returns
     */
    checkForObstales(from: Vector, to: V ignorePositions: Vecto []): any {
        om.x === to.x || from.y === /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {} from
     * @param {} to
     * @param {} ignorePosit     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignorePosit     * @returns
     * checkForObstales(fro, to: Vector, ignorePositio /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {} from
     * @param {} to
     * @param {} ignorePosit     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignorePosit     * @returns
     * checkForObstales(fro, to: Vector, ignorePositio /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignorePosit     * @returns
     * checkForObstales(fro, to: Vector, ignorePositio /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {} from
     * @param {} to
     * @param {} ignorePositions
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignorePosit     * @returns
     * checkForObstales(fro, to: Vector, ignorePositio /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignorePosit     * @returns
     * checkForObstales(fro, to: Vector, ignorePositio /**
     * Checks if there are any entities in the way, returns true if there are
     * @ /**
     * Checks if there are any entities in the way, returns true if there are
     * @param {Vector} from
     * @param {Vector} to
     * @param {Vector[]=} ignorePositions
     * @returns
     */
    checkForObstales(from: Vector, to: Vector, ignorePositions: Vector[]= = []): any {
        assert(from.x === to.x || from.y === to.y, "Must be a straight line");
        const prop: any = from.x === to.x ? "y" : "x";
        const current: any = from.copy();
        const metaBuilding: any = this.currentMetaBuilding.get();
        this.fakeEntity.layer = metaBuilding.getLayer();
        const staticComp: any = this.fakeEntity.components.StaticMapEntity;
        staticComp.origin = current;
        staticComp.rotation = 0;
        metaBuilding.updateVariants(this.fakeEntity, 0, this.currentVariant.get());
        staticComp.code = getCodeFromBuildingData(this.currentMetaBuilding.get(), this.currentVariant.get(), 0);
        const start: any = Math.min(from[prop], to[prop]);
        const end: any = Math.max(from[prop], to[prop]);
        for (let i: any = start; i <= end; i++) {
            current[prop] = i;
            if (ignorePositions.some((p: any): any => p.distanceSquare(current) < 0.1)) {
                continue;
            }
            if (!this.root.logic.checkCanPlaceEntity(this.fakeEntity, { allowReplaceBuildings: false })) {
                return true;
            }
        }
        return false;
    }
        drawDirectionLock(parameters: DrawParameters): any {
        const mousePosition: any = this.root.app.mousePosition;
        if (!mousePosition) {
            // Not on screen
            return;
        }
        const applyStyles: any = (look: any): any => {
            parameters.context.fillStyle = THEME.map.directionLock[look].color;
            parameters.context.strokeStyle = THEME.map.directionLock[look].background;
            parameters.context.lineWidth = 10;
        };
        if (!this.lastDragTile) {
            // Not dragging yet
            applyStyles(this.root.currentLayer);
            const mouseWorld: any = this.root.camera.screenToWorld(mousePosition);
            parameters.context.beginCircle(mouseWorld.x, mouseWorld.y, 4);
            parameters.context.fill();
            return;
        }
        const mouseWorld: any = this.root.camera.screenToWorld(mousePosition);
        const mouseTile: any = mouseWorld.toTileSpace();
        const startLine: any = this.lastDragTile.toWorldSpaceCenterOfTile();
        const endLine: any = mouseTile.toWorldSpaceCenterOfTile();
        const midLine: any = this.currentDirectionLockCorner.toWorldSpaceCenterOfTile();
        const anyObstacle: any = this.checkForObstales(this.lastDragTile, this.currentDirectionLockCorner, [
            this.lastDragTile,
            mouseTile,
        ]) ||
            this.checkForObstales(this.currentDirectionLockCorner, mouseTile, [this.lastDragTile, mouseTile]);
        if (anyObstacle) {
            applyStyles("error");
        }
        else {
            applyStyles(this.root.currentLayer);
        }
        parameters.context.beginCircle(mouseWorld.x, mouseWorld.y, 4);
        parameters.context.fill();
        parameters.context.beginCircle(startLine.x, startLine.y, 8);
        parameters.context.fill();
        parameters.context.beginPath();
        parameters.context.moveTo(startLine.x, startLine.y);
        parameters.context.lineTo(midLine.x, midLine.y);
        parameters.context.lineTo(endLine.x, endLine.y);
        parameters.context.stroke();
        parameters.context.beginCircle(endLine.x, endLine.y, 5);
        parameters.context.fill();
        // Draw arrow
        const arrowSprite: any = this.lockIndicatorSprites[anyObstacle ? "error" : this.root.currentLayer];
        const path: any = this.computeDirectionLockPath();
        for (let i: any = 0; i < path.length - 1; i += 1) {
            const { rotation, tile }: any = path[i];
            const worldPos: any = tile.toWorldSpaceCenterOfTile();
            const angle: any = Math.radians(rotation);
            parameters.context.translate(worldPos.x, worldPos.y);
            parameters.context.rotate(angle);
            parameters.context.drawImage(arrowSprite, -6, -globalConfig.halfTileSize -
                clamp((this.root.time.realtimeNow() * 1.5) % 1.0, 0, 1) * 1 * globalConfig.tileSize +
                globalConfig.halfTileSize -
                6, 12, 12);
            parameters.context.rotate(-angle);
            parameters.context.translate(-worldPos.x, -worldPos.y);
        }
    }
        drawMatchingAcceptorsAndEjectors(parameters: DrawParameters): any {
        const acceptorComp: any = this.fakeEntity.components.ItemAcceptor;
        const ejectorComp: any = this.fakeEntity.components.ItemEjector;
        const staticComp: any = this.fakeEntity.components.StaticMapEntity;
        const beltComp: any = this.fakeEntity.components.Belt;
        const minerComp: any = this.fakeEntity.components.Miner;
        const goodArrowSprite: any = Loader.getSprite("sprites/misc/slot_good_arrow.png");
        const badArrowSprite: any = Loader.getSprite("sprites/misc/slot_bad_arrow.png");
        // Just ignore the following code please ... thanks!
        const offsetShift: any = 10;
                let acceptorSlots: Array<import("../../components/item_acceptor").ItemAcceptorSlot> = [];
                let ejectorSlots: Array<import("../../components/item_ejector").ItemEjectorSlot> = [];
        if (ejectorComp) {
            ejectorSlots = ejectorComp.slots.slice();
        }
        if (acceptorComp) {
            acceptorSlots = acceptorComp.slots.slice();
        }
        if (beltComp) {
            const fakeEjectorSlot: any = beltComp.getFakeEjectorSlot();
            const fakeAcceptorSlot: any = beltComp.getFakeAcceptorSlot();
            ejectorSlots.push(fakeEjectorSlot);
            acceptorSlots.push(fakeAcceptorSlot);
        }
        // Go over all slots
        for (let i: any = 0; i < acceptorSlots.length; ++i) {
            const slot: any = acceptorSlots[i];
            const acceptorSlotWsTile: any = staticComp.localTileToWorld(slot.pos);
            const acceptorSlotWsPos: any = acceptorSlotWsTile.toWorldSpaceCenterOfTile();
            const direction: any = slot.direction;
            const worldDirection: any = staticComp.localDirectionToWorld(direction);
            // Figure out which tile ejects to this slot
            const sourceTile: any = acceptorSlotWsTile.add(enumDirectionToVector[worldDirection]);
            let isBlocked: any = false;
            let isConnected: any = false;
            // Find all entities which are on that tile
            const sourceEntities: any = this.root.map.getLayersContentsMultipleXY(sourceTile.x, sourceTile.y);
            // Check for every entity:
            for (let j: any = 0; j < sourceEntities.length; ++j) {
                const sourceEntity: any = sourceEntities[j];
                const sourceEjector: any = sourceEntity.components.ItemEjector;
                const sourceBeltComp: any = sourceEntity.components.Belt;
                const sourceStaticComp: any = sourceEntity.components.StaticMapEntity;
                const ejectorAcceptLocalTile: any = sourceStaticComp.worldToLocalTile(acceptorSlotWsTile);
                // If this entity is on the same layer as the slot - if so, it can either be
                // connected, or it can not be connected and thus block the input
                if (sourceEjector && sourceEjector.anySlotEjectsToLocalTile(ejectorAcceptLocalTile)) {
                    // This one is connected, all good
                    isConnected = true;
                }
                else if (sourceBeltComp &&
                    sourceStaticComp.localDirectionToWorld(sourceBeltComp.direction) ===
                        enumInvertedDirections[worldDirection]) {
                    // Belt connected
                    isConnected = true;
                }
                else {
                    // This one is blocked
                    isBlocked = true;
                }
            }
            const alpha: any = isConnected || isBlocked ? 1.0 : 0.3;
            const sprite: any = isBlocked ? badArrowSprite : goodArrowSprite;
            parameters.context.globalAlpha = alpha;
            drawRotatedSprite({
                parameters,
                sprite,
                x: acceptorSlotWsPos.x,
                y: acceptorSlotWsPos.y,
                angle: Math.radians(enumDirectionToAngle[enumInvertedDirections[worldDirection]]),
                size: 13,
                offsetY: offsetShift + 13,
            });
            parameters.context.globalAlpha = 1;
        }
        // Go over all slots
        for (let ejectorSlotIndex: any = 0; ejectorSlotIndex < ejectorSlots.length; ++ejectorSlotIndex) {
            const slot: any = ejectorSlots[ejectorSlotIndex];
            const ejectorSlotLocalTile: any = slot.pos.add(enumDirectionToVector[slot.direction]);
            const ejectorSlotWsTile: any = staticComp.localTileToWorld(ejectorSlotLocalTile);
            const ejectorSLotWsPos: any = ejectorSlotWsTile.toWorldSpaceCenterOfTile();
            const ejectorSlotWsDirection: any = staticComp.localDirectionToWorld(slot.direction);
            let isBlocked: any = false;
            let isConnected: any = false;
            // Find all entities which are on that tile
            const destEntities: any = this.root.map.getLayersContentsMultipleXY(ejectorSlotWsTile.x, ejectorSlotWsTile.y);
            // Check for every entity:
            for (let i: any = 0; i < destEntities.length; ++i) {
                const destEntity: any = destEntities[i];
                const destAcceptor: any = destEntity.components.ItemAcceptor;
                const destStaticComp: any = destEntity.components.StaticMapEntity;
                const destMiner: any = destEntity.components.Miner;
                const destLocalTile: any = destStaticComp.worldToLocalTile(ejectorSlotWsTile);
                const destLocalDir: any = destStaticComp.worldDirectionToLocal(ejectorSlotWsDirection);
                if (destAcceptor && destAcceptor.findMatchingSlot(destLocalTile, destLocalDir)) {
                    // This one is connected, all good
                    isConnected = true;
                }
                else if (destEntity.components.Belt && destLocalDir === enumDirection.top) {
                    // Connected to a belt
                    isConnected = true;
                }
                else if (minerComp && minerComp.chainable && destMiner && destMiner.chainable) {
                    // Chainable miners connected to eachother
                    isConnected = true;
                }
                else {
                    // This one is blocked
                    isBlocked = true;
                }
            }
            const alpha: any = isConnected || isBlocked ? 1.0 : 0.3;
            const sprite: any = isBlocked ? badArrowSprite : goodArrowSprite;
            parameters.context.globalAlpha = alpha;
            drawRotatedSprite({
                parameters,
                sprite,
                x: ejectorSLotWsPos.x,
                y: ejectorSLotWsPos.y,
                angle: Math.radians(enumDirectionToAngle[ejectorSlotWsDirection]),
                size: 13,
                offsetY: offsetShift,
            });
            parameters.context.globalAlpha = 1;
        }
    }
}
