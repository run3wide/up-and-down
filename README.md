# Up and Down (and Robot Hoops)

Two gentle browser games for kids, picked from a splash screen. No backend, no accounts, no network calls; best scores stay on the device.

- **Up and Down** (by Daniel Robson): a ball is thrown up and falls back down; move the dinosaur to catch it. Three lives, difficulty ramps with the score.
- **Robot Hoops** (by Moses Robson): aim the robot left and right, press Space to shoot. Fixed power, eight shots a round.

## Run it

Requires Node (pinned with [Volta](https://volta.sh) in `package.json`) and [pnpm](https://pnpm.io).

```sh
pnpm install
pnpm dev        # http://localhost:5173
```

## Test, lint, build

```sh
pnpm test       # Vitest, one run
pnpm test:watch
pnpm lint       # oxlint
pnpm build      # type-check + production build into dist/
```

## Controls

- Up and Down: move with ← → or A / D, drag on the playfield, or the on-screen buttons on touch devices. Pause with Esc, Space or P.
- Robot Hoops: aim with ← → or A / D, shoot with Space. Pause with Esc or P. On touch devices use the Aim and Shoot buttons.
