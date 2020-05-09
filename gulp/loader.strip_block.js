/*jslint node:true */
"use strict";

const startComment = "typehints:start";
const endComment = "typehints:end";
const regexPattern = new RegExp(
    "[\\t ]*\\/\\* ?" + startComment + " ?\\*\\/[\\s\\S]*?\\/\\* ?" + endComment + " ?\\*\\/[\\t ]*\\n?",
    "g"
);

function StripBlockLoader(content) {
    if (content.indexOf(startComment) >= 0) {
        content = content.replace(regexPattern, "");
    }
    if (this.cacheable) {
        this.cacheable(true);
    }
    return content;
}

module.exports = StripBlockLoader;
