/* typehints:start */
import { Application } from "../application";
/* typehints:end */

import { Loader } from "./loader";
import { createLogger } from "./logging";
import { Signal } from "./signal";
import { SOUNDS, MUSIC } from "../platform/sound";
import { AtlasDefinition, atlasFiles } from "./atlas_definitions";
import { initBuildingCodesAfterResourcesLoaded } from "../game/meta_building_registry";
import { cachebust } from "./cachebust";

const logger = createLogger("background_loader");

const essentialMainMenuSprites = [
    G_CHINA_VERSION ? "logo_cn.png" : "logo.png",
    ...G_ALL_UI_IMAGES.filter(src => src.startsWith("ui/") && src.indexOf(".gif") < 0),
];
const essentialMainMenuSounds = [
    SOUNDS.uiClick,
    SOUNDS.uiError,
    SOUNDS.dialogError,
    SOUNDS.dialogOk,
    SOUNDS.swishShow,
    SOUNDS.swishHide,
];

const essentialBareGameAtlases = atlasFiles;
const essentialBareGameSprites = G_ALL_UI_IMAGES.filter(src => src.indexOf(".gif") < 0);
const essentialBareGameSounds = [MUSIC.theme];

const additionalGameSprites = [];
// @ts-ignore
const additionalGameSounds = [...Object.values(SOUNDS), ...Object.values(MUSIC)];

export class BackgroundResourcesLoader {
    /**
     *
     * @param {Application} app
     */
    constructor(app) {
        this.app = app;

        this.registerReady = false;
        this.mainMenuReady = false;
        this.bareGameReady = false;
        this.additionalReady = false;

        this.signalMainMenuLoaded = new Signal();
        this.signalBareGameLoaded = new Signal();
        this.signalAdditionalLoaded = new Signal();

        this.numAssetsLoaded = 0;
        this.numAssetsToLoadTotal = 0;

        // Avoid loading stuff twice
        this.spritesLoaded = [];
        this.soundsLoaded = [];
    }

    getNumAssetsLoaded() {
        return this.numAssetsLoaded;
    }

    getNumAssetsTotal() {
        return this.numAssetsToLoadTotal;
    }

    getPromiseForMainMenu() {
        if (this.mainMenuReady) {
            return Promise.resolve();
        }

        return new Promise(resolve => {
            this.signalMainMenuLoaded.add(resolve);
        });
    }

    getPromiseForBareGame() {
        if (this.bareGameReady) {
            return Promise.resolve();
        }

        return new Promise(resolve => {
            this.signalBareGameLoaded.add(resolve);
        });
    }

    startLoading() {
        this.internalStartLoadingEssentialsForMainMenu();
    }

    internalStartLoadingEssentialsForMainMenu() {
        logger.log("⏰ Start load: main menu");
        this.internalLoadSpritesAndSounds(essentialMainMenuSprites, essentialMainMenuSounds)
            .catch(err => {
                logger.warn("⏰ Failed to load essentials for main menu:", err);
            })
            .then(() => {
                logger.log("⏰ Finish load: main menu");
                this.mainMenuReady = true;
                this.signalMainMenuLoaded.dispatch();
                this.internalStartLoadingEssentialsForBareGame();
            });
    }

    internalStartLoadingEssentialsForBareGame() {
        logger.log("⏰ Start load: bare game");
        this.internalLoadSpritesAndSounds(
            essentialBareGameSprites,
            essentialBareGameSounds,
            essentialBareGameAtlases
        )
            .then(() => this.internalPreloadCss("async-resources.scss"))
            .catch(err => {
                logger.warn("⏰ Failed to load essentials for bare game:", err);
            })
            .then(() => {
                logger.log("⏰ Finish load: bare game");
                this.bareGameReady = true;
                initBuildingCodesAfterResourcesLoaded();
                this.signalBareGameLoaded.dispatch();
                this.internalStartLoadingAdditionalGameAssets();
            });
    }

    internalStartLoadingAdditionalGameAssets() {
        const additionalAtlases = [];
        logger.log("⏰ Start load: additional assets (", additionalAtlases.length, "images)");
        this.internalLoadSpritesAndSounds(additionalGameSprites, additionalGameSounds, additionalAtlases)
            .catch(err => {
                logger.warn("⏰ Failed to load additional assets:", err);
            })
            .then(() => {
                logger.log("⏰ Finish load: additional assets");
                this.additionalReady = true;
                this.signalAdditionalLoaded.dispatch();
            });
    }

    internalPreloadCss(name) {
        return new Promise((resolve, reject) => {
            const link = document.createElement("link");

            link.onload = resolve;
            link.onerror = reject;

            link.setAttribute("rel", "stylesheet");
            link.setAttribute("media", "all");
            link.setAttribute("type", "text/css");
            link.setAttribute("href", cachebust("async-resources.css"));
            document.head.appendChild(link);
        });
    }

    /**
     * @param {Array<string>} sprites
     * @param {Array<string>} sounds
     * @param {Array<AtlasDefinition>} atlases
     * @returns {Promise<void>}
     */
    internalLoadSpritesAndSounds(sprites, sounds, atlases = []) {
        this.numAssetsToLoadTotal = sprites.length + sounds.length + atlases.length;
        this.numAssetsLoaded = 0;

        let promises = [];

        for (let i = 0; i < sounds.length; ++i) {
            if (this.soundsLoaded.indexOf(sounds[i]) >= 0) {
                // Already loaded
                continue;
            }

            this.soundsLoaded.push(sounds[i]);
            promises.push(
                this.app.sound
                    .loadSound(sounds[i])
                    .catch(err => {
                        logger.warn("Failed to load sound:", sounds[i]);
                    })
                    .then(() => {
                        this.numAssetsLoaded++;
                    })
            );
        }

        for (let i = 0; i < sprites.length; ++i) {
            if (this.spritesLoaded.indexOf(sprites[i]) >= 0) {
                // Already loaded
                continue;
            }
            this.spritesLoaded.push(sprites[i]);
            promises.push(
                Loader.preloadCSSSprite(sprites[i])
                    .catch(err => {
                        logger.warn("Failed to load css sprite:", sprites[i]);
                    })
                    .then(() => {
                        this.numAssetsLoaded++;
                    })
            );
        }

        for (let i = 0; i < atlases.length; ++i) {
            const atlas = atlases[i];
            promises.push(
                Loader.preloadAtlas(atlas)
                    .catch(err => {
                        logger.warn("Failed to load atlas:", atlas.sourceFileName);
                    })
                    .then(() => {
                        this.numAssetsLoaded++;
                    })
            );
        }

        return (
            Promise.all(promises)

                // // Remove some pressure by waiting a bit
                // .then(() => {
                //     return new Promise(resolve => {
                //         setTimeout(resolve, 200);
                //     });
                // })
                .then(() => {
                    this.numAssetsToLoadTotal = 0;
                    this.numAssetsLoaded = 0;
                })
        );
    }
}
