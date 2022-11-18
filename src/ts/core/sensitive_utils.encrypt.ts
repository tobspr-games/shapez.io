import { createHash } from "rusha";
import crc32 from "crc/crc32";
import { decompressX64 } from "./lzstring";
export function sha1(str: any): any {
    return createHash().update(str).digest("hex");
}
// Window.location.host
export function getNameOfProvider(): any {
    return window[decompressX64("DYewxghgLgliB2Q")][decompressX64("BYewzgLgdghgtgUyA")];
}
// Distinguish legacy crc prefixes
export const CRC_PREFIX: any = "crc32".padEnd(32, "-");
/**
 * Computes the crc for a given string
 */
export function computeCrc(str: string): any {
    return CRC_PREFIX + crc32(str).toString(16).padStart(8, "0");
}
