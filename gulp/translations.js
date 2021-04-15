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
                console.log("Loading", fname);
                const languageName = fname.replace(".yaml", "");
                const abspath = path.join(translationsSourceDir, fname);

                const destpath = path.join(translationsSourceDir, "tmp", languageName + "-store.txt");

                const contents = fs.readFileSync(abspath, { encoding: "utf-8" });
                const data = YAML.parse(contents);

                const storePage = data.steamPage;

                const content = `
                [img]{STEAM_APP_IMAGE}/extras/store_page_gif.gif[/img]

                ${storePage.intro.replace(/\n/gi, "\n\n")}

                [h2]${storePage.what_others_say}[/h2]

                [list]
                    [*] [i]${storePage.nothernlion_comment}[/i] [b]- Northernlion, YouTube[/b]
                    [*] [i]${storePage.notch_comment}[/i] [b]- Notch[/b]
                    [*] [i]${storePage.steam_review_comment}[/i] [b]- Steam User[/b]
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
