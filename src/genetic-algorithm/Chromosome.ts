export class Chromosome {
	private genes: Float32Array;

	constructor(genes: Iterable<number>) {
		this.genes = new Float32Array(genes);
	}

	get length() {
		return this.genes.length;
	}

	*[Symbol.iterator]() {
		for (const gene of this.genes) yield gene;
	}

	*iter_mut(): Generator<[number, (gene: number) => void]> {
		for (let i = 0; i < this.genes.length; i++) {
			const gene = this.genes[i];
			const setGene = (gene: number) => void (this.genes[i] = gene);
			yield [gene, setGene];
		}
	}

	at(index: number) {
		return this.genes.at(index);
	}

	map(callbackfn: (gene: number, index: number) => number) {
		return this.genes.map((gene, index) => callbackfn(gene, index));
	}
}
