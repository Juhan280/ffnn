import { Chromosome } from "./Chromosome.js";

export abstract class Agent {
	abstract neuronCounts: readonly number[];
	public abstract fitness: number;
	abstract chromosome(): Chromosome;
}
