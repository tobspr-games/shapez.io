import { AdinplayAdProvider } from "../../ad_providers/adinplay";
import { ShapezioWebsiteEmbedProvider } from "./shapezio_website";

export class ArmorgamesEmbedProvider extends ShapezioWebsiteEmbedProvider {
    getId() {
        return "armorgames";
    }

    getAdProvider() {
        return AdinplayAdProvider;
    }

    getIsIframed() {
        return true;
    }
}
