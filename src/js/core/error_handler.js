import { logSection } from "./logging";
import { stringifyObjectContainingErrors } from "./logging";
import { removeAllChildren } from "./utils";

export let APPLICATION_ERROR_OCCURED = false;

/**
 *
 * @param {Event|string} message
 * @param {string} source
 * @param {number} lineno
 * @param {number} colno
 * @param {Error} source
 */
function catchErrors(message, source, lineno, colno, error) {
    let fullPayload = JSON.parse(
        stringifyObjectContainingErrors({
            message,
            source,
            lineno,
            colno,
            error,
        })
    );

    if (("" + message).indexOf("Script error.") >= 0) {
        console.warn("Thirdparty script error:", message);
        return;
    }

    if (("" + message).indexOf("NS_ERROR_FAILURE") >= 0) {
        console.warn("Firefox NS_ERROR_FAILURE error:", message);
        return;
    }

    if (("" + message).indexOf("Cannot read property 'postMessage' of null") >= 0) {
        console.warn("Safari can not read post message error:", message);
        return;
    }

    if (!G_IS_DEV && G_IS_BROWSER && ("" + source).indexOf("shapez.io") < 0) {
        console.warn("Thirdparty error:", message);
        return;
    }

    console.log("\n\n\n⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️\n\n\n");
    console.log("          APPLICATION CRASHED             ");
    console.log("\n\n⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️\n\n\n");

    logSection("APPLICATION CRASH", "#e53935");
    console.error("Error:", message, "->", error);
    console.log("Payload:", fullPayload);

    if (window.Sentry && !window.anyModLoaded) {
        window.Sentry.withScope(scope => {
            window.Sentry.setTag("message", message);
            window.Sentry.setTag("source", source);

            window.Sentry.setExtra("message", message);
            window.Sentry.setExtra("source", source);
            window.Sentry.setExtra("lineno", lineno);
            window.Sentry.setExtra("colno", colno);
            window.Sentry.setExtra("error", error);
            window.Sentry.setExtra("fullPayload", fullPayload);

            try {
                const userName = window.localStorage.getItem("tracking_context") || null;
                window.Sentry.setTag("username", userName);
            } catch (ex) {
                // ignore
            }

            window.Sentry.captureException(error || source);
        });
    }

    if (APPLICATION_ERROR_OCCURED) {
        console.warn("ERROR: Only showing and submitting first error");
        return;
    }

    APPLICATION_ERROR_OCCURED = true;
    const element = document.createElement("div");
    element.id = "applicationError";

    const title = document.createElement("h1");
    title.innerText = "Whoops!";
    element.appendChild(title);

    const desc = document.createElement("div");
    desc.classList.add("desc");
    desc.innerHTML = `
        It seems the application crashed - I am sorry for that!<br /><br />
        An anonymized crash report has been sent, and I will have a look as soon as possible.<br /><br />
        If you have additional information how I can reproduce this error, please E-Mail me:&nbsp;
        <a href="mailto:bugs@shapez.io?title=Application+Crash">bugs@shapez.io</a>`;
    element.appendChild(desc);

    const details = document.createElement("pre");
    details.classList.add("details");
    details.innerText = (error && error.stack) || message;
    element.appendChild(details);

    const inject = function () {
        if (!G_IS_DEV) {
            removeAllChildren(document.body);
        }
        if (document.body.parentElement) {
            document.body.parentElement.appendChild(element);
        } else {
            document.body.appendChild(element);
        }
    };

    if (document.body) {
        inject();
    } else {
        setTimeout(() => {
            inject();
        }, 200);
    }

    return true;
}

window.onerror = catchErrors;
