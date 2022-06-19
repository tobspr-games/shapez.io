const { join, resolve } = require("path");
const { readFileSync, readdirSync, writeFileSync } = require("fs");

const suffixToScale = {
    lq: "0.25",
    mq: "0.5",
    hq: "0.75",
};

function convert(srcDir) {
    const fullPath = resolve(srcDir);
    const srcFiles = readdirSync(fullPath)
        .filter(n => n.endsWith(".atlas"))
        .map(n => join(fullPath, n));

    for (const atlas of srcFiles) {
        console.log(`Processing: ${atlas}`);

        // Sections for different atlas images are broken up via an extra line break
        const atlasSections = readFileSync(atlas, "utf-8")
            .trim()
            .split("\n\n");

        console.log("Found " + atlasSections.length + " sections!");
        // Perform the conversion for each section
        for (const section of atlasSections) {
            preformConversion(fullPath, section);
        }
    }
}

function formatImageData(keywordArgs) {
    let { name, rotate, xy, size, orig, offset, index } = keywordArgs;

    // Convert to arrays because Node.js doesn't
    // support latest JS features
    xy = xy.split(",").map(v => Number(v));
    size = size.split(",").map(v => Number(v));
    orig = orig.split(",").map(v => Number(v));
    offset = offset.split(",").map(v => Number(v));

    // GDX TexturePacker removes index suffixes
    let imageName = index === -1 ? `${name}.png` : `${name}_${index}.png`;


    const frameInfo = {
        // Bounds on atlas
        frame: {
            x: xy[0],
            y: xy[1],
            w: size[0],
            h: size[1],
        },

        // Whether image was rotated
        rotated: rotate === "true",

        // If blank space was trimmed from the image
        trimmed: size !== orig,

        // How is the image trimmed
        spriteSourceSize: {
            x: offset[0],
            y: (orig[1] - size[1]) - offset[1],
            w: size[0],
            h: size[1],
        },

        // Original image size
        sourceSize: {
            w: orig[0],
            h: orig[1],
        },
    };

    return [imageName, frameInfo];
}

function preformConversion(pathPrefix, atlasData) {
    // Read all text, split it into line array
    // and filter all empty lines
    const lines = atlasData
        .split("\n")
        .filter(n => n.trim());

    // Get source image name
    const image = lines.shift();
    const srcMeta = {};

    // Read all metadata
    while (true) {
        const nextLine = lines.shift();

        // If a line does not contain a colon, we have gone too far
        if (!nextLine.includes(":")) {
            lines.unshift(nextLine);
            break;
        }

        // Append the parsed key value pair to our metadata map
        const [key, value] = nextLine.split(":");
        srcMeta[key] = value.trim();
    }

    const frames = {};
    let current = null;

    for (const line of lines) {
        if (!line.startsWith("  ")) {
            // New frame, convert previous if it exists
            if (current !== null) {
                // Add the previous image's frame info to the frame map
                const [imageName, frameInfo] = formatImageData(current);
                frames[imageName] = frameInfo;
            }

            // Reset the frame info with the new frame name.
            current = { name: line };
        } else {
            // Read and set current image metadata
            const [key, value] = line.split(":").map(v => v.trim());

            // Check if the value should be a number
            const valueAsNum = Number(value);
            current[key] = isNaN(valueAsNum) ? value : valueAsNum;
        }
    }

    // Assuming the image was not empty, there should be one last remaining entry that needs to be added.
    if (current !== null) {
        // Add the previous image's frame info to the frame map
        const [imageName, frameInfo] = formatImageData(current);
        frames[imageName] = frameInfo;
    }

    const atlasSize = srcMeta.size.split(",").map(v => Number(v));
    const atlasScale = suffixToScale[image.match(/_([a-z]+)\d*\.png$/)[1]];

    const result = JSON.stringify({
        frames,
        meta: {
            image,
            format: srcMeta.format,
            size: {
                w: atlasSize[0],
                h: atlasSize[1],
            },
            scale: atlasScale.toString(),
        },
    });

    const dstFile = join(pathPrefix, image.replace(".png", ".json"));
    writeFileSync(dstFile, result, {
        encoding: "utf-8",
    });
}

module.exports = { convert };
