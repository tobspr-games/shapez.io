export const IS_DEBUG =
    G_IS_DEV &&
    typeof window !== "undefined" &&
    window.location.port === "3005" &&
    (window.location.host.indexOf("localhost:") >= 0 || window.location.host.indexOf("192.168.0.") >= 0) &&
    window.location.search.indexOf("nodebug") < 0;

const smoothCanvas = true;

export const globalConfig = {
    // Size of a single tile in Pixels.
    // NOTICE: Update webpack.production.config too!
    tileSize: 32,
    halfTileSize: 16,

    // Which dpi the assets have
    assetsDpi: 192 / 32,
    assetsSharpness: 1.2,
    shapesSharpness: 1.4,

    // Production analytics
    statisticsGraphDpi: 2.5,
    statisticsGraphSlices: 100,
    analyticsSliceDurationSeconds: 10,

    // [Calculated] physics step size
    physicsDeltaMs: 0,
    physicsDeltaSeconds: 0,

    // Update physics at N fps, independent of rendering
    // physicsUpdateRate: 55,
    physicsUpdateRate: 120,

    // Map
    mapChunkSize: 32,
    mapChunkPrerenderMinZoom: 1.3,
    mapChunkOverviewMinZoom: 0.7,

    // Belt speeds
    // NOTICE: Update webpack.production.config too!
    beltSpeedItemsPerSecond: 5,
    itemSpacingOnBelts: 0.63,
    minerSpeedItemsPerSecond: 0, // COMPUTED

    undergroundBeltMaxTilesByTier: [5, 8],

    buildingSpeeds: {
        cutter: 1 / 4,
        rotater: 1 / 1,
        rotaterCCW: 1 / 1,
        painter: 1 / 3,
        painterDouble: 1 / 3,
        mixer: 1 / 2,
        stacker: 1 / 5,
    },

    // Zooming
    initialZoom: 1.9,
    minZoomLevel: 0.1,
    maxZoomLevel: 3,

    // Global game speed
    gameSpeed: 1,

    warmupTimeSecondsFast: 0.1,
    warmupTimeSecondsRegular: 1,

    smoothing: {
        smoothMainCanvas: smoothCanvas && true,
        quality: "low", // Low is CRUCIAL for mobile performance!
    },

    rendering: {},

    debug: {
        /* dev:start */
        fastGameEnter: true,
        noArtificialDelays: true,
        // disableSavegameWrite: true,
        showEntityBounds: false,
        showAcceptorEjectors: false,
        usePlainShapeIds: true,
        disableMusic: true,
        doNotRenderStatics: false,
        disableZoomLimits: false,
        showChunkBorders: false,
        rewardsInstant: false,
        allBuildingsUnlocked: true,
        upgradesNoCost: true,
        disableUnlockDialog: false,
        /* dev:end */
    },

    // Secret vars
    info: {
        // Binary file salt
        file: "Ec'])@^+*9zMevK3uMV4432x9%iK'=",

        // Savegame salt
        sgSalt: "}95Q3%8/.837Lqym_BJx%q7)pAHJbF",

        // Analytics key
        analyticsApiKey: "baf6a50f0cc7dfdec5a0e21c88a1c69a4b34bc4a",
    },
};

export const IS_MOBILE = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Automatic calculations

globalConfig.physicsDeltaMs = 1000.0 / globalConfig.physicsUpdateRate;
globalConfig.physicsDeltaSeconds = 1.0 / globalConfig.physicsUpdateRate;

globalConfig.minerSpeedItemsPerSecond =
    globalConfig.beltSpeedItemsPerSecond / globalConfig.itemSpacingOnBelts / 6;
