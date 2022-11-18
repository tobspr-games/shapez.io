import { makeDiv } from "../../../core/utils";
import { T } from "../../../translations";
import { BaseHUDPart } from "../base_hud_part";
/** @enum {string} */
export const enumNotificationType: any = {
    saved: "saved",
    upgrade: "upgrade",
    success: "success",
    info: "info",
    warning: "warning",
    error: "error",
};
const notificationDuration: any = 3;
export class HUDNotifications extends BaseHUDPart {
    createElements(parent: any): any {
        this.element = makeDiv(parent, "ingame_HUD_Notifications", [], ``);
    }
    initialize(): any {
        this.root.hud.signals.notification.add(this.internalShowNotification, this);
                this.notificationElements = [];
        // Automatic notifications
        this.root.signals.gameSaved.add((): any => this.internalShowNotification(T.ingame.notifications.gameSaved, enumNotificationType.saved));
    }
        internalShowNotification(message: string, type: enumNotificationType): any {
        const element: any = makeDiv(this.element, null, ["notification", "type-" + type], message);
        element.setAttribute("data-icon", "icons/notification_" + type + ".png");
        this.notificationElements.push({
            element,
            expireAt: this.root.time.realtimeNow() + notificationDuration,
        });
    }
    update(): any {
        const now: any = this.root.time.realtimeNow();
        for (let i: any = 0; i < this.notificationElements.length; ++i) {
            const handle: any = this.notificationElements[i];
            if (handle.expireAt <= now) {
                handle.element.remove();
                this.notificationElements.splice(i, 1);
            }
        }
    }
}
