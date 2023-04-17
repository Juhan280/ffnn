import * as ga from "../genetic-algorithm/index.js";

export class Statistics {
	constructor(
		readonly generation: number,
		readonly geneticAlgorithm: ga.Statistics
	) {}
}
