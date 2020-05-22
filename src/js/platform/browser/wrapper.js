import { Math_min } from "../../core/builtins";
import { globalConfig, IS_MOBILE } from "../../core/config";
import { createLogger } from "../../core/logging";
import { queryParamOptions } from "../../core/query_parameters";
import { clamp } from "../../core/utils";
import { NoAdProvider } from "../ad_providers/no_ad_provider";
import { PlatformWrapperInterface } from "../wrapper";
import { GamedistributionAdProvider } from "../ad_providers/gamedistribution";

const logger = createLogger("platform/browser");

export class PlatformWrapperImplBrowser extends PlatformWrapperInterface {
    initialize() {
        this.recaptchaTokenCallback = null;

        this.embedProvider = {
            id: "shapezio-website",
            adProvider: NoAdProvider,
            iframed: false,
            externalLinks: true,
            iogLink: true,
        };

        if (!G_IS_STANDALONE && queryParamOptions.embedProvider) {
            const providerId = queryParamOptions.embedProvider;
            this.embedProvider.iframed = true;
            this.embedProvider.iogLink = false;

            switch (providerId) {
                case "armorgames": {
                    this.embedProvider.id = "armorgames";
                    break;
                }

                case "iogames.space": {
                    this.embedProvider.id = "iogames.space";
                    this.embedProvider.iogLink = true;
                    break;
                }

                case "miniclip": {
                    this.embedProvider.id = "miniclip";
                    break;
                }

                case "gamedistribution": {
                    this.embedProvider.id = "gamedistribution";
                    this.embedProvider.externalLinks = false;
                    this.embedProvider.adProvider = GamedistributionAdProvider;
                    break;
                }

                case "kongregate": {
                    this.embedProvider.id = "kongregate";
                    break;
                }

                case "crazygames": {
                    this.embedProvider.id = "crazygames";
                    break;
                }

                default: {
                    logger.error("Got unsupported embed provider:", providerId);
                }
            }
        }

        logger.log("Embed provider:", this.embedProvider.id);

        return super.initialize().then(() => this.initializeAdProvider());
    }

    onSentryLoaded() {
        logger.log("Initializing sentry");
        window.Sentry.init({
            dsn: "TODO SENTRY DSN",
            release: G_APP_ENVIRONMENT + "-" + G_BUILD_VERSION + "@" + G_BUILD_COMMIT_HASH,
            // Will cause a deprecation warning, but the demise of `ignoreErrors` is still under discussion.
            // See: https://github.com/getsentry/raven-js/issues/73
            ignoreErrors: [
                // Random plugins/extensions
                "top.GLOBALS",
                // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
                "originalCreateNotification",
                "canvas.contentDocument",
                "MyApp_RemoveAllHighlights",
                "http://tt.epicplay.com",
                "Can't find variable: ZiteReader",
                "jigsaw is not defined",
                "ComboSearch is not defined",
                "http://loading.retry.widdit.com/",
                "atomicFindClose",
                // Facebook borked
                "fb_xd_fragment",
                // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to reduce this. (thanks @acdha)
                // See http://stackoverflow.com/questions/4113268/how-to-stop-javascript-injection-from-vodafone-proxy
                "bmi_SafeAddOnload",
                "EBCallBackMessageReceived",
                // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
                "conduitPage",
                // Generic error code from errors outside the security sandbox
                // You can delete this if using raven.js > 1.0, which ignores these automatically.
                "Script error.",

                // Errors from ads
                "Cannot read property 'postMessage' of null",

                // Firefox only
                "AbortError: The operation was aborted.",

                "<unknown>",
            ],
            ignoreUrls: [
                // Facebook flakiness
                /graph\.facebook\.com/i,
                // Facebook blocked
                /connect\.facebook\.net\/en_US\/all\.js/i,
                // Woopra flakiness
                /eatdifferent\.com\.woopra-ns\.com/i,
                /static\.woopra\.com\/js\/woopra\.js/i,
                // Chrome extensions
                /extensions\//i,
                /^chrome:\/\//i,
                // Other plugins
                /127\.0\.0\.1:4001\/isrunning/i, // Cacaoweb
                /webappstoolbarba\.texthelp\.com\//i,
                /metrics\.itunes\.apple\.com\.edgesuite\.net\//i,
            ],
            beforeSend(event, hint) {
                if (window.anyModLoaded) {
                    return null;
                }
                return event;
            },
        });
    }

    getId() {
        return "browser@" + this.embedProvider.id;
    }

    getUiScale() {
        if (IS_MOBILE) {
            return 1;
        }

        const avgDims = Math_min(this.app.screenWidth, this.app.screenHeight);
        return clamp((avgDims / 1000.0) * 1.9, 0.1, 10);
    }

    getSupportsRestart() {
        return true;
    }

    getTouchPanStrength() {
        return IS_MOBILE ? 1 : 0.5;
    }

    openExternalLink(url, force = false) {
        logger.log("Opening external:", url);
        if (force || this.embedProvider.externalLinks) {
            window.open(url);
        } else {
            // Do nothing
            alert(
                "This platform does not allow opening external links. You can play on https://shapez.io directly to open them.\n\nClicked Link: " +
                    url
            );
        }
    }

    performRestart() {
        logger.log("Performing restart");
        window.location.reload(true);
    }

    /**
     * Detects if there is an adblocker installed
     * @returns {Promise<boolean>}
     */
    detectAdblock() {
        return Promise.race([
            new Promise(resolve => {
                // If the request wasn't blocked within a very short period of time, this means
                // the adblocker is not active and the request was actually made -> ignore it then
                setTimeout(() => resolve(false), 30);
            }),
            new Promise(resolve => {
                fetch("https://googleads.g.doubleclick.net/pagead/id", {
                    method: "HEAD",
                    mode: "no-cors",
                })
                    .then(res => {
                        resolve(false);
                    })
                    .catch(err => {
                        resolve(true);
                    });
            }),
        ]);
    }

    initializeAdProvider() {
        if (G_IS_DEV && !globalConfig.debug.testAds) {
            logger.log("Ads disabled in local environment");
            return Promise.resolve();
        }

        // First, detect adblocker
        return this.detectAdblock().then(hasAdblocker => {
            if (hasAdblocker) {
                logger.log("Adblock detected");
                return;
            }

            const adProvider = this.embedProvider.adProvider;
            this.app.adProvider = new adProvider(this.app);
            return this.app.adProvider.initialize().catch(err => {
                logger.error("Failed to initialize ad provider, disabling ads:", err);
                this.app.adProvider = new NoAdProvider(this.app);
            });
        });
    }

    exitApp() {
        // Can not exit app
    }
}
