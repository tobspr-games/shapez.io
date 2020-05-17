/* eslint-disable */

const nodeVersion = process.versions.node.split(".")[0];
if (nodeVersion !== "10") {
    console.error("This cli requires exactly Node 10. You are using node " + nodeVersion);
    process.exit(1);
}

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
    "SHAPEZ_CLI_STAGING_FTP_USER",
    "SHAPEZ_CLI_STAGING_FTP_PW",
    "SHAPEZ_CLI_LIVE_FTP_USER",
    "SHAPEZ_CLI_LIVE_FTP_PW",
    // "SHAPEZ_CLI_TRANSREPORT_FTP_USER",
    // "SHAPEZ_CLI_TRANSREPORT_FTP_PW",
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

// FIXME
// const cordova = require("./cordova");
// cordova.gulptasksCordova($, gulp, buildFolder);

/////////////////////  BUILD TASKS  /////////////////////

// Cleans up everything
gulp.task("utils.cleanup", () => {
    return gulp.src(buildFolder, { read: false }).pipe($.clean({ force: true }));
});

// Requires no uncomitted files
gulp.task("utils.requireCleanWorkingTree", cb => {
    const output = $.trim(execSync("git status -su").toString("ascii"));
    if (output.length > 0) {
        console.error("\n\nYou have unstaged changes, please commit everything first!");
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

function serve({ standalone }) {
    browserSync.init({
        server: buildFolder,
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
    gulp.watch(["../src/**/*.scss"], ["css.dev"]);

    // Watch .html files, those trigger a html rebuild
    gulp.watch("../src/**/*.html", [standalone ? "html.standalone-dev" : "html.dev"]);

    // Watch sound files
    // gulp.watch(["../res_raw/sounds/**/*.mp3", "../res_raw/sounds/**/*.wav"], ["sounds.dev"]);

    gulp.watch(
        ["../res_raw/sounds/ui/*.mp3", "../res_raw/sounds/ui/*.wav"],
        $.sequence("sounds.encodeUi", "sounds.copy")
    );
    gulp.watch(
        ["../res_raw/sounds/game/*.mp3", "../res_raw/sounds/game/*.wav"],
        $.sequence("sounds.encodeGame", "sounds.copy")
    );
    gulp.watch(
        ["../res_raw/sounds/music/*.mp3", "../res_raw/sounds/music/*.wav"],
        $.sequence("sounds.encodeMusic", "sounds.copy")
    );

    // Watch resource files and copy them on change
    gulp.watch(imgres.nonImageResourcesGlobs, ["imgres.copyNonImageResources"]);
    gulp.watch(imgres.imageResourcesGlobs, ["imgres.copyImageResources"]);

    // Watch .atlas files and recompile the atlas on change
    gulp.watch("../res_built/atlas/*.json", ["imgres.atlas"]);

    // Watch the build folder and reload when anything changed
    const extensions = ["html", "js", "png", "jpg", "svg", "mp3", "ico", "woff2"];
    gulp.watch(extensions.map(ext => path.join(buildFolder, "**", "*." + ext))).on("change", function (e) {
        return gulp.src(e.path).pipe(browserSync.reload({ stream: true }));
    });

    // Start the webpack watching server (Will never return)
    if (standalone) {
        $.sequence("js.standalone-dev.watch")(() => true);
    } else {
        $.sequence("js.dev.watch")(() => true);
    }
}

// Live-development
gulp.task("main.serveDev", ["build.dev"], () => serve({ standalone: false }));
gulp.task("main.serveStandalone", ["build.standalone.dev"], () => serve({ standalone: true }));

gulp.task("default", ["main.serveDev"]);

/////////////////////  RUNNABLE TASKS  /////////////////////

// Pre and postbuild
gulp.task("step.baseResources", cb => $.multiProcess(["sounds.fullbuild", "imgres.allOptimized"], cb, false));
gulp.task("step.deleteEmpty", cb => {
    deleteEmpty.sync(buildFolder);
    cb();
});

gulp.task("step.postbuild", $.sequence("imgres.cleanupUnusedCssInlineImages", "step.deleteEmpty"));

// Builds everything (dev)
gulp.task("build.dev", cb => {
    $.sequence(
        "utils.cleanup",
        "utils.copyAdditionalBuildFiles",
        "imgres.atlas",
        "sounds.dev",
        "imgres.copyImageResources",
        "imgres.copyNonImageResources",
        "js.dev",
        "css.dev",
        "html.dev"
    )(cb);
});

// Builds everything (standalone -dev)
gulp.task("build.standalone.dev", cb => {
    $.sequence(
        "utils.cleanup",
        "imgres.atlas",
        "sounds.dev",
        "imgres.copyImageResources",
        "imgres.copyNonImageResources",
        "js.standalone-dev",
        "css.dev",
        "html.standalone-dev"
    )(cb);
});

// Builds everything (staging)
gulp.task("step.staging.code", $.sequence("js.staging"));
gulp.task("step.staging.mainbuild", cb =>
    $.multiProcess(["utils.copyAdditionalBuildFiles", "step.baseResources", "step.staging.code"], cb, false)
);
gulp.task("step.staging.all", $.sequence("step.staging.mainbuild", "css.prod", "html.staging"));
gulp.task("build.staging", $.sequence("utils.cleanup", "step.staging.all", "step.postbuild"));

// Builds everything (prod)
gulp.task("step.prod.code", $.sequence("js.prod"));
gulp.task("step.prod.mainbuild", cb =>
    $.multiProcess(["utils.copyAdditionalBuildFiles", "step.baseResources", "step.prod.code"], cb, false)
);
gulp.task("step.prod.all", $.sequence("step.prod.mainbuild", "css.prod", "html.prod"));
gulp.task("build.prod", $.sequence("utils.cleanup", "step.prod.all", "step.postbuild"));

// Builds everything (standalone-beta)
gulp.task("step.standalone-beta.code", $.sequence("js.standalone-beta"));
gulp.task("step.standalone-beta.mainbuild", cb =>
    $.multiProcess(
        ["utils.copyAdditionalBuildFiles", "step.baseResources", "step.standalone-beta.code"],
        cb,
        false
    )
);
gulp.task(
    "step.standalone-beta.all",
    $.sequence("step.standalone-beta.mainbuild", "css.prod-standalone", "html.standalone-beta")
);
gulp.task("build.standalone-beta", $.sequence("utils.cleanup", "step.standalone-beta.all", "step.postbuild"));

// Builds everything (standalone-prod)
gulp.task("step.standalone-prod.code", $.sequence("js.standalone-prod"));
gulp.task("step.standalone-prod.mainbuild", cb =>
    $.multiProcess(
        ["utils.copyAdditionalBuildFiles", "step.baseResources", "step.standalone-prod.code"],
        cb,
        false
    )
);
gulp.task(
    "step.standalone-prod.all",
    $.sequence("step.standalone-prod.mainbuild", "css.prod-standalone", "html.standalone-prod")
);
gulp.task("build.standalone-prod", $.sequence("utils.cleanup", "step.standalone-prod.all", "step.postbuild"));

// Deploying!
gulp.task(
    "main.deploy.staging",
    $.sequence("utils.requireCleanWorkingTree", "build.staging", "ftp.upload.staging")
);
gulp.task("main.deploy.prod", $.sequence("utils.requireCleanWorkingTree", "build.prod", "ftp.upload.prod"));
gulp.task("main.deploy.all", $.sequence("main.deploy.staging", "main.deploy.prod"));

// gulp.task("main.standalone.beta", $.sequence("build.standalone-beta", "standalone.package.beta"));
gulp.task("main.standalone", $.sequence("build.standalone-prod", "standalone.package.prod"));
