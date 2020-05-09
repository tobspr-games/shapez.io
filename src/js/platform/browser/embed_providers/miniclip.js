import { ShapezioWebsiteEmbedProvider } from "./shapezio_website";

export class MiniclipEmbedProvider extends ShapezioWebsiteEmbedProvider {
    getId() {
        return "miniclip";
    }

    getIsIframed() {
        return true;
    }
}
