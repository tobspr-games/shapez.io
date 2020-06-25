/**
 *
 * Run `yarn global add canvas` first
 */

const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");

async function run() {
    console.log("Running");

    const fps = 28;
    const dimensions = 126;
    const beltBorder = 15.5;

    const borderColor = "#91949e";
    const fillColor = "#d2d4d9";
    const arrowColor = "#c0c2c7";

    // Generate arrow sprite

    const arrowW = 40;
    const arrowH = 20;
    /** @type {HTMLCanvasElement} */
    const arrowSprite = createCanvas(arrowW, arrowH);
    const arrowContext = arrowSprite.getContext("2d");

    arrowContext.quality = "best";
    arrowContext.fillStyle = arrowColor;
    arrowContext.clearRect(0, 0, arrowW, arrowH);
    arrowContext.beginPath();
    arrowContext.moveTo(0, arrowH);
    arrowContext.lineTo(arrowW / 2, 0);
    arrowContext.lineTo(arrowW, arrowH);
    arrowContext.closePath();
    arrowContext.fill();

    // First, generate the forward belt
    for (let i = 0; i < fps; ++i) {
        /** @type {HTMLCanvasElement} */
        const canvas = createCanvas(dimensions, dimensions);
        const context = canvas.getContext("2d");
        context.quality = "best";

        const procentual = i / fps;
        context.clearRect(0, 0, dimensions, dimensions);

        context.fillStyle = fillColor;
        context.strokeStyle = borderColor;
        context.lineWidth = 3;

        context.beginPath();
        context.rect(beltBorder, -10, dimensions - 2 * beltBorder, dimensions + 20);
        context.fill();
        context.stroke();

        const spacingBetweenArrows = (dimensions - 3 * arrowH) / 3;
        const spacingTotal = spacingBetweenArrows + arrowH;

        for (let k = 0; k < 5; ++k) {
            let y = dimensions - arrowH - (k - 1) * spacingTotal - procentual * spacingTotal;
            context.drawImage(arrowSprite, dimensions / 2 - arrowW / 2, y);
        }

        const out = fs.createWriteStream(path.join(__dirname, "forward_" + i + ".png"));
        const stream = canvas.createPNGStream();
        stream.pipe(out);
    }

    // Generate left and right side belt
    for (let i = 0; i < fps; ++i) {
        /** @type {HTMLCanvasElement} */
        const canvas = createCanvas(dimensions, dimensions);
        const context = canvas.getContext("2d");
        context.quality = "best";

        const procentual = i / fps;
        const innerRadius = beltBorder;
        context.clearRect(0, 0, dimensions, dimensions);

        context.fillStyle = fillColor;
        context.strokeStyle = borderColor;
        context.lineWidth = 3;

        context.beginPath();
        context.moveTo(beltBorder, dimensions + 10);
        context.lineTo(beltBorder, dimensions - innerRadius);

        const steps = 256;

        const outerRadius = dimensions - 2 * beltBorder;

        const originX = dimensions - innerRadius;
        const originY = dimensions - innerRadius;

        const sqrt = x => Math.pow(Math.abs(x), 0.975) * Math.sign(x);

        for (let k = 0; k <= steps; ++k) {
            const pct = k / steps;
            const angleRad = Math.PI + pct * Math.PI * 0.5;
            const offX = originX + sqrt(Math.cos(angleRad)) * outerRadius;
            const offY = originY + sqrt(Math.sin(angleRad)) * outerRadius;

            context.lineTo(offX, offY);
        }

        context.lineTo(dimensions + 10, beltBorder);
        context.lineTo(dimensions + 10, dimensions - beltBorder);
        context.lineTo(dimensions, dimensions - beltBorder);

        for (let k = 0; k <= steps; ++k) {
            const pct = 1 - k / steps;
            const angleRad = Math.PI + pct * Math.PI * 0.5;
            const offX = dimensions + Math.cos(angleRad) * innerRadius;
            const offY = dimensions + Math.sin(angleRad) * innerRadius;

            context.lineTo(offX, offY);
        }

        context.lineTo(dimensions - beltBorder, dimensions + 10);

        context.closePath();
        context.fill();
        context.stroke();

        // Arrows
        const rotationalRadius = dimensions / 2 - arrowH / 2 + 0.5;

        const circumfence = (rotationalRadius * Math.PI * 2) / 4;
        console.log("Circumfence:", circumfence, "px");

        const remainingSpace = circumfence - 3 * arrowH + arrowH;
        console.log("Remainig:", remainingSpace);
        const spacing = remainingSpace / 3 + arrowH;

        console.log("Spacing: ", spacing);
        const angleSpacing = ((spacing / circumfence) * Math.PI) / 2;

        for (let i = 0; i < 5; ++i) {
            let angleRad = Math.PI + procentual * angleSpacing + (i - 1) * angleSpacing;
            const offX = dimensions - arrowH / 2 + Math.cos(angleRad * 0.995) * rotationalRadius;
            const offY = dimensions - arrowH / 2 + Math.sin(angleRad * 0.995) * rotationalRadius;

            angleRad = Math.max(Math.PI, Math.min(1.5 * Math.PI, angleRad));

            context.save();
            context.translate(offX, offY);
            context.rotate(angleRad + Math.PI);
            context.drawImage(arrowSprite, -arrowW / 2, -arrowH / 2);
            context.restore();
        }

        /** @type {HTMLCanvasElement} */
        const flippedCanvas = createCanvas(dimensions, dimensions);
        const flippedContext = flippedCanvas.getContext("2d");
        flippedContext.quality = "best";
        flippedContext.clearRect(0, 0, dimensions, dimensions);
        flippedContext.scale(-1, 1);
        flippedContext.drawImage(canvas, -dimensions, 0, dimensions, dimensions);

        const out = fs.createWriteStream(path.join(__dirname, "right_" + i + ".png"));
        const stream = canvas.createPNGStream();
        stream.pipe(out);

        const outLeft = fs.createWriteStream(path.join(__dirname, "left_" + i + ".png"));
        const streamLeft = flippedCanvas.createPNGStream();
        streamLeft.pipe(outLeft);
    }
}

run();
