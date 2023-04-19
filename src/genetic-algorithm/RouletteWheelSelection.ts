import { RNG } from "../types.js";
import { Agent } from "./Agent.js";
import { SelectionMethod } from "./Methods.js";

export class RouletteWheelSelection implements SelectionMethod {
	select<A extends Agent>(agents: readonly A[], rng: RNG): A {
		if (!agents.length) throw new Error("expected at least 1 agnet");

		const totalFitness = agents.reduce((acc, agent) => acc + agent.fitness, 0);

		const selected = rng.generate(0, totalFitness);

		let current = 0;

		for (const agent of agents)
			if ((current += agent.fitness) > selected) return agent;
		return agents.at(-1)!;
	}
}
