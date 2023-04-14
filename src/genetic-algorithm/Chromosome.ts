export class Chromosome {
	constructor(private genes: number[]) {}

	get length() {
		return this.genes.length;
	}

	*[Symbol.iterator]() {
		for (const gene of this.genes) {
			yield gene;
		}
	}

	*iter_mut(): Generator<readonly [number, (gene: number) => void]> {
		for (let i = 0; i < this.genes.length; i++) {
			const gene = this.genes[i];
			const setGene = (gene: number) => void (this.genes[i] = gene);
			yield [gene, setGene];
		}
	}

	at(index: number) {
		return this.genes.at(index);
	}

	map<R>(callbackfn: (gene: number, index: number) => R) {
		return this.genes.map(callbackfn);
	}

	static from(iterable: Iterable<number>) {
		return new this(Array.from(iterable));
	}
}
