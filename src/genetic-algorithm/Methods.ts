import { Agent } from "./Agent.js";
import { Chromosome } from "./Chromosome";
import type { RNG } from "../types.js";

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
