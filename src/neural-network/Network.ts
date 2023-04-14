import { RNG } from "../RNG.js";
import { Layer } from "./Layer.js";

export class Network {
	private layers: Layer[];
	private activation: (value: number) => number;

	constructor(
		layers: number[],
		activation: (value: number) => number,
		rng: RNG
	) {
		if (layers.length <= 1)
			throw new RangeError("there must be at least 2 layers");

		this.activation = activation;
		this.layers = Array(layers.length - 1);

		for (let i = 0; i < layers.length - 1; i++) {
			const input_neurons = layers[i];
			const output_neurons = layers[i + 1];

			this.layers[i] = new Layer(input_neurons, output_neurons, rng);
		}
	}

	propagate(inputs: number[]) {
		if (inputs.length !== this.layers[0].neurons[0].weights.length)
			throw new RangeError(
				"input length must be equal to tye amount of input neurons"
			);

		return this.layers.reduce(
			(inputs, layer) => layer.propagate(inputs, this.activation),
			inputs
		);
	}
}
