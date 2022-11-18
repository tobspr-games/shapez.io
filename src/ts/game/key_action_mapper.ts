/* typehints:start */
import type { GameRoot } from "./root";
import type { InputReceiver } from "../core/input_receiver";
import type { Application } from "../application";
/* typehints:end */
import { Signal, STOP_PROPAGATION } from "../core/signal";
import { IS_MOBILE } from "../core/config";
import { T } from "../translations";
export function keyToKeyCode(str: any): any {
    return str.toUpperCase().charCodeAt(0);
}
export const KEYCODES: any = {
    Tab: 9,
    Enter: 13,
    Shift: 16,
    Ctrl: 17,
    Alt: 18,
    Escape: 27,
    Space: 32,
    ArrowLeft: 37,
    ArrowUp: 38,
    ArrowRight: 39,
    ArrowDown: 40,
    Delete: 46,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    Plus: 187,
    Minus: 189,
};
export const KEYMAPPINGS: any = {
    // Make sure mods come first so they can override everything
    mods: {},
    general: {
        confirm: { keyCode: KEYCODES.Enter },
        back: { keyCode: KEYCODES.Escape, builtin: true },
    },
    ingame: {
        menuOpenShop: { keyCode: keyToKeyCode("F") },
        menuOpenStats: { keyCode: keyToKeyCode("G") },
        menuClose: { keyCode: keyToKeyCode("Q") },
        toggleHud: { keyCode: KEYCODES.F2 },
        exportScreenshot: { keyCode: KEYCODES.F3 },
        toggleFPSInfo: { keyCode: KEYCODES.F4 },
        switchLayers: { keyCode: keyToKeyCode("E") },
        showShapeTooltip: { keyCode: KEYCODES.Alt },
    },
    navigation: {
        mapMoveUp: { keyCode: keyToKeyCode("W") },
        mapMoveRight: { keyCode: keyToKeyCode("D") },
        mapMoveDown: { keyCode: keyToKeyCode("S") },
        mapMoveLeft: { keyCode: keyToKeyCode("A") },
        mapMoveFaster: { keyCode: KEYCODES.Shift },
        centerMap: { keyCode: KEYCODES.Space },
        mapZoomIn: { keyCode: KEYCODES.Plus, repeated: true },
        mapZoomOut: { keyCode: KEYCODES.Minus, repeated: true },
        createMarker: { keyCode: keyToKeyCode("M") },
    },
    buildings: {
        // Puzzle buildings
        constant_producer: { keyCode: keyToKeyCode("H") },
        goal_acceptor: { keyCode: keyToKeyCode("N") },
        block: { keyCode: keyToKeyCode("4") },
        // Primary Toolbar
        belt: { keyCode: keyToKeyCode("1") },
        balancer: { keyCode: keyToKeyCode("2") },
        underground_belt: { keyCode: keyToKeyCode("3") },
        miner: { keyCode: keyToKeyCode("4") },
        cutter: { keyCode: keyToKeyCode("5") },
        rotater: { keyCode: keyToKeyCode("6") },
        stacker: { keyCode: keyToKeyCode("7") },
        mixer: { keyCode: keyToKeyCode("8") },
        painter: { keyCode: keyToKeyCode("9") },
        trash: { keyCode: keyToKeyCode("0") },
        // Sandbox
        item_producer: { keyCode: keyToKeyCode("L") },
        // Secondary toolbar
        storage: { keyCode: keyToKeyCode("Y") },
        reader: { keyCode: keyToKeyCode("U") },
        lever: { keyCode: keyToKeyCode("I") },
        filter: { keyCode: keyToKeyCode("O") },
        display: { keyCode: keyToKeyCode("P") },
        // Wires toolbar
        wire: { keyCode: keyToKeyCode("1") },
        wire_tunnel: { keyCode: keyToKeyCode("2") },
        constant_signal: { keyCode: keyToKeyCode("3") },
        logic_gate: { keyCode: keyToKeyCode("4") },
        virtual_processor: { keyCode: keyToKeyCode("5") },
        analyzer: { keyCode: keyToKeyCode("6") },
        comparator: { keyCode: keyToKeyCode("7") },
        transistor: { keyCode: keyToKeyCode("8") },
    },
    placement: {
        pipette: { keyCode: keyToKeyCode("Q") },
        rotateWhilePlacing: { keyCode: keyToKeyCode("R") },
        rotateInverseModifier: { keyCode: KEYCODES.Shift },
        rotateToUp: { keyCode: KEYCODES.ArrowUp },
        rotateToDown: { keyCode: KEYCODES.ArrowDown },
        rotateToRight: { keyCode: KEYCODES.ArrowRight },
        rotateToLeft: { keyCode: KEYCODES.ArrowLeft },
        cycleBuildingVariants: { keyCode: keyToKeyCode("T") },
        cycleBuildings: { keyCode: KEYCODES.Tab },
        switchDirectionLockSide: { keyCode: keyToKeyCode("R") },
        copyWireValue: { keyCode: keyToKeyCode("Z") },
    },
    massSelect: {
        massSelectStart: { keyCode: KEYCODES.Ctrl },
        massSelectSelectMultiple: { keyCode: KEYCODES.Shift },
        massSelectCopy: { keyCode: keyToKeyCode("C") },
        massSelectCut: { keyCode: keyToKeyCode("X") },
        massSelectClear: { keyCode: keyToKeyCode("B") },
        confirmMassDelete: { keyCode: KEYCODES.Delete },
        pasteLastBlueprint: { keyCode: keyToKeyCode("V") },
    },
    placementModifiers: {
        lockBeltDirection: { keyCode: KEYCODES.Shift },
        placementDisableAutoOrientation: { keyCode: KEYCODES.Ctrl },
        placeMultiple: { keyCode: KEYCODES.Shift },
        placeInverse: { keyCode: KEYCODES.Alt },
    },
};
// Assign ids
for (const categoryId: any in KEYMAPPINGS) {
    for (const mappingId: any in KEYMAPPINGS[categoryId]) {
        KEYMAPPINGS[categoryId][mappingId].id = mappingId;
    }
}
export const KEYCODE_LMB: any = 1;
export const KEYCODE_MMB: any = 2;
export const KEYCODE_RMB: any = 3;
/**
 * Returns a keycode -> string
 * {}
 */
