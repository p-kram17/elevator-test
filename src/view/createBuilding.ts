import { Container, Graphics } from "pixi.js";

type CreateBuildingOptions = {
  floorCount: number;
  floorHeight: number;
  buildingLeftX: number;
  corridorLeftX: number;
  buildingRightX: number;
  bottomY: number;
};

export function createBuilding(options: CreateBuildingOptions): Container {
  const {
    floorCount,
    floorHeight,
    buildingLeftX,
    corridorLeftX,
    buildingRightX,
    bottomY,
  } = options;

  const building = new Container();
  const lines = new Graphics();
  const topY = bottomY - floorCount * floorHeight;

  lines.rect(
    buildingLeftX,
    topY,
    buildingRightX - buildingLeftX,
    bottomY - topY,
  );

  for (let floor = 0; floor <= floorCount; floor++) {
    const y = bottomY - floor * floorHeight;

    lines.moveTo(corridorLeftX, y);
    lines.lineTo(buildingRightX, y);
  }

  lines.stroke({ width: 2, color: "#111111" });
  building.addChild(lines);

  return building;
}
