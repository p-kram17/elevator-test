export type Direction = "up" | "down";

export type PersonStatus =
  | "walkingToElevator"
  | "waiting"
  | "inElevator"
  | "walkingAway"
  | "done";

export type Person = {
  id: number;
  fromFloor: number;
  targetFloor: number;
  direction: Direction;
  status: PersonStatus;
};

export type ElevatorDirection = Direction | "idle";
