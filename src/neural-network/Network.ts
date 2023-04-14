import { RNG } from "../RNG.js";
import { Layer } from "./Layer.js";

export class Network {
	private constructor(
		private layers: Layer[],
		private activation: (value: number) => number
	) {}

	*weights() {
		for (const layer of this.layers) {
			const iterator = layer.neurons();
			let { value, done } = iterator.next();
			while (!done) {
				yield value!;
				({ value, done } = iterator.next());
			}
		}
	}

	static random(
		layerTopologies: number[],
		activation: (value: number) => number,
		rng: RNG
	) {
		if (layerTopologies.length <= 1)
			throw new RangeError("there must be at least 2 layers");

		const layers: Layer[] = Array(layerTopologies.length - 1);

		for (let i = 0; i < layerTopologies.length - 1; i++) {
			const input_neurons = layerTopologies[i];
			const output_neurons = layerTopologies[i + 1];

			layers[i] = Layer.random(input_neurons, output_neurons, rng);
		}

		return new Network(layers, activation);
	}

	static fromWeights(
		layerTopologies: number[],
		activation: (value: number) => number,
		weights: Iterable<number>
	) {
		if (layerTopologies.length <= 1)
			throw new RangeError("there must be at least 2 layers");

		const weightsIter = weights[Symbol.iterator]();
		const layers: Layer[] = Array(layerTopologies.length - 1);

		for (let i = 0; i < layerTopologies.length - 1; i++) {
			const input_neurons = layerTopologies[i];
			const output_neurons = layerTopologies[i + 1];

			layers[i] = Layer.fromWeights(input_neurons, output_neurons, weightsIter);
		}

		return new Network(layers, activation);
	}

	propagate(inputs: number[]) {
		if (inputs.length !== this.layers[0].inputSize)
			throw new RangeError(
				"input length must be equal to tye amount of input neurons"
			);

		return this.layers.reduce(
			(inputs, layer) => layer.propagate(inputs, this.activation),
			inputs
		);
	}
}
