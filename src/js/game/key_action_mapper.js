/* typehints:start */
import { GameRoot } from "./root";
import { InputReceiver } from "../core/input_receiver";
import { Application } from "../application";
/* typehints:end */

import { Signal, STOP_PROPAGATION } from "../core/signal";
import { IS_MOBILE } from "../core/config";
import { T } from "../translations";
import { JSON_stringify } from "../core/builtins";

function key(str) {
    return str.toUpperCase().charCodeAt(0);
}

export const KEYMAPPINGS = {
    general: {
        confirm: { keyCode: 13 }, // enter
        back: { keyCode: 27, builtin: true }, // escape
    },

    ingame: {
        mapMoveUp: { keyCode: key("W") },
        mapMoveRight: { keyCode: key("D") },
        mapMoveDown: { keyCode: key("S") },
        mapMoveLeft: { keyCode: key("A") },

        centerMap: { keyCode: 32 },

        menuOpenShop: { keyCode: key("F") },
        menuOpenStats: { keyCode: key("G") },
        menuOpenWaypoints: { keyCode: key("H") },

        toggleHud: { keyCode: 113 }, // F2
        toggleFPSInfo: { keyCode: 115 }, // F1

        mapZoomIn: { keyCode: 187, repeated: true }, // "+"
        mapZoomOut: { keyCode: 189, repeated: true }, // "-"
    },

    buildings: {
        belt: { keyCode: key("1") },
        splitter: { keyCode: key("2") },
        underground_belt: { keyCode: key("3") },
        miner: { keyCode: key("4") },
        cutter: { keyCode: key("5") },
        rotater: { keyCode: key("6") },
        stacker: { keyCode: key("7") },
        mixer: { keyCode: key("8") },
        painter: { keyCode: key("9") },
        trash: { keyCode: key("0") },
    },

    placement: {
        abortBuildingPlacement: { keyCode: key("Q") },
        rotateWhilePlacing: { keyCode: key("R") },
        cycleBuildingVariants: { keyCode: key("T") },
        cycleBuildings: { keyCode: 9 }, // TAB
    },

    massSelect: {
        massSelectStart: { keyCode: 17, builtin: true }, // CTRL
        massSelectSelectMultiple: { keyCode: 16, builtin: true }, // SHIFT
        confirmMassDelete: { keyCode: key("X") },
    },

    placementModifiers: {
        placementDisableAutoOrientation: { keyCode: 17, builtin: true }, // CTRL
        placeMultiple: { keyCode: 16, builtin: true }, // SHIFT
        placeInverse: { keyCode: 18, builtin: true }, // ALT
    },
};

// Assign ids
for (const categoryId in KEYMAPPINGS) {
    for (const mappingId in KEYMAPPINGS[categoryId]) {
        KEYMAPPINGS[categoryId][mappingId].id = mappingId;
    }
}

/**
 * Returns a keycode -> string
 * @param {number} code
 * @returns {string}
 */
export function getStringForKeyCode(code) {
    switch (code) {
        case 8:
            return "⌫";
        case 9:
            return T.global.keys.tab;
        case 13:
            return "⏎";
        case 16:
            return "⇪";
        case 17:
            return T.global.keys.control;
        case 18:
            return T.global.keys.alt;
        case 19:
            return "PAUSE";
        case 20:
            return "CAPS";
        case 27:
            return T.global.keys.escape;
        case 32:
            return T.global.keys.space;
        case 33:
            return "PGUP";
        case 34:
            return "PGDOWN";
        case 35:
            return "END";
        case 36:
            return "HOME";
        case 37:
            return "⬅";
        case 38:
            return "⬆";
        case 39:
            return "➡";
        case 40:
            return "⬇";
        case 44:
            return "PRNT";
        case 45:
            return "INS";
        case 46:
            return "DEL";
        case 93:
            return "SEL";
        case 96:
            return "NUM 0";
        case 97:
            return "NUM 1";
        case 98:
            return "NUM 2";
        case 99:
            return "NUM 3";
        case 100:
            return "NUM 4";
        case 101:
            return "NUM 5";
        case 102:
            return "NUM 6";
        case 103:
            return "NUM 7";
        case 104:
            return "NUM 8";
        case 105:
            return "NUM 9";
        case 106:
            return "*";
        case 107:
            return "+";
        case 109:
            return "-";
        case 110:
            return ".";
        case 111:
            return "/";
        case 112:
            return "F1";
        case 113:
            return "F2";
        case 114:
            return "F3";
        case 115:
            return "F4";
        case 116:
            return "F4";
        case 117:
            return "F5";
        case 118:
            return "F6";
        case 119:
            return "F7";
        case 120:
            return "F8";
        case 121:
            return "F9";
        case 122:
            return "F10";
        case 123:
            return "F11";
        case 124:
            return "F12";

        case 144:
            return "NUMLOCK";
        case 145:
            return "SCRLOCK";
        case 182:
            return "COMP";
        case 183:
            return "CALC";
        case 186:
            return ";";
        case 187:
            return "+";
        case 188:
            return ",";
        case 189:
            return "-";
        case 191:
            return "/";
        case 219:
            return "[";
        case 220:
            return "\\";
        case 221:
            return "]";
        case 222:
            return "'";
    }

    // TODO
    return String.fromCharCode(code);
}

