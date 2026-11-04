import Konva from "konva";
import type { View } from "../../types.ts";
import type { LeaderboardStats } from "./MenuScreenModel.ts";
import { STAGE_WIDTH } from "../../constants.ts";

/**
 * MenuScreenView - Renders the menu screen
 */
export class MenuScreenView implements View {
	private group: Konva.Group;
	private statsText: Konva.Text;

	constructor(onStartClick: () => void) {
		this.group = new Konva.Group({ visible: true });

		// Title text
		const title = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 150,
			text: "LEMON CLICKER",
			fontSize: 48,
			fontFamily: "Arial",
			fill: "yellow",
			stroke: "orange",
			strokeWidth: 2,
			align: "center",
		});
		// Center the text using offsetX
		title.offsetX(title.width() / 2);
		this.group.add(title);

		const startButtonGroup = new Konva.Group();
		const startButton = new Konva.Rect({
			x: STAGE_WIDTH / 2 - 100,
			y: 300,
			width: 200,
			height: 60,
			fill: "green",
			cornerRadius: 10,
			stroke: "darkgreen",
			strokeWidth: 3,
		});
		const startText = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 315,
			text: "START GAME",
			fontSize: 24,
			fontFamily: "Arial",
			fill: "white",
			align: "center",
		});
		startText.offsetX(startText.width() / 2);
		startButtonGroup.add(startButton);
		startButtonGroup.add(startText);
		startButtonGroup.on("click", onStartClick);
		this.group.add(startButtonGroup);

		// Stats display (near the bottom, below the Start button)
		this.statsText = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 500,
			text: "",
			fontSize: 18,
			fontFamily: "Arial",
			fill: "#333",
			align: "center",
		});
		this.group.add(this.statsText);
	}

	/**
	 * Update the stats display (null if they couldn't be loaded)
	 */
	updateStats(stats: LeaderboardStats | null): void {
		if (stats === null) {
			this.statsText.text("Stats unavailable");
		} else {
			this.statsText.text(
				`Best: ${stats.best}   Average: ${stats.average.toFixed(1)}   Scores saved: ${stats.count}`,
			);
		}
		// Re-center after text change
		this.statsText.offsetX(this.statsText.width() / 2);
		this.group.getLayer()?.draw();
	}

	/**
	 * Show the screen
	 */
	show(): void {
		this.group.visible(true);
		this.group.getLayer()?.draw();
	}

	/**
	 * Hide the screen
	 */
	hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.draw();
	}

	getGroup(): Konva.Group {
		return this.group;
	}
}
