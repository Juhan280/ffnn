import {
	GaussianMutation,
	GeneticAlgorithm,
	RouletteWheelSelection,
	UniformCrossover,
} from "../genetic-algorithm/index.js";
import { RNG } from "../types.js";
import { activation } from "../utils.js";
import { Bird } from "./Bird.js";
import { Config } from "./Config.js";
import { Statistics } from "./Statistics.js";
import { World } from "./World.js";

export class Simulation {
	constructor(
		readonly config: Config,
		readonly world: World,
		private age: number,
		public generation: number
	) {
		this.generation = generation;
	}

	step(rng: RNG) {
		this.processCollusion(rng);
		this.processBrains();
		this.processMovements();
		return this.tryEvolving(rng);
	}

	train(rng: RNG) {
		while (true) {
			const statistics = this.step(rng);
			if (statistics) return statistics;
		}
	}

	processCollusion(rng: RNG) {
		for (const animal of this.world.animals) {
			for (const food of this.world.foods) {
				const distance = Math.hypot(
					animal.position[0] - food.position[0],
					animal.position[1] - food.position[1]
				);

				if (distance > 0.015) continue;
				animal.satiation++;
				food.position = [rng.generate(0, 1), rng.generate(0, 1)];
			}
		}
	}

	processBrains() {
		for (const animal of this.world.animals)
			animal.processBrain(this.config, this.world.foods);
	}

	processMovements() {
		for (const animal of this.world.animals) animal.processMovement();
	}

	tryEvolving(rng: RNG) {
		if (++this.age > this.config.sim_generation_length) return this.evolve(rng);
	}

	evolve(rng: RNG) {
		this.age = 0;
		this.generation++;

		const agents = this.world.animals.map(Bird.fromAnimal);

		// TODO: research
		if (this.config.ga_reverse === 1) {
			const max_satiation = this.world.animals.reduce((prev, cur) =>
				prev.satiation > cur.satiation ? prev : cur
			).satiation;

			for (const agent of agents) {
				agent.fitness = max_satiation - agent.fitness;
			}
		}

		const geneticAlgorithm = new GeneticAlgorithm(
			new RouletteWheelSelection(),
			new UniformCrossover(),
			new GaussianMutation(0.01, 0.3)
		);

		const [birds, statistics] = geneticAlgorithm.evolve(
			Bird.create,
			agents,
			rng
		);

		this.world.animals = birds.map(bird =>
			bird.toAnimal(this.config, activation, rng)
		);

		for (const food of this.world.foods)
			food.position = [rng.generate(0, 1), rng.generate(0, 1)];

		return new Statistics(this.generation - 1, statistics);
	}
}
