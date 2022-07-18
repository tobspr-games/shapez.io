/**
 * @type {Record<string, {
 *  standalone: boolean,
 *  environment?: 'dev' | 'staging' | 'prod',
 *  electronBaseDir?: string,
 *  steamAppId?: number,
 *  executableName?: string,
 *  buildArgs: {
 *      chineseVersion?: boolean,
 *      wegameVersion?: boolean,
 *      steamDemo?: boolean,
 *      gogVersion?: boolean
 * }}>}
 */
const BUILD_VARIANTS = {
    "web-localhost": {
        standalone: false,
        environment: "dev",
        buildArgs: {},
    },
    "web-shapezio-beta": {
        standalone: false,
        environment: "staging",
        buildArgs: {},
    },
    "web-shapezio": {
        standalone: false,
        environment: "prod",
        buildArgs: {},
    },
    "standalone-steam": {
        standalone: true,
        executableName: "shapez",
        steamAppId: 1318690,
        buildArgs: {},
    },
    "standalone-steam-china": {
        standalone: true,
        steamAppId: 1318690,
        buildArgs: {
            chineseVersion: true,
        },
    },
    "standalone-steam-demo": {
        standalone: true,
        steamAppId: 1930750,
        buildArgs: {
            steamDemo: true,
        },
    },
    "standalone-steam-china-demo": {
        standalone: true,
        steamAppId: 1930750,
        buildArgs: {
            steamDemo: true,
            chineseVersion: true,
        },
    },
    "standalone-wegame": {
        standalone: true,
        electronBaseDir: "electron_wegame",
        buildArgs: {
            wegameVersion: true,
        },
    },
    "standalone-gog": {
        standalone: true,
        electronBaseDir: "electron_gog",
        buildArgs: {
            gogVersion: true,
        },
    },
};
module.exports = { BUILD_VARIANTS };
