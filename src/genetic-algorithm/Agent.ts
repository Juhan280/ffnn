import { Chromosome } from "./Chromosome.js";

export abstract class Agent {
	public abstract fitness: number;
	abstract chromosome(): Chromosome;
}
