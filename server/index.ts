import express from "express";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

type LeaderboardEntry = { score: number; time: string };
const LEADERBOARD_FILE = new URL("./leaderboard.json", import.meta.url);
const MAX_LEADERBOARD_ENTRIES = 5;
const app = express();
app.use(express.json());

function loadLeaderboard(): LeaderboardEntry[] {
	if (!existsSync(LEADERBOARD_FILE)) {
		return [];
	}
	const text = readFileSync(LEADERBOARD_FILE, "utf8");
	return JSON.parse(text) as LeaderboardEntry[];
}

function saveLeaderboard(entries: LeaderboardEntry[]): void {
	const jsonString = JSON.stringify(entries);
	writeFileSync(LEADERBOARD_FILE, jsonString, "utf8");
}

app.get("/api/leaderboard", (_req, res) => {
	const entries = loadLeaderboard();
	res.json(entries);
});

app.post("/api/leaderboard", (req, res) => {
	const { score } = req.body ?? {};
	if (typeof score !== "number" || !Number.isInteger(score) || score < 0) {
		res.status(400).json({ error: "Invalid score" });
		return;
	}

	// Add the new score, then keep only the top entries
	const entries = loadLeaderboard();
	entries.push({ score, time: new Date().toLocaleString() });
	entries.sort((a, b) => a.score - b.score); // Sort descending
	const topEntries = entries.slice(0, MAX_LEADERBOARD_ENTRIES);
	saveLeaderboard(topEntries);

	res.json(topEntries);
});

app.get("/api/stats", (_req, res) => {
	const entries = loadLeaderboard();

	// Add up all scores and find the best one
	let total = 0;
	let best = 0;
	for (let i = 0; i < entries.length; i++) {
		total = total + entries[i].score;
		if (entries[i].score > best) {
			best = entries[i].score;
		}
	}

	// Avoid dividing by zero when there are no scores yet
	let average = 0;
	if (entries.length > 0) {
		average = total / entries.length;
	}

	res.json({ count: entries.length, best, average });
});

app.listen(3001, () => console.log("Server running on port 3001"));
