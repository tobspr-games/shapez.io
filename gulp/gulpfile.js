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
    // "SHAPEZ_CLI_PHONEGAP_KEY",
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
        console.warn("Please set", envVars[i]);
        // process.exit(1);
    }
}

const baseDir = path.join(__dirname, "..");
const buildFolder = path.join(baseDir, "build");

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
html.gulptasksHTML($, gulp, buildFolder, browserSync);

const ftp = require("./ftp");
ftp.gulptasksFTP($, gulp, buildFolder);

const docs = require("./docs");
docs.gulptasksDocs($, gulp, buildFolder);

const standalone = require("./standalone");
standalone.gulptasksStandalone($, gulp, buildFolder);

const releaseUploader = require("./release-uploader");
releaseUploader.gulptasksReleaseUploader($, gulp, buildFolder);

const translations = require("./translations");
translations.gulptasksTranslations($, gulp, buildFolder);

/////////////////////  BUILD TASKS  /////////////////////

// Cleans up everything
gulp.task("utils.cleanBuildFolder", () => {
    return gulp.src(buildFolder, { read: false, allowEmpty: true }).pipe($.clean({ force: true }));
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
 * @param {"web"|"standalone"|"china"|"wegame"} param0.version
 */
function serve({ version = "web" }) {
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
    gulp.watch("../src/**/*.html", gulp.series(version === "web" ? "html.dev" : "html.standalone-dev"));

    // Watch sound files
    // gulp.watch(["../res_raw/sounds/**/*.mp3", "../res_raw/sounds/**/*.wav"], gulp.series("sounds.dev"));

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

    switch (version) {
        case "web": {
            gulp.series("js.dev.watch")(() => true);
            break;
        }
        case "standalone": {
            gulp.series("js.standalone-dev.watch")(() => true);
            break;
        }
        case "china": {
            gulp.series("china.js.dev.watch")(() => true);
            break;
        }
        case "wegame": {
            gulp.series("wegame.js.dev.watch")(() => true);
            break;
        }
        default: {
            throw new Error("Unknown version " + version);
        }
    }
}

/////////////////////  RUNNABLE TASKS  /////////////////////

// Pre and postbuild
gulp.task("step.baseResources", gulp.series("imgres.allOptimized"));
gulp.task("step.deleteEmpty", cb => {
    deleteEmpty.sync(buildFolder);
    cb();
});

gulp.task("step.postbuild", gulp.series("imgres.cleanupUnusedCssInlineImages", "step.deleteEmpty"));

// Builds everything (dev)
gulp.task(
    "build.dev",
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
        "css.dev",
        "html.dev"
    )
);

// Builds everything (standalone -dev)
gulp.task(
    "build.standalone.dev",
    gulp.series(
        "utils.cleanup",
        "localConfig.findOrCreate",
        "imgres.buildAtlas",
        "imgres.atlasToJson",
        "imgres.atlas",
        "sounds.dev",
        "imgres.copyImageResources",
        "imgres.copyNonImageResources",
        "translations.fullBuild",
        "css.dev",
        "html.standalone-dev"
    )
);

// Builds everything (staging)
gulp.task("step.staging.code", gulp.series("sounds.fullbuild", "translations.fullBuild", "js.staging"));
gulp.task(
    "step.staging.mainbuild",
    gulp.parallel("utils.copyAdditionalBuildFiles", "step.baseResources", "step.staging.code")
);
gulp.task("step.staging.all", gulp.series("step.staging.mainbuild", "css.prod", "html.staging"));
gulp.task("build.staging", gulp.series("utils.cleanup", "step.staging.all", "step.postbuild"));

// Builds everything (prod)
gulp.task("step.prod.code", gulp.series("sounds.fullbuild", "translations.fullBuild", "js.prod"));
gulp.task(
    "step.prod.mainbuild",
    gulp.parallel("utils.copyAdditionalBuildFiles", "step.baseResources", "step.prod.code")
);
gulp.task("step.prod.all", gulp.series("step.prod.mainbuild", "css.prod", "html.prod"));
gulp.task("build.prod", gulp.series("utils.cleanup", "step.prod.all", "step.postbuild"));

// Builds everything (standalone-beta)
gulp.task(
    "step.standalone-beta.code",
    gulp.series("sounds.fullbuildHQ", "translations.fullBuild", "js.standalone-beta")
);
gulp.task("step.standalone-beta.mainbuild", gulp.parallel("step.baseResources", "step.standalone-beta.code"));
gulp.task(
    "step.standalone-beta.all",
    gulp.series("step.standalone-beta.mainbuild", "css.prod-standalone", "html.standalone-beta")
);
gulp.task(
    "build.standalone-beta",
    gulp.series("utils.cleanup", "step.standalone-beta.all", "step.postbuild")
);

// Builds everything (standalone-prod)

for (const prefix of ["", "china.", "wegame."]) {
    gulp.task(
        prefix + "step.standalone-prod.code",
        gulp.series("sounds.fullbuildHQ", "translations.fullBuild", prefix + "js.standalone-prod")
    );

    gulp.task(
        prefix + "step.standalone-prod.mainbuild",
        gulp.parallel("step.baseResources", prefix + "step.standalone-prod.code")
    );

    gulp.task(
        prefix + "step.standalone-prod.all",
        gulp.series(prefix + "step.standalone-prod.mainbuild", "css.prod-standalone", "html.standalone-prod")
    );

    gulp.task(
        prefix + "build.standalone-prod",
        gulp.series("utils.cleanup", prefix + "step.standalone-prod.all", "step.postbuild")
    );
}

// OS X build and release upload
gulp.task(
    "build.darwin64-prod",
    gulp.series(
        "build.standalone-prod",
        "standalone.prepare",
        "standalone.package.prod.darwin64.signManually"
    )
);

// Deploying!
gulp.task(
    "main.deploy.alpha",
    gulp.series("utils.requireCleanWorkingTree", "build.staging", "ftp.upload.alpha")
);
gulp.task(
    "main.deploy.staging",
    gulp.series("utils.requireCleanWorkingTree", "build.staging", "ftp.upload.staging")
);
gulp.task("main.deploy.prod", gulp.series("utils.requireCleanWorkingTree", "build.prod", "ftp.upload.prod"));
gulp.task("main.deploy.all", gulp.series("main.deploy.staging", "main.deploy.prod"));

// steam
gulp.task("regular.main.standalone", gulp.series("build.standalone-prod", "standalone.package.prod"));

// china
gulp.task(
    "china.main.standalone",
    gulp.series("china.build.standalone-prod", "china.standalone.package.prod")
);

// wegame
gulp.task(
    "wegame.main.standalone",
    gulp.series("wegame.build.standalone-prod", "wegame.standalone.package.prod")
);

// all (except wegame)
gulp.task("standalone.steam", gulp.series("regular.main.standalone", "china.main.standalone"));
gulp.task(
    "standalone.all",
    gulp.series("regular.main.standalone", "china.main.standalone", "wegame.main.standalone")
);

// Live-development
gulp.task(
    "main.serveDev",
    gulp.series("build.dev", () => serve({ version: "web" }))
);
gulp.task(
    "main.serveStandalone",
    gulp.series("build.standalone.dev", () => serve({ version: "standalone" }))
);
gulp.task(
    "china.main.serveDev",
    gulp.series("build.dev", () => serve({ version: "china" }))
);
gulp.task(
    "wegame.main.serveDev",
    gulp.series("build.dev", () => serve({ version: "wegame" }))
);

gulp.task("default", gulp.series("main.serveDev"));
