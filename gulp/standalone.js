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
            path.join(electronBaseDir, "favicon*"),

            // fails on platforms which support symlinks
            // https://github.com/gulpjs/gulp/issues/1427
            // path.join(electronBaseDir, "node_modules", "**", "*"),
        ];
        return gulp.src(requiredFiles, { base: electronBaseDir }).pipe(gulp.dest(tempDestBuildDir));
    });

    gulp.task("standalone.prepare.writePackageJson", () => {
        fs.writeFileSync(
            path.join(tempDestBuildDir, "package.json"),
            JSON.stringify(
                {
                    devDependencies: {
                        electron: "6.1.12",
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
        return gulp.src("../build/**/*.*", { base: "../build" }).pipe(gulp.dest(tempDestBuildDir));
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
        packager({
            dir: tempDestBuildDir,
            appCopyright: "Tobias Springer",
            appVersion: buildutils.getVersion(),
            buildVersion: "1.0.0",
            arch,
            platform,
            asar: true,
            executableName: "shapezio",
            icon: path.join(electronBaseDir, "favicon"),
            name: "shapez.io-standalone",
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

                    fs.writeFileSync(
                        path.join(appPath, "LICENSE"),
                        fs.readFileSync(path.join(__dirname, "..", "LICENSE"))
                    );

                    const playablePath = appPath + "_playable";
                    fse.copySync(appPath, playablePath);
                    fs.writeFileSync(path.join(playablePath, "steam_appid.txt"), "1134480");
                    switch (platform) {
                        case 'win32':
                            fs.writeFileSync(
                                path.join(playablePath, "play.bat"),
                                "start shapezio --dev --disable-direct-composition --in-process-gpu\r\n"
                            );
                            fs.writeFileSync(
                                path.join(playablePath, "play_local.bat"),
                                "start shapezio --local --dev --disable-direct-composition --in-process-gpu\r\n"
                            );
                            break;
                        case 'linux':
                            fs.writeFileSync(
                                path.join(playablePath, "play.sh"),
                                "./shapezio --dev --disable-direct-composition --in-process-gpu\r\n"
                            );
                            fs.chmodSync(
                                path.join(playablePath, "play.sh"),
                                0o775
                            )
                            fs.writeFileSync(
                                path.join(playablePath, "play_local.sh"),
                                "./shapezio --local --dev --disable-direct-composition --in-process-gpu\r\n"
                            );
                            fs.chmodSync(
                                path.join(playablePath, "play_local.sh"),
                                0o775
                            )
                            break

                        default:
                            break;
                    }
                });

                cb();
            },
            err => {
                console.error("Packaging error:", err);
                cb();
            }
        );
    }

    gulp.task("standalone.package.prod.win64", cb => packageStandalone("win32", "x64", cb, true));
    gulp.task("standalone.package.prod.win32", cb => packageStandalone("win32", "ia32", cb, true));
    gulp.task("standalone.package.prod.linux64", cb => packageStandalone("linux", "x64", cb, true));
    gulp.task("standalone.package.prod.linux32", cb => packageStandalone("linux", "ia32", cb, true));
    gulp.task("standalone.package.prod.darwin64", cb => packageStandalone("darwin", "x64", cb, true));

    gulp.task(
        "standalone.package.prod",
        $.sequence("standalone.prepare", [
            "standalone.package.prod.win64",
<<<<<<< HEAD
            // "standalone.package.prod.linux64",
            // "standalone.package.prod.win32",
=======
            // "standalone.package.prod.win32",
            "standalone.package.prod.linux64",
>>>>>>> Add linux build to standalone.package.prod.
            // "standalone.package.prod.linux32",
            // "standalone.package.prod.darwin64"
        ])
    );
}

module.exports = { gulptasksStandalone };
