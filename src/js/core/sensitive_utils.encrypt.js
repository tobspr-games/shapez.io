import { globalConfig } from "./config";
import { decompressX64, compressX64 } from "./lzstring";

const Rusha = require("rusha");

const encryptKey = globalConfig.info.sgSalt;

export function decodeHashedString(s) {
    return decompressX64(s);
}

export function sha1(str) {
    return Rusha.createHash().update(str).digest("hex");
}

// Window.location.host
export function getNameOfProvider() {
    return window[decodeHashedString("DYewxghgLgliB2Q")][decodeHashedString("BYewzgLgdghgtgUyA")];
}
