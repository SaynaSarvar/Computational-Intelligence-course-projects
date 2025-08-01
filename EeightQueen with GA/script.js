let $ = document
let conflictValue = $.querySelector(".maxNum")

let N = 8; // تعداد وزیرها
let populationSize = 100; // اندازه جمعیت
let pc = 0.8; // نرخ کراس‌اور
let pm = 0.2; // نرخ جهش
let generations = 100; // تعداد نسل‌ها


        // تولید جمعیت اولیه
        function generatePopulation(populationSize, queenNum) {
            const population = [];
            for (let i = 0; i < populationSize; i++) {
                const chromosome = [];
                while (chromosome.length < queenNum) {
                    const queen = Math.floor(Math.random() * queenNum);
                    if (!chromosome.includes(queen)) {
                        chromosome.push(queen);
                    }
                }
                population.push(chromosome);
            }
            return population;
        }

        // محاسبه تعداد گارد ها
        function calculatethreatenNum(chromosome) {
            let conflict = 0;
            for (let i = 0; i < chromosome.length; i++) {
                for (let j = i + 1; j < chromosome.length; j++) {
                    if (Math.abs(chromosome[j] - chromosome[i]) === Math.abs(j - i)) {
                        conflict++;
                    }
                }
            }
            return conflict;
        }

        // محاسبه Fitness
        function calculateFitness(chromosome) {
            return 1 / (calculatethreatenNum(chromosome) + 1);
        }

        // انتخاب والدین با روش تورنومنت
        function tournamentSelection(population) {
            const tournamentSize = 5; // تعداد کروموزوم‌ها در هر تورنومنت
            let best = null;
            for (let i = 0; i < tournamentSize; i++) {
                const randomIndex = Math.floor(Math.random() * population.length);
                const individual = population[randomIndex];
                if (!best || calculateFitness(individual) > calculateFitness(best)) {
                    best = individual;
                }
            }
            return best;
        }

        // جهش به صورت Swap Mutation
        function swapMutation(path) {
            const mutationPath = [...path];
            const index1 = Math.floor(Math.random() * mutationPath.length);
            let index2 = Math.floor(Math.random() * mutationPath.length);
            while (index1 === index2) {
                index2 = Math.floor(Math.random() * mutationPath.length);
            }
            [mutationPath[index1], mutationPath[index2]] = [mutationPath[index2], mutationPath[index1]];
            return mutationPath;
        }

        // کراس‌اور به روش Order Crossover (OX)
        function orderCrossover(parent1, parent2) {
            const start = Math.floor(Math.random() * parent1.length);
            const end = Math.floor(Math.random() * parent1.length);
            const [left, right] = [Math.min(start, end), Math.max(start, end)];

            const child = Array(parent1.length).fill(null);

            // کپی بخشی از والد اول
            for (let i = left; i <= right; i++) {
                child[i] = parent1[i];
            }

            // پر کردن بقیه از والد دوم
            let currentIndex = 0;
            for (let i = 0; i < parent2.length; i++) {
                if (!child.includes(parent2[i])) {
                    while (child[currentIndex] !== null) {
                        currentIndex++;
                    }
                    child[currentIndex] = parent2[i];
                }
            }

            return child;
        }

