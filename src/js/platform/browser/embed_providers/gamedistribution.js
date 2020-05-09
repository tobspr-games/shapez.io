import { AdinplayAdProvider } from "../../ad_providers/adinplay";
import { ShapezioWebsiteEmbedProvider } from "./shapezio_website";

export class GamedistributionEmbedProvider extends ShapezioWebsiteEmbedProvider {
    getId() {
        return "gamedistribution";
    }

    getAdProvider() {
        return AdinplayAdProvider;
    }

    getSupportsExternalLinks() {
        return false;
    }

    getIsIframed() {
        return true;
    }
}
