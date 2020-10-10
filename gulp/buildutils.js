const glob = require("glob");
const childProcess = require("child_process");
const { version } = require("../package.json");

function execSync(command) {
    return childProcess.execSync(command, {
        encoding: "utf-8",
    });
}

module.exports = {
    getRevision: function (useLast = false) {
        const commitHash = execSync(`git rev-parse --short ${useLast ? "HEAD^1" : "HEAD"}`);
        return commitHash.replace(/^\s+|\s+$/g, "");
    },

    getAllResourceImages() {
        return (
            glob
                .sync("res/**/*.@(png|svg|jpg)", { cwd: ".." })
                .map(f => f.replace(/^res\//gi, ""))
                // We drop all ui images except for the noinline ones
                .filter(f => (f.includes("ui") ? f.includes("noinline") : true))
        );
    },

    getTag() {
        try {
            return execSync("git describe --tag --exact-match");
        } catch (e) {
            throw new Error("Current git HEAD is not a version tag");
        }
    },

    getVersion() {
        return version;
    },

    /**
     * @param {string} url
     * @param {string} commitHash
     */
    cachebust(url, commitHash) {
        return `/v/${commitHash}/${url}`;
    },
};
