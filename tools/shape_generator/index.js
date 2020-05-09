// From shape_definition.js

/** @enum {string} */
const enumSubShape = {
    rect: "rect",
    circle: "circle",
    star: "star",
    windmill: "windmill",
};

/** @enum {string} */
const enumSubShapeToShortcode = {
    [enumSubShape.rect]: "R",
    [enumSubShape.circle]: "C",
    [enumSubShape.star]: "S",
    [enumSubShape.windmill]: "W",
};

/** @enum {enumSubShape} */
const enumShortcodeToSubShape = {};
for (const key in enumSubShapeToShortcode) {
    enumShortcodeToSubShape[enumSubShapeToShortcode[key]] = key;
}

// From colors.js
/** @enum {string} */
const enumColors = {
    red: "red",
    green: "green",
    blue: "blue",

    yellow: "yellow",
    purple: "purple",
    cyan: "cyan",

    white: "white",
    uncolored: "uncolored",
};

/** @enum {string} */
const enumColorToShortcode = {
    [enumColors.red]: "r",
    [enumColors.green]: "g",
    [enumColors.blue]: "b",

    [enumColors.yellow]: "y",
    [enumColors.purple]: "p",
    [enumColors.cyan]: "c",

    [enumColors.white]: "w",
    [enumColors.uncolored]: "u",
};

/** @enum {enumColors} */
const enumShortcodeToColor = {};
for (const key in enumColorToShortcode) {
    enumShortcodeToColor[enumColorToShortcode[key]] = key;
}

/////////////////////////////////////////////////////

/**
 * Generates the definition from the given short key
 */
function fromShortKey(key) {
    const sourceLayers = key.split(":");
    let layers = [];
    for (let i = 0; i < sourceLayers.length; ++i) {
        const text = sourceLayers[i];
        if (text.length !== 8) {
            throw new Error("Invalid layer: '" + text + "' -> must be 8 characters");
        }

        const quads = [null, null, null, null];
        for (let quad = 0; quad < 4; ++quad) {
            const shapeText = text[quad * 2 + 0];
            const subShape = enumShortcodeToSubShape[shapeText];
            const color = enumShortcodeToColor[text[quad * 2 + 1]];
            if (subShape) {
                if (!color) {
                    throw new Error("Invalid shape color key: " + key);
                }
                quads[quad] = {
                    subShape,
                    color,
                };
            } else if (shapeText !== "-") {
                throw new Error("Invalid shape key: " + shapeText);
            }
        }
        layers.push(quads);
    }

    return layers;
}

/////////////////////////////////////////////////////

function showError(msg) {
    const errorDiv = document.getElementById("error");
    errorDiv.classList.toggle("hasError", !!msg);
    if (msg) {
        errorDiv.innerText = msg;
    } else {
        errorDiv.innerText = "Shape generated";
    }
}

window.generate = () => {
    showError(null);
    const code = document.getElementById("code").value.trim();

    let parsed = null;
    try {
        parsed = fromShortKey(code);
    } catch (ex) {
        showError(ex);
    }
};

window.debounce = fn => {
    setTimeout(fn, 0);
};

window.addEventListener("load", generate);
