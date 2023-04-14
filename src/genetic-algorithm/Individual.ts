import { Chromosome } from "./Chromosome.js";

export abstract class Agent {
	abstract fitness(): number;
	abstract chromosome(): Chromosome;
}
