// @ts-nocheck
const METADATA = {
    website: "https://tobspr.io",
    author: "tobspr",
    name: "Mod Example: Storing Data in Savegame",
    version: "1",
    id: "storing-savegame-data",
    description: "Shows how to add custom data to a savegame",
    minimumGameVersion: ">=1.5.0",
};

class Mod extends shapez.Mod {
    init() {
        ////////////////////////////////////////////////////////////////////
        // Option 1: For simple data
        this.signals.gameSerialized.add((root, data) => {
            data.modExtraData["storing-savegame-data"] = Math.random();
        });

        this.signals.gameDeserialized.add((root, data) => {
            alert("The value stored in the savegame was: " + data.modExtraData["storing-savegame-data"]);
        });

        ////////////////////////////////////////////////////////////////////
        // Option 2: If you need a structured way of storing data

        class SomeSerializableObject extends shapez.BasicSerializableObject {
            static getId() {
                return "SomeSerializableObject";
            }

            static getSchema() {
                return {
                    someInt: shapez.types.int,
                    someString: shapez.types.string,
                    someVector: shapez.types.vector,

                    // this value is allowed to be null
                    nullableInt: shapez.types.nullable(shapez.types.int),

                    // There is a lot more .. be sure to checkout src/js/savegame/serialization.js
                    // You can have maps, classes, arrays etc..
                    // And if you need something specific you can always ask in the modding discord.
                };
            }

            constructor() {
                super();
                this.someInt = 42;
                this.someString = "Hello World";
                this.someVector = new shapez.Vector(1, 2);

                this.nullableInt = null;
            }
        }

        // Store our object in the global game root
        this.signals.gameInitialized.add(root => {
            root.myObject = new SomeSerializableObject();
        });

        // Save it within the savegame
        this.signals.gameSerialized.add((root, data) => {
            data.modExtraData["storing-savegame-data-2"] = root.myObject.serialize();
        });

        // Restore it when the savegame is loaded
        this.signals.gameDeserialized.add((root, data) => {
            const errorText = root.myObject.deserialize(data.modExtraData["storing-savegame-data-2"]);
            if (errorText) {
                alert("Mod failed to deserialize from savegame: " + errorText);
            }
            alert("The other value stored in the savegame (option 2) was " + root.myObject.someInt);
        });

        ////////////////////////////////////////////////////////////////////
    }
}
