import { AdProviderInterface } from "../ad_provider";
export class NoAdProvider extends AdProviderInterface {
    getHasAds(): any {
        return false;
    }
    getCanShowVideoAd(): any {
        return false;
    }
}
