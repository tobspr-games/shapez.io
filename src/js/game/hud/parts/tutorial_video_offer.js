import { THIRDPARTY_URLS } from "../../../core/config";
import { T } from "../../../translations";
import { BaseHUDPart } from "../base_hud_part";

/**
 * Offers to open the tutorial video after completing a level
 */
export class HUDTutorialVideoOffer extends BaseHUDPart {
    createElements() {}

    initialize() {
        this.root.hud.signals.unlockNotificationFinished.add(() => {
            const level = this.root.hubGoals.level;
            const tutorialVideoLink = THIRDPARTY_URLS.levelTutorialVideos[level];
            if (tutorialVideoLink) {
                const isForeign = this.root.app.settings.getLanguage() !== "en";
                const dialogData = isForeign
                    ? T.dialogs.tutorialVideoAvailableForeignLanguage
                    : T.dialogs.tutorialVideoAvailable;

                const { ok } = this.root.hud.parts.dialogs.showInfo(dialogData.title, dialogData.desc, [
                    "cancel:bad",
                    "ok:good",
                ]);

                this.root.app.analytics.trackUiClick("ingame_video_link_show_" + level);
                ok.add(() => {
                    this.root.app.platformWrapper.openExternalLink(tutorialVideoLink);
                    this.root.app.analytics.trackUiClick("ingame_video_link_open_" + level);
                });
            }
        });
    }
}
