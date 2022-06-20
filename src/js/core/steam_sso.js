import { T } from "../translations";
import { openStandaloneLink } from "./config";

export let WEB_STEAM_SSO_AUTHENTICATED = false;

export async function authorizeViaSSOToken(app, dialogs) {
    if (G_IS_STANDALONE) {
        return;
    }

    if (window.location.search.includes("sso_logout_silent")) {
        window.localStorage.setItem("steam_sso_auth_token", "");
        window.location.replace("/");
        return new Promise(() => null);
    }

    if (window.location.search.includes("sso_logout")) {
        const { ok } = dialogs.showWarning(T.dialogs.steamSsoError.title, T.dialogs.steamSsoError.desc);
        window.localStorage.setItem("steam_sso_auth_token", "");
        ok.add(() => window.location.replace("/"));
        return new Promise(() => null);
    }

    if (window.location.search.includes("steam_sso_no_ownership")) {
        const { ok, getStandalone } = dialogs.showWarning(
            T.dialogs.steamSsoNoOwnership.title,
            T.dialogs.steamSsoNoOwnership.desc,
            ["ok", "getStandalone:good"]
        );
        window.localStorage.setItem("steam_sso_auth_token", "");
        getStandalone.add(() => {
            openStandaloneLink(app, "sso_ownership");
            window.location.replace("/");
        });
        ok.add(() => window.location.replace("/"));
        return new Promise(() => null);
    }

    const token = window.localStorage.getItem("steam_sso_auth_token");
    if (!token) {
        return Promise.resolve();
    }

    const apiUrl = app.clientApi.getEndpoint();
    console.warn("Authorizing via token:", token);

    const verify = async () => {
        const token = window.localStorage.getItem("steam_sso_auth_token");
        if (!token) {
            window.location.replace("?sso_logout");
            return;
        }

        try {
            const response = await Promise.race([
                fetch(apiUrl + "/v1/sso/refresh", {
                    method: "POST",
                    body: token,
                    headers: {
                        "x-api-key": "d5c54aaa491f200709afff082c153ef2",
                    },
                }),
                new Promise((resolve, reject) => {
                    setTimeout(() => reject("timeout exceeded"), 20000);
                }),
            ]);

            const responseText = await response.json();
            if (!responseText.token) {
                console.warn("Failed to register");
                window.localStorage.setItem("steam_sso_auth_token", "");
                window.location.replace("?sso_logout");
                return;
            }

            window.localStorage.setItem("steam_sso_auth_token", responseText.token);
            app.clientApi.token = responseText.token;
            WEB_STEAM_SSO_AUTHENTICATED = true;
        } catch (ex) {
            console.warn("Auth failure", ex);
            window.localStorage.setItem("steam_sso_auth_token", "");
            window.location.replace("/");
            return new Promise(() => null);
        }
    };

    await verify();
    setInterval(verify, 120000);
}
