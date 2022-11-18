/* typehints:start */
import type { Application } from "../application";
/* typehints:end */
import { createLogger } from "../core/logging";
import { compressX64 } from "../core/lzstring";
import { timeoutPromise } from "../core/utils";
import { T } from "../translations";
const logger: any = createLogger("puzzle-api");
export class ClientAPI {
    public app = app;
    public token: string | null = null;

        constructor(app) {
    }
    getEndpoint(): any {
        if (G_IS_DEV) {
            return "http://localhost:15001";
        }
        if (window.location.host === "beta.shapez.io") {
            return "https://api-staging.shapez.io";
        }
        return "https://api.shapez.io";
    }
    isLoggedIn(): any {
        return Boolean(this.token);
    }
        _request(endpoint: string, options: {
        method: "GET" | "POST"=;
        body: any=;
    }): any {
        const headers: any = {
            "x-api-key": "d5c54aaa491f200709afff082c153ef2",
            "Content-Type": "application/json",
        };
        if (this.token) {
            headers["x-token"] = this.token;
        }
        return timeoutPromise(fetch(this.getEndpoint() + endpoint, {
            cache: "no-cache",
            mode: "cors",
            headers,
            method: options.method || "GET",
            body: options.body ? JSON.stringify(options.body) : undefined,
        }), 15000)
            .then((res: any): any => {
            if (res.status !== 200) {
                throw "bad-status: " + res.status + " / " + res.statusText;
            }
            return res;
        })
            .then((res: any): any => res.json())
            .then((data: any): any => {
            if (data && data.error) {
                logger.warn("Got error from api:", data);
                throw T.backendErrors[data.error] || data.error;
            }
            return data;
        })
            .catch((err: any): any => {
            logger.warn("Failure:", endpoint, ":", err);
            throw err;
        });
    }
    tryLogin(): any {
        return this.apiTryLogin()
            .then(({ token }: any): any => {
            this.token = token;
            return true;
        })
            .catch((err: any): any => {
            logger.warn("Failed to login:", err);
            return false;
        });
    }
    /**
     * {}
     */
    apiTryLogin(): Promise<{
        token: string;
    }> {
        if (!G_IS_STANDALONE) {
            let token: any = window.localStorage.getItem("steam_sso_auth_token");
            if (!token && G_IS_DEV) {
                token = window.prompt("Please enter the auth token for the puzzle DLC (If you have none, you can't login):");
                window.localStorage.setItem("dev_api_auth_token", token);
            }
            return Promise.resolve({ token });
        }
        return timeoutPromise(ipcRenderer.invoke("steam:get-ticket"), 15000).then((ticket: any): any => {
            logger.log("Got auth ticket:", ticket);
            return this._request("/v1/public/login", {
                method: "POST",
                body: {
                    token: ticket,
                },
            });
        }, (err: any): any => {
            logger.error("Failed to get auth ticket from steam: ", err);
            throw err;
        });
    }
    
    apiListPuzzles(category: "new" | "top-rated" | "mine"): Promise<import("../savegame/savegame_typedefs").PuzzleMetadata[]> {
        if (!this.isLoggedIn()) {
            return Promise.reject("not-logged-in");
        }
        return this._request("/v1/puzzles/list/" + category, {});
    }
    
    apiSearchPuzzles(searchOptions: {
        searchTerm: string;
        difficulty: string;
        duration: string;
    }): Promise<import("../savegame/savegame_typedefs").PuzzleMetadata[]> {
        if (!this.isLoggedIn()) {
            return Promise.reject("not-logged-in");
        }
        return this._request("/v1/puzzles/search", {
            method: "POST",
            body: searchOptions,
        });
    }
    
    apiDownloadPuzzle(puzzleId: number): Promise<import("../savegame/savegame_typedefs").PuzzleFullData> {
        if (!this.isLoggedIn()) {
            return Promise.reject("not-logged-in");
        }
        return this._request("/v1/puzzles/download/" + puzzleId, {});
    }
    
    apiDeletePuzzle(puzzleId: number): Promise<import("../savegame/savegame_typedefs").PuzzleFullData> {
        if (!this.isLoggedIn()) {
            return Promise.reject("not-logged-in");
        }
        return this._request("/v1/puzzles/delete/" + puzzleId, {
            method: "POST",
            body: {},
        });
    }
    
    apiDownloadPuzzleByKey(shortKey: string): Promise<import("../savegame/savegame_typedefs").PuzzleFullData> {
        if (!this.isLoggedIn()) {
            return Promise.reject("not-logged-in");
        }
        return this._request("/v1/puzzles/download/" + shortKey, {});
    }
    /**
     * {}
     */
    apiReportPuzzle(puzzleId: number, reason: any): Promise<void> {
        if (!this.isLoggedIn()) {
            return Promise.reject("not-logged-in");
        }
        return this._request("/v1/puzzles/report/" + puzzleId, {
            method: "POST",
            body: { reason },
        });
    }
    /**
     * {}
     */
    apiCompletePuzzle(puzzleId: number, payload: {
        time: number;
        liked: boolean;
    }): Promise<{
        success: true;
    }> {
        if (!this.isLoggedIn()) {
            return Promise.reject("not-logged-in");
        }
        return this._request("/v1/puzzles/complete/" + puzzleId, {
            method: "POST",
            body: payload,
        });
    }
    
    apiSubmitPuzzle(payload: {
        title: string;
        shortKey: string;
        data: import("../savegame/savegame_typedefs").PuzzleGameData;
    }): Promise<{
        success: true;
    }> {
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
