import { DrawParameters } from "../../../core/draw_parameters";
import { STOP_PROPAGATION } from "../../../core/signal";
import { TrackedState } from "../../../core/tracked_state";
import { Vector } from "../../../core/vector";
import { enumMouseButton } from "../../camera";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { BaseHUDPart } from "../base_hud_part";
import { Blueprint } from "./blueprint";

export class HUDBlueprintPlacer extends BaseHUDPart {
    createElements(parent) {}

    initialize() {
        this.root.hud.signals.buildingsSelectedForCopy.add(this.onBuildingsSelected, this);

        /** @type {TypedTrackedState<Blueprint?>} */
        this.currentBlueprint = new TrackedState(this.onBlueprintChanged, this);

        const keyActionMapper = this.root.keyMapper;
        keyActionMapper.getBinding(KEYMAPPINGS.general.back).add(this.abortPlacement, this);
        keyActionMapper
            .getBinding(KEYMAPPINGS.placement.abortBuildingPlacement)
            .add(this.abortPlacement, this);
        keyActionMapper.getBinding(KEYMAPPINGS.placement.rotateWhilePlacing).add(this.rotateBlueprint, this);

        this.root.camera.downPreHandler.add(this.onMouseDown, this);
        this.root.camera.movePreHandler.add(this.onMouseMove, this);

        this.root.hud.signals.selectedPlacementBuildingChanged.add(this.abortPlacement, this);
    }

    abortPlacement() {
        if (this.currentBlueprint.get()) {
            this.currentBlueprint.set(null);

            return STOP_PROPAGATION;
        }
    }

    onBlueprintChanged(blueprint) {}

    /**
     * mouse down pre handler
     * @param {Vector} pos
     * @param {enumMouseButton} button
     */
    onMouseDown(pos, button) {
        if (button === enumMouseButton.right) {
            this.abortPlacement();
            return STOP_PROPAGATION;
        }

        const blueprint = this.currentBlueprint.get();
        if (!blueprint) {
            return;
        }

        const worldPos = this.root.camera.screenToWorld(pos);
        const tile = worldPos.toTileSpace();
        if (blueprint.tryPlace(this.root, tile)) {
            // This actually feels weird
            // if (!this.root.keyMapper.getBinding(KEYMAPPINGS.placementModifiers.placeMultiple).isCurrentlyPressed()) {
            //     this.currentBlueprint.set(null);
            // }
        }
    }

    onMouseMove() {
        // Prevent movement while blueprint is selected
        if (this.currentBlueprint.get()) {
            return STOP_PROPAGATION;
        }
    }

    /**
     * @param {Array<number>} uids
     */
    onBuildingsSelected(uids) {
        if (uids.length === 0) {
            return;
        }
        this.currentBlueprint.set(Blueprint.fromUids(this.root, uids));
    }

    rotateBlueprint() {
        if (this.currentBlueprint.get()) {
            if (
                this.root.keyMapper
                    .getBinding(KEYMAPPINGS.placement.rotateInverseModifier)
                    .isCurrentlyPressed()
            ) {
                this.currentBlueprint.get().rotateCcw();
            } else {
                this.currentBlueprint.get().rotateCw();
            }
        }
    }

    /**
     *
     * @param {DrawParameters} parameters
     */
    draw(parameters) {
        const blueprint = this.currentBlueprint.get();
        if (!blueprint) {
            return;
        }
        const mousePosition = this.root.app.mousePosition;
        if (!mousePosition) {
            // Not on screen
            return;
        }

        const worldPos = this.root.camera.screenToWorld(mousePosition);
        const tile = worldPos.toTileSpace();
        blueprint.draw(parameters, tile);
    }
}
