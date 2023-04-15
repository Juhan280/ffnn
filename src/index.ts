import {
	Agent,
	Chromosome,
	UniformCrossover,
	GeneticAlgorithm,
	RouletteWheelSelection,
	GaussianMutation,
} from "./genetic-algorithm/index.js";
import { Network } from "./neural-network/Network.js";
import { rng } from "./RNG.js";

function activation(value: number) {
	// sigmoid function
	return 1 / (1 + Math.E ** -value);
}

class MyAgent extends Agent {
	#chromosome: Chromosome;
	#neuronCounts: readonly number[];
	#network: Network;

	constructor(neuronCounts: readonly number[], chromosome: Chromosome) {
		super();
		this.#chromosome = chromosome;
		this.#neuronCounts = neuronCounts;
		this.#network = Network.fromWeights(neuronCounts, activation, chromosome);
	}

	get neuronCounts() {
		return this.#neuronCounts;
	}

	chromosome(): Chromosome {
		return this.#chromosome;
	}

	fitness(): number {
		return [...this.#chromosome].reduce((acc, gene) => acc + gene);
	}

	static random(neuronCounts: readonly number[]) {
		let length = 0;

		for (let i = 0; i < neuronCounts.length - 1; i++)
			length += neuronCounts[i] * neuronCounts[i + 1] + neuronCounts[i + 1];

		const chromosome = new Chromosome(
			Array.from({ length }, () => rng.generate(-3, 3))
		);

		return new MyAgent(neuronCounts, chromosome);
	}

	static fromNetwork(network: Network) {
		return new MyAgent([], new Chromosome(network.weights()));
	}
}

let myAgents = Array.from({ length: 4 }, () => MyAgent.random([2, 3, 2]));

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
