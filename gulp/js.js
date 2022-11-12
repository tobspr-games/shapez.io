const path = require("path");
const { BUILD_VARIANTS } = require("./build_variants");

function requireUncached(module) {
    delete require.cache[require.resolve(module)];
    return require(module);
}

/**
 * PROVIDES (per <variant>)
 *
 * js.<variant>.dev.watch
 * js.<variant>.dev
 * js.<variant>.prod
 *
 */

function gulptasksJS($, gulp, buildFolder, browserSync) {
    //// DEV

    for (const variant in BUILD_VARIANTS) {
        const data = BUILD_VARIANTS[variant];

        gulp.task("js." + variant + ".dev.watch", () => {
            return gulp
                .src("../src/js/main.js")
                .pipe(
                    $.webpackStream(
                        requireUncached("./webpack.config.js")({
                            standalone: data.standalone,
                            watch: true,
                        })
                    )
                )
                .pipe(gulp.dest(buildFolder))
                .pipe(browserSync.stream());
        });

        if (!data.standalone) {
            // WEB

            gulp.task("js." + variant + ".dev", () => {
                return gulp
                    .src("../src/js/main.js")
                    .pipe($.webpackStream(requireUncached("./webpack.config.js")()))
                    .pipe(gulp.dest(buildFolder));
            });

            gulp.task("js." + variant + ".prod.transpiled", () => {
                return gulp
                    .src("../src/js/main.js")
                    .pipe(
                        $.webpackStream(
                            requireUncached("./webpack.production.config.js")({
                                es6: false,
                                environment: data.environment,
                            })
                        )
                    )
                    .pipe($.rename("bundle-transpiled.js"))
                    .pipe(gulp.dest(buildFolder));
            });

            gulp.task("js." + variant + ".prod.es6", () => {
                return gulp
                    .src("../src/js/main.js")
                    .pipe(
                        $.webpackStream(
                            requireUncached("./webpack.production.config.js")({
                                es6: true,
                                environment: data.environment,
                            })
                        )
                    )
                    .pipe(gulp.dest(buildFolder));
            });
            gulp.task(
                "js." + variant + ".prod",

                // transpiled currently not used
                // gulp.parallel("js." + variant + ".prod.transpiled", "js." + variant + ".prod.es6")
                gulp.parallel("js." + variant + ".prod.es6")
            );
        } else {
            // STANDALONE
            gulp.task("js." + variant + ".dev", () => {
                return gulp
                    .src("../src/js/main.js")
                    .pipe(
                        $.webpackStream(
                            requireUncached("./webpack.config.js")({
                                standalone: true,
                            })
                        )
                    )
                    .pipe(gulp.dest(buildFolder));
            });
            gulp.task("js." + variant + ".prod", () => {
                return gulp
                    .src("../src/js/main.js")
                    .pipe(
                        $.webpackStream(
                            requireUncached("./webpack.production.config.js")({
                                environment: "prod",
                                es6: true,
                                standalone: true,
                            })
                        )
                    )
                    .pipe(gulp.dest(buildFolder));
            });
        }
    }
}

module.exports = {
    gulptasksJS,
};
