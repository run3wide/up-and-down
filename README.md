# Up and Down (and Lemon Volcano)

Three gentle browser games for kids, picked from a splash screen. No backend, no accounts, no network calls; best scores stay on the device.

- **Up and Down** (by Daniel Robson): a ball is thrown up and falls back down; move the dinosaur to catch it. Three lives, difficulty ramps with the score.
- **Dino Race** (by Daniel Robson): steer the car left and right down the road to the finish line, dodge cones and rocks, grab chocolate chip cookies. Three lives. Every few seconds the race pauses for a "brain break": a little sum about adding only like things together (3🍍 + 3🍍 = 6🍍), starting with fruit pictures and moving on to letters.
- **Lemon Volcano** (by Moses Robson): aim the strawberry left and right, press Space to throw a lemon into the volcano. Fixed power, eight lemons a round.

Each game has its own address: `/up-and-down`, `/lemon-volcano` and `/dino-race` (under `/up-and-down/` on GitHub Pages).

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
- Dino Race: steer with ← → or A / D, drag on the road, or the on-screen buttons. Pause with Esc, Space or P.
- Lemon Volcano: aim with ← → or A / D, throw with Space. Pause with Esc or P. On touch devices use the Aim and Throw buttons.
