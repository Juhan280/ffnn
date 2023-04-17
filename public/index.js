// src/utils.ts
function clamp(value, min, max) {
  return Math.max(Math.min(value, max), min);
}
function activation(value) {
  return Math.max(value, 0);
}

// src/genetic-algorithm/Agent.ts
var Agent = class {
};

// src/genetic-algorithm/Chromosome.ts
var Chromosome = class {
  #genes;
  constructor(genes) {
    this.#genes = [...genes];
  }
  get length() {
    return this.#genes.length;
  }
  *[Symbol.iterator]() {
    for (const gene of this.#genes)
      yield gene;
  }
  *iter_mut() {
    for (let i = 0; i < this.#genes.length; i++) {
      const gene = this.#genes[i];
      const setGene = (gene2) => void (this.#genes[i] = gene2);
      yield [gene, setGene];
    }
  }
  at(index) {
    return this.#genes.at(index);
  }
  map(callbackfn) {
    return this.#genes.map(callbackfn);
  }
  static from(iterable) {
    return new this(Array.from(iterable));
  }
};

// src/genetic-algorithm/GaussianMutation.ts
var GaussianMutation = class {
  /**
   * Probability of changing the gene.
   * - 0.0 = no genes will be touched
   * - 1.0 = all genes will be touched
   **/
  chance;
  /**
   * Magnetude of the change
   * - 0.0 = touched geens will not be modified
   * - 3.0 = touched gene wipp be += or -= by at most 3.0
   */
  coeff;
  constructor(change, coeff) {
    this.chance = change;
    this.coeff = coeff;
  }
  mutate(child, rng2) {
    for (const [gene, setGene] of child.iter_mut()) {
      const sign = rng2.generate(0, 1) < 0.5 ? 1 : -1;
      if (rng2.generate(0, 1) < this.chance)
        setGene(gene + sign * rng2.generate(0, this.coeff));
    }
  }
};

// src/genetic-algorithm/Statistics.ts
var Statistics = class {
  max_fitness;
  min_fitness;
  avg_fitness;
  median_fitness;
  constructor(population) {
    if (!population.length)
      throw new Error("expected at least 1 Agent");
    const { length } = population;
    const fitnesses = population.map((agent) => agent.fitness).sort((a, b) => a - b);
    this.min_fitness = fitnesses[0];
    this.max_fitness = fitnesses[length - 1];
    this.avg_fitness = fitnesses.reduce((acc, cur) => acc + cur) / length;
    if (length % 2) {
      this.median_fitness = fitnesses[(length + 1) / 2];
    } else {
      this.median_fitness = (fitnesses[length / 2 - 1] - fitnesses[length / 2]) / 2;
    }
  }
};

// src/genetic-algorithm/GeneticAlgorithm.ts
var GeneticAlgorithm = class {
  constructor(selectionMethod, crossoverMethod, mutationMethod) {
    this.selectionMethod = selectionMethod;
    this.crossoverMethod = crossoverMethod;
    this.mutationMethod = mutationMethod;
  }
  evolve(createAgent, population, rng2) {
    if (!population.length)
      throw new Error("expected at least 1 Agent");
    const agents = population.map(() => {
      const parent_a = this.selectionMethod.select(population, rng2).chromosome();
      const parent_b = this.selectionMethod.select(population, rng2).chromosome();
      const child = this.crossoverMethod.crossover(parent_a, parent_b, rng2);
      this.mutationMethod.mutate(child, rng2);
      return createAgent(child);
    });
    return [agents, new Statistics(population)];
  }
};

// src/genetic-algorithm/RouletteWheelSelection.ts
var RouletteWheelSelection = class {
  select(population, rng2) {
    const totalFitness = population.reduce(
      (acc, agent) => acc + agent.fitness,
      0
    );
    const selected = rng2.generate(0, totalFitness);
    let current = 0;
    for (const agent of population)
      if ((current += agent.fitness) > selected)
        return agent;
    return population.at(-1);
  }
};

// src/genetic-algorithm/UniformCrossover.ts
var UniformCrossover = class {
  crossover(chromosome_a, chromosome_b, rng2) {
    if (chromosome_a.length !== chromosome_b.length)
      throw new Error("both parent must have equal number of genes");
    const genes = chromosome_a.map((gene_a, i) => {
      if (rng2.generate(0, 0.5) < 0.5)
        return gene_a;
      else
        return chromosome_b.at(i);
    });
    return new Chromosome(genes);
  }
};

// src/neural-network/Neuron.ts
var Neuron = class {
  constructor(bias, weights) {
    this.bias = bias;
    this.#weights = weights;
    this.#size = weights.length;
  }
  #weights;
  #size;
  get size() {
    return this.#size;
  }
  *weights() {
    yield this.bias;
    for (const weight of this.#weights) {
      yield weight;
    }
  }
  static random(inputs_size, rng2) {
    const bias = rng2.generate(-1, 1);
    const weights = Array.from(
      { length: inputs_size },
      () => rng2.generate(-1, 1)
    );
    return new Neuron(bias, weights);
  }
  static fromWeights(inputs_size, weightsIter) {
    const { value: bias, done } = weightsIter.next();
    if (done)
      throw new Error("not enough weights");
    const weights = Array.from({ length: inputs_size }, () => {
      const { value: weight, done: done2 } = weightsIter.next();
      if (done2)
        throw new Error("not enough weights");
      return weight;
    });
    return new Neuron(bias, weights);
  }
  propagate(inputs, activation2) {
    const value = inputs.reduce(
      (acc, cur, i) => acc + cur * this.#weights[i],
      this.bias
    );
    return activation2(value);
  }
};

// src/neural-network/Layer.ts
var Layer = class {
  #neurons;
  #inputSize;
  constructor(neurons, inputSize) {
    this.#neurons = neurons;
    this.#inputSize = inputSize;
  }
  get inputSize() {
    return this.#inputSize;
  }
  *neurons() {
    for (const neuron of this.#neurons) {
      const iterator = neuron.weights();
      let { value, done } = iterator.next();
      while (!done) {
        yield value;
        ({ value, done } = iterator.next());
      }
    }
  }
  static random(input_neurons, output_neurons, rng2) {
    const neurons = Array.from(
      { length: output_neurons },
      () => Neuron.random(input_neurons, rng2)
    );
    return new Layer(neurons, input_neurons);
  }
  static fromWeights(input_neurons, output_neurons, weightsIter) {
    const neurons = Array.from(
      { length: output_neurons },
      () => Neuron.fromWeights(input_neurons, weightsIter)
    );
    return new Layer(neurons, input_neurons);
  }
  propagate(inputs, activation2) {
    return this.#neurons.map((neuron) => neuron.propagate(inputs, activation2));
  }
};

// src/neural-network/Network.ts
var Network = class {
  constructor(layers, activation2) {
    this.layers = layers;
    this.activation = activation2;
  }
  *weights() {
    for (const layer of this.layers) {
      const iterator = layer.neurons();
      let { value, done } = iterator.next();
      while (!done) {
        yield value;
        ({ value, done } = iterator.next());
      }
    }
  }
  static random(neuronCounts, activation2, rng2) {
    if (neuronCounts.length <= 1)
      throw new RangeError("there must be at least 2 layers");
    const layers = Array(neuronCounts.length - 1);
    for (let i = 0; i < neuronCounts.length - 1; i++) {
      const input_neurons = neuronCounts[i];
      const output_neurons = neuronCounts[i + 1];
      layers[i] = Layer.random(input_neurons, output_neurons, rng2);
    }
    return new Network(layers, activation2);
  }
  static fromWeights(neuronCounts, activation2, weights) {
    if (neuronCounts.length <= 1)
      throw new RangeError("there must be at least 2 layers");
    const weightsIter = weights[Symbol.iterator]();
    const layers = Array(neuronCounts.length - 1);
    for (let i = 0; i < neuronCounts.length - 1; i++) {
      const input_neurons = neuronCounts[i];
      const output_neurons = neuronCounts[i + 1];
      layers[i] = Layer.fromWeights(input_neurons, output_neurons, weightsIter);
    }
    return new Network(layers, activation2);
  }
  propagate(inputs) {
    if (inputs.length !== this.layers[0].inputSize)
      throw new RangeError(
        "input length must be equal to tye amount of input neurons"
      );
    return this.layers.reduce(
      (inputs2, layer) => layer.propagate(inputs2, this.activation),
      inputs
    );
  }
};

// src/simulation/Brain.ts
var Brain = class {
  constructor(config2, network) {
    this.network = network;
    this.linear_accel = config2.sim_linear_accel;
    this.angular_accel = config2.sim_angular_accel;
  }
  linear_accel;
  angular_accel;
  propagate(vision) {
    const [r0, r1] = this.network.propagate(vision).map((r) => clamp(r, 0, 1) - 1);
    const speed = r0 + r1;
    const rotation = r0 - r1;
    this.linear_accel = speed;
    this.angular_accel += rotation;
    return [speed, rotation];
  }
  chromosome() {
    return new Chromosome(this.network.weights());
  }
  static random(config2, activation2, rng2) {
    return new Brain(
      config2,
      Network.random(Brain.topology(config2), activation2, rng2)
    );
  }
  static fromChromosome(config2, chromosome, activation2) {
    return new Brain(
      config2,
      Network.fromWeights(Brain.topology(config2), activation2, chromosome)
    );
  }
  static topology(config2) {
    return [config2.eye_cells, config2.brain_neurons, 2];
  }
};

// src/simulation/Eye.ts
var Eye = class {
  fov_range;
  fov_angle;
  cells;
  constructor(config2) {
    if (config2.eye_fov_range <= 0)
      throw new Error("fov range must be positive");
    if (config2.eye_fov_angle <= 0)
      throw new Error("fov angle must be positive");
    if (config2.eye_cells <= 0)
      throw new Error("number of eye cells must be positive");
    this.fov_range = config2.eye_fov_range;
    this.fov_angle = config2.eye_fov_angle;
    this.cells = config2.eye_cells;
  }
  processVision(position, rotation, foods) {
    const cells = Array(this.cells).fill(0);
    const [x, y] = position;
    for (const food2 of foods) {
      const distance = Math.hypot(x - food2.position[0], y - food2.position[1]);
      if (distance > this.fov_range)
        continue;
      const angle = rotation - Math.acos(x / Math.hypot(x, y));
      if (Math.abs(angle) > this.fov_angle / 2)
        continue;
      const cell = Math.min(
        Math.floor(
          (angle + this.fov_angle / 2) / this.fov_angle * this.cells
        ),
        this.cells - 1
      );
      cells[cell] = (this.fov_range - distance) / this.fov_range;
    }
    return cells;
  }
};

// src/simulation/Animal.ts
var Animal = class {
  constructor(config2, brain, rng2) {
    this.brain = brain;
    this.#position = [rng2.generate(0, 1), rng2.generate(0, 1)];
    this.#rotation = rng2.generate(-Math.PI, Math.PI);
    this.#vision = Array(config2.eye_cells).fill(0);
    this.#speed = rng2.generate(0, config2.sim_speed_max);
    this.eye = new Eye(config2);
    this.satiation = 0;
  }
  #position;
  #rotation;
  #vision;
  #speed;
  eye;
  satiation;
  get position() {
    return this.#position;
  }
  set position(value) {
    this.#position = value;
  }
  get rotation() {
    return this.#rotation;
  }
  set rotation(value) {
    this.#rotation = value;
  }
  get vision() {
    return this.#vision;
  }
  get speed() {
    return this.#speed;
  }
  chromosome() {
    return this.brain.chromosome();
  }
  processBrain(config2, foods) {
    this.#vision = this.eye.processVision(
      this.#position,
      this.#rotation,
      foods
    );
    const [speed, rotation] = this.brain.propagate(this.#vision);
    this.#speed = clamp(
      this.#speed + speed,
      config2.sim_speed_min,
      config2.sim_speed_max
    );
    this.#rotation += rotation;
  }
  processMovement() {
    const time = 1;
    this.#position[0] += this.speed * Math.cos(this.#rotation) * time;
    this.#position[1] += this.speed * Math.sin(this.#rotation) * time;
    this.#position[0] = clamp(this.#position[0], 0, 1);
    this.#position[1] = clamp(this.#position[1], 0, 1);
  }
  static random(config2, activation2, rng2) {
    const brain = Brain.random(config2, activation2, rng2);
    return new Animal(config2, brain, rng2);
  }
  static fromChromosome(config2, chromosome, activation2, rng2) {
    const brain = Brain.fromChromosome(config2, chromosome, activation2);
    return new Animal(config2, brain, rng2);
  }
};

// src/simulation/Food.ts
var Food = class {
  constructor(position) {
    this.position = position;
  }
  static random(rng2) {
    return new Food([rng2.generate(0, 1), rng2.generate(0, 1)]);
  }
};

// src/simulation/World.ts
var World = class {
  constructor(animals, foods) {
    this.animals = animals;
    this.foods = foods;
  }
  static random(config2, activation2, rng2) {
    const animals = Array.from(
      { length: config2.world_animals },
      () => Animal.random(config2, activation2, rng2)
    );
    const foods = Array.from(
      { length: config2.world_foods },
      () => Food.random(rng2)
    );
    return new World(animals, foods);
  }
};

// src/simulation/Bird.ts
var Bird = class extends Agent {
  constructor(fitness, chromosome) {
    super();
    this.fitness = fitness;
    this.#chromosome = chromosome;
  }
  #chromosome;
  chromosome() {
    return this.#chromosome;
  }
  toAnimal(config2, activation2, rng2) {
    return Animal.fromChromosome(config2, this.#chromosome, activation2, rng2);
  }
  static create(chromosome) {
    return new Bird(0, chromosome);
  }
  static fromAnimal(animal2) {
    return new Bird(animal2.satiation, animal2.chromosome());
  }
};

// src/simulation/Statistics.ts
var Statistics2 = class {
  constructor(generation, geneticAlgorithm) {
    this.generation = generation;
    this.geneticAlgorithm = geneticAlgorithm;
  }
  toString() {
    return `generation: ${this.generation}
min[${this.geneticAlgorithm.min_fitness.toFixed(
      2
    )}] max[${this.geneticAlgorithm.min_fitness.toFixed(
      2
    )}] avg[${this.geneticAlgorithm.avg_fitness.toFixed(
      2
    )}] median[${this.geneticAlgorithm.median_fitness.toFixed(2)}]`;
  }
};

// src/simulation/index.ts
var Simulation = class {
  constructor(config2, world2, age, generation) {
    this.config = config2;
    this.world = world2;
    this.age = age;
    this.generation = generation;
    this.generation = generation;
  }
  step(rng2) {
    this.processCollusion(rng2);
    this.processBrains();
    this.processMovements();
    return this.tryEvolving(rng2);
  }
  train(rng2) {
    while (true) {
      const statistics = this.step(rng2);
      if (statistics)
        return statistics;
    }
  }
  processCollusion(rng2) {
    for (const animal2 of this.world.animals) {
      for (const food2 of this.world.foods) {
        const distance = Math.hypot(
          animal2.position[0] - food2.position[0],
          animal2.position[1] - food2.position[1]
        );
        if (distance > 0.015)
          continue;
        animal2.satiation++;
        food2.position = [rng2.generate(0, 1), rng2.generate(0, 1)];
      }
    }
  }
  processBrains() {
    for (const animal2 of this.world.animals)
      animal2.processBrain(this.config, this.world.foods);
  }
  processMovements() {
    for (const animal2 of this.world.animals)
      animal2.processMovement();
  }
  tryEvolving(rng2) {
    if (++this.age > this.config.sim_generation_length)
      return this.evolve(rng2);
  }
  evolve(rng2) {
    this.age = 0;
    this.generation++;
    const agents = this.world.animals.map(Bird.fromAnimal);
    if (this.config.ga_reverse === 1) {
      const max_satiation = this.world.animals.reduce(
        (prev, cur) => prev.satiation > cur.satiation ? prev : cur
      ).satiation;
      for (const agent of agents) {
        agent.fitness = max_satiation - agent.fitness;
      }
    }
    const geneticAlgorithm = new GeneticAlgorithm(
      new RouletteWheelSelection(),
      new UniformCrossover(),
      new GaussianMutation(0.01, 0.3)
    );
    const [birds, statistics] = geneticAlgorithm.evolve(
      Bird.create,
      agents,
      rng2
    );
    this.world.animals = birds.map(
      (bird) => bird.toAnimal(this.config, activation, rng2)
    );
    for (const food2 of this.world.foods)
      food2.position = [rng2.generate(0, 1), rng2.generate(0, 1)];
    return new Statistics2(this.generation - 1, statistics);
  }
};

// src/config.ts
var config = {
  brain_neurons: 9,
  eye_fov_range: 0.25,
  eye_fov_angle: Math.PI * 1.25,
  eye_cells: 9,
  food_size: 0.01,
  ga_reverse: 0,
  ga_mut_chance: 0.01,
  ga_mut_coeff: 0.3,
  sim_speed_min: 1e-3,
  sim_speed_max: 5e-3,
  sim_linear_accel: 0.2,
  sim_angular_accel: Math.PI / 2,
  sim_generation_length: 1e3,
  world_animals: 5,
  world_foods: 10
};

// src/index.ts
var WORLD_SIZE = 300;
var PIXEL_RATIO = window.devicePixelRatio || 1;
var p = document.querySelector("#stats");
var canvas = document.querySelector("#world");
canvas.width = WORLD_SIZE * PIXEL_RATIO;
canvas.height = WORLD_SIZE * PIXEL_RATIO;
canvas.style.width = WORLD_SIZE + "px";
canvas.style.height = WORLD_SIZE + "px";
var ctx = canvas.getContext("2d");
var rng = {
  generate(min, max) {
    return Math.random() * (max - min) + min;
  }
};
var food = new Food([0.14, 0.14]);
var animal = Animal.random(config, activation, rng);
animal.position = [0.27, 0.27];
animal.rotation = -Math.PI / 2;
var world = new World([animal], [food]);
var simulation = new Simulation(config, world, 0, 0);
async function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "green";
  for (const food2 of world.foods) {
    ctx.beginPath();
    ctx.arc(
      food2.position[0] * canvas.width,
      food2.position[1] * canvas.height,
      config.food_size * WORLD_SIZE,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  const radius = 10;
  for (const animal2 of world.animals) {
    let [x, y] = animal2.position;
    const { rotation } = animal2;
    x *= canvas.width;
    y *= canvas.height;
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(rotation + 5 / 6 * Math.PI) * radius,
      y + Math.sin(rotation + 5 / 6 * Math.PI) * radius
    );
    ctx.lineTo(
      x + Math.cos(rotation) * radius,
      y + Math.sin(rotation) * radius
    );
    ctx.lineTo(
      x + Math.cos(rotation - 5 / 6 * Math.PI) * radius,
      y + Math.sin(rotation - 5 / 6 * Math.PI) * radius
    );
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(100, 100, 100, 0.1)";
    ctx.arc(
      x,
      y,
      config.eye_fov_range * canvas.width,
      rotation + config.eye_fov_angle / 2 + Math.PI,
      rotation - config.eye_fov_angle / 2 + Math.PI
    );
    ctx.fill();
  }
  const stats = simulation.step(rng);
  if (stats)
    p.innerText = stats.toString();
  window.requestAnimationFrame(loop);
}
loop();
