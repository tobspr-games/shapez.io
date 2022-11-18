/* typehints:start */
import type { Application } from "../application";
/* typehints:end */
import { createLogger } from "../core/logging";
import { WEB_STEAM_SSO_AUTHENTICATED } from "../core/steam_sso";
import { T } from "../translations";
const logger = createLogger("setting_types");
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
export class BaseSetting {
    public id = id;
    public categoryId = categoryId;
    public changeCb = changeCb;
    public enabledCb = enabledCb;
    public app: Application = null;
    public element = null;
    public dialogs = null;

        constructor(id, categoryId, changeCb, enabledCb = null) {
    }
        apply(app: Application, value: any) {
        if (this.changeCb) {
            this.changeCb(app, value);
        }
    }
    /**
     * Binds all parameters
     */
    bind(app: Application, element: HTMLElement, dialogs: any) {
        this.app = app;
        this.element = element;
        this.dialogs = dialogs;
    }
    /**
     * Returns the HTML for this setting
     * @abstract
     */
    getHtml(app: Application) {
        abstract;
        return "";
    }
    /**
     * Returns whether this setting is enabled and available
     */
    getIsAvailable(app: Application) {
        return this.enabledCb ? this.enabledCb(app) : true;
    }
    syncValueToElement() {
        abstract;
    }
    /**
     * Attempts to modify the setting
     * @abstract
     */
    modify() {
        abstract;
    }
    /**
     * Shows the dialog that a restart is required
     */
    showRestartRequiredDialog() {
        const { restart } = this.dialogs.showInfo(T.dialogs.restartRequired.title, T.dialogs.restartRequired.text, this.app.platformWrapper.getSupportsRestart() ? ["later:grey", "restart:misc"] : ["ok:good"]);
        if (restart) {
            restart.add(() => this.app.platformWrapper.performRestart());
        }
    }
    /**
     * Validates the set value
     * {}
     * @abstract
     */
    validate(value: any): boolean {
        abstract;
        return false;
    }
}
export class EnumSetting extends BaseSetting {
    public options = options;
    public valueGetter = valueGetter;
    public textGetter = textGetter;
    public descGetter = descGetter || (() => null);
    public restartRequired = restartRequired;
    public iconPrefix = iconPrefix;
    public magicValue = magicValue;

    constructor(id, { options, valueGetter, textGetter, descGetter = null, category, restartRequired = true, iconPrefix = null, changeCb = null, magicValue = null, enabledCb = null, }) {
        super(id, category, changeCb, enabledCb);
    }
        getHtml(app: Application) {
        const available = this.getIsAvailable(app);
        return `
            <div class="setting cardbox ${available ? "enabled" : "disabled"}">
                ${available
            ? ""
            : `<span class="standaloneOnlyHint">${WEB_STEAM_SSO_AUTHENTICATED ? "" : T.demo.settingNotAvailable}</span>`}
                <div class="row">
                    <label>${T.settings.labels[this.id].title}</label>
                    <div class="value enum" data-setting="${this.id}"></div>
                </div>
                <div class="desc">
                    ${T.settings.labels[this.id].description}
                </div>
            </div>`;
    }
    validate(value) {
        if (value === this.magicValue) {
            return true;
        }
        const availableValues = this.options.map(option => this.valueGetter(option));
        if (availableValues.indexOf(value) < 0) {
            logger.error("Value '" + value + "' is not contained in available values:", availableValues, "of", this.id);
            return false;
        }
        return true;
    }
    syncValueToElement() {
        const value = this.app.settings.getSetting(this.id);
        let displayText = "???";
        const matchedInstance = this.options.find(data => this.valueGetter(data) === value);
        if (matchedInstance) {
            displayText = this.textGetter(matchedInstance);
        }
        else {
            logger.warn("Setting value", value, "not found for", this.id, "!");
        }
        this.element.innerText = displayText;
    }
    modify() {
        const { optionSelected } = this.dialogs.showOptionChooser(T.settings.labels[this.id].title, {
            active: this.app.settings.getSetting(this.id),
            options: this.options.map(option => ({
                value: this.valueGetter(option),
                text: this.textGetter(option),
                desc: this.descGetter(option),
                iconPrefix: this.iconPrefix,
            })),
        });
        optionSelected.add(value => {
            this.app.settings.updateSetting(this.id, value);
            this.syncValueToElement();
            if (this.restartRequired) {
                this.showRestartRequiredDialog();
            }
            if (this.changeCb) {
                this.changeCb(this.app, value);
            }
        }, this);
    }
}
export class BoolSetting extends BaseSetting {

