require("colors");
const packager = require("electron-packager");
const pj = require("../electron/package.json");
const path = require("path");
const { getVersion } = require("./buildutils");
const fs = require("fs");
const fse = require("fs-extra");
const buildutils = require("./buildutils");
const execSync = require("child_process").execSync;
const electronNotarize = require("electron-notarize");
const { signAsync } = require("tobspr-osx-sign");

function gulptasksStandalone($, gulp) {
    const targets = [
        {
            tempDestDir: path.join(__dirname, "..", "tmp_standalone_files"),
            suffix: "",
            taskPrefix: "",
            electronBaseDir: path.join(__dirname, "..", "electron"),
            steam: true,
        },
        {
            tempDestDir: path.join(__dirname, "..", "tmp_standalone_files_china"),
            suffix: "china",
            taskPrefix: "china.",
            electronBaseDir: path.join(__dirname, "..", "electron"),
            steam: true,
        },
        {
            tempDestDir: path.join(__dirname, "..", "tmp_standalone_files_wegame"),
            suffix: "wegame",
            taskPrefix: "wegame.",
            electronBaseDir: path.join(__dirname, "..", "electron_wegame"),
            steam: false,
        },
    ];

    for (const { tempDestDir, suffix, taskPrefix, electronBaseDir, steam } of targets) {
        const tempDestBuildDir = path.join(tempDestDir, "built");

        gulp.task(taskPrefix + "standalone.prepare.cleanup", () => {
            return gulp.src(tempDestDir, { read: false, allowEmpty: true }).pipe($.clean({ force: true }));
        });

        gulp.task(taskPrefix + "standalone.prepare.copyPrefab", () => {
            const requiredFiles = [
                path.join(electronBaseDir, "node_modules", "**", "*.*"),
                path.join(electronBaseDir, "node_modules", "**", ".*"),
                path.join(electronBaseDir, "wegame_sdk", "**", "*.*"),
                path.join(electronBaseDir, "wegame_sdk", "**", ".*"),
                path.join(electronBaseDir, "favicon*"),

                // fails on platforms which support symlinks
                // https://github.com/gulpjs/gulp/issues/1427
                // path.join(electronBaseDir, "node_modules", "**", "*"),
            ];
            if (steam) {
                requiredFiles.push(path.join(electronBaseDir, "steam_appid.txt"));
            }
            return gulp.src(requiredFiles, { base: electronBaseDir }).pipe(gulp.dest(tempDestBuildDir));
        });

        gulp.task(taskPrefix + "standalone.prepare.writePackageJson", cb => {
            const packageJsonString = JSON.stringify(
                {
                    scripts: {
                        start: pj.scripts.start,
                    },
                    devDependencies: pj.devDependencies,
                    dependencies: pj.dependencies,
                    optionalDependencies: pj.optionalDependencies,
                },
                null,
                4
            );

            fs.writeFileSync(path.join(tempDestBuildDir, "package.json"), packageJsonString);

            cb();
        });

        gulp.task(taskPrefix + "standalone.prepareVDF", cb => {
            if (!steam) {
                cb();
                return;
            }

            const hash = buildutils.getRevision();

            const steampipeDir = path.join(__dirname, "steampipe", "scripts");
            const templateContents = fs
                .readFileSync(path.join(steampipeDir, "app.vdf.template"), { encoding: "utf-8" })
                .toString();

            const convertedContents = templateContents.replace("$DESC$", "Commit " + hash);
            fs.writeFileSync(path.join(steampipeDir, "app.vdf"), convertedContents);

            cb();
        });

        gulp.task(taskPrefix + "standalone.prepareVDF.darwin", cb => {
            if (!steam) {
                cb();
                return;
            }

            const hash = buildutils.getRevision();
            const steampipeDir = path.join(__dirname, "steampipe-darwin", "scripts");
            const templateContents = fs
                .readFileSync(path.join(steampipeDir, "app.vdf.template"), { encoding: "utf-8" })
                .toString();

            const convertedContents = templateContents.replace("$DESC$", "Commit " + hash);
            fs.writeFileSync(path.join(steampipeDir, "app.vdf"), convertedContents);

            cb();
        });

        gulp.task(taskPrefix + "standalone.prepare.minifyCode", () => {
            return gulp.src(path.join(electronBaseDir, "*.js")).pipe(gulp.dest(tempDestBuildDir));
        });

        gulp.task(taskPrefix + "standalone.prepare.copyGamefiles", () => {
            return gulp.src("../build/**/*.*", { base: "../build" }).pipe(gulp.dest(tempDestBuildDir));
        });

        gulp.task(taskPrefix + "standalone.killRunningInstances", cb => {
            try {
                execSync("taskkill /F /IM shapezio.exe");
            } catch (ex) {
                console.warn("Failed to kill running instances, maybe none are up.");
            }
            cb();
        });

        gulp.task(
            taskPrefix + "standalone.prepare",
            gulp.series(
                taskPrefix + "standalone.killRunningInstances",
                taskPrefix + "standalone.prepare.cleanup",
                taskPrefix + "standalone.prepare.copyPrefab",
                taskPrefix + "standalone.prepare.writePackageJson",
                taskPrefix + "standalone.prepare.minifyCode",
                taskPrefix + "standalone.prepare.copyGamefiles"
            )
        );

        /**
         *
         * @param {'win32'|'linux'|'darwin'} platform
         * @param {'x64'|'ia32'} arch
         * @param {function():void} cb
         */
        function packageStandalone(platform, arch, cb, isRelease = true) {
            const tomlFile = fs.readFileSync(path.join(__dirname, ".itch.toml"));
            const privateArtifactsPath = "node_modules/shapez.io-private-artifacts";

            let asar = steam;
            if (steam && fs.existsSync(path.join(tempDestBuildDir, privateArtifactsPath))) {
                // @ts-expect-error
                asar = { unpackDir: privateArtifactsPath };
            }

            packager({
                dir: tempDestBuildDir,
                appCopyright: "tobspr Games",
                appVersion: getVersion(),
                buildVersion: "1.0.0",
                arch,
                platform,
                asar: asar,
                executableName: "shapezio",
                icon: path.join(electronBaseDir, "favicon"),
                name: "shapez.io-standalone" + suffix,
                out: tempDestDir,
                overwrite: true,
                appBundleId: "tobspr.shapezio.standalone",
                appCategoryType: "public.app-category.games",
                ...(isRelease &&
                    platform === "darwin" && {
                        osxSign: {
                            "identity": process.env.SHAPEZ_CLI_APPLE_CERT_NAME,
                            "hardenedRuntime": true,
                            "entitlements": "entitlements.plist",
                            "entitlements-inherit": "entitlements.plist",
                            "signatureFlags": ["library"],
                            "version": "16.0.7",
                        },
                        osxNotarize: {
                            appleId: process.env.SHAPEZ_CLI_APPLE_ID,
                            appleIdPassword: process.env.SHAPEZ_CLI_APPLE_APP_PW,
                        },
                    }),
            }).then(
                appPaths => {
                    console.log("Packages created:", appPaths);
                    appPaths.forEach(appPath => {
                        if (!fs.existsSync(appPath)) {
                            console.error("Bad app path gotten:", appPath);
                            return;
                        }

                        if (steam) {
                            fs.writeFileSync(
                                path.join(appPath, "LICENSE"),
                                fs.readFileSync(path.join(__dirname, "..", "LICENSE"))
                            );

                            fse.copySync(
                                path.join(tempDestBuildDir, "steam_appid.txt"),
                                path.join(appPath, "steam_appid.txt")
                            );

                            fs.writeFileSync(path.join(appPath, ".itch.toml"), tomlFile);

                            if (platform === "linux") {
                                fs.writeFileSync(
                                    path.join(appPath, "play.sh"),
                                    '#!/usr/bin/env bash\n./shapezio --no-sandbox "$@"\n'
                                );
                                fs.chmodSync(path.join(appPath, "play.sh"), 0o775);
                            }
                            if (platform === "darwin") {
                                if (!isRelease) {
                                    fse.copySync(
                                        path.join(tempDestBuildDir, "steam_appid.txt"),
                                        path.join(
                                            path.join(
                                                appPath,
                                                "shapez.io-standalone.app",
                                                "Contents",
                                                "MacOS"
                                            ),
                                            "steam_appid.txt"
                                        )
                                    );
                                }
                            }
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

        // Manual signing with patched @electron/osx-sign (we need --no-strict)
        gulp.task(taskPrefix + "standalone.package.prod.darwin64.signManually", cb =>
            packageStandalone(
                "darwin",
                "x64",
                () => {
                    const appFile = path.join(tempDestDir, "shapez.io-standalone-darwin-x64");
                    const appFileInner = path.join(appFile, "shapez.io-standalone.app");
                    const appIdDest = path.join(
                        path.join(appFileInner, "Contents", "MacOS"),
                        "steam_appid.txt"
                    );
                    console.warn("++ Preparing ++");
                    fse.copySync(path.join(tempDestBuildDir, "steam_appid.txt"), appIdDest);

                    console.warn("++ Signing ++");
                    console.warn("Signing steam_appid.txt");

                    execSync(
                        `codesign --force --verbose --options runtime --timestamp --no-strict --sign "${
                            process.env.SHAPEZ_CLI_APPLE_CERT_NAME
                        }" --entitlements "${path.join(__dirname, "entitlements.plist")}" ${appIdDest}`,
                        {
                            cwd: appFile,
                        }
                    );

                    console.warn("Base dir:", appFile);

                    signAsync({
                        app: appFileInner,
                        hardenedRuntime: true,
                        identity: process.env.SHAPEZ_CLI_APPLE_CERT_NAME,
                        strictVerify: false,

                        version: "16.0.7",
                        type: "distribution",
                        optionsForFile: f => {
                            return {
                                entitlements: path.join(__dirname, "entitlements.plist"),
                                hardenedRuntime: true,
                                signatureFlags: ["runtime"],
                            };
                        },
                    }).then(() => {
                        execSync(
                            `codesign --verify --verbose ${path.join(appFile, "shapez.io-standalone.app")}`,
                            {
                                cwd: appFile,
                            }
                        );

                        console.warn("++ Notarizing ++");
                        electronNotarize
                            .notarize({
                                appPath: path.join(appFile, "shapez.io-standalone.app"),
                                tool: "legacy",
                                appBundleId: "tobspr.shapezio.standalone",

                                appleId: process.env.SHAPEZ_CLI_APPLE_ID,
                                appleIdPassword: process.env.SHAPEZ_CLI_APPLE_APP_PW,
                                teamId: process.env.SHAPEZ_CLI_APPLE_TEAM_ID,
                            })
                            .then(() => {
                                console.warn("-> Notarized!");
                                cb();
                            });
                    });
                },
                false
            )
        );

        gulp.task(taskPrefix + "standalone.package.prod.win64", cb => packageStandalone("win32", "x64", cb));
        gulp.task(taskPrefix + "standalone.package.prod.linux64", cb =>
            packageStandalone("linux", "x64", cb)
        );
        gulp.task(taskPrefix + "standalone.package.prod.darwin64", cb =>
            packageStandalone("darwin", "x64", cb)
        );
        gulp.task(taskPrefix + "standalone.package.prod.darwin64.unsigned", cb =>
            packageStandalone("darwin", "x64", cb, false)
        );

        gulp.task(
            taskPrefix + "standalone.package.prod",
            gulp.series(
                taskPrefix + "standalone.prepare",
                gulp.parallel(
                    taskPrefix + "standalone.package.prod.win64",
                    taskPrefix + "standalone.package.prod.linux64",
                    taskPrefix + "standalone.package.prod.darwin64"
                )
            )
        );
    }
}

module.exports = { gulptasksStandalone };
