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
                $.postcssUnprefix(),
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

    // Builds the css in dev mode
    gulp.task("css.dev", () => {
        return gulp
            .src(["../src/css/main.scss"])
            .pipe($.plumber())
            .pipe($.sass.sync().on("error", $.sass.logError))
            .pipe($.postcss(postcssPlugins(false, {})))
            .pipe(gulp.dest(buildFolder))
            .pipe(browserSync.stream());
    });

    // Builds the css in production mode (=minified)
    gulp.task("css.prod", () => {
        return (
            gulp
                .src("../src/css/main.scss", { cwd: __dirname })
                .pipe($.plumber())
                .pipe($.sass.sync({ outputStyle: "compressed" }).on("error", $.sass.logError))
                .pipe($.postcss(postcssPlugins(true, { cachebust: true })))
                .pipe(gulp.dest(buildFolder))
        );
    });

    // Builds the css in production mode (=minified), without cachebusting
    gulp.task("css.prod-standalone", () => {
        return (
            gulp
                .src("../src/css/main.scss", { cwd: __dirname })
                .pipe($.plumber())
                .pipe($.sass.sync({ outputStyle: "compressed" }).on("error", $.sass.logError))
                .pipe($.postcss(postcssPlugins(true, { cachebust: false })))
                .pipe(gulp.dest(buildFolder))
        );
    });
}

module.exports = {
    gulptasksCSS,
};
