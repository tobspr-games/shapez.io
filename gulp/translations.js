const path = require("path");
const fs = require("fs");
const gulpYaml = require("gulp-yaml");
const YAML = require("yaml");
const stripIndent = require("strip-indent");
const trim = require("trim");

const translationsSourceDir = path.join(__dirname, "..", "translations");
const translationsJsonDir = path.join(__dirname, "..", "src", "js", "built-temp");

function gulptasksTranslations($, gulp) {
    gulp.task("translations.convertToJson", () => {
        return gulp
            .src(path.join(translationsSourceDir, "*.yaml"))
            .pipe($.plumber())
            .pipe(gulpYaml({ space: 2, safe: true }))
            .pipe(gulp.dest(translationsJsonDir));
    });

    gulp.task("translations.fullBuild", gulp.series("translations.convertToJson"));

    gulp.task("translations.prepareSteamPage", cb => {
        const files = fs.readdirSync(translationsSourceDir);

        files
            .filter(name => name.endsWith(".yaml"))
            .forEach(fname => {
                const languageName = fname.replace(".yaml", "");
                const abspath = path.join(translationsSourceDir, fname);

                const destpath = path.join(translationsSourceDir, "tmp", languageName + "-store.txt");

                const contents = fs.readFileSync(abspath, { encoding: "utf-8" });
                const data = YAML.parse(contents);

                const storePage = data.steamPage;

                const content = `
                [img]{STEAM_APP_IMAGE}/extras/store_page_gif.gif[/img]

                ${storePage.intro.replace(/\n/gi, "\n\n")}

                [h2]${storePage.title_advantages}[/h2]

                [list]
                ${storePage.advantages
                    .map(x => "[*] " + x.replace(/<b>/, "[b]").replace(/<\/b>/, "[/b]"))
                    .join("\n")}
                [/list]

                [h2]${storePage.title_future}[/h2]

                [list]
                ${storePage.planned
                    .map(x => "[*] " + x.replace(/<b>/, "[b]").replace(/<\/b>/, "[/b]"))
                    .join("\n")}
                [/list]

                [h2]${storePage.title_open_source}[/h2]

                ${storePage.text_open_source.replace(/\n/gi, "\n\n")}

                [h2]${storePage.title_links}[/h2]

                [list]
                [*] [url=https://discord.com/invite/HN7EVzV]${storePage.links.discord}[/url]
                [*] [url=https://trello.com/b/ISQncpJP/shapezio]${storePage.links.roadmap}[/url]
                [*] [url=https://www.reddit.com/r/shapezio]${storePage.links.subreddit}[/url]
                [*] [url=https://github.com/tobspr/shapez.io]${storePage.links.source_code}[/url]
                [*] [url=https://github.com/tobspr/shapez.io/blob/master/translations/README.md]${
                    storePage.links.translate
                }[/url]
                [/list]
            

                    `;

                fs.writeFileSync(destpath, trim(content.replace(/(\n[ \t\r]*)/gi, "\n")), {
                    encoding: "utf-8",
                });
            });

        cb();
    });
}

module.exports = {
    gulptasksTranslations,
};
