import { globalConfig } from "./config";
const circularJson = require("circular-json");
/*
Logging functions
- To be extended
*/
/**
 * Base logger class
 */
class Logger {
    public context = context;

    constructor(context) {
    }
    debug(...args) {
        globalDebug(this.context, ...args);
    }
    log(...args) {
        globalLog(this.context, ...args);
    }
    warn(...args) {
        globalWarn(this.context, ...args);
    }
    error(...args) {
        globalError(this.context, ...args);
    }
}
export function createLogger(context) {
    return new Logger(context);
}
function prepareObjectForLogging(obj, maxDepth = 1) {
    if (!window.Sentry) {
        // Not required without sentry
        return obj;
    }
    if (typeof obj !== "object" && !Array.isArray(obj)) {
        return obj;
    }
    const result = {};
    for (const key in obj) {
        const val = obj[key];
        if (typeof val === "object") {
            if (maxDepth > 0) {
                result[key] = prepareObjectForLogging(val, maxDepth - 1);
            }
            else {
                result[key] = "[object]";
            }
        }
        else {
            result[key] = val;
        }
    }
    return result;
}
/**
 * Serializes an error
 */
export function serializeError(err: Error | ErrorEvent) {
    if (!err) {
        return null;
    }
    const result = {

        type: err.constructor.name,
    };
    if (err instanceof Error) {
        result.message = err.message;
        result.name = err.name;
        result.stack = err.stack;
        result.type = "{type.Error}";
    }
    else if (err instanceof ErrorEvent) {
        result.filename = err.filename;
        result.message = err.message;
        result.lineno = err.lineno;
        result.colno = err.colno;
        result.type = "{type.ErrorEvent}";
        if (err.error) {
            result.error = serializeError(err.error);
        }
        else {
            result.error = "{not-provided}";
        }
    }
    else {
        result.type = "{unkown-type:" + typeof err + "}";
    }
    return result;
}
/**
 * Serializes an event
 */
function serializeEvent(event: Event) {
    let result = {
        type: "{type.Event:" + typeof event + "}",
    };
    result.eventType = event.type;
    return result;
}
/**
 * Prepares a json payload
 */
function preparePayload(key: string, value: any) {
    if (value instanceof Error || value instanceof ErrorEvent) {
        return serializeError(value);
    }
    if (value instanceof Event) {
        return serializeEvent(value);
    }
    if (typeof value === "undefined") {
        return null;
    }
    return value;
}
/**
 * Stringifies an object containing circular references and errors
 */
export function stringifyObjectContainingErrors(payload: any) {
    return circularJson.stringify(payload, preparePayload);
}
export function globalDebug(context, ...args) {
    if (G_IS_DEV) {
        logInternal(context, console.log, prepareArgsForLogging(args));
    }
}
export function globalLog(context, ...args) {
    // eslint-disable-next-line no-console
    logInternal(context, console.log, prepareArgsForLogging(args));
}
export function globalWarn(context, ...args) {
    // eslint-disable-next-line no-console
    logInternal(context, console.warn, prepareArgsForLogging(args));
}
export function globalError(context, ...args) {
    args = prepareArgsForLogging(args);
    // eslint-disable-next-line no-console
    logInternal(context, console.error, args);
    if (window.Sentry) {
        window.Sentry.withScope(scope => {
            scope.setExtra("args", args);
            window.Sentry.captureMessage(internalBuildStringFromArgs(args), "error");
        });
    }
}
function prepareArgsForLogging(args) {
    let result = [];
    for (let i = 0; i < args.length; ++i) {
        result.push(prepareObjectForLogging(args[i]));
    }
    return result;
}
function internalBuildStringFromArgs(args: Array<any>) {
    let result = [];
    for (let i = 0; i < args.length; ++i) {
        let arg = args[i];
        if (typeof arg === "string" ||
            typeof arg === "number" ||
            typeof arg === "boolean" ||
            arg === null ||
            arg === undefined) {
            result.push("" + arg);
        }
        else if (arg instanceof Error) {
            result.push(arg.message);
        }
        else {
            result.push("[object]");
        }
    }
    return result.join(" ");
}
export function logSection(name, color) {
    while (name.length <= 14) {
        name = " " + name + " ";
    }
    name = name.padEnd(19, " ");
    const lineCss = "letter-spacing: -3px; color: " + color + "; font-size: 6px; background: #eee; color: #eee;";
    const line = "%c----------------------------";
    console.log("\n" + line + " %c" + name + " " + line + "\n", lineCss, "color: " + color, lineCss);
}
function extractHandleContext(handle) {
    let context = handle || "unknown";


    if (handle && handle.constructor && handle.constructor.name) {

        context = handle.constructor.name;
        if (context === "String") {
            context = handle;
        }
    }
    if (handle && handle.name) {
        context = handle.name;
    }
    return context + "";
}
function logInternal(handle, consoleMethod, args) {
    const context = extractHandleContext(handle).padEnd(20, " ");
    const labelColor = handle && handle.LOG_LABEL_COLOR ? handle.LOG_LABEL_COLOR : "#aaa";
    if (G_IS_DEV && globalConfig.debug.logTimestamps) {
        const timestamp = "⏱ %c" + (Math.floor(performance.now()) + "").padEnd(6, " ") + "";
        consoleMethod.call(console, timestamp + " %c" + context, "color: #7f7;", "color: " + labelColor + ";", ...args);
    }
    else {
        // if (G_IS_DEV && !globalConfig.debug.disableLoggingLogSources) {
        consoleMethod.call(console, "%c" + context, "color: " + labelColor, ...args);
        // } else {
        // consoleMethod.call(console, ...args);
        // }
    }
}
