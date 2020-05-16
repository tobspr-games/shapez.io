import { BaseHUDPart } from "../base_hud_part";
import { makeDiv } from "../../../core/utils";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { InputReceiver } from "../../../core/input_receiver";
import { KeyActionMapper } from "../../key_action_mapper";

export class HUDSettingsMenu extends BaseHUDPart {
    createElements(parent) {
        this.background = makeDiv(parent, "ingame_HUD_SettingsMenu", ["ingameDialog"]);

        this.menuElement = makeDiv(this.background, null, ["menuElement"]);

        this.timePlayed = makeDiv(
            this.background,
            null,
            ["timePlayed"],
            `<strong>Playtime</strong><span class="playtime"></span>`
        );

        this.buttonContainer = makeDiv(this.menuElement, null, ["buttons"]);

        const buttons = [
            {
                title: "Continue",
                action: () => this.close(),
            },
            {
                title: "Return to menu",
                action: () => this.returnToMenu(),
            },
        ];

        for (let i = 0; i < buttons.length; ++i) {
            const { title, action } = buttons[i];

            const element = document.createElement("button");
            element.classList.add("styledButton");
            element.innerText = title;
            this.buttonContainer.appendChild(element);

            this.trackClicks(element, action);
        }
    }

    returnToMenu() {
        this.root.gameState.goBackToMenu();
    }

    shouldPauseGame() {
        return this.visible;
    }

    shouldPauseRendering() {
        return this.visible;
    }

    initialize() {
        this.root.gameState.keyActionMapper.getBinding("back").add(this.show, this);

        this.domAttach = new DynamicDomAttach(this.root, this.background, {
            attachClass: "visible",
        });

        this.inputReciever = new InputReceiver("settingsmenu");
        this.keyActionMapper = new KeyActionMapper(this.root, this.inputReciever);

        this.keyActionMapper.getBinding("back").add(this.close, this);

        this.close();
    }

    cleanup() {
        document.body.classList.remove("ingameDialogOpen");
    }

    show() {
        this.visible = true;
        document.body.classList.add("ingameDialogOpen");
        // this.background.classList.add("visible");
        this.root.app.inputMgr.makeSureAttachedAndOnTop(this.inputReciever);

        const totalMinutesPlayed = Math.ceil(this.root.time.now() / 60.0);
        const playtimeString = totalMinutesPlayed === 1 ? "1 minute" : totalMinutesPlayed + " minutes";
        this.timePlayed.querySelector(".playtime").innerText = playtimeString;
    }

    close() {
        this.visible = false;
        document.body.classList.remove("ingameDialogOpen");
        this.root.app.inputMgr.makeSureDetached(this.inputReciever);
        this.update();
    }

    update() {
        this.domAttach.update(this.visible);
    }
}
