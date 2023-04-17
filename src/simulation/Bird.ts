import { Agent, Chromosome } from "../genetic-algorithm/index.js";
import { RNG } from "../RNG.js";
import { ActivationFunction } from "../types.js";
import { Animal } from "./Animal.js";
import { Config } from "./Config.js";

export class Bird extends Agent {
	#chromosome: Chromosome;
	neuronCounts: readonly number[];

	constructor(public fitness: number, chromosome: Chromosome) {
		super();

		this.#chromosome = chromosome;
	}

	chromosome(): Chromosome {
		return this.#chromosome;
	}

	toAnimal(config: Config, activation: ActivationFunction, rng: RNG) {
		return Animal.fromChromosome(config, this.#chromosome, activation, rng);
	}

	static create(chromosome: Chromosome) {
		return new Bird(0, chromosome);
	}

	static fromAnimal(animal: Animal) {
		return new Bird(animal.satiation, animal.chromosome());
	}
}
