/* typehints:start */
import { GameRoot } from "./root";
import { InputReceiver } from "../core/input_receiver";
import { Application } from "../application";
/* typehints:end */

import { Signal, STOP_PROPAGATION } from "../core/signal";
import { IS_MOBILE } from "../core/config";

function key(str) {
    return str.toUpperCase().charCodeAt(0);
}

// TODO: Configurable
export const defaultKeybindings = {
    general: {
        confirm: { keyCode: 13 }, // enter
        back: { keyCode: 27, builtin: true }, // escape
    },

    ingame: {
        map_move_up: { keyCode: key("W") },
        map_move_right: { keyCode: key("D") },
        map_move_down: { keyCode: key("S") },
        map_move_left: { keyCode: key("A") },
        toggle_hud: { keyCode: 113 },

        center_map: { keyCode: 32 },

        menu_open_shop: { keyCode: key("F") },
        menu_open_stats: { keyCode: key("G") },
    },

    toolbar: {
        building_belt: { keyCode: key("1") },
        building_miner: { keyCode: key("2") },
        building_underground_belt: { keyCode: key("3") },
        building_splitter: { keyCode: key("4") },
        building_cutter: { keyCode: key("5") },
        building_rotater: { keyCode: key("6") },
        building_stacker: { keyCode: key("7") },
        building_mixer: { keyCode: key("8") },
        building_painter: { keyCode: key("9") },
        building_trash: { keyCode: key("0") },

        building_abort_placement: { keyCode: key("Q") },

        rotate_while_placing: { keyCode: key("R") },
    },
};

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
            return "TAB";
        case 13:
            return "⏎";
        case 16:
            return "⇪";
        case 17:
            return "CTRL";
        case 18:
            return "ALT";
        case 19:
            return "PAUSE";
        case 20:
            return "CAPS";
        case 27:
            return "ESC";
        case 32:
            return "SPACE";
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
            return "=";
        case 188:
            return ",";
        case 189:
            return "-";
        case 189:
            return ".";
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
     */
    constructor(app, { keyCode, builtin = false }) {
        assert(keyCode && Number.isInteger(keyCode), "Invalid key code: " + keyCode);
        this.app = app;
        this.keyCode = keyCode;
        this.builtin = builtin;

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

        // const overrides = root.app.settings.getKeybindingOverrides();

        for (const category in defaultKeybindings) {
            for (const key in defaultKeybindings[category]) {
                let payload = Object.assign({}, defaultKeybindings[category][key]);
                // if (overrides[key]) {
                //     payload.keyCode = overrides[key];
                // }

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
            if (binding.keyCode === keyCode /* && binding.shift === shift && binding.alt === alt */) {
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
     * @param {string} id
     * @returns {Keybinding}
     */
    getBinding(id) {
        assert(this.keybindings[id], "Keybinding " + id + " not known!");
        return this.keybindings[id];
    }
}
