type DirectionIndicatorPositionOptions = {
  elevatorWidth: number;
  indicatorWidth: number;
  topOffset: number;
};

type Point = {
  x: number;
  y: number;
};

export function getElevatorDirectionIndicatorPosition({
  elevatorWidth,
  topOffset,
}: DirectionIndicatorPositionOptions): Point {
  return {
    x: elevatorWidth / 2,
    y: -topOffset,
  };
}
