import { ShapezioWebsiteEmbedProvider } from "./shapezio_website";

export class IogamesSpaceEmbedProvider extends ShapezioWebsiteEmbedProvider {
    getId() {
        return "iogames.space";
    }

    getShowUpvoteHints() {
        return true;
    }

    getIsIframed() {
        return true;
    }
}
