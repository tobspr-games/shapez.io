import { makeOffscreenBuffer } from "../../../core/buffer_utils";
import { Math_max, Math_PI, Math_radians } from "../../../core/builtins";
import { globalConfig, IS_DEMO } from "../../../core/config";
import { DrawParameters } from "../../../core/draw_parameters";
import { Loader } from "../../../core/loader";
import { DialogWithForm } from "../../../core/modal_dialog_elements";
import { FormElementInput } from "../../../core/modal_dialog_forms";
import { Rectangle } from "../../../core/rectangle";
import { STOP_PROPAGATION } from "../../../core/signal";
import { arrayDeleteValue, lerp, makeDiv, removeAllChildren, clamp } from "../../../core/utils";
import { Vector } from "../../../core/vector";
import { T } from "../../../translations";
import { enumMouseButton } from "../../camera";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { enumNotificationType } from "./notifications";
import { ShapeDefinition } from "../../shape_definition";

/** @typedef {{
 *   label: string | null,
 *   center: { x: number, y: number },
 *   zoomLevel: number
 * }} Waypoint */

/**
 * Used when a shape icon is rendered instead
 */
const SHAPE_LABEL_PLACEHOLDER = "      ";

export class HUDWaypoints extends BaseHUDPart {
    /**
     * Creates the overview of waypoints
     * @param {HTMLElement} parent
     */
    createElements(parent) {
        // Create the helper box on the lower right when zooming out
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

        // Create the waypoint list on the upper right
        this.waypointsListElement = makeDiv(parent, "ingame_HUD_Waypoints", [], "Waypoints");
    }

    /**
     * Serializes the waypoints
     */
    serialize() {
        return {
            waypoints: this.waypoints,
        };
    }

    /**
     * Deserializes the waypoints
     * @param {{waypoints: Array<Waypoint>}} data
     */
    deserialize(data) {
        if (!data || !data.waypoints || !Array.isArray(data.waypoints)) {
            return "Invalid waypoints data";
        }
        this.waypoints = data.waypoints;
        this.rerenderWaypointList();
    }

    /**
     * Initializes everything
     */
    initialize() {
        // Cache the sprite for the waypoints
        this.waypointSprite = Loader.getSprite("sprites/misc/waypoint.png");
        this.directionIndicatorSprite = Loader.getSprite("sprites/misc/hub_direction_indicator.png");

        /** @type {Array<Waypoint>}
         */
        this.waypoints = [
            {
                label: null,
                center: { x: 0, y: 0 },
                zoomLevel: 3,
            },
        ];

        // Create a buffer we can use to measure text
        this.dummyBuffer = makeOffscreenBuffer(1, 1, {
            reusable: false,
            label: "waypoints-measure-canvas",
        })[1];

        // Dynamically attach/detach the lower right hint in the map overview
        if (this.hintElement) {
            this.domAttach = new DynamicDomAttach(this.root, this.hintElement);
        }

        // Catch mouse and key events
        this.root.camera.downPreHandler.add(this.onMouseDown, this);
        this.root.keyMapper
            .getBinding(KEYMAPPINGS.navigation.createMarker)
            .add(this.requestCreateMarker, this);

        /**
         * Stores at how much opacity the markers should be rendered on the map.
         * This is interpolated over multiple frames so we have some sort of fade effect
         */
        this.currentMarkerOpacity = 1;
        this.currentCompassOpacity = 0;

        // Create buffer which is used to indicate the hub direction
        const [canvas, context] = makeOffscreenBuffer(48, 48, {
            smooth: true,
            reusable: false,
            label: "waypoints-compass",
        });
        this.compassBuffer = { canvas, context };

        /**
         * Stores a cache from a shape short key to its canvas representation
         */
        this.cachedKeyToCanvas = {};

        // Initial render
        this.rerenderWaypointList();
    }

    /**
     * Re-renders the waypoint list to account for changes
     */
    rerenderWaypointList() {
        removeAllChildren(this.waypointsListElement);
        this.cleanupClickDetectors();

        for (let i = 0; i < this.waypoints.length; ++i) {
            const waypoint = this.waypoints[i];
            const label = this.getWaypointLabel(waypoint);

            const element = makeDiv(this.waypointsListElement, null, ["waypoint"]);

            if (ShapeDefinition.isValidShortKey(label)) {
                const canvas = this.getWaypointCanvas(waypoint);
                element.appendChild(canvas);
                element.classList.add("shapeIcon");
            } else {
                element.innerText = label;
            }

            if (this.isWaypointDeletable(waypoint)) {
                const deleteButton = makeDiv(element, null, ["deleteButton"]);
                this.trackClicks(deleteButton, () => this.deleteWaypoint(waypoint));
            }

            if (!waypoint.label) {
                // This must be the hub label
                element.classList.add("hub");
                element.insertBefore(this.compassBuffer.canvas, element.childNodes[0]);
            }

            this.trackClicks(element, () => this.moveToWaypoint(waypoint), {
                targetOnly: true,
            });
        }
    }

