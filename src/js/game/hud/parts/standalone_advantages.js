import { A_B_TESTING_LINK_TYPE, globalConfig, THIRDPARTY_URLS } from "../../../core/config";
import { InputReceiver } from "../../../core/input_receiver";
import { makeDiv } from "../../../core/utils";
import { T } from "../../../translations";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";

const showIntervalSeconds = 9 * 60;

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
            <button class="steamLinkButton ${A_B_TESTING_LINK_TYPE}">
            ${
                globalConfig.currentDiscount && globalConfig.currentDiscount.until > new Date().getTime()
                    ? `<span class='discount'>${globalConfig.currentDiscount.amount}% off!</span>`
                    : ""
            }
            </button>
            <button class="otherCloseButton">${T.ingame.standaloneAdvantages.no_thanks}</button>
            </div>
        `
        );

        this.trackClicks(this.contentDiv.querySelector("button.steamLinkButton"), () => {
            const discount = globalConfig.currentDiscount.active
                ? "_discount" + globalConfig.currentDiscount.amount
                : "";

            this.root.app.analytics.trackUiClick("standalone_advantage_visit_steam");
            this.root.app.platformWrapper.openExternalLink(
                THIRDPARTY_URLS.stanaloneCampaignLink + "/shapez_std_advg" + discount
            );
            this.close();
        });
        this.trackClicks(this.contentDiv.querySelector("button.otherCloseButton"), () => {
            this.root.app.analytics.trackUiClick("standalone_advantage_no_thanks");
            this.close();
        });
    }

    initialize() {
        this.domAttach = new DynamicDomAttach(this.root, this.background, {
            attachClass: "visible",
        });

        this.inputReciever = new InputReceiver("standalone-advantages");
        this.close();

        this.lastShown = -1e10;
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
        if (!this.visible && this.root.time.now() - this.lastShown > showIntervalSeconds) {
            this.show();
        }

        this.domAttach.update(this.visible);
    }
}
