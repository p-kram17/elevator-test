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
  elevatorWidth: number;
  elevatorHeight: number;
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
  private readonly elevatorWidth: number;
  private readonly elevatorHeight: number;
  private readonly personConfig: PersonConfig;
  private readonly passengerWalkDurationMs: number;
  private readonly elevatorMoveDurationMsPerFloor: number;
  private readonly elevatorStopDurationMs: number;
  private readonly tweenGroup = new Group();
  private readonly passengerViewStates = new Map<number, PassengerViewState>();
  private readonly passengerTweens = new Map<number, Tween<Container>>();
  private readonly queueOrderByFloor = new Map<number, number[]>();
  private isElevatorLoopActive = false;

  constructor(options: SimulationControllerOptions) {
    this.building = options.building;
    this.layout = options.layout;
    this.stage = options.stage;
    this.elevatorView = options.elevatorView;
    this.elevatorWidth = options.elevatorWidth;
    this.elevatorHeight = options.elevatorHeight;
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

    const tween = new Tween(view, this.tweenGroup)
      .to(
        {
          x: this.layout.getPersonWaitingX(targetIndex),
          y: this.layout.getPersonY(person.fromFloor),
        },
        this.passengerWalkDurationMs,
      )
      .easing(Easing.Quadratic.Out)
      .onComplete(() => {
        this.passengerTweens.delete(person.id);
        passengerState.queueState = "waiting";
        this.building.addPassenger(person);
        this.reflowFloorQueue(person.fromFloor);
        this.runElevatorLoop();
      })
      .start();

    this.passengerTweens.set(person.id, tween);
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

    this.building.getElevator().setDirectionToward(nextStop);

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
    const { droppedOff, boarded } = this.building.handleElevatorArrival(floor);

    this.dropOffPassengers(floor, droppedOff);
    this.boardPassengers(floor, boarded);
    this.reflowElevatorPassengers();

    window.setTimeout(() => {
      this.moveElevatorToNextStop();
    }, this.elevatorStopDurationMs);
  }

  private dropOffPassengers(
    floor: number,
    droppedOffPassengers: Person[],
  ): void {
    for (const person of droppedOffPassengers) {
      const passengerState = this.passengerViewStates.get(person.id);

      if (!passengerState) {
        continue;
      }

      this.stopPassengerTween(person.id);

      const worldPosition = passengerState.view.getGlobalPosition();

      passengerState.queueState = "leaving";
      this.stage.addChild(passengerState.view);
      passengerState.view.x = worldPosition.x;
      passengerState.view.y = worldPosition.y;

      const tween = new Tween(passengerState.view, this.tweenGroup)
        .to(
          {
            x: this.layout.getPersonSpawnX(),
            y: this.layout.getPersonY(floor),
          },
          this.passengerWalkDurationMs,
        )
        .easing(Easing.Quadratic.Out)
        .onComplete(() => {
          this.passengerTweens.delete(person.id);
          this.stage.removeChild(passengerState.view);
          this.passengerViewStates.delete(person.id);
        })
        .start();

      this.passengerTweens.set(person.id, tween);
    }
  }

  private boardPassengers(floor: number, boardedPassengers: Person[]): void {
    if (boardedPassengers.length === 0) {
      return;
    }

    for (const person of boardedPassengers) {
      const passengerState = this.passengerViewStates.get(person.id);

      if (!passengerState) {
        continue;
      }

      passengerState.queueState = "inElevator";
      this.removePassengerFromQueueOrder(floor, person.id);
      this.stopPassengerTween(person.id);
      this.elevatorView.addChild(passengerState.view);
    }

    this.reflowFloorQueue(floor);
  }

  private reflowElevatorPassengers(): void {
    const passengers = this.building.getElevator().getPassengers();
    const slotWidth = this.personConfig.width + this.personConfig.gap;
    const totalWidth =
      passengers.length * this.personConfig.width +
      Math.max(passengers.length - 1, 0) * this.personConfig.gap;

    passengers.forEach((person, index) => {
      const passengerState = this.passengerViewStates.get(person.id);

      if (!passengerState) {
        return;
      }

      this.stopPassengerTween(person.id);
      passengerState.view.x =
        (this.elevatorWidth - totalWidth) / 2 + index * slotWidth;
      passengerState.view.y =
        this.elevatorHeight - this.personConfig.height - this.personConfig.gap;
    });
  }

  private removePassengerFromQueueOrder(floor: number, personId: number): void {
    const floorOrder = this.getQueueOrder(floor);
    const passengerIndex = floorOrder.indexOf(personId);

    if (passengerIndex !== -1) {
      floorOrder.splice(passengerIndex, 1);
    }
  }

  private reflowFloorQueue(floor: number): void {
    const floorOrder = this.getQueueOrder(floor);

    floorOrder.forEach((personId, index) => {
      const passengerState = this.passengerViewStates.get(personId);

      if (!passengerState || passengerState.queueState !== "waiting") {
        return;
      }

      this.stopPassengerTween(personId);
      const tween = new Tween(passengerState.view, this.tweenGroup)
        .to(
          {
            x: this.layout.getPersonWaitingX(index),
            y: this.layout.getPersonY(floor),
          },
          this.passengerWalkDurationMs / 2,
        )
        .easing(Easing.Quadratic.Out)
        .onComplete(() => {
          this.passengerTweens.delete(personId);
        })
        .start();

      this.passengerTweens.set(personId, tween);
    });
  }

  private stopPassengerTween(personId: number): void {
    const tween = this.passengerTweens.get(personId);

    if (!tween) {
      return;
    }

    tween.stop();
    this.passengerTweens.delete(personId);
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
