import { BaseHUDPart } from "../base_hud_part";
import { T } from "../../../translations";
import { THIRDPARTY_URLS } from "../../../core/config";

// How often to show the dialog
const DIALOG_INTERVAL = 30;

// When to start showing the dialogs
const DIALOG_START_INTERVAL = 15;

export class HUDStandaloneReminder extends BaseHUDPart {
    initialize() {
        this.lastMinutesHintShown = DIALOG_START_INTERVAL - DIALOG_INTERVAL;
    }

    getMinutesPlayed() {
        return Math.floor(this.root.time.now() / 60.0);
    }

    showHint() {
        this.root.app.analytics.trackUiClick("demonotice_show");
        const { getStandalone } = this.root.hud.parts.dialogs.showWarning(
            T.dialogs.buyFullVersion.title,
            T.dialogs.buyFullVersion.desc.replace("<minutes>", "" + this.getMinutesPlayed()),
            ["later:bad:timeoutSlow", "getStandalone:good"]
        );
        getStandalone.add(() => {
            this.root.app.analytics.trackUiClick("demonotice_click");
            this.root.app.platformWrapper.openExternalLink(THIRDPARTY_URLS.standaloneStorePage);
        });
    }

    update() {
        const minutesPlayed = this.getMinutesPlayed();
        if (this.lastMinutesHintShown + DIALOG_INTERVAL < minutesPlayed) {
            this.lastMinutesHintShown = minutesPlayed;
            this.showHint();
        }
    }
}
