import { T } from "../translations";
import { rando } from "@nastyox/rando.js";
import { WEB_STEAM_SSO_AUTHENTICATED } from "./steam_sso";
const bigNumberSuffixTranslationKeys: any = ["thousands", "millions", "billions", "trillions"];
/**
 * Returns a platform name
 * {}
 */
export function getPlatformName(): "android" | "browser" | "ios" | "standalone" | "unknown" {
    if (G_IS_STANDALONE) {
        return "standalone";
    }
    else if (G_IS_BROWSER) {
        return "browser";
    }
    return "unknown";
}
/**
 * Makes a new 2D array with undefined contents
 * {}
 */
export function make2DUndefinedArray(w: number, h: number): Array<Array<any>> {
    const result: any = new Array(w);
    for (let x: any = 0; x < w; ++x) {
        result[x] = new Array(h);
    }
    return result;
}
/**
 * Creates a new map (an empty object without any props)
 */
export function newEmptyMap(): any {
    return Object.create(null);
}
/**
 * Returns a random integer in the range [start,end]
 */
export function randomInt(start: number, end: number): any {
    return rando(start, end);
}
/**
 * Access an object in a very annoying way, used for obsfuscation.
 */
export function accessNestedPropertyReverse(obj: any, keys: Array<string>): any {
    let result: any = obj;
    for (let i: any = keys.length - 1; i >= 0; --i) {
        result = result[keys[i]];
    }
    return result;
}
/**
 * Chooses a random entry of an array
 * @template T
 * {}
 */
export function randomChoice(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}
/**
 * Deletes from an array by swapping with the last element
 */
export function fastArrayDelete(array: Array<any>, index: number): any {
    if (index < 0 || index >= array.length) {
        throw new Error("Out of bounds");
    }
    // When the element is not the last element
    if (index !== array.length - 1) {
        // Get the last element, and swap it with the one we want to delete
        const last: any = array[array.length - 1];
        array[index] = last;
    }
    // Finally remove the last element
    array.length -= 1;
}
/**
 * Deletes from an array by swapping with the last element. Searches
 * for the value in the array first
 */
export function fastArrayDeleteValue(array: Array<any>, value: any): any {
    if (array == null) {
        throw new Error("Tried to delete from non array!");
    }
    const index: any = array.indexOf(value);
    if (index < 0) {
        console.error("Value", value, "not contained in array:", array, "!");
        return value;
    }
    return fastArrayDelete(array, index);
}
/**
 * @see fastArrayDeleteValue
 */
export function fastArrayDeleteValueIfContained(array: Array<any>, value: any): any {
    if (array == null) {
        throw new Error("Tried to delete from non array!");
    }
    const index: any = array.indexOf(value);
    if (index < 0) {
        return value;
    }
    return fastArrayDelete(array, index);
}
/**
 * Deletes from an array at the given index
 */
export function arrayDelete(array: Array<any>, index: number): any {
    if (index < 0 || index >= array.length) {
        throw new Error("Out of bounds");
    }
    array.splice(index, 1);
}
/**
 * Deletes the given value from an array
 */
export function arrayDeleteValue(array: Array<any>, value: any): any {
    if (array == null) {
        throw new Error("Tried to delete from non array!");
    }
    const index: any = array.indexOf(value);
    if (index < 0) {
        console.error("Value", value, "not contained in array:", array, "!");
        return value;
    }
    return arrayDelete(array, index);
}
/**
 * Compare two floats for epsilon equality
 * {}
 */
export function epsilonCompare(a: number, b: number, epsilon: any = 1e-5): boolean {
    return Math.abs(a - b) < epsilon;
}
/**
 * Interpolates two numbers
 */
export function lerp(a: number, b: number, x: number): any {
    return a * (1 - x) + b * x;
}
/**
 * Finds a value which is nice to display, e.g. 15669 -> 15000. Also handles fractional stuff
 */
export function findNiceValue(num: number): any {
    if (num > 1e8) {
        return num;
    }
    if (num < 0.00001) {
        return 0;
    }
    let roundAmount: any = 1;
    if (num > 50000) {
        roundAmount = 10000;
    }
    else if (num > 20000) {
        roundAmount = 5000;
    }
    else if (num > 5000) {
        roundAmount = 1000;
    }
    else if (num > 2000) {
        roundAmount = 500;
    }
    else if (num > 1000) {
        roundAmount = 100;
    }
    else if (num > 100) {
        roundAmount = 20;
    }
    else if (num > 20) {
        roundAmount = 5;
    }
    const niceValue: any = Math.floor(num / roundAmount) * roundAmount;
    if (num >= 10) {
        return Math.round(niceValue);
    }
    if (num >= 1) {
        return Math.round(niceValue * 10) / 10;
    }
    return Math.round(niceValue * 100) / 100;
}
/**
 * Finds a nice integer value
 * @see findNiceValue
 */
