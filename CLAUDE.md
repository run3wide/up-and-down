# Up and Down

Browser game for kids (React + TypeScript + Vite, tests with Vitest). The build brief is in `prompt.md`; global working agreements are in `~/.claude/CLAUDE.md`.

## Commands

- `pnpm dev` — dev server on :5173
- `pnpm test` — Vitest (jsdom); `pnpm lint` — oxlint; `pnpm build` — `tsc -b` + Vite build
- Node is pinned via Volta; use pnpm. Run test, lint and build before declaring work done.

## Structure

Two games, each its own bounded context, picked from the splash screen. After a round each returns to the splash (`onExit`).

- `src/up-and-down/` — Daniel's game. `domain/` is pure and framework-free: `ball` physics, `catching` verdicts, `difficulty` ramp, and the `Game` aggregate (score, lives, pause). `application/GameSession` turns held keys into movement and clamps frame time. `ui/` is the React adapter.
- `src/robot-hoops/` — Moses's game. `domain/shot` (fixed-power projectile; `hoopAt` places each hoop where a real shot lands so it's always scoreable), `domain/hoopsGame` (`HoopsGame` aggregate: aim, shoot, 8 shots per round), `application/HoopsSession`, `ui/` (SVG court drawn in world units).
- `src/shared/` — best-score port + adapters (`LocalStorageBestScoreStore(key)`, in-memory), `useAnimationFrame`, shared overlays/HUD/touch-control CSS.
- `src/splash/` — game picker, Up and Down logo. `src/art/` — shared inline-SVG art.
- `src/App.tsx` switches between splash and games; `src/main.tsx` is the composition root (`Math.random`, one localStorage key per game).
- Domain code is deterministic: randomness is injected, no clock or DOM.

## Conventions

- TDD; test the domain without React. UI tests drive the loop with Vitest fake timers (fake `requestAnimationFrame`) and use `fireEvent` — `userEvent` hangs under fake timers.
- tsconfig has `erasableSyntaxOnly`: no constructor parameter properties or enums.
- Players are young children: keep effects soft, no scary failure states, respect `prefers-reduced-motion`.
- No network calls, analytics or data collection.
