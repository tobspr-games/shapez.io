# shapez.io

<img src="https://i.imgur.com/Y5Z2iqQ.png" alt="shapez.io Logo">

This is the source code for shapez.io, an open source base building game inspired by Factorio.
Your goal is to produce shapes by cutting, rotating, merging and painting parts of shapes.

-   [Trello Board & Roadmap](https://trello.com/b/ISQncpJP/shapezio)
-   [Free web version](https://shapez.io)
-   [itch.io Page](https://tobspr.itch.io/shapezio)
-   [Steam Page](https://steam.shapez.io)
-   [Official Discord](https://discord.com/invite/HN7EVzV) <- _Highly recommended to join!_

## Reporting issues, suggestions, feedback, bugs

1. Ask in `#bugs` / `#feedback` / `#questions` on the [Official Discord](https://discord.com/invite/HN7EVzV) if you are not entirely sure if it's a bug etc.
2. Check out the trello board: https://trello.com/b/ISQncpJP/shapezio
3. See if it's already there - If so, vote for it, done. I will see it. (You have to be signed in on trello)
4. If not, check if it's already reported here: https://github.com/tobspr/shapez.io/issues
5. If not, file a new issue here: https://github.com/tobspr/shapez.io/issues/new
6. I will then have a look (This can take days or weeks) and convert it to trello, and comment with the link. You can then vote there ;)

## Building (for windows)

(credit to Hyperion-21)

**SETUP**
1. Download FFmpeg at https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-full.7z
2. Extract the .zip onto desktop, rename it to FFmpeg
3. Move the folder into `C:\Program Files (x86)`, anywhere works but there is convienient
4. Go to `Control Panel\System and Security\System` and click on `Advanced system settings`
5. Go to the `Advanced` tab. Click on `Enviornment Variables...`
6. Click on the listing that says `PATH` and click edit. 
- On win10, you should see a list. Click `New` then type in `C:\Program Files (x86)\FFmpeg\bin`
- On win7, you should see a window that says `Edit User Variable.` In the text field that says "Variable value:" you want to type at the end `;C:\Program Files (x86)\FFmpeg\bin`. The semicolon is for seperating the file path from the other file paths in that field.
7. FFmpeg should now be installed. To test if you did this correctly, run `cmd.exe` as administrator and type `ffmpeg -version` and it should spit at you several lines of code.
8. Install `Node.js`, `Yarn`, and `GitHub CLI`. All three of these softwares use setup wizards, so installation should be easy. If you don't know what setting to put in, use the default. Also make sure you have `Java` and `Git`, but both are very commom afaik.
9. Run `cmd.exe` or `Powershell`.
10. `cd C:\Program Files (x86)\GitHub CLI` then `gh`. Login through that, selecting HTML over SSH.
11. `gh repo clone tobspr/shapez.io` to make sure the game's code is on your system.
12. `git remote add upstream https://github.com/tobspr/shapez.io.git` for resetting branches to the current and official build on GitHub.
13. Set up branches for development. If you just want to build and not make anything, skip this step. On your fork, you should create a new branch. Each unique pull request should have its own branch. Reserve the `master` branch to being level with `tobspr/master`. Run `git reset --hard upstream/(username)/master && git push --force` to reset your master to be level with tob's. Make sure all of your current work is on the branch you created.

**EXECUTION**
1. Start `cmd.exe` or `Powershell`
2. If you aren't already on `C:\Users\[Your user]`, type `cd %USERPROFILE%`
3. `cd shapez.io`
4. See below for switching builds. If you wish to perform any of those commands, run them at this step.
5. `yarn & cd gulp & yarn & yarn gulp`. This will take a while, and after it has finished

**SWITCHING BUILD**
- If you want to run a specific pull request, run `gh pr checkout [pr number]`
- If you want to run a specific fork, run `git remote add [arbitrary name] [HTML url, click 'code' on the fork's page and copy the url here] & git fetch -a`. You now have the fork as a remote.
- If you want to run a specific branch, run `git branch -a` and choose one of the branches. Run `git checkout` followed by the branch you chose. Note that 

**Notice**: This will produce a debug build with several debugging flags enabled. If you want to disable them, modify [`src/js/core/config.js`](src/js/core/config.js).

## Build Online with one-click setup

You can use [Gitpod](https://www.gitpod.io/) (an Online Open Source VS Code-like IDE which is free for Open Source) for working on issues and making PRs to this project. With a single click it will start a workspace and automatically:

- clone the `shapez.io` repo.
- install all of the dependencies.
- start `gulp` in `gulp/` directory.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/from-referrer/)

## Helping translate

Please checkout the [Translations readme](translations/).

## Contributing

Since this game is in the more or less early development, I will only accept pull requests which add an immediate benefit. Please understand that low quality PR's might be closed by me with a short comment explaining why.

**If you want to add a new building, please understand that I can not simply add every building to the game!** I recommend to talk to me before implementing anything, to make sure its actually useful. Otherwise there is a high chance of your PR not getting merged.

If you want to add a new feature or in generally contribute I recommend to get in touch with me on Discord:

<a href="https://discord.com/invite/HN7EVzV" target="_blank">
<img src="https://i.imgur.com/SoawBhW.png" alt="discord logo" width="100">
</a>

### Code

The game is based on a custom engine which itself is based on the YORG.io 3 game engine (Actually it shares almost the same core).
The code within the engine is relatively clean with some code for the actual game on top being hacky.

This project is based on ES5. Some ES2015 features are used but most of them are too slow, especially when polyfilled. For example, `Array.prototype.forEach` is only used within non-critical loops since its slower than a plain for loop.

#### Adding a new component

1. Create the component file in `src/js/game/components/<name_lowercase>.js`
2. Create a component class (e.g. `MyFancyComponent`) which `extends Component`
3. Create a `static getId()` method which should return the `PascalCaseName` without component (e.g. `MyFancy`)
4. If any data needs to be persisted, create a `static getSchema()` which should return the properties to be saved (See other components)
5. Add a constructor. **The constructor must be called with optional parameters only!** `new MyFancyComponent({})` should always work.
6. Add any props you need in the constructor.
7. Add the component in `src/js/game/component_registry.js`
8. Add the component in `src/js/game/entity_components.js`
9. Done! You can use your component now

#### Adding a new building

(The easiest way is to copy an existing building)

1. Create your building in `src/js/game/buildings/<my_building.js>`
2. Create the building meta class, e.g. `MetaMyFancyBuilding extends MetaBuilding`
3. Override the methods from MetaBuilding you want to override.
4. Most important is `setupEntityComponents`
5. Add the building to `src/js/game/meta_building_registry.js`: You need to register it on the registry, and also call `registerBuildingVariant`.
6. Add the building to the right toolbar, e.g. `src/js/game/hud/parts/buildings_toolbar.js`:`supportedBuildings`
7. Add a keybinding for the building in `src/js/game/key_action_mapper.js` in `KEYMAPPINGS.buildings`
8. In `translations/base-en.yaml` add it to two sections: `buildings.[my_building].XXX` (See other buildings) and also `keybindings.mappings.[my_building]`. Be sure to do it the same way as other buildings do!
9. Create a icon (128x128, [prefab](https://github.com/tobspr/shapez.io-artwork/blob/master/ui/toolbar-icons.psd)) for your building and save it in `res/ui/buildings_icons` with the id of your building
10. Create a tutorial image (600x600) for your building and save it in `res/ui/building_tutorials`
11. In `src/css/resources.scss` add your building to `$buildings` as well as `$buildingAndVariants`
12. Done! Optional: Add a new reward for unlocking your building at some point.

#### Adding a new game system

1. Create the class in `src/js/game/systems/<system_name>.js`
2. Derive it from `GameSystemWithFilter` if you want it to work on certain entities only which have the given components. Otherwise use `GameSystem` to do more generic stuff.
3. Implement the `update()` method.
4. Add the system in `src/js/game/game_system_manager.js` (To `this.systems` and also call `add` in the `internalInitSystems()` method)
5. If your system should draw stuff, this is a bit more complicated. Have a look at existing systems on how they do it.

#### Checklist for a new building / testing it

This is a quick checklist, if a new building is added this points should be fulfilled:

2. The translation for all variants is done and finalized
3. The artwork (regular sprite) is finalized
4. The blueprint sprite has been generated and is up to date
5. The building has been added to the appropriate toolbar
6. The building has a keybinding which makes sense
7. The building has a reward assigned and is unlocked at a meaningful point
8. The reward for the building has a proper translation
9. The reward for the building has a proper image
10. The building has a proper tutorial image assigned
11. The buliding has a proper toolbar icon
12. The reward requires a proper shape
13. The building has a proper silhouette color
14. The building has a proper matrix for being rendered on the minimap
15. The building has proper statistics in the dialog
16. The building properly contributes to the shapes produced analytics
17. The building is properly persisted in the savegame
18. The building is explained properly, ideally via an interactive tutorial

### Assets

For most assets I use Adobe Photoshop, you can find them <a href="//github.com/tobspr/shapez.io-artwork" target="_blank">here</a>.

All assets will be automatically rebuilt into the atlas once changed (Thanks to dengr1065!)

<img src="https://i.imgur.com/W25Fkl0.png" alt="shapez.io Screenshot">
