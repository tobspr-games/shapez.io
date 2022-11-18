import { BaseHUDPart } from "../base_hud_part";
import { makeDiv } from "../../../core/utils";
import { SOUNDS } from "../../../platform/sound";
import { enumNotificationType } from "./notifications";
import { T } from "../../../translations";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { TrackedState } from "../../../core/tracked_state";
export class HUDGameMenu extends BaseHUDPart {
    createElements(parent: any): any {
        this.element = makeDiv(parent, "ingame_HUD_GameMenu");
        const buttons: any = [
            {
                id: "shop",
                label: "Upgrades",
                handler: (): any => this.root.hud.parts.shop.show(),
                keybinding: KEYMAPPINGS.ingame.menuOpenShop,
                badge: (): any => this.root.hubGoals.getAvailableUpgradeCount(),
                notification: [
                    T.ingame.notifications.newUpgrade,
                    enumNotificationType.upgrade,
                ] as [
                    string,
                    enumNotificationType
                ]),
                visible: (): any => !this.root.app.settings.getAllSettings().offerHints || this.root.hubGoals.level >= 3,
            },
            {
                id: "stats",
                label: "Stats",
                handler: (): any => this.root.hud.parts.statistics.show(),
                keybinding: KEYMAPPINGS.ingame.menuOpenStats,
                visible: (): any => !this.root.app.settings.getAllSettings().offerHints || this.root.hubGoals.level >= 3,
            },
        ];
                this.badgesToUpdate = [];
                this.visibilityToUpdate = [];
        buttons.forEach(({ id, label, handler, keybinding, badge, notification, visible }: any): any => {
            const button: any = document.createElement("button");
            button.classList.add(id);
            this.element.appendChild(button);
            this.trackClicks(button, handler);
            if (keybinding) {
                const binding: any = this.root.keyMapper.getBinding(keybinding);
                binding.add(handler);
            }
            if (visible) {
                this.visibilityToUpdate.push({
                    button,
                    condition: visible,
                    domAttach: new DynamicDomAttach(this.root, button),
                });
            }
            if (badge) {
                const badgeElement: any = makeDiv(button, null, ["badge"]);
                this.badgesToUpdate.push({
                    badge,
                    lastRenderAmount: 0,
                    button,
                    badgeElement,
                    notification,
                    condition: visible,
                });
            }
        });
        this.saveButton = makeDiv(this.element, null, ["button", "save", "animEven"]);
        this.settingsButton = makeDiv(this.element, null, ["button", "settings"]);
        this.trackClicks(this.saveButton, this.startSave);
        this.trackClicks(this.settingsButton, this.openSettings);
    }
    initialize(): any {
        this.root.signals.gameSaved.add(this.onGameSaved, this);
        this.trackedIsSaving = new TrackedState(this.onIsSavingChanged, this);
    }
    update(): any {
        let playSound: any = false;
        let notifications: any = new Set();
        // Check whether we are saving
        this.trackedIsSaving.set(!!this.root.gameState.currentSavePromise);
        // Update visibility of buttons
        for (let i: any = 0; i < this.visibilityToUpdate.length; ++i) {
            const { condition, domAttach }: any = this.visibilityToUpdate[i];
            domAttach.update(condition());
        }
        // Check for notifications and badges
        for (let i: any = 0; i < this.badgesToUpdate.length; ++i) {
            const { badge, button, badgeElement, lastRenderAmount, notification, condition, }: any = this.badgesToUpdate[i];
            if (condition && !condition()) {
                // Do not show notifications for invisible buttons
                continue;
            }
            // Check if the amount shown differs from the one shown last frame
            const amount: any = badge();
            if (lastRenderAmount !== amount) {
                if (amount > 0) {
                    badgeElement.innerText = amount;
                }
                // Check if the badge increased, if so play a notification
                if (amount > lastRenderAmount) {
                    playSound = true;
                    if (notification) {
                        notifications.add(notification);
                    }
                }
                // Rerender notifications
                this.badgesToUpdate[i].lastRenderAmount = amount;
                button.classList.toggle("hasBadge", amount > 0);
            }
        }
        if (playSound) {
            this.root.soundProxy.playUi(SOUNDS.badgeNotification);
        }
        notifications.forEach(([notification, type]: any): any => {
            this.root.hud.signals.notification.dispatch(notification, type);
        });
    }
    onIsSavingChanged(isSaving: any): any {
        this.saveButton.classList.toggle("saving", isSaving);
    }
    onGameSaved(): any {
        this.saveButton.classList.toggle("animEven");
        this.saveButton.classList.toggle("animOdd");
    }
    startSave(): any {
        this.root.gameState.doSave();
    }
    openSettings(): any {
        this.root.hud.parts.settingsMenu.show();
    }
}
