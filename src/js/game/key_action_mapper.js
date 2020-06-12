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
        confirm: { keyCodes: [13] }, // enter
        back: { keyCodes: [27], builtin: true }, // escape
    },

    ingame: {
        menuOpenShop: { keyCodes: [key("F")] },
        menuOpenStats: { keyCodes: [key("G")] },

        toggleHud: { keyCodes: [113] }, // F2
        exportScreenshot: { keyCodes: [114] }, // F3
        toggleFPSInfo: { keyCodes: [115] }, // F4
    },

    navigation: {
        mapMoveUp: { keyCodes: [key("W")] },
        mapMoveRight: { keyCodes: [key("D")] },
        mapMoveDown: { keyCodes: [key("S")] },
        mapMoveLeft: { keyCodes: [key("A")] },
        mapMoveFaster: { keyCodes: [16] }, //shift

        centerMap: { keyCodes: [32] }, // SPACE
        mapZoomIn: { keyCodes: [187], repeated: true }, // "+"
        mapZoomOut: { keyCodes: [189], repeated: true }, // "-"

        createMarker: { keyCodes: [key("M")] },
    },

    buildings: {
        belt: { keyCodes: [key("1")] },
        splitter: { keyCodes: [key("2")] },
        underground_belt: { keyCodes: [key("3")] },
        miner: { keyCodes: [key("4")] },
        cutter: { keyCodes: [key("5")] },
        rotater: { keyCodes: [key("6")] },
        stacker: { keyCodes: [key("7")] },
        mixer: { keyCodes: [key("8")] },
        painter: { keyCodes: [key("9")] },
        trash: { keyCodes: [key("0")] },
    },

    placement: {
        abortBuildingPlacement: { keyCodes: [key("Q")] },
        rotateWhilePlacing: { keyCodes: [key("R")] },
        rotateInverseModifier: { keyCodes: [16] }, // SHIFT
        cycleBuildingVariants: { keyCodes: [key("T")] },
        cycleBuildings: { keyCodes: [9] }, // TAB
        switchDirectionLockSide: { keyCodes: [key("R")] },
    },

    massSelect: {
        massSelectStart: { keyCodes: [17] }, // CTRL
        massSelectSelectMultiple: { keyCodes: [16] }, // SHIFT
        massSelectCopy: { keyCodes: [key("C")] },
        massSelectCut: { keyCodes: [key("X")] },
        confirmMassDelete: { keyCodes: [46] }, // DEL
        pasteLastBlueprint: { keyCodes: [key("V")] },
    },

    placementModifiers: {
        lockBeltDirection: { keyCodes: [16] }, // SHIFT
        placementDisableAutoOrientation: { keyCodes: [17] }, // CTRL
        placeMultiple: { keyCodes: [16] }, // SHIFT
        placeInverse: { keyCodes: [18] }, // ALT
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
        case 1:
            return "LMB";
        case 2:
            return "MMB";
        case 3:
            return "RMB";
        case 4:
            return "MB4";
        case 5:
            return "MB5";
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
     * @param {KeyActionMapper} keyMapper
     * @param {Application} app
     * @param {object} param0
     * @param {number[]} param0.keyCodes
     * @param {boolean=} param0.builtin
     * @param {boolean=} param0.repeated
     */
    constructor(keyMapper, app, { keyCodes, builtin = false, repeated = false }) {
        for (let keyCode of keyCodes) {
            assert(Number.isInteger(keyCode), "Invalid key code: " + keyCode);
        }
        this.keyMapper = keyMapper;
        this.app = app;
        this.keyCodes = keyCodes;
        this.builtin = builtin;
        this.repeated = repeated;

        this.signal = new Signal();
        this.toggled = new Signal();
    }

    /**
     * Returns whether this binding is currently pressed
     * @returns {boolean}
     */
    get pressed() {
        // Check if the key is down
        for (let keyCode of this.keyCodes) {
            if (this.app.inputMgr.keysDown.has(keyCode)) {
                // Check if it is the top reciever
                const reciever = this.keyMapper.inputReceiver;
                return this.app.inputMgr.getTopReciever() === reciever;
            }
        }
        return false;
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
        spacer.innerHTML = getStringForKeyCode(this.keyCodes[0]);
        elem.appendChild(spacer);
        return spacer;
    }

    /**
     * Returns the key code as a nice string
     * @param {number} index
     */
    getKeyCodeString(index = 0) {
        return getStringForKeyCode(this.keyCodes[index] || 0);
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
        this.inputReceiver = inputReciever;

        inputReciever.keydown.add(this.handleKeydown, this);
        inputReciever.keyup.add(this.handleKeyup, this);

        /** @type {Object.<string, Keybinding>} */
        this.keybindings = {};

        const overrides = root.app.settings.getKeybindingOverrides();

        for (const category in KEYMAPPINGS) {
            for (const key in KEYMAPPINGS[category]) {
                let payload = Object.assign({}, KEYMAPPINGS[category][key]);
                payload.keyCodes = payload.keyCodes.slice();
                if (overrides[key]) {
                    payload.keyCodes[0] = overrides[key];
                }
                let index = 1;
                while (overrides[`${key}_${index}`]) {
                    if (!+overrides[`${key}_${index}`]) {
                        break;
                    }
                    if (payload.keyCodes.length < index) {
                        payload.keyCodes.push(overrides[`${key}_${index}`]);
                    } else {
                        payload.keyCodes[index] = overrides[`${key}_${index}`];
                    }
                    index++;
                }

                this.keybindings[key] = new Keybinding(this, this.root.app, payload);
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
        }
    }

    /**
     * Internal keydown handler
     * @param {object} param0
     * @param {number} param0.keyCode
     * @param {boolean} param0.shift
     * @param {boolean} param0.alt
     * @param {boolean=} param0.initial
     */
    handleKeydown({ keyCode, shift, alt, initial }) {
        let stop = false;

        // Find mapping
        for (const key in this.keybindings) {
            /** @type {Keybinding} */
            const binding = this.keybindings[key];
            if (binding.keyCodes.includes(keyCode) && (initial || binding.repeated)) {
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
        // Empty
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
