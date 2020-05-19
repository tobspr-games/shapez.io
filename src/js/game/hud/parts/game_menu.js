import { BaseHUDPart } from "../base_hud_part";
import { makeDiv, randomInt } from "../../../core/utils";
import { SOUNDS } from "../../../platform/sound";
import { enumNotificationType } from "./notifications";
import { T } from "../../../translations";
import { KEYMAPPINGS } from "../../key_action_mapper";

export class HUDGameMenu extends BaseHUDPart {
    initialize() {}
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_GameMenu");

        const buttons = [
            {
                id: "shop",
                label: "Upgrades",
                handler: () => this.root.hud.parts.shop.show(),
                keybinding: KEYMAPPINGS.ingame.menuOpenShop,
                badge: () => this.root.hubGoals.getAvailableUpgradeCount(),
                notification: /** @type {[string, enumNotificationType]} */ ([
                    T.ingame.notifications.newUpgrade,
                    enumNotificationType.upgrade,
                ]),
            },
            {
                id: "stats",
                label: "Stats",
                handler: () => this.root.hud.parts.statistics.show(),
                keybinding: KEYMAPPINGS.ingame.menuOpenStats,
            },
        ];

        /** @type {Array<{
         * badge: function,
         * button: HTMLElement,
         * badgeElement: HTMLElement,
         * lastRenderAmount: number,
         * notification: [string, enumNotificationType]
         * }>} */
        this.badgesToUpdate = [];

        buttons.forEach(({ id, label, handler, keybinding, badge, notification }) => {
            const button = document.createElement("button");
            button.setAttribute("data-button-id", id);
            this.element.appendChild(button);
            this.trackClicks(button, handler);

            if (keybinding) {
                const binding = this.root.gameState.keyActionMapper.getBinding(keybinding);
                binding.add(handler);
                binding.appendLabelToElement(button);
            }

            if (badge) {
                const badgeElement = makeDiv(button, null, ["badge"]);
                this.badgesToUpdate.push({
                    badge,
                    lastRenderAmount: 0,
                    button,
                    badgeElement,
                    notification,
                });
            }
        });

        const menuButtons = makeDiv(this.element, null, ["menuButtons"]);

        this.musicButton = makeDiv(menuButtons, null, ["button", "music"]);
        this.sfxButton = makeDiv(menuButtons, null, ["button", "sfx"]);
        this.saveButton = makeDiv(menuButtons, null, ["button", "save", "animEven"]);
        this.settingsButton = makeDiv(menuButtons, null, ["button", "settings"]);

        this.trackClicks(this.musicButton, this.toggleMusic);
        this.trackClicks(this.sfxButton, this.toggleSfx);
        this.trackClicks(this.saveButton, this.startSave);
        this.trackClicks(this.settingsButton, this.openSettings);

        this.musicButton.classList.toggle("muted", this.root.app.settings.getAllSettings().musicMuted);
        this.sfxButton.classList.toggle("muted", this.root.app.settings.getAllSettings().soundsMuted);

        this.root.signals.gameSaved.add(this.onGameSaved, this);
    }

    update() {
        let playSound = false;
        let notifications = new Set();
        for (let i = 0; i < this.badgesToUpdate.length; ++i) {
            const { badge, button, badgeElement, lastRenderAmount, notification } = this.badgesToUpdate[i];
            const amount = badge();
            if (lastRenderAmount !== amount) {
                if (amount > 0) {
                    badgeElement.innerText = amount;
                }
                // Check if the badge increased
                if (amount > lastRenderAmount) {
                    playSound = true;
                    if (notification) {
                        notifications.add(notification);
                    }
                }
                this.badgesToUpdate[i].lastRenderAmount = amount;
                button.classList.toggle("hasBadge", amount > 0);
            }
        }

        if (playSound) {
            this.root.soundProxy.playUi(SOUNDS.badgeNotification);
        }
        notifications.forEach(([notification, type]) => {
            this.root.hud.signals.notification.dispatch(notification, type);
        });
    }

    onGameSaved() {
        this.saveButton.classList.toggle("animEven");
        this.saveButton.classList.toggle("animOdd");
    }

    startSave() {
        this.root.gameState.doSave();
    }

    openSettings() {
        this.root.hud.parts.settingsMenu.show();
    }

    toggleMusic() {
        const newValue = !this.root.app.settings.getAllSettings().musicMuted;
        this.root.app.settings.updateSetting("musicMuted", newValue);

        this.musicButton.classList.toggle("muted", newValue);
    }

    toggleSfx() {
        const newValue = !this.root.app.settings.getAllSettings().soundsMuted;
        this.root.app.settings.updateSetting("soundsMuted", newValue);
        this.sfxButton.classList.toggle("muted", newValue);
    }
}
