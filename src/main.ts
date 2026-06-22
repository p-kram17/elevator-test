import { Application } from "pixi.js";
import { createElevator } from "./view/createElevator";
import { config } from "./config";

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: config.backgroundColor, resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const elevator = createElevator(config.elevator);

  elevator.x = app.screen.width / 2;
  elevator.y = app.screen.height / 2;

  app.stage.addChild(elevator);

  // Listen for animate update
  // app.ticker.add((time) => {});
})();