export function findNiceIntegerValue(num: number): any {
    return Math.ceil(findNiceValue(num));
}
/**
 * Formats a big number
 * {}
 */
export function formatBigNumber(num: number, separator: string= = T.global.decimalSeparator): string {
    const sign: any = num < 0 ? "-" : "";
    num = Math.abs(num);
    if (num > 1e54) {
        return sign + T.global.infinite;
    }
    if (num < 10 && !Number.isInteger(num)) {
        return sign + num.toFixed(2);
    }
    if (num < 50 && !Number.isInteger(num)) {
        return sign + num.toFixed(1);
    }
    num = Math.floor(num);
    if (num < 1000) {
        return sign + "" + num;
    }
    else {
        let leadingDigits: any = num;
        let suffix: any = "";
        for (let suffixIndex: any = 0; suffixIndex < bigNumberSuffixTranslationKeys.length; ++suffixIndex) {
            leadingDigits = leadingDigits / 1000;
            suffix = T.global.suffix[bigNumberSuffixTranslationKeys[suffixIndex]];
            if (leadingDigits < 1000) {
                break;
            }
        }
        const leadingDigitsRounded: any = round1Digit(leadingDigits);
        const leadingDigitsNoTrailingDecimal: any = leadingDigitsRounded
            .toString()
            .replace(".0", "")
            .replace(".", separator);
        return sign + leadingDigitsNoTrailingDecimal + suffix;
    }
}
/**
 * Formats a big number, but does not add any suffix and instead uses its full representation
 * {}
 */
export function formatBigNumberFull(num: number, divider: string= = T.global.thousandsDivider): string {
    if (num < 1000) {
        return num + "";
    }
    if (num > 1e54) {
        return T.global.infinite;
    }
    let rest: any = num;
    let out: any = "";
    while (rest >= 1000) {
        out = (rest % 1000).toString().padStart(3, "0") + divider + out;
        rest = Math.floor(rest / 1000);
    }
    out = rest + divider + out;
    return out.substring(0, out.length - 1);
}
/**
 * Waits two frames so the ui is updated
 * {}
 */
export function waitNextFrame(): Promise<void> {
    return new Promise(function (resolve: any): any {
        window.requestAnimationFrame(function (): any {
            window.requestAnimationFrame(function (): any {
                resolve();
            });
        });
    });
}
/**
 * Rounds 1 digit
 * {}
 */
export function round1Digit(n: number): number {
    return Math.floor(n * 10.0) / 10.0;
}
/**
 * Rounds 2 digits
 * {}
 */
export function round2Digits(n: number): number {
    return Math.floor(n * 100.0) / 100.0;
}
/**
 * Rounds 3 digits
 * {}
 */
export function round3Digits(n: number): number {
    return Math.floor(n * 1000.0) / 1000.0;
}
/**
 * Rounds 4 digits
 * {}
 */
export function round4Digits(n: number): number {
    return Math.floor(n * 10000.0) / 10000.0;
}
/**
 * Clamps a value between [min, max]
 */
export function clamp(v: number, minimum: number= = 0, maximum: number= = 1): any {
    return Math.max(minimum, Math.min(maximum, v));
}
/**
 * Helper method to create a new div element
 */
export function makeDivElement(id: string= = null, classes: Array<string>= = [], innerHTML: string= = ""): any {
    const div: any = document.createElement("div");
    if (id) {
        div.id = id;
    }
    for (let i: any = 0; i < classes.length; ++i) {
        div.classList.add(classes[i]);
    }
    div.innerHTML = innerHTML;
    return div;
}
/**
 * Helper method to create a new div
 */
export function makeDiv(parent: Element, id: string= = null, classes: Array<string>= = [], innerHTML: string= = ""): any {
    const div: any = makeDivElement(id, classes, innerHTML);
    parent.appendChild(div);
    return div;
}
/**
 * Helper method to create a new button element
 */
export function makeButtonElement(classes: Array<string>= = [], innerHTML: string= = ""): any {
    const element: any = document.createElement("button");
    for (let i: any = 0; i < classes.length; ++i) {
        element.classList.add(classes[i]);
    }
    element.classList.add("styledButton");
    element.innerHTML = innerHTML;
    return element;
}
/**
 * Helper method to create a new button
 */
