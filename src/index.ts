import { World } from "./simulation/World.js";
import { Simulation } from "./simulation/index.js";
import { config } from "./config.js";
import { RNG } from "./types.js";
import { activation } from "./utils.js";

const p = document.querySelector("#text") as HTMLParagraphElement;
const canvas = document.querySelector("#world") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

ctx.fillStyle = "red";
ctx.fillRect(0, 0, canvas.width, canvas.height);

const rng: RNG = {
	generate(min, max) {
		return Math.random() * (max - min) + min;
	},
};

const world = World.random(config, activation, rng);

const simulation = new Simulation(config, world, 0, 0);

console.log(rng.generate(0, 1));
//console.log(simulation.train(rng));
console.log(simulation);

function write(text: string) {
	p.innerText += "\n" + text;
}
