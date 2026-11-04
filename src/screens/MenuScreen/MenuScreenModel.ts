/**
 * Summary statistics for the saved leaderboard scores
 */
export type LeaderboardStats = {
	count: number;
	best: number;
	average: number;
};

/**
 * MenuScreenModel - Stores the leaderboard stats shown on the menu
 */
export class MenuScreenModel {
	private stats: LeaderboardStats | null = null;

	/**
	 * Set the leaderboard stats (null if they couldn't be loaded)
	 */
	setStats(stats: LeaderboardStats | null): void {
		this.stats = stats;
	}

	/**
	 * Get the leaderboard stats
	 */
	getStats(): LeaderboardStats | null {
		return this.stats;
	}
}
