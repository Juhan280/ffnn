import { Animal } from "./simulation/Animal.js";
import { Config } from "./simulation/Config.js";
import { Food } from "./simulation/Food.js";
import { Simulation } from "./simulation/index.js";

export class Renderer {
	WORLD_SIZE: number;
	private ctx: CanvasRenderingContext2D;

	constructor(
		public canvas: HTMLCanvasElement,
		size: number,
		public simulation: Simulation,
		public config: Config
	) {
		canvas.style.width = size + "px";
		canvas.style.height = size + "px";

		this.WORLD_SIZE = size * window.devicePixelRatio;
		canvas.width = this.WORLD_SIZE;
		canvas.height = this.WORLD_SIZE;

		this.ctx = canvas.getContext("2d")!;
	}

	drawFood(food: Food, style: string | CanvasGradient | CanvasPattern) {
		const [x, y] = food.position.map(v => v * this.WORLD_SIZE);

		this.ctx.fillStyle = style;
		this.ctx.beginPath();
		this.ctx.arc(x, y, this.config.food_size * this.WORLD_SIZE, 0, Math.PI * 2);
		this.ctx.fill();
	}

	drawAnimal(
		animal: Animal,
		radius: number,
		style: string | CanvasGradient | CanvasPattern
	) {
		const [x, y] = animal.position.map(v => v * this.WORLD_SIZE);
		const { rotation } = animal;

		this.drawAnimalVision(animal);

		this.ctx.fillStyle = style;
		this.ctx.beginPath();
		this.ctx.moveTo(
			x + Math.cos(rotation + (5 / 6) * Math.PI) * radius,
			y + Math.sin(rotation + (5 / 6) * Math.PI) * radius
		);
		this.ctx.lineTo(
			x + Math.cos(rotation) * radius,
			y + Math.sin(rotation) * radius
		);
		this.ctx.lineTo(
			x + Math.cos(rotation - (5 / 6) * Math.PI) * radius,
			y + Math.sin(rotation - (5 / 6) * Math.PI) * radius
		);
		this.ctx.closePath();
		this.ctx.fill();

		// draw their center
		this.ctx.beginPath();
		this.ctx.fillStyle = "red";
		this.ctx.arc(x, y, 1, 0, Math.PI * 2);
		this.ctx.fill();
	}

	drawAnimalVision(animal: Animal) {
		const [x, y] = animal.position.map(v => v * this.WORLD_SIZE);
		const { eye, rotation, vision } = animal;

		for (let i = 0; i < eye.cells; i++) {
			this.ctx.fillStyle = `rgba(100, 100, 100, ${0.1 + vision[i] / 0.8})`;
			this.ctx.beginPath();
			this.ctx.moveTo(x, y);
			this.ctx.arc(
				x,
				y,
				animal.eye.fov.range * this.WORLD_SIZE,
				rotation - eye.fov.angle / 2 + (eye.fov.angle / eye.cells) * i,
				rotation - eye.fov.angle / 2 + (eye.fov.angle / eye.cells) * (i + 1)
			);
			this.ctx.fill();
		}
	}

	render() {
		this.ctx.clearRect(0, 0, this.WORLD_SIZE, this.WORLD_SIZE);

		for (const food of this.simulation.world.foods)
			this.drawFood(food, "green");

		for (const animal of this.simulation.world.animals)
			this.drawAnimal(animal, 10, "blue");
	}
}
