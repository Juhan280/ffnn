import { RNG } from "../RNG";

export class Neuron {
	bias: number;
	weights: number[];

	constructor(inputs_size: number, rng: RNG) {
		this.bias = rng.generate(-1, 1);
		this.weights = Array.from({ length: inputs_size }, () =>
			rng.generate(-1, 1)
		);
	}

	propagate(inputs: number[], activation: (value: number) => number) {
		const value = inputs.reduce(
			(acc, cur, i) => acc + cur * this.weights[i],
			this.bias
		);
		return activation(value);
	}
}
