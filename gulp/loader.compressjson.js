"use strict";

const lzString = require("lz-string");

module.exports = function (source) {
    const compressed = lzString.compressToEncodedURIComponent(source);
    const sourcecode = `module.exports = (function() {
        return JSON.parse(require("global-compression").decompressX64("${compressed}"));
    })()`;
    return sourcecode;
};
