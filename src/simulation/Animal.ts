import { Chromosome } from "../genetic-algorithm/index.js";
import { ActivationFunction, RNG, Vector2 } from "../types.js";
import { clamp } from "../utils.js";
import { Brain } from "./Brain.js";
import { Config } from "./Config.js";
import { Eye } from "./Eye.js";
import { Food } from "./Food.js";

export class Animal {
	position: Vector2<true>;
	rotation: number;
	vision: readonly number[];
	#speed: number;
	readonly eye: Eye;
	satiation: number;

	private constructor(config: Config, readonly brain: Brain, rng: RNG) {
		this.position = [rng.generate(0, 1), rng.generate(0, 1)];
		this.rotation = rng.generate(-Math.PI, Math.PI);
		this.vision = Array(config.eye_cells).fill(0);
		this.#speed = rng.generate(0, config.sim_speed_max); // XXX: need to look into that later
		this.eye = new Eye(config.eye_fov_range, config.eye_fov_angle, config.eye_cells);
		this.satiation = 0;
	}

	get speed() {
		return this.#speed;
	}

	chromosome() {
		return this.brain.chromosome();
	}

	processBrain(config: Config, foods: readonly Food[]) {
		this.vision = this.eye.processVision(this.position, this.rotation, foods);

		const [speed, rotation] = this.brain.propagate(this.vision);

		this.#speed = clamp(
			this.#speed + speed,
			config.sim_speed_min,
			config.sim_speed_max
		);

		this.rotation += 0.1 //rotation;

		// if (Math.abs(this.rotation) > Math.PI)
		//	this.rotation = (this.rotation % Math.PI) * -1;
	}

	processMovement() {
		const time = 1;
		// i am not sure if it will work as expected
		this.position[0] += this.speed * Math.cos(this.rotation) * time;
		this.position[1] += this.speed * Math.sin(this.rotation) * time;

		this.position[0] = clamp(this.position[0], 0, 1);
		this.position[1] = clamp(this.position[1], 0, 1);
	}

	static random(config: Config, activation: ActivationFunction, rng: RNG) {
		const brain = Brain.random(config, activation, rng);
		return new Animal(config, brain, rng);
	}

	static fromChromosome(
		config: Config,
		chromosome: Chromosome,
		activation: ActivationFunction,
		rng: RNG
	) {
		const brain = Brain.fromChromosome(config, chromosome, activation);
		return new Animal(config, brain, rng);
	}
}
