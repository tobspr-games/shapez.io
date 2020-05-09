import { EmbedProvider } from "../embed_provider";
import { AdinplayAdProvider } from "../../ad_providers/adinplay";

export class ShapezioWebsiteEmbedProvider extends EmbedProvider {
    getId() {
        return "shapezio";
    }

    getSupportsAds() {
        return true;
    }

    getAdProvider() {
        return AdinplayAdProvider;
    }

    getIsIframed() {
        return false;
    }

    getSupportsExternalLinks() {
        return true;
    }
}
