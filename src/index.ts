import { World } from "./simulation/World.js";
import { Simulation } from "./simulation/index.js";
import { config } from "./config.js";
import { RNG } from "./types.js";
import { activation } from "./utils.js";
import { Food } from "./simulation/Food.js";
import { Animal } from "./simulation/Animal.js";

const WORLD_SIZE = 300;
const PIXEL_RATIO = window.devicePixelRatio || 1;

/* ---------- */

const p = document.querySelector("#stats") as HTMLParagraphElement;
const canvas = document.querySelector("#world") as HTMLCanvasElement;

canvas.width = WORLD_SIZE * PIXEL_RATIO;
canvas.height = WORLD_SIZE * PIXEL_RATIO;
canvas.style.width = WORLD_SIZE + "px";
canvas.style.height = WORLD_SIZE + "px";

const ctx = canvas.getContext("2d")!;

const rng: RNG = {
	generate(min, max) {
		return Math.random() * (max - min) + min;
	},
};

const food = new Food([0.14, 0.14]);
const animal = Animal.random(config, activation, rng);
animal.position = [0.27, 0.27];
animal.rotation = -Math.PI / 2;

const world = new World([animal], [food]);
const simulation = new Simulation(config, world, 0, 0);

/* ---------- */

// console.log(simulation);

async function loop() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = "green";
	for (const food of world.foods) {
		ctx.beginPath();
		ctx.arc(
			food.position[0] * canvas.width,
			food.position[1] * canvas.height,
			config.food_size * WORLD_SIZE,
			0,
			Math.PI * 2
		);
		ctx.fill();
	}

	const radius = 10;
	for (const animal of world.animals) {
		let [x, y] = animal.position;
		const { rotation } = animal;

		x *= canvas.width;
		y *= canvas.height;

		ctx.fillStyle = "blue";
		ctx.beginPath();
		ctx.moveTo(
			x + Math.cos(rotation + (5 / 6) * Math.PI) * radius,
			y + Math.sin(rotation + (5 / 6) * Math.PI) * radius
		);
		ctx.lineTo(
			x + Math.cos(rotation) * radius,
			y + Math.sin(rotation) * radius
		);
		ctx.lineTo(
			x + Math.cos(rotation - (5 / 6) * Math.PI) * radius,
			y + Math.sin(rotation - (5 / 6) * Math.PI) * radius
		);
		ctx.closePath();
		ctx.fill();

		ctx.fillStyle = "rgba(100, 100, 100, 0.1)";
		ctx.arc(
			x,
			y,
			config.eye_fov_range * canvas.width,
			rotation + config.eye_fov_angle / 2 + Math.PI,
			rotation - config.eye_fov_angle / 2 + Math.PI
		);
		ctx.fill();
	}

	const stats = simulation.step(rng);
	if (stats) p.innerText = stats.toString();
	// await new Promise(r => setTimeout(r, 300));
	window.requestAnimationFrame(loop);
}

loop();
