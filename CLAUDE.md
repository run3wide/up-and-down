# Up and Down

Browser game for kids (React + TypeScript + Vite, tests with Vitest). The build brief is in `prompt.md`; global working agreements are in `~/.claude/CLAUDE.md`.

## Commands

- `pnpm dev` — dev server on :5173
- `pnpm test` — Vitest (jsdom); `pnpm lint` — oxlint; `pnpm build` — `tsc -b` + Vite build
- Node is pinned via Volta; use pnpm. Run test, lint and build before declaring work done.

## Structure

- `src/game/domain/` — pure, framework-free rules: `ball` physics, `catching` verdicts, `difficulty` ramp, and the `Game` aggregate (score, lives, pause). Randomness is injected (`Random`); no clock or DOM in here. World is 100 units wide, y is height above the ground.
- `src/game/application/` — `GameSession` (held keys → movement, frame-time clamp) and the `BestScoreStore` port.
- `src/game/infrastructure/` — `BestScoreStore` adapters (localStorage, in-memory).
- `src/game/ui/` — React adapter: `GameScreen`, HUD, overlays, rAF loop and keyboard hooks. The loop feeds time deltas into the session.
- `src/splash/` — splash screen and logo. `src/art/` — shared inline-SVG art (dino, ball, stegosaurus).
- `src/main.tsx` is the composition root (`Math.random`, localStorage store).

## Conventions

- TDD; test the domain without React. UI tests drive the loop with Vitest fake timers (fake `requestAnimationFrame`) and use `fireEvent` — `userEvent` hangs under fake timers.
- tsconfig has `erasableSyntaxOnly`: no constructor parameter properties or enums.
- Players are young children: keep effects soft, no scary failure states, respect `prefers-reduced-motion`.
- No network calls, analytics or data collection.