export function makeButton(parent: Element, classes: Array<string>= = [], innerHTML: string= = ""): any {
    const element: any = makeButtonElement(classes, innerHTML);
    parent.appendChild(element);
    return element;
}
/**
 * Removes all children of the given element
 */
export function removeAllChildren(elem: Element): any {
    if (elem) {
        var range: any = document.createRange();
        range.selectNodeContents(elem);
        range.deleteContents();
    }
}
/**
 * Returns if the game supports this browser
 */
export function isSupportedBrowser(): any {
    // please note,
    // that IE11 now returns undefined again for window.chrome
    // and new Opera 30 outputs true for window.chrome
    // but needs to check if window.opr is not undefined
    // and new IE Edge outputs to true now for window.chrome
    // and if not iOS Chrome check
    // so use the below updated condition
    if (G_IS_STANDALONE) {
        return true;
    }
    // @ts-ignore
    var isChromium: any = window.chrome;
    var winNav: any = window.navigator;
    var vendorName: any = winNav.vendor;
    // @ts-ignore
    var isIEedge: any = winNav.userAgent.indexOf("Edge") > -1;
    var isIOSChrome: any = winNav.userAgent.match("CriOS");
    if (isIOSChrome) {
        // is Google Chrome on IOS
        return false;
    }
    else if (isChromium !== null &&
        typeof isChromium !== "undefined" &&
        vendorName === "Google Inc." &&
        isIEedge === false) {
        // is Google Chrome
        return true;
    }
    else {
        // not Google Chrome
        return false;
    }
}
/**
 * Formats an amount of seconds into something like "5s ago"
 * {}
 */
export function formatSecondsToTimeAgo(secs: number): string {
    const seconds: any = Math.floor(secs);
    const minutes: any = Math.floor(seconds / 60);
    const hours: any = Math.floor(minutes / 60);
    const days: any = Math.floor(hours / 24);
    if (seconds < 60) {
        if (seconds === 1) {
            return T.global.time.oneSecondAgo;
        }
        return T.global.time.xSecondsAgo.replace("<x>", "" + seconds);
    }
    else if (minutes < 60) {
        if (minutes === 1) {
            return T.global.time.oneMinuteAgo;
        }
        return T.global.time.xMinutesAgo.replace("<x>", "" + minutes);
    }
    else if (hours < 24) {
        if (hours === 1) {
            return T.global.time.oneHourAgo;
        }
        return T.global.time.xHoursAgo.replace("<x>", "" + hours);
    }
    else {
        if (days === 1) {
            return T.global.time.oneDayAgo;
        }
        return T.global.time.xDaysAgo.replace("<x>", "" + days);
    }
}
/**
 * Formats seconds into a readable string like "5h 23m"
 * {}
 */
export function formatSeconds(secs: number): string {
    const trans: any = T.global.time;
    secs = Math.ceil(secs);
    if (secs < 60) {
        return trans.secondsShort.replace("<seconds>", "" + secs);
    }
    else if (secs < 60 * 60) {
        const minutes: any = Math.floor(secs / 60);
        const seconds: any = secs % 60;
        return trans.minutesAndSecondsShort
            .replace("<seconds>", "" + seconds)
            .replace("<minutes>", "" + minutes);
    }
    else {
        const hours: any = Math.floor(secs / 3600);
        const minutes: any = Math.floor(secs / 60) % 60;
        return trans.hoursAndMinutesShort.replace("<minutes>", "" + minutes).replace("<hours>", "" + hours);
    }
}
/**
 * Formats a number like 2.51 to "2.5"
 */
export function round1DigitLocalized(speed: number, separator: string= = T.global.decimalSeparator): any {
    return round1Digit(speed).toString().replace(".", separator);
}
/**
 * Formats a number like 2.51 to "2.51 items / s"
 */
export function formatItemsPerSecond(speed: number, double: boolean= = false, separator: string= = T.global.decimalSeparator): any {
    return ((speed === 1.0
        ? T.ingame.buildingPlacement.infoTexts.oneItemPerSecond
        : T.ingame.buildingPlacement.infoTexts.itemsPerSecond.replace("<x>", round2Digits(speed).toString().replace(".", separator))) + (double ? "  " + T.ingame.buildingPlacement.infoTexts.itemsPerSecondDouble : ""));
}
/**
 * Rotates a flat 3x3 matrix clockwise
 * Entries:
 * 0 lo
 * 1 mo
 * 2 ro
 * 3 lm
 * 4 mm
 * 5 rm
 * 6 lu
 * 7 mu
 * 8 ru
 */
