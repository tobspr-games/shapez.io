const buildUtils = require("./buildutils");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function computeIntegrityHash(fullPath, algorithm = "sha256") {
    const file = fs.readFileSync(fullPath);
    const hash = crypto.createHash(algorithm).update(file).digest("base64");
    return algorithm + "-" + hash;
}

function gulptasksHTML($, gulp, buildFolder, browserSync) {
    const commitHash = buildUtils.getRevision();
    async function buildHtml(
        apiUrl,
        { analytics = false, standalone = false, app = false, integrity = true, enableCachebust = true }
    ) {
        function cachebust(url) {
            if (enableCachebust) {
                return buildUtils.cachebust(url, commitHash);
            }
            return url;
        }

        const hasLocalFiles = standalone || app;

        return gulp
            .src("../src/html/" + (standalone ? "index.standalone.html" : "index.html"))
            .pipe(
                $.dom(function () {
                    // @ts-ignore
                    const document = /** @type {Document} */ (this);

                    // Preconnect to api
                    const prefetchLink = document.createElement("link");
                    prefetchLink.rel = "preconnect";
                    prefetchLink.href = apiUrl;
                    prefetchLink.setAttribute("crossorigin", "anonymous");
                    document.head.appendChild(prefetchLink);

                    // // Append css preload
                    // const cssPreload = document.createElement("link");
                    // cssPreload.rel = "preload";
                    // cssPreload.href = cachebust("main.css");
                    // cssPreload.setAttribute("as", "style");
                    // document.head.appendChild(cssPreload);
                    // document.head.appendChild(prefetchLink);

                    // // Append js preload
                    // const jsPreload = document.createElement("link");
                    // jsPreload.rel = "preload";
                    // jsPreload.href = cachebust("bundle.js");
                    // jsPreload.setAttribute("as", "script");
                    // document.head.appendChild(jsPreload);

                    // Append css
                    const css = document.createElement("link");
                    css.rel = "stylesheet";
                    css.type = "text/css";
                    css.media = "none";
                    css.setAttribute("onload", "this.media='all'");
                    css.href = cachebust("main.css");
                    if (integrity) {
                        css.setAttribute(
                            "integrity",
                            computeIntegrityHash(path.join(buildFolder, "main.css"))
                        );
                    }
                    document.head.appendChild(css);

                    if (analytics) {
                        // Logrocket
                        // const logrocketScript = document.createElement("script");
                        // logrocketScript.src = "https://cdn.lr-ingest.io/LogRocket.min.js";
                        // logrocketScript.setAttribute("crossorigin", "anonymous");
                        // document.head.appendChild(logrocketScript);
                        // const logrocketInit = document.createElement("script");
                        // logrocketInit.textContent = "window.LogRocket && window.LogRocket.init('TODO: GET LOGROCKET ID');";
                        // document.head.appendChild(logrocketInit);
                    }

                    if (app) {
                        // Append cordova link
                        const cdv = document.createElement("script");
                        cdv.src = "cordova.js";
                        cdv.type = "text/javascript";
                        document.head.appendChild(cdv);
                    }

                    // Google analytics
                    if (analytics) {
                        const tagManagerScript = document.createElement("script");
                        tagManagerScript.src = "https://www.googletagmanager.com/gtag/js?id=UA-165342524-1";
                        tagManagerScript.setAttribute("async", "");
                        document.head.appendChild(tagManagerScript);

                        const initScript = document.createElement("script");
                        initScript.textContent = `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'UA-165342524-1', { anonymize_ip: true });
                        `;
                        document.head.appendChild(initScript);

                        const abTestingScript = document.createElement("script");
                        abTestingScript.setAttribute(
                            "src",
                            "https://www.googleoptimize.com/optimize.js?id=OPT-M5NHCV7"
                        );
                        abTestingScript.setAttribute("async", "");
                        document.head.appendChild(abTestingScript);
                    }

                    // Do not need to preload in app or standalone
                    if (!hasLocalFiles) {
                        // Preload images
                        const images = buildUtils.getAllResourceImages();

                        // Preload essentials
                        const preloads = ["fonts/GameFont.woff2"];

                        // for (let i = 0; i < images.length; ++i) {
                        //     if (preloads.indexOf(images[i]) < 0) {
                        //         preloads.push(images[i]);
                        //     }
                        // }

                        preloads.forEach(src => {
                            const preloadLink = document.createElement("link");
                            preloadLink.rel = "preload";
                            preloadLink.href = cachebust("res/" + src);
                            if (src.endsWith(".woff2")) {
                                preloadLink.setAttribute("crossorigin", "anonymous");
                                preloadLink.setAttribute("as", "font");
                            } else {
                                preloadLink.setAttribute("as", "image");
                            }
                            document.head.appendChild(preloadLink);
                        });

                        // Sound preloads
                        // const sounds = buildUtils.getAllSounds();
                        // sounds.forEach((src) => {

                        //     if (src.indexOf("sounds/music/") >= 0) {
                        //         // skip music
                        //         return;
                        //     }

                        //     const preloadLink = document.createElement("link");
                        //     preloadLink.rel = "preload";
                        //     preloadLink.href = cachebust(src);
                        //     // preloadLink.setAttribute("crossorigin", "anonymous");
                        //     preloadLink.setAttribute("as", "fetch");
                        //     document.head.appendChild(preloadLink);
                        // });
                    }

                    const loadingSvg = `background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHN0eWxlPSJtYXJnaW46YXV0bztiYWNrZ3JvdW5kOjAgMCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCIgZGlzcGxheT0iYmxvY2siPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzM5Mzc0NyIgc3Ryb2tlLXdpZHRoPSIzIiByPSI0MiIgc3Ryb2tlLWRhc2hhcnJheT0iMTk3LjkyMDMzNzE3NjE1Njk4IDY3Ljk3MzQ0NTcyNTM4NTY2IiB0cmFuc2Zvcm09InJvdGF0ZSg0OC4yNjUgNTAgNTApIj48YW5pbWF0ZVRyYW5zZm9ybSBhdHRyaWJ1dGVOYW1lPSJ0cmFuc2Zvcm0iIHR5cGU9InJvdGF0ZSIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIGR1cj0iNS41NTU1NTU1NTU1NTU1NTVzIiB2YWx1ZXM9IjAgNTAgNTA7MzYwIDUwIDUwIiBrZXlUaW1lcz0iMDsxIi8+PC9jaXJjbGU+PC9zdmc+")`;

                    const loadingCss = `
                    @font-face {
                        font-family: 'GameFont';
                        font-style: normal;
                        font-weight: normal;
                        font-display: swap;
                        src: url('${cachebust("res/fonts/GameFont.woff2")}') format('woff2');
                    }
            
                    #ll_fp {
                        font-family: GameFont;
                        font-size: 14px;
                        position: fixed;
                        z-index: -1;
                        top: 0;
                        left: 0;
                        opacity: 0.05;
                    }
        
                    #ll_p {
                        display: flex;
                        position: fixed;
                        z-index: 99999;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        justify-content:
                        center;
                        align-items: center;
                    }
        
                    #ll_p > div {
                        position: absolute;
                        text-align: center;
                        bottom: 40px;
                        left: 20px;
                        right: 20px;
                        color: #393747;
                        font-family: 'GameFont', sans-serif;
                        font-size: 20px;
                    }
        
                    #ll_p > span {
                        width: 60px;
                        height: 60px;
                        display: inline-flex;
                        background: center center / contain no-repeat;
                        ${loadingSvg};
                    }
                `;

                    const style = document.createElement("style");
                    style.setAttribute("type", "text/css");
                    style.textContent = loadingCss;
                    document.head.appendChild(style);

                    // Append loader, but not in standalone (directly include bundle there)
                    if (standalone) {
                        const bundleScript = document.createElement("script");
                        bundleScript.type = "text/javascript";
                        bundleScript.src = "bundle.js";
                        if (integrity) {
                            bundleScript.setAttribute(
                                "integrity",
                                computeIntegrityHash(path.join(buildFolder, "bundle.js"))
                            );
                        }
                        document.head.appendChild(bundleScript);
                    } else {
                        const loadJs = document.createElement("script");
                        loadJs.type = "text/javascript";
                        let scriptContent = "";
                        scriptContent += `var bundleSrc = '${cachebust("bundle.js")}';\n`;
                        scriptContent += `var bundleSrcTranspiled = '${cachebust(
                            "bundle-transpiled.js"
                        )}';\n`;

                        if (integrity) {
                            scriptContent +=
                                "var bundleIntegrity = '" +
                                computeIntegrityHash(path.join(buildFolder, "bundle.js")) +
                                "';\n";
                            scriptContent +=
                                "var bundleIntegrityTranspiled = '" +
                                computeIntegrityHash(path.join(buildFolder, "bundle-transpiled.js")) +
                                "';\n";
                        } else {
                            scriptContent += "var bundleIntegrity = null;\n";
                            scriptContent += "var bundleIntegrityTranspiled = null;\n";
                        }

                        scriptContent += fs.readFileSync("./bundle-loader.js").toString();
                        loadJs.textContent = scriptContent;
                        document.head.appendChild(loadJs);
                    }

                    const bodyContent = `
                <div id="ll_fp">_</div>
                <div id="ll_p">
                    <span></span>
                    <div>${hasLocalFiles ? "Loading" : "Downloading"} Game Files</div >
                </div >
                `;

                    document.body.innerHTML = bodyContent;
                })
            )
            .pipe(
                $.htmlmin({
                    caseSensitive: true,
                    collapseBooleanAttributes: true,
                    collapseInlineTagWhitespace: true,
                    collapseWhitespace: true,
                    preserveLineBreaks: true,
                    minifyJS: true,
                    minifyCSS: true,
                    quoteCharacter: '"',
                    useShortDoctype: true,
                })
            )
            .pipe($.htmlBeautify())
            .pipe($.rename("index.html"))
            .pipe(gulp.dest(buildFolder));
    }

    gulp.task("html.dev", () => {
        return buildHtml("http://localhost:5005", {
            analytics: false,
            integrity: false,
            enableCachebust: false,
        });
    });

    gulp.task("html.staging", () => {
        return buildHtml("https://api-staging.shapez.io", {
            analytics: true,
        });
    });

    gulp.task("html.prod", () => {
        return buildHtml("https://analytics.shapez.io", {
            analytics: true,
        });
    });

    gulp.task("html.standalone-dev", () => {
        return buildHtml("https://localhost:5005", {
            analytics: false,
            standalone: true,
            integrity: false,
            enableCachebust: false,
        });
    });

    gulp.task("html.standalone-beta", () => {
        return buildHtml("https://api-staging.shapez.io", {
            analytics: false,
            standalone: true,
            enableCachebust: false,
        });
    });

    gulp.task("html.standalone-prod", () => {
        return buildHtml("https://analytics.shapez.io", {
            analytics: false,
            standalone: true,
            enableCachebust: false,
        });
    });
}

module.exports = {
    gulptasksHTML,
};
