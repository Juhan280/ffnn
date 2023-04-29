import { describe, expect, test } from "vitest";
import { getAngleBetweenNormalAndFood } from "./utils.js";
import { Food } from "./simulation/Food.js";
import { Vector2 } from "./types.js";

describe("getAngleBetweenNormalAndFood", () => {
	test("food is in the same direction of the rotation", () => {
		const animal = {
			position: [0.1, 0.1] satisfies Vector2,
			rotation: Math.PI * (1 / 4),
		};

		const food = new Food([0.5, 0.5]);

		const angle = getAngleBetweenNormalAndFood(
			animal.position,
			animal.rotation,
			food
		);

		expect(angle).toBeCloseTo(0);
	});

	test("food is right side of the current rotation", () => {
		const animal = {
			position: [0.1, 0.1] satisfies Vector2,
			rotation: Math.PI * (1 / 4),
		};

		const food = new Food([0.5, 0.4]);

		const angle = getAngleBetweenNormalAndFood(
			animal.position,
			animal.rotation,
			food
		);

		expect(angle).toBeCloseTo(-0.14486232792);
	});

	test("food is left side of the current rotation", () => {
		const animal = {
			position: [0.1, 0.1] satisfies Vector2,
			rotation: Math.PI * (1 / 4),
		};

		const food = new Food([0.4, 0.5]);

		const angle = getAngleBetweenNormalAndFood(
			animal.position,
			animal.rotation,
			food
		);

		expect(angle).toBeCloseTo(+0.14486232792);
	});
});
