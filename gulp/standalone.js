const packager = require("electron-packager");
const path = require("path");
const buildutils = require("./buildutils");
const fs = require("fs");
const fse = require("fs-extra");
const execSync = require("child_process").execSync;

function gulptasksStandalone($, gulp, buildFolder) {
    const electronBaseDir = path.join("../electron");

    const tempDestDir = path.join("..", "tmp_standalone_files");
    const tempDestBuildDir = path.join(tempDestDir, "built");

    gulp.task("standalone.prepare.cleanup", () => {
        return gulp.src(tempDestDir, { read: false }).pipe($.clean({ force: true }));
    });

    gulp.task("standalone.prepare.copyPrefab", () => {
        // const requiredFiles = $.glob.sync("../electron/");
        const requiredFiles = [
            path.join(electronBaseDir, "lib", "**", "*.node"),
            path.join(electronBaseDir, "node_modules", "**", "*.*"),
            path.join(electronBaseDir, "node_modules", "**", ".*"),
            path.join(electronBaseDir, "node_modules", "**", "*"),
            path.join(electronBaseDir, "favicon*"),
        ];
        return gulp.src(requiredFiles, { base: electronBaseDir }).pipe(gulp.dest(tempDestBuildDir));
    });

    gulp.task("standalone.prepare.writePackageJson", () => {
        fs.writeFileSync(
            path.join(tempDestBuildDir, "package.json"),
            JSON.stringify(
                {
                    devDependencies: {
                        electron: "6.0.10",
                    },
                },
                null,
                4
            )
        );
    });

    gulp.task("standalone.prepare.minifyCode", () => {
        return gulp
            .src(path.join(electronBaseDir, "*.js"))
            .pipe(
                $.terser({
                    ecma: 6,
                    parse: {},
                    module: false,
                    toplevel: true,
                    keep_classnames: false,
                    keep_fnames: false,
                    safari10: false,
                    compress: {
                        arguments: false, // breaks
                        drop_console: false,
                        // keep_fargs: false,
                        keep_infinity: true,
                        passes: 2,
                        module: false,
                        toplevel: true,
                        unsafe_math: true,
                        unsafe_arrows: false,
                        warnings: true,
                    },
                    mangle: {
                        eval: true,
                        keep_classnames: false,
                        keep_fnames: false,
                        module: false,
                        toplevel: true,
                        safari10: false,
                    },
                    output: {
                        comments: false,
                        ascii_only: true,
                        beautify: false,
                        braces: false,
                        ecma: 6,
                    },
                })
            )
            .pipe(gulp.dest(tempDestBuildDir));
    });

    gulp.task("standalone.prepare.copyGamefiles", () => {
        return gulp.src("../../www/**/*.*", { base: "../../www" }).pipe(gulp.dest(tempDestBuildDir));
    });

    gulp.task("standalone.killRunningInstances", () => {
        try {
            execSync("taskkill /F /IM shapezio.exe");
        } catch (ex) {
            console.warn("Failed to kill running instances, maybe none are up.");
        }
    });

    gulp.task(
        "standalone.prepare",
        $.sequence(
            "standalone.killRunningInstances",
            "standalone.prepare.cleanup",
            "standalone.prepare.copyPrefab",
            "standalone.prepare.writePackageJson",
            "standalone.prepare.minifyCode",
            "standalone.prepare.copyGamefiles"
        )
    );

    /**
     *
     * @param {'win32'|'linux'|'darwin'} platform
     * @param {'x64'|'ia32'} arch
     * @param {function():void} cb
     * @param {boolean=} isRelease
     */
    function packageStandalone(platform, arch, cb, isRelease = false) {
        const libDirName = (platform === "win32" ? "win" : platform) + (arch === "x64" ? "64" : "32");

        const libDir = path.join(electronBaseDir, "lib", libDirName);
        if (!fs.existsSync(libDir)) {
            console.error("FATAL ERROR: LIB DIR does not exist:", libDir);
            cb();
            return;
        }

        packager({
            dir: tempDestBuildDir,
            appCopyright: "Tobias Springer IT Solutions",
            appVersion: buildutils.getVersion(),
            buildVersion: "1.0.0",
            arch,
            platform,
            asar: true,
            executableName: "shapezio",
            icon: path.join(electronBaseDir, "favicon"),
            name: "Shapez.io Standalone",
            out: tempDestDir,
            overwrite: true,
            appBundleId: "io.shapez.standalone",
            appCategoryType: "public.app-category.games",
        }).then(
            appPaths => {
                console.log("Packages created:", appPaths);
                appPaths.forEach(appPath => {
                    if (!fs.existsSync(appPath)) {
                        console.error("Bad app path gotten:", appPath);
                        return;
                    }

                    console.log("Copying lib files to", appPath);
                    const libFiles = $.glob.sync(path.join("**", "*.+(dylib|so|dll|lib)"), { cwd: libDir });
                    libFiles.forEach(f => {
                        console.log(" -> Copying", f);
                        fs.copyFileSync(path.join(libDir, f), path.join(appPath, f));
                    });

                    const playablePath = appPath + "_PLAYABLE";
                    fse.copySync(appPath, playablePath);
                    fs.writeFileSync(path.join(playablePath, "steam_appid.txt"), "1134480");
                    fs.writeFileSync(
                        path.join(playablePath, "play.bat"),
                        "start shapezio --dev --disable-direct-composition --in-process-gpu\r\n"
                    );
                    fs.writeFileSync(
                        path.join(playablePath, "play_local.bat"),
                        "start shapezio --local --dev --disable-direct-composition --in-process-gpu\r\n"
                    );
                });

                cb();
            },
            err => {
                console.error("Packaging error:", err);
                cb();
            }
        );
    }

    // gulp.task("standalone.package.beta.win64", (cb) => packageStandalone("win32", "x64", cb));
    // gulp.task("standalone.package.beta.win32", (cb) => packageStandalone("win32", "ia32", cb));
    // gulp.task("standalone.package.beta.linux64", (cb) => packageStandalone("linux", "x64", cb));
    // gulp.task("standalone.package.beta.linux32", (cb) => packageStandalone("linux", "ia32", cb));
    // gulp.task("standalone.package.beta.darwin64", (cb) => packageStandalone("darwin", "x64", cb));

    // gulp.task("standalone.package.beta", $.sequence("standalone.prepare", [
    //     "standalone.package.beta.win64",
    // "standalone.package.beta.win32",
    // "standalone.package.beta.linux64",
    // "standalone.package.beta.linux32",
    // "standalone.package.beta.darwin64"
    // ]));

    gulp.task("standalone.package.prod.win64", cb => packageStandalone("win32", "x64", cb, true));
    gulp.task("standalone.package.prod.win32", cb => packageStandalone("win32", "ia32", cb, true));
    gulp.task("standalone.package.prod.linux64", cb => packageStandalone("linux", "x64", cb, true));
    gulp.task("standalone.package.prod.linux32", cb => packageStandalone("linux", "ia32", cb, true));
    gulp.task("standalone.package.prod.darwin64", cb => packageStandalone("darwin", "x64", cb, true));

    gulp.task(
        "standalone.package.prod",
        $.sequence("standalone.prepare", [
            "standalone.package.prod.win64",
            // "standalone.package.prod.win32",
            // "standalone.package.prod.linux64",
            // "standalone.package.prod.linux32",
            // "standalone.package.prod.darwin64"
        ])
    );
}

module.exports = { gulptasksStandalone };
