# Lemon Clicker Bug Report

**Name:** Inigrid Wang
**Tickets solved:** 1, 2, 3, 4, 5

---

## Ticket 1: Stats always say "Stats unavailable"

### Actual cause

<!-- Which file and function was the bug in, and what was wrong with the code?
     Explain why that code produced the behavior described in the ticket. -->

**File / function:i MenuScreenController.ts / loadStatsFromServer()**

**What was wrong:** Even after server/leaderboard.json was updated with a very high score of 19 and the corresponding timestamp, the game still displays "Stats unavailable". There was a typo using 'stat' instead of 'stats' in the MenuScreenController file, so the correct stats cannot be fetched.

### Fix

<!-- What did you change, and why does that change fix the problem? -->
Updated the fetch endpoint URL in `MenuScreenController.ts` from `/api/stat` to `/api/stats` to match the route defined on the Express server.

### How did you find it?

#### Hypothesis testing

**What hypothesis ultimately led you to identify the buggy code, and why?**
Hypothesis: Since the directions asked to replace the leaderboard.json file, it is likely that the bug occurs where the menu screen tries to access that file. the MenuScreenView file controls how the menu screen looks, but this seems more like a connectivity issue, which would fall under the responsibility of the MenuScreenController file.

#### Backward tracing

<!-- Start from the symptom you saw and work backwards, one step at a time,
     until you reach the buggy line. For each step, note where you looked
     and what you saw there. Add steps as needed. -->
1. **Symptom:** The start screen displayed "Stats unavailable" below the start game button.
2. **Traced back to:** MenuScreenController file and isolated loadStatsFromServer() function. The line that asks for the stats is fetch("/api/stat").
3. **Traced back to:** Checked function refreshStats() in same file, and it assigns 'stats', not 'stat' the data from the leaderboard. 
4. **Buggy code:** function: MenuScreenController.ts, loadStatsFromServer(), line 47: 'const response = await fetch("/api/stat");' 

<!-- It is okay to use your judgement here in limiting the number of traceback steps. We want to understand your 
    reasoning for how you discovered where the bug was -->

### Confirming the fix

<!-- How did you confirm the problem is gone? -->
Started both the Express backend and Vite dev server, checked that the start screen correctly displays `Best: 19 Average: 19.0 Scores saved: 1`.

---

## Ticket 2: Best score always shows 0

### Actual cause

**File / function:** index.ts / app.get("/api/stats", ...)

**What was wrong:** The loop used to calculate the best score initialized 'best' to 0 and only updated 'best' if entries[i].score < best, which wants the score to be negative, since best = 0 at the beginning of the game. Because game scores are always positive, no score can be less than the initialized 0, and thus 'best' remains at 0 regardless of what scores were saved to the leaderboard.

### Fix

Changed the comparison operator in the best score calculation loop from < to > so that higher scores correctly overwrite the initial 0 value.

### How did you find it?

#### Hypothesis testing

**What hypothesis ultimately led you to identify the buggy code, and why?**
Hypothesis: It is likely that there is a comparison loop in some file that loops through all the saved scores and finds the highest one. The MenuScreenView or MenuScreenController code shows/calculates the wrong score. 

#### Backward tracing

1. **Symptom:** Best score displays 0 on the menu screen despite the leaderboard storing a higher score of 19.
2. **Traced back to:** MenuScreenController. There is no code that calculates the best score with a comparison loop. 
3. **Traced back to:** MenuScreenView. There is no code that explicitly displays 0 for the best score.
4. **Traced back to:** server/index.ts This file takes care of backend functionality. There is a comment that explicitly says on line 48: // Add up all scores and find the best one, and thus the code that follows contains the buggy code that I am looking for.
5. **Buggy code:** index.ts; app.get("/api/stats", (_req, res)); line 53: if (entries[i].score < best) checks for values less than zero (negative) instead of the highest score.

### Confirming the fix

Restarted the Express server, and verified via the browser that the start screen correctly displays Best: 19.

---

## Ticket 3: The lemon only lands in four spots

### Actual cause

**File / function:** GameScreenView.ts / randomizeLemonPosition()

**What was wrong:** The position generator used Math.round(Math.random()) instead of continuous random values. Math.round rounds the input to the closet whole number, so the coordinates evaluate to either 0 or 1 multiplier offsets, restricting the lemon's movement to only four corner positions.

