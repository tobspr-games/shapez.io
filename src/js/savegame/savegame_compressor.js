const charmap =
    "!#%&'()*+,-./:;<=>?@[]^_`{|}~¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿABCDEFGHIJKLMNOPQRSTUVWXYZ";

let compressionCache = {};
let decompressionCache = {};

/**
 * Compresses an integer into a tight string representation
 * @param {number} i
 * @returns {string}
 */
function compressInt(i) {
    // Zero value breaks
    i += 1;

    if (compressionCache[i]) {
        return compressionCache[i];
    }
    let result = "";
    do {
        result += charmap[i % charmap.length];
        i = Math.floor(i / charmap.length);
    } while (i > 0);
    return (compressionCache[i] = result);
}

/**
 * Decompresses an integer from its tight string representation
 * @param {string} s
 * @returns {number}
 */
function decompressInt(s) {
    if (decompressionCache[s]) {
        return decompressionCache[s];
    }
    s = "" + s;
    let result = 0;
    for (let i = s.length - 1; i >= 0; --i) {
        result = result * charmap.length + charmap.indexOf(s.charAt(i));
    }
    // Fixes zero value break fix from above
    result -= 1;
    return (decompressionCache[s] = result);
}

// Sanity
if (G_IS_DEV) {
    for (let i = 0; i < 10000; ++i) {
        if (decompressInt(compressInt(i)) !== i) {
            throw new Error(
                "Bad compression for: " +
                    i +
                    " compressed: " +
                    compressInt(i) +
                    " decompressed: " +
                    decompressInt(compressInt(i))
            );
        }
    }
}

function compressObjectInternal(obj, keys = [], values = []) {
    if (Array.isArray(obj)) {
        let result = [];
        for (let i = 0; i < obj.length; ++i) {
            result.push(compressObjectInternal(obj[i], keys, values));
        }
        return result;
    } else if (typeof obj === "object" && obj !== null) {
        let result = {};
        for (const key in obj) {
            let index = keys.indexOf(key);
            if (index < 0) {
                keys.push(key);
                index = keys.length - 1;
            }
            const value = obj[key];
            result[compressInt(index)] = compressObjectInternal(value, keys, values);
        }
        return result;
    } else if (typeof obj === "string") {
        let index = values.indexOf(obj);
        if (index < 0) {
            values.push(obj);
            index = values.length - 1;
        }
        return compressInt(index);
    }
    return obj;
}

export function compressObject(obj) {
    const keys = [];
    const values = [];
    const data = compressObjectInternal(obj, keys, values);
    return {
        keys,
        values,
        data,
    };
}

function decompressObjectInternal(obj, keys = [], values = []) {
    if (Array.isArray(obj)) {
        let result = [];
        for (let i = 0; i < obj.length; ++i) {
            result.push(decompressObjectInternal(obj[i], keys, values));
        }
        return result;
    } else if (typeof obj === "object" && obj !== null) {
        let result = {};
        for (const key in obj) {
            const realIndex = decompressInt(key);
            const value = obj[key];
            result[keys[realIndex]] = decompressObjectInternal(value, keys, values);
        }
        return result;
    } else if (typeof obj === "string") {
        const realIndex = decompressInt(obj);
        return values[realIndex];
    }
    return obj;
}

export function decompressObject(obj) {
    if (obj.keys && obj.values && obj.data) {
        const keys = obj.keys;
        const values = obj.values;
        const result = decompressObjectInternal(obj.data, keys, values);
        return result;
    }
    return obj;
}
