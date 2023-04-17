import { RNG } from "../types.js";
import { Chromosome } from "./Chromosome.js";
import { MutationMethod } from "./Methods.js";

export class GaussianMutation implements MutationMethod {
	/**
	 * Probability of changing the gene.
	 * - 0.0 = no genes will be touched
	 * - 1.0 = all genes will be touched
	 **/
	private chance: number;
	/**
	 * Magnetude of the change
	 * - 0.0 = touched geens will not be modified
	 * - 3.0 = touched gene wipp be += or -= by at most 3.0
	 */
	private coeff: number;

	constructor(change: number, coeff: number) {
		this.chance = change;
		this.coeff = coeff;
	}

	mutate(child: Chromosome, rng: RNG): void {
		for (const [gene, setGene] of child.iter_mut()) {
			const sign = rng.generate(0, 1) < 0.5 ? 1 : -1;

			if (rng.generate(0, 1) < this.chance)
				setGene(gene + sign * rng.generate(0, this.coeff));
		}
	}
}
