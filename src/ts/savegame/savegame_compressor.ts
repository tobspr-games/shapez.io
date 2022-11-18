const charmap: any = "!#%&'()*+,-./:;<=>?@[]^_`{|}~¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿABCDEFGHIJKLMNOPQRSTUVWXYZ";
let compressionCache: any = {};
let decompressionCache: any = {};
/**
 * Compresses an integer into a tight string representation
 * {}
 */
function compressInt(i: number): string {
    // Zero value breaks
    i += 1;
    // save `i` as the cache key
    // to avoid it being modified by the
    // rest of the function.
    const cache_key: any = i;
    if (compressionCache[cache_key]) {
        return compressionCache[cache_key];
    }
    let result: any = "";
    do {
        result += charmap[i % charmap.length];
        i = Math.floor(i / charmap.length);
    } while (i > 0);
    return (compressionCache[cache_key] = result);
}
/**
 * Decompresses an integer from its tight string representation
 * {}
 */
function decompressInt(s: string): number {
    if (decompressionCache[s]) {
        return decompressionCache[s];
    }
    s = "" + s;
    let result: any = 0;
    for (let i: any = s.length - 1; i >= 0; --i) {
        result = result * charmap.length + charmap.indexOf(s.charAt(i));
    }
    // Fixes zero value break fix from above
    result -= 1;
    return (decompressionCache[s] = result);
}
// Sanity
if (G_IS_DEV) {
    for (let i: any = 0; i < 10000; ++i) {
        if (decompressInt(compressInt(i)) !== i) {
            throw new Error("Bad compression for: " +
                i +
                " compressed: " +
                compressInt(i) +
                " decompressed: " +
                decompressInt(compressInt(i)));
        }
    }
}
/**
 * {}
 */
function compressObjectInternal(obj: any, keys: Map, values: Map): any[] | object | number | string {
    if (Array.isArray(obj)) {
        let result: any = [];
        for (let i: any = 0; i < obj.length; ++i) {
            result.push(compressObjectInternal(obj[i], keys, values));
        }
        return result;
    }
    else if (typeof obj === "object" && obj !== null) {
        let result: any = {};
        for (const key: any in obj) {
            let index: any = keys.get(key);
            if (index === undefined) {
                index = keys.size;
                keys.set(key, index);
            }
            const value: any = obj[key];
            result[compressInt(index)] = compressObjectInternal(value, keys, values);
        }
        return result;
    }
    else if (typeof obj === "string") {
        let index: any = values.get(obj);
        if (index === undefined) {
            index = values.size;
            values.set(obj, index);
        }
        return compressInt(index);
    }
    return obj;
}
/**
 * {}
 */
function indexMapToArray(hashMap: Map): Array {
    const result: any = new Array(hashMap.size);
    hashMap.forEach((index: any, key: any): any => {
        result[index] = key;
    });
    return result;
}
export function compressObject(obj: object): any {
    const keys: any = new Map();
    const values: any = new Map();
    const data: any = compressObjectInternal(obj, keys, values);
    return {
        keys: indexMapToArray(keys),
        values: indexMapToArray(values),
        data,
    };
}
/**
 * {}
 */
function decompressObjectInternal(obj: object, keys: string[] = [], values: any[] = []): object {
    if (Array.isArray(obj)) {
        let result: any = [];
        for (let i: any = 0; i < obj.length; ++i) {
            result.push(decompressObjectInternal(obj[i], keys, values));
        }
        return result;
    }
    else if (typeof obj === "object" && obj !== null) {
        let result: any = {};
        for (const key: any in obj) {
            const realIndex: any = decompressInt(key);
            const value: any = obj[key];
            result[keys[realIndex]] = decompressObjectInternal(value, keys, values);
        }
        return result;
    }
    else if (typeof obj === "string") {
        const realIndex: any = decompressInt(obj);
        return values[realIndex];
    }
    return obj;
}
export function decompressObject(obj: object): any {
    if (obj.keys && obj.values && obj.data) {
        const keys: any = obj.keys;
        const values: any = obj.values;
        const result: any = decompressObjectInternal(obj.data, keys, values);
        return result;
    }
    return obj;
}
