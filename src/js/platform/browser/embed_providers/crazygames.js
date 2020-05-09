import { ShapezioWebsiteEmbedProvider } from "./shapezio_website";

export class CrazygamesEmbedProvider extends ShapezioWebsiteEmbedProvider {
    getId() {
        return "crazygames";
    }

    getIsIframed() {
        return true;
    }
}
