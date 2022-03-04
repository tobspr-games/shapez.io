# shapez.io Modding

## General Instructions

Currently there are two options to develop mods for shapez.io:

1. Writing single file mods, which doesn't require any additional tools and can be loaded directly in the game
2. Using the [create-shapezio-mod](https://www.npmjs.com/package/create-shapezio-mod) package. This package is still in development but allows you to pack multiple files and images into a single mod file, so you don't have to base64 encode your images etc.

## Mod Developer Discord

A great place to get help with mod development is the official [shapez.io modloader discord](https://discord.gg/xq5v8uyMue).

## Setting up your development environment

The simplest way of developing mods is by just creating a `mymod.js` file and putting it in the `mods/` folder of the standalone (You can find the `mods/` folder by clicking "Open Mods Folder" in the shapez.io Standalone, be sure to select the 1.5.0-modloader branch on Steam).

You can then add `--dev` to the launch options on Steam. This adds an application menu where you can click "Restart" to reload your mod, and will also show the developer console where you can see any potential errors.

## Getting started

To get into shapez.io modding, I highly recommend checking out all of the examples in this folder. Here's a list of examples and what features of the modloader they show:

| Example                                                    | Description                                                                                       | Demonstrates                                                                                    |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [base.js](base.js)                                         | The most basic mod                                                                                | Base structure of a mod                                                                         |
| [class_extensions.js](class_extensions.js)                 | Shows how to extend multiple methods of one class at once, useful for overriding a lot of methods | Overriding and extending builtin methods                                                        |
| [custom_css.js](custom_css.js)                             | Modifies the Main Menu State look                                                                 | Modifying the UI styles with CSS                                                                |
| [replace_builtin_sprites.js](replace_builtin_sprites.js)   | Replaces all color sprites with icons                                                             | Replacing builtin sprites                                                                       |
| [translations.js](translations.js)                         | Shows how to replace and add new translations in multiple languages                               | Adding and replacing translations                                                               |
| [add_building_basic.js](add_building_basic.js)             | Shows how to add a new building                                                                   | Registering a new building                                                                      |
| [add_building_flipper.js](add_building_flipper.js)         | Adds a "flipper" building which mirrors shapes from top to bottom                                 | Registering a new building, Adding a custom shape and item processing operation (flip)          |
| [custom_drawing.js](custom_drawing.js)                     | Displays a a small indicator on every item processing building whether it is currently working    | Adding a new GameSystem and drawing overlays                                                    |
| [custom_keybinding.js](custom_keybinding.js)               | Adds a new customizable ingame keybinding (Shift+F)                                               | Adding a new keybinding                                                                         |
| [custom_sub_shapes.js](custom_sub_shapes.js)               | Adds a new type of sub-shape (Line)                                                               | Adding a new sub shape and drawing it, making it spawn on the map, modifying the builtin levels |
| [modify_theme.js](modify_theme.js)                         | Modifies the default game themes                                                                  | Modifying the builtin themes                                                                    |
| [custom_theme.js](custom_theme.js)                         | Adds a new UI and map theme                                                                       | Adding a new game theme                                                                         |
| [mod_settings.js](mod_settings.js)                         | Shows a dialog counting how often the mod has been launched                                       | Reading and storing mod settings                                                                |
| [storing_data_in_savegame.js](storing_data_in_savegame.js) | Shows how to store custom (structured) data in the savegame                                       | Storing custom data in savegame                                                                 |
| [modify_existing_building.js](modify_existing_building.js) | Makes the rotator building always unlocked and adds a new statistic to the building panel         | Modifying a builtin building, replacing builtin methods                                         |
| [modify_ui.js](modify_ui.js)                               | Shows how to add custom UI elements to builtin game states (the Main Menu in this case)           | Extending builtin UI states, Adding CSS                                                         |
| [pasting.js](pasting.js)                                   | Shows a dialog when pasting text in the game                                                      | Listening to paste events                                                                       |
| [sandbox.js](sandbox.js)                                   | Makes blueprints free and always unlocked                                                         | Overriding builtin methods                                                                      |

### Advanced Examples

| Example                                          | Description                                                                                                | Demonstrates                                                                                                                                                        |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [notification_blocks.js](notification_blocks.js) | Adds a notification block building, which shows a user defined notification when receiving a truthy signal | Adding a new Component, Adding a new GameSystem, Working with wire networks, Adding a new building, Adding a new HUD part, Using Input Dialogs, Adding Translations |
| [usage_statistics.js](usage_statistics.js)       | Displays a percentage on every building showing its utilization                                            | Adding a new component, Adding a new GameSystem, Drawing within a GameSystem, Modifying builtin buildings, Adding custom game logic                                 |
| [new_item_type.js](new_item_type.js)             | Adds a new type of items to the map (fluids)                                                               | Adding a new item type, modifying map generation                                                                                                                    |
| [buildings_have_cost.js](buildings_have_cost.js) | Adds a new currency, and belts cost 1 of that currency                                                     | Extending and replacing builtin methods, Adding CSS and custom sprites                                                                                              |
| [mirrored_cutter.js](mirrored_cutter.js)         | Adds a mirrored variant of the cutter                                                                      | Adding a new variant to existing buildings                                                                                                                          |

### Creating new sprites

If you want to add new buildings and create sprites for them, you can download the original Photoshop PSD files here: https://static.shapez.io/building-psds.zip
