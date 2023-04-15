import { Chromosome } from "./Chromosome.js";

export abstract class Agent {
	abstract neuronCounts: readonly number[];
	abstract fitness(): number;
	abstract chromosome(): Chromosome;
}
