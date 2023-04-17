import { RNG } from "../types.js";

export class Neuron {
	#weights: number[];
	#size: number;

	private constructor(private bias: number, weights: number[]) {
		this.#weights = weights;
		this.#size = weights.length;
	}

	get size() {
		return this.#size;
	}

	*weights() {
		yield this.bias;
		for (const weight of this.#weights) {
			yield weight;
		}
	}

	static random(inputs_size: number, rng: RNG) {
		const bias = rng.generate(-1, 1);
		const weights = Array.from({ length: inputs_size }, () =>
			rng.generate(-1, 1)
		);

		return new Neuron(bias, weights);
	}

	static fromWeights(inputs_size: number, weightsIter: Iterator<number>) {
		const { value: bias, done } = weightsIter.next();
		if (done) throw new Error("not enough weights");

		const weights = Array.from({ length: inputs_size }, () => {
			const { value: weight, done } = weightsIter.next();
			if (done) throw new Error("not enough weights");
			return weight;
		});

		return new Neuron(bias, weights);
	}

	propagate(inputs: readonly number[], activation: (value: number) => number) {
		const value = inputs.reduce(
			(acc, cur, i) => acc + cur * this.#weights[i],
			this.bias
		);
		return activation(value);
	}
}
