/**
 * ES6 Bundle Loader
 *
 * Attempts to load the game code, and if that fails tries with the transpiled
 * version. Also handles errors during load.
 */

(function () {
    var loadTimeout = null;
    var callbackDone = false;

    // Catch load errors

    function errorHandler(event, source, lineno, colno, error) {
        console.error("👀 Init Error:", event, source, lineno, colno, error);
        var element = document.createElement("div");
        element.style.position = "fixed";
        element.style.top = "0";
        element.style.right = "0";
        element.style.bottom = "0";
        element.style.left = "0";
        element.style.zIndex = "29999";
        element.style.backgroundColor = "#222429";
        element.style.display = "flex";
        element.style.justifyContent = "center";
        element.style.alignItems = "center";

        var inner = document.createElement("div");
        inner.style.color = "#fff";
        inner.style.fontFamily = "GameFont, sans-serif";
        inner.style.fontSize = "15px";
        inner.style.padding = "30px";
        inner.style.textAlign = "center";
        element.appendChild(inner);

        var heading = document.createElement("h3");
        heading.style.color = "#ef5072";
        heading.innerText = "Error";
        heading.style.marginBottom = "40px";
        heading.style.fontSize = "45px";
        inner.appendChild(heading);

        var content = document.createElement("p");
        content.style.color = "#eee";
        content.innerText = error || (event && event.message) || event || "Unknown Error";
        inner.appendChild(content);

        if (source) {
            var sourceElement = document.createElement("p");
            sourceElement.style.color = "#777";
            sourceElement.innerText = sourceElement + ":" + lineno + ":" + colno;
            inner.appendChild(sourceElement);
        }

        document.documentElement.appendChild(element);
    }
    window.addEventListener("error", errorHandler);
    window.addEventListener("unhandledrejection", errorHandler);

    function makeJsTag(src, integrity) {
        var script = document.createElement("script");
        script.src = src;
        script.type = "text/javascript";
        script.charset = "utf-8";
        script.defer = true;
        if (integrity) {
            script.setAttribute("integrity", integrity);
        }
        return script;
    }

    function loadFallbackJs(error) {
        console.warn("👀 ES6 Script not supported, loading transpiled code.");
        console.warn("👀 Error was:", error);
        var scriptTransp = makeJsTag(bundleSrcTranspiled, bundleIntegrityTranspiled);
        scriptTransp.addEventListener("error", scriptFail);
        scriptTransp.addEventListener("load", onJsLoaded);
        document.head.appendChild(scriptTransp);
    }

    function scriptFail(error) {
        console.error("👀 Failed to load bundle!");
        console.error("👀 Error was:", error);
        throw new Error("Core load failed.");
    }

    function expectJsParsed() {
        if (!callbackDone) {
            console.error("👀 Got no core callback");
            throw new Error("Core thread failed to respond within time.");
        }
    }

    function onJsLoaded() {
        console.log("👀 Core loaded at", Math.floor(performance.now()), "ms");
        loadTimeout = setTimeout(expectJsParsed, 15000);
        window.removeEventListener("error", errorHandler);
        window.removeEventListener("unhandledrejection", errorHandler);
    }

    window.coreThreadLoadedCb = function () {
        console.log("👀 Core responded at", Math.floor(performance.now()), "ms");
        clearTimeout(loadTimeout);
        loadTimeout = null;
        callbackDone = true;
    };

    var scriptEs6 = makeJsTag(bundleSrc, bundleIntegrity);
    scriptEs6.addEventListener("error", loadFallbackJs);
    scriptEs6.addEventListener("load", onJsLoaded);
    document.head.appendChild(scriptEs6);
})();
