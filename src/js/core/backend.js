/* typehints:start */
import { Application } from "../application";
/* typehints:end */

import { JSON_stringify } from "./builtins";
import { globalError, globalLog, globalWarn } from "./logging";
import { decodeHashedString } from "./sensitive_utils.encrypt";
import { globalConfig } from "./config";
import { BACKEND_ERRORS } from "./backend_errors";
import { RequestChannel } from "./request_channel";

export class BackendAPI {
    constructor(app) {
        /** @type {Application} */
        this.app = app;
        this.url = decodeHashedString(G_API_ENDPOINT);

        // For testing
        if (G_IS_DEV && window.location.hostname !== "localhost") {
            this.url = "http://172.0.0.1:8000";
        }

        this.runningRequest = null;
        this.requestChannel = new RequestChannel();
    }

    /**
     * Retrieves the list of mods
     *
     * Route: /mods/gallery
     * @returns {Promise<Array<any>>}
     */
    fetchModGallery() {
        return this.performRequest("GET", "/mods/gallery").then(res => {
            if (!res.mods) {
                throw BACKEND_ERRORS.badResponse;
            }
            return res.mods;
        });
    }

    /**
     * Retrieves the list of mods
     *
     * Route: /mods/track-download/:id
     * @returns {Promise<Array<any>>}
     */
    trackModDownload(id) {
        return this.performRequest("POST", "/mods/track-download/" + id);
    }

    /**
     * Formats an endpoint like '/user/profile' to a full url
     * @param {string} endpoint
     */
    getEndpointUrl(endpoint) {
        assertAlways(endpoint.startsWith("/"), "Endpoint must start with '/'");
        return this.url + endpoint;
    }

    /**
     * Internal fetch helper
     * @param {string} method
     * @param {string} endpoint
     * @param {Object.<string, any>} parameters
     */
    internalFetch(method, endpoint, parameters) {
        if (G_IS_DEV && globalConfig.debug.alwaysOffline) {
            return Promise.reject("offline");
        }

        return (
            fetch(this.getEndpointUrl(endpoint), {
                method: method,
                mode: "cors",
                cache: "no-cache",
                referrer: "no-referrer",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-App-Version": G_BUILD_VERSION,
                },
                credentials: "omit",
                body: method === "POST" ? JSON_stringify(parameters) : undefined,
            })
                // Catch network errors / bad status codes
                .catch(err => {
                    globalLog(this, "Network error:", err);
                    throw BACKEND_ERRORS.networkError;
                })

                // Check if the response was good
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(
                            data => {
                                if (data.error) {
                                    globalWarn(this, "API request error:", data);
                                    throw data.error;
                                }
                                globalWarn(this, "API response has no error payload:", data);
                                throw BACKEND_ERRORS.unknownError;
                            },
                            err => {
                                globalError(this, "API bad json:", err);
                                throw BACKEND_ERRORS.badResponse;
                            }
                        );
                    }
                    return Promise.resolve(response);
                })

                // JSON parsing
                .then(response => {
                    try {
                        return response.json();
                    } catch (err) {
                        globalError(this, "API response json parsing error:", err);
                        throw BACKEND_ERRORS.badResponse;
                    }
                })

                // Check if error flag is set
                .then(data => {
                    if (data.error) {
                        globalWarn(this, "API sent error:", data.error);
                        const str = new String(data.error);
                        // @ts-ignore
                        str.originalError = data;
                        throw str;
                    }
                    return data;
                })
        );
    }

    /**
     * Performs a request
     * @param {string} method
     * @param {string} endpoint
     * @param {Object.<string, any>=} parameters
     */
    performRequest(method, endpoint, parameters = null) {
        if (this.runningRequest) {
            globalWarn(
                this,
                "Request to",
                endpoint,
                "queried while request to",
                this.runningRequest,
                "did not finish yet!"
            );
        }
        assertAlways(method === "POST" || method === "GET", "Invalid mode");

        globalLog(this, "🔗 " + method + " " + endpoint);
        this.runningRequest = endpoint;

        return this.requestChannel.watch(
            new Promise((resolve, reject) => {
                let timedOut = false;
                let timeout = setTimeout(() => {
                    globalWarn("api", "Request to", endpoint, "timed out");
                    timedOut = true;
                    this.runningRequest = null;
                    reject(BACKEND_ERRORS.networkError);
                }, 30000);
                const request = this.internalFetch(method, endpoint, parameters);

                request.then(
                    res => {
                        if (timedOut) {
                            globalWarn("api", "Request finished but already timed out");
                        } else {
                            this.runningRequest = null;
                            clearTimeout(timeout);
                            resolve(res);
                        }
                    },
                    err => {
                        if (timedOut) {
                            globalWarn("api", "Request finished with error but already timed out");
                        } else {
                            this.runningRequest = null;
                            clearTimeout(timeout);
                            reject(err);
                        }
                    }
                );
            })
        );
    }
}