export function rotateFlatMatrix3x3(flatMatrix: Array<number>): any {
    return [
        flatMatrix[6],
        flatMatrix[3],
        flatMatrix[0],
        flatMatrix[7],
        flatMatrix[4],
        flatMatrix[1],
        flatMatrix[8],
        flatMatrix[5],
        flatMatrix[2],
    ];
}
/**
 * Generates rotated variants of the matrix
 * {}
 */
export function generateMatrixRotations(originalMatrix: Array<number>): Object<number, Array<number>> {
    const result: any = {
        0: originalMatrix,
    };
    originalMatrix = rotateFlatMatrix3x3(originalMatrix);
    result[90] = originalMatrix;
    originalMatrix = rotateFlatMatrix3x3(originalMatrix);
    result[180] = originalMatrix;
    originalMatrix = rotateFlatMatrix3x3(originalMatrix);
    result[270] = originalMatrix;
    return result;
}

/**
 * Rotates a directional object
 * {}
 */
export function rotateDirectionalObject(obj: DirectionalObject, rotation: any): DirectionalObject {
    const queue: any = [obj.top, obj.right, obj.bottom, obj.left];
    while (rotation !== 0) {
        rotation -= 90;
        queue.push(queue.shift());
    }
    return {
        top: queue[0],
        right: queue[1],
        bottom: queue[2],
        left: queue[3],
    };
}
/**
 * Modulo which works for negative numbers
 */
export function safeModulo(n: number, m: number): any {
    return ((n % m) + m) % m;
}
/**
 * Returns a smooth pulse between 0 and 1
 * {}
 */
export function smoothPulse(time: number): number {
    return Math.sin(time * 4) * 0.5 + 0.5;
}
/**
 * Fills in a <link> tag
 */
export function fillInLinkIntoTranslation(translation: string, link: string): any {
    return translation
        .replace("<link>", "<a href='" + link + "' target='_blank'>")
        .replace("</link>", "</a>");
}
/**
 * Generates a file download
 */
export function generateFileDownload(filename: string, text: string): any {
    var element: any = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
/**
 * Starts a file chooser
 */
export function startFileChoose(acceptedType: string = ".bin"): any {
    var input: any = document.createElement("input");
    input.type = "file";
    input.accept = acceptedType;
    return new Promise((resolve: any): any => {
        input.onchange = (_: any): any => resolve(input.files[0]);
        input.click();
    });
}
const MAX_ROMAN_NUMBER: any = 49;
const romanLiteralsCache: any = ["0"];
/**
 *
 * {}
 */
export function getRomanNumber(number: number): string {
    number = Math.max(0, Math.round(number));
    if (romanLiteralsCache[number]) {
        return romanLiteralsCache[number];
    }
    if (number > MAX_ROMAN_NUMBER) {
        return String(number);
    }
    function formatDigit(digit: any, unit: any, quintuple: any, decuple: any): any {
        switch (digit) {
            case 0:
                return "";
            case 1: // I
                return unit;
            case 2: // II
                return unit + unit;
            case 3: // III
                return unit + unit + unit;
            case 4: // IV
                return unit + quintuple;
            case 9: // IX
                return unit + decuple;
            default:
                // V, VI, VII, VIII
                return quintuple + formatDigit(digit - 5, unit, quintuple, decuple);
        }
    }
    let thousands: any = Math.floor(number / 1000);
    let thousandsPart: any = "";
    while (thousands > 0) {
        thousandsPart += "M";
        thousands -= 1;
    }
    const hundreds: any = Math.floor((number % 1000) / 100);
    const hundredsPart: any = formatDigit(hundreds, "C", "D", "M");
    const tens: any = Math.floor((number % 100) / 10);
    const tensPart: any = formatDigit(tens, "X", "L", "C");
    const units: any = number % 10;
    const unitsPart: any = formatDigit(units, "I", "V", "X");
    const formatted: any = thousandsPart + hundredsPart + tensPart + unitsPart;
    romanLiteralsCache[number] = formatted;
    return formatted;
}
/**
 * Returns the appropriate logo sprite path
 */
export function getLogoSprite(): any {
    if (G_IS_STANDALONE || WEB_STEAM_SSO_AUTHENTICATED) {
        return "logo.png";
    }
    if (G_IS_BROWSER) {
        return "logo_demo.png";
    }
    return "logo.png";
}
/**
 * Rejects a promise after X ms
 */
export function timeoutPromise(promise: Promise, timeout: any = 30000): any {
    return Promise.race([
        new Promise((resolve: any, reject: any): any => {
            setTimeout((): any => reject("timeout of " + timeout + " ms exceeded"), timeout);
        }),
        promise,
    ]);
}
