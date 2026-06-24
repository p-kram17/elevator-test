import { ElevatorModel } from "./ElevatorModel";
import { FloorQueue } from "./FloorQueue";
import type { Direction, ElevatorDirection, Person } from "./types";

type BuildingModelOptions = {
  floorCount: number;
  elevatorCapacity: number;
  startFloor: number;
};

type ElevatorArrivalResult = {
  droppedOff: Person[];
  boarded: Person[];
};

export class BuildingModel {
  private readonly floorCount: number;
  private readonly elevator: ElevatorModel;
  private readonly floorQueues: Map<number, FloorQueue>;

  constructor(options: BuildingModelOptions) {
    this.floorCount = options.floorCount;
    this.elevator = new ElevatorModel({
      startFloor: options.startFloor,
      capacity: options.elevatorCapacity,
    });
    this.floorQueues = new Map();

    for (let floor = 1; floor <= options.floorCount; floor++) {
      this.floorQueues.set(floor, new FloorQueue());
    }
  }

  getFloorCount(): number {
    return this.floorCount;
  }

  getElevator(): ElevatorModel {
    return this.elevator;
  }

  getQueue(floor: number): FloorQueue {
    this.assertFloorExists(floor);

    return this.floorQueues.get(floor)!;
  }

  addPassenger(person: Person): void {
    this.assertFloorExists(person.fromFloor);
    this.assertFloorExists(person.targetFloor);

    person.status = "waiting";
    this.getQueue(person.fromFloor).add(person);
  }

  getNextElevatorStop(): number | null {
    const currentFloor = this.elevator.getCurrentFloor();
    const direction = this.elevator.getDirection();
    const stopFloors = this.getStopFloors(direction);

    if (stopFloors.length === 0) {
      return null;
    }

    if (direction === "up") {
      return this.getClosestAbove(currentFloor, stopFloors);
    }

    if (direction === "down") {
      return this.getClosestBelow(currentFloor, stopFloors);
    }

    return this.getClosestFloor(currentFloor, stopFloors);
  }

  handleElevatorArrival(floor: number): ElevatorArrivalResult {
    this.assertFloorExists(floor);
    this.elevator.moveToFloor(floor);

    const droppedOff = this.elevator.dropOffCurrentFloor();

    if (this.elevator.getPassengers().length === 0) {
      this.elevator.stop();
    }

    const boarded = this.boardWaitingPassengers(floor);

    if (this.elevator.getPassengers().length === 0 && boarded.length === 0) {
      this.elevator.stop();
    }

    return { droppedOff, boarded };
  }

  private boardWaitingPassengers(floor: number): Person[] {
    const queue = this.getQueue(floor);
    const direction = this.getBoardingDirection(queue);

    if (direction === null) {
      return [];
    }

    const boarded: Person[] = [];
    const candidates = queue.getByDirection(direction);

    for (const person of candidates) {
      if (!this.elevator.board(person)) {
        break;
      }

      queue.remove(person.id);
      boarded.push(person);
    }

    return boarded;
  }

  private getBoardingDirection(queue: FloorQueue): Direction | null {
    const direction = this.elevator.getDirection();

    if (direction === "up" || direction === "down") {
      return queue.hasDirection(direction) ? direction : null;
    }

    const firstWaitingPerson = queue.getAll()[0];

    return firstWaitingPerson?.direction ?? null;
  }

  private getStopFloors(direction: ElevatorDirection): number[] {
    const passengerTargetFloors = this.elevator
      .getPassengers()
      .map((person) => person.targetFloor);
    const waitingFloors = this.elevator.hasSpace()
      ? this.getWaitingFloors(direction)
      : [];

    return [...new Set([...passengerTargetFloors, ...waitingFloors])];
  }

  private getWaitingFloors(direction: ElevatorDirection): number[] {
    const floors: number[] = [];

    for (let floor = 1; floor <= this.floorCount; floor++) {
      const queue = this.getQueue(floor);

      if (
        direction === "idle" ? queue.hasAny() : queue.hasDirection(direction)
      ) {
        floors.push(floor);
      }
    }

    return floors;
  }

  private getClosestAbove(
    currentFloor: number,
    floors: number[],
  ): number | null {
    const aboveFloors = floors
      .filter((floor) => floor > currentFloor)
      .sort((firstFloor, secondFloor) => firstFloor - secondFloor);

    return aboveFloors[0] ?? this.getClosestBelow(currentFloor, floors);
  }

  private getClosestBelow(
    currentFloor: number,
    floors: number[],
  ): number | null {
    const belowFloors = floors
      .filter((floor) => floor < currentFloor)
      .sort((firstFloor, secondFloor) => secondFloor - firstFloor);

    return belowFloors[0] ?? this.getClosestAbove(currentFloor, floors);
  }

  private getClosestFloor(currentFloor: number, floors: number[]): number {
    return [...floors].sort(
      (firstFloor, secondFloor) =>
        Math.abs(firstFloor - currentFloor) -
        Math.abs(secondFloor - currentFloor),
    )[0]!;
  }

  private assertFloorExists(floor: number): void {
    if (floor < 1 || floor > this.floorCount) {
      throw new Error(`Floor ${floor} does not exist`);
    }
  }
}