    /**
     * Moves the camera to a given waypoint
     * @param {Waypoint} waypoint
     */
    moveToWaypoint(waypoint) {
        this.root.camera.setDesiredCenter(new Vector(waypoint.center.x, waypoint.center.y));
        this.root.camera.setDesiredZoom(waypoint.zoomLevel);
    }

    /**
     * Deletes a waypoint from the list
     * @param {Waypoint} waypoint
     */
    deleteWaypoint(waypoint) {
        arrayDeleteValue(this.waypoints, waypoint);
        this.rerenderWaypointList();
    }

    /**
     * Gets the canvas for a given waypoint
     * @param {Waypoint} waypoint
     * @returns {HTMLCanvasElement}
     */
    getWaypointCanvas(waypoint) {
        const key = waypoint.label;
        if (this.cachedKeyToCanvas[key]) {
            return this.cachedKeyToCanvas[key];
        }

        assert(ShapeDefinition.isValidShortKey(key), "Invalid short key: " + key);
        const definition = ShapeDefinition.fromShortKey(key);
        const preRendered = definition.generateAsCanvas(48);
        return (this.cachedKeyToCanvas[key] = preRendered);
    }

    /**
     * Requests to create a marker at the current camera position. If worldPos is set,
     * uses that position instead.
     * @param {Vector=} worldPos Override the world pos, otherwise it is the camera position
     */
    requestCreateMarker(worldPos = null) {
        // Construct dialog with input field
        const markerNameInput = new FormElementInput({
            id: "markerName",
            label: null,
            placeholder: "",
            validator: val => val.length > 0 && (val.length < 15 || ShapeDefinition.isValidShortKey(val)),
        });
        const dialog = new DialogWithForm({
            app: this.root.app,
            title: T.dialogs.createMarker.title,
            desc: T.dialogs.createMarker.desc,
            formElements: [markerNameInput],
        });
        this.root.hud.parts.dialogs.internalShowDialog(dialog);

        // Compute where to create the marker
        const center = worldPos || this.root.camera.center;

        dialog.buttonSignals.ok.add(() => {
            // Show info that you can have only N markers in the demo,
            // actually show this *after* entering the name so you want the
            // standalone even more (I'm evil :P)
            if (IS_DEMO && this.waypoints.length > 2) {
                this.root.hud.parts.dialogs.showFeatureRestrictionInfo("", T.dialogs.markerDemoLimit.desc);
                return;
            }

            // Actually create the waypoint
            this.addWaypoint(markerNameInput.getValue(), center);
        });
    }

    /**
     * Adds a new waypoint at the given location with the given label
     * @param {string} label
     * @param {Vector} position
     */
    addWaypoint(label, position) {
        this.waypoints.push({
            label,
            center: { x: position.x, y: position.y },
            // Make sure the zoom is *just* a bit above the zoom level where the map overview
            // starts, so you always see all buildings
            zoomLevel: Math_max(this.root.camera.zoomLevel, globalConfig.mapChunkOverviewMinZoom + 0.05),
        });

        // Sort waypoints by name
        this.waypoints.sort((a, b) => {
            if (!a.label) {
                return -1;
            }
            if (!b.label) {
                return 1;
            }
            return this.getWaypointLabel(a)
                .padEnd(20, "0")
                .localeCompare(this.getWaypointLabel(b).padEnd(20, "0"));
        });

        // Show notification about creation
        this.root.hud.signals.notification.dispatch(
            T.ingame.waypoints.creationSuccessNotification,
            enumNotificationType.success
        );

        // Re-render the list and thus add it
        this.rerenderWaypointList();
    }

    /**
     * Called every frame to update stuff
     */
    update() {
        if (this.domAttach) {
            this.domAttach.update(this.root.camera.getIsMapOverlayActive());
        }
    }

    /**
     * Returns the label for a given waypoint
     * @param {Waypoint} waypoint
     * @returns {string}
     */
    getWaypointLabel(waypoint) {
        return waypoint.label || T.ingame.waypoints.hub;
    }

    /**
     * Returns if a waypoint is deletable
     * @param {Waypoint} waypoint
     * @returns {boolean}
     */
    isWaypointDeletable(waypoint) {
        return waypoint.label !== null;
    }

    /**
     * Finds the currently intersected waypoint on the map overview under
     * the cursor.
     *
     * @returns {Waypoint | null}
     */
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

