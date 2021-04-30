import { GameRoot } from "../game/root";

export class PuzzleSerializer {
    /**
     * Serializes the game root into a dump
     * @param {GameRoot} root
     * @param {boolean=} sanityChecks Whether to check for validity
     * @returns {object}
     */
    generateDumpFromGameRoot(root, sanityChecks = true) {
        console.log("serializing", root);

        return {
            type: "puzzle",
            contents: "foo",
        };
    }
}
