import { T } from "../translations";

/**
 * Translates error codes like "invalid-auth-key" into their translations (E.g. "Invalid Auth Key").
 * If the code is not known or an arbitrary string, returns the code
 * @param {string} err The error code
 * @returns {string} Translated code
 */
export function tryTranslateBackendError(err) {
    // TODO: Add errors to base-en.yaml
    // return "<div class='backendError'>" + (T.backend.errors[err] || err) + "</div>";
    return "<div class='backendError'> ☹" + err + "</div>";
}

export const BACKEND_ERRORS = {
    // Frontend errors
    networkError: "network-error",
    offline: "offline",
    badResponse: "bad-response",
    rateLimited: "rate-limited",

    // Backend errors
    unsupportedVersion: "unsupported-version",
    unknownError: "unknown-error",
    unauthenticated: "unauthenticated",
    invalidRequestSchema: "invalid-request-schema",
    internalServerError: "internal-server-error",
    databaseError: "database-error",
    notFound: "not-found",
    serverOverloaded: "server-overloaded",

    // Binary checksum stuff
    failedToDecompress: "failed-to-decompress",
    checksumMissing: "checksum-missing",
    checksumMismatch: "checksum-mismatch",
    failedToParse: "failed-to-parse",
};
