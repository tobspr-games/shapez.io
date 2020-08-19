declare type Translation<T extends string, U = string> = Record<T, U>;

declare type BeltVariant = "default";
declare type WireVariant = "default" | "chainable";
declare type UndergroundBeltVariant = "default" | "tier2";
declare type SplitterVariant = "default" | "compact" | "compact-inverse";
declare type CutterVariant = "default" | "quad";
declare type AdvancedProcessorVariant = "default";
declare type RotaterVariant = "default" | "ccw" | "fl";
declare type StackerVariant = "default";
declare type MixerVariant = "default";
declare type PainterVariant = "default" | "mirrored" | "double" | "quad";
declare type TrashVariant = "default" | "storage";
declare type EnergyGeneratorVariant = "default";
declare type WireCrossingsVariant = "default" | "merger";

declare type BuildingVariantMap = {
    belt: BeltVariant;
    wire: WireVariant;
    underground_belt: UndergroundBeltVariant;
    splitter: SplitterVariant;
    cutter: CutterVariant;
    advanced_processor: AdvancedProcessorVariant;
    rotater: RotaterVariant;
    stacker: StackerVariant;
    mixer: MixerVariant;
    painter: PainterVariant;
    trash: TrashVariant;
    energy_generator: EnergyGeneratorVariant;
    wire_crossings: WireCrossingsVariant;
};

declare type BuildingVariant<V extends keyof BuildingVariantMap> = BuildingVariantMap[V];

declare type Building = keyof BuildingVariantMap;
declare type Color =
    | "red"
    | "green"
    | "blue"
    | "yellow"
    | "purple"
    | "cyan"
    | "white"
    | "uncolored"
    | "black";
declare type Environment = "dev" | "prod" | "staging";
declare type Interval =
    | "one_minute"
    | "two_minutes"
    | "five_minutes"
    | "ten_minutes"
    | "twenty_minutes"
    | "disabled";
declare type Scale = "super_small" | "small" | "regular" | "large" | "huge";
declare type Sensitivity = "super_slow" | "slow" | "regular" | "fast" | "super_fast";
declare type Speed = "super_slow" | "slow" | "regular" | "fast" | "super_fast" | "extremely_fast";
declare type Theme = "dark" | "light";

declare type Rewards =
    | "reward_cutter_and_trash"
    | "reward_rotater"
    | "reward_painter"
    | "reward_mixer"
    | "reward_stacker"
    | "reward_splitter"
    | "reward_tunnel"
    | "reward_rotater_ccw"
    | "reward_miner_chainable"
    | "reward_underground_belt_tier_2"
    | "reward_splitter_compact"
    | "reward_cutter_quad"
    | "reward_painter_double"
    | "reward_painter_quad"
    | "reward_storage"
    | "reward_freeplay"
    | "reward_blueprints"
    | "no_reward"
    | "no_reward_freeplay";

declare type TitleAndText = Translation<"title" | "text">;
declare type TitleAndDesc = Translation<"title" | "desc">;
declare type TitleAndDescription = Translation<"title" | "description">;
declare type NameAndDescription = Translation<"name" | "description">;

declare type SteamPage = Translation<"shortText" | "discordLink" | "longText">;

declare type Global = Translation<
    "loading" | "error" | "thousandsDivider" | "decimalSeparator" | "infinite"
> & {
    suffix: Translation<"thousands" | "millions" | "billions" | "trillions">;
    time: Translation<
        | "oneSecondAgo"
        | "xSecondsAgo"
        | "oneMinuteAgo"
        | "xMinutesAgo"
        | "oneHourAgo"
        | "xHoursAgo"
        | "oneDayAgo"
        | "xDaysAgo"
        | "secondsShort"
        | "minutesAndSecondsShort"
        | "hoursAndMinutesShort"
        | "xMinutes"
    >;
    keys: Translation<"tab" | "control" | "alt" | "escape" | "shift" | "space">;
};

declare type DemoBanners = Translation<"title" | "intro">;

declare type MainMenu = Translation<
    | "play"
    | "continue"
    | "newGame"
    | "changelog"
    | "subreddit"
    | "importSavegame"
    | "openSourceHint"
    | "discordLink"
    | "helpTranslate"
    | "madeBy"
    | "browserWarning"
    | "savegameLevel"
    | "savegameLevelUnknown"
>;

declare type Dialogs = Translation<
    | "importSavegameError"
    | "importSavegameSuccess"
    | "gameLoadFailure"
    | "confirmSavegameDelete"
    | "savegameDeletionError"
    | "restartRequired",
    TitleAndText
> &
    Translation<
        | "editKeybinding"
        | "resetKeybindingsConfirmation"
        | "keybindingsResetOk"
        | "featureRestriction"
        | "oneSavegameLimit"
        | "updateSummary"
        | "upgradesIntroduction"
        | "massDeleteConfirm"
        | "massCutConfirm"
        | "massCutInsufficientConfirm"
        | "blueprintsNotUnlocked"
        | "keybindingsIntroduction"
        | "exportScreenshotWarning",
        TitleAndDesc
    > & {
        createMarker: TitleAndDesc & Translation<"titleEdit">;
        markerDemoLimit: Translation<"desc">;
    } & {
        buttons: Translation<
            | "ok"
            | "delete"
            | "cancel"
            | "later"
            | "restart"
            | "reset"
            | "getStandalone"
            | "deleteGame"
            | "viewUpdate"
            | "showUpgrades"
            | "showKeybindings"
        >;
    };

