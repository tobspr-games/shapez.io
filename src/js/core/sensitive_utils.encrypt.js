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

export function compressWithChecksum(object) {
    const stringified = JSON.stringify(object);
    const checksum = Rusha.createHash()
        .update(stringified + encryptKey)
        .digest("hex");
    return compressX64(checksum + stringified);
}

export function decompressWithChecksum(binary) {
    let decompressed = null;
    try {
        decompressed = decompressX64(binary);
    } catch (err) {
        throw new Error("failed-to-decompress");
    }

    // Split into checksum and content
    if (!decompressed || decompressed.length < 41) {
        throw new Error("checksum-missing");
    }

    const checksum = decompressed.substr(0, 40);
    const rawData = decompressed.substr(40);

    // Validate checksum
    const computedChecksum = Rusha.createHash()
        .update(rawData + encryptKey)
        .digest("hex");
    if (computedChecksum !== checksum) {
        throw new Error("checksum-mismatch");
    }

    // Try parsing the JSON
    let data = null;
    try {
        data = JSON.parse(rawData);
    } catch (err) {
        throw new Error("failed-to-parse");
    }

    return data;
}
