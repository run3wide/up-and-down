# Up and Down — build brief

You are building **Up and Down**, a browser game for kids, made by Daniel (for his siblings). Read this whole file, then get to work. Follow the working agreements in `~/.claude/CLAUDE.md` (TDD, hexagonal/DDD where it earns its keep, small commits, run tests and lint before declaring done).

## The game

A ball is thrown up and falls back down. A dinosaur stands at the bottom of the screen. The player moves the dinosaur left and right to catch the ball when it comes down. Catch it and score; miss it and lose a life. Keep it gentle, bright and fun — the players are young children.

## Screens

### 1. Splash screen (first thing on load)
- Big, cool, playful **logo** reading **Up and Down** (custom styled wordmark — chunky rounded letters, "Up" and "Down" visually playing on direction, e.g. Up rising / Down dropping, a ball bouncing between them).
- Second line, smaller: **by Daniel**
- Dinosaurs worked into the logo and scene (e.g. a friendly T-Rex peeking over the letters, a little stegosaurus, cartoon volcano / ferns / clouds in the background). Draw them as inline SVG so there are no asset dependencies.
- A large, obvious **Start** button (big tap target, hover/press animation). Clicking it goes to the game.
- Looks polished: gradients, soft shadows, subtle animation (floating clouds, bobbing dino, bouncing ball). Respect `prefers-reduced-motion`.

### 2. Game screen
- Dinosaur (SVG) at the bottom, moves horizontally only.
- Controls: left/right arrow keys and A/D on keyboard; touch/drag or on-screen left/right buttons on tablets and phones. Must work well on an iPad.
- Ball launches upward, slows at the top, falls back down (simple gravity). Each round the launch point/horizontal drift varies a little so it isn't predictable.
- Catch = +1 score with a happy effect (sparkle, the dino chomps/cheers). Miss = lose a life (3 lives, shown as hearts), with a soft, non-scary effect.
- Difficulty ramps gently (faster balls, more horizontal movement) as the score rises.
- Game over screen: score, best score (persisted in `localStorage`), **Play again** button.
- Pause (Esc / Space / a button).
- Sound is optional; if added, keep it small, have a mute toggle, and don't autoplay before the Start click.

## Tech

- **React + TypeScript + Vite.** Tests with **Vitest** (+ React Testing Library where UI behaviour matters).
- Keep the game rules in a **pure, framework-free domain module** (ball physics, catch detection, scoring, lives, difficulty) that is unit-tested without React or the DOM. React is just the rendering/input adapter; the game loop (`requestAnimationFrame`) lives at the edge and feeds time deltas into the domain.
- Suggested structure (screaming, not framework-shaped): `src/game/domain/`, `src/game/application/`, `src/game/ui/`, `src/splash/`, `src/main.tsx` as the composition root.
- Make the domain deterministic: inject the random source and the clock so tests don't flake.
- Accessible: keyboard operable, sensible focus on the Start button, good colour contrast, `aria-live` for score changes.
- Responsive: fills the viewport, scales on phone / tablet / desktop.
- No backend, no accounts, no analytics, no network calls. Nothing collected from kids.

## Process

1. Scaffold the Vite React TS app in this repo (Node is required; if it isn't installed, tell me rather than guessing).
2. Work on a branch / worktree-style feature branches and open PRs per `~/.claude/CLAUDE.md`; ask before merging unless this repo's `CLAUDE.md` says otherwise.
3. Build in this order, each step test-first and committed:
   1. Domain: ball physics + catch detection
   2. Domain: lives, score, difficulty
   3. Splash screen with logo, dinosaurs and Start button
   4. Game screen wired to the domain, keyboard + touch controls
   5. Game over, best score, pause
   6. Polish: animation, effects, responsive layout, reduced motion
4. Add a short `README.md` (how to run, test, build) and a `CLAUDE.md` for this repo documenting the structure and commands.
5. Run the app and actually look at it (use the `run` skill / a browser) before saying the splash screen looks good. Report anything you couldn't verify.

## Definition of done (v1)
Opening the app shows the splash screen with the logo, "by Daniel" and a Start button; Start begins a playable game where you move a dinosaur to catch a falling ball; game over shows score and lets you play again. Tests and lint pass.
