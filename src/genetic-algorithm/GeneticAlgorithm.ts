import { RNG } from "../RNG.js";
import { Agent } from "./Agent.js";
import { Chromosome } from "./Chromosome.js";
import { CrossoverMethod, MutationMethod, SelectionMethod } from "./Methods.js";

export class GeneticAlgorithm {
	constructor(
		private selectionMethod: SelectionMethod,
		private crossoverMethod: CrossoverMethod,
		private mutationMethod: MutationMethod
	) {}

	evolve<A extends Agent>(
		Agent: new (neuronCounts: readonly number[], chromosome: Chromosome) => A,
		population: A[],
		rng: RNG
	) {
		if (!population.length) throw new Error("expected at least 1 Agent");

		const { neuronCounts } = population[0];

		return population.map(() => {
			const parent_a = this.selectionMethod
				.select(population, rng)
				.chromosome();
			const parent_b = this.selectionMethod
				.select(population, rng)
				.chromosome();

			const child = this.crossoverMethod.crossover(parent_a, parent_b, rng);
			this.mutationMethod.mutate(child, rng);

			return new Agent(neuronCounts, child);
		});
	}
}