    constructor(id, category, changeCb = null, enabledCb = null) {
        super(id, category, changeCb, enabledCb);
    }
        getHtml(app: Application) {
        const available = this.getIsAvailable(app);
        return `
        <div class="setting cardbox ${available ? "enabled" : "disabled"}">
            ${available
            ? ""
            : `<span class="standaloneOnlyHint">${WEB_STEAM_SSO_AUTHENTICATED ? "" : T.demo.settingNotAvailable}</span>`}

            <div class="row">
                <label>${T.settings.labels[this.id].title}</label>
                <div class="value checkbox checked" data-setting="${this.id}">
                <span class="knob"></span>
                </div>
            </div>
            <div class="desc">
                ${T.settings.labels[this.id].description}
            </div>
        </div>`;
    }
    syncValueToElement() {
        const value = this.app.settings.getSetting(this.id);
        this.element.classList.toggle("checked", value);
    }
    modify() {
        const newValue = !this.app.settings.getSetting(this.id);
        this.app.settings.updateSetting(this.id, newValue);
        this.syncValueToElement();
        if (this.changeCb) {
            this.changeCb(this.app, newValue);
        }
    }
    validate(value) {
        return typeof value === "boolean";
    }
}
export class RangeSetting extends BaseSetting {
    public defaultValue = defaultValue;
    public minValue = minValue;
    public maxValue = maxValue;
    public stepSize = stepSize;

    constructor(id, category, changeCb = null, defaultValue = 1.0, minValue = 0, maxValue = 1.0, stepSize = 0.0001, enabledCb = null) {
        super(id, category, changeCb, enabledCb);
    }
        getHtml(app: Application) {
        const available = this.getIsAvailable(app);
        return `
        <div class="setting cardbox ${available ? "enabled" : "disabled"}">
            ${available
            ? ""
            : `<span class="standaloneOnlyHint">${WEB_STEAM_SSO_AUTHENTICATED ? "" : T.demo.settingNotAvailable}</span>`}

            <div class="row">
                <label>${T.settings.labels[this.id].title}</label>
                <div class="value rangeInputContainer noPressEffect" data-setting="${this.id}">
                    <label>${this.defaultValue}</label>
                    <input class="rangeInput" type="range" value="${this.defaultValue}" min="${this.minValue}" max="${this.maxValue}" step="${this.stepSize}">
                </div>
            </div>
            <div class="desc">
                ${T.settings.labels[this.id].description}
            </div>
        </div>`;
    }
    bind(app, element, dialogs) {
        this.app = app;
        this.element = element;
        this.dialogs = dialogs;
        this.getRangeInputElement().addEventListener("input", () => {
            this.updateLabels();
        });
        this.getRangeInputElement().addEventListener("change", () => {
            this.modify();
        });
    }
    syncValueToElement() {
        const value = this.app.settings.getSetting(this.id);
        this.setElementValue(value);
    }
    /**
     * Sets the elements value to the given value
     */
    setElementValue(value: number) {
        const rangeInput = this.getRangeInputElement();
        const rangeLabel = this.element.querySelector("label");
        rangeInput.value = String(value);
        rangeLabel.innerHTML = T.settings.rangeSliderPercentage.replace("<amount>", String(Math.round(value * 100.0)));
    }
    updateLabels() {
        const value = Number(this.getRangeInputElement().value);
        this.setElementValue(value);
    }
    /**
     * {}
     */
    getRangeInputElement(): HTMLInputElement {
        return this.element.querySelector("input.rangeInput");
    }
    modify() {
        const rangeInput = this.getRangeInputElement();
        const newValue = Math.round(Number(rangeInput.value) * 100.0) / 100.0;
        this.app.settings.updateSetting(this.id, newValue);
        this.syncValueToElement();
        console.log("SET", newValue);
        if (this.changeCb) {
            this.changeCb(this.app, newValue);
        }
    }
    validate(value) {
        return typeof value === "number" && value >= this.minValue && value <= this.maxValue;
    }
}
