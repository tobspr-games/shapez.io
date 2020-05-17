const path = require("path");

const yaml = require("gulp-yaml");

const translationsSourceDir = path.join(__dirname, "..", "translations");
const translationsJsonDir = path.join(__dirname, "..", "src", "js", "translations-built");

function gulptasksTranslations($, gulp, buildFolder) {
    gulp.task("translations.clear", () => {
        return gulp.src(translationsJsonDir, { read: false }).pipe($.clean({ force: true }));
    });

    gulp.task("translations.convertToJson", () => {
        return gulp
            .src(path.join(translationsSourceDir, "*.yaml"))
            .pipe($.plumber())
            .pipe(yaml({ space: 2, safe: true }))
            .pipe(gulp.dest(translationsJsonDir));
    });

    gulp.task("translations.fullBuild", $.sequence("translations.convertToJson"));
}

module.exports = {
    gulptasksTranslations,
};
