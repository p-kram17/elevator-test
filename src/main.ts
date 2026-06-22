import { Application } from "pixi.js";
import { createElevator } from "./view/createElevator";
import { config } from "./config";
import { BuildingLayout } from "./layout/BuildingLayout";
import { createBuilding } from "./view/createBuilding";
import { createPerson } from "./view/createPerson";

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: config.backgroundColor, resizeTo: window });

  // Append the application canvas to the document body
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

  elevator.x = layout.getElevatorX();
  elevator.y = layout.getFloorCenterY(1);

  const createDemoPerson = (direction: "up" | "down", targetFloor: number) =>
    createPerson({
      direction,
      targetFloor,
      width: config.person.width,
      height: config.person.height,
      strokeWidth: config.person.strokeWidth,
      upColor: config.person.upColor,
      downColor: config.person.downColor,
      fillColor: config.person.fillColor,
      textColor: config.person.textColor,
      fontSize: config.person.fontSize,
    });

  const waitingPerson = createDemoPerson("down", 1);
  waitingPerson.x = layout.getPersonWaitingX(0);
  waitingPerson.y = layout.getPersonY(3);

  const nextWaitingPerson = createDemoPerson("up", 5);
  nextWaitingPerson.x = layout.getPersonWaitingX(1);
  nextWaitingPerson.y = layout.getPersonY(3);

  const hallwayPerson = createDemoPerson("up", 5);
  hallwayPerson.x = layout.getPersonSpawnX();
  hallwayPerson.y = layout.getPersonY(4);

  app.stage.addChild(building);
  app.stage.addChild(elevator);
  app.stage.addChild(waitingPerson, nextWaitingPerson, hallwayPerson);

  // Listen for animate update
  // app.ticker.add((time) => {});
})();
