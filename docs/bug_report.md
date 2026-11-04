# Lemon Clicker Bug Report

**Name:** Inigrid Wang
**Tickets solved:** 1, 2, 3, 4, 5

---

## Ticket 1: Stats always say "Stats unavailable"

### Actual cause

<!-- Which file and function was the bug in, and what was wrong with the code?
     Explain why that code produced the behavior described in the ticket. -->

**File / function:i `MenuScreenController.ts` / `loadStatsFromServer()`**

**What was wrong:** The frontend fetch request requested `/api/stat` (singular) instead of the correct backend Express route `/api/stats` (plural), resulting in a `404 Not Found` response. This uncaught HTTP error triggered the catch block in the controller, leaving the stats object null and causing the UI to permanently fall back to displaying "Stats unavailable".

### Fix

<!-- What did you change, and why does that change fix the problem? -->
Updated the fetch endpoint URL in `MenuScreenController.ts` from `/api/stat` to `/api/stats` to match the route defined on the Express server.

### How did you find it?

#### Hypothesis testing

**What hypothesis ultimately led you to identify the buggy code, and why?**
Hypothesis: The frontend is calling an unregistered API endpoint, causing a 404 error that forces the stats fetch to fail and trigger the fallback UI state. This was verified by checking browser network response status codes and tracing error handling flows.


#### Backward tracing

<!-- Start from the symptom you saw and work backwards, one step at a time,
     until you reach the buggy line. For each step, note where you looked
     and what you saw there. Add steps as needed. -->
1. **Symptom:** The start screen displayed "Stats unavailable" below the start game button.
2. **Traced back to:** `MenuScreenView.updateStats()` receiving a `null` stats object because the fetch operation failed.
3. **Traced back to:** `MenuScreenController.loadStatsFromServer()` throwing an error when `response.ok` evaluated to false.
4. **Buggy code:** function: MenuScreenController.ts, loadStatsFromServer(), line 47: 'const response = await fetch("/api/stat");' 

<!-- It is okay to use your judgement here in limiting the number of traceback steps. We want to understand your 
    reasoning for how you discovered where the bug was -->

### Confirming the fix

<!-- How did you confirm the problem is gone? -->
Started both the Express backend and Vite dev server, and the start screen correctly displays `Best: 19 Average: 19.0 Scores saved: 1`.

---

## Ticket 2: Best score always shows 0

### Actual cause

**File / function:** `index.ts` / `app.get("/api/stats", ...)`

**What was wrong:** The loop responsible for calculating the best score initialized `best` to `0` and checked `if (entries[i].score < best)`. Because game scores are positive integers, no score was ever less than 0, causing `best` to remain permanently stuck at 0 regardless of what scores were saved on the leaderboard.

### Fix

Changed the comparison operator in the best score calculation loop from `<` to `>` so that higher scores correctly overwrite the initial `0` value (`if (entries[i].score > best)`).

### How did you find it?

#### Hypothesis testing

**What hypothesis ultimately led you to identify the buggy code, and why?**
Hypothesis: The server-side code calculating the best score uses an incorrect comparison operator or initial state, preventing valid scores from overriding the default `0`. This was confirmed by inspecting the stats endpoint logic in `server/index.ts`.

#### Backward tracing

1. **Symptom:** Best score displays 0 on the UI despite the leaderboard storing higher scores (e.g., 15).
2. **Traced back to:** The frontend receiving `best: 0` from the `/api/stats` JSON response.
3. **Traced back to:** The Express route handler in `server/index.ts` computing the `best` variable.
4. **Buggy code:** index.ts; app.get("/api/stats", (_req, res)); line 53: `if (entries[i].score < best)` checking for values less than zero instead of searching for the maximum score.

### Confirming the fix

Restarted the Express server, and verified via the browser that the start screen correctly displays `Best: 15`.

---

## Ticket 3: The lemon only lands in four spots

### Actual cause

**File / function:** `GameScreenView.ts` / `randomizeLemonPosition()`

**What was wrong:** The position generator used `Math.round(Math.random())` instead of continuous random values, forcing coordinates to strictly evaluate to either 0 or 1 multiplier offsets. This restricted the lemon's movement to only four fixed corner positions.

### Fix

