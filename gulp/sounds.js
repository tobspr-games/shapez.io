const path = require("path");
const audiosprite = require("gulp-audiosprite");

function gulptasksSounds($, gulp, buildFolder) {
    // Gather some basic infos
    const soundsDir = path.join(__dirname, "..", "res_raw", "sounds");
    const builtSoundsDir = path.join(__dirname, "..", "res_built", "sounds");

    gulp.task("sounds.clear", () => {
        return gulp.src(builtSoundsDir, { read: false, allowEmpty: true }).pipe($.clean({ force: true }));
    });

    const filters = ["volume=0.2"];

    const fileCache = new $.cache.Cache({
        cacheDirName: "shapezio-precompiled-sounds",
    });

    function getFileCacheValue(file) {
        const { _isVinyl, base, cwd, contents, history, stat, path } = file;
        const encodedContents = Buffer.from(contents).toString("base64");
        return { _isVinyl, base, cwd, contents: encodedContents, history, stat, path };
    }

    // Encodes the game music
    gulp.task("sounds.music", () => {
        return gulp
            .src([path.join(soundsDir, "music", "**", "*.wav"), path.join(soundsDir, "music", "**", "*.mp3")])
            .pipe($.plumber())
            .pipe(
                $.cache(
                    $.fluentFfmpeg("mp3", function (cmd) {
                        return cmd
                            .audioBitrate(48)
                            .audioChannels(1)
                            .audioFrequency(22050)
                            .audioCodec("libmp3lame")
                            .audioFilters(["volume=0.15"]);
                    }),
                    {
                        name: "music",
                        fileCache,
                        value: getFileCacheValue,
                    }
                )
            )
            .pipe(gulp.dest(path.join(builtSoundsDir, "music")));
    });

    // Encodes the game music in high quality for the standalone
    gulp.task("sounds.musicHQ", () => {
        return gulp
            .src([path.join(soundsDir, "music", "**", "*.wav"), path.join(soundsDir, "music", "**", "*.mp3")])
            .pipe($.plumber())
            .pipe(
                $.cache(
                    $.fluentFfmpeg("mp3", function (cmd) {
                        return cmd
                            .audioBitrate(256)
                            .audioChannels(2)
                            .audioFrequency(44100)
                            .audioCodec("libmp3lame")
                            .audioFilters(["volume=0.15"]);
                    }),
                    {
                        name: "music-high-quality",
                        fileCache,
                        value: getFileCacheValue,
                    }
                )
            )
            .pipe(gulp.dest(path.join(builtSoundsDir, "music")));
    });

    // Encodes the ui sounds
    gulp.task("sounds.sfxGenerateSprites", () => {
        return gulp
            .src([path.join(soundsDir, "sfx", "**", "*.wav"), path.join(soundsDir, "sfx", "**", "*.mp3")])
            .pipe($.plumber())
            .pipe(
                audiosprite({
                    format: "howler",
                    output: "sfx",
                    gap: 0.1,
                    export: "mp3",
                })
            )
            .pipe(gulp.dest(path.join(builtSoundsDir)));
    });
    gulp.task("sounds.sfxOptimize", () => {
        return gulp
            .src([path.join(builtSoundsDir, "sfx.mp3")])
            .pipe($.plumber())
            .pipe(
                $.fluentFfmpeg("mp3", function (cmd) {
                    return cmd
                        .audioBitrate(128)
                        .audioChannels(1)
                        .audioFrequency(22050)
                        .audioCodec("libmp3lame")
                        .audioFilters(filters);
                })
            )
            .pipe(gulp.dest(path.join(builtSoundsDir)));
    });
    gulp.task("sounds.sfxCopyAtlas", () => {
        return gulp
            .src([path.join(builtSoundsDir, "sfx.json")])
            .pipe(gulp.dest(path.join(__dirname, "..", "src", "js", "built-temp")));
    });

    gulp.task(
        "sounds.sfx",
        gulp.series("sounds.sfxGenerateSprites", "sounds.sfxOptimize", "sounds.sfxCopyAtlas")
    );

    gulp.task("sounds.copy", () => {
        return gulp
            .src(path.join(builtSoundsDir, "**", "*.mp3"))
            .pipe($.plumber())
            .pipe(gulp.dest(path.join(buildFolder, "res", "sounds")));
    });

    gulp.task("sounds.buildall", gulp.parallel("sounds.music", "sounds.sfx"));
    gulp.task("sounds.buildallHQ", gulp.parallel("sounds.musicHQ", "sounds.sfx"));

    gulp.task("sounds.fullbuild", gulp.series("sounds.clear", "sounds.buildall", "sounds.copy"));
    gulp.task("sounds.fullbuildHQ", gulp.series("sounds.clear", "sounds.buildallHQ", "sounds.copy"));
    gulp.task("sounds.dev", gulp.series("sounds.buildall", "sounds.copy"));
}

module.exports = {
    gulptasksSounds,
};
