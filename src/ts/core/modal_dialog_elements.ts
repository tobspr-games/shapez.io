/* typehints:start */
import type { Application } from "../application";
/* typehints:end */
import { Signal, STOP_PROPAGATION } from "./signal";
import { arrayDeleteValue, waitNextFrame } from "./utils";
import { ClickDetector } from "./click_detector";
import { SOUNDS } from "../platform/sound";
import { InputReceiver } from "./input_receiver";
import { FormElement } from "./modal_dialog_forms";
import { globalConfig } from "./config";
import { getStringForKeyCode } from "../game/key_action_mapper";
import { createLogger } from "./logging";
import { T } from "../translations";
/*
 * ***************************************************
 *
 *  LEGACY CODE WARNING
 *
 *  This is old code from yorg3.io and needs to be refactored
 *  @TODO
 *
 * ***************************************************
 */
const kbEnter: any = 13;
const kbCancel: any = 27;
const logger: any = createLogger("dialogs");
/**
 * Basic text based dialog
 */
export class Dialog {
    public app = app;
    public title = title;
    public contentHTML = contentHTML;
    public type = type;
    public buttonIds = buttons;
    public closeButton = closeButton;
    public closeRequested = new Signal();
    public buttonSignals = {};
    public valueChosen = new Signal();
    public timeouts = [];
    public clickDetectors = [];
    public inputReciever = new InputReceiver("dialog-" + this.title);
    public enterHandler = null;
    public escapeHandler = null;
    /**
     *
     * Constructs a new dialog with the given options
     */

