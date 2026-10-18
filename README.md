# Up and Down

A gentle browser game for kids, by Daniel Robson. A ball is thrown up and falls back down; move the dinosaur left and right to catch it. Three lives, a score that ramps the difficulty, and a best score saved on the device. No backend, no accounts, no network calls.

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

- Move: ← → or A / D, drag on the playfield, or the on-screen buttons on touch devices
- Pause: Esc, Space, P, or the pause button
