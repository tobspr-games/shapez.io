const path = require("path");
const buildUtils = require("./buildutils");

function gulptasksCSS($, gulp, buildFolder, browserSync) {
    // The assets plugin copies the files
    const commitHash = buildUtils.getRevision();
    const postcssAssetsPlugin = cachebust =>
        $.postcssAssets({
            loadPaths: [path.join(buildFolder, "res", "ui")],
            basePath: buildFolder,
            baseUrl: ".",
            cachebuster: cachebust
                ? (filePath, urlPathname) => ({
                      pathname: buildUtils.cachebust(urlPathname, commitHash),
                  })
                : "",
        });

    // Postcss configuration
    const postcssPlugins = (prod, { cachebust = false }) => {
        const plugins = [postcssAssetsPlugin(cachebust)];
        if (prod) {
            plugins.unshift(
                $.postcssPresetEnv({
                    browsers: ["> 0.1%"],
                })
            );

            plugins.push(
                $.cssMqpacker({
                    sort: true,
                }),
                $.cssnano({
                    preset: [
                        "advanced",
                        {
                            cssDeclarationSorter: false,
                            discardUnused: true,
                            mergeIdents: false,
                            reduceIdents: true,
                            zindex: true,
                        },
                    ],
                }),
                $.postcssRoundSubpixels()
            );
        }
        return plugins;
    };

    // Performs linting on css
    gulp.task("css.lint", () => {
        return gulp
            .src(["../src/css/**/*.scss"])
            .pipe($.sassLint({ configFile: ".sasslint.yml" }))
            .pipe($.sassLint.format())
            .pipe($.sassLint.failOnError());
    });

    function resourcesTask({ cachebust, isProd }) {
        return gulp
            .src("../src/css/main.scss", { cwd: __dirname })
            .pipe($.plumber())
            .pipe($.dartSass.sync().on("error", $.dartSass.logError))
            .pipe(
                $.postcss([
                    $.postcssCriticalSplit({
                        blockTag: "@load-async",
                    }),
                ])
            )
            .pipe($.rename("async-resources.css"))
            .pipe($.postcss(postcssPlugins(isProd, { cachebust })))
            .pipe(gulp.dest(buildFolder))
            .pipe(browserSync.stream());
    }

    // Builds the css resources
    gulp.task("css.resources.dev", () => {
        return resourcesTask({ cachebust: false, isProd: false });
    });

    // Builds the css resources in prod (=minified)
    gulp.task("css.resources.prod", () => {
        return resourcesTask({ cachebust: true, isProd: true });
    });

    // Builds the css resources in prod (=minified), without cachebusting
    gulp.task("css.resources.prod-standalone", () => {
        return resourcesTask({ cachebust: false, isProd: true });
    });

    function mainTask({ cachebust, isProd }) {
        return gulp
            .src("../src/css/main.scss", { cwd: __dirname })
            .pipe($.plumber())
            .pipe($.dartSass.sync().on("error", $.dartSass.logError))
            .pipe(
                $.postcss([
                    $.postcssCriticalSplit({
                        blockTag: "@load-async",
                        output: "rest",
                    }),
                ])
            )
            .pipe($.postcss(postcssPlugins(isProd, { cachebust })))
            .pipe(gulp.dest(buildFolder))
            .pipe(browserSync.stream());
    }

    // Builds the css main
    gulp.task("css.main.dev", () => {
        return mainTask({ cachebust: false, isProd: false });
    });

    // Builds the css main in prod (=minified)
    gulp.task("css.main.prod", () => {
        return mainTask({ cachebust: true, isProd: true });
    });

    // Builds the css main in prod (=minified), without cachebusting
    gulp.task("css.main.prod-standalone", () => {
        return mainTask({ cachebust: false, isProd: true });
    });

    gulp.task("css.dev", gulp.parallel("css.main.dev", "css.resources.dev"));
    gulp.task("css.prod", gulp.parallel("css.main.prod", "css.resources.prod"));
    gulp.task(
        "css.prod-standalone",
        gulp.parallel("css.main.prod-standalone", "css.resources.prod-standalone")
    );
}

module.exports = {
    gulptasksCSS,
};