    constructor({ app, title, contentHTML, buttons, type = "info", closeButton = false }) {
        for (let i: any = 0; i < buttons.length; ++i) {
            if (G_IS_DEV && globalConfig.debug.disableTimedButtons) {
                this.buttonIds[i] = this.buttonIds[i].replace(":timeout", "");
            }
            const buttonId: any = this.buttonIds[i].split(":")[0];
            this.buttonSignals[buttonId] = new Signal();
        }
        this.inputReciever.keydown.add(this.handleKeydown, this);
    }
    /**
     * Internal keydown handler
     */
    handleKeydown({ keyCode, shift, alt, ctrl }: {
        keyCode: number;
        shift: boolean;
        alt: boolean;
        ctrl: boolean;
    }): any {
        if (keyCode === kbEnter && this.enterHandler) {
            this.internalButtonHandler(this.enterHandler);
            return STOP_PROPAGATION;
        }
        if (keyCode === kbCancel && this.escapeHandler) {
            this.internalButtonHandler(this.escapeHandler);
            return STOP_PROPAGATION;
        }
    }
    internalButtonHandler(id: any, ...payload: any): any {
        this.app.inputMgr.popReciever(this.inputReciever);
        if (id !== "close-button") {
            this.buttonSignals[id].dispatch(...payload);
        }
        this.closeRequested.dispatch();
    }
    createElement(): any {
        const elem: any = document.createElement("div");
        elem.classList.add("ingameDialog");
        this.dialogElem = document.createElement("div");
        this.dialogElem.classList.add("dialogInner");
        if (this.type) {
            this.dialogElem.classList.add(this.type);
        }
        elem.appendChild(this.dialogElem);
        const title: any = document.createElement("h1");
        title.innerText = this.title;
        title.classList.add("title");
        this.dialogElem.appendChild(title);
        if (this.closeButton) {
            this.dialogElem.classList.add("hasCloseButton");
            const closeBtn: any = document.createElement("button");
            closeBtn.classList.add("closeButton");
            this.trackClicks(closeBtn, (): any => this.internalButtonHandler("close-button"), {
                applyCssClass: "pressedSmallElement",
            });
            title.appendChild(closeBtn);
            this.inputReciever.backButton.add((): any => this.internalButtonHandler("close-button"));
        }
        const content: any = document.createElement("div");
        content.classList.add("content");
        content.innerHTML = this.contentHTML;
        this.dialogElem.appendChild(content);
        if (this.buttonIds.length > 0) {
            const buttons: any = document.createElement("div");
            buttons.classList.add("buttons");
            // Create buttons
            for (let i: any = 0; i < this.buttonIds.length; ++i) {
                const [buttonId, buttonStyle, rawParams]: any = this.buttonIds[i].split(":");
                const button: any = document.createElement("button");
                button.classList.add("button");
                button.classList.add("styledButton");
                button.classList.add(buttonStyle);
                button.innerText = T.dialogs.buttons[buttonId];
                const params: any = (rawParams || "").split("/");
                const useTimeout: any = params.indexOf("timeout") >= 0;
                const isEnter: any = params.indexOf("enter") >= 0;
                const isEscape: any = params.indexOf("escape") >= 0;
                if (isEscape && this.closeButton) {
                    logger.warn("Showing dialog with close button, and additional cancel button");
                }
                if (useTimeout) {
                    button.classList.add("timedButton");
                    const timeout: any = setTimeout((): any => {
                        button.classList.remove("timedButton");
                        arrayDeleteValue(this.timeouts, timeout);
                    }, 1000);
                    this.timeouts.push(timeout);
                }
                if (isEnter || isEscape) {
                    // if (this.app.settings.getShowKeyboardShortcuts()) {
                    // Show keybinding
                    const spacer: any = document.createElement("code");
                    spacer.classList.add("keybinding");
                    spacer.innerHTML = getStringForKeyCode(isEnter ? kbEnter : kbCancel);
                    button.appendChild(spacer);
                    // }
                    if (isEnter) {
                        this.enterHandler = buttonId;
                    }
                    if (isEscape) {
                        this.escapeHandler = buttonId;
                    }
                }
                this.trackClicks(button, (): any => this.internalButtonHandler(buttonId));
                buttons.appendChild(button);
            }
            this.dialogElem.appendChild(buttons);
        }
        else {
            this.dialogElem.classList.add("buttonless");
        }
        this.element = elem;
        this.app.inputMgr.pushReciever(this.inputReciever);
        return this.element;
    }
    setIndex(index: any): any {
        this.element.style.zIndex = index;
    }
    destroy(): any {
        if (!this.element) {
            assert(false, "Tried to destroy dialog twice");
            return;
        }
        // We need to do this here, because if the backbutton event gets
        // dispatched to the modal dialogs, it will not call the internalButtonHandler,
        // and thus our receiver stays attached the whole time
        this.app.inputMgr.destroyReceiver(this.inputReciever);
        for (let i: any = 0; i < this.clickDetectors.length; ++i) {
            this.clickDetectors[i].cleanup();
        }
        this.clickDetectors = [];
        this.element.remove();
        this.element = null;
        for (let i: any = 0; i < this.timeouts.length; ++i) {
            clearTimeout(this.timeouts[i]);
        }
        this.timeouts = [];
    }
    hide(): any {
        this.element.classList.remove("visible");
    }
    show(): any {
        this.element.classList.add("visible");
    }
    /**
     * Helper method to track clicks on an element
     * {}
     */
    trackClicks(elem: Element, handler: function():void, args: import("./click_detector").ClickDetectorConstructorArgs= = {}): ClickDetector {
        const detector: any = new ClickDetector(elem, args);
        detector.click.add(handler, this);
        this.clickDetectors.push(detector);
        return detector;
    }
}
/**
 * Dialog which simply shows a loading spinner
 */
export class DialogLoading extends Dialog {
    public text = text;

    constructor(app, text = "") {
        super({
            app,
            title: "",
            contentHTML: "",
            buttons: [],
            type: "loading",
        });
        // Loading dialog can not get closed with back button
        this.inputReciever.backButton.removeAll();
        this.inputReciever.context = "dialog-loading";
    }
    createElement(): any {
        const elem: any = document.createElement("div");
        elem.classList.add("ingameDialog");
        elem.classList.add("loadingDialog");
        this.element = elem;
        if (this.text) {
            const text: any = document.createElement("div");
            text.classList.add("text");
            text.innerText = this.text;
            elem.appendChild(text);
        }
        const loader: any = document.createElement("div");
        loader.classList.add("prefab_LoadingTextWithAnim");
        loader.classList.add("loadingIndicator");
        elem.appendChild(loader);
        this.app.inputMgr.pushReciever(this.inputReciever);
        return elem;
    }
}
export class DialogOptionChooser extends Dialog {
    public options = options;
    public initialOption = options.active;

