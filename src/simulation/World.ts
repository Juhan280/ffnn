import { RNG } from "../RNG";
import { ActivationFunction } from "../types";
import { Animal } from "./Animal.js";
import { Config } from "./Config.js";
import { Food } from "./Food.js";

export class World {
	constructor(
		public animals: readonly Animal[],
		readonly foods: readonly Food[]
	) {}

	static random(config: Config, activation: ActivationFunction, rng: RNG) {
		const animals = Array.from({ length: config.world_animals }, () =>
			Animal.random(config, activation, rng)
		);

		const foods = Array.from({ length: config.world_foods }, () =>
			Food.random(rng)
		);

		return new World(animals, foods);
	}
}