declare type Ingame = {
    keybindingsOverlay: Translation<
        | "moveMap"
        | "selectBuildings"
        | "stopPlacement"
        | "rotateBuilding"
        | "placeMultiple"
        | "reverseOrientation"
        | "disableAutoOrientation"
        | "toggleHud"
        | "placeBuilding"
        | "createMarker"
        | "delete"
        | "pasteLastBlueprint"
        | "lockBeltDirection"
        | "plannerSwitchSide"
        | "cutSelection"
        | "copySelection"
        | "clearSelection"
        | "pipette"
        | "switchLayers"
    >;
    colors: Translation<Color>;
    buildingPlacement: Translation<"cycleBuildingVariants" | "hotkeyLabel"> & {
        infoTexts: Translation<
            | "speed"
            | "range"
            | "storage"
            | "oneItemPerSecond"
            | "itemsPerSecond"
            | "itemsPerSecondDouble"
            | "tiles"
        >;
    };
    levelCompleteNotification: Translation<"levelTitle" | "completed" | "unlockText" | "buttonNextLevel">;
    notifications: Translation<"newUpgrade" | "gameSaved">;
    shop: Translation<"title" | "buttonUnlock" | "tier" | "maximumLevel"> & {
        tierLabels: [string, string, string, string, string, string, string, string, string, string];
    };
    statistics: Translation<"title" | "noShapesProduced" | "shapesPerMinute"> & {
        dataSources: Translation<"stored" | "produced" | "delivered", TitleAndDescription>;
    };
    settingsMenu: Translation<"playtime" | "buildingsPlaced" | "beltsPlaced"> & {
        buttons: Translation<"continue" | "settings" | "menu">;
    };
    tutorialHints: Translation<"title" | "showHint" | "hideHint">;
    blueprintPlacer: Translation<"cost">;
    waypoints: Translation<"waypoints" | "hub" | "description" | "creationSuccessNotification">;
    shapeViewer: Translation<"title" | "empty" | "copyKey">;
    interactiveTutorial: Translation<"title"> & {
        hints: Translation<"1_1_extractor" | "1_2_conveyor" | "1_3_expand">;
    };
};

declare type ShopUpgrades = Record<"belt" | "miner" | "processors" | "painting", NameAndDescription>;

declare type Buildings = { [Key in Building]: Translation<BuildingVariant<Key>, NameAndDescription> } & {
    hub: Translation<"deliver" | "toUnlock" | "levelShortcut">;
    energy_generator: Translation<"deliver" | "toGenerateEnergy">;
};

declare type StoryRewards = Translation<Rewards, TitleAndDesc>;

declare type Settings = Translation<"title" | "buildDate"> & {
    categories: Translation<"general" | "userInterface" | "advanced">;
    versionBadges: Translation<Environment>;
    labels: Translation<
        | "language"
        | "enableColorBlindHelper"
        | "fullscreen"
        | "soundsMuted"
        | "musicMuted"
        | "refreshRate"
        | "alwaysMultiplace"
        | "offerHints"
        | "enableTunnelSmartplace"
        | "vignette"
        | "rotationByBuilding"
        | "compactBuildingInfo"
        | "disableCutDeleteWarnings",
        TitleAndDescription
    > & {
        autosaveInterval: TitleAndDescription & { intervals: Translation<Interval> };
        movementSpeed: TitleAndDescription & { speeds: Translation<Speed> };
        scrollWheelSensitivity: TitleAndDescription & { sensitivity: Translation<Sensitivity> };
        theme: TitleAndDescription & { themes: Translation<Theme> };
        uiScale: TitleAndDescription & { scales: Translation<Scale> };
    };
};

declare type KeyBindings = Translation<"title" | "hint" | "resetKeybindings" | "categoryLabels"> & {
    categoryLabels: Translation<
        "general" | "ingame" | "navigation" | "placement" | "massSelect" | "buildings" | "placementModifiers"
    >;
    mappings: Translation<
        | "confirm"
        | "back"
        | "mapMoveUp"
        | "mapMoveRight"
        | "mapMoveDown"
        | "mapMoveLeft"
        | "mapMoveFaster"
        | "centerMap"
        | "mapZoomIn"
        | "mapZoomOut"
        | "createMarker"
        | "menuOpenShop"
        | "menuOpenStats"
        | "menuClose"
        | "toggleHud"
        | "toggleFPSInfo"
        | "switchLayers"
        | "exportScreenshot"
        | "belt"
        | "splitter"
        | "underground_belt"
        | "miner"
        | "cutter"
        | "advanced_processor"
        | "rotater"
        | "stacker"
        | "mixer"
        | "energy_generator"
        | "painter"
        | "trash"
        | "wire"
        | "pipette"
        | "rotateWhilePlacing"
        | "rotateInverseModifier"
        | "cycleBuildingVariants"
        | "confirmMassDelete"
        | "pasteLastBlueprint"
        | "cycleBuildings"
        | "lockBeltDirection"
        | "switchDirectionLockSide"
        | "massSelectStart"
        | "massSelectSelectMultiple"
        | "massSelectCopy"
        | "massSelectCut"
        | "placementDisableAutoOrientation"
        | "placeMultiple"
        | "placeInverse"
    >;
};

declare type About = Translation<"title" | "body">;

declare type Changelog = Translation<"title">;

declare type Demo = Translation<"settingNotAvailable"> & {
    features: Translation<
        "restoringGames" | "importingGames" | "oneGameLimit" | "customizeKeybindings" | "exportingBase"
    >;
};

declare interface Translations {
    steamPage: SteamPage;
    global: Global;
    demoBanners: DemoBanners;
    mainMenu: MainMenu;
    dialogs: Dialogs;
    ingame: Ingame;
    shopUpgrades: ShopUpgrades;
    buildings: Buildings;
    storyRewards: StoryRewards;
    settings: Settings;
    keybindings: KeyBindings;
    about: About;
    changelog: Changelog;
    demo: Demo;
}

declare module "yaml-loader!*" {
    const content: Translations;
    export default content;
}
