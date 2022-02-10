import { MetaBuilding } from "../game/meta_building";

export class ModMetaBuilding extends MetaBuilding {
    /**
     * @returns {({
     *  variant: string;
     *  rotationVariant?: number;
     *  name: string;
     *  description: string;
     *  blueprintImageBase64?: string;
     *  regularImageBase64?: string;
     *  tutorialImageBase64?: string;
     * }[])}
     */
    static getAllVariantCombinations() {
        throw new Error("Implement getAllVariantCombinations");
    }
}
