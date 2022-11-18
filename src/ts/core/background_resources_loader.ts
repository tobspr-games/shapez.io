/* typehints:start */
import type { Application } from "../application";
/* typehints:end */
import { initSpriteCache } from "../game/meta_building_registry";
import { MUSIC, SOUNDS } from "../platform/sound";
import { T } from "../translations";
import { AtlasDefinition, atlasFiles } from "./atlas_definitions";
import { cachebust } from "./cachebust";
import { Loader } from "./loader";
import { createLogger } from "./logging";
import { Signal } from "./signal";
import { clamp, getLogoSprite, timeoutPromise } from "./utils";
const logger: any = createLogger("background_loader");
const MAIN_MENU_ASSETS: any = {
    sprites: [getLogoSprite()],
    sounds: [SOUNDS.uiClick, SOUNDS.uiError, SOUNDS.dialogError, SOUNDS.dialogOk],
    atlas: [],
    css: [],
};
const INGAME_ASSETS: any = {
    sprites: [],
    sounds: [
        ...Array.from(Object.values(MUSIC)),
        ...Array.from(Object.values(SOUNDS)).filter((sound: any): any => !MAIN_MENU_ASSETS.sounds.includes(sound)),
    ],
    atlas: atlasFiles,
    css: ["async-resources.css"],
};
if (G_IS_STANDALONE) {
    MAIN_MENU_ASSETS.sounds = [...Array.from(Object.values(MUSIC)), ...Array.from(Object.values(SOUNDS))];
    INGAME_ASSETS.sounds = [];
}
const LOADER_TIMEOUT_PER_RESOURCE: any = 180000;
// Cloudflare does not send content-length headers with brotli compression,
// so store the actual (compressed) file sizes so we can show a progress bar.
const HARDCODED_FILE_SIZES: any = {
    "async-resources.css": 2216145,
};
export class BackgroundResourcesLoader {
    public app = app;
    public mainMenuPromise = null;
    public ingamePromise = null;
    public resourceStateChangedSignal = new Signal();

