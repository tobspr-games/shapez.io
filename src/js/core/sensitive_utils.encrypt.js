import { createHash } from "rusha";

import { decompressX64 } from "./lzstring";

export function sha1(str) {
    return createHash().update(str).digest("hex");
}

// Window.location.host
export function getNameOfProvider() {
    return window[decompressX64("DYewxghgLgliB2Q")][decompressX64("BYewzgLgdghgtgUyA")];
}

// Distinguish legacy crc prefixes
export const CRC_PREFIX = "crc32".padEnd(32, "-");
