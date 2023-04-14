import { Chromosome } from "./Chromosome";
import { Agent } from "./Individual.js";
import type { RNG } from "../RNG.js";

export interface SelectionMethod {
	select<A extends Agent>(population: A[], rng: RNG): A;
}

export interface CrossoverMethod {
	crossover(
		chromosome_a: Chromosome,
		chromosome_b: Chromosome,
		rng: RNG
	): Chromosome;
}

export interface MutationMethod {
	mutate(child: Chromosome, rng: RNG): void;
}
