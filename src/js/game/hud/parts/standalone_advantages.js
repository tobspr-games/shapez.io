import { globalConfig, openStandaloneLink } from "../../../core/config";
import { InputReceiver } from "../../../core/input_receiver";
import { makeDiv } from "../../../core/utils";
import { T } from "../../../translations";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";

export class HUDStandaloneAdvantages extends BaseHUDPart {
    createElements(parent) {
        this.background = makeDiv(parent, "ingame_HUD_StandaloneAdvantages", ["ingameDialog"]);

        // DIALOG Inner / Wrapper
        this.dialogInner = makeDiv(this.background, null, ["dialogInner"]);
        this.title = makeDiv(this.dialogInner, null, ["title"], T.ingame.standaloneAdvantages.title);
        this.contentDiv = makeDiv(
            this.dialogInner,
            null,
            ["content"],
            `
            <div class="points">
                ${Object.entries(T.ingame.standaloneAdvantages.points)
                    .map(
                        ([key, trans]) => `
                <div class="point ${key}">
                    <strong>${trans.title}</strong>
                    <p>${trans.desc}</p>
                </div>`
                    )
                    .join("")}

            </div>

            <div class="lowerBar">
            <div class="playtimeDisclaimer">${T.demoBanners.playtimeDisclaimer}</div>
            <button class="steamLinkButton steam_dlbtn_0">
            ${
                globalConfig.currentDiscount > 0
                    ? `<span class='discount'>-${globalConfig.currentDiscount}%!</span>`
                    : ""
            }
            </button>
            <button class="otherCloseButton" data-btn-variant="${G_IS_STEAM_DEMO ? "steam-demo" : "prod"}">${
                T.ingame.standaloneAdvantages.no_thanks
            }</button>
            </div>
        `
        );

        this.trackClicks(this.contentDiv.querySelector("button.steamLinkButton"), () => {
            openStandaloneLink(this.root.app, "shapez_std_advg");
            this.close();
        });
        this.trackClicks(this.contentDiv.querySelector("button.otherCloseButton"), () => {
            this.close();
        });
    }

    get showIntervalSeconds() {
        if (G_IS_STANDALONE) {
            return 20 * 60;
        }
        return 15 * 60;
    }

    initialize() {
        this.domAttach = new DynamicDomAttach(this.root, this.background, {
            attachClass: "visible",
        });

        this.inputReciever = new InputReceiver("standalone-advantages");
        this.close();

        // On standalone, show popup instant - but don't do so on web
        if (G_IS_STEAM_DEMO) {
            // show instant
            this.lastShown = -1e10;
        } else {
            // wait for next interval
            this.lastShown = 0;
        }
    }

    show() {
        this.lastShown = this.root.time.now();
        this.visible = true;
        this.root.app.inputMgr.makeSureAttachedAndOnTop(this.inputReciever);
    }

    close() {
        this.visible = false;
        this.root.app.inputMgr.makeSureDetached(this.inputReciever);
        this.update();
    }

    update() {
        if (!this.visible && this.root.time.now() - this.lastShown > this.showIntervalSeconds) {
            this.show();
        }

        this.domAttach.update(this.visible);
    }
}
