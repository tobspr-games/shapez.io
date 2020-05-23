import { BaseHUDPart } from "../base_hud_part";
import { DrawParameters } from "../../../core/draw_parameters";
import { makeDiv, removeAllChildren, makeButton } from "../../../core/utils";
import { T } from "../../../translations";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { InputReceiver } from "../../../core/input_receiver";
import { KeyActionMapper, KEYMAPPINGS } from "../../key_action_mapper";
import { createLogger } from "../../../core/logging";

const logger = createLogger("waypoints");

export class HUDWaypoints extends BaseHUDPart {
    createElements(parent) {
        this.background = makeDiv(parent, "ingame_HUD_Waypoints", ["ingameDialog"]);

        // DIALOG Inner / Wrapper
        this.dialogInner = makeDiv(this.background, null, ["dialogInner"]);
        this.title = makeDiv(this.dialogInner, null, ["title"], T.ingame.waypoints.title);
        this.closeButton = makeDiv(this.title, null, ["closeButton"]);
        this.trackClicks(this.closeButton, this.close);

        this.wizardWrap = makeDiv(this.dialogInner, null, ["wizardWrap"]);

        // FIXME: Make use of built-in methods
        this.nameInput = document.createElement("input");
        this.nameInput.classList.add("findOrCreate");
        this.nameInput.placeholder = T.ingame.waypoints.findOrCreate;

        this.nameInput.addEventListener("focus", () => {
            this.root.app.inputMgr.makeSureAttachedAndOnTop(this.textInputReciever);
        });

        this.nameInput.addEventListener("blur", () => {
            this.root.app.inputMgr.makeSureAttachedAndOnTop(this.inputReciever);
        });

        this.nameInput.addEventListener("keyup", ev => {
            if (ev.keyCode == 13) {
                ev.preventDefault();
                if (!this.newWaypoint()) {
                    return;
                }

                this.nameInput.blur();
                return;
            }

            this.rerenderFull();
        });

        this.wizardWrap.appendChild(this.nameInput);

        this.newButton = makeButton(this.wizardWrap, ["newButton"], T.ingame.waypoints.buttonNew);
        this.trackClicks(this.newButton, this.newWaypoint);

        this.contentDiv = makeDiv(this.dialogInner, null, ["content"]);
    }

    initialize() {
        this.domAttach = new DynamicDomAttach(this.root, this.background, {
            attachClass: "visible",
        });

        this.textInputReciever = new InputReceiver("waypoints_text");

        this.inputReciever = new InputReceiver("waypoints");
        this.keyActionMapper = new KeyActionMapper(this.root, this.inputReciever);

        this.keyActionMapper.getBinding(KEYMAPPINGS.general.back).add(this.close, this);
        this.keyActionMapper.getBinding(KEYMAPPINGS.ingame.menuOpenWaypoints).add(this.close, this);

        this.close();
        this.rerenderFull();
    }

    getNextWaypointName() {
        const inputName = this.nameInput.value.trim().substr(0, 32);
        if (inputName !== "") return inputName;

        let counter = 0;
        let autoName = "The BEST name for a WAYPOINT!";

        do {
            counter++;
            autoName = T.ingame.waypoints.defaultName.replace("<num>", counter.toString());
        } while (this.waypoints.find(w => w.name == autoName));

        return autoName;
    }

    newWaypoint() {
        const vector = this.root.camera.center.round();
        if (this.waypoints.find(w => w.pos.distance(vector) < 2)) {
            return false;
        }

        this.waypoints.push({
            name: this.getNextWaypointName(),
            pos: vector,
        });

        this.nameInput.value = "";
        this.rerenderFull();
        return true;
    }

    cleanup() {
        document.body.classList.remove("ingameDialogOpen");
    }

    show() {
        this.visible = true;
        document.body.classList.add("ingameDialogOpen");
        this.root.app.inputMgr.makeSureAttachedAndOnTop(this.inputReciever);
        this.rerenderFull();
        this.update();
    }

    close() {
        this.nameInput.value = "";

        this.visible = false;
        document.body.classList.remove("ingameDialogOpen");
        this.root.app.inputMgr.makeSureDetached(this.inputReciever);
        this.root.app.inputMgr.makeSureDetached(this.textInputReciever);
        this.update();
    }

    update() {
        this.domAttach.update(this.visible);
    }

    /**
     * @param {number} index
     */
    removeWaypoint(index) {
        if (this.waypoints[index] === undefined) {
            logger.warn("Attempt to remove nonexisting waypoint", index);
            return;
        }

        this.waypoints.splice(index, 1);
        this.rerenderFull();
    }

    /**
     * @param {number} index
     */
    waypointTeleport(index) {
        if (this.waypoints[index] === undefined) {
            logger.warn("Attempt to teleport to nonexisting waypoint", index);
            return;
        }

        this.close();
        this.root.camera.setDesiredCenter(this.waypoints[index].pos);
    }

    rerenderFull() {
        this.waypoints = this.root.camera.waypoints;
        removeAllChildren(this.contentDiv);

        if (this.waypoints.length == 0) {
            return (this.contentDiv.innerHTML = `
                <strong class="noWaypoints">
                    ${T.ingame.waypoints.noWaypoints.replace("<buttonNew>", T.ingame.waypoints.buttonNew)}
                </strong>
            `);
        }

        this.waypoints.forEach(waypoint => {
            const term = this.nameInput.value.replaceAll(" ", "");
            if (term !== "") {
                const simpleName = waypoint.name.toLowerCase().replaceAll(" ", "");
                if (!simpleName.includes(term.toLowerCase())) {
                    return;
                }
            }

            const tilePos = waypoint.pos.toTileSpace();

            const wpContainer = makeDiv(this.contentDiv, null, ["waypoint"]);
            const positionStr = T.ingame.waypoints.position
                .replace("<xpos>", tilePos.x)
                .replace("<ypos>", tilePos.y);

            const index = this.waypoints.indexOf(waypoint);

            // Waypoint name
            makeDiv(wpContainer, null, ["title"], waypoint.name);

            // Remove button
            const buttonRemove = makeButton(wpContainer, ["removeButton"], T.ingame.waypoints.buttonRemove);
            this.trackClicks(buttonRemove, this.removeWaypoint.bind(this, index));

            // Waypoint coords
            makeDiv(wpContainer, null, ["position"], positionStr);

            // Teleport button
            const buttonTeleport = makeButton(
                wpContainer,
                ["teleportButton"],
                T.ingame.waypoints.buttonTeleport
            );
            this.trackClicks(buttonTeleport, this.waypointTeleport.bind(this, index));
        });
    }

    /**
     * @param {DrawParameters} parameters
     */
    drawOverlays(parameters) {
        // TODO: Draw tile overlays on existing waypoints
    }
}
