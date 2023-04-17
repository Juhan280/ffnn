import * as ga from "../genetic-algorithm/index.js";

export class Statistics {
	constructor(
		readonly generation: number,
		readonly geneticAlgorithm: ga.Statistics
	) {}

	toString() {
		return (
			`generation: ${this.generation}\n` +
			`min[${this.geneticAlgorithm.min_fitness.toFixed(
				2
			)}] max[${this.geneticAlgorithm.min_fitness.toFixed(
				2
			)}] avg[${this.geneticAlgorithm.avg_fitness.toFixed(
				2
			)}] median[${this.geneticAlgorithm.median_fitness.toFixed(2)}]`
		);
	}
}
