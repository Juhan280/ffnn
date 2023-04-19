import { Vector2 } from "../types.js";
import { Config } from "./Config.js";
import { Food } from "./Food.js";

export class Eye {
	readonly fov_range: number;
	readonly fov_angle: number;
	readonly cells: number;

	constructor(config: Config) {
		if (config.eye_fov_range <= 0)
			throw new Error("fov range must be positive");
		if (config.eye_fov_angle <= 0)
			throw new Error("fov angle must be positive");
		if (config.eye_cells <= 0)
			throw new Error("number of eye cells must be positive");

		this.fov_range = config.eye_fov_range;
		this.fov_angle = config.eye_fov_angle;
		this.cells = config.eye_cells;
	}

	processVision(position: Vector2, rotation: number, foods: readonly Food[]) {
		const cells: number[] = Array(this.cells).fill(0);
		const [x, y] = position;

		for (const food of foods) {
			const distance = Math.hypot(x - food.position[0], y - food.position[1]);

			if (distance > this.fov_range) continue;

			// I am pretty sure that this formula of mine is wrong.
			const angle = Math.PI + rotation - Math.acos(x / Math.hypot(x, y));
			// console.log({ rotation, hypot: Math.hypot(x, y), angle, distance });

			if (Math.abs(angle) > this.fov_angle / 2) continue;

			const cell = Math.min(
				Math.floor(
					((angle + this.fov_angle / 2) / this.fov_angle) * this.cells
				),
				this.cells - 1
			);

			cells[cell] = (this.fov_range - distance) / this.fov_range;
		}

		return cells;
	}
}
