import { BaseHUDPart } from "../base_hud_part";
import { makeDiv, arrayDelete, arrayDeleteValue, lerp } from "../../../core/utils";
import { Vector } from "../../../core/vector";
import { DrawParameters } from "../../../core/draw_parameters";
import { Loader } from "../../../core/loader";
import { T } from "../../../translations";
import { Rectangle } from "../../../core/rectangle";
import { makeOffscreenBuffer } from "../../../core/buffer_utils";
import { enumMouseButton } from "../../camera";
import { STOP_PROPAGATION } from "../../../core/signal";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { IS_DEMO, globalConfig } from "../../../core/config";
import { DialogWithForm } from "../../../core/modal_dialog_elements";
import { FormElementInput } from "../../../core/modal_dialog_forms";
import { Math_max } from "../../../core/builtins";
import { enumNotificationType } from "./notifications";

export class HUDWaypoints extends BaseHUDPart {
    createElements(parent) {
        if (this.root.app.settings.getAllSettings().offerHints) {
            this.element = makeDiv(
                parent,
                "ingame_HUD_Waypoints",
                [],
                `
            <strong class='title'>${T.ingame.waypoints.waypoints}</strong>
            <span class='desc'>${T.ingame.waypoints.description.replace(
                "<keybinding>",
                `<code class='keybinding'>${this.root.keyMapper
                    .getBinding(KEYMAPPINGS.ingame.createMarker)
                    .getKeyCodeString()}</code>`
            )}</span>
        `
            );
        }

        this.waypointSprite = Loader.getSprite("sprites/misc/waypoint.png");
    }

    initialize() {
        this.waypoints = [
            {
                label: T.ingame.waypoints.hub,
                center: new Vector(0, 0),
                zoomLevel: 3,
                deletable: false,
            },
        ];

        this.dummyBuffer = makeOffscreenBuffer(1, 1, {
            reusable: false,
            label: "waypoints-measure-canvas",
        })[1];

        this.root.camera.downPreHandler.add(this.onMouseDown, this);
        this.domAttach = new DynamicDomAttach(this.root, this.element);

        this.root.keyMapper.getBinding(KEYMAPPINGS.ingame.createMarker).add(this.requestCreateMarker, this);

        this.currentMarkerOpacity = 1;
    }

    /**
     *
     * @param {Vector=} worldPos Override the world pos, otherwise it is the camera position
     */
    requestCreateMarker(worldPos = null) {
        if (IS_DEMO) {
            this.root.hud.parts.dialogs.showFeatureRestrictionInfo(T.demo.features.creatingMarkers);
            return;
        }

        const markerNameInput = new FormElementInput({
            id: "markerName",
            label: null,
            placeholder: "",
            validator: val => val.length > 0 && val.length < 15,
        });

        const dialog = new DialogWithForm({
            app: this.root.app,
            title: T.dialogs.createMarker.title,
            desc: T.dialogs.createMarker.desc,
            formElements: [markerNameInput],
        });

        this.root.hud.parts.dialogs.internalShowDialog(dialog);

        dialog.buttonSignals.ok.add(() => {
            this.waypoints.push({
                label: markerNameInput.getValue(),
                center: (worldPos || this.root.camera.center).copy(),
                zoomLevel: Math_max(this.root.camera.zoomLevel, globalConfig.mapChunkOverviewMinZoom + 0.05),
                deletable: true,
            });
            this.root.hud.signals.notification.dispatch(
                T.ingame.waypoints.creationSuccessNotification,
                enumNotificationType.success
            );
        });
    }

    update() {
        this.domAttach.update(this.root.camera.getIsMapOverlayActive());
    }

    findCurrentIntersectedWaypoint() {
        const mousePos = this.root.app.mousePosition;
        if (!mousePos) {
            return;
        }

        if (!this.root.camera.getIsMapOverlayActive()) {
            return;
        }

        const scale = this.root.app.getEffectiveUiScale();

        this.dummyBuffer.font = "bold " + 12 * scale + "px GameFont";

        for (let i = 0; i < this.waypoints.length; ++i) {
            const waypoint = this.waypoints[i];
            const screenPos = this.root.camera.worldToScreen(waypoint.center);
            const intersectionRect = new Rectangle(
                screenPos.x - 7 * scale,
                screenPos.y - 12 * scale,
                15 * scale + this.dummyBuffer.measureText(waypoint.label).width,
                15 * scale
            );
            if (intersectionRect.containsPoint(mousePos.x, mousePos.y)) {
                return waypoint;
            }
        }
    }

    /**
     *
     * @param {Vector} pos
     * @param {enumMouseButton} button
     */
    onMouseDown(pos, button) {
        const waypoint = this.findCurrentIntersectedWaypoint();
        if (waypoint) {
            if (button === enumMouseButton.left) {
                this.root.soundProxy.playUiClick();
                this.root.camera.setDesiredCenter(waypoint.center);
                this.root.camera.setDesiredZoom(waypoint.zoomLevel);
            } else if (button === enumMouseButton.right) {
                if (waypoint.deletable) {
                    this.root.soundProxy.playUiClick();
                    arrayDeleteValue(this.waypoints, waypoint);
                } else {
                    this.root.soundProxy.playUiError();
                }
            }

            return STOP_PROPAGATION;
        } else {
            // Allow right click to create a marker
            if (button === enumMouseButton.right) {
                const worldPos = this.root.camera.screenToWorld(pos);
                this.requestCreateMarker(worldPos);
                return STOP_PROPAGATION;
            }
        }
    }

    /**
     *
     * @param {DrawParameters} parameters
     */
    draw(parameters) {
        const desiredOpacity = this.root.camera.getIsMapOverlayActive() ? 1 : 0;
        this.currentMarkerOpacity = lerp(this.currentMarkerOpacity, desiredOpacity, 0.08);

        if (this.currentMarkerOpacity < 0.01) {
            return;
        }

        const selected = this.findCurrentIntersectedWaypoint();

        const scale = (1 / this.root.camera.zoomLevel) * this.root.app.getEffectiveUiScale();

        for (let i = 0; i < this.waypoints.length; ++i) {
            const waypoint = this.waypoints[i];

            const pos = waypoint.center;

            parameters.context.globalAlpha = this.currentMarkerOpacity * (selected === waypoint ? 1 : 0.7);

            parameters.context.fillStyle = "#000";
            parameters.context.textAlign = "left";
            parameters.context.textBaseline = "middle";

            const yOffset = -5 * scale;

            parameters.context.font = "bold " + 12 * scale + "px GameFont";
            parameters.context.fillText(waypoint.label, pos.x + 6 * scale, pos.y + 0.5 * scale + yOffset);

            parameters.context.textBaseline = "alphabetic";
            parameters.context.textAlign = "left";

            this.waypointSprite.drawCentered(parameters.context, pos.x, pos.y + yOffset, 10 * scale);
        }
        parameters.context.globalAlpha = 1;
    }
}
