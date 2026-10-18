# Up and Down

Browser game for kids (React + TypeScript + Vite, tests with Vitest). The build brief is in `prompt.md`; global working agreements are in `~/.claude/CLAUDE.md`.

## Commands

- `pnpm dev` — dev server on :5173
- `pnpm test` — Vitest (jsdom); `pnpm lint` — oxlint; `pnpm build` — `tsc -b` + Vite build
- Node is pinned via Volta; use pnpm. Run test, lint and build before declaring work done.

## Worktrees

Work in a git worktree, one per session or task, not in the main checkout. Several sessions share this repo, and working in the same tree has mixed one session's half-finished files into another's commits and broken everyone's test runs. Make the worktree with `git worktree add ../up-and-down-<task> -b <task>`, run `pnpm install` in it, commit there, then merge to `main` and ship from the main checkout. Remove it when merged (`git worktree remove`). Never commit with `git add -A` in a tree another session might be using: add your own paths.

## Deploying

`pnpm ship` pushes `main` and starts the GitHub Pages workflow by hand. Pushes alone have not been triggering the workflow in this repo (cause not found), so use this until that is fixed. Site: https://run3wide.github.io/up-and-down/

## Structure

Two games, each its own bounded context, picked from the splash screen. After a round each returns to the splash (`onExit`).

