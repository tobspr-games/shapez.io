/* eslint-disable */

require("colors");

const gulp = require("gulp");
const browserSync = require("browser-sync").create({});
const path = require("path");
const deleteEmpty = require("delete-empty");
const execSync = require("child_process").execSync;

// Load other plugins dynamically
const $ = require("gulp-load-plugins")({
    scope: ["devDependencies"],
    pattern: "*",
});

// Check environment variables

const envVars = [
    "SHAPEZ_CLI_SERVER_HOST",
    "SHAPEZ_CLI_ALPHA_FTP_USER",
    "SHAPEZ_CLI_ALPHA_FTP_PW",
    "SHAPEZ_CLI_STAGING_FTP_USER",
    "SHAPEZ_CLI_STAGING_FTP_PW",
    "SHAPEZ_CLI_LIVE_FTP_USER",
    "SHAPEZ_CLI_LIVE_FTP_PW",
    "SHAPEZ_CLI_APPLE_ID",
    "SHAPEZ_CLI_APPLE_CERT_NAME",
    "SHAPEZ_CLI_GITHUB_USER",
    "SHAPEZ_CLI_GITHUB_TOKEN",
];

for (let i = 0; i < envVars.length; ++i) {
    if (!process.env[envVars[i]]) {
        console.warn("Unset environment variable, might cause issues:", envVars[i]);
    }
}

const baseDir = path.join(__dirname, "..");
const buildFolder = path.join(baseDir, "build");
const buildOuptutFolder = path.join(baseDir, "build_output");

const imgres = require("./image-resources");
imgres.gulptasksImageResources($, gulp, buildFolder);

const css = require("./css");
css.gulptasksCSS($, gulp, buildFolder, browserSync);

const sounds = require("./sounds");
sounds.gulptasksSounds($, gulp, buildFolder);

const localConfig = require("./local-config");
localConfig.gulptasksLocalConfig($, gulp);

const js = require("./js");
js.gulptasksJS($, gulp, buildFolder, browserSync);

const html = require("./html");
html.gulptasksHTML($, gulp, buildFolder);

const ftp = require("./ftp");
ftp.gulptasksFTP($, gulp, buildFolder);

const docs = require("./docs");
docs.gulptasksDocs($, gulp, buildFolder);

const standalone = require("./standalone");
standalone.gulptasksStandalone($, gulp);

const translations = require("./translations");
const { BUILD_VARIANTS } = require("./build_variants");
translations.gulptasksTranslations($, gulp);

/////////////////////  BUILD TASKS  /////////////////////

// Cleans up everything
gulp.task("utils.cleanBuildFolder", () => {
    return gulp.src(buildFolder, { read: false, allowEmpty: true }).pipe($.clean({ force: true }));
});
gulp.task("utils.cleanBuildOutputFolder", () => {
    return gulp.src(buildOuptutFolder, { read: false, allowEmpty: true }).pipe($.clean({ force: true }));
});
gulp.task("utils.cleanBuildTempFolder", () => {
    return gulp
        .src(path.join(__dirname, "..", "src", "js", "built-temp"), { read: false, allowEmpty: true })
        .pipe($.clean({ force: true }));
});
gulp.task("utils.cleanImageBuildFolder", () => {
    return gulp
        .src(path.join(__dirname, "res_built"), { read: false, allowEmpty: true })
        .pipe($.clean({ force: true }));
});

gulp.task(
    "utils.cleanup",
    gulp.series("utils.cleanBuildFolder", "utils.cleanImageBuildFolder", "utils.cleanBuildTempFolder")
);

// Requires no uncomitted files
gulp.task("utils.requireCleanWorkingTree", cb => {
    let output = $.trim(execSync("git status -su").toString("ascii")).replace(/\r/gi, "").split("\n");

    // Filter files which are OK to be untracked
    output = output
        .map(x => x.replace(/[\r\n]+/gi, ""))
        .filter(x => x.indexOf(".local.js") < 0)
        .filter(x => x.length > 0);
    if (output.length > 0) {
        console.error("\n\nYou have unstaged changes, please commit everything first!");
        console.error("Unstaged files:");
        console.error(output.map(x => "'" + x + "'").join("\n"));
        process.exit(1);
    }
    cb();
});

gulp.task("utils.copyAdditionalBuildFiles", cb => {
    const additionalFolder = path.join("additional_build_files");
    const additionalSrcGlobs = [
        path.join(additionalFolder, "**/*.*"),
        path.join(additionalFolder, "**/.*"),
        path.join(additionalFolder, "**/*"),
    ];

    return gulp.src(additionalSrcGlobs).pipe(gulp.dest(buildFolder));
});

// Starts a webserver on the built directory (useful for testing prod build)
gulp.task("main.webserver", () => {
    return gulp.src(buildFolder).pipe(
        $.webserver({
            livereload: {
                enable: true,
            },
            directoryListing: false,
            open: true,
            port: 3005,
        })
    );
});

/**
 *
 * @param {object} param0
 * @param {keyof typeof BUILD_VARIANTS} param0.version
 */
