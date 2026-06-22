type BuildingLayoutOptions = {
  screenWidth: number;
  screenHeight: number;
  floorHeight: number;
  buildingLeftX: number;
  corridorLeftX: number;
  buildingRightX: number;
  buildingBottomY: number;
  floorLabelWidth: number;
  personWidth: number;
  personHeight: number;
  personGap: number;
  elevatorHeight?: number;
};

export class BuildingLayout {
  constructor(private readonly options: BuildingLayoutOptions) {}

  public getFloorCenterY(floor: number): number {
    const { buildingBottomY, floorHeight } = this.options;
    const fullFloorsBelow = floor - 1;

    return buildingBottomY - fullFloorsBelow * floorHeight - floorHeight / 2;
  }

  public getElevatorX(): number {
    const { buildingLeftX, corridorLeftX } = this.options;

    return buildingLeftX + (corridorLeftX - buildingLeftX) / 2;
  }

  public getPersonY(floor: number): number {
    const { personHeight } = this.options;
    const centerY = this.getFloorCenterY(floor);

    return centerY - personHeight / 2;
  }

  public getPersonWaitingX(index: number): number {
    const { corridorLeftX, personGap, personWidth } = this.options;

    return corridorLeftX + personGap + index * (personWidth + personGap);
  }

  public getPersonSpawnX(): number {
    const { buildingRightX, floorLabelWidth, personGap, personWidth } =
      this.options;

    return buildingRightX - floorLabelWidth - personGap - personWidth;
  }
}
