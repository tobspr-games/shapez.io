import { InputReceiver } from "../../../core/input_receiver";
import { makeDiv } from "../../../core/utils";
import { ACHIEVEMENTS, enum_achievement_mappings } from "../../../platform/achievement_provider";
import { T } from "../../../translations";
import { KeyActionMapper, KEYMAPPINGS } from "../../key_action_mapper";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";

export class HUDAchievements extends BaseHUDPart {
    createElements(parent) {
        this.background = makeDiv(parent, "ingame_HUD_Achievements", ["ingameDialog"]);

        // DIALOG Inner / Wrapper
        this.dialogInner = makeDiv(this.background, null, ["dialogInner"]);
        this.title = makeDiv(this.dialogInner, null, ["title"], T.ingame.achievements.title);
        this.closeButton = makeDiv(this.title, null, ["closeButton"]);
        this.trackClicks(this.closeButton, this.close);
        this.contentDiv = makeDiv(this.dialogInner, null, ["content"]);

        this.achievementToElements = {};

        // ACHIEVEMENTS
        for (const achievementKey in ACHIEVEMENTS) {
            const handle = {};

            // Wrapper
            handle.elem = makeDiv(this.contentDiv, null, ["achievement"]);

            // Icon
            handle.icon = makeDiv(handle.elem, null, ["icon"]);
            handle.icon.setAttribute("data-icon", "achievements/" + achievementKey + ".png");

            // Info
            handle.info = makeDiv(handle.elem, null, ["info"]);

            // Title
            const title = makeDiv(handle.info, null, ["title"], T.achievements[achievementKey].title);

            // Description
            handle.elemDescription = makeDiv(
                handle.info,
                null,
                ["description"],
                T.achievements[achievementKey].description
            );

            // Reset button
            handle.resetButton = document.createElement("button");
            handle.resetButton.classList.add("reset", "styledButton");
            handle.resetButton.innerText = T.ingame.achievements.buttonReset;
            handle.elem.appendChild(handle.resetButton);

            this.trackClicks(handle.resetButton, () => {
                this.root.achievementProxy.provider.collection.lock(
                    achievementKey,
                    enum_achievement_mappings[ACHIEVEMENTS[achievementKey]]
                );
            });

            // Assign handle
            this.achievementToElements[achievementKey] = handle;
        }
    }

    renderStatus() {
        for (const achievementKey in this.achievementToElements) {
            const handle = this.achievementToElements[achievementKey];
            if (!this.root.achievementProxy.provider.collection.map.get(ACHIEVEMENTS[achievementKey])) {
                if (!handle.elem.classList.contains("unlocked")) handle.elem.classList.add("unlocked");
            } else if (handle.elem.classList.contains("unlocked")) handle.elem.classList.remove("unlocked");
        }
    }

    initialize() {
        this.domAttach = new DynamicDomAttach(this.root, this.background, {
            attachClass: "visible",
        });

        this.inputReciever = new InputReceiver("achievements");
        this.keyActionMapper = new KeyActionMapper(this.root, this.inputReciever);

        this.keyActionMapper.getBinding(KEYMAPPINGS.general.back).add(this.close, this);
        this.keyActionMapper.getBinding(KEYMAPPINGS.ingame.menuClose).add(this.close, this);
        this.keyActionMapper.getBinding(KEYMAPPINGS.ingame.menuOpenAchievements).add(this.close, this);

        this.close();
    }

    cleanup() {
        // Cleanup detectors
        for (const achievementKey in this.achievementToElements) {
            const handle = this.achievementToElements[achievementKey];
        }
    }

    show() {
        this.visible = true;
        this.root.app.inputMgr.makeSureAttachedAndOnTop(this.inputReciever);
    }

    close() {
        this.visible = false;
        this.root.app.inputMgr.makeSureDetached(this.inputReciever);
        this.update();
    }

    update() {
        this.domAttach.update(this.visible);
        if (this.visible) {
            this.renderStatus();
        }
    }

    isBlockingOverlay() {
        return this.visible;
    }
}
