import { Graphics } from "pixi.js";

type CreateElevatorOptions = {
  width: number;
  height: number;
  color: string;
};

export function createElevator(options: CreateElevatorOptions): Graphics {
  const elevator = new Graphics()
    .rect(0, 0, options.width, options.height)
    .fill(options.color)
    .stroke({ width: 3, color: "#111111" });

  elevator.pivot.set(options.width / 2, options.height / 2);

  return elevator;
}
