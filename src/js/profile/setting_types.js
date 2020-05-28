/* typehints:start */
import { Application } from "../application";
/* typehints:end */

import { createLogger } from "../core/logging";
import { T } from "../translations";

const logger = createLogger("setting_types");

const standaloneOnlySettingHtml = `<span class="standaloneOnlyHint">${T.demo.settingNotAvailable}</span>`;

export class BaseSetting {
    /**
     *
     * @param {string} id
     * @param {string} categoryId
     * @param {function(Application, any):void} changeCb
     * @param {boolean} enabled
     */
    constructor(id, categoryId, changeCb, enabled) {
        this.id = id;
        this.categoryId = categoryId;
        this.changeCb = changeCb;
        this.enabled = enabled;

        /** @type {Application} */
        this.app = null;

        this.element = null;
        this.dialogs = null;
    }

    /**
     * @param {Application} app
     * @param {any} value
     */
    apply(app, value) {
        if (this.changeCb) {
            this.changeCb(app, value);
        }
    }

    /**
     * @param {Application} app
     * @param {Element} element
     * @param {any} dialogs
     */
    bind(app, element, dialogs) {
        this.app = app;
        this.element = element;
        this.dialogs = dialogs;
    }

    getHtml() {
        abstract;
        return "";
    }

    syncValueToElement() {
        abstract;
    }

    modify() {
        abstract;
    }

    showRestartRequiredDialog() {
        const { restart } = this.dialogs.showInfo(
            T.dialogs.restartRequired.title,
            T.dialogs.restartRequired.text,
            this.app.platformWrapper.getSupportsRestart() ? ["later:grey", "restart:misc"] : ["ok:good"]
        );
        if (restart) {
            restart.add(() => this.app.platformWrapper.performRestart());
        }
    }

    /**
     * @param {any} value
     * @returns {boolean}
     */
    validate(value) {
        abstract;
        return false;
    }
}

export class EnumSetting extends BaseSetting {
    constructor(
        id,
        {
            options,
            valueGetter,
            textGetter,
            descGetter = null,
            category,
            restartRequired = true,
            iconPrefix = null,
            changeCb = null,
            magicValue = null,
            enabled = true,
        }
    ) {
        super(id, category, changeCb, enabled);

        this.options = options;
        this.valueGetter = valueGetter;
        this.textGetter = textGetter;
        this.descGetter = descGetter || (() => null);
        this.restartRequired = restartRequired;
        this.iconPrefix = iconPrefix;
        this.magicValue = magicValue;
    }

    getHtml() {
        return `
            <div class="setting cardbox ${this.enabled ? "enabled" : "disabled"}">
                ${this.enabled ? "" : standaloneOnlySettingHtml}
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
            logger.error(
                "Value '" + value + "' is not contained in available values:",
                availableValues,
                "of",
                this.id
            );
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
        } else {
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
    constructor(id, category, changeCb = null, enabled = true) {
        super(id, category, changeCb, enabled);
    }

    getHtml() {
        const label = T.settings.labels[this.id] || {title : this.id};
        return `
        <div class="setting cardbox ${this.enabled ? "enabled" : "disabled"}">
            ${this.enabled ? "" : standaloneOnlySettingHtml}
                
            <div class="row">
                <label>${label.title}</label>
                <div class="value checkbox checked" data-setting="${this.id}">
                <span class="knob"></span>
                </div>
            </div>
            <div class="desc">
                ${label.description}
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
