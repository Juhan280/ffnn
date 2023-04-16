export interface Config {
	brain_neurons: number;

	eye_fov_range: number;
	eye_fov_angle: number;
	eye_cells: number;

	food_size: number;

	ga_reverse: number;
	ga_mut_chance: number;
	ga_mut_coeff: number;

	sim_speed_min: number;
	sim_speed_max: number;
	sim_linear_accel: number;
	sim_angular_accel: number;
	sim_generation_length: number;

	world_animals: number;
	world_foods: number;
}