Replaced `Math.round(Math.random())` with continuous `Math.random()` scaling across `(maxX - minX)` and `(maxY - minY)` to allow the lemon to spawn anywhere within the play area bounds.

### How did you find it?

#### Hypothesis testing

**What hypothesis ultimately led you to identify the buggy code, and why?**
Hypothesis: The coordinate generation logic uses a binary choice (like 0 or 1 multipliers) instead of a continuous float multiplication, confining placements to extremes. This was confirmed by inspecting `randomizeLemonPosition()` in `GameScreenView.ts`.

#### Backward tracing

1. **Symptom:** The lemon repeatedly jumps between the same four spots near the corners.
2. **Traced back to:** `GameScreenView.randomizeLemonPosition()` calculating coordinates for `this.lemonImage`.
3. **Traced back to:** `Math.round(Math.random())` evaluating exclusively to binary step bounds.
4. **Buggy code:** GameScreenView.ts; randomizeLemonPosition(); line 85: `const randomX = Math.round(Math.random()) * (maxX - minX) + minX;` line 86: `const randomY = Math.round(Math.random()) * (maxY - minY) + minY;`

### Confirming the fix

Started a new game, clicked the lemon multiple times, and verified that it now spawns dynamically and unpredictably across various random coordinates on the stage.

---

## Ticket 4: Stuck on the Game Over screen

### Actual cause

**File / function:** `GameScreenController.ts` / `endGame()`

**What was wrong:** The `endGame()` method referenced `this.stopTimer;` as a property reference instead of invoking it with parentheses (`this.stopTimer()`). As a result, the timer interval created by `setInterval` was never cleared when the time expired, causing `endGame()` to re-trigger infinitely every second. This looped the game-over sound, flooded the leaderboard with duplicate score entries, and prevented the player from staying on the menu screen.

### Fix

Added parentheses to `this.stopTimer()` inside `endGame()` so the interval is successfully cleared when the game concludes.

### How did you find it?

#### Hypothesis testing

**What hypothesis ultimately led you to identify the buggy code, and why?**
Hypothesis: The game loop or timer interval remains active after the game ends because the cleanup function was omitted or referenced without execution. This was confirmed by inspecting the `endGame()` method in `GameScreenController.ts`.

#### Backward tracing

1. **Symptom:** Game-over sound loops continuously every second and the game forces its way back to the results screen immediately after clicking Play Again.
2. **Traced back to:** `GameScreenController.endGame()` being repeatedly executed every 1000ms.
3. **Traced back to:** `this.gameTimer` interval never being cleared.
4. **Buggy code:** GameScreenController.ts; private endGame(); Line 87: `this.stopTimer;` missing execution parentheses inside `endGame()`.

### Confirming the fix

Started a game, let the timer reach zero, verified that the game-over sound plays only once, checked that the score is recorded a single time, and confirmed that clicking Play Again returns a stable start screen.

---

## Ticket 5: Leaderboard dates show "undefined"

### Actual cause

**File / function:** `ResultsScreenView.ts` / `updateLeaderboard()`

**What was wrong:** A property name mismatch existed between the backend and frontend. The Express server stored leaderboard entries using the property `{ score, time }`, whereas the frontend view and model attempted to read properties named `timestamp`. Consequently, JavaScript evaluated the accessed property as `undefined`.

### Fix

Updated the leaderboard view and data model types to correctly reference `entry.time` as provided by the backend API payload.

### How did you find it?

#### Hypothesis testing

**What hypothesis ultimately led you to identify the buggy code, and why?**
Hypothesis: The property name returned in the JSON response from `server/index.ts` does not match the property name requested by `ResultsScreenView.ts`. This was verified by inspecting both the Express server route and the frontend view code.

#### Backward tracing

1. **Symptom:** Leaderboard dates rendered as `undefined` for every score entry.
2. **Traced back to:** `ResultsScreenView.updateLeaderboard()` reading properties not present in the server's JSON object.
3. **Traced back to:** `server/index.ts` saving objects with `time: new Date().toLocaleString()`.
4. **Buggy code:** Property mismatch between frontend line 106: (`entry.timestamp`) and backend (`entry.time`).

### Confirming the fix

Played a test game, submitted a score, and verified on the Game Over screen that the leaderboard successfully displays the score alongside the correct timestamp string.
