# Lemon Clicker Bug Report

**Name:** Inigrid Wang
**Tickets solved:** 1

---

## Ticket 1: Stats always say "Stats unavailable"

### Actual cause

<!-- Which file and function was the bug in, and what was wrong with the code?
     Explain why that code produced the behavior described in the ticket. -->

**File / function:i `src/screens/MenuScreen/MenuScreenController.ts` / `loadStatsFromServer()`**

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

**File / function:** `server/index.ts` / `app.get("/api/stats", ...)`

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

