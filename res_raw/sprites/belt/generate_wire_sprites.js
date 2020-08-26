/**
 *
 * Run `yarn global add canvas` first
 */

const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const outputFolder = path.join(__dirname, "..", "wires", "sets");

const dimensions = 192;
const lineSize = 12;
const lowerLineSize = 20;

function hexToRGB(h) {
    let r = 0,
        g = 0,
        b = 0;

    // 3 digits
    if (h.length == 4) {
        r = "0x" + h[1] + h[1];
        g = "0x" + h[2] + h[2];
        b = "0x" + h[3] + h[3];

        // 6 digits
    } else if (h.length == 7) {
        r = "0x" + h[1] + h[2];
        g = "0x" + h[3] + h[4];
        b = "0x" + h[5] + h[6];
    }

    return [+r, +g, +b];
}

function RGBToHSL(r, g, b) {
    // Make r, g, and b fractions of 1
    r /= 255;
    g /= 255;
    b /= 255;

    // Find greatest and smallest channel values
    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;
    // Calculate hue
    // No difference
    if (delta == 0) h = 0;
    // Red is max
    else if (cmax == r) h = ((g - b) / delta) % 6;
    // Green is max
    else if (cmax == g) h = (b - r) / delta + 2;
    // Blue is max
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    // Make negative hues positive behind 360°
    if (h < 0) h += 360;

    // Calculate lightness
    l = (cmax + cmin) / 2;

    // Calculate saturation
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    // Multiply l and s by 100
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return [h, s, l];
}

function HSLToRGB(h, s, l) {
    // Must be fractions of 1
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
        m = l - c / 2,
        r = 0,
        g = 0,
        b = 0;

    if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return [r, g, b];
}

async function run() {
    console.log("Running");

    const variants = {
        regular: "#25fff2",
        color: "#eba458",
        shape: "#8858eb",
        conflict: "#ff3e3e",
    };

    const promises = [];

    for (const variantId in variants) {
        const variantColor = variants[variantId];
        const variantHSL = RGBToHSL(...hexToRGB(variantColor));
        const darkenedColor = HSLToRGB(variantHSL[0], variantHSL[1] - 15, variantHSL[2] - 20);
        const hexDarkenedColor = "rgb(" + darkenedColor.join(",") + ")";

        console.log(variantColor, "->", hexToRGB(variantColor), variantHSL, "->", darkenedColor);

        const parts = {
            forward: [[0.5, 0, 0.5, 1]],
            turn: [
                [0.5, 0.5, 0.5, 1],
                [0.5, 0.5, 1, 0.5],
            ],
            split: [
                [0.5, 0.5, 0.5, 1],
                [0, 0.5, 1, 0.5],
            ],
            cross: [
                [0, 0.5, 1, 0.5],
                [0.5, 0, 0.5, 1],
            ],
        };

        for (const partId in parts) {
            const partLines = parts[partId];

            const canvas = createCanvas(dimensions, dimensions);
            const context = canvas.getContext("2d");
            context.quality = "best";
            context.clearRect(0, 0, dimensions, dimensions);

            context.strokeStyle = hexDarkenedColor;
            context.lineWidth = lowerLineSize;
            context.lineCap = "square";
            context.imageSmoothingEnabled = false;

            // Draw lower lines
            partLines.forEach(([x1, y1, x2, y2]) => {
                context.beginPath();
                context.moveTo(x1 * dimensions, y1 * dimensions);
                context.lineTo(x2 * dimensions, y2 * dimensions);
                context.stroke();
            });

            context.strokeStyle = variantColor;
            context.lineWidth = lineSize;

            // Draw upper lines
            partLines.forEach(([x1, y1, x2, y2]) => {
                context.beginPath();
                context.moveTo(x1 * dimensions, y1 * dimensions);
                context.lineTo(x2 * dimensions, y2 * dimensions);
                context.stroke();
            });

            const out = fs.createWriteStream(path.join(outputFolder, variantId + "_" + partId + ".png"));
            const stream = canvas.createPNGStream();
            stream.pipe(out);
            promises.push(new Promise(resolve => stream.on("end", resolve)));
        }
    }

    console.log("Waiting for completion");
    await Promise.all(promises);

    // Also wait a bit more
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log("Copying files to all locations");

    // // Copy other files
    fs.copyFileSync(
        path.join(outputFolder, "regular_forward.png"),
        path.join(__dirname, "..", "buildings", "wire.png")
    );
    fs.copyFileSync(
        path.join(outputFolder, "regular_turn.png"),
        path.join(__dirname, "..", "buildings", "wire-turn.png")
    );
    fs.copyFileSync(
        path.join(outputFolder, "regular_split.png"),
        path.join(__dirname, "..", "buildings", "wire-split.png")
    );
    fs.copyFileSync(
        path.join(outputFolder, "regular_cross.png"),
        path.join(__dirname, "..", "buildings", "wire-cross.png")
    );

    console.log("Done!");
}

run();