export class Keybinding {
    /**
     *
     * @param {Application} app
     * @param {object} param0
     * @param {number} param0.keyCode
     * @param {boolean=} param0.builtin
     * @param {boolean=} param0.repeated
     */
    constructor(app, { keyCode, builtin = false, repeated = false }) {
        assert(keyCode && Number.isInteger(keyCode), "Invalid key code: " + keyCode);
        this.app = app;
        this.keyCode = keyCode;
        this.builtin = builtin;
        this.repeated = repeated;

        this.currentlyDown = false;

        this.signal = new Signal();
        this.toggled = new Signal();
    }

    /**
     * Adds an event listener
     * @param {function() : void} receiver
     * @param {object=} scope
     */
    add(receiver, scope = null) {
        this.signal.add(receiver, scope);
    }

    /**
     * @param {Element} elem
     * @returns {HTMLElement} the created element, or null if the keybindings are not shown
     *  */
    appendLabelToElement(elem) {
        if (IS_MOBILE) {
            return null;
        }
        const spacer = document.createElement("code");
        spacer.classList.add("keybinding");
        spacer.innerHTML = getStringForKeyCode(this.keyCode);
        elem.appendChild(spacer);
        return spacer;
    }

    /**
     * Returns the key code as a nice string
     */
    getKeyCodeString() {
        return getStringForKeyCode(this.keyCode);
    }

    /**
     * Remvoes all signal receivers
     */
    clearSignalReceivers() {
        this.signal.removeAll();
    }
}

export class KeyActionMapper {
    /**
     *
     * @param {GameRoot} root
     * @param {InputReceiver} inputReciever
     */
    constructor(root, inputReciever) {
        this.root = root;
        inputReciever.keydown.add(this.handleKeydown, this);
        inputReciever.keyup.add(this.handleKeyup, this);

        /** @type {Object.<string, Keybinding>} */
        this.keybindings = {};

        const overrides = root.app.settings.getKeybindingOverrides();

        for (const category in KEYMAPPINGS) {
            for (const key in KEYMAPPINGS[category]) {
                let payload = Object.assign({}, KEYMAPPINGS[category][key]);
                if (overrides[key]) {
                    payload.keyCode = overrides[key];
                }

                this.keybindings[key] = new Keybinding(this.root.app, payload);
            }
        }

        inputReciever.pageBlur.add(this.onPageBlur, this);
        inputReciever.destroyed.add(this.cleanup, this);
    }

    /**
     * Returns all keybindings starting with the given id
     * @param {string} pattern
     * @returns {Array<Keybinding>}
     */
    getKeybindingsStartingWith(pattern) {
        let result = [];
        for (const key in this.keybindings) {
            if (key.startsWith(pattern)) {
                result.push(this.keybindings[key]);
            }
        }
        return result;
    }

    /**
     * Forwards the given events to the other mapper (used in tooltips)
     * @param {KeyActionMapper} receiver
     * @param {Array<string>} bindings
     */
    forward(receiver, bindings) {
        for (let i = 0; i < bindings.length; ++i) {
            const key = bindings[i];
            this.keybindings[key].signal.add((...args) => receiver.keybindings[key].signal.dispatch(...args));
        }
    }

    cleanup() {
        for (const key in this.keybindings) {
            this.keybindings[key].signal.removeAll();
        }
    }

    onPageBlur() {
        // Reset all down states
        // Find mapping
        for (const key in this.keybindings) {
            /** @type {Keybinding} */
            const binding = this.keybindings[key];
            binding.currentlyDown = false;
        }
    }

    /**
     * Internal keydown handler
     * @param {object} param0
     * @param {number} param0.keyCode
     * @param {boolean} param0.shift
     * @param {boolean} param0.alt
     */
    handleKeydown({ keyCode, shift, alt }) {
        let stop = false;

        // Find mapping
        for (const key in this.keybindings) {
            /** @type {Keybinding} */
            const binding = this.keybindings[key];
            if (binding.keyCode === keyCode && (!binding.currentlyDown || binding.repeated)) {
                binding.currentlyDown = true;

                /** @type {Signal} */
                const signal = this.keybindings[key].signal;
                if (signal.dispatch() === STOP_PROPAGATION) {
                    return;
                }
            }
        }

        if (stop) {
            return STOP_PROPAGATION;
        }
    }

    /**
     * Internal keyup handler
     * @param {object} param0
     * @param {number} param0.keyCode
     * @param {boolean} param0.shift
     * @param {boolean} param0.alt
     */
    handleKeyup({ keyCode, shift, alt }) {
        for (const key in this.keybindings) {
            /** @type {Keybinding} */
            const binding = this.keybindings[key];
            if (binding.keyCode === keyCode) {
                binding.currentlyDown = false;
            }
        }
    }

    /**
     * Returns a given keybinding
     * @param {{ keyCode: number }} binding
     * @returns {Keybinding}
     */
    getBinding(binding) {
        // @ts-ignore
        const id = binding.id;
        assert(id, "Not a valid keybinding: " + JSON_stringify(binding));
        assert(this.keybindings[id], "Keybinding " + id + " not known!");
        return this.keybindings[id];
    }
}
