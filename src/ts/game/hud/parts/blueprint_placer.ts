import { DrawParameters } from "../../../core/draw_parameters";
import { STOP_PROPAGATION } from "../../../core/signal";
import { TrackedState } from "../../../core/tracked_state";
import { makeDiv } from "../../../core/utils";
import { Vector } from "../../../core/vector";
import { SOUNDS } from "../../../platform/sound";
import { T } from "../../../translations";
import { Blueprint } from "../../blueprint";
import { enumMouseButton } from "../../camera";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";
export class HUDBlueprintPlacer extends BaseHUDPart {
    createElements(parent: any): any {
        const blueprintCostShape: any = this.root.shapeDefinitionMgr.getShapeFromShortKey(this.root.gameMode.getBlueprintShapeKey());
        const blueprintCostShapeCanvas: any = blueprintCostShape.generateAsCanvas(80);
        this.costDisplayParent = makeDiv(parent, "ingame_HUD_BlueprintPlacer", [], ``);
        makeDiv(this.costDisplayParent, null, ["label"], T.ingame.blueprintPlacer.cost);
        const costContainer: any = makeDiv(this.costDisplayParent, null, ["costContainer"], "");
        this.costDisplayText = makeDiv(costContainer, null, ["costText"], "");
        costContainer.appendChild(blueprintCostShapeCanvas);
    }
    initialize(): any {
        this.root.hud.signals.buildingsSelectedForCopy.add(this.createBlueprintFromBuildings, this);
                this.currentBlueprint = new TrackedState(this.onBlueprintChanged, this);
                this.lastBlueprintUsed = null;
        const keyActionMapper: any = this.root.keyMapper;
        keyActionMapper.getBinding(KEYMAPPINGS.general.back).add(this.abortPlacement, this);
        keyActionMapper.getBinding(KEYMAPPINGS.placement.pipette).add(this.abortPlacement, this);
        keyActionMapper.getBinding(KEYMAPPINGS.placement.rotateWhilePlacing).add(this.rotateBlueprint, this);
        keyActionMapper.getBinding(KEYMAPPINGS.massSelect.pasteLastBlueprint).add(this.pasteBlueprint, this);
        this.root.camera.downPreHandler.add(this.onMouseDown, this);
        this.root.camera.movePreHandler.add(this.onMouseMove, this);
        this.root.hud.signals.selectedPlacementBuildingChanged.add(this.abortPlacement, this);
        this.root.signals.editModeChanged.add(this.onEditModeChanged, this);
        this.domAttach = new DynamicDomAttach(this.root, this.costDisplayParent);
        this.trackedCanAfford = new TrackedState(this.onCanAffordChanged, this);
    }
    getHasFreeCopyPaste(): any {
        return this.root.gameMode.getHasFreeCopyPaste();
    }
    abortPlacement(): any {
        if (this.currentBlueprint.get()) {
            this.currentBlueprint.set(null);
            return STOP_PROPAGATION;
        }
    }
    /**
     * Called when the layer was changed
     */
    onEditModeChanged(layer: Layer): any {
        // Check if the layer of the blueprint differs and thus we have to deselect it
        const blueprint: any = this.currentBlueprint.get();
        if (blueprint) {
            if (blueprint.layer !== layer) {
                this.currentBlueprint.set(null);
            }
        }
    }
    /**
     * Called when the blueprint is now affordable or not
     */
    onCanAffordChanged(canAfford: boolean): any {
        this.costDisplayParent.classList.toggle("canAfford", canAfford);
    }
    update(): any {
        const currentBlueprint: any = this.currentBlueprint.get();
        this.domAttach.update(!this.getHasFreeCopyPaste() && currentBlueprint && currentBlueprint.getCost() > 0);
        this.trackedCanAfford.set(currentBlueprint && currentBlueprint.canAfford(this.root));
    }
    /**
     * Called when the blueprint was changed
     */
    onBlueprintChanged(blueprint: Blueprint): any {
        if (blueprint) {
            this.lastBlueprintUsed = blueprint;
            this.costDisplayText.innerText = "" + blueprint.getCost();
        }
    }
    /**
     * mouse down pre handler
     */
    onMouseDown(pos: Vector, button: enumMouseButton): any {
        if (button === enumMouseButton.right) {
            if (this.currentBlueprint.get()) {
                this.abortPlacement();
                return STOP_PROPAGATION;
            }
        }
        else if (button === enumMouseButton.left) {
            const blueprint: any = this.currentBlueprint.get();
            if (!blueprint) {
                return;
            }
            if (!this.getHasFreeCopyPaste() && !blueprint.canAfford(this.root)) {
                this.root.soundProxy.playUiError();
                return;
            }
            const worldPos: any = this.root.camera.screenToWorld(pos);
            const tile: any = worldPos.toTileSpace();
            if (blueprint.tryPlace(this.root, tile)) {
                if (!this.getHasFreeCopyPaste()) {
                    const cost: any = blueprint.getCost();
                    this.root.hubGoals.takeShapeByKey(this.root.gameMode.getBlueprintShapeKey(), cost);
                }
                this.root.soundProxy.playUi(SOUNDS.placeBuilding);
            }
            return STOP_PROPAGATION;
        }
    }
    /**
     * Mouse move handler
     */
    onMouseMove(): any {
        // Prevent movement while blueprint is selected
        if (this.currentBlueprint.get()) {
            return STOP_PROPAGATION;
        }
    }
    /**
     * Called when an array of bulidings was selected
     */
    createBlueprintFromBuildings(uids: Array<number>): any {
        if (uids.length === 0) {
            return;
        }
        this.currentBlueprint.set(Blueprint.fromUids(this.root, uids));
    }
    /**
     * Attempts to rotate the current blueprint
     */
    rotateBlueprint(): any {
        if (this.currentBlueprint.get()) {
            if (this.root.keyMapper.getBinding(KEYMAPPINGS.placement.rotateInverseModifier).pressed) {
                this.currentBlueprint.get().rotateCcw();
            }
            else {
                this.currentBlueprint.get().rotateCw();
            }
        }
    }
    /**
     * Attempts to paste the last blueprint
     */
    pasteBlueprint(): any {
        if (this.lastBlueprintUsed !== null) {
            if (this.lastBlueprintUsed.layer !== this.root.currentLayer) {
                // Not compatible
                this.root.soundProxy.playUiError();
                return;
            }
            this.root.hud.signals.pasteBlueprintRequested.dispatch();
            this.currentBlueprint.set(this.lastBlueprintUsed);
        }
        else {
            this.root.soundProxy.playUiError();
        }
    }
        draw(parameters: DrawParameters): any {
        const blueprint: any = this.currentBlueprint.get();
        if (!blueprint) {
            return;
        }
        const mousePosition: any = this.root.app.mousePosition;
        if (!mousePosition) {
            // Not on screen
            return;
        }
        const worldPos: any = this.root.camera.screenToWorld(mousePosition);
        const tile: any = worldPos.toTileSpace();
        blueprint.draw(parameters, tile);
    }
}