### Fix

Replaced Math.round(Math.random()) with Math.random() for both X and Y coordinates.

### How did you find it?

#### Hypothesis testing

**What hypothesis ultimately led you to identify the buggy code, and why?**
Hypothesis: Because the lemon's movement happens during the game, there must be some function working with the coordinates of the screen that handles its movement. This is likely in the files GameScreenController or GameScreenView.

#### Backward tracing

1. **Symptom:** The lemon repeatedly jumps between the same four spots near the corners.
2. **Traced back to:** GameScreenController file. Found no code that handles the lemon's movement.
3. **Traced back to:** GameScreenView. Found the function randomizeLemonPosition() and comment on Line 84: // Generate random position and Line 88: // Update lemon position.
4. **Buggy code:** GameScreenView.ts; randomizeLemonPosition(); line 85: const randomX = Math.round(Math.random()) * (maxX - minX) + minX; line 86: const randomY = Math.round(Math.random()) * (maxY - minY) + minY;

### Confirming the fix

Started a new game, clicked the lemon multiple times, and verified that it now moves to random coordinates on the screen.

---

## Ticket 4: Stuck on the Game Over screen

### Actual cause

**File / function:** GameScreenController.ts / endGame()

**What was wrong:** The timer was never resetted when the time expired, causing endGame() to re-trigger infinitely every second. This looped the game-over sound, flooded the leaderboard with duplicate score entries, and prevented the player from returning to the menu screen.

### Fix

Added parentheses to this.stopTimer() inside endGame() so the interval is successfully cleared when the game concludes.

### How did you find it?

#### Hypothesis testing

**What hypothesis ultimately led you to identify the buggy code, and why?**
Hypothesis: There may be some loop in GameScreenView that makes the screen stuck. Otherwise, the loop may be present in the GameScreenController file.

#### Backward tracing

1. **Symptom:** Game-over sound loops after the game ends and the game goes back to results screen after clicking 'Play Again'.
2. **Traced back to:** GameScreenView file. Though lines 94 through 121 all attempt to work with showing the screen, there is no code that looks obviously wrong. The issue may be with the game mechanism controlled by GameScreenController file instead.
3. **Traced back to:** GameScreenController file. Found endGame() function, and found line 87: 'this.stopTimer' line. Confirmed that line 60: stopTimer() is a helper function in the same file.
4. **Buggy code:** GameScreenController.ts; private endGame(); Line 87: this.stopTimer; missing parentheses inside endGame() function.

### Confirming the fix

Started a game, let the timer reach zero, verified that the game-over sound plays only once, checked that the score is recorded a single time, and confirmed that clicking Play Again returns to the start screen.

---

## Ticket 5: Leaderboard dates show "undefined"

### Actual cause

**File / function:** ResultsScreenView.ts / updateLeaderboard()

**What was wrong:** There was a name mismatch between the ResultsScreenView file and index.ts. index.ts stored leaderboard entries using the property 'time', whereas the ResultsScreenView file accesses the property 'timestamp' instead. Hence, the accessed property was interpreted as 'undefined'.

### Fix

Updated ResultsScreenView property entry.timestamp with entry.time as provided by index.ts.

### How did you find it?

#### Hypothesis testing

**What hypothesis ultimately led you to identify the buggy code, and why?**
Hypothesis: There error likely occurs in ResultsScreenView, ResultsScreenController, or index.ts with the variable 'date','time', or some name along that line.

#### Backward tracing

1. **Symptom:** Leaderboard dates were undefined for every score entry.
2. **Traced back to:** ResultsScreenView.updateLeaderboard(). There is only one line that associates with the time for the score, specifically line 106: entry.timestamp.
3. **Traced back to:** ResultsScreenController. There is no relevant code that associates with the time of the score.
4. **Traced back to:** index.ts. This file defines type LeaderboardEntry = { score: number; time: string }, and thus date is officially declared in the property 'time', so the error must be in ResultsScreenView instead.
5. **Buggy code:** ResultsScreenView; updateLeaderboard(); line 106: entry.timestamp should instead be entry.time.

### Confirming the fix

Played a test game, obtained a new score, and verified on the Results screen that the leaderboard successfully displays the score alongside the correct timestamp.
