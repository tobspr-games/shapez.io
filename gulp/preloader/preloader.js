(function () {
    var loadTimeout = null;
    var callbackDone = false;

    // Catch load errors

    function errorHandler(event, source, lineno, colno, error) {
        if (("" + event).indexOf("Script error.") >= 0) {
            console.warn("Thirdparty script error:", event);
            return;
        }

        if (("" + event).indexOf("NS_ERROR_FAILURE") >= 0) {
            console.warn("Firefox NS_ERROR_FAILURE error:", event);
            return;
        }

        if (("" + event).indexOf("Cannot read property 'postMessage' of null") >= 0) {
            console.warn("Safari can not read post message error:", event);
            return;
        }

        if (("" + event).indexOf("Possible side-effect in debug-evaluate") >= 0) {
            console.warn("Chrome debug-evaluate error:", event);
            return;
        }

        if (("" + source).indexOf("shapez.io") < 0) {
            console.warn("Thirdparty error:", event);
            return;
        }

        console.error("👀 App Error:", event, source, lineno, colno, error);
        var element = document.createElement("div");
        element.id = "ll_preload_error";

        var inner = document.createElement("div");
        inner.classList.add("inner");
        element.appendChild(inner);

        var heading = document.createElement("h3");
        heading.classList.add("heading");
        heading.innerText = "Fatal Error";
        inner.appendChild(heading);

        var content = document.createElement("p");
        content.classList.add("content");
        content.innerText = error || (event && event.message) || event || "Unknown Error";
        inner.appendChild(content);

        var discordLink = document.createElement("p");
        discordLink.classList.add("discordLink");
        discordLink.innerHTML =
            "Please report this error in the <strong>#bugs</strong> channel of the <a href='https://discord.gg/rtuRRJDc7u' target='_blank'>official discord</a>!";

        inner.appendChild(discordLink);

        if (source) {
            var sourceElement = document.createElement("p");
            sourceElement.classList.add("source");
            sourceElement.innerText = source + ":" + lineno + ":" + colno;
            inner.appendChild(sourceElement);
        }

        document.documentElement.appendChild(element);

        window.APP_ERROR_OCCURED = true;
    }

    window.onerror = errorHandler;

    function expectJsParsed() {
        if (!callbackDone) {
            console.error("👀 Got no core callback");
            throw new Error("Core thread failed to respond within time.");
        }
    }

    function onJsLoaded() {
        console.log("👀 Core loaded at", Math.floor(performance.now()), "ms");
        loadTimeout = setTimeout(expectJsParsed, 120000);
        window.removeEventListener("unhandledrejection", errorHandler);
    }

    window.coreThreadLoadedCb = function () {
        console.log("👀 Core responded at", Math.floor(performance.now()), "ms");
        clearTimeout(loadTimeout);
        loadTimeout = null;
        callbackDone = true;
    };

    function progressHandler(progress) {
        var progressElement = document.querySelector("#ll_preload_status");
        if (progressElement) {
            progressElement.innerText = "Downloading Bundle (" + Math.round(progress * 1200) + " / 1200 KB)";
        }
        var barElement = document.querySelector("#ll_progressbar span");
        if (barElement) {
            barElement.style.width = (5 + progress * 75.0).toFixed(2) + "%";
        }
    }

    function startBundleDownload() {
        var xhr = new XMLHttpRequest();
        var notifiedNotComputable = false;

        xhr.open("GET", bundleSrc, true);
        xhr.responseType = "arraybuffer";
        xhr.onprogress = function (ev) {
            if (ev.lengthComputable) {
                progressHandler(ev.loaded / ev.total);
            } else {
                // Hardcoded length
                progressHandler(Math.min(1, ev.loaded / 2349009));
            }
        };

        xhr.onloadend = function () {
            if (!xhr.status.toString().match(/^2/)) {
                throw new Error("Failed to load bundle: " + xhr.status + " " + xhr.statusText);
            } else {
                if (!notifiedNotComputable) {
                    progressHandler(1);
                }

                var options = {};
                var headers = xhr.getAllResponseHeaders();
                var m = headers.match(/^Content-Type\:\s*(.*?)$/im);

                if (m && m[1]) {
                    options.type = m[1];
                }

                var blob = new Blob([this.response], options);
                var script = document.createElement("script");
                script.addEventListener("load", onJsLoaded);
                script.src = window.URL.createObjectURL(blob);
                script.type = "text/javascript";
                script.charset = "utf-8";
                if (bundleIntegrity) {
                    script.setAttribute("integrity", bundleIntegrity);
                }
                document.head.appendChild(script);
            }
        };
        xhr.send();
    }

    console.log("Start bundle download ...");
    window.addEventListener("load", startBundleDownload);
})();
