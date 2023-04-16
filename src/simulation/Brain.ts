import { Chromosome } from "../genetic-algorithm/index.js";
import { Network } from "../neural-network/Network.js";
import { RNG } from "../RNG.js";
import { ActivationFunction } from "../types.js";
import { clamp } from "../utils.js";
import { Config } from "./Config.js";

export class Brain {
	readonly linear_accel: number;
	readonly angular_accel: number;

	private constructor(config: Config, public readonly network: Network) {
		this.linear_accel = config.sim_linear_accel;
		this.angular_accel = config.sim_angular_accel;
	}

	propagate(vision: readonly number[]): [speed: number, rotation: number] {
		const [r0, r1] = this.network
			.propagate(vision)
			.map(r => clamp(r, 0, 1) - 1);

		// idk what they do, so i am jusy commenting them out for now.
		// const speed = clamp(r0 + r1, -this.linear_accel, this.linear_accel);
		// const rotation = clamp(r0 + r1, -this.angular_accel, this.angular_accel);

		const speed = clamp(r0, -this.linear_accel, this.linear_accel);
		const rotation = clamp(r1, -this.angular_accel, this.angular_accel);

		return [speed, rotation];
	}

	chromosome() {
		return new Chromosome(this.network.weights());
	}

	static random(config: Config, activation: ActivationFunction, rng: RNG) {
		return new Brain(
			config,
			Network.random(Brain.topology(config), activation, rng)
		);
	}

	static fromChromosome(
		config: Config,
		chromosome: Chromosome,
		activation: ActivationFunction
	) {
		return new Brain(
			config,
			Network.fromWeights(Brain.topology(config), activation, chromosome)
		);
	}

	private static topology(config: Config): [number, number, 2] {
		return [config.eye_cells, config.brain_neurons, 2];
	}
}
