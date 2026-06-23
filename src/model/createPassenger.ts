import type { Person } from "./types";

let nextPassengerId = 1;

export function createPassenger(
  fromFloor: number,
  targetFloor: number,
): Person {
  if (fromFloor === targetFloor) {
    throw new Error(
      "Passenger target floor must be different from start floor",
    );
  }

  const direction = targetFloor > fromFloor ? "up" : "down";

  const passenger: Person = {
    id: nextPassengerId,
    fromFloor,
    targetFloor,
    direction,
    status: "walkingToElevator",
  };

  nextPassengerId++;

  return passenger;
}
