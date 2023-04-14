import { RNG } from "../RNG.js";
import { Chromosome } from "./Chromosome.js";
import { CrossoverMethod } from "./Methods.js";

export class UniformCrossover implements CrossoverMethod {
	crossover(
		chromosome_a: Chromosome,
		chromosome_b: Chromosome,
		rng: RNG
	): Chromosome {
		if (chromosome_a.length !== chromosome_b.length)
			throw new Error("both parent must have equal number of genes");

		const genes = chromosome_a.map((gene_a, i) => {
			if (rng.generate(0, 0.5) < 0.5) return gene_a;
			else return chromosome_b.at(i)!;
		});

		return new Chromosome(genes);
	}
}