- `src/up-and-down/` — Daniel's game. `domain/` is pure and framework-free: `ball` physics, `catching` verdicts, `difficulty` ramp, and the `Game` aggregate (score, lives, pause). `application/GameSession` turns held keys into movement and clamps frame time. `ui/` is the React adapter.
- `src/lemon-volcano/` — Moses's game: a strawberry throws lemons into a volcano. `domain/lemon` (fixed-power projectile; `craterAt` places each crater where a real throw lands so it's always scoreable), `domain/volcanoGame` (`VolcanoGame` aggregate: aim, toss, 8 lemons per round), `application/VolcanoSession`, `application/SoundPlayer` (port; `infrastructure/` has the Web Audio adapter that synthesises the eruption, `eruptionSound.ts` is renderable offline), `ui/` (SVG court drawn in world units). CSS classes are prefixed `lemon-volcano` because all CSS is global (the splash scene already owns `.volcano`).
- `src/dino-race/` — Daniel's racing game: steer a car down a road to the finish line, dodging cones and rocks and collecting chocolate chip cookies. `domain/course` builds the whole race up front from the injected random source (always leaves a gap to drive through); `domain/mathQuestions` + `domain/quiz` (the "brain break": every 4-6s of racing the race stops for a like-things maths question; answers always keep their unit, e.g. 3x vs 3 vs 3y; pictures first, then letters, then mixed sums; `Quiz` is a port injected into `RaceGame`, and the course has regular obstacle-free breathers so a question can always find a clear road), `domain/raceGame` (`RaceGame` takes the course and an optional quiz, so tests hand-build courses; countdown, speed ramp, crashes, invulnerability, finish), `application/RaceSession`, `ui/` (HTML sprites on a square stage; the road and centre line scroll via a CSS variable and `cqh` units).
- `src/little-chef/` — Vanessa's game: an order comes in (pizza, burger, salad, fruit salad, sundae, smoothie) and you tap the ingredients that belong on that dish from a shelf that also holds ones that don't. Turn-based, so no `application/` layer or animation loop. `domain/recipes` (each `Recipe` has a `flavour`, savoury or sweet; the wrong ingredients on the shelf come from the other flavour so they are never arguable), `domain/kitchenGame` (`KitchenGame` aggregate: shelf, picks, 3 lives, dishes cooked; the shelf fills up as dishes are cooked), `ui/` (HTML buttons and a plate).
- `src/match-up/` — Daniel's memory game: flip face-down cards and keep the two that are the same *kind* (two fruits, two animals, two numbers…). `domain/kinds` (each `Kind` has a spoken `plural`, e.g. "Both are fruits!"; every item name is unique), `domain/matchGame` (`MatchGame` aggregate: deal, flip, 5 hearts, a miss costs one and a cleared board gives one back, boards are always full rows of four: 4x2, then 4x3, then a 4x4 square, which is easier for kids than a ragged shape). No timers: a missed pair stays showing until the next flip, and a cleared board waits for `nextBoard()`. Score is boards cleared. `ui/` (HTML buttons on a grid).
- `src/cookie-maze/` — Pac-Man-style maze (original art and rules, no baddies): a T-Rex eats every cookie in each maze before its clock runs out. One press = one step (a young player couldn't react to a dino that keeps walking). Running out of time costs one of 3 tries per maze, with a light "better luck next time"; after the last the player returns to the splash. `domain/maze` (`Maze.fromRows` drawing: `#` wall, `S` start, `*` super star, anything else a cookie; rejects unreachable cookies and stars), `domain/levels` (`MAZE_LEVELS`: each maze with its own time limit), `domain/mazeGame` (`MazeGame` aggregate for one maze: step, clock, lives, `tryAgain`; a super star eats the cookies within `BLAST_RADIUS` and gives `STAR_BONUS_SECONDS` back, score = cookies x 10 + seconds left; the clock starts at the first successful step), `domain/mazeRun` (`MazeRun`: the mazes in order, lives refill per maze, score adds up), `application/MazeSession`, `ui/` (SVG walls, cookies and stars in cell units, HTML dino and firework bursts positioned in percentages; bursts are CSS-only and calm under `prefers-reduced-motion`). The splash card is credited to Daniel.
- `src/shared/` — best-score port + adapters (`LocalStorageBestScoreStore(key)`, in-memory), `useAnimationFrame`, shared overlays/HUD/touch-control CSS. `sound/` holds the `SoundPlayer` port (`play('eruption' | 'roar' | 'victoryRoar')`) and its Web Audio adapter (the eruption is synthesised; the roars are small CC0 clips bundled as data URLs, credited in `CREDITS.md`); the games with a T-Rex (Up and Down, Dino Race, Cookie Maze) roar on a catch and the race start, and do the victory roar at the race finish and a won maze, each with a `SoundToggle` mute button.
- `src/splash/` — game picker, Up and Down logo. `src/art/` — shared inline-SVG art.
- `src/routing/` — each game has its own address (`<base>up-and-down`, `<base>lemon-volcano`; the bare base is the picker). Pure path functions plus a `useRoute` history hook. The base is `/` in dev and `/up-and-down/` in production (`vite.config.ts`); the build copies `index.html` to `404.html` so GitHub Pages serves the app for direct links.
- `src/App.tsx` picks the screen from the route; `src/main.tsx` is the composition root (`Math.random`, one localStorage key per game).
- Domain code is deterministic: randomness is injected, no clock or DOM.

## Conventions

- TDD; test the domain without React. UI tests drive the loop with Vitest fake timers (fake `requestAnimationFrame`) and use `fireEvent` — `userEvent` hangs under fake timers.
- tsconfig has `erasableSyntaxOnly`: no constructor parameter properties or enums.
- Domain-driven names: code uses the game's own words (lemon, crater, brain break), not generic ones.

## Safe for kids

The players are young children, and some of the builders are too (the games are credited to the kids who designed them).

- Soft by default: gentle sounds and effects, no scary failure states, no flashing or strobing, respect `prefers-reduced-motion`. Losing is "try again", never punishment.
- Keep sound moderate and never start it before a tap or key press (browsers require this anyway).
- No ads, links out, chat, user-generated text, accounts, in-app purchases or anything that leads a child off the page.
- Content stays kind and age-appropriate: no violence, no real-world brands, no scary imagery.
- Touch and keyboard must both work; targets are big, and text is short and readable.
- Maths and other learning content stays encouraging: wrong answers get another go, not a penalty.

## Public repo: keep private info out

The repo and the deployed site are public (GitHub Pages), and so is the full git history. Anything committed is visible forever.

- No network calls, analytics, tracking, cookies or third-party scripts, fonts or CDNs. Everything is bundled. The only storage is `localStorage` for best scores, on the device.
- Never commit secrets, tokens, `.env` files, personal emails, phone numbers, addresses, school names, photos of the kids, or real voices/recordings.
- Credit kids by **first name only** in anything new (UI, README, tests, docs, commit messages, code comments). No surnames, ages or birthdays, and no locations or schedules.
- Commit with a no-reply identity, not a personal address or machine hostname (`git config user.email <id>+<user>@users.noreply.github.com`).
- Keep `prompt.md`, notes and test fixtures free of anything you would not put on the site itself.
- Before pushing, scan the diff for names, emails and paths: `git diff --cached | grep -inE "@|/Users/|token|secret|key"`.
- Don't paste real user data, screenshots with personal details, or absolute local paths into the repo.

### Known cleanup

Surnames are gone from the UI, README and `prompt.md`, but old commits still contain them, plus the author name and a hostname-based email. The history is deliberately left alone (rewriting a published repo is destructive and other worktrees and sessions depend on it). Set a no-reply email for new commits and don't reintroduce surnames.
