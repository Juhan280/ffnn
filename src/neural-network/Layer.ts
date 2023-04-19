import { RNG } from "../types.js";
import { Neuron } from "./Neuron.js";

export class Layer {
	private constructor(readonly neurons: readonly Neuron[]) {}

	propagate(inputs: readonly number[], activation: (value: number) => number) {
		return this.neurons.map(neuron => neuron.propagate(inputs, activation));
	}

	static random(input_neurons: number, output_neurons: number, rng: RNG) {
		const neurons = Array.from({ length: output_neurons }, () =>
			Neuron.random(input_neurons, rng)
		);

		return new Layer(neurons);
	}

	static fromWeights(
		input_neurons: number,
		output_neurons: number,
		weightsIter: Iterator<number>
	) {
		const neurons = Array.from({ length: output_neurons }, () =>
			Neuron.fromWeights(input_neurons, weightsIter)
		);

		return new Layer(neurons);
	}
}
