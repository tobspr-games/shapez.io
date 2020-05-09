/*
 * Lots of code here is copied 1:1 from actual game files
 *
 */

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

const arrayQuadrantIndexToOffset = [
    { x: 1, y: -1 }, // tr
    { x: 1, y: 1 }, // br
    { x: -1, y: 1 }, // bl
    { x: -1, y: -1 }, // tl
];

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

/** @enum {string} */
const enumColorsToHexCode = {
    [enumColors.red]: "#ff666a",
    [enumColors.green]: "#78ff66",
    [enumColors.blue]: "#66a7ff",

    // red + green
    [enumColors.yellow]: "#fcf52a",

    // red + blue
    [enumColors.purple]: "#dd66ff",

    // blue + green
    [enumColors.cyan]: "#87fff5",

    // blue + green + red
    [enumColors.white]: "#ffffff",

    [enumColors.uncolored]: "#aaaaaa",
};

/** @enum {enumColors} */
const enumShortcodeToColor = {};
for (const key in enumColorToShortcode) {
    enumShortcodeToColor[enumColorToShortcode[key]] = key;
}

CanvasRenderingContext2D.prototype.beginCircle = function (x, y, r) {
    if (r < 0.05) {
        this.beginPath();
        this.rect(x, y, 1, 1);
        return;
    }
    this.beginPath();
    this.arc(x, y, r, 0, 2.0 * Math.PI);
};

/////////////////////////////////////////////////////

function radians(degrees) {
    return (degrees * Math.PI) / 180.0;
}

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

function renderShape(layers) {
    const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("result"));
    const context = canvas.getContext("2d");

    context.save();
    context.fillStyle = "#fff";
    context.fillRect(0, 0, 1000, 1000);

    const w = 256;
    const h = 256;
    const dpi = 1;

    context.translate((w * dpi) / 2, (h * dpi) / 2);
    context.scale((dpi * w) / 23, (dpi * h) / 23);

    context.fillStyle = "#e9ecf7";

    const quadrantSize = 10;
    const quadrantHalfSize = quadrantSize / 2;

    context.fillStyle = "rgba(40, 50, 65, 0.1)";
    context.beginCircle(0, 0, quadrantSize * 1.15);
    context.fill();

    for (let layerIndex = 0; layerIndex < layers.length; ++layerIndex) {
        const quadrants = layers[layerIndex];

        const layerScale = Math.max(0.1, 0.9 - layerIndex * 0.22);

        for (let quadrantIndex = 0; quadrantIndex < 4; ++quadrantIndex) {
            if (!quadrants[quadrantIndex]) {
                continue;
            }
            const { subShape, color } = quadrants[quadrantIndex];

            const quadrantPos = arrayQuadrantIndexToOffset[quadrantIndex];
            const centerQuadrantX = quadrantPos.x * quadrantHalfSize;
            const centerQuadrantY = quadrantPos.y * quadrantHalfSize;

            const rotation = radians(quadrantIndex * 90);

            context.translate(centerQuadrantX, centerQuadrantY);
            context.rotate(rotation);

            context.fillStyle = enumColorsToHexCode[color];
            context.strokeStyle = "#555";
            context.lineWidth = 1;

            const insetPadding = 0.0;

            switch (subShape) {
                case enumSubShape.rect: {
                    context.beginPath();
                    const dims = quadrantSize * layerScale;
                    context.rect(
                        insetPadding + -quadrantHalfSize,
                        -insetPadding + quadrantHalfSize - dims,
                        dims,
                        dims
                    );

                    break;
                }
                case enumSubShape.star: {
                    context.beginPath();
                    const dims = quadrantSize * layerScale;

                    let originX = insetPadding - quadrantHalfSize;
                    let originY = -insetPadding + quadrantHalfSize - dims;

                    const moveInwards = dims * 0.4;
                    context.moveTo(originX, originY + moveInwards);
                    context.lineTo(originX + dims, originY);
                    context.lineTo(originX + dims - moveInwards, originY + dims);
                    context.lineTo(originX, originY + dims);
                    context.closePath();
                    break;
                }

                case enumSubShape.windmill: {
                    context.beginPath();
                    const dims = quadrantSize * layerScale;

                    let originX = insetPadding - quadrantHalfSize;
                    let originY = -insetPadding + quadrantHalfSize - dims;
                    const moveInwards = dims * 0.4;
                    context.moveTo(originX, originY + moveInwards);
                    context.lineTo(originX + dims, originY);
                    context.lineTo(originX + dims, originY + dims);
                    context.lineTo(originX, originY + dims);
                    context.closePath();
                    break;
                }

                case enumSubShape.circle: {
                    context.beginPath();
                    context.moveTo(insetPadding + -quadrantHalfSize, -insetPadding + quadrantHalfSize);
                    context.arc(
                        insetPadding + -quadrantHalfSize,
                        -insetPadding + quadrantHalfSize,
                        quadrantSize * layerScale,
                        -Math.PI * 0.5,
                        0
                    );
                    context.closePath();
                    break;
                }

                default: {
                    assertAlways(false, "Unkown sub shape: " + subShape);
                }
            }

            context.fill();
            context.stroke();

            context.rotate(-rotation);
            context.translate(-centerQuadrantX, -centerQuadrantY);
        }
    }

    context.restore();
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

// @ts-ignore
window.generate = () => {
    showError(null);
    // @ts-ignore
    const code = document.getElementById("code").value.trim();

    let parsed = null;
    try {
        parsed = fromShortKey(code);
    } catch (ex) {
        showError(ex);
        return;
    }

    renderShape(parsed);
};

// @ts-ignore
window.debounce = fn => {
    setTimeout(fn, 0);
};

// @ts-ignore
window.addEventListener("load", window.generate);