    constructor({ app, title, options }) {
        let html: any = "<div class='optionParent'>";
        options.options.forEach(({ value, text, desc = null, iconPrefix = null }: any): any => {
            const descHtml: any = desc ? `<span class="desc">${desc}</span>` : "";
            let iconHtml: any = iconPrefix ? `<span class="icon icon-${iconPrefix}-${value}"></span>` : "";
            html += `
                <div class='option ${value === options.active ? "active" : ""} ${iconPrefix ? "hasIcon" : ""}' data-optionvalue='${value}'>
                    ${iconHtml}
                    <span class='title'>${text}</span>
                    ${descHtml}
                </div>
                `;
        });
        html += "</div>";
        super({
            app,
            title,
            contentHTML: html,
            buttons: [],
            type: "info",
            closeButton: true,
        });
        this.buttonSignals.optionSelected = new Signal();
    }
    createElement(): any {
        const div: any = super.createElement();
        this.dialogElem.classList.add("optionChooserDialog");
        div.querySelectorAll("[data-optionvalue]").forEach((handle: any): any => {
            const value: any = handle.getAttribute("data-optionvalue");
            if (!handle) {
                logger.error("Failed to bind option value in dialog:", value);
                return;
            }
            // Need click detector here to forward elements, otherwise scrolling does not work
            const detector: any = new ClickDetector(handle, {
                consumeEvents: false,
                preventDefault: false,
                clickSound: null,
                applyCssClass: "pressedOption",
                targetOnly: true,
            });
            this.clickDetectors.push(detector);
            if (value !== this.initialOption) {
                detector.click.add((): any => {
                    const selected: any = div.querySelector(".option.active");
                    if (selected) {
                        selected.classList.remove("active");
                    }
                    else {
                        logger.warn("No selected option");
                    }
                    handle.classList.add("active");
                    this.app.sound.playUiSound(SOUNDS.uiClick);
                    this.internalButtonHandler("optionSelected", value);
                });
            }
        });
        return div;
    }
}
export class DialogWithForm extends Dialog {
    public confirmButtonId = confirmButtonId;
    public formElements = formElements;
    public enterHandler = confirmButtonId;

        constructor({ app, title, desc, formElements, buttons = ["cancel", "ok:good"], confirmButtonId = "ok", closeButton = true, }) {
        let html: any = "";
        html += desc + "<br>";
        for (let i: any = 0; i < formElements.length; ++i) {
            html += formElements[i].getHtml();
        }
        super({
            app,
            title: title,
            contentHTML: html,
            buttons: buttons,
            type: "info",
            closeButton,
        });
    }
    internalButtonHandler(id: any, ...payload: any): any {
        if (id === this.confirmButtonId) {
            if (this.hasAnyInvalid()) {
                this.dialogElem.classList.remove("errorShake");
                waitNextFrame().then((): any => {
                    if (this.dialogElem) {
                        this.dialogElem.classList.add("errorShake");
                    }
                });
                this.app.sound.playUiSound(SOUNDS.uiError);
                return;
            }
        }
        super.internalButtonHandler(id, payload);
    }
    hasAnyInvalid(): any {
        for (let i: any = 0; i < this.formElements.length; ++i) {
            if (!this.formElements[i].isValid()) {
                return true;
            }
        }
        return false;
    }
    createElement(): any {
        const div: any = super.createElement();
        for (let i: any = 0; i < this.formElements.length; ++i) {
            const elem: any = this.formElements[i];
            elem.bindEvents(div, this.clickDetectors);
            // elem.valueChosen.add(this.closeRequested.dispatch, this.closeRequested);
            elem.valueChosen.add(this.valueChosen.dispatch, this.valueChosen);
        }
        waitNextFrame().then((): any => {
            this.formElements[this.formElements.length - 1].focus();
        });
        return div;
    }
}
