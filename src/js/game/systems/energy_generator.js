import { DrawParameters } from "../../core/draw_parameters";
import { formatBigNumber } from "../../core/utils";
import { T } from "../../translations";
import { EnergyGeneratorComponent } from "../components/energy_generator";
import { Entity } from "../entity";
import { GameSystemWithFilter } from "../game_system_with_filter";
import { POSITIVE_ENERGY_ITEM_SINGLETON } from "../items/positive_energy_item";
import { ShapeDefinition } from "../shape_definition";

export class EnergyGeneratorSystem extends GameSystemWithFilter {
    constructor(root) {
        super(root, [EnergyGeneratorComponent]);
    }

    draw(parameters) {
        this.forEachMatchingEntityOnScreen(parameters, this.drawEntity.bind(this));
    }

    /**
     * Returns which shape is required for a given generator
     * @param {Entity} entity
     */
    getShapeRequiredForGenerator(entity) {
        return "CuCuCuCu";
    }

    update() {
        for (let i = 0; i < this.allEntities.length; ++i) {
            const entity = this.allEntities[i];
            const energyGenComp = entity.components.EnergyGenerator;
            const ejectorComp = entity.components.ItemEjector;

            if (!energyGenComp.requiredKey) {
                // Compute required key for this generator
                energyGenComp.requiredKey = this.getShapeRequiredForGenerator(entity);
            }

            if (energyGenComp.itemsInQueue > 0) {
                // FIXME: Find slot dynamically
                if (ejectorComp.tryEject(0, POSITIVE_ENERGY_ITEM_SINGLETON)) {
                    energyGenComp.itemsInQueue -= 1;
                }
            }
        }
    }

    /**
     * @param {DrawParameters} parameters
     * @param {Entity} entity
     */
    drawEntity(parameters, entity) {
        const context = parameters.context;
        const staticComp = entity.components.StaticMapEntity;

        if (!staticComp.shouldBeDrawn(parameters)) {
            return;
        }

        const energyGenComp = entity.components.EnergyGenerator;
        if (!energyGenComp.requiredKey) {
            // Not initialized yet
            return;
        }

        const pos = staticComp.getTileSpaceBounds().getCenter().toWorldSpace();

        // TESTING
        const definition = ShapeDefinition.fromShortKey(energyGenComp.requiredKey);
        definition.draw(pos.x, pos.y, parameters, 30);

        const energyGenerated = 5;

        // deliver: Deliver
        // toGenerateEnergy: For <x> energy
        context.font = "bold 9px GameFont";
        context.fillStyle = "#64666e";
        context.textAlign = "left";
        context.fillText(T.buildings.energy_generator.deliver.toUpperCase(), pos.x - 25, pos.y - 18);
        context.fillText(T.buildings.energy_generator.toGenerateEnergy.toUpperCase(), pos.x - 25, pos.y + 27);

        context.font = "700 9px GameFont";
        context.fillStyle = "#dee1ea";
        context.fillText("" + formatBigNumber(energyGenerated), pos.x + 1, pos.y + 27);
    }
}