export function getStringForKeyCode(code: number): string {
    // @todo: Refactor into dictionary
    switch (code) {
        case KEYCODE_LMB:
            return "LMB";
        case KEYCODE_MMB:
            return "MMB";
        case KEYCODE_RMB:
            return "RMB";
        case 4:
            return "MB4";
        case 5:
            return "MB5";
        case 8:
            return "⌫";
        case KEYCODES.Tab:
            return T.global.keys.tab;
        case KEYCODES.Enter:
            return "⏎";
        case KEYCODES.Shift:
            return "⇪";
        case KEYCODES.Ctrl:
            return T.global.keys.control;
        case KEYCODES.Alt:
            return T.global.keys.alt;
        case 19:
            return "PAUSE";
        case 20:
            return "CAPS";
        case KEYCODES.Escape:
            return T.global.keys.escape;
        case KEYCODES.Space:
            return T.global.keys.space;
        case 33:
            return "PGUP";
        case 34:
            return "PGDOWN";
        case 35:
            return "END";
        case 36:
            return "HOME";
        case KEYCODES.ArrowLeft:
            return "⬅";
        case KEYCODES.ArrowUp:
            return "⬆";
        case KEYCODES.ArrowRight:
            return "➡";
        case KEYCODES.ArrowDown:
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
        case KEYCODES.F1:
            return "F1";
        case KEYCODES.F2:
            return "F2";
        case KEYCODES.F3:
            return "F3";
        case KEYCODES.F4:
            return "F4";
        case KEYCODES.F5:
            return "F5";
        case KEYCODES.F6:
            return "F6";
        case KEYCODES.F7:
            return "F7";
        case KEYCODES.F8:
            return "F8";
        case KEYCODES.F9:
            return "F9";
        case KEYCODES.F10:
            return "F10";
        case KEYCODES.F11:
            return "F11";
        case KEYCODES.F12:
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
        case 190:
            return ".";
        case 191:
            return "/";
        case 192:
            return "`";
        case 219:
            return "[";
        case 220:
            return "\\";
        case 221:
            return "]";
        case 222:
            return "'";
    }
    return (48 <= code && code <= 57) || (65 <= code && code <= 90)
        ? String.fromCharCode(code)
        : "[" + code + "]";
}
export class Keybinding {
    public keyMapper = keyMapper;
    public app = app;
    public keyCode = keyCode;
    public builtin = builtin;
    public repeated = repeated;
    public modifiers = modifiers;
    public signal = new Signal();
    public toggled = new Signal();

