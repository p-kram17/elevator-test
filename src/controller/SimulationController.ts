import { Container } from "pixi.js";
import type { PersonConfig } from "../config";
import { BuildingLayout } from "../layout/BuildingLayout";
import { BuildingModel } from "../model/BuildingModel";
import { createPassenger } from "../model/createPassenger";
import { createPerson } from "../view/createPerson";

type SimulationControllerOptions = {
  building: BuildingModel;
  layout: BuildingLayout;
  stage: Container;
  personConfig: PersonConfig;
};

export class SimulationController {
  private readonly building: BuildingModel;
  private readonly layout: BuildingLayout;
  private readonly stage: Container;
  private readonly personConfig: PersonConfig;
  private readonly personViews = new Map<number, Container>();

  constructor(options: SimulationControllerOptions) {
    this.building = options.building;
    this.layout = options.layout;
    this.stage = options.stage;
    this.personConfig = options.personConfig;
  }

  spawnPassenger(fromFloor: number, targetFloor: number): void {
    const person = createPassenger(fromFloor, targetFloor);

    this.building.addPassenger(person);

    const personView = createPerson({
      direction: person.direction,
      targetFloor: person.targetFloor,
      ...this.personConfig,
    });

    personView.x = this.layout.getPersonSpawnX();
    personView.y = this.layout.getPersonY(person.fromFloor);

    this.stage.addChild(personView);
    this.personViews.set(person.id, personView);
  }
}
