# Pirate Battle

Pirate Battle is a small top-down naval game built with React, TypeScript and PixiJS.

The player controls a pirate ship, fights enemy boats, avoids islands, uses front and side cannons, and tries to survive through a set of progressively harder levels. The project also includes a mocked API layer for ranking and match history, plus automated tests for the main user flows.

## Live version

```text
https://game-developer-challenge-one.vercel.app
```

## Repository

```text
https://github.com/sissithebrazilian/game-developer-challenge
```

## Stack

- React
- TypeScript
- Vite
- PixiJS
- TanStack Query
- Axios
- Mock Service Worker
- Playwright
- Oxlint
- Vercel

## Running locally

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The project usually opens at:

```text
http://localhost:5173
```

## Useful commands

Build the production version:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run lint:

```bash
npm run lint
```

Run the Playwright tests:

```bash
npm run test:e2e
```

Open Playwright UI mode:

```bash
npm run test:e2e:ui
```

If Playwright has not installed Chromium yet:

```bash
npx playwright install chromium
```

## How to play

The game is played in a 16:9 arena. The goal is to destroy enemy ships and survive until the match ends.

Keyboard controls:

```text
W / Arrow Up       Move forward
S / Arrow Down     Reverse
A / Arrow Left     Turn left
D / Arrow Right    Turn right

Space              Front cannon
Q                  Left broadside
E                  Right broadside

P                  Pause / Resume
```

On mobile and touch devices, the game shows on-screen controls. Landscape mode is recommended.

## Gameplay notes

- There are 10 levels, each with a different map layout.
- Enemy ships can spawn in different points around the arena.
- Enemies try to avoid obstacles instead of simply driving through them.
- Chaser ships move toward the player and explode on contact.
- Shooter ships try to keep distance and fire cannonballs.
- Enemy health bars shrink and change color as they take damage.
- Damaged enemies can show fire effects.
- Sinking ships use different explosion animations.
- The player can use both front cannon and broadside attacks.
- Ranking and match history are saved locally through the mocked API layer.

## Screens

The app includes:

- Main Menu
- Level Selection
- Game
- Options
- Results
- Ranking
- Match History

React handles the screens and regular UI. PixiJS handles the game loop, canvas rendering, collisions, enemies, projectiles and visual effects.

## Mocked API and persistence

The project uses Mock Service Worker to simulate the backend.

Available routes:

```text
GET /api/matches
GET /api/ranking
POST /api/matches
```

The API client uses Axios, and TanStack Query handles loading states, cache and invalidation.

Since there is no real backend, match results and settings are stored in `localStorage`. This keeps ranking and match history available after refreshing the page.

One detail worth noting: local development and the deployed Vercel URL use different browser storage, so their ranking/history data will not be shared.

## Match submission

Match submission uses an `Idempotency-Key` based on the player name and finish date.

This avoids duplicated records when the same match result is submitted more than once.

## Tests

The Playwright suite covers the main application flow:

- loading the main menu;
- opening Options;
- opening Ranking;
- opening Match History;
- opening Level Selection;
- starting a game;
- pausing and returning to the menu;
- checking that the PixiJS canvas renders.

## Project structure

```text
src/
├── api/
│   ├── client.ts
│   └── matches.ts
│
├── game/
│   ├── EnemyShip.ts
│   ├── GameCanvas.tsx
│   ├── PlayerShip.ts
│   ├── Projectile.ts
│   ├── ShooterShip.ts
│   └── shipTextures.ts
│
├── mocks/
│   ├── browser.ts
│   └── handlers.ts
│
├── types/
│   └── game.ts
│
├── App.tsx
├── App.css
└── main.tsx

tests/
└── app.spec.ts

ARCHITECTURE.md
playwright.config.ts
vite.config.ts
```

## Architecture

The main split is simple:

```text
React  -> menus, forms, navigation, ranking and history
PixiJS -> gameplay, rendering, collisions, projectiles and entities
```

More details are documented in `ARCHITECTURE.md`.

## Deployment

The game is deployed on Vercel.

Production build command:

```bash
npm run build
```

Output directory:

```text
dist
```

MSW is enabled in production so the ranking and match history mocks keep working on the published URL.

## Trade-offs

This is still a compact challenge project, so a few choices were kept intentionally lightweight:

- collision is based on simple radius checks;
- ranking and history use localStorage instead of a real database;
- enemy movement uses steering behavior instead of full pathfinding;
- the game loop is centralized in the canvas component to keep the delivery focused.

Those choices keep the project easy to run, review and deploy while still providing a complete playable experience.

## Author

Luiz Paulo Pereira

```text
https://github.com/sissithebrazilian
```
