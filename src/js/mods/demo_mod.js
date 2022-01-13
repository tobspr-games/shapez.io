import { Mod } from "./mod";

export class DemoMod extends Mod {
    constructor(modLoader) {
        super(
            {
                authorContact: "tobias@tobspr.io",
                authorName: "tobspr",
                name: "Demo Mod",
                version: "1",
                id: "demo-mod",
            },
            modLoader
        );
    }

    init() {
        // Add some custom css
        this.modLoader.modInterface.registerCss(`
            * {
                color: red !important;
            }
        `);

        // Replace a builtin sprite
        this.modLoader.modInterface.registerSprite(
            "sprites/colors/red.png",
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAB2AAAAdgB+lymcgAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAATkSURBVHic7ZpfiFRVHMc/v5m99+6qWYhCYKFGVJpPFYgK4UNQb1GwODO5M2OLUmASItGD6OJDYX8IIqPMdWdmdWZkE6GnnozqJWkxENMyg/75tP31z+7MnZ3760GrZf7fmXuvaPfzMvA7v3PO9/e7555z5pwLISEhISEhISH/U6SXyjo4aFaM+atUndUISwEUSmjkW5XouYH86I9eiJxJDC8Tra4EHhBxrGtW+UWQr43K1bMyMWF323ZXCSglko8JJFF5EljYwvUMytFqVcfmTeQuuuljejC5NBqVzQgx4MEWrpdAjjtIbqAwdsJNH+AyAXYi9TDKGwobXPYzI8J7hil7JZP5s5WjptN3VGzdrcpzwICbTgQ9gbLTLOa+6rxOh9iJ1FZV3gEMN6Jqevspok7SKIx/2qi4Ek+udZDDwD1d9wGziO6y8rl9nUlqg4LY8dQosLkHUXOpCmwxC9mxuUY7ln5WRQ8AUS86UWXUKma3CGgrv0i7hirx1Ot4FzxAVGG0lEhu+8dQiqdfUNGDeBQ8gAjDdiL1Wlu/VoXleHITyLhXompwVHkKQITjdPAwukOHrELucLPSpgnQeHxxGfOcwGJ/hAFw5frvAr86UJiysFdJofBro/KmWS+rudfn4OFa4L4FDyCwpCLmSIvyenRw6+12X/kiMN8vYQFzxZy17pKJA3/VFjQcAWWjNMStEzzAgnK0vKlRQcMEiMoT/uoJHhEeb2SvS4Beey3W+q4oeNbryEhdvHWGUiy9DFgUiKRgWVQ6//Pdtca6BESVJcHoCZ4os3WrWl0CnGj1Vnz6ADg47RNANdJy73xzI9VaS/2kEOW3YMQET6Qa/b3OVmsw+qPnAScQRcHiGH32hVpjXQLk0KHLwDeBSAqWs3LkyKVaY+ONEPKx/3oCRmgYU+M/Q1ot+CrmBiCO5hvZGybALI5PIpzyV1KAKF82OydsfgihvOKboKARaRpL0wSY9684fouMgknz/uUfNStseSRmx4YeUYmcxLfjKt9xJCLrzSOZL5o5tAzMLI5PqvK+97qCQZR3WwUPHTxZq192AKc9UxUcZ43q9EvtnNomQDKZEugQMOOJrCAQpnGcjTIx0VZzR++2VcidBoa4ObbICjJsHR0/04lzx5ObVcgeQ9nTva6AEN1l5TPFjt3dtm/H028qusNtvSAQYb+Zz25r7/kfrpc3o5DZqegHbuv5j2SN+1Zsd1vLdQIE1JqdeR4Ya+scHGPm7NVhGRlxPUd1/YWIgtiJ9B5Ub+i8IMLbRj77Yrtb4Kb1exVQiqW2i/AWwe8WFXjZKmTb3gC3oucEANiJVFKVg/Ty8YQ7KqIybBYzPd9ce5IAgMozqfWOw4fAnV612QiFKRXdOJDPfeJFe54lAK5/2NQXOQa6xst2/0U45dD3tFdfn4HH7+28idxF02IDvqwQesj8Y+E6L4MHj0fAXK7PC/vp/f7/sgg7zXz2gBe6avEtAQAzsfTyiGie7i9bJ1Uk0Z/PfOelrrn4unQNFDM/mLPTG1DZB9TdyrSgCrxq3mat8zN48HkEzMWODa1RiYwBK9u4fh9R2WwUM58HoSuwzYtZHD9pWvIQIrsVpmrLFaYQ2W1asjqo4CHAETAXHRwcKBv9j+JE7gUg4lywKqXPOjnACAkJCQkJCQkJ8Yi/AfA6e2lfA0oPAAAAAElFTkSuQmCC"
        );

        // Add a new type of sub shape ("Line", short code "L")
        this.modLoader.modInterface.registerSubShapeType({
            id: "line",
            shortCode: "L",
            weightComputation: distanceToOriginInChunks =>
                Math.round(20 + Math.max(Math.min(distanceToOriginInChunks, 30), 0)),

            shapeDrawer: ({ context, quadrantSize, layerScale }) => {
                const quadrantHalfSize = quadrantSize / 2;
                context.beginPath();
                context.moveTo(-quadrantHalfSize, quadrantHalfSize);
                context.arc(
                    -quadrantHalfSize,
                    quadrantHalfSize,
                    quadrantSize * layerScale,
                    -Math.PI * 0.25,
                    0
                );
                context.closePath();
            },
        });

        // Modify the theme colors
        this.modLoader.signals.preprocessTheme.add(({ theme }) => {
            theme.map.background = "#eee";
            theme.items.outline = "#000";
        });

        // Modify the goal of the first level
        this.modLoader.signals.modifyLevelDefinitions.add(definitions => {
            definitions[0].shape = "LuCuLuCu";
        });

        this.modLoader.modInterface.registerTranslations("en", {
            ingame: {
                interactiveTutorial: {
                    title: "Hello",
                    hints: {
                        "1_1_extractor": "World!",
                    },
                },
            },
        });
    }
}
