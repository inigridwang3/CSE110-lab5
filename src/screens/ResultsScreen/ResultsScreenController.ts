import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import {
	ResultsScreenModel,
	type LeaderboardEntry,
} from "./ResultsScreenModel.ts";
import { ResultsScreenView } from "./ResultsScreenView.ts";

/**
 * ResultsScreenController - Handles results screen interactions
 */
export class ResultsScreenController extends ScreenController {
	private model: ResultsScreenModel;
	private view: ResultsScreenView;
	private screenSwitcher: ScreenSwitcher;

	private gameOverSound: HTMLAudioElement;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.model = new ResultsScreenModel();
		this.view = new ResultsScreenView(() => this.handlePlayAgainClick());

		this.gameOverSound = new Audio("/gameover.mp3");
	}

	/**
	 * Show results screen with final score, using the Express server for storage
	 */
	async showResultsFromServer(finalScore: number): Promise<void> {
		try {
			this.model.setFinalScore(finalScore);
			this.view.updateFinalScore(finalScore);

			// Submit the score; the server returns the updated top 5
			const top5 = await this.submitScoreToServer(finalScore);
			this.model.setLeaderboard(top5);
			this.view.updateLeaderboard(top5);

			this.view.show();

			this.gameOverSound.currentTime = 0;
			this.gameOverSound.play();
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * Submit a score to the Express server and get back the updated leaderboard
	 */
	private async submitScoreToServer(
		score: number,
	): Promise<LeaderboardEntry[]> {
		const response = await fetch("/api/leaderboard", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ score }),
		});
		if (!response.ok) {
			throw new Error("Unable to save score");
		}
		return (await response.json()) as LeaderboardEntry[];
	}

	/**
	 * Handle play again button click
	 */
	private handlePlayAgainClick(): void {
		this.screenSwitcher.switchToScreen({ type: "menu" });
	}

	/**
	 * Get the view
	 */
	getView(): ResultsScreenView {
		return this.view;
	}
}
