import { Graphics } from "pixi.js";

type CreateElevatorOptions = {
  width: number;
  height: number;
  color: string;
};

export function createElevator(options: CreateElevatorOptions): Graphics {
  const topSideSegmentHeight = options.height * 0.25;
  const bottomSideSegmentHeight = options.height * 0.12;

  const elevator = new Graphics()
    .moveTo(0, 0)
    .lineTo(options.width, 0)
    .lineTo(options.width, topSideSegmentHeight)
    .moveTo(0, options.height)
    .lineTo(options.width, options.height)
    .lineTo(options.width, options.height - bottomSideSegmentHeight)
    .moveTo(0, 0)
    .lineTo(0, options.height)
    .stroke({ width: 3, color: options.color });

  elevator.pivot.set(options.width / 2, options.height / 2);

  return elevator;
}
