type ElevatorPassengerLayoutOptions = {
  elevatorWidth: number;
  elevatorHeight: number;
  personWidth: number;
  personHeight: number;
  gap: number;
  padding: number;
};

type Point = {
  x: number;
  y: number;
};

export function getElevatorPassengerPosition(
  index: number,
  passengerCount: number,
  options: ElevatorPassengerLayoutOptions,
): Point {
  const columnCount = Math.min(2, Math.max(1, passengerCount));
  const row = Math.floor(index / columnCount);
  const column = index % columnCount;
  const rowCount = Math.ceil(passengerCount / columnCount);
  const columnsInRow =
    row === rowCount - 1 ? passengerCount - row * columnCount : columnCount;
  const rowWidth =
    columnsInRow * options.personWidth +
    Math.max(columnsInRow - 1, 0) * options.gap;
  const x =
    (options.elevatorWidth - rowWidth) / 2 +
    column * (options.personWidth + options.gap);
  const bottomY =
    options.elevatorHeight - options.padding - options.personHeight;
  const topY = options.padding;
  const rowStep =
    rowCount <= 1 ? 0 : (bottomY - topY) / Math.max(rowCount - 1, 1);
  const y = bottomY - row * rowStep;

  return { x, y };
}
