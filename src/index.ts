import { World } from "./simulation/World.js";
import { Simulation } from "./simulation/index.js";
import { config } from "./config.js";
import { RNG } from "./types.js";
import { activation } from "./utils.js";
import { Food } from "./simulation/Food.js";
import { Animal } from "./simulation/Animal.js";
import { Renderer } from "./Renderer.js";

/* ---------- */

const p = document.querySelector("#stats") as HTMLParagraphElement;
const canvas = document.querySelector("#world") as HTMLCanvasElement;

const rng: RNG = {
	generate(min, max) {
		return Math.random() * (max - min) + min;
	},
};

/*
const food = new Food([0.27, 0.2]);
const animal = Animal.random(config, activation, rng);
animal.position = [0.27, 0.27];
animal.rotation = +Math.PI / 2;
const world = new World([animal], [food]);
*/

const world = World.random(config, activation, rng);
const simulation = new Simulation(config, world, 0, 0);
const renderer = new Renderer(canvas, 300, simulation, config);

/* ---------- */

// console.log(simulation);

function loop() {
	simulation.step(rng);
	simulation.step(rng);

	const stats = simulation.step(rng);
	renderer.render();
	if (stats) p.innerText = stats.toString();
	// await new Promise(r => setTimeout(r, 300));
	// window.requestAnimationFrame(loop);
}

loop();
// setTimeout(loop, 0);
