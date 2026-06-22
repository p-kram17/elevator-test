type BuildingLayoutOptions = {
  screenWidth: number;
  screenHeight: number;
  floorHeight: number;
  buildingLeftX: number;
  corridorLeftX: number;
  buildingRightX: number;
  buildingBottomY: number;
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
}
