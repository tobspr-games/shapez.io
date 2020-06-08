import { makeOffscreenBuffer } from "../../../core/buffer_utils";
import { Math_max } from "../../../core/builtins";
import { globalConfig, IS_DEMO } from "../../../core/config";
import { DrawParameters } from "../../../core/draw_parameters";
import { Loader } from "../../../core/loader";
import { DialogWithForm } from "../../../core/modal_dialog_elements";
import { FormElementInput } from "../../../core/modal_dialog_forms";
import { Rectangle } from "../../../core/rectangle";
import { STOP_PROPAGATION } from "../../../core/signal";
import { arrayDeleteValue, lerp, makeDiv, removeAllChildren } from "../../../core/utils";
import { Vector } from "../../../core/vector";
import { T } from "../../../translations";
import { enumMouseButton } from "../../camera";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { enumNotificationType } from "./notifications";

/** @typedef {{
 *   label: string,
 *   center: { x: number, y: number },
 *   zoomLevel: number,
 *   deletable: boolean
 * }} Waypoint */

export class HUDWaypoints extends BaseHUDPart {
    createElements(parent) {
        if (this.root.app.settings.getAllSettings().offerHints) {
            this.hintElement = makeDiv(
                parent,
                "ingame_HUD_Waypoints_Hint",
                [],
                `
            <strong class='title'>${T.ingame.waypoints.waypoints}</strong>
            <span class='desc'>${T.ingame.waypoints.description.replace(
                "<keybinding>",
                `<code class='keybinding'>${this.root.keyMapper
                    .getBinding(KEYMAPPINGS.navigation.createMarker)
                    .getKeyCodeString()}</code>`
            )}</span>
        `
            );
        }

        this.waypointSprite = Loader.getSprite("sprites/misc/waypoint.png");

        this.waypointsListElement = makeDiv(parent, "ingame_HUD_Waypoints", [], "Waypoints");
    }

    serialize() {
        return {
            waypoints: this.waypoints,
        };
    }

    deserialize(data) {
        if (!data || !data.waypoints || !Array.isArray(data.waypoints)) {
            return "Invalid waypoints data";
        }
        this.waypoints = data.waypoints;
        this.rerenderWaypointList();
    }

    rerenderWaypointList() {
        removeAllChildren(this.waypointsListElement);
        this.cleanupClickDetectors();

        for (let i = 0; i < this.waypoints.length; ++i) {
            const waypoint = this.waypoints[i];

            const element = makeDiv(this.waypointsListElement, null, ["waypoint"]);
            element.innerText = waypoint.label;

            if (waypoint.deletable) {
                const deleteButton = makeDiv(element, null, ["deleteButton"]);
                this.trackClicks(deleteButton, () => this.deleteWaypoint(waypoint));
            }

            this.trackClicks(element, () => this.moveToWaypoint(waypoint), {
                targetOnly: true,
            });
        }
    }

    /**
     * @param {Waypoint} waypoint
     */
    moveToWaypoint(waypoint) {
        this.root.camera.setDesiredCenter(new Vector(waypoint.center.x, waypoint.center.y));
        this.root.camera.setDesiredZoom(waypoint.zoomLevel);
    }

    /**
     * @param {Waypoint} waypoint
     */
    deleteWaypoint(waypoint) {
        arrayDeleteValue(this.waypoints, waypoint);
        this.rerenderWaypointList();
    }

    initialize() {
        /** @type {Array<Waypoint>}
         */
        this.waypoints = [
            {
                label: T.ingame.waypoints.hub,
                center: { x: 0, y: 0 },
                zoomLevel: 3,
                deletable: false,
            },
        ];

        this.dummyBuffer = makeOffscreenBuffer(1, 1, {
            reusable: false,
            label: "waypoints-measure-canvas",
        })[1];

        this.root.camera.downPreHandler.add(this.onMouseDown, this);

        if (this.hintElement) {
            this.domAttach = new DynamicDomAttach(this.root, this.hintElement);
        }

        this.root.keyMapper
            .getBinding(KEYMAPPINGS.navigation.createMarker)
            .add(this.requestCreateMarker, this);

        this.currentMarkerOpacity = 1;
        this.rerenderWaypointList();
    }

    /**
     * @param {Vector=} worldPos Override the world pos, otherwise it is the camera position
     */
    requestCreateMarker(worldPos = null) {
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

        const center = worldPos || this.root.camera.center;

        dialog.buttonSignals.ok.add(() => {
            if (IS_DEMO && this.waypoints.length > 2) {
                this.root.hud.parts.dialogs.showFeatureRestrictionInfo("", T.dialogs.markerDemoLimit.desc);
                return;
            }

            this.waypoints.push({
                label: markerNameInput.getValue(),
                center: { x: center.x, y: center.y },
                zoomLevel: Math_max(this.root.camera.zoomLevel, globalConfig.mapChunkOverviewMinZoom + 0.05),
                deletable: true,
            });
            this.waypoints.sort((a, b) => a.label.padStart(20, "0").localeCompare(b.label.padStart(20, "0")));
            this.root.hud.signals.notification.dispatch(
                T.ingame.waypoints.creationSuccessNotification,
                enumNotificationType.success
            );
            this.rerenderWaypointList();
        });
    }

    update() {
        if (this.domAttach) {
            this.domAttach.update(this.root.camera.getIsMapOverlayActive());
        }
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
            const screenPos = this.root.camera.worldToScreen(
                new Vector(waypoint.center.x, waypoint.center.y)
            );
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
                this.moveToWaypoint(waypoint);
            } else if (button === enumMouseButton.right) {
                if (waypoint.deletable) {
                    this.root.soundProxy.playUiClick();
                    this.deleteWaypoint(waypoint);
                } else {
                    this.root.soundProxy.playUiError();
                }
            }

            return STOP_PROPAGATION;
        } else {
            // Allow right click to create a marker
            if (button === enumMouseButton.right) {
                if (this.root.camera.getIsMapOverlayActive()) {
                    const worldPos = this.root.camera.screenToWorld(pos);
                    this.requestCreateMarker(worldPos);
                    return STOP_PROPAGATION;
                }
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

            const yOffset = -5 * scale;

            parameters.context.font = "bold " + 12 * scale + "px GameFont";

            parameters.context.fillStyle = "rgba(255, 255, 255, 0.7)";
            parameters.context.fillRect(
                pos.x - 7 * scale,
                pos.y - 12 * scale,
                15 * scale + this.dummyBuffer.measureText(waypoint.label).width / this.root.camera.zoomLevel,
                15 * scale
            );

            parameters.context.fillStyle = "#000";
            parameters.context.textAlign = "left";
            parameters.context.textBaseline = "middle";
            parameters.context.fillText(waypoint.label, pos.x + 6 * scale, pos.y + 0.5 * scale + yOffset);

            parameters.context.textBaseline = "alphabetic";
            parameters.context.textAlign = "left";

            this.waypointSprite.drawCentered(parameters.context, pos.x, pos.y + yOffset, 10 * scale);
        }
        parameters.context.globalAlpha = 1;
    }
}
