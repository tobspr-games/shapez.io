import { BaseHUDPart } from "../base_hud_part";
import { makeDiv } from "../../../core/utils";
import { cachebust } from "../../../core/cachebust";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { InputReceiver } from "../../../core/input_receiver";
import { KeyActionMapper, KEYMAPPINGS } from "../../key_action_mapper";
import { tutorialGoals } from "../../tutorial_goals";
import { TrackedState } from "../../../core/tracked_state";

const maxTutorialVideo = 2;

export class HUDPartTutorialHints extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(
            parent,
            "ingame_HUD_TutorialHints",
            [],
            `
        <div class="header">
            No idea what to do?
            <button class="styledButton toggleHint">
                <span class="show">Show hint</span>
                <span class="hide">Hide hint</span>
            </button>
        </div>

        <video autoplay muted loop class="fullscreenBackgroundVideo">
            <source type="video/webm">
        </video>
        `
        );

        this.videoElement = this.element.querySelector("video");
    }

    shouldPauseGame() {
        return this.enlarged;
    }

    initialize() {
        this.trackClicks(this.element.querySelector(".toggleHint"), this.toggleHintEnlarged);

        this.videoAttach = new DynamicDomAttach(this.root, this.videoElement, {
            timeToKeepSeconds: 0.3,
        });

        this.videoAttach.update(false);
        this.enlarged = false;

        this.inputReciever = new InputReceiver("tutorial_hints");
        this.keyActionMapper = new KeyActionMapper(this.root, this.inputReciever);
        this.keyActionMapper.getBinding(KEYMAPPINGS.general.back).add(this.close, this);

        this.domAttach = new DynamicDomAttach(this.root, this.element);

        this.currentShownLevel = new TrackedState(this.updateVideoUrl, this);
    }

    updateVideoUrl(level) {
        console.log("update video url.", level);
        this.videoElement
            .querySelector("source")
            .setAttribute("src", cachebust("res/videos/level_" + level + ".webm"));
    }

    close() {
        this.enlarged = false;
        document.body.classList.remove("ingameDialogOpen");
        this.element.classList.remove("enlarged", "noBlur");
        this.root.app.inputMgr.makeSureDetached(this.inputReciever);
        this.update();
    }

    show() {
        document.body.classList.add("ingameDialogOpen");
        this.element.classList.add("enlarged", "noBlur");
        this.enlarged = true;
        this.root.app.inputMgr.makeSureAttachedAndOnTop(this.inputReciever);
        this.update();

        this.videoElement.currentTime = 0;
        this.videoElement.play();
    }

    update() {
        this.videoAttach.update(this.enlarged);

        this.currentShownLevel.set(this.root.hubGoals.level);

        const tutorialVisible = this.root.hubGoals.level <= maxTutorialVideo;
        this.domAttach.update(tutorialVisible);
    }

    toggleHintEnlarged() {
        if (this.enlarged) {
            this.close();
        } else {
            this.show();
        }
    }
}
