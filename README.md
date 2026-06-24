# Elevator test

Elevator simulation written in TypeScript with PIXI.js for rendering and Tween.js for movement animations.

The app shows a building with configurable floor count, one elevator on the left side, and passengers spawning from the right side of each floor. Passengers walk to the elevator, ride only in their needed direction, leave on the target floor, and hide on the right side of the building.

## Run

```bash
npm install
npm run dev
```

Vite will print the local URL in the terminal.

Build check:

```bash
npm run build
```

## Scripts

- `npm run dev` - start local dev server
- `npm start` - same as dev
- `npm run build` - run lint, TypeScript check, and production build
- `npm run lint` - run ESLint

## Config

All main settings live in `src/config.ts`.

```ts
building: {
  floorCount: 5, // 4..10
}

elevator: {
  capacity: 4, // 2..4
}

animation: {
  passengerWalkDurationMs: 2500,
  elevatorMoveDurationMsPerFloor: 1000, // 1 floor per second
  elevatorStopDurationMs: 800,
}

spawn: {
  minIntervalMs: 4000,
  maxIntervalMs: 10000,
}
```

Important limits are typed:

- `floorCount` can be `4..10`
- `capacity` can be `2..4`

## Elevator behavior

- Elevator moves at `1 floor / second`.
- Elevator waits `800ms` on each stop.
- A full elevator ignores waiting passengers and only goes to passenger target floors.
- While moving up, it boards only passengers who need to go up.
- While moving down, it boards only passengers who need to go down.
- It skips floors where nobody needs to board or leave.
- The small arrow inside the elevator shows the current movement direction.

## Passenger behavior

- One passenger is spawned on each floor every random `4-10s`.
- Blue passengers go up.
- Green passengers go down.
- The number inside a passenger is the target floor.
- Passengers enter from the right side of the building and hide on the right side after arriving.
