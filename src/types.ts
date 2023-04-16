export type Vector2<mut extends boolean = false> = mut extends true
	? [x: number, y: number]
	: readonly [x: number, y: number];

export type ActivationFunction = (value: number) => number;
