import { Vector2 } from "../types.js";
import { getAngleBetweenNormalAndFood } from "../utils.js";
import { Food } from "./Food.js";

export class Eye {
	readonly fov: {
		readonly range: number;
		readonly angle: number;
	};
	readonly cells: number;

	constructor(range: number, angle: number, cells: number) {
		if (range <= 0) throw new Error("fov range must be positive");
		if (angle <= 0) throw new Error("fov angle must be positive");
		if (cells <= 0) throw new Error("number of eye cells must be positive");

		this.fov = { range, angle };
		this.cells = cells;
	}

	processVision(position: Vector2, rotation: number, foods: readonly Food[]) {
		const cells: number[] = Array(this.cells).fill(0);
		const [x, y] = position;

		for (const food of foods) {
			const distance = Math.hypot(x - food.position[0], y - food.position[1]);

			if (distance > this.fov.range) continue;

			const angle = getAngleBetweenNormalAndFood(position, rotation, food);

			if (Math.abs(angle) > this.fov.angle / 2) continue;

			const cell = Math.min(
				Math.floor(
					((angle + this.fov.angle / 2) / this.fov.angle) * this.cells
				),
				this.cells - 1
			);

			cells[cell] = (this.fov.range - distance) / this.fov.range;
		}

		return cells;
	}
}