function serveHTML({ version = "web-dev" }) {
    browserSync.init({
        server: [buildFolder, path.join(baseDir, "mod_examples")],
        port: 3005,
        ghostMode: {
            clicks: false,
            scroll: false,
            location: false,
            forms: false,
        },
        logLevel: "info",
        logPrefix: "BS",
        online: false,
        xip: false,
        notify: false,
        reloadDebounce: 100,
        reloadOnRestart: true,
        watchEvents: ["add", "change"],
    });

    // Watch .scss files, those trigger a css rebuild
    gulp.watch(["../src/**/*.scss"], gulp.series("css.dev"));

    // Watch .html files, those trigger a html rebuild
    gulp.watch("../src/**/*.html", gulp.series("html." + version + ".dev"));
    gulp.watch("./preloader/*.*", gulp.series("html." + version + ".dev"));

    // Watch translations
    gulp.watch("../translations/**/*.yaml", gulp.series("translations.convertToJson"));

    gulp.watch(
        ["../res_raw/sounds/sfx/*.mp3", "../res_raw/sounds/sfx/*.wav"],
        gulp.series("sounds.sfx", "sounds.copy")
    );
    gulp.watch(
        ["../res_raw/sounds/music/*.mp3", "../res_raw/sounds/music/*.wav"],
        gulp.series("sounds.music", "sounds.copy")
    );

    // Watch resource files and copy them on change
    gulp.watch(imgres.rawImageResourcesGlobs, gulp.series("imgres.buildAtlas"));
    gulp.watch(imgres.nonImageResourcesGlobs, gulp.series("imgres.copyNonImageResources"));
    gulp.watch(imgres.imageResourcesGlobs, gulp.series("imgres.copyImageResources"));

    // Watch .atlas files and recompile the atlas on change
    gulp.watch("../res_built/atlas/*.atlas", gulp.series("imgres.atlasToJson"));
    gulp.watch("../res_built/atlas/*.json", gulp.series("imgres.atlas"));

    // Watch the build folder and reload when anything changed
    const extensions = ["html", "js", "png", "gif", "jpg", "svg", "mp3", "ico", "woff2", "json"];
    gulp.watch(extensions.map(ext => path.join(buildFolder, "**", "*." + ext))).on("change", function (path) {
        return gulp.src(path).pipe(browserSync.reload({ stream: true }));
    });

    gulp.watch("../src/js/built-temp/*.json").on("change", function (path) {
        return gulp.src(path).pipe(browserSync.reload({ stream: true }));
    });

    gulp.series("js." + version + ".dev.watch")(() => true);
}

// Pre and postbuild
gulp.task("step.baseResources", gulp.series("imgres.allOptimized"));
gulp.task("step.deleteEmpty", cb => {
    deleteEmpty.sync(buildFolder);
    cb();
});

gulp.task("step.postbuild", gulp.series("imgres.cleanupUnusedCssInlineImages", "step.deleteEmpty"));

/////////////////////  RUNNABLE TASKS  /////////////////////

// Builds everything (dev)
gulp.task(
    "build.prepare.dev",
    gulp.series(
        "utils.cleanup",
        "utils.copyAdditionalBuildFiles",
        "localConfig.findOrCreate",
        "imgres.buildAtlas",
        "imgres.atlasToJson",
        "imgres.atlas",
        "sounds.dev",
        "imgres.copyImageResources",
        "imgres.copyNonImageResources",
        "translations.fullBuild",
        "css.dev"
    )
);

// Builds everything for every variant
for (const variant in BUILD_VARIANTS) {
    const data = BUILD_VARIANTS[variant];
    const buildName = "build." + variant;

    // build
    gulp.task(
        buildName + ".code",
        gulp.series(
            data.standalone ? "sounds.fullbuildHQ" : "sounds.fullbuild",
            "translations.fullBuild",
            "js." + variant + ".prod"
        )
    );

    gulp.task(buildName + ".resourcesAndCode", gulp.parallel("step.baseResources", buildName + ".code"));

    gulp.task(
        buildName + ".all",
        gulp.series(buildName + ".resourcesAndCode", "css.prod-standalone", "html." + variant + ".prod")
    );

    gulp.task(buildName, gulp.series("utils.cleanup", buildName + ".all", "step.postbuild"));

    // bundle
    if (data.standalone) {
        gulp.task(
            "bundle." + variant + ".from-windows",
            gulp.series(buildName, "standalone." + variant + ".build-from-windows")
        );
        gulp.task(
            "bundle." + variant + ".from-darwin",
            gulp.series(buildName, "standalone." + variant + ".build-from-darwin")
        );
    }

    // serve
    gulp.task(
        "serve." + variant,
        gulp.series("build.prepare.dev", "html." + variant + ".dev", () => serveHTML({ version: variant }))
    );
}

// Deploying!
gulp.task(
    "deploy.staging",
    gulp.series("utils.requireCleanWorkingTree", "build.web-shapezio-beta", "ftp.upload.staging")
);
gulp.task(
    "deploy.prod",
    gulp.series("utils.requireCleanWorkingTree", "build.web-shapezio", "ftp.upload.prod")
);

// Bundling (pre upload)
gulp.task(
    "bundle.steam.from-darwin",
    gulp.series("utils.cleanBuildOutputFolder", "bundle.standalone-steam.from-darwin")
);
gulp.task(
    "bundle.steam.from-windows",
    gulp.series("utils.cleanBuildOutputFolder", "bundle.standalone-steam.from-windows")
);

// Default task (dev, localhost)
gulp.task("default", gulp.series("serve.web-localhost"));
