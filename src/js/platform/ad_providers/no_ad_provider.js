import { AdProviderInterface } from "../ad_provider";

export class NoAdProvider extends AdProviderInterface {
    getHasAds() {
        return false;
    }

    getCanShowVideoAd() {
        return false;
    }
}
