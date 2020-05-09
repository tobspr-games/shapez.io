const path = require("path");

function gulptasksSounds($, gulp, buildFolder) {
    // Gather some basic infos
    const soundsDir = path.join("..", "res_raw", "sounds");
    const builtSoundsDir = path.join("..", "res_built", "sounds");

    gulp.task("sounds.clear", () => {
        return gulp.src(builtSoundsDir).pipe($.clean({ force: true }));
    });

    const filters = ["loudnorm", "volume=0.2"];

    const fileCache = new $.cache.Cache({
        cacheDirName: "shapezio-precompiled-sounds",
    });

    // Encodes the game music
    gulp.task("sounds.encodeMusic", () => {
        return gulp
            .src([path.join(soundsDir, "music", "**", "*.wav"), path.join(soundsDir, "music", "**", "*.mp3")])
            .pipe(
                $.cache(
                    $.fluentFfmpeg("mp3", function (cmd) {
                        return cmd
                            .audioBitrate(48)
                            .audioChannels(1)
                            .audioFrequency(22050)
                            .audioCodec("libmp3lame");
                        // .audioFilters(["volume=0.25"])
                    }),
                    {
                        name: "music",
                        fileCache,
                    }
                )
            )
            .pipe(gulp.dest(path.join(builtSoundsDir, "music")));
    });

    // Encodes the ui sounds
    gulp.task("sounds.encodeUi", () => {
        return gulp
            .src([path.join(soundsDir, "ui", "**", "*.wav"), path.join(soundsDir, "ui", "**", "*.mp3")])
            .pipe(
                $.cache(
                    $.fluentFfmpeg("mp3", function (cmd) {
                        return cmd
                            .audioBitrate(128)
                            .audioChannels(1)
                            .audioFrequency(22050)
                            .audioCodec("libmp3lame")
                            .audioFilters(filters);
                    })
                ),
                {
                    name: "uisounds",
                    fileCache,
                }
            )
            .pipe(gulp.dest(path.join(builtSoundsDir, "ui")));
    });

    // Encodes the game sounds
    gulp.task("sounds.encodeGame", () => {
        return gulp
            .src([path.join(soundsDir, "game", "**", "*.wav"), path.join(soundsDir, "game", "**", "*.mp3")])
            .pipe(
                $.cache(
                    $.fluentFfmpeg("mp3", function (cmd) {
                        return cmd
                            .audioBitrate(128)
                            .audioChannels(1)
                            .audioFrequency(22050)
                            .audioCodec("libmp3lame")
                            .audioFilters(filters);
                    }),
                    {
                        nane: "gamesounds",
                        fileCache,
                    }
                )
            )
            .pipe(gulp.dest(path.join(builtSoundsDir, "game")));
    });

    gulp.task("sounds.copy", () => {
        return gulp
            .src(path.join(builtSoundsDir, "**", "*.mp3"))
            .pipe($.cached("sounds.copy"))
            .pipe(gulp.dest(path.join(buildFolder, "res", "sounds")));
    });

    gulp.task("sounds.buildall", cb =>
        $.multiProcess(["sounds.encodeMusic", "sounds.encodeUi", "sounds.encodeGame"], cb, true)
    );

    gulp.task("sounds.fullbuild", cb => $.sequence("sounds.clear", "sounds.buildall", "sounds.copy")(cb));

    gulp.task("sounds.dev", cb => {
        return $.sequence("sounds.buildall", "sounds.copy")(cb);
    });
}

module.exports = {
    gulptasksSounds,
};
