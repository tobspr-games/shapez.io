/**
 * Generates a cachebuster string. This only modifies the path in the browser version
 */
export function cachebust(path: string) {
    if (G_IS_BROWSER && !G_IS_STANDALONE && !G_IS_DEV) {
        return "/v/" + G_BUILD_COMMIT_HASH + "/" + path;
    }
    return path;
}
