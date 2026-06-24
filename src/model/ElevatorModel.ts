import type { ElevatorDirection, Person } from "./types";

type ElevatorModelOptions = {
  startFloor: number;
  capacity: number;
};

export class ElevatorModel {
  private currentFloor: number;
  private readonly capacity: number;
  private direction: ElevatorDirection = "idle";
  private passengers: Person[] = [];

  constructor(options: ElevatorModelOptions) {
    this.currentFloor = options.startFloor;
    this.capacity = options.capacity;
  }

  getCurrentFloor(): number {
    return this.currentFloor;
  }

  getCapacity(): number {
    return this.capacity;
  }

  getDirection(): ElevatorDirection {
    return this.direction;
  }

  getPassengers(): Person[] {
    return [...this.passengers];
  }

  hasSpace(): boolean {
    return this.passengers.length < this.capacity;
  }

  board(person: Person): boolean {
    if (!this.hasSpace()) {
      return false;
    }

    if (this.direction === "idle") {
      this.direction = person.direction;
    }

    person.status = "inElevator";
    this.passengers.push(person);

    return true;
  }

  dropOffCurrentFloor(): Person[] {
    const leavingPassengers = this.passengers.filter(
      (person) => person.targetFloor === this.currentFloor,
    );

    this.passengers = this.passengers.filter(
      (person) => person.targetFloor !== this.currentFloor,
    );

    leavingPassengers.forEach((person) => {
      person.status = "walkingAway";
    });

    return leavingPassengers;
  }

  moveToFloor(floor: number): void {
    if (floor === this.currentFloor) {
      return;
    }

    this.direction = floor > this.currentFloor ? "up" : "down";
    this.currentFloor = floor;
  }

  setDirectionToward(floor: number): void {
    if (floor === this.currentFloor) {
      return;
    }

    this.direction = floor > this.currentFloor ? "up" : "down";
  }

  stop(): void {
    this.direction = "idle";
  }
}
