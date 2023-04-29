import { Food } from "./simulation/Food.js";
import { Vector2 } from "./types.js";

export function clamp(value: number, min: number, max: number) {
	return Math.max(Math.min(value, max), min);
}

export function activation(value: number) {
	// sigmoid function
	return 1 / (1 + Math.E ** -value);

  // ReLU
	// return Math.max(value, 0);
}

export function getAngleBetweenNormalAndFood(position: Vector2, rotation: number, food: Food) {
	const [aX, aY] = position;
	const [fX, fY] = food.position;

	return Math.atan((fY - aY)/ (fX - aX)) - rotation;
}
