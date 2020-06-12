// Converts the atlas description to a JSON file

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

const fs = require("fs");
const path = require("path");

const folder = path.join(__dirname, "res_built", "atlas");
const files = fs.readdirSync(folder);

const metadata = [];

files.forEach(filename => {
    if (filename.endsWith(".atlas")) {
        // Read content

        const content = fs.readFileSync(path.join(folder, filename), "ascii");

        const lines = content.replaceAll("\r", "").replaceAll("\t", "").split("\n");

        const readLine = () => lines.splice(0, 1)[0];
        const readValue = () => readLine().replaceAll(" ", "").split(":")[1];
        const readVector = () =>
            readValue()
                .split(",")
                .map(d => parseInt(d, 10));

        let maxAtlas = 100;

        atlasLoop: while (maxAtlas-- > 0 && lines.length >= 7) {
            const result = {
                entries: [],
            };

            // Extract header
            const header_fileStart = readLine();
            const header_fileName = readLine();
            const header_size = readVector();
            const header_format = readLine();
            const header_filter = readLine();
            const header_repeat = readLine();
            const baseAtlasName = header_fileName.replace(".png", "");

            // Store size
            result.size = header_size;

            lineLoop: while (lines.length >= 7) {
                const entryResult = {};

                const nextLine = lines[0];
                if (nextLine.length === 0) {
                    break;
                }

                const entry_fileName = readLine() + ".png";

                const entry_rotate = readValue();
                const entry_xy = readVector();
                const entry_size = readVector();
                const entry_orig = readVector();
                const entry_offset = readVector();
                const entry_index = readValue();

                entryResult.filename = entry_fileName;
                entryResult.xy = entry_xy;
                entryResult.size = entry_size;
                // entryResult.offset = entry_offset;

                entryResult.origSize = entry_orig;

                let offset = [0, 0];

                // TODO do something with this for textures not generated with GDX
                // GDX Atlas packer uses 1 - y coordinates. This sucks, and we have to convert it
                offset[0] = entry_offset[0];
                offset[1] = entry_orig[1] - entry_offset[1] - entry_size[1];

                entryResult.offset = offset;

                result.entries.push(entryResult);
            }

            console.log("[Atlas]", "'" + baseAtlasName + "'", "has", result.entries.length, "entries");
            // fs.writeFileSync(path.join(folder, baseAtlasName + ".gen.json"), JSON.stringify(result));

            metadata.push({
                filename: baseAtlasName + ".png",
                entries: result,
            });
        }
    }
});

fs.writeFileSync(path.join(folder, "meta.gen.json"), JSON.stringify(metadata, null, 4));
