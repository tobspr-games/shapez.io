const { existsSync } = require("fs");
// @ts-ignore
const path = require("path");
const atlasToJson = require("./atlas2json");

const execute = command =>
    require("child_process").execSync(command, {
        encoding: "utf-8",
    });

// Globs for atlas resources
const rawImageResourcesGlobs = ["../res_raw/atlas.json", "../res_raw/**/*.png"];

// Globs for non-ui resources
const nonImageResourcesGlobs = ["../res/**/*.woff2", "../res/*.ico", "../res/**/*.webm"];

// Globs for ui resources
const imageResourcesGlobs = ["../res/**/*.png", "../res/**/*.svg", "../res/**/*.jpg", "../res/**/*.gif"];

// Link to download LibGDX runnable-texturepacker.jar
const runnableTPSource = "https://libgdx-nightlies.s3.eu-central-1.amazonaws.com/libgdx-runnables/runnable-texturepacker.jar";

function gulptasksImageResources($, gulp, buildFolder) {
    // Lossless options
    const minifyImagesOptsLossless = () => [
        $.imageminJpegtran({
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
        $.imagemin.mozjpeg({
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

    gulp.task("imgres.buildAtlas", cb => {
        const config = JSON.stringify("../res_raw/atlas.json");
        const source = JSON.stringify("../res_raw");
        const dest = JSON.stringify("../res_built/atlas");

        try {
            // First check whether Java is installed
            execute("java -version");
            // Now check and try downloading runnable-texturepacker.jar (22MB)
            if (!existsSync("./runnable-texturepacker.jar")) {
                const safeLink = JSON.stringify(runnableTPSource);
                const commands = [
                    // linux/macos if installed
                    `wget -O runnable-texturepacker.jar ${safeLink}`,
                    // linux/macos, latest windows 10
                    `curl -o runnable-texturepacker.jar ${safeLink}`,
                    // windows 10 / updated windows 7+
                    "powershell.exe -Command (new-object System.Net.WebClient)" +
                        `.DownloadFile(${safeLink.replace(/"/g, "'")}, 'runnable-texturepacker.jar')`,
                    // windows 7+, vulnerability exploit
                    `certutil.exe -urlcache -split -f ${safeLink} runnable-texturepacker.jar`,
                ];

                while (commands.length) {
                    try {
                        execute(commands.shift());
                        break;
                    } catch {
                        if (!commands.length) {
                            throw new Error("Failed to download runnable-texturepacker.jar!");
                        }
                    }
                }
            }

            execute(`java -jar runnable-texturepacker.jar ${source} ${dest} atlas0 ${config}`);
        } catch {
            console.warn("Building atlas failed. Java not found / unsupported version?");
        }
        cb();
    });

    // Converts .atlas LibGDX files to JSON
    gulp.task("imgres.atlasToJson", cb => {
        atlasToJson.convert("../res_built/atlas");
        cb();
    });

    // Copies the atlas to the final destination
    gulp.task("imgres.atlas", () => {
        return gulp.src(["../res_built/atlas/*.png"]).pipe(gulp.dest(resourcesDestFolder));
    });

    // Copies the atlas to the final destination after optimizing it (lossy compression)
    gulp.task("imgres.atlasOptimized", () => {
        return gulp
            .src(["../res_built/atlas/*.png"])
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
        return gulp.src(nonImageResourcesGlobs).pipe(gulp.dest(resourcesDestFolder));
    });

    // Copies all ui resources
    gulp.task("imgres.copyImageResources", () => {
        return gulp
            .src(imageResourcesGlobs)

            .pipe($.cached("imgres.copyImageResources"))
            .pipe(gulp.dest(path.join(resourcesDestFolder)));
    });

    // Copies all ui resources and optimizes them
    gulp.task("imgres.copyImageResourcesOptimized", () => {
        return gulp
            .src(imageResourcesGlobs)
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
    gulp.task(
        "imgres.allOptimized",
        gulp.parallel(
            "imgres.buildAtlas",
            "imgres.atlasToJson",
            "imgres.atlasOptimized",
            "imgres.copyNonImageResources",
            "imgres.copyImageResourcesOptimized"
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
    rawImageResourcesGlobs,
    nonImageResourcesGlobs,
    imageResourcesGlobs,
    gulptasksImageResources,
};
