import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { MenuScreenModel, type LeaderboardStats } from "./MenuScreenModel.ts";
import { MenuScreenView } from "./MenuScreenView.ts";

/**
 * MenuScreenController - Handles menu interactions
 */
export class MenuScreenController extends ScreenController {
	private model: MenuScreenModel;
	private view: MenuScreenView;
	private screenSwitcher: ScreenSwitcher;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.model = new MenuScreenModel();
		this.view = new MenuScreenView(() => this.handleStartClick());
	}

	/**
	 * Show the menu and refresh the stats so they include the latest game
	 */
	show(): void {
		super.show();
		this.refreshStats();
	}

	/**
	 * Load stats from the server and display them
	 */
	private async refreshStats(): Promise<void> {
		let stats: LeaderboardStats | null = null;
		try {
			stats = await this.loadStatsFromServer();
		} catch (error) {
			console.error(error);
		}
		this.model.setStats(stats);
		this.view.updateStats(stats);
	}

	/**
	 * Load leaderboard stats from the Express server
	 */
	private async loadStatsFromServer(): Promise<LeaderboardStats> {
		const response = await fetch("/api/stats");
		if (!response.ok) {
			throw new Error("Unable to load stats");
		}
		return (await response.json()) as LeaderboardStats;
	}

	/**
	 * Handle start button click
	 */
	private handleStartClick(): void {
		this.screenSwitcher.switchToScreen({ type: "game" });
	}

	/**
	 * Get the view
	 */
	getView(): MenuScreenView {
		return this.view;
	}
}