            let label = this.getWaypointLabel(waypoint);

            // Special case for icons
            if (ShapeDefinition.isValidShortKey(label)) {
                label = SHAPE_LABEL_PLACEHOLDER;
            }

            const intersectionRect = new Rectangle(
                screenPos.x - 7 * scale,
                screenPos.y - 12 * scale,
                15 * scale + this.dummyBuffer.measureText(label).width,
                15 * scale
            );
            if (intersectionRect.containsPoint(mousePos.x, mousePos.y)) {
                return waypoint;
            }
        }
    }

    /**
     * Mouse-Down handler
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
                if (this.isWaypointDeletable(waypoint)) {
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
     * Rerenders the compass
     */
    rerenderWaypointsCompass() {
        const context = this.compassBuffer.context;
        const dims = 48;
        context.clearRect(0, 0, dims, dims);
        const indicatorSize = 30;

        const cameraPos = this.root.camera.center;

        const distanceToHub = cameraPos.length();
        const compassVisible = distanceToHub > (10 * globalConfig.tileSize) / this.root.camera.zoomLevel;
        const targetCompassAlpha = compassVisible ? 1 : 0;
        this.currentCompassOpacity = lerp(this.currentCompassOpacity, targetCompassAlpha, 0.08);

        if (this.currentCompassOpacity > 0.01) {
            context.globalAlpha = this.currentCompassOpacity;
            const angle = cameraPos.angle() + Math_radians(45) + Math_PI / 2;
            context.translate(dims / 2, dims / 2);
            context.rotate(angle);
            this.directionIndicatorSprite.drawCentered(context, 0, 0, indicatorSize);
            context.rotate(-angle);
            context.translate(-dims / 2, -dims / 2);
            context.globalAlpha = 1;
        }

        const iconOpacity = 1 - this.currentCompassOpacity;
        if (iconOpacity > 0.01) {
            // Draw icon
            context.globalAlpha = iconOpacity;
            this.waypointSprite.drawCentered(context, dims / 2, dims / 2, dims * 0.7);
            context.globalAlpha = 1;
        }
    }

    /**
     * Draws the waypoints on the map
     * @param {DrawParameters} parameters
     */
    draw(parameters) {
        const desiredOpacity = this.root.camera.getIsMapOverlayActive() ? 1 : 0;
        this.currentMarkerOpacity = lerp(this.currentMarkerOpacity, desiredOpacity, 0.08);

        this.rerenderWaypointsCompass();

        // Don't render with low opacity
        if (this.currentMarkerOpacity < 0.01) {
            return;
        }

        // Find waypoint below cursor
        const selected = this.findCurrentIntersectedWaypoint();

        // Determine rendering scale
        const scale = (1 / this.root.camera.zoomLevel) * this.root.app.getEffectiveUiScale();

        // Render all of 'em
        for (let i = 0; i < this.waypoints.length; ++i) {
            const waypoint = this.waypoints[i];

            const pos = waypoint.center;
            parameters.context.globalAlpha = this.currentMarkerOpacity * (selected === waypoint ? 1 : 0.7);

            const yOffset = -5 * scale;
            const originalLabel = this.getWaypointLabel(waypoint);
            let renderLabel = originalLabel;
            let isShapeIcon = false;

            if (ShapeDefinition.isValidShortKey(originalLabel)) {
                renderLabel = SHAPE_LABEL_PLACEHOLDER;
                isShapeIcon = true;
            }

            // Render the background rectangle
            parameters.context.font = "bold " + 12 * scale + "px GameFont";
            parameters.context.fillStyle = "rgba(255, 255, 255, 0.7)";
            parameters.context.fillRect(
                pos.x - 7 * scale,
                pos.y - 12 * scale,
                15 * scale + this.dummyBuffer.measureText(renderLabel).width / this.root.camera.zoomLevel,
                15 * scale
            );

            // Render the text
            if (isShapeIcon) {
                const canvas = this.getWaypointCanvas(waypoint);
                parameters.context.drawImage(
                    canvas,
                    pos.x + 6 * scale,
                    pos.y - 11.5 * scale,
                    14 * scale,
                    14 * scale
                );
            } else {
                // Render the text
                parameters.context.fillStyle = "#000";
                parameters.context.textBaseline = "middle";
                parameters.context.fillText(renderLabel, pos.x + 6 * scale, pos.y + 0.5 * scale + yOffset);
                parameters.context.textBaseline = "alphabetic";
            }

            // Render the small icon on the left
            this.waypointSprite.drawCentered(parameters.context, pos.x, pos.y + yOffset, 10 * scale);
        }

        parameters.context.globalAlpha = 1;
    }
}
