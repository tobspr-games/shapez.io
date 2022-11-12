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
const { BUILD_VARIANTS } = require("./build_variants");

let signAsync;
try {
    signAsync = require("tobspr-osx-sign").signAsync;
} catch (ex) {
    console.warn("tobspr-osx-sign not installed, can not create osx builds");
}

function gulptasksStandalone($, gulp) {
    for (const variant in BUILD_VARIANTS) {
        const variantData = BUILD_VARIANTS[variant];
        if (!variantData.standalone) {
            continue;
        }
        const tempDestDir = path.join(__dirname, "..", "build_output", variant);
        const taskPrefix = "standalone." + variant;
        const electronBaseDir = path.join(__dirname, "..", variantData.electronBaseDir || "electron");
        const tempDestBuildDir = path.join(tempDestDir, "built");

        gulp.task(taskPrefix + ".prepare.cleanup", () => {
            return gulp.src(tempDestDir, { read: false, allowEmpty: true }).pipe($.clean({ force: true }));
        });

        gulp.task(taskPrefix + ".prepare.copyPrefab", () => {
            const requiredFiles = [
                path.join(electronBaseDir, "node_modules", "**", "*.*"),
                path.join(electronBaseDir, "node_modules", "**", ".*"),
                path.join(electronBaseDir, "favicon*"),
            ];
            return gulp.src(requiredFiles, { base: electronBaseDir }).pipe(gulp.dest(tempDestBuildDir));
        });

        gulp.task(taskPrefix + ".prepare.writeAppId", cb => {
            if (variantData.steamAppId) {
                fs.writeFileSync(
                    path.join(tempDestBuildDir, "steam_appid.txt"),
                    String(variantData.steamAppId)
                );
            }
            cb();
        });

        gulp.task(taskPrefix + ".prepare.writePackageJson", cb => {
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

        gulp.task(taskPrefix + ".prepare.minifyCode", () => {
            return gulp.src(path.join(electronBaseDir, "*.js")).pipe(gulp.dest(tempDestBuildDir));
        });

        gulp.task(taskPrefix + ".prepare.copyGamefiles", () => {
            return gulp.src("../build/**/*.*", { base: "../build" }).pipe(gulp.dest(tempDestBuildDir));
        });

        gulp.task(taskPrefix + ".killRunningInstances", cb => {
            try {
                execSync("taskkill /F /IM shapezio.exe");
            } catch (ex) {
                console.warn("Failed to kill running instances, maybe none are up.");
            }
            cb();
        });

        gulp.task(
            taskPrefix + ".prepare",
            gulp.series(
                taskPrefix + ".killRunningInstances",
                taskPrefix + ".prepare.cleanup",
                taskPrefix + ".prepare.copyPrefab",
                taskPrefix + ".prepare.writePackageJson",
                taskPrefix + ".prepare.minifyCode",
                taskPrefix + ".prepare.copyGamefiles",
                taskPrefix + ".prepare.writeAppId"
            )
        );

        /**
         *
         * @param {'win32'|'linux'|'darwin'} platform
         * @param {'x64'|'ia32'} arch
         * @param {function():void} cb
         */
        function packageStandalone(platform, arch, cb, isRelease = true) {
            const privateArtifactsPath = "node_modules/shapez.io-private-artifacts";

            // Only use asar on steam builds (not supported by wegame)
            let asar = Boolean(variantData.steamAppId);

            // Unpack private artifacts though
            if (asar && fs.existsSync(path.join(tempDestBuildDir, privateArtifactsPath))) {
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
                name: "shapez",
                out: tempDestDir,
                overwrite: true,
                appBundleId: "tobspr.shapezio." + variant,
                appCategoryType: "public.app-category.games",
                ...(isRelease &&
                    platform === "darwin" && {
                        osxSign: {
                            "identity": process.env.SHAPEZ_CLI_APPLE_CERT_NAME,
                            "hardenedRuntime": true,
                            "entitlements": "entitlements.plist",
                            "entitlements-inherit": "entitlements.plist",
                            // @ts-ignore
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
                            console.error("Bad app path:", appPath);
                            return;
                        }

                        if (variantData.steamAppId) {
                            fs.writeFileSync(
                                path.join(appPath, "LICENSE"),
                                fs.readFileSync(path.join(__dirname, "..", "LICENSE"))
                            );

                            fs.writeFileSync(
                                path.join(appPath, "steam_appid.txt"),
                                String(variantData.steamAppId)
                            );

                            if (platform === "linux") {
                                // Write launcher script
                                fs.writeFileSync(
                                    path.join(appPath, "play.sh"),
                                    '#!/usr/bin/env bash\n./shapezio --no-sandbox "$@"\n'
                                );
                                fs.chmodSync(path.join(appPath, "play.sh"), 0o775);
                            }

                            if (platform === "darwin") {
                                if (!isRelease) {
                                    // Needs special location
                                    fs.writeFileSync(
                                        path.join(
                                            appPath,
                                            "shapez.app",
                                            "Contents",
                                            "MacOS",
                                            "steam_appid.txt"
                                        ),
                                        String(variantData.steamAppId)
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
        gulp.task(taskPrefix + ".package.darwin64", cb =>
            packageStandalone(
                "darwin",
                "x64",
                () => {
                    const appFile = path.join(tempDestDir, "shapez-darwin-x64");
                    const appFileInner = path.join(appFile, "shapez.app");
                    console.warn("++ Signing ++");

                    if (variantData.steamAppId) {
                        const appIdDest = path.join(
                            path.join(appFileInner, "Contents", "MacOS"),
                            "steam_appid.txt"
                        );
                        // console.warn("++ Preparing ++");
                        // fse.copySync(path.join(tempDestBuildDir, "steam_appid.txt"), appIdDest);

                        console.warn("Signing steam_appid.txt");

                        execSync(
                            `codesign --force --verbose --options runtime --timestamp --no-strict --sign "${
                                process.env.SHAPEZ_CLI_APPLE_CERT_NAME
                            }" --entitlements "${path.join(__dirname, "entitlements.plist")}" ${appIdDest}`,
                            {
                                cwd: appFile,
                            }
                        );
                    }

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
                        execSync(`codesign --verify --verbose ${path.join(appFile, "shapez.app")}`, {
                            cwd: appFile,
                        });

                        console.warn("++ Notarizing ++");
                        electronNotarize
                            .notarize({
                                appPath: path.join(appFile, "shapez.app"),
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

        gulp.task(taskPrefix + ".package.win64", cb => packageStandalone("win32", "x64", cb));
        gulp.task(taskPrefix + ".package.linux64", cb => packageStandalone("linux", "x64", cb));
        gulp.task(
            taskPrefix + ".build-from-windows",
            gulp.series(
                taskPrefix + ".prepare",
                gulp.parallel(taskPrefix + ".package.win64", taskPrefix + ".package.linux64")
            )
        );
        gulp.task(
            taskPrefix + ".build-from-darwin",
            gulp.series(taskPrefix + ".prepare", gulp.parallel(taskPrefix + ".package.darwin64"))
        );
    }

    // Steam helpers
    gulp.task("standalone.prepareVDF", cb => {
        const hash = buildutils.getRevision();
        const version = buildutils.getVersion();

        // for (const platform of ["steampipe", "steampipe-darwin"]) {
        const templatesSource = path.join(__dirname, "steampipe", "templates");
        const templatesDest = path.join(__dirname, "steampipe", "built_vdfs");

        const variables = {
            PROJECT_DIR: path.resolve(path.join(__dirname, "..")).replace(/\\/g, "/"),
            BUNDLE_DIR: path.resolve(path.join(__dirname, "..", "build_output")).replace(/\\/g, "/"),

            TMP_DIR: path.resolve(path.join(__dirname, "steampipe", "tmp")).replace(/\\/g, "/"),
            // BUILD_DESC: "v" + version + " @ " + hash,
            VDF_DIR: path.resolve(path.join(__dirname, "steampipe", "built_vdfs")).replace(/\\/g, "/"),
        };

        const files = fs.readdirSync(templatesSource);
        for (const file of files) {
            if (!file.endsWith(".vdf")) {
                continue;
            }

            variables.BUILD_DESC = file.replace(".vdf", "") + " - v" + version + " @ " + hash;

            let content = fs.readFileSync(path.join(templatesSource, file)).toString("utf-8");
            content = content.replace(/\$([^$]+)\$/gi, (_, variable) => {
                if (!variables[variable]) {
                    throw new Error("Unknown variable " + variable + " in " + file);
                }

                return variables[variable];
            });

            fs.writeFileSync(path.join(templatesDest, file), content, { encoding: "utf8" });
        }
        cb();
    });
}

module.exports = { gulptasksStandalone };
