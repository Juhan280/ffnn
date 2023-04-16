import { Agent } from "./Agent.js";

export class Statistics {
	readonly max_fitness: number;
	readonly min_fitness: number;
	readonly avg_fitness: number;
	readonly median_fitness: number;

	constructor(population: readonly Agent[]) {
		if (!population.length) throw new Error("expected at least 1 Agent");

		const { length } = population;

		const fitnesses = population
			.map(agent => agent.fitness())
			.sort((a, b) => a - b);

		this.min_fitness = fitnesses[0];
		this.max_fitness = fitnesses[length - 1];
		this.avg_fitness = fitnesses.reduce((acc, cur) => acc + cur) / length;

		if (length % 2) {
			this.median_fitness = fitnesses[(length + 1) / 2];
		} else {
			this.median_fitness =
				(fitnesses[length / 2 - 1] - fitnesses[length / 2]) / 2;
		}
	}
}
