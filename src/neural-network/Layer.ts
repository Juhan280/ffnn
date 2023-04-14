import { RNG } from "../RNG.js";
import { Neuron } from "./Neuron.js";

export class Layer {
	neurons: Neuron[];

	constructor(input_neurons: number, output_neurons: number, rng: RNG) {
		this.neurons = Array.from(
			{ length: output_neurons },
			() => new Neuron(input_neurons, rng)
		);
	}

	propagate(inputs: number[], activation: (value: number) => number) {
		return this.neurons.map(neuron => neuron.propagate(inputs, activation));
	}
}
