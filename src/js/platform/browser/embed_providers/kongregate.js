import { NoAdProvider } from "../../ad_providers/no_ad_provider";
import { EmbedProvider } from "../embed_provider";

export class KongregateEmbedProvider extends EmbedProvider {
    getId() {
        return "kongregate";
    }

    getSupportsAds() {
        return false;
    }

    getAdProvider() {
        return NoAdProvider;
    }

    getSupportsExternalLinks() {
        return true;
    }

    getIsIframed() {
        return true;
    }
}
