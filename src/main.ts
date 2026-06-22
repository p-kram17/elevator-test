import { Application } from "pixi.js";
import { createElevator } from "./view/createElevator";
import { config } from "./config";
import { BuildingLayout } from "./layout/BuildingLayout";
import { createBuilding } from "./view/createBuilding";

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

  app.stage.addChild(building);
  app.stage.addChild(elevator);

  // Listen for animate update
  // app.ticker.add((time) => {});
})();
