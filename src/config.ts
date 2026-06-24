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
    labelWidth: number;
  };

  elevator: {
    width: number;
    height: number;
    color: string;
    capacity: ElevatorCapacity;
  };

  person: {
    width: number;
    height: number;
    gap: number;
    strokeWidth: number;
    upColor: string;
    downColor: string;
    fillColor: string;
    textColor: string;
    fontSize: number;
  };

  animation: {
    passengerWalkDurationMs: number;
    elevatorMoveDurationMsPerFloor: number;
    elevatorStopDurationMs: number;
  };

  spawn: {
    minIntervalMs: number;
    maxIntervalMs: number;
  };
};

export type PersonConfig = AppConfig["person"];

export const config: AppConfig = {
  backgroundColor: "#ffffff",

  building: {
    floorCount: 5,
    floorHeight: 90,
    leftX: 20,
    corridorLeftX: 100,
    rightPadding: 40,
    labelWidth: 100,
  },

  elevator: {
    width: 60,
    height: 70,
    color: "#00a6e8",
    capacity: 3,
  },

  person: {
    width: 22,
    height: 34,
    gap: 8,
    strokeWidth: 3,
    upColor: "#3b45d9",
    downColor: "#16b85f",
    fillColor: "#ffffff",
    textColor: "#111111",
    fontSize: 18,
  },

  animation: {
    passengerWalkDurationMs: 1200,
    elevatorMoveDurationMsPerFloor: 1000,
    elevatorStopDurationMs: 800,
  },

  spawn: {
    minIntervalMs: 4000,
    maxIntervalMs: 10000,
  },
};
