export type RNG = {
	/**
	 * @param min Minimum value it can generate
	 * @param max Maximum value it can generate
	 */
	generate(min: number, max: number): number;
};
