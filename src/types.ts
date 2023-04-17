export type RNG = {
	/**
	 * @param min Minimum value it can generate (inclusive)
	 * @param max Maximum value it can generate (exclusive)
	 */
	generate(min: number, max: number): number;
};

export type Vector2<mut extends boolean = false> = mut extends true
	? [x: number, y: number]
	: readonly [x: number, y: number];

export type ActivationFunction = (value: number) => number;
