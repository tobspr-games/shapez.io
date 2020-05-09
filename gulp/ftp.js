const path = require("path");
const fs = require("fs");

const buildUtils = require("./buildutils");

function gulptasksFTP($, gulp, buildFolder) {
    const commitHash = buildUtils.getRevision();

    // Write the "commit.txt" file
    gulp.task("ftp.writeVersion", () => {
        fs.writeFileSync(
            path.join(buildFolder, "version.json"),
            JSON.stringify(
                {
                    commit: buildUtils.getRevision(),
                    appVersion: buildUtils.getVersion(),
                    buildTime: new Date().getTime(),
                },
                null,
                4
            )
        );
    });

    // Copies additional files (like .htaccess) which should be deployed when running
    // on the ftp server
    // gulp.task("ftp.copyServerFiles", () => {
    //     return gulp.src(["../ftp_upload/*.*", "../ftp_upload/.*", "../ftp_upload/*"])
    //         .pipe(gulp.dest(buildFolder));
    // });

    const gameSrcGlobs = [
        path.join(buildFolder, "**/*.*"),
        path.join(buildFolder, "**/.*"),
        path.join(buildFolder, "**/*"),
        path.join(buildFolder, "!**/index.html"),
    ];

    gulp.task("ftp.upload.staging.game", () => {
        return gulp
            .src(gameSrcGlobs, { base: buildFolder })
            .pipe(
                $.rename(pth => {
                    pth.dirname = path.join("v", commitHash, pth.dirname);
                })
            )
            .pipe(
                $.sftp({
                    host: process.env.SHAPEZ_CLI_SERVER_HOST,
                    user: process.env.SHAPEZ_CLI_STAGING_FTP_USER,
                    pass: process.env.SHAPEZ_CLI_STAGING_FTP_PW,
                })
            );
    });

    gulp.task("ftp.upload.staging.indexHtml", () => {
        return gulp.src(path.join(buildFolder, "index.html"), { base: buildFolder }).pipe(
            $.sftp({
                host: process.env.SHAPEZ_CLI_SERVER_HOST,
                user: process.env.SHAPEZ_CLI_STAGING_FTP_USER,
                pass: process.env.SHAPEZ_CLI_STAGING_FTP_PW,
            })
        );
    });

    gulp.task("ftp.upload.staging", cb => {
        $.sequence("ftp.writeVersion", "ftp.upload.staging.game", "ftp.upload.staging.indexHtml")(cb);
    });

    gulp.task("ftp.upload.prod.game", () => {
        return gulp
            .src(gameSrcGlobs, { base: buildFolder })
            .pipe(
                $.rename(pth => {
                    pth.dirname = path.join("v", commitHash, pth.dirname);
                })
            )
            .pipe(
                $.sftp({
                    host: process.env.SHAPEZ_CLI_SERVER_HOST,
                    user: process.env.SHAPEZ_CLI_LIVE_FTP_USER,
                    pass: process.env.SHAPEZ_CLI_LIVE_FTP_PW,
                })
            );
    });

    gulp.task("ftp.upload.prod.indexHtml", () => {
        return gulp.src(path.join(buildFolder, "index.html"), { base: buildFolder }).pipe(
            $.sftp({
                host: process.env.SHAPEZ_CLI_SERVER_HOST,
                user: process.env.SHAPEZ_CLI_LIVE_FTP_USER,
                pass: process.env.SHAPEZ_CLI_LIVE_FTP_PW,
            })
        );
    });

    gulp.task("ftp.upload.prod", cb => {
        $.sequence("ftp.writeVersion", "ftp.upload.prod.game", "ftp.upload.prod.indexHtml")(cb);
    });
}

module.exports = {
    gulptasksFTP,
};
