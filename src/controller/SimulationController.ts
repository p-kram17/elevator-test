import { Easing, Group, Tween } from "@tweenjs/tween.js";
import { Container } from "pixi.js";
import type { PersonConfig } from "../config";
import { BuildingLayout } from "../layout/BuildingLayout";
import { BuildingModel } from "../model/BuildingModel";
import { createPassenger } from "../model/createPassenger";
import type { Person } from "../model/types";
import { createPerson } from "../view/createPerson";

type PassengerQueueState =
  | "walkingToQueue"
  | "waiting"
  | "inElevator"
  | "leaving";

type PassengerViewState = {
  person: Person;
  view: Container;
  queueState: PassengerQueueState;
};

type SimulationControllerOptions = {
  building: BuildingModel;
  layout: BuildingLayout;
  stage: Container;
  elevatorView: Container;
  personConfig: PersonConfig;
  passengerWalkDurationMs: number;
  elevatorMoveDurationMsPerFloor: number;
  elevatorStopDurationMs: number;
};

export class SimulationController {
  private readonly building: BuildingModel;
  private readonly layout: BuildingLayout;
  private readonly stage: Container;
  private readonly elevatorView: Container;
  private readonly personConfig: PersonConfig;
  private readonly passengerWalkDurationMs: number;
  private readonly elevatorMoveDurationMsPerFloor: number;
  private readonly elevatorStopDurationMs: number;
  private readonly tweenGroup = new Group();
  private readonly passengerViewStates = new Map<number, PassengerViewState>();
  private readonly queueOrderByFloor = new Map<number, number[]>();
  private isElevatorLoopActive = false;

  constructor(options: SimulationControllerOptions) {
    this.building = options.building;
    this.layout = options.layout;
    this.stage = options.stage;
    this.elevatorView = options.elevatorView;
    this.personConfig = options.personConfig;
    this.passengerWalkDurationMs = options.passengerWalkDurationMs;
    this.elevatorMoveDurationMsPerFloor =
      options.elevatorMoveDurationMsPerFloor;
    this.elevatorStopDurationMs = options.elevatorStopDurationMs;
  }

  spawnPassenger(fromFloor: number, targetFloor: number): void {
    const person = createPassenger(fromFloor, targetFloor);
    const personView = createPerson({
      direction: person.direction,
      targetFloor: person.targetFloor,
      ...this.personConfig,
    });
    this.reserveQueueSlot(person);

    const targetIndex = this.getQueueOrder(person.fromFloor).indexOf(person.id);
    const spawnOffset =
      targetIndex * (this.personConfig.width + this.personConfig.gap);

    personView.x = this.layout.getPersonSpawnX() - spawnOffset;
    personView.y = this.layout.getPersonY(person.fromFloor);

    this.stage.addChild(personView);
    this.passengerViewStates.set(person.id, {
      person,
      view: personView,
      queueState: "walkingToQueue",
    });
    this.animatePassengerToQueue(person.id);
  }

  updateTweens(): void {
    this.tweenGroup.update();
  }

  private reserveQueueSlot(person: Person): void {
    const floorOrder = this.getQueueOrder(person.fromFloor);

    floorOrder.push(person.id);
  }

  private animatePassengerToQueue(personId: number): void {
    const passengerState = this.passengerViewStates.get(personId);

    if (!passengerState) {
      return;
    }

    const { person, view } = passengerState;
    const targetIndex = this.getQueueOrder(person.fromFloor).indexOf(person.id);

    new Tween(view, this.tweenGroup)
      .to(
        {
          x: this.layout.getPersonWaitingX(targetIndex),
          y: this.layout.getPersonY(person.fromFloor),
        },
        this.passengerWalkDurationMs,
      )
      .easing(Easing.Quadratic.Out)
      .onComplete(() => {
        passengerState.queueState = "waiting";
        this.building.addPassenger(person);
        this.runElevatorLoop();
      })
      .start();
  }

  private runElevatorLoop(): void {
    if (this.isElevatorLoopActive) {
      return;
    }

    this.isElevatorLoopActive = true;
    this.moveElevatorToNextStop();
  }

  private moveElevatorToNextStop(): void {
    const nextStop = this.building.getNextElevatorStop();

    if (nextStop === null) {
      this.isElevatorLoopActive = false;
      return;
    }

    const currentFloor = this.building.getElevator().getCurrentFloor();
    const floorDistance = Math.abs(nextStop - currentFloor);
    const moveDuration = floorDistance * this.elevatorMoveDurationMsPerFloor;

    if (moveDuration === 0) {
      this.handleElevatorStop(nextStop);
      return;
    }

    new Tween(this.elevatorView, this.tweenGroup)
      .to(
        {
          y: this.layout.getFloorCenterY(nextStop),
        },
        moveDuration,
      )
      .easing(Easing.Quadratic.InOut)
      .onComplete(() => {
        this.handleElevatorStop(nextStop);
      })
      .start();
  }

  private handleElevatorStop(floor: number): void {
    this.building.handleElevatorArrival(floor);

    window.setTimeout(() => {
      this.moveElevatorToNextStop();
    }, this.elevatorStopDurationMs);
  }

  private getQueueOrder(floor: number): number[] {
    const existingOrder = this.queueOrderByFloor.get(floor);

    if (existingOrder) {
      return existingOrder;
    }

    const order: number[] = [];

    this.queueOrderByFloor.set(floor, order);

    return order;
  }
}
