import { RNG } from "../RNG.js";
import { Chromosome } from "./Chromosome.js";
import { Agent } from "./Individual.js";
import { CrossoverMethod, MutationMethod, SelectionMethod } from "./Methods.js";

export class GeneticAlgorithm<
	S extends SelectionMethod,
	C extends CrossoverMethod,
	M extends MutationMethod
> {
	constructor(
		private selection_method: S,
		private crossover_method: C,
		private mutation_method: M
	) {}

	evolve<A extends Agent>(
		Agent: new (chromosome: Chromosome) => A,
		population: A[],
		rng: RNG
	) {
		if (!population.length) throw new Error("expected at least 1 Individual");

		return population.map(() => {
			const parent_a = this.selection_method
				.select(population, rng)
				.chromosome();
			const parent_b = this.selection_method
				.select(population, rng)
				.chromosome();

			const child = this.crossover_method.crossover(parent_a, parent_b, rng);
			this.mutation_method.mutate(child, rng);
			return new Agent(child);
		});
	}
}
