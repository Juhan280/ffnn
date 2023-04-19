export function clamp(value: number, min: number, max: number) {
	return Math.max(Math.min(value, max), min);
}

export function activation(value: number) {
	// sigmoid function
	return 1 / (1 + Math.E ** -value);
	// return Math.max(value, 0);
}
