import { THIRDPARTY_URLS } from "../../../core/config";
import { T } from "../../../translations";
import { BaseHUDPart } from "../base_hud_part";
/**
 * Offers to open the tutorial video after completing a level
 */
export class HUDTutorialVideoOffer extends BaseHUDPart {
    createElements(): any { }
    initialize(): any {
        this.root.hud.signals.unlockNotificationFinished.add((): any => {
            const level: any = this.root.hubGoals.level;
            const tutorialVideoLink: any = THIRDPARTY_URLS.levelTutorialVideos[level];
            if (tutorialVideoLink) {
                const isForeign: any = this.root.app.settings.getLanguage() !== "en";
                const dialogData: any = isForeign
                    ? T.dialogs.tutorialVideoAvailableForeignLanguage
                    : T.dialogs.tutorialVideoAvailable;
                const { ok }: any = this.root.hud.parts.dialogs.showInfo(dialogData.title, dialogData.desc, [
                    "cancel:bad",
                    "ok:good",
                ]);
                ok.add((): any => {
                    this.root.app.platformWrapper.openExternalLink(tutorialVideoLink);
                });
            }
        });
    }
}
