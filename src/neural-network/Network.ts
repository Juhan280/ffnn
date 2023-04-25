import { ActivationFunction, RNG } from "../types.js";
import { Layer } from "./Layer.js";

export class Network {
	private constructor(
		readonly layers: readonly Layer[],
		readonly activation: ActivationFunction
	) {}

	*weights() {
		for (const layer of this.layers)
			for (const neuron of layer.neurons) {
				yield neuron.bias;
				for (const weight of neuron.weights) yield weight;
			}
	}

	propagate(inputs: readonly number[]) {
		if (inputs.length !== this.layers[0].neurons[0].weights.length)
			throw new RangeError(
				"input length must be equal to tye amount of input neurons"
			);

		return this.layers.reduce(
			(inputs, layer) => layer.propagate(inputs, this.activation),
			inputs
		);
	}

	static random(
		neuronCounts: readonly number[],
		activation: ActivationFunction,
		rng: RNG
	) {
		if (neuronCounts.length <= 1)
			throw new RangeError("there must be at least 2 layers");

		const layers: Layer[] = Array(neuronCounts.length - 1);

		for (let i = 0; i < neuronCounts.length - 1; i++) {
			const input_neurons = neuronCounts[i];
			const output_neurons = neuronCounts[i + 1];

			layers[i] = Layer.random(input_neurons, output_neurons, rng);
		}

		return new Network(layers, activation);
	}

	static fromWeights(
		neuronCounts: readonly number[],
		activation: ActivationFunction,
		weights: Iterable<number>
	) {
		if (neuronCounts.length <= 1)
			throw new RangeError("there must be at least 2 layers");

		const weightsIter = weights[Symbol.iterator]();
		const layers: Layer[] = Array(neuronCounts.length - 1);

		for (let i = 0; i < neuronCounts.length - 1; i++) {
			const input_neurons = neuronCounts[i];
			const output_neurons = neuronCounts[i + 1];

			layers[i] = Layer.fromWeights(input_neurons, output_neurons, weightsIter);
		}

		return new Network(layers, activation);
	}
}
