import { RNG, Vector2 } from "../types.js";

export class Food {
	constructor(public position: Vector2) {}

	static random(rng: RNG) {
		return new Food([rng.generate(0, 1), rng.generate(0, 1)]);
	}
}
