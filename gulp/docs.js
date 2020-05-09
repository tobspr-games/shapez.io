const path = require("path");
const fs = require("fs");

function gulptasksDocs($, gulp, buildFolder) {
    gulp.task("docs.convertJsToTs", () => {
        return gulp
            .src(path.join("..", "src", "js", "**", "*.js"))
            .pipe(
                $.rename(path => {
                    path.extname = ".ts";
                })
            )
            .pipe(gulp.dest(path.join("..", "tsc_temp")));
    });

    gulp.task("docs.copyTsconfigForHints", () => {
        const src = fs.readFileSync(path.join("..", "src", "js", "tsconfig.json")).toString();
        const baseConfig = JSON.parse($.stripJsonComments(src));

        baseConfig.allowJs = false;
        baseConfig.checkJs = false;
        baseConfig.declaration = true;
        baseConfig.noEmit = false;
        baseConfig.strict = false;
        baseConfig.strictFunctionTypes = false;
        baseConfig.strictBindCallApply = false;
        baseConfig.alwaysStrict = false;
        baseConfig.composite = true;
        baseConfig.outFile = "bundled-ts.js";
        fs.writeFileSync(path.join("..", "tsc_temp", "tsconfig.json"), JSON.stringify(baseConfig));
    });

    gulp.task("main.prepareDocs", $.sequence("docs.convertJsToTs", "docs.copyTsconfigForHints"));
}

module.exports = {
    gulptasksDocs,
};
