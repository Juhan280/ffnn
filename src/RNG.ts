import sr from "seedrandom";

export const rng = {
	algorithm: sr.alea,
	seed: "0.19a3bbbe7f1e2",
	generate(min: number, max: number) {
		const value = this.algorithm(this.seed)() * (max - min) + min;
		this.seed = value.toString(16);
		return value;
	},
};
