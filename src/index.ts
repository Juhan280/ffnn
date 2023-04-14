import sr from "seedrandom";
import {
	Agent,
	Chromosome,
	UniformCrossover,
	GeneticAlgorithm,
	RouletteWheelSelection,
	GaussianMutation,
} from "./genetic-algorithm/index";
import { Network } from "./neural-network/Network.js";

const rng = {
	algorithm: sr.alea,
	seed: "0.19a3bbbe7f1e2",
	generate(min: number, max: number) {
		const value = this.algorithm(this.seed)() * (max - min) + min;
		this.seed = value.toString(16);
		return value;
	},
};

function activation(value: number) {
	// sigmoid function
	return 1 / (1 + Math.E ** -value);
}

class MyAgent extends Agent {
	#chromosome: Chromosome;

	constructor(chromosome: Chromosome) {
		super();
		this.#chromosome = chromosome;
	}

	chromosome(): Chromosome {
		return this.#chromosome;
	}

	fitness(): number {
		return [...this.#chromosome].reduce((acc, gene) => acc + gene);
	}
}

let myAgents = Array.from(
	{ length: 4 },
	() =>
		new MyAgent(
			new Chromosome(Array.from({ length: 5 }, () => rng.generate(-5, 5)))
		)
);

console.log("Before:");
myAgents.map(agent => console.log([...agent.chromosome()], agent.fitness()));

const geneticAlgorithm = new GeneticAlgorithm(
	new RouletteWheelSelection(),
	new UniformCrossover(),
	new GaussianMutation(0.33, 3)
);

for (let i = 0; i < 100; i++) {
	process.stdout.write("\rEvolving gen " + (i + 1));
	myAgents = geneticAlgorithm.evolve(MyAgent, myAgents, rng);
}

console.log("\nAfter:");
myAgents.map(agent => console.log([...agent.chromosome()], agent.fitness()));
