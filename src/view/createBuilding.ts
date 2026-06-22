import { Container, Graphics, Text } from "pixi.js";

type CreateBuildingOptions = {
  floorCount: number;
  floorHeight: number;
  buildingLeftX: number;
  corridorLeftX: number;
  buildingRightX: number;
  bottomY: number;
};

export function createBuilding(options: CreateBuildingOptions): Container {
  const building = new Container();
  const lines = createBuildingLines(options);
  const labels = createFloorLabels(options);

  building.addChild(lines, ...labels);

  return building;
}

function createBuildingLines(options: CreateBuildingOptions): Graphics {
  const {
    floorCount,
    floorHeight,
    buildingLeftX,
    corridorLeftX,
    buildingRightX,
    bottomY,
  } = options;

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

  return lines;
}

function createFloorLabels(options: CreateBuildingOptions): Text[] {
  const { floorCount, floorHeight, buildingRightX, bottomY } = options;
  const labelRightPadding = 24;
  const labels: Text[] = [];

  for (let floor = 1; floor <= floorCount; floor++) {
    const centerY = bottomY - (floor - 1) * floorHeight - floorHeight / 2;
    const floorLabel = new Text({
      text: `level ${floor}`,
      style: {
        fill: "#3d3939",
      },
    });
    floorLabel.y = centerY - 10;
    floorLabel.x = buildingRightX - labelRightPadding - floorLabel.width;
    labels.push(floorLabel);
  }

  return labels;
}
