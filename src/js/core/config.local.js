export default {
    // You can set any debug options here!
    /* dev:start */
    // -----------------------------------------------------------------------------------
    // Import debug settings from game settings
    enableDebugSettings: true,
    // -----------------------------------------------------------------------------------
    // Quickly enters the game and skips the main menu - good for fast iterating
    fastGameEnter: false,
    // -----------------------------------------------------------------------------------
    // Skips any delays like transitions between states and such
    noArtificialDelays: false,
    // -----------------------------------------------------------------------------------
    // Disables writing of savegames, useful for testing the same savegame over and over
    disableSavegameWrite: false,
    // -----------------------------------------------------------------------------------
    // Shows bounds of all entities
    showEntityBounds: false,
    // -----------------------------------------------------------------------------------
    // Shows arrows for every ejector / acceptor
    showAcceptorEjectors: false,
    // -----------------------------------------------------------------------------------
    // Disables the music (Overrides any setting, can cause weird behaviour)
    disableMusic: false,
    // -----------------------------------------------------------------------------------
    // Do not render static map entities (=most buildings)
    doNotRenderStatics: false,
    // -----------------------------------------------------------------------------------
    // Allow to zoom freely without limits
    disableZoomLimits: false,
    // -----------------------------------------------------------------------------------
    // Shows a border arround every chunk
    showChunkBorders: false,
    // -----------------------------------------------------------------------------------
    // All rewards can be unlocked by passing just 1 of any shape
    rewardsInstant: false,
    // -----------------------------------------------------------------------------------
    // Unlocks all buildings
    allBuildingsUnlocked: false,
    // -----------------------------------------------------------------------------------
    // Disables cost of bluepirnts
    blueprintsNoCost: false,
    // -----------------------------------------------------------------------------------
    // Disables cost of upgrades
    upgradesNoCost: false,
    // -----------------------------------------------------------------------------------
    // Disables the dialog when completing a level
    disableUnlockDialog: false,
    // -----------------------------------------------------------------------------------
    // Speed ups the game at the cost of not checking obvious things.
    debug_disableInternalCheckTile: false,
    // -----------------------------------------------------------------------------------
    // Speed ups the game at the cost of not checking obvious things.
    debug_disableGetTileAsserts: false,
    // -----------------------------------------------------------------------------------
    // Speed ups the game at the cost of not checking obvious things.
    debug_disableBeltAsserts: false,
    // -----------------------------------------------------------------------------------
    // Disables the simulation - This effectively pauses the game.
    disableLogicTicks: false,
    // -----------------------------------------------------------------------------------
    // Test the rendering if everything is clipped out properly
    testClipping: false,
    // -----------------------------------------------------------------------------------
    // Allows to render slower, useful for recording at half speed to avoid stuttering
    framePausesBetweenTicks: 1,
    // -----------------------------------------------------------------------------------
    // Replace all translations with emojis to see which texts are translateable
    testTranslations: false,
    // -----------------------------------------------------------------------------------
    // Enables an inspector which shows information about the entity below the curosr
    enableEntityInspector: false,
    // -----------------------------------------------------------------------------------
    // Enables ads in the local build (normally they are deactivated there)
    testAds: false,
    // -----------------------------------------------------------------------------------
    // Disables the automatic switch to an overview when zooming out
    disableMapOverview: false,
    // -----------------------------------------------------------------------------------
    // Disables the notification when there are new entries in the changelog since last played
    disableUpgradeNotification: false,
    // -----------------------------------------------------------------------------------
    // Makes belts almost infinitely fast
    instantBelts: false,
    // -----------------------------------------------------------------------------------
    // Makes item processors almost infinitely fast
    instantProcessors: false,
    // -----------------------------------------------------------------------------------
    // Makes miners almost infinitely fast
    instantMiners: false,
    // -----------------------------------------------------------------------------------
    // When using fastGameEnter, controls whether a new game is started or the last one is resumed
    resumeGameOnFastEnter: false,
    // -----------------------------------------------------------------------------------
    // Special option used to render the trailer
    renderForTrailer: false,
    // -----------------------------------------------------------------------------------
    /* dev:end */
};
