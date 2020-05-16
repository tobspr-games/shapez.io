import { MusicInstanceInterface, SoundInstanceInterface, SoundInterface } from "../sound";
import { cachebust } from "../../core/cachebust";
import { createLogger } from "../../core/logging";

const { Howl, Howler } = require("howler");

const logger = createLogger("sound/browser");

class SoundInstance extends SoundInstanceInterface {
    constructor(key, url) {
        super(key, url);
        this.howl = null;
    }

    load() {
        return Promise.race([
            new Promise((resolve, reject) => {
                setTimeout(reject, G_IS_DEV ? 5000 : 60000);
            }),
            new Promise(resolve => {
                this.howl = new Howl({
                    src: cachebust("res/sounds/" + this.url),
                    autoplay: false,
                    loop: false,
                    volume: 0,
                    preload: true,
                    pool: 20,
                    onload: () => {
                        resolve();
                    },
                    onloaderror: (id, err) => {
                        logger.warn("Sound", this.url, "failed to load:", id, err);
                        this.howl = null;
                        resolve();
                    },
                    onplayerror: (id, err) => {
                        logger.warn("Sound", this.url, "failed to play:", id, err);
                    },
                });
            }),
        ]);
    }

    play(volume) {
        if (this.howl) {
            const instance = this.howl.play();
            this.howl.volume(volume, instance);
        }
    }

    deinitialize() {
        if (this.howl) {
            this.howl.unload();
            this.howl = null;
        }
    }
}

class MusicInstance extends MusicInstanceInterface {
    constructor(key, url) {
        super(key, url);
        this.howl = null;
        this.instance = null;
        this.playing = false;
    }
    load() {
        return Promise.race([
            new Promise((resolve, reject) => {
                setTimeout(reject, G_IS_DEV ? 5000 : 60000);
            }),
            new Promise((resolve, reject) => {
                this.howl = new Howl({
                    src: cachebust("res/sounds/music/" + this.url),
                    autoplay: false,
                    loop: true,
                    html5: true,
                    volume: 1,
                    preload: true,
                    pool: 2,

                    onunlock: () => {
                        if (this.playing) {
                            logger.log("Playing music after manual unlock");
                            this.play();
                        }
                    },

                    onload: () => {
                        resolve();
                    },
                    onloaderror: (id, err) => {
                        logger.warn(this, "Music", this.url, "failed to load:", id, err);
                        this.howl = null;
                        resolve();
                    },
                    onplayerror: (id, err) => {
                        logger.warn(this, "Music", this.url, "failed to play:", id, err);
                    },
                });
            }),
        ]);
    }

    stop() {
        if (this.howl && this.instance) {
            this.playing = false;
            this.howl.pause(this.instance);
        }
    }

    isPlaying() {
        return this.playing;
    }

    play() {
        if (this.howl) {
            this.playing = true;
            if (this.instance) {
                this.howl.play(this.instance);
            } else {
                this.instance = this.howl.play();
            }
        }
    }

    deinitialize() {
        if (this.howl) {
            this.howl.unload();
            this.howl = null;
            this.instance = null;
        }
    }
}

export class SoundImplBrowser extends SoundInterface {
    constructor(app) {
        Howler.mobileAutoEnable = true;
        Howler.autoUnlock = true;
        Howler.autoSuspend = false;
        Howler.html5PoolSize = 20;
        Howler.pos(0, 0, 0);

        super(app, SoundInstance, MusicInstance);
    }

    initialize() {
        return super.initialize();
    }

    deinitialize() {
        return super.deinitialize().then(() => Howler.unload());
    }
}
