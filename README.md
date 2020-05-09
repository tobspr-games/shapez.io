# shapez.io

This is the source code for shapez.io, an open source base building game inspired by factorio.

Your goal is to produce shapes by cutting, rotating, merging and painting parts of shapes.

## Playing

You can already play it on https://beta.shapez.io

## Building

-   Make sure ffmpeg is on your path
-   Install yarn and node 10
-   Run `yarn` in the root folder, then run `yarn` in the `gulp/` folder
-   Cd into `gulp` and run `yarn gulp`: It should now open in your browser

**Notice**: This will give you a debug build with several debugging flags enabled. If you want to disable them, check `config.js`

## Contributing

Since this game is in the more or less early development, I will only accept high-quality pull requests which add an immediate benefit. Please understand that low quality PR's might be closed by me with a short comment explaining why.

### Code

The game is based on a custom engine which itself is based on the YORG.io 3 game egine (Actually its almost the same core).
Most code in the engine is clean with some code for the actual game on top being hacky.

### Assets

You will need a texture packer license in order to regenerate the atlas. If you don't have one but you want to contribute assets, let me know and I might compile it for you.
