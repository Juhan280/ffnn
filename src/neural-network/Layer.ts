import { RNG } from "../types.js";
import { Neuron } from "./Neuron.js";

export class Layer {
	#neurons: readonly Neuron[];
	#inputSize: number;

	private constructor(neurons: readonly Neuron[], inputSize: number) {
		this.#neurons = neurons;
		this.#inputSize = inputSize;
	}

	get inputSize() {
		return this.#inputSize;
	}

	*neurons() {
		for (const neuron of this.#neurons) {
			const iterator = neuron.weights();
			let { value, done } = iterator.next();
			while (!done) {
				yield value!;
				({ value, done } = iterator.next());
			}
		}
	}

	static random(input_neurons: number, output_neurons: number, rng: RNG) {
		const neurons = Array.from({ length: output_neurons }, () =>
			Neuron.random(input_neurons, rng)
		);

		return new Layer(neurons, input_neurons);
	}

	static fromWeights(
		input_neurons: number,
		output_neurons: number,
		weightsIter: Iterator<number>
	) {
		const neurons = Array.from({ length: output_neurons }, () =>
			Neuron.fromWeights(input_neurons, weightsIter)
		);

		return new Layer(neurons, input_neurons);
	}

	propagate(inputs: readonly number[], activation: (value: number) => number) {
		return this.#neurons.map(neuron => neuron.propagate(inputs, activation));
	}
}
