# Naval Battle

A small 2D top-down naval shooter developed with React, TypeScript, PixiJS, TanStack Query, Axios, MSW and Playwright.

The project was created as a technical challenge focused on gameplay, architecture, responsive UI, mocked API integration and automated tests.

---

## Live Demo

Production:

```text
https://game-developer-challenge-one.vercel.app
```

---

## Main Features

- 2D top-down naval combat
- Keyboard controls
- Touch/mobile controls
- Front cannon attack
- Left and right broadside attacks
- Chaser enemy
- Shooter enemy
- Health system
- Progressive damage sprites
- Collision system
- Islands
- Projectile blocking by islands
- Score system
- Match timer
- Manual pause
- Automatic pause on focus loss
- Configurable match duration
- Ranking
- Match history
- Persistent settings
- Persistent mocked match data
- API simulation with MSW
- Idempotent match submission
- Responsive 16:9 game canvas
- Mobile landscape support
- End-to-end tests with Playwright

---

## Technologies

- React
- TypeScript
- Vite
- PixiJS
- TanStack Query
- Axios
- Mock Service Worker
- Playwright
- Vercel

---

## Requirements

Recommended:

```text
Node.js 20+
npm
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/sissithebrazilian/game-developer-challenge.git
```

Enter the project directory:

```bash
cd game-developer-challenge
```

Install dependencies:

```bash
npm install
```

---

## Running the Project

Start the development server:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

---

## Production Build

To create a production build:

```bash
npm run build
```

The generated files will be placed in:

```text
dist
```

To preview the production build locally:

```bash
npm run preview
```

---

## Game Controls

### Keyboard

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

---

## Touch Controls

On supported touch devices, the game displays on-screen controls for:

- Forward
- Reverse
- Left rotation
- Right rotation
- Front fire
- Left broadside
- Right broadside
- Pause

For mobile devices, landscape orientation is recommended.

---

## Gameplay

The player controls a naval ship inside a 2D arena.

The goal is to survive the match and destroy enemy ships.

There are two enemy types:

### Chaser

The Chaser moves directly toward the player.

When it collides with the player:

- The player receives damage
- The Chaser is destroyed
- No score is awarded for that enemy

### Shooter

The Shooter attempts to maintain a preferred distance from the player and fires projectiles toward the player's position.

---

## Attacks

### Front Cannon

The front cannon fires one projectile in the direction of the ship.

Default control:

```text
Space
```

### Broadside

The broadside attack fires three projectiles from one side of the ship.

Controls:

```text
Q - Left broadside
E - Right broadside
```

The front attack and broadside attacks use independent cooldowns.

---

## Health System

The player has:

```text
3 HP
```

The ship changes sprite depending on its damage state.

The player also receives temporary invulnerability after taking damage to prevent multiple damage events from occurring instantly.

Enemies also have multiple damage states.

---

## Scoring

Each enemy destroyed by a player projectile awards:

```text
1 point
```

A Chaser destroyed by direct collision with the player does not award points.

---

## Match Duration

The match duration can be selected in the Options screen.

Available durations:

```text
60 seconds
90 seconds
120 seconds
180 seconds
```

The match ends when:

- The timer reaches zero
- The player loses all HP

---

## Pause System

The game can be paused manually using:

```text
P
```

The game also pauses automatically when:

- The browser window loses focus
- The user changes browser tabs

While paused, the simulation stops.

This includes:

- Player movement
- Enemy movement
- Projectiles
- Match timer
- Spawn timer

---

## Application Screens

The application contains:

- Main Menu
- Game
- Options
- Results
- Ranking
- Match History

React manages application navigation while PixiJS manages real-time gameplay.

---

## API Simulation

The project uses Mock Service Worker to simulate a backend API.

Available routes:

```text
GET /api/matches
GET /api/ranking
POST /api/matches
```

The API layer uses Axios.

TanStack Query is used for:

- API requests
- Loading states
- Error states
- Mutations
- Cache management
- Query invalidation

---

## Persistence

Because the backend is simulated, match data is stored in browser localStorage.

This allows ranking and match history to remain available after refreshing the page.

Game settings are also persisted.

Important:

```text
localhost and the deployed Vercel domain use separate browser storage.
```

---

## Idempotency

Match submission includes an:

```text
Idempotency-Key
```

The key is based on:

```text
playerName + finishedAt
```

This helps prevent duplicate processing of the same match submission.

---

## Testing

End-to-end tests are implemented using Playwright.

Install the Chromium browser if needed:

```bash
npx playwright install chromium
```

Run the automated tests:

```bash
npm run test:e2e
```

Run Playwright in UI mode:

```bash
npm run test:e2e:ui
```

Current E2E coverage includes:

- Main menu
- Options navigation
- Ranking navigation
- Match History navigation
- Starting a game
- PixiJS canvas rendering

---

## Project Structure

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
│   └── ShooterShip.ts
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
```

---

## Architecture

A more detailed explanation of the project architecture and technical decisions is available in:

```text
ARCHITECTURE.md
```

The main architectural decision is the separation between:

```text
React → application UI and navigation
PixiJS → real-time game simulation and rendering
```

---

## Frame-rate Independence

Game movement and timers use PixiJS delta time:

```ts
const deltaSeconds = ticker.deltaMS / 1000
```

This prevents gameplay speed from being directly tied to frame rate.

---

## Responsive Design

The PixiJS game uses an internal resolution of:

```text
1280 x 720
```

The canvas scales responsively while preserving a 16:9 aspect ratio.

The application also includes responsive layouts for mobile devices and specific adjustments for landscape orientation.

---

## Deployment

The project is deployed using Vercel.

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

MSW is enabled in production so the mocked API remains functional in the deployed version.

---

## Technical Trade-offs

This project was developed under the time constraints of a technical challenge.

Some decisions intentionally prioritize simplicity and delivery.

Examples:

- Circular collision detection instead of a physics engine
- localStorage instead of a real database
- A central GameCanvas orchestrating several systems
- Simple touch buttons instead of a virtual joystick
- Lightweight enemy AI

For a larger production game, these systems could be further separated and expanded.

---

## Possible Improvements

Future improvements could include:

- Sound effects
- Music
- Particle effects
- More enemy types
- Additional maps
- Sprite-based islands
- Difficulty progression
- Virtual joystick
- Additional Playwright tests
- Visual regression testing
- Unit tests
- Performance profiling
- Real backend persistence
- Online ranking

---

## Author

Luiz Paulo Pereira

GitHub:

```text
https://github.com/sissithebrazilian
```
