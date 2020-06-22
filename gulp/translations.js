const path = require("path");

const yaml = require("gulp-yaml");

const translationsSourceDir = path.join(__dirname, "..", "translations");
const translationsJsonDir = path.join(__dirname, "..", "src", "js", "built-temp");

function gulptasksTranslations($, gulp, buildFolder) {
    gulp.task("translations.convertToJson", () => {
        return gulp
            .src(path.join(translationsSourceDir, "*.yaml"))
            .pipe($.plumber())
            .pipe(yaml({ space: 2, safe: true }))
            .pipe(gulp.dest(translationsJsonDir));
    });

    gulp.task("translations.fullBuild", gulp.series("translations.convertToJson"));
}

module.exports = {
    gulptasksTranslations,
};
