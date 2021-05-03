/* typehints:start */
import { Application } from "../application";
/* typehints:end */
import { createLogger } from "../core/logging";
import { compressX64 } from "../core/lzstring";
import { T } from "../translations";

const logger = createLogger("puzzle-api");
const rusha = require("rusha");

export class ClientAPI {
    /**
     *
     * @param {Application} app
     */
    constructor(app) {
        this.app = app;

        /**
         * The current users session token
         * @type {string|null}
         */
        this.token = null;

        this.syncToken = window.localStorage.getItem("tmp.syncToken");
        if (!this.syncToken) {
            this.syncToken = rusha
                .createHash()
                .update(new Date().getTime() + "=" + Math.random())
                .digest("hex");
            window.localStorage.setItem("tmp.syncToken", this.syncToken);
        }
    }

    getEndpoint() {
        if (G_IS_DEV) {
            return "http://localhost:15001";
        }
        if (window.location.host === "beta.shapez.io") {
            return "https://api-staging.shapez.io";
        }
        return "https://api.shapez.io";
    }

    isLoggedIn() {
        return Boolean(this.token);
    }

    /**
     *
     * @param {string} endpoint
     * @param {object} options
     * @param {"GET"|"POST"=} options.method
     * @param {any=} options.body
     */
    _request(endpoint, options) {
        const headers = {
            "x-api-key": "d5c54aaa491f200709afff082c153ef2",
            "Content-Type": "application/json",
        };

        if (this.token) {
            headers["x-token"] = this.token;
        }

        return Promise.race([
            fetch(this.getEndpoint() + endpoint, {
                cache: "no-cache",
                mode: "cors",
                headers,
                method: options.method || "GET",
                body: options.body ? JSON.stringify(options.body) : undefined,
            })
                .then(res => {
                    if (res.status !== 200) {
                        throw "bad-status: " + res.status + " / " + res.statusText;
                    }
                    return res;
                })
                .then(res => res.json()),
            new Promise((resolve, reject) => setTimeout(() => reject("timeout"), 15000)),
        ])
            .then(data => {
                if (data && data.error) {
                    logger.warn("Got error from api:", data);
                    throw T.backendErrors[data.error] || data.error;
                }
                return data;
            })
            .catch(err => {
                logger.warn("Failure:", endpoint, ":", err);
                throw err;
            });
    }

    tryLogin() {
        return this.apiTryLogin()
            .then(({ token }) => {
                this.token = token;
                return true;
            })
            .catch(err => {
                logger.warn("Failed to login:", err);
                return false;
            });
    }

    /**
     * @returns {Promise<{token: string}>}
     */
    apiTryLogin() {
        return this._request("/v1/public/login", {
            method: "POST",
            body: {
                token: this.syncToken,
            },
        });
    }

    /**
     * @param {"new"|"top-rated"|"mine"} category
     * @returns {Promise<import("../savegame/savegame_typedefs").PuzzleMetadata[]>}
     */
    apiListPuzzles(category) {
        if (!this.isLoggedIn()) {
            return Promise.reject("not-logged-in");
        }
        return this._request("/v1/puzzles/list/" + category, {});
    }

    /**
     * @param {number} puzzleId
     * @returns {Promise<import("../savegame/savegame_typedefs").PuzzleFullData>}
     */
    apiDownloadPuzzle(puzzleId) {
        if (!this.isLoggedIn()) {
            return Promise.reject("not-logged-in");
        }
        return this._request("/v1/puzzles/download/" + puzzleId, {});
    }

    /**
     * @param {number} shortKey
     * @returns {Promise<import("../savegame/savegame_typedefs").PuzzleFullData>}
     */
    apiDownloadPuzzleByKey(shortKey) {
        if (!this.isLoggedIn()) {
            return Promise.reject("not-logged-in");
        }
        return this._request("/v1/puzzles/download/" + shortKey, {});
    }

    /**
     * @param {number} puzzleId
     * @returns {Promise<void>}
     */
    apiReportPuzzle(puzzleId, reason) {
        if (!this.isLoggedIn()) {
            return Promise.reject("not-logged-in");
        }
        return this._request("/v1/puzzles/report/" + puzzleId, {
            method: "POST",
            body: { reason },
        });
    }

    /**
     * @param {number} puzzleId
     * @param {object} payload
     * @param {number} payload.time
     * @param {boolean} payload.liked
     * @returns {Promise<{ success: true }>}
     */
    apiCompletePuzzle(puzzleId, payload) {
        if (!this.isLoggedIn()) {
            return Promise.reject("not-logged-in");
        }
        return this._request("/v1/puzzles/complete/" + puzzleId, {
            method: "POST",
            body: payload,
        });
    }

    /**
     * @param {object} payload
     * @param {string} payload.title
     * @param {string} payload.shortKey
     * @param {import("../savegame/savegame_typedefs").PuzzleGameData} payload.data
     * @returns {Promise<{ success: true }>}
     */
    apiSubmitPuzzle(payload) {
        if (!this.isLoggedIn()) {
            return Promise.reject("not-logged-in");
        }
        return this._request("/v1/puzzles/submit", {
            method: "POST",
            body: {
                ...payload,
                data: compressX64(JSON.stringify(payload.data)),
            },
        });
    }
}
