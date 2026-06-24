import { Application, Container, Graphics } from "pixi.js";
import { config } from "./config";
import { SimulationController } from "./controller/SimulationController";
import { BuildingLayout } from "./layout/BuildingLayout";
import { getElevatorDirectionIndicatorPosition } from "./layout/ElevatorDirectionIndicatorLayout";
import { BuildingModel } from "./model/BuildingModel";
import { createBuilding } from "./view/createBuilding";
import { createElevator } from "./view/createElevator";

(async () => {
  const app = new Application();

  await app.init({ background: config.backgroundColor, resizeTo: window });

  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const elevator = createElevator(config.elevator);
  const elevatorDirectionIndicator = createElevatorDirectionIndicator();
  const indicatorPosition = getElevatorDirectionIndicatorPosition({
    elevatorWidth: config.elevator.width,
    indicatorWidth: 28,
    topOffset: 10,
  });

  elevatorDirectionIndicator.x = indicatorPosition.x;
  elevatorDirectionIndicator.y = indicatorPosition.y;
  elevatorDirectionIndicator.visible = false;
  elevator.addChild(elevatorDirectionIndicator);

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
  const passengerLayer = new Container();
  const rightSideCover = createRightSideCover({
    x: buildingRightX + 1,
    y: buildingTopY,
    width: app.screen.width - buildingRightX - 1,
    height: buildingHeight,
    color: config.backgroundColor,
  });

  const buildingModel = new BuildingModel({
    floorCount: config.building.floorCount,
    elevatorCapacity: config.elevator.capacity,
    startFloor: 1,
  });

  const simulation = new SimulationController({
    building: buildingModel,
    layout,
    stage: passengerLayer,
    elevatorView: elevator,
    elevatorDirectionIndicator,
    elevatorWidth: config.elevator.width,
    elevatorHeight: config.elevator.height,
    personConfig: config.person,
    passengerWalkDurationMs: config.animation.passengerWalkDurationMs,
    elevatorMoveDurationMsPerFloor:
      config.animation.elevatorMoveDurationMsPerFloor,
    elevatorStopDurationMs: config.animation.elevatorStopDurationMs,
  });

  elevator.x = layout.getElevatorX();
  elevator.y = layout.getFloorCenterY(
    buildingModel.getElevator().getCurrentFloor(),
  );

  app.stage.addChild(passengerLayer, building, elevator, rightSideCover);

  for (let floor = 1; floor <= config.building.floorCount; floor++) {
    schedulePassengerSpawn(floor, simulation);
  }

  app.ticker.add(() => {
    simulation.updateTweens();
  });
})();

function schedulePassengerSpawn(
  fromFloor: number,
  simulation: SimulationController,
): void {
  window.setTimeout(() => {
    simulation.spawnPassenger(
      fromFloor,
      getRandomTargetFloor(fromFloor, config.building.floorCount),
    );
    schedulePassengerSpawn(fromFloor, simulation);
  }, getRandomSpawnIntervalMs());
}

function getRandomSpawnIntervalMs(): number {
  return getRandomInteger(
    config.spawn.minIntervalMs,
    config.spawn.maxIntervalMs,
  );
}

function getRandomTargetFloor(fromFloor: number, floorCount: number): number {
  let targetFloor = fromFloor;

  while (targetFloor === fromFloor) {
    targetFloor = getRandomInteger(1, floorCount);
  }

  return targetFloor;
}

function getRandomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createElevatorDirectionIndicator(): Graphics {
  return new Graphics()
    .moveTo(0, -6)
    .lineTo(5, 5)
    .lineTo(-5, 5)
    .closePath()
    .fill(config.elevator.color);
}

type RightSideCoverOptions = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

function createRightSideCover(options: RightSideCoverOptions): Graphics {
  return new Graphics()
    .rect(options.x, options.y, options.width, options.height)
    .fill(options.color);
}
