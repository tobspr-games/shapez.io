// @ts-ignore
const path = require("path");

// Globs for non-ui resources
const nonImageResourcesGlobs = ["../res/**/*.woff2", "../res/*.ico", "../res/**/*.webm"];

// Globs for ui resources
const imageResourcesGlobs = ["../res/**/*.png", "../res/**/*.svg", "../res/**/*.jpg", "../res/**/*.gif"];

function gulptasksImageResources($, gulp, buildFolder) {
    // Lossless options
    const minifyImagesOptsLossless = () => [
        $.imagemin.jpegtran({
            progressive: true,
        }),
        $.imagemin.svgo({}),
        $.imagemin.optipng({
            optimizationLevel: 3,
        }),
        $.imageminGifsicle({
            optimizationLevel: 3,
            colors: 128,
        }),
    ];

    // Lossy options
    const minifyImagesOpts = () => [
        $.imageminMozjpeg({
            quality: 80,
            maxMemory: 1024 * 1024 * 8,
        }),
        $.imagemin.svgo({}),
        $.imageminPngquant({
            speed: 1,
            strip: true,
            quality: [0.65, 0.9],
            dithering: false,
            verbose: false,
        }),
        $.imagemin.optipng({
            optimizationLevel: 3,
        }),
        $.imageminGifsicle({
            optimizationLevel: 3,
            colors: 128,
        }),
    ];

    // Where the resources folder are
    const resourcesDestFolder = path.join(buildFolder, "res");

    /**
     * Determines if an atlas must use lossless compression
     * @param {string} fname
     */
    function fileMustBeLossless(fname) {
        return fname.indexOf("lossless") >= 0;
    }

    /////////////// ATLAS /////////////////////

    // Copies the atlas to the final destination
    gulp.task("imgres.atlas", () => {
        return gulp
            .src(["../res_built/atlas/*.png"])
            .pipe($.cached("imgres.atlas"))
            .pipe(gulp.dest(resourcesDestFolder));
    });

    // Copies the atlas to the final destination after optimizing it (lossy compression)
    gulp.task("imgres.atlasOptimized", () => {
        return gulp
            .src(["../res_built/atlas/*.png"])
            .pipe($.cached("imgres.atlasOptimized"))
            .pipe(
                $.if(
                    fname => fileMustBeLossless(fname.history[0]),
                    $.imagemin(minifyImagesOptsLossless()),
                    $.imagemin(minifyImagesOpts())
                )
            )
            .pipe(gulp.dest(resourcesDestFolder));
    });

    //////////////////// RESOURCES //////////////////////

    // Copies all resources which are no ui resources
    gulp.task("imgres.copyNonImageResources", () => {
        return gulp
            .src(nonImageResourcesGlobs)
            .pipe($.cached("imgres.copyNonImageResources"))
            .pipe(gulp.dest(resourcesDestFolder));
    });

    // Copies all ui resources
    gulp.task("imgres.copyImageResources", () => {
        return gulp
            .src(imageResourcesGlobs)
            .pipe($.cached("copyImageResources"))
            .pipe(gulp.dest(path.join(resourcesDestFolder)));
    });

    // Copies all ui resources and optimizes them
    gulp.task("imgres.copyImageResourcesOptimized", () => {
        return gulp
            .src(imageResourcesGlobs)
            .pipe($.cached("imgres.copyImageResourcesOptimized"))
            .pipe(
                $.if(
                    fname => fileMustBeLossless(fname.history[0]),
                    $.imagemin(minifyImagesOptsLossless()),
                    $.imagemin(minifyImagesOpts())
                )
            )
            .pipe(gulp.dest(path.join(resourcesDestFolder)));
    });

    // Copies all resources and optimizes them
    gulp.task("imgres.allOptimized", cb =>
        $.multiProcess(
            ["imgres.atlasOptimized", "imgres.copyNonImageResources", "imgres.copyImageResourcesOptimized"],
            cb,
            false
        )
    );

    // Cleans up unused images which are instead inline into the css
    gulp.task("imgres.cleanupUnusedCssInlineImages", () => {
        return gulp
            .src(
                [
                    path.join(buildFolder, "res", "ui", "**", "*.png"),
                    path.join(buildFolder, "res", "ui", "**", "*.jpg"),
                    path.join(buildFolder, "res", "ui", "**", "*.svg"),
                    path.join(buildFolder, "res", "ui", "**", "*.gif"),
                ],
                { read: false }
            )
            .pipe($.if(fname => fname.history[0].indexOf("noinline") < 0, $.clean({ force: true })));
    });
}

module.exports = {
    nonImageResourcesGlobs,
    imageResourcesGlobs,
    gulptasksImageResources,
};
