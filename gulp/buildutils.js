const glob = require("glob");
const execSync = require("child_process").execSync;
const trim = require("trim");
const fs = require("fs");
const path = require("path");

module.exports = {
    getRevision: function (useLast = false) {
        const commitHash = execSync("git rev-parse --short " + (useLast ? "HEAD^1" : "HEAD")).toString(
            "ascii"
        );
        return commitHash.replace(/^\s+|\s+$/g, "");
    },

    getAllResourceImages() {
        return glob
            .sync("res/**/*.@(png|svg|jpg)", { cwd: ".." })
            .map(f => f.replace(/^res\//gi, ""))
            .filter(f => {
                if (f.indexOf("ui") >= 0) {
                    // We drop all ui images except for the noinline ones
                    return f.indexOf("noinline") >= 0;
                }
                return true;
            });
    },

    getVersion() {
        return trim(fs.readFileSync(path.join(__dirname, "..", "version")).toString());
    },

    /**
     * @param {string} url
     * @param {string} commitHash
     */
    cachebust(url, commitHash) {
        return "/v/" + commitHash + "/" + url;
    },
};
