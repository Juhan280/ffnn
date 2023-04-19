import { Config } from "./simulation/Config.js";

export const config: Config = {
	brain_neurons: 9,

	eye_fov_range: 0.25,
	eye_fov_angle: Math.PI * 0.75,
	eye_cells: 9,

	food_size: 0.01,

	ga_reverse: 0,
	ga_mut_chance: 0.01,
	ga_mut_coeff: 0.3,

	sim_speed_min: 0.001,
	sim_speed_max: 0.005,
	sim_linear_accel: 0.2,
	sim_angular_accel: Math.PI / 2,
	sim_generation_length: 1000,

	world_animals: 10,
	world_foods: 100,
};
