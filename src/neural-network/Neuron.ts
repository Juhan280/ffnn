import { RNG } from "../types.js";

export class Neuron {
	private constructor(
		readonly bias: number,
		readonly weights: Readonly<Float32Array>
	) {}

	propagate(inputs: readonly number[], activation: (value: number) => number) {
		const value = inputs.reduce(
			(acc, cur, i) => acc + cur * this.weights[i],
			this.bias
		);
		return activation(value);
	}

	static random(inputs_size: number, rng: RNG) {
		const bias = rng.generate(-1, 1);

		const weights = Float32Array.from({ length: inputs_size }, () =>
			rng.generate(-1, 1)
		);

		return new Neuron(bias, weights);
	}

	static fromWeights(inputs_size: number, weightsIter: Iterator<number>) {
		const { value: bias, done } = weightsIter.next();
		if (done) throw new Error("not enough weights");

		const weights = Float32Array.from({ length: inputs_size }, () => {
			const { value: weight, done } = weightsIter.next();
			if (done) throw new Error("not enough weights");
			return weight;
		});

		return new Neuron(bias, weights);
	}
}