        constructor(keyMapper, app, { keyCode, builtin = false, repeated = false, modifiers = {} }) {
        assert(keyCode && Number.isInteger(keyCode), "Invalid key code: " + keyCode);
    }
    /**
     * Returns whether this binding is currently pressed
     * {}
     */
    get pressed() {
        // Check if the key is down
        if (this.app.inputMgr.keysDown.has(this.keyCode)) {
            // Check if it is the top reciever
            const reciever: any = this.keyMapper.inputReceiver;
            return this.app.inputMgr.getTopReciever() === reciever;
        }
        return false;
    }
    /**
     * Adds an event listener
     */
    add(receiver: function():void, scope: object= = null): any {
        this.signal.add(receiver, scope);
    }
    /**
     * Adds an event listener
     */
    addToTop(receiver: function():void, scope: object= = null): any {
        this.signal.addToTop(receiver, scope);
    }
    /**
     * {} the created element, or null if the keybindings are not shown
     *  */
    appendLabelToElement(elem: Element): HTMLElement {
        if (IS_MOBILE) {
            return null;
        }
        const spacer: any = document.createElement("code");
        spacer.classList.add("keybinding");
        spacer.innerHTML = getStringForKeyCode(this.keyCode);
        elem.appendChild(spacer);
        return spacer;
    }
    /**
     * Returns the key code as a nice string
     */
    getKeyCodeString(): any {
        return getStringForKeyCode(this.keyCode);
    }
    /**
     * Remvoes all signal receivers
     */
    clearSignalReceivers(): any {
        this.signal.removeAll();
    }
}
export class KeyActionMapper {
    public root = root;
    public inputReceiver = inputReciever;
    public keybindings: {
        [idx: string]: Keybinding;
    } = {};

        constructor(root, inputReciever) {
        inputReciever.keydown.add(this.handleKeydown, this);
        inputReciever.keyup.add(this.handleKeyup, this);
        const overrides: any = root.app.settings.getKeybindingOverrides();
        for (const category: any in KEYMAPPINGS) {
            for (const key: any in KEYMAPPINGS[category]) {
                let payload: any = Object.assign({}, KEYMAPPINGS[category][key]);
                if (overrides[key]) {
                    payload.keyCode = overrides[key];
                }
                this.keybindings[key] = new Keybinding(this, this.root.app, payload);
                if (G_IS_DEV) {
                    // Sanity
                    if (!T.keybindings.mappings[key]) {
                        assertAlways(false, "Keybinding " + key + " has no translation!");
                    }
                }
            }
        }
        inputReciever.pageBlur.add(this.onPageBlur, this);
        inputReciever.destroyed.add(this.cleanup, this);
    }
    /**
     * Returns all keybindings starting with the given id
     * {}
     */
    getKeybindingsStartingWith(pattern: string): Array<Keybinding> {
        let result: any = [];
        for (const key: any in this.keybindings) {
            if (key.startsWith(pattern)) {
                result.push(this.keybindings[key]);
            }
        }
        return result;
    }
    /**
     * Forwards the given events to the other mapper (used in tooltips)
     */
    forward(receiver: KeyActionMapper, bindings: Array<string>): any {
        for (let i: any = 0; i < bindings.length; ++i) {
            const key: any = bindings[i];
            this.keybindings[key].signal.add((...args: any): any => receiver.keybindings[key].signal.dispatch(...args));
        }
    }
    cleanup(): any {
        for (const key: any in this.keybindings) {
            this.keybindings[key].signal.removeAll();
        }
    }
    onPageBlur(): any {
        // Reset all down states
        // Find mapping
        for (const key: any in this.keybindings) {
                        const binding: Keybinding = this.keybindings[key];
        }
    }
    /**
     * Internal keydown handler
     */
    handleKeydown({ keyCode, shift, alt, ctrl, initial }: {
        keyCode: number;
        shift: boolean;
        alt: boolean;
        ctrl: boolean;
        initial: boolean=;
    }): any {
        let stop: any = false;
        // Find mapping
        for (const key: any in this.keybindings) {
                        const binding: Keybinding = this.keybindings[key];
            if (binding.keyCode === keyCode && (initial || binding.repeated)) {
                if (binding.modifiers.shift && !shift) {
                    continue;
                }
                if (binding.modifiers.ctrl && !ctrl) {
                    continue;
                }
                if (binding.modifiers.alt && !alt) {
                    continue;
                }
                                const signal: Signal = this.keybindings[key].signal;
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
     */
    handleKeyup({ keyCode, shift, alt }: {
        keyCode: number;
        shift: boolean;
        alt: boolean;
    }): any {
        // Empty
    }
    /**
     * Returns a given keybinding
     * {}
     */
    getBinding(binding: {
        keyCode: number;
    }): Keybinding {
        // @ts-ignore
        const id: any = binding.id;
        assert(id, "Not a valid keybinding: " + JSON.stringify(binding));
        assert(this.keybindings[id], "Keybinding " + id + " not known!");
        return this.keybindings[id];
    }
    /**
     * Returns a given keybinding
     * {}
     */
    getBindingById(id: string): Keybinding {
        assert(this.keybindings[id], "Keybinding " + id + " not known!");
        return this.keybindings[id];
    }
}
