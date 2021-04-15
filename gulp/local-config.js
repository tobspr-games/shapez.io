const path = require("path");
const fs = require("fs");
const fse = require("fs-extra");

const configTemplatePath = path.join(__dirname, "../src/js/core/config.local.template.js");
const configPath = path.join(__dirname, "../src/js/core/config.local.js");

function gulptasksLocalConfig($, gulp) {
    gulp.task("localConfig.findOrCreate", cb => {
        if (!fs.existsSync(configPath)) {
            fse.copySync(configTemplatePath, configPath);
        }

        cb();
    });
}

module.exports = { gulptasksLocalConfig };
