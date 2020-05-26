# shapez.io

<img src="https://i.imgur.com/Y5Z2iqQ.png" alt="shapez.io Logo">

This is the source code for shapez.io, an open source base building game inspired by Factorio.

Your goal is to produce shapes by cutting, rotating, merging and painting parts of shapes.

## Playing

You can already play it [here](https://shapez.io).

## Building

-   Make sure git `git lfs` extension is on your path
-   Run `git lfs pull` to download sound assets
-   Make sure `ffmpeg` is on your path
-   Install Yarn and Node.js 10
-   Run `yarn` in the root folder, then run `yarn` in the `gulp/` folder
-   Cd into `gulp` and run `yarn gulp` - it should now open in your browser

**Notice**: This will produce a debug build with several debugging flags enabled. If you want to disable them, modify `config.js`.

## Contributing

Since this game is in the more or less early development, I will only accept pull requests which add an immediate benefit. Please understand that low quality PR's might be closed by me with a short comment explaining why.

If you want to add a new feature or in generally contribute I recommend to get in touch with me on Discord:

<a href="https://discord.com/invite/HN7EVzV" target="_blank">
<img src="https://i.imgur.com/SoawBhW.png" alt="discord logo" width="100">
</a>

### Code

The game is based on a custom engine which itself is based on the YORG.io 3 game egine (Actually it shares almost the same core).
The code within the engine is relatively clean with some code for the actual game on top being hacky.

This project is based on ES5. Some ES2015 features are used but most of them are too slow, especially when polyfilled. For example, `Array.prototype.forEach` is only used within non-critical loops since its slower than a plain for loop.

### Assets

For most assets I use Adobe Photoshop, you can find them in `assets/`.

You will need a <a href="https://www.codeandweb.com/texturepacker" target="_blank">Texture Packer</a> license in order to regenerate the atlas. If you don't have one but want to contribute assets, let me know and I might compile it for you.
