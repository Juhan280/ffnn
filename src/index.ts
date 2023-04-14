import sr from "seedrandom";
import {
	Agent,
	Chromosome,
	UniformCrossover,
	GeneticAlgorithm,
	RouletteWheelSelection,
	GaussianMutation,
} from "./genetic-algorithm/index";
// import { Network } from "./neural-network/Network.js";

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
		return [...this.#chromosome].reduce(
			(acc, gene) => acc * gene + rng.generate(-0.1, 0.1),
			1
		);
	}
}

let myAgents = [
	new MyAgent(new Chromosome([0, 0, 0])),
	new MyAgent(new Chromosome([1, 1, 2])),
	new MyAgent(new Chromosome([2, 3, 1])),
	new MyAgent(new Chromosome([4, 0, 2])),
];

const selectionMethod = new RouletteWheelSelection();
const crossoverMethod = new UniformCrossover();
const mutationMethod = new GaussianMutation(0.5, 1.5);

const geneticAlgorithm = new GeneticAlgorithm(
	selectionMethod,
	crossoverMethod,
	mutationMethod
);

for (let i = 0; i < 500; i++) {
	process.stdout.write("\rEvolving gen " + (i + 1));
	myAgents = geneticAlgorithm.evolve(MyAgent, myAgents, rng);
}
console.log();

myAgents.map(agent => console.log(agent.chromosome()));
