import sr from "seedrandom";

export type RNG = {
	/**
	 * @param min Minimum value it can generate (inclusive)
	 * @param max Maximum value it can generate (exclusive)
	 */
	generate(min: number, max: number): number;
};

export const rng = {
	algorithm: sr.alea,
	seed: "0.19a3bbbe7f1e2",
	generate(min: number, max: number) {
		const value = this.algorithm(this.seed)() * (max - min) + min;
		this.seed = value.toString(16);
		return value;
	},
};
