const path = require("path");

function requireUncached(module) {
    delete require.cache[require.resolve(module)];
    return require(module);
}

function gulptasksJS($, gulp, buildFolder, browserSync) {
    //// DEV

    gulp.task("js.dev.watch", () => {
        return gulp
            .src("../src/js/main.js")
            .pipe(
                $.webpackStream(
                    requireUncached("./webpack.config.js")({
                        watch: true,
                    })
                )
            )
            .pipe(gulp.dest(buildFolder))
            .pipe(browserSync.stream());
    });

    gulp.task("js.dev", () => {
        return gulp
            .src("../src/js/main.js")
            .pipe($.webpackStream(requireUncached("./webpack.config.js")({})))
            .pipe(gulp.dest(buildFolder));
    });

    //// DEV CHINA

    gulp.task("china.js.dev.watch", () => {
        return gulp
            .src("../src/js/main.js")
            .pipe(
                $.webpackStream(
                    requireUncached("./webpack.config.js")({
                        watch: true,
                        chineseVersion: true,
                    })
                )
            )
            .pipe(gulp.dest(buildFolder))
            .pipe(browserSync.stream());
    });

    gulp.task("china.js.dev", () => {
        return gulp
            .src("../src/js/main.js")
            .pipe(
                $.webpackStream(
                    requireUncached("./webpack.config.js")({
                        chineseVersion: true,
                    })
                )
            )
            .pipe(gulp.dest(buildFolder));
    });

    //// DEV WEGAME

    gulp.task("wegame.js.dev.watch", () => {
        return gulp
            .src("../src/js/main.js")
            .pipe(
                $.webpackStream(
                    requireUncached("./webpack.config.js")({
                        watch: true,
                        wegameVersion: true,
                    })
                )
            )
            .pipe(gulp.dest(buildFolder))
            .pipe(browserSync.stream());
    });

    gulp.task("wegame.js.dev", () => {
        return gulp
            .src("../src/js/main.js")
            .pipe(
                $.webpackStream(
                    requireUncached("./webpack.config.js")({
                        wegameVersion: true,
                    })
                )
            )
            .pipe(gulp.dest(buildFolder));
    });

    //// STAGING

    gulp.task("js.staging.transpiled", () => {
        return gulp
            .src("../src/js/main.js")
            .pipe(
                $.webpackStream(
                    requireUncached("./webpack.production.config.js")({
                        enableAssert: true,
                        environment: "staging",
                        es6: false,
                    })
                )
            )
            .pipe($.rename("bundle-transpiled.js"))
            .pipe(gulp.dest(buildFolder));
    });

    gulp.task("js.staging.latest", () => {
        return gulp
            .src("../src/js/main.js")
            .pipe(
                $.webpackStream(
                    requireUncached("./webpack.production.config.js")({
                        enableAssert: true,
                        environment: "staging",
                        es6: true,
                    })
                )
            )
            .pipe(gulp.dest(buildFolder));
    });
    gulp.task("js.staging", gulp.parallel("js.staging.transpiled", "js.staging.latest"));

    //// PROD

    gulp.task("js.prod.transpiled", () => {
        return gulp
            .src("../src/js/main.js")
            .pipe(
                $.webpackStream(
                    requireUncached("./webpack.production.config.js")({
                        enableAssert: false,
                        environment: "prod",
                        es6: false,
                    })
                )
            )
            .pipe($.rename("bundle-transpiled.js"))
            .pipe(gulp.dest(buildFolder))
            .pipe(browserSync.stream());
    });

    gulp.task("js.prod.latest", () => {
        return gulp
            .src("../src/js/main.js")
            .pipe(
                $.webpackStream(
                    requireUncached("./webpack.production.config.js")({
                        enableAssert: false,
                        environment: "prod",
                        es6: true,
                    })
                )
            )
            .pipe(gulp.dest(buildFolder))
            .pipe(browserSync.stream());
    });

    gulp.task("js.prod", gulp.parallel("js.prod.transpiled", "js.prod.latest"));

    //// STANDALONE

    gulp.task("js.standalone-dev.watch", () => {
        return gulp
            .src("../src/js/main.js")
            .pipe(
                $.webpackStream(
                    requireUncached("./webpack.config.js")({
                        watch: true,
                        standalone: true,
                    })
                )
            )
            .pipe(gulp.dest(buildFolder))
            .pipe(browserSync.stream());
    });

    gulp.task("js.standalone-dev", () => {
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

    gulp.task("js.standalone-beta", () => {
        return gulp
            .src("../src/js/main.js")
            .pipe(
                $.webpackStream(
                    requireUncached("./webpack.production.config.js")({
                        enableAssert: true,
                        environment: "staging",
                        es6: true,
                        standalone: true,
                    })
                )
            )
            .pipe(gulp.dest(buildFolder));
    });

    gulp.task("js.standalone-prod", () => {
        return gulp
            .src("../src/js/main.js")
            .pipe(
                $.webpackStream(
                    requireUncached("./webpack.production.config.js")({
                        enableAssert: false,
                        environment: "prod",
                        es6: true,
                        standalone: true,
                    })
                )
            )
            .pipe(gulp.dest(buildFolder));
    });

    gulp.task("china.js.standalone-prod", () => {
        return gulp
            .src("../src/js/main.js")
            .pipe(
                $.webpackStream(
                    requireUncached("./webpack.production.config.js")({
                        enableAssert: false,
                        environment: "prod",
                        es6: true,
                        standalone: true,
                        chineseVersion: true,
                    })
                )
            )
            .pipe(gulp.dest(buildFolder));
    });

    gulp.task("wegame.js.standalone-prod", () => {
        return gulp
            .src("../src/js/main.js")
            .pipe(
                $.webpackStream(
                    requireUncached("./webpack.production.config.js")({
                        enableAssert: false,
                        environment: "prod",
                        es6: false,
                        standalone: true,
                        wegameVersion: true,
                    })
                )
            )
            .pipe(gulp.dest(buildFolder));
    });
}

module.exports = {
    gulptasksJS,
};