// الگوریتم ژنتیک
        function geneticAlgorithm(populationSize, generations, mutationRate, crossoverRate, elitismCount) {
          let population = generatePopulation(populationSize, N);
      
          let bestSolution = null;
          let bestFitness = 0;
      
          const fitnessHistory = [];
          let stableFitnessCount = 0; // شمارنده برای فیتنس ثابت
          const stableFitnessThreshold = 10; // تعداد نسل‌های متوالی با فیتنس ثابت برای توقف
      
          for (let generation = 0; generation < generations; generation++) {
              const newPopulation = [];
      
              // اعمال elitism
              population.sort((a, b) => calculateFitness(b) - calculateFitness(a));
              const elites = population.slice(0, elitismCount);
      
              while (newPopulation.length < populationSize - elitismCount) {
                  const parent1 = tournamentSelection(population);
                  const parent2 = tournamentSelection(population);
      
                  let offspring;
                  if (Math.random() < crossoverRate) {
                      offspring = orderCrossover(parent1, parent2);
                  } else {
                      offspring = [...parent1];
                  }
      
                  if (Math.random() < mutationRate) {
                      offspring = swapMutation(offspring);
                  }
      
                  newPopulation.push(offspring);
              }
      
              population = [...elites, ...newPopulation];
      
              // پیدا کردن بهترین کروموزوم در این نسل
              let currentBestFitness = 0;
              for (const individual of population) {
                  const fitness = calculateFitness(individual);
                  if (fitness > currentBestFitness) {
                      currentBestFitness = fitness;
                  }
              }
      
              
              if (currentBestFitness > bestFitness) {
                  bestFitness = currentBestFitness;
                  bestSolution = population.find(ind => calculateFitness(ind) === bestFitness);
                  stableFitnessCount = 0; // ریست کردن شمارنده پایداری
              } else if (currentBestFitness === bestFitness) {
                  stableFitnessCount++; // افزایش شمارنده اگر فیتنس ثابت باشد
              }
      
              // ذخیره تاریخچه فیتنس
              fitnessHistory.push(bestFitness);
      
              // چک کردن شرط توقف بیشتر بودن از مقداری ثابت
              if (stableFitnessCount >= stableFitnessThreshold) {
                  console.log('Algorithm stopped after', generation + 1, 'generations due to stable fitness.');
                  console.log('Stable best fitness:', bestFitness);
                  break;
              }
      
              console.log('Generation', generation + 1, '| Best Fitness:', bestFitness);
          }
      
          // رسم نمودار تاریخچه فیتنس
          plotFitnessHistory(fitnessHistory);
      
          return bestSolution;
      }
      
      

// رسم نمودار Fitness over generation
function plotFitnessHistory(fitnessHistory) {
  const trace = {
      x: Array.from(Array(fitnessHistory.length).keys()),  // مقادیر نسل‌ها
      y: fitnessHistory,  // مقادیر fitness در هر نسل
      mode: 'lines+markers',
      type: 'scatter',
      name: 'Fitness Over Generations',
      line: { color: '#8B4513' },
      marker: { color: '#8B4513' },
  };

  const layout = {
      title: 'Fitness Over Generations',
      xaxis: { title: 'Generation' },
      yaxis: { title: 'Fitness' },
      plot_bgcolor: "rgba(255, 255, 255, 0.2)", // تنظیم پس‌زمینه نمودار
    paper_bgcolor: "rgba(0, 0, 0, 0)", // تنظیم پس‌زمینه کل نمودار
  };

  const data = [trace];

  Plotly.newPlot('fitnessPlot', data, layout);  // نمایش نمودار در المان با id 'fitnessPlot'
}

// اجرای الگوریتم ژنتیک
const bestOrder = geneticAlgorithm(populationSize, generations, pm, pc,2);

console.log('Best Order:', bestOrder);
console.log('Total Conflicts:', calculatethreatenNum(bestOrder));
conflictValue.innerHTML = calculatethreatenNum(bestOrder)

// نمایش صفحه شطرنج و موقعیت وزرا
function displayBoard(solution) {
  const board = document.getElementById('board');
  const table = document.createElement('table');
  for (let row = 0; row < N; row++) {
      const tr = document.createElement('tr');
      for (let col = 0; col < N; col++) {
          const td = document.createElement('td');
          // انتخاب رنگ خانه‌ها: قهوه‌ای یا کرم
          if ((row + col) % 2 === 0) {
              td.classList.add('cream');
          } else {
              td.classList.add('brown');
          }
          // اگر وزیر در این خانه باشد، تصویر وزیر را قرار می‌دهیم
          if (solution[col] === row) {
              td.classList.add('queen'); // استفاده از تصویر وزیر
          }
          tr.appendChild(td);
      }
      table.appendChild(tr);
  }
  board.appendChild(table);
}

// نمایش موقعیت وزرا
displayBoard(bestOrder);