        constructor(app) {
    }
    getMainMenuPromise(): any {
        if (this.mainMenuPromise) {
            return this.mainMenuPromise;
        }
        logger.log("⏰ Loading main menu assets");
        return (this.mainMenuPromise = this.loadAssets(MAIN_MENU_ASSETS));
    }
    getIngamePromise(): any {
        if (this.ingamePromise) {
            return this.ingamePromise;
        }
        logger.log("⏰ Loading ingame assets");
        const promise: any = this.loadAssets(INGAME_ASSETS).then((): any => initSpriteCache());
        return (this.ingamePromise = promise);
    }
        async loadAssets({ sprites, sounds, atlas, css }: {
        sprites: string[];
        sounds: string[];
        atlas: AtlasDefinition[];
        css: string[];
    }): any {
                let promiseFunctions: ((progressHandler: (progress: number) => void) => Promise<void>)[] = [];
        // CSS
        for (let i: any = 0; i < css.length; ++i) {
            promiseFunctions.push((progress: any): any => timeoutPromise(this.internalPreloadCss(css[i], progress), LOADER_TIMEOUT_PER_RESOURCE).catch((err: any): any => {
                logger.error("Failed to load css:", css[i], err);
                throw new Error("HUD Stylesheet " + css[i] + " failed to load: " + err);
            }));
        }
        // ATLAS FILES
        for (let i: any = 0; i < atlas.length; ++i) {
            promiseFunctions.push((progress: any): any => timeoutPromise(Loader.preloadAtlas(atlas[i], progress), LOADER_TIMEOUT_PER_RESOURCE).catch((err: any): any => {
                logger.error("Failed to load atlas:", atlas[i].sourceFileName, err);
                throw new Error("Atlas " + atlas[i].sourceFileName + " failed to load: " + err);
            }));
        }
        // HUD Sprites
        for (let i: any = 0; i < sprites.length; ++i) {
            promiseFunctions.push((progress: any): any => timeoutPromise(Loader.preloadCSSSprite(sprites[i], progress), LOADER_TIMEOUT_PER_RESOURCE).catch((err: any): any => {
                logger.error("Failed to load css sprite:", sprites[i], err);
                throw new Error("HUD Sprite " + sprites[i] + " failed to load: " + err);
            }));
        }
        // SFX & Music
        for (let i: any = 0; i < sounds.length; ++i) {
            promiseFunctions.push((progress: any): any => timeoutPromise(this.app.sound.loadSound(sounds[i]), LOADER_TIMEOUT_PER_RESOURCE).catch((err: any): any => {
                logger.warn("Failed to load sound, will not be available:", sounds[i], err);
            }));
        }
        const originalAmount: any = promiseFunctions.length;
        const start: any = performance.now();
        logger.log("⏰ Preloading", originalAmount, "assets");
        let progress: any = 0;
        this.resourceStateChangedSignal.dispatch({ progress });
        let promises: any = [];
        for (let i: any = 0; i < promiseFunctions.length; i++) {
            let lastIndividualProgress: any = 0;
            const progressHandler: any = (individualProgress: any): any => {
                const delta: any = clamp(individualProgress) - lastIndividualProgress;
                lastIndividualProgress = clamp(individualProgress);
                progress += delta / originalAmount;
                this.resourceStateChangedSignal.dispatch({ progress });
            };
            promises.push(promiseFunctions[i](progressHandler).then((): any => {
                progressHandler(1);
            }));
        }
        await Promise.all(promises);
        logger.log("⏰ Preloaded assets in", Math.round(performance.now() - start), "ms");
    }
    /**
     * Shows an error when a resource failed to load and allows to reload the game
     */
    showLoaderError(dialogs: any, err: any): any {
        if (G_IS_STANDALONE) {
            dialogs
                .showWarning(T.dialogs.resourceLoadFailed.title, T.dialogs.resourceLoadFailed.descSteamDemo + "<br>" + err, ["retry"])
                .retry.add((): any => window.location.reload());
        }
        else {
            dialogs
                .showWarning(T.dialogs.resourceLoadFailed.title, T.dialogs.resourceLoadFailed.descWeb.replace("<demoOnSteamLinkText>", `<a href="https://get.shapez.io/resource_timeout" target="_blank">${T.dialogs.resourceLoadFailed.demoLinkText}</a>`) +
                "<br>" +
                err, ["retry"])
                .retry.add((): any => window.location.reload());
        }
    }
    preloadWithProgress(src: any, progressHandler: any): any {
        return new Promise((resolve: any, reject: any): any => {
            const xhr: any = new XMLHttpRequest();
            let notifiedNotComputable: any = false;
            const fullUrl: any = cachebust(src);
            xhr.open("GET", fullUrl, true);
            xhr.responseType = "arraybuffer";
            xhr.onprogress = function (ev: any): any {
                if (ev.lengthComputable) {
                    progressHandler(ev.loaded / ev.total);
                }
                else {
                    if (window.location.search.includes("alwaysLogFileSize")) {
                        console.warn("Progress:", src, ev.loaded);
                    }
                    if (HARDCODED_FILE_SIZES[src]) {
                        progressHandler(clamp(ev.loaded / HARDCODED_FILE_SIZES[src]));
                    }
                    else {
                        if (!notifiedNotComputable) {
                            notifiedNotComputable = true;
                            console.warn("Progress not computable:", src, ev.loaded);
                            progressHandler(0);
                        }
                    }
                }
            };
            xhr.onloadend = function (): any {
                if (!xhr.status.toString().match(/^2/)) {
                    reject(fullUrl + ": " + xhr.status + " " + xhr.statusText);
                }
                else {
                    if (!notifiedNotComputable) {
                        progressHandler(1);
                    }
                    const options: any = {};
                    const headers: any = xhr.getAllResponseHeaders();
                    const contentType: any = headers.match(/^Content-Type:\s*(.*?)$/im);
                    if (contentType && contentType[1]) {
                        options.type = contentType[1].split(";")[0];
                    }
                    const blob: any = new Blob([this.response], options);
                    resolve(window.URL.createObjectURL(blob));
                }
            };
            xhr.send();
        });
    }
    internalPreloadCss(src: any, progressHandler: any): any {
        return this.preloadWithProgress(src, progressHandler).then((blobSrc: any): any => {
            var styleElement: any = document.createElement("link");
            styleElement.href = blobSrc;
            styleElement.rel = "stylesheet";
            styleElement.setAttribute("media", "all");
            styleElement.type = "text/css";
            document.head.appendChild(styleElement);
        });
    }
}
