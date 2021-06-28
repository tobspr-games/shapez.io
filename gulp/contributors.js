const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const nodeFetch = require("node-fetch");

const APILink = "https://api.github.com/repos/tobspr/shapez.io";
const numOfReqPerPage = 100; // Max is 100, change to something lower if loads are too long
const personalAccessToken = "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";

const JSONFileLocation = path.join(__dirname, "..", "contributors.json");

function fetch(url) {
    return nodeFetch(url, {
        headers: [["Authorization", "token " + personalAccessToken]],
    });
}

function JSONFileExists() {
    return fs.existsSync(JSONFileLocation);
}

function readJSONFile() {
    return fsp.readFile(JSONFileLocation, { encoding: "utf-8" }).then(res => JSON.parse(res));
}

function writeJSONFile(translators, contributors) {
    return fsp.writeFile(
        JSONFileLocation,
        JSON.stringify({
            lastUpdatedAt: Date.now(),
            //@ts-ignore
            translators: Array.from(translators, ([username, value]) => ({ username, value })),
            //@ts-ignore
            contributors: Array.from(contributors, ([username, value]) => ({ username, value })),
        })
    );
}

function getTotalNumOfPRs() {
    return fetch(APILink + "/pulls?state=closed&per_page=1&page=0").then(res => {
        // This part is very messy
        let link = res.headers.get("Link");
        link = link.slice(link.indexOf(",") + 1); // Gets rid of the first "next" link
        return parseInt(link.slice(link.indexOf("&page=") + 6, link.indexOf(">")));
    });
}

function shouldDownloadPRs() {
    if (!JSONFileExists()) return Promise.resolve(true);
    else {
        return readJSONFile().then(res => Date.now() - res.lastUpdatedAt > 1000 * 60 * 30); // once every 30 min
    }
}

function PRIsTranslation(link) {
    // We just say that if a PR only edits translation files, its a translation, all others are something else
    return fetch(link + "/files")
        .then(res => res.json())
        .then(res => {
            if (res.message) {
                console.log("GITHUB HAS RATE-LIMITED THIS MACHINE, PLEASE WAIT ABOUT AN HOUR");
                throw new Error("rate-limit reached");
            }

            for (let file of res) {
                if (!file.filename.startsWith("translations/")) return false;
            }
            return true;
        });
}

async function sortPRs(prs) {
    const contributors = new Map();
    const translators = new Map();

    const clearLine = () => {
        process.stdout.moveCursor(0, -1); // up one line
        process.stdout.clearLine(1);
    };

    for (let i = 0; i < prs.length; i++) {
        let map;

        if (await PRIsTranslation(prs[i].url)) map = translators;
        else map = contributors;

        if (!map.has(prs[i].username)) map.set(prs[i].username, []);

        map.get(prs[i].username).push(prs[i]);

        if (i !== 0) clearLine();
        console.log(`PR's Downloaded: ${i} out of ${prs.length} (${prs.length - i} left)`);
    }
    clearLine();

    console.log("Downloaded All PR's");

    return {
        contributors,
        translators,
    };
}

function reqPage(page) {
    return fetch(APILink + `/pulls?state=closed&per_page=${numOfReqPerPage}&page=${page}`)
        .then(res => res.json())
        .then(async res => {
            const prs = [];

            for (let i = 0; i < res.length; i++) {
                if (!res[i].merged_at) {
                    continue;
                } // Skip files that were never merged

                const prInfo = {
                    username: res[i].user.login,
                    html_url: res[i].html_url,
                    url: res[i].url,
                    title: res[i].title,
                };

                prs.push(prInfo);
                // if (await PRIsTranslation(res[i].url)) {
                //     translations.push(prInfo);
                // } else {
                //     others.push(prInfo);
                // }
            }

            return prs;
        });
}

async function downloadAllPrs() {
    const totalNumOfPrs = await getTotalNumOfPRs();
    const numOfPageReqs = Math.ceil(totalNumOfPrs / numOfReqPerPage);

    const prs = [];

    for (let i = 1; i < numOfPageReqs + 1; i++) {
        prs.push(...(await reqPage(i))); // Yes promise.all would be good, but I wanna keep them in order (at least for now)
    }

    return prs;
}

async function tryToUpdateContributors() {
    if (personalAccessToken === "PUT TOKEN HERE") {
        console.log("A github token was not provided, writing default contributors.json");
        await writeJSONFile([], []);
        return;
    }

    if (!(await shouldDownloadPRs())) {
        console.log("Not updating contributors to prevent github API from rate-limiting this computer");
        console.log("If you wish to force a contributors update, use contributors.build.force");
        return;
    }

    await updateContributors();
}

async function updateContributors() {
    const allPrs = await downloadAllPrs();
    console.log(`Discovered ${allPrs.length} PRs`);

    const sorted = await sortPRs(allPrs);

    await writeJSONFile(sorted.translators, sorted.contributors);
    console.log("Wrote JSON File");
}

function gulpTaskContributors($, gulp) {
    gulp.task("contributors.build", cb => tryToUpdateContributors().then(() => cb));
    gulp.task("contributors.build.force", cb => updateContributors().then(() => cb));

    gulp.task("contributors.test", async cb => {
        const people = [];
        for (let i = 0; i < 100; i++) people.push(i);

        console.log("Starting");
        for (let i = 0; i < 100; i++) {
            console.log(`PR's Downloaded: ${i} out of ${people.length} (${people.length - i} left)`);
            await new Promise(res => setTimeout(res, 100));
        }

        process.stdout.moveCursor(0, -1); // up one line
        process.stdout.clearLine(1);
        console.log("Finished");
    });
}

module.exports = {
    gulpTaskContributors,
};
