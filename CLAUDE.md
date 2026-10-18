# Up and Down

Browser game for kids (React + TypeScript + Vite, tests with Vitest). The build brief is in `prompt.md`; global working agreements are in `~/.claude/CLAUDE.md`.

## Commands

- `pnpm dev` — dev server on :5173
- `pnpm test` — Vitest (jsdom); `pnpm lint` — oxlint; `pnpm build` — `tsc -b` + Vite build
- Node is pinned via Volta; use pnpm. Run test, lint and build before declaring work done.

## Deploying

`pnpm ship` pushes `main` and starts the GitHub Pages workflow by hand. Pushes alone have not been triggering the workflow in this repo (cause not found), so use this until that is fixed. Site: https://run3wide.github.io/up-and-down/

## Structure

Two games, each its own bounded context, picked from the splash screen. After a round each returns to the splash (`onExit`).

- `src/up-and-down/` — Daniel's game. `domain/` is pure and framework-free: `ball` physics, `catching` verdicts, `difficulty` ramp, and the `Game` aggregate (score, lives, pause). `application/GameSession` turns held keys into movement and clamps frame time. `ui/` is the React adapter.
- `src/lemon-volcano/` — Moses's game: a strawberry throws lemons into a volcano. `domain/lemon` (fixed-power projectile; `craterAt` places each crater where a real throw lands so it's always scoreable), `domain/volcanoGame` (`VolcanoGame` aggregate: aim, toss, 8 lemons per round), `application/VolcanoSession`, `application/SoundPlayer` (port; `infrastructure/` has the Web Audio adapter that synthesises the eruption, `eruptionSound.ts` is renderable offline), `ui/` (SVG court drawn in world units). CSS classes are prefixed `lemon-volcano` because all CSS is global (the splash scene already owns `.volcano`).
- `src/shared/` — best-score port + adapters (`LocalStorageBestScoreStore(key)`, in-memory), `useAnimationFrame`, shared overlays/HUD/touch-control CSS.
- `src/splash/` — game picker, Up and Down logo. `src/art/` — shared inline-SVG art.
- `src/routing/` — each game has its own address (`<base>up-and-down`, `<base>lemon-volcano`; the bare base is the picker). Pure path functions plus a `useRoute` history hook. The base is `/` in dev and `/up-and-down/` in production (`vite.config.ts`); the build copies `index.html` to `404.html` so GitHub Pages serves the app for direct links.
- `src/App.tsx` picks the screen from the route; `src/main.tsx` is the composition root (`Math.random`, one localStorage key per game).
- Domain code is deterministic: randomness is injected, no clock or DOM.

## Conventions

- TDD; test the domain without React. UI tests drive the loop with Vitest fake timers (fake `requestAnimationFrame`) and use `fireEvent` — `userEvent` hangs under fake timers.
- tsconfig has `erasableSyntaxOnly`: no constructor parameter properties or enums.
- Players are young children: keep effects soft, no scary failure states, respect `prefers-reduced-motion`.
- No network calls, analytics or data collection.
