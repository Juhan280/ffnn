import { RNG } from "../types.js";
import { Agent } from "./Agent.js";
import { SelectionMethod } from "./Methods.js";

export class RouletteWheelSelection implements SelectionMethod {
	select<A extends Agent>(population: readonly A[], rng: RNG): A {
		const totalFitness = population.reduce(
			(acc, agent) => acc + agent.fitness,
			0
		);

		const selected = rng.generate(0, totalFitness);

		let current = 0;

		for (const agent of population)
			if ((current += agent.fitness) > selected) return agent;
		return population.at(-1)!;
	}
}
