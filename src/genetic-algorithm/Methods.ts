import { Agent } from "./Agent.js";
import { Chromosome } from "./Chromosome";
import type { RNG } from "../types.js";

export interface SelectionMethod {
	select<A extends Agent>(agents: readonly A[], rng: RNG): A;
}

export interface CrossoverMethod {
	crossover(
		chromosome_a: Chromosome,
		chromosome_b: Chromosome,
		rng: RNG
	): Chromosome;
}

export interface MutationMethod {
	mutate(chromosome: Chromosome, rng: RNG): void;
}
