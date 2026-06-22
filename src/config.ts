type FloorCount = 4 | 5 | 6 | 7 | 8 | 9 | 10;
type ElevatorCapacity = 2 | 3 | 4;

type AppConfig = {
  backgroundColor: string;

  building: {
    floorCount: FloorCount;
    floorHeight: number;
    leftX: number;
    corridorLeftX: number;
    rightPadding: number;
  };

  elevator: {
    width: number;
    height: number;
    color: string;
    capacity: ElevatorCapacity;
  };
};

export const config: AppConfig = {
  backgroundColor: "#a1a1a1",

  building: {
    floorCount: 5,
    floorHeight: 90,
    leftX: 20,
    corridorLeftX: 100,
    rightPadding: 40,
  },

  elevator: {
    width: 60,
    height: 70,
    color: "#474747",
    capacity: 3,
  },
};
