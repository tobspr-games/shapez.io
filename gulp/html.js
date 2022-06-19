const buildUtils = require("./buildutils");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { BUILD_VARIANTS } = require("./build_variants");

function computeIntegrityHash(fullPath, algorithm = "sha256") {
    const file = fs.readFileSync(fullPath);
    const hash = crypto.createHash(algorithm).update(file).digest("base64");
    return algorithm + "-" + hash;
}

/**
 * PROVIDES (per <variant>)
 *
 * html.<variant>.dev
 * html.<variant>.prod
 */
function gulptasksHTML($, gulp, buildFolder) {
    const commitHash = buildUtils.getRevision();
    async function buildHtml({
        googleAnalytics = false,
        standalone = false,
        integrity = true,
        enableCachebust = true,
    }) {
        function cachebust(url) {
            if (enableCachebust) {
                return buildUtils.cachebust(url, commitHash);
            }
            return url;
        }

        const hasLocalFiles = standalone;

        return gulp
            .src("../src/html/" + (standalone ? "index.standalone.html" : "index.html"))
            .pipe(
                $.dom(
                    /** @this {Document} **/ function () {
                        const document = this;

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

                        // Google analytics
                        if (googleAnalytics) {
                            const tagManagerScript = document.createElement("script");
                            tagManagerScript.src =
                                "https://www.googletagmanager.com/gtag/js?id=UA-165342524-1";
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
                        }

                        // Do not need to preload in app or standalone
                        if (!hasLocalFiles) {
                            // Preload essentials
                            const preloads = [
                                "res/fonts/GameFont.woff2",
                                // "async-resources.css",
                                // "res/sounds/music/theme-short.mp3",
                            ];

                            preloads.forEach(src => {
                                const preloadLink = document.createElement("link");
                                preloadLink.rel = "preload";
                                preloadLink.href = cachebust(src);
                                if (src.endsWith(".woff2")) {
                                    preloadLink.setAttribute("crossorigin", "anonymous");
                                    preloadLink.setAttribute("as", "font");
                                } else if (src.endsWith(".css")) {
                                    preloadLink.setAttribute("as", "style");
                                } else if (src.endsWith(".mp3")) {
                                    preloadLink.setAttribute("as", "audio");
                                } else {
                                    preloadLink.setAttribute("as", "image");
                                }
                                document.head.appendChild(preloadLink);
                            });
                        }

                        let fontCss = `
                        @font-face {
                            font-family: "GameFont";
                            font-style: normal;
                            font-weight: normal;
                            font-display: swap;
                            src: url('${cachebust("res/fonts/GameFont.woff2")}') format("woff2");
                        }
                        `;
                        let loadingCss =
                            fontCss +
                            fs.readFileSync(path.join(__dirname, "preloader", "preloader.css")).toString();

                        const style = document.createElement("style");
                        style.setAttribute("type", "text/css");
                        style.textContent = loadingCss;
                        document.head.appendChild(style);

                        let bodyContent = fs
                            .readFileSync(path.join(__dirname, "preloader", "preloader.html"))
                            .toString();

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

                            if (integrity) {
                                scriptContent +=
                                    "var bundleIntegrity = '" +
                                    computeIntegrityHash(path.join(buildFolder, "bundle.js")) +
                                    "';\n";
                            } else {
                                scriptContent += "var bundleIntegrity = null;\n";
                                scriptContent += "var bundleIntegrityTranspiled = null;\n";
                            }

                            scriptContent += fs
                                .readFileSync(path.join(__dirname, "preloader", "preloader.js"))
                                .toString();
                            loadJs.textContent = scriptContent;
                            document.head.appendChild(loadJs);

                            // Click fraud prevention
                            bodyContent =
                                `
                            <script type="text/javascript">
                                var script = document.createElement("script");
                                script.async = true;
                                script.type = "text/javascript";
                                var target = "https://www.clickcease.com/monitor/stat.js";
                                script.src = target;
                                var elem = document.head;
                                elem.appendChild(script);
                            </script>
                            ` + bodyContent;
                        }

                        document.body.innerHTML = bodyContent;
                    }
                )
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

    for (const variant in BUILD_VARIANTS) {
        const data = BUILD_VARIANTS[variant];
        gulp.task("html." + variant + ".dev", () => {
            return buildHtml({
                googleAnalytics: false,
                standalone: data.standalone,
                integrity: false,
                enableCachebust: false,
            });
        });
        gulp.task("html." + variant + ".prod", () => {
            return buildHtml({
                googleAnalytics: !data.standalone,
                standalone: data.standalone,
                integrity: true,
                enableCachebust: !data.standalone,
            });
        });
    }
}

module.exports = {
    gulptasksHTML,
};
