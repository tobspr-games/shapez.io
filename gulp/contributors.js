const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const fetch = require("node-fetch");

const APILink = "https://api.github.com/repos/tobspr/shapez.io";
const numOfReqPerPage = 100; // Max is 100, change to something lower if loads are too long

const JSONFileLocation = path.join(__dirname, "..", "contributors.json");

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
    // return true;
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

    for (let i = 0; i < prs.length; i++) {
        let map;

        if (await PRIsTranslation(prs[i].url)) map = translators;
        else map = contributors;

        if (!map.has(prs[i].username)) map.set(prs[i].username, []);

        map.get(prs[i].username).push(prs[i]);
    }

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

            for (let i = 0; i < res.length - 1; i++) {
                if (!res[i].merged_at) continue; // Skip files that were never merged

                const prInfo = {
                    username: res[i].user.login,
                    html_url: res[i].html_url,
                    url: res[i].url,
                    user_avatar: res[i].user.avatar_url,
                    title: res[i].title,
                    time: res[i].createdAt,
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

    for (let i = 0; i < numOfPageReqs; i++) {
        prs.push(...(await reqPage(i))); // Yes promise.all would be good, but I wanna keep them in order (at least for now)
    }

    return prs;
}

async function tryToUpdateContributors() {
    if (!(await shouldDownloadPRs())) {
        console.log("Not updating contributors to prevent github API from rate-limiting this computer");
        console.log("If you wish to force a contributors update, use contributors.build.force");
        return;
    }

    await updateContributors();
}

async function updateContributors() {
    const allPrs = await downloadAllPrs();
    console.log(`Received ${allPrs.length} PRs`);

    const sorted = await sortPRs(allPrs);

    await writeJSONFile(sorted.translators, sorted.contributors);
    console.log("Wrote JSON File");
}

function gulpTaskContributors($, gulp) {
    gulp.task("contributors.build", cb => tryToUpdateContributors().then(() => cb));
    gulp.task("contributors.build.force", cb => updateContributors().then(() => cb));
}

module.exports = {
    gulpTaskContributors,
};
