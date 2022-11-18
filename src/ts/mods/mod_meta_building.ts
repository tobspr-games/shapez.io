import { MetaBuilding } from "../game/meta_building";
export class ModMetaBuilding extends MetaBuilding {
    /**
     * {}
     */
    static getAllVariantCombinations(): ({
        variant: string;
        rotationVariant?: number;
        name: string;
        description: string;
        blueprintImageBase64?: string;
        regularImageBase64?: string;
        tutorialImageBase64?: string;
    }[]) {
        throw new Error("Implement getAllVariantCombinations");
    }
}
