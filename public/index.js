// src/utils.ts
function clamp(value, min, max) {
  return Math.max(Math.min(value, max), min);
}
function activation(value) {
  return 1 / (1 + Math.E ** -value);
}
function getAngleBetweenNormalAndFood(position, rotation, food2) {
  const [aX, aY] = position;
  const [fX, fY] = food2.position;
  return Math.atan((fY - aY) / (fX - aX)) - rotation;
}

// src/genetic-algorithm/Agent.ts
var Agent = class {
};

// src/genetic-algorithm/Chromosome.ts
var Chromosome = class {
  genes;
  constructor(genes) {
    this.genes = new Float32Array(genes);
  }
  get length() {
    return this.genes.length;
  }
  *[Symbol.iterator]() {
    for (const gene of this.genes)
      yield gene;
  }
  *iter_mut() {
    for (let i = 0; i < this.genes.length; i++) {
      const gene = this.genes[i];
      const setGene = (gene2) => void (this.genes[i] = gene2);
      yield [gene, setGene];
    }
  }
  at(index) {
    return this.genes.at(index);
  }
  map(callbackfn) {
    return this.genes.map((gene, index) => callbackfn(gene, index));
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
  mutate(chromosome, rng2) {
    for (const [gene, setGene] of chromosome.iter_mut()) {
      const sign = rng2.generate(0, 1) < 0.5 ? 1 : -1;
      if (rng2.generate(0, 1) < this.chance)
        setGene(gene + sign * rng2.generate(0, this.coeff));
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
  evolve(createAgent, agents, rng2) {
    if (!agents.length)
      throw new Error("expected at least 1 Agent");
    const new_agents = agents.map(() => {
      const parent_a = this.selectionMethod.select(agents, rng2).chromosome();
      const parent_b = this.selectionMethod.select(agents, rng2).chromosome();
      const child = this.crossoverMethod.crossover(parent_a, parent_b, rng2);
      this.mutationMethod.mutate(child, rng2);
      return createAgent(child);
    });
    return new_agents;
  }
};

// src/genetic-algorithm/RouletteWheelSelection.ts
var RouletteWheelSelection = class {
  select(agents, rng2) {
    if (!agents.length)
      throw new Error("expected at least 1 agnet");
    const totalFitness = agents.reduce((acc, agent) => acc + agent.fitness, 0);
    const selected = rng2.generate(0, totalFitness);
    let current = 0;
    for (const agent of agents)
      if ((current += agent.fitness) > selected)
        return agent;
    return agents.at(-1);
  }
};

// src/genetic-algorithm/Statistics.ts
var Statistics = class {
  constructor(agents, generation) {
    this.generation = generation;
    if (!agents.length)
      throw new Error("expected at least 1 Agent");
    const { length } = agents;
    const fitnesses = agents.map((agent) => agent.fitness).sort((a, b) => a - b);
    this.min_fitness = fitnesses[0];
    this.max_fitness = fitnesses[length - 1];
    this.avg_fitness = fitnesses.reduce((acc, cur) => acc + cur) / length;
    if (length % 2) {
      this.median_fitness = fitnesses[(length + 1) / 2];
    } else {
      this.median_fitness = (fitnesses[length / 2 - 1] + fitnesses[length / 2]) / 2;
    }
  }
  max_fitness;
  min_fitness;
  avg_fitness;
  median_fitness;
  toString() {
    return `generation: ${this.generation}
min[${this.min_fitness.toFixed(2)}] max[${this.max_fitness.toFixed(
      2
    )}] avg[${this.avg_fitness.toFixed(
      2
    )}] median[${this.median_fitness.toFixed(2)}]`;
  }
};

// src/genetic-algorithm/UniformCrossover.ts
var UniformCrossover = class {
  crossover(chromosome_a, chromosome_b, rng2) {
    if (chromosome_a.length !== chromosome_b.length)
      throw new Error("both parent must have equal number of genes");
    const genes = chromosome_a.map((gene_a, i) => {
      if (rng2.generate(0, 1) < 0.5)
        return gene_a;
      return chromosome_b.at(i);
    });
    return new Chromosome(genes);
  }
};

// src/neural-network/Neuron.ts
var Neuron = class {
  constructor(bias, weights) {
    this.bias = bias;
    this.weights = weights;
  }
  propagate(inputs, activation2) {
    const value = inputs.reduce(
      (acc, cur, i) => acc + cur * this.weights[i],
      this.bias
    );
    return activation2(value);
  }
  static random(inputs_size, rng2) {
    const bias = rng2.generate(-1, 1);
    const weights = Float32Array.from(
      { length: inputs_size },
      () => rng2.generate(-1, 1)
    );
    return new Neuron(bias, weights);
  }
  static fromWeights(inputs_size, weightsIter) {
    const { value: bias, done } = weightsIter.next();
    if (done)
      throw new Error("not enough weights");
    const weights = Float32Array.from({ length: inputs_size }, () => {
      const { value: weight, done: done2 } = weightsIter.next();
      if (done2)
        throw new Error("not enough weights");
      return weight;
    });
    return new Neuron(bias, weights);
  }
};

// src/neural-network/Layer.ts
var Layer = class {
  constructor(neurons) {
    this.neurons = neurons;
  }
  propagate(inputs, activation2) {
    return this.neurons.map((neuron) => neuron.propagate(inputs, activation2));
  }
  static random(input_neurons, output_neurons, rng2) {
    const neurons = Array.from(
      { length: output_neurons },
      () => Neuron.random(input_neurons, rng2)
    );
    return new Layer(neurons);
  }
  static fromWeights(input_neurons, output_neurons, weightsIter) {
    const neurons = Array.from(
      { length: output_neurons },
      () => Neuron.fromWeights(input_neurons, weightsIter)
    );
    return new Layer(neurons);
  }
};

// src/neural-network/Network.ts
var Network = class {
  constructor(layers, activation2) {
    this.layers = layers;
    this.activation = activation2;
  }
  *weights() {
    for (const layer of this.layers)
      for (const neuron of layer.neurons) {
        yield neuron.bias;
        for (const weight of neuron.weights)
          yield weight;
      }
  }
  propagate(inputs) {
    if (inputs.length !== this.layers[0].neurons[0].weights.length)
      throw new RangeError(
        "input length must be equal to tye amount of input neurons"
      );
    return this.layers.reduce(
      (inputs2, layer) => layer.propagate(inputs2, this.activation),
      inputs
    );
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
    const speed = r0;
    const rotation = r1;
    this.linear_accel += speed;
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
  fov;
  cells;
  constructor(range, angle, cells) {
    if (range <= 0)
      throw new Error("fov range must be positive");
    if (angle <= 0)
      throw new Error("fov angle must be positive");
    if (cells <= 0)
      throw new Error("number of eye cells must be positive");
    this.fov = { range, angle };
    this.cells = cells;
  }
  processVision(position, rotation, foods) {
    const cells = Array(this.cells).fill(0);
    const [x, y] = position;
    for (const food2 of foods) {
      const distance = Math.hypot(x - food2.position[0], y - food2.position[1]);
      if (distance > this.fov.range)
        continue;
      const angle = getAngleBetweenNormalAndFood(position, rotation, food2);
      if (Math.abs(angle) > this.fov.angle / 2)
        continue;
      const cell = Math.min(
        Math.floor(
          (angle + this.fov.angle / 2) / this.fov.angle * this.cells
        ),
        this.cells - 1
      );
      cells[cell] = (this.fov.range - distance) / this.fov.range;
    }
    return cells;
  }
};

// src/simulation/Animal.ts
var Animal = class {
  constructor(config2, brain, rng2) {
    this.brain = brain;
    this.position = [rng2.generate(0, 1), rng2.generate(0, 1)];
    this.rotation = rng2.generate(-Math.PI, Math.PI);
    this.vision = Array(config2.eye_cells).fill(0);
    this.#speed = rng2.generate(0, config2.sim_speed_max);
    this.eye = new Eye(config2.eye_fov_range, config2.eye_fov_angle, config2.eye_cells);
    this.satiation = 0;
  }
  position;
  rotation;
  vision;
  #speed;
  eye;
  satiation;
  get speed() {
    return this.#speed;
  }
  chromosome() {
    return this.brain.chromosome();
  }
  processBrain(config2, foods) {
    this.vision = this.eye.processVision(this.position, this.rotation, foods);
    const [speed, rotation] = this.brain.propagate(this.vision);
    this.#speed = clamp(
      this.#speed + speed,
      config2.sim_speed_min,
      config2.sim_speed_max
    );
    this.rotation += 0.1;
  }
  processMovement() {
    const time = 1;
    this.position[0] += this.speed * Math.cos(this.rotation) * time;
    this.position[1] += this.speed * Math.sin(this.rotation) * time;
    this.position[0] = clamp(this.position[0], 0, 1);
    this.position[1] = clamp(this.position[1], 0, 1);
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
    if (++this.age > this.config.sim_generation_length)
      return this.evolve(rng2);
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
        if (distance > this.config.food_size)
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
    const nextgen = geneticAlgorithm.evolve(Bird.create, agents, rng2);
    this.world.animals = nextgen.map(
      (bird) => bird.toAnimal(this.config, activation, rng2)
    );
    for (const food2 of this.world.foods)
      food2.position = [rng2.generate(0, 1), rng2.generate(0, 1)];
    return new Statistics(agents, this.generation - 1);
  }
};

// src/config.ts
var config = {
  brain_neurons: 9,
  eye_fov_range: 0.25,
  eye_fov_angle: Math.PI * 0.75,
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
  world_animals: 10,
  world_foods: 100
};

// src/Renderer.ts
var Renderer = class {
  constructor(canvas2, size, simulation2, config2) {
    this.canvas = canvas2;
    this.simulation = simulation2;
    this.config = config2;
    canvas2.style.width = size + "px";
    canvas2.style.height = size + "px";
    this.WORLD_SIZE = size * window.devicePixelRatio;
    canvas2.width = this.WORLD_SIZE;
    canvas2.height = this.WORLD_SIZE;
    this.ctx = canvas2.getContext("2d");
  }
  WORLD_SIZE;
  ctx;
  drawFood(food2, style) {
    const [x, y] = food2.position.map((v) => v * this.WORLD_SIZE);
    this.ctx.fillStyle = style;
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.config.food_size * this.WORLD_SIZE, 0, Math.PI * 2);
    this.ctx.fill();
  }
  drawAnimal(animal2, radius, style) {
    const [x, y] = animal2.position.map((v) => v * this.WORLD_SIZE);
    const { rotation } = animal2;
    this.drawAnimalVision(animal2);
    this.ctx.fillStyle = style;
    this.ctx.beginPath();
    this.ctx.moveTo(
      x + Math.cos(rotation + 5 / 6 * Math.PI) * radius,
      y + Math.sin(rotation + 5 / 6 * Math.PI) * radius
    );
    this.ctx.lineTo(
      x + Math.cos(rotation) * radius,
      y + Math.sin(rotation) * radius
    );
    this.ctx.lineTo(
      x + Math.cos(rotation - 5 / 6 * Math.PI) * radius,
      y + Math.sin(rotation - 5 / 6 * Math.PI) * radius
    );
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.fillStyle = "red";
    this.ctx.arc(x, y, 1, 0, Math.PI * 2);
    this.ctx.fill();
  }
  drawAnimalVision(animal2) {
    const [x, y] = animal2.position.map((v) => v * this.WORLD_SIZE);
    const { eye, rotation, vision } = animal2;
    for (let i = 0; i < eye.cells; i++) {
      this.ctx.fillStyle = `rgba(100, 100, 100, ${0.1 + vision[i] / 0.8})`;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.arc(
        x,
        y,
        animal2.eye.fov.range * this.WORLD_SIZE,
        rotation - eye.fov.angle / 2 + eye.fov.angle / eye.cells * i,
        rotation - eye.fov.angle / 2 + eye.fov.angle / eye.cells * (i + 1)
      );
      this.ctx.fill();
    }
  }
  render() {
    this.ctx.clearRect(0, 0, this.WORLD_SIZE, this.WORLD_SIZE);
    for (const food2 of this.simulation.world.foods)
      this.drawFood(food2, "green");
    for (const animal2 of this.simulation.world.animals)
      this.drawAnimal(animal2, 10, "blue");
  }
};

// src/index.ts
var p = document.querySelector("#stats");
var canvas = document.querySelector("#world");
var rng = {
  generate(min, max) {
    return Math.random() * (max - min) + min;
  }
};
var food = new Food([0.5, 0.5]);
var animal = Animal.random(config, activation, rng);
animal.position = [0.35, 0.35];
animal.rotation = Math.PI * (1 / 4);
var world = new World([animal], [food]);
var simulation = new Simulation(config, world, 0, 0);
var renderer = new Renderer(canvas, 300, simulation, config);
async function loop() {
  const stats = simulation.step(rng);
  renderer.render();
  if (stats)
    p.innerText = stats.toString();
  await new Promise((r) => setTimeout(r, 300));
  window.requestAnimationFrame(loop);
}
loop();
