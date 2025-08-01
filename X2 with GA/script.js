let $ = document;
let Btn = $.querySelector(".btn");
let maxBox = $.querySelector(".maxNum")
let pc = 0.8;
let pm = 0.2;
let currentGeneration = 0;

// متغیر برای نگهداری تاریخچه Fitness هر نسل
const fitnessHistory = [];

function createChart() {
  const trace = {
    x: [], // نسل‌ها
    y: [], // مقادیر Fitness
    mode: "lines+markers",
    type: "scatter",
    name: "Fitness",
  };

  const layout = {
    title: "Fitness each generation",
    xaxis: { title: "generation" },
    yaxis: { title: "Best Fitness" },
    plot_bgcolor: "rgba(255, 255, 255, 0.2)", // تنظیم پس‌زمینه نمودار
    paper_bgcolor: "rgba(0, 0, 0, 0)", // تنظیم پس‌زمینه کل نمودار
    font: { color: "rgb(16, 8, 67)" }, // تغییر رنگ فونت‌ها به سفید (در صورت نیاز)

  };

  Plotly.newPlot("chart", [trace], layout);
}

// به‌روزرسانی نمودار با داده‌های جدید
function updateChart(generation, fitness) {
  Plotly.extendTraces(
    "chart",
    {
      x: [[generation]],
      y: [[fitness]],
    },
    [0]
  );
}

// تولید جمعیت اولیه
function generatePopulation(populationSize) {
  const population = [];
  for (let i = 0; i < populationSize; i++) {
    let binaryString = "";
    for (let j = 0; j < 8; j++) {
      binaryString += Math.random() < 0.5 ? "0" : "1";
    }
    population.push(binaryString);
  }
  return population;
}

// تبدیل جمعیت به دسیمال
function populationToDecimal(population) {
  return population.map((binaryString) => parseInt(binaryString, 2));
}

// محاسبه Fitness
function fitnessFunc(population) {
  return population.map((decimalValue) => decimalValue * decimalValue);
}

// انتخاب تورنمنت
function tournamentSelection(population, fitnesses, tournamentSize) {
  const tournamentParticipants = [];
  for (let i = 0; i < tournamentSize; i++) {
    const randomIndex = Math.floor(Math.random() * population.length);
    tournamentParticipants.push({
      individual: population[randomIndex],
      fitness: fitnesses[randomIndex],
    });
  }
  tournamentParticipants.sort((a, b) => b.fitness - a.fitness);
  return tournamentParticipants[0].individual;
}

// کراس‌اور
function crossoverFunc(parent1, parent2, crossoverProbability) {
  if (Math.random() > crossoverProbability) {
    return { offspring1: parent1, offspring2: parent2, crossoverPoint: null };
  }
  const crossoverPoint = Math.floor(Math.random() * (parent1.length - 1)) + 1;
  const offspring1 =
    parent1.slice(0, crossoverPoint) + parent2.slice(crossoverPoint);
  const offspring2 =
    parent2.slice(0, crossoverPoint) + parent1.slice(crossoverPoint);
  return { offspring1, offspring2, crossoverPoint };
}

// جهش یک بیت
function mutateOneBit(individual, mutationProbability) {
  if (Math.random() > mutationProbability) return individual;
  const randomIndex = Math.floor(Math.random() * individual.length);
  return (
    individual.slice(0, randomIndex) +
    (individual[randomIndex] === "0" ? "1" : "0") +
    individual.slice(randomIndex + 1)
  );
}

//  الگوریتم ژنتیک 
Btn.addEventListener("click", function () {
  createChart();
  Btn.style.display = "none";

  let stopCondition = false;
  let population = generatePopulation(10);
  let currentGeneration = 0;
  let bestFitness = -Infinity;
  const maxGenerations = 100;
  let consecutiveGenerations = 0; // شمارنده نسل‌های متوالی که در آن‌ها fitness برابر 65025 است

  while (!stopCondition) {
    const newPopulation = [];
    const decimalPopulation = populationToDecimal(population);
    const fitnessValue = fitnessFunc(decimalPopulation);
    const maxFitness = Math.max(...fitnessValue);

    // ذخیره تاریخچه Fitness
    fitnessHistory.push({ generation: currentGeneration, fitness: maxFitness });
    updateChart(currentGeneration, maxFitness);

    // شرط توقف: اگر fitness برابر با 65025 در چهار نسل متوالی بیاید
    if (maxFitness === 65025) {
      consecutiveGenerations++;
    } else {
      consecutiveGenerations = 0; // ریست کردن شمارنده اگر fitness برابر 65025 نباشد
    }

    if (consecutiveGenerations >= 4) {
      stopCondition = true;
      console.log(`Best Fitness: ${maxFitness}, Generation: ${currentGeneration}`);
      maxBox.innerHTML = maxFitness;
      break;
    }

    // انتخاب بهترین فرد (elitism)
    const bestIndividuals = [];
    const bestIndex = fitnessValue.indexOf(maxFitness);
    bestIndividuals.push(population[bestIndex]);

    // اضافه کردن دومین بهترین فرد (در صورت نیاز)
    fitnessValue[bestIndex] = -Infinity; // حذف فرد بهترین از انتخاب بعدی
    const secondBestFitness = Math.max(...fitnessValue);
    const secondBestIndex = fitnessValue.indexOf(secondBestFitness);
    bestIndividuals.push(population[secondBestIndex]);

    // اضافه کردن افراد انتخاب شده توسط elitism به جمعیت جدید
    newPopulation.push(...bestIndividuals);

    // ادامه فرآیند انتخاب، کراس‌اور و جهش برای باقی‌مانده جمعیت
    while (newPopulation.length < population.length) {
      const selectedParent1 = tournamentSelection(population, fitnessValue, 3);
      let selectedParent2;
      do {
        selectedParent2 = tournamentSelection(population, fitnessValue, 3);
      } while (selectedParent1 === selectedParent2);

      const { offspring1, offspring2 } = crossoverFunc(
        selectedParent1,
        selectedParent2,
        pc
      );

      const mutatedIndividual1 = mutateOneBit(offspring1, pm);
      const mutatedIndividual2 = mutateOneBit(offspring2, pm);

      newPopulation.push(mutatedIndividual1, mutatedIndividual2);
    }

    population = newPopulation.slice(0, 10);
    currentGeneration++;
  }
});
