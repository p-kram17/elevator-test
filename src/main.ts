import { Application } from "pixi.js";
import { config } from "./config";
import { SimulationController } from "./controller/SimulationController";
import { BuildingLayout } from "./layout/BuildingLayout";
import { BuildingModel } from "./model/BuildingModel";
import { createBuilding } from "./view/createBuilding";
import { createElevator } from "./view/createElevator";

(async () => {
  const app = new Application();

  await app.init({ background: config.backgroundColor, resizeTo: window });

  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const elevator = createElevator(config.elevator);
  const buildingRightX = app.screen.width - config.building.rightPadding;
  const buildingHeight =
    config.building.floorCount * config.building.floorHeight;
  const buildingTopY = (app.screen.height - buildingHeight) / 2;
  const buildingBottomY = buildingTopY + buildingHeight;

  const layout = new BuildingLayout({
    screenWidth: app.screen.width,
    screenHeight: app.screen.height,
    floorHeight: config.building.floorHeight,
    buildingLeftX: config.building.leftX,
    corridorLeftX: config.building.corridorLeftX,
    buildingRightX,
    buildingBottomY,
    floorLabelWidth: config.building.labelWidth,
    personWidth: config.person.width,
    personHeight: config.person.height,
    personGap: config.person.gap,
  });

  const building = createBuilding({
    floorCount: config.building.floorCount,
    floorHeight: config.building.floorHeight,
    buildingLeftX: config.building.leftX,
    corridorLeftX: config.building.corridorLeftX,
    buildingRightX,
    bottomY: buildingBottomY,
  });

  const buildingModel = new BuildingModel({
    floorCount: config.building.floorCount,
    elevatorCapacity: config.elevator.capacity,
    startFloor: 1,
  });

  const simulation = new SimulationController({
    building: buildingModel,
    layout,
    stage: app.stage,
    personConfig: config.person,
  });

  elevator.x = layout.getElevatorX();
  elevator.y = layout.getFloorCenterY(
    buildingModel.getElevator().getCurrentFloor(),
  );

  app.stage.addChild(building, elevator);

  simulation.spawnPassenger(3, 1);
  simulation.spawnPassenger(3, 5);
  simulation.spawnPassenger(4, 5);
})();
