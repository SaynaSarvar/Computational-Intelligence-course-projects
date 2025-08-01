let $ = document;
let maxValue = $.querySelector(".maxNum");
let Btn = $.querySelector('.btn')
let modal = $.querySelector(".modal-parent")
let exit = $.querySelector(".X")
let box = $.querySelector('.bigBox')
let ModalValue = $.querySelector(".citiesOrder")

//تابع نمایش مودال
function showingModal(message){
  modal.style.display = "block"
  ModalValue.innerHTML = message
  box.style.filter="blur(10px)"
}
// بستن مودال
exit.addEventListener('click', function(){
  modal.style.display = "none"
  box.style.filter="blur(0px)"
})

// بستن مودال با دکمه esc از کیبورد
$.body.addEventListener('keyup', function(event){
  if (event.keyCode === 27){
    modal.style.display = "none"
    box.style.filter="blur(0px)"
  }
})

const cities = [
  { id: 1, x: 37, y: 52 }, { id: 2, x: 49, y: 49 }, { id: 3, x: 52, y: 64 },
  { id: 4, x: 20, y: 26 }, { id: 5, x: 40, y: 30 }, { id: 6, x: 21, y: 47 },
  { id: 7, x: 17, y: 63 }, { id: 8, x: 31, y: 62 }, { id: 9, x: 52, y: 33 },
  { id: 10, x: 51, y: 21 }, { id: 11, x: 42, y: 41 }, { id: 12, x: 31, y: 32 },
  { id: 13, x: 5, y: 25 }, { id: 14, x: 12, y: 42 }, { id: 15, x: 36, y: 16 },
  { id: 16, x: 52, y: 41 }, { id: 17, x: 27, y: 23 }, { id: 18, x: 17, y: 33 },
  { id: 19, x: 13, y: 13 }, { id: 20, x: 57, y: 58 }, { id: 21, x: 62, y: 42 },
  { id: 22, x: 42, y: 57 }, { id: 23, x: 16, y: 57 }, { id: 24, x: 8, y: 52 },
  { id: 25, x: 7, y: 38 }, { id: 26, x: 27, y: 68 }, { id: 27, x: 30, y: 48 },
  { id: 28, x: 43, y: 67 }, { id: 29, x: 58, y: 48 }, { id: 30, x: 58, y: 27 },
  { id: 31, x: 37, y: 69 }, { id: 32, x: 38, y: 46 }, { id: 33, x: 46, y: 10 },
  { id: 34, x: 61, y: 33 }, { id: 35, x: 62, y: 63 }, { id: 36, x: 63, y: 69 },
  { id: 37, x: 32, y: 22 }, { id: 38, x: 45, y: 35 }, { id: 39, x: 59, y: 15 },
  { id: 40, x: 5, y: 6 }, { id: 41, x: 10, y: 17 }, { id: 42, x: 21, y: 10 },
  { id: 43, x: 5, y: 64 }, { id: 44, x: 30, y: 15 }, { id: 45, x: 39, y: 10 },
  { id: 46, x: 32, y: 39 }, { id: 47, x: 25, y: 32 }, { id: 48, x: 25, y: 55 },
  { id: 49, x: 48, y: 28 }, { id: 50, x: 56, y: 37 }, { id: 51, x: 30, y: 40 }
];


// تابع محاسبه مسافت بین دو شهر
function calculateDistance(city1, city2) {
  const dx = city1.x - city2.x;
  const dy = city1.y - city2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// تابع محاسبه طول مسیر برای یک کروموزوم
function calculateTotalDistance(path) {
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    totalDistance += calculateDistance(cities[path[i] - 1], cities[path[i + 1] - 1]);
  }
  totalDistance += calculateDistance(cities[path[path.length - 1] - 1], cities[path[0] - 1]); // برگشت به اولین شهر
  return totalDistance;
}

// تابع محاسبه fitness
function calculateFitness(path) {
  return 1 / calculateTotalDistance(path);
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
  // جابجایی دو شهر
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

// ایجاد جمعیت اولیه
function createInitialPopulation(populationSize, numCities) {
  const population = [];
  for (let i = 0; i < populationSize; i++) {
    const path = [];
    while (path.length < numCities) {
      const city = Math.floor(Math.random() * numCities) + 1;
      if (!path.includes(city)) {
        path.push(city);
      }
    }
    population.push(path);
  }
  return population;
}

// عنصر DOM برای نمایش نمودار fitness
const fitnessChart = document.getElementById('fitnessChart');

let distanceHistory = [];


function geneticAlgorithm(populationSize, generations, mutationRate, crossoverRate, elitismCount, stableFitnessThreshold) {
  let population = createInitialPopulation(populationSize, cities.length);
  let bestFitnessHistory = [];  // ذخیره تاریخچه فیتنس بهترین کروموزوم
  let stableFitnessCount = 0;   // شمارش تعداد نسل‌های با فیتنس ثابت

  for (let generation = 0; generation < generations; generation++) {
    const newPopulation = [];

    // اعمال نخبه‌گرایی: ذخیره نخبه‌ها
    population.sort((a, b) => calculateFitness(b) - calculateFitness(a));
    const elites = population.slice(0, elitismCount);

    // تولید نسل جدید
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

    // اضافه کردن نخبه‌ها به نسل جدید
    population = newPopulation.concat(elites);

    // محاسبه بهترین فاصله در این نسل
    let bestDistance = Math.min(...population.map(path => calculateTotalDistance(path))); // فاصله کمترین مسافت
    distanceHistory.push(bestDistance); 

    // بررسی ثابت بودن فیتنس
    const bestFitness = calculateFitness(population[0]);
    bestFitnessHistory.push(bestFitness);
    
    if (bestFitnessHistory.length > 1 && bestFitness === bestFitnessHistory[bestFitnessHistory.length - 2]) {
      stableFitnessCount++;
    } else {
      stableFitnessCount = 0;
    }

    // اگر فیتنس برای تعداد مشخصی از نسل‌ها ثابت ماند، توقف
    if (stableFitnessCount >= stableFitnessThreshold) {
      console.log(`Algorithm stopped at generation ${generation} due to stable fitness.`);
      break;
    }
  }

  // انتخاب بهترین کروموزوم در جمعیت
  let bestPath = population[0];
  for (const individual of population) {
    if (calculateFitness(individual) > calculateFitness(bestPath)) {
      bestPath = individual;
    }
  }

  return bestPath;
}

// مقدار دهی متغیر ها
const populationSize = 500;
const generations = 1000;
const mutationRate = 0.1;
const crossoverRate = 0.9;
const elitismCount = 25;  // تعداد نخبه‌ها
const stableFitnessThreshold = 4; // تعداد نسل‌های متوالی با فیتنس ثابت برای توقف

// اجرای الگوریتم ژنتیک
const bestPath = geneticAlgorithm(populationSize, generations, mutationRate, crossoverRate, elitismCount, stableFitnessThreshold);

console.log('Best Path:', bestPath);
console.log('Total Distance:', calculateTotalDistance(bestPath));
maxValue.innerHTML = Math.floor(calculateTotalDistance(bestPath));
Btn.addEventListener("click",function(){
  showingModal(bestPath)
})



// رسم نمودار فاصله با استفاده از Plotly.js
function drawDistanceChart() {
  const data = [
    {
      x: Array.from({ length: distanceHistory.length }, (_, i) => i + 1), // شماره نسل‌ها
      y: distanceHistory, // مقادیر فاصله
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#660066' },
      marker: { color: '#660066' },
      name: 'Distance',
    },
  ];

  const layout = {
    title: 'Best Distance Over Generations',
    xaxis: { title: 'Generation' },
    yaxis: { title: 'Distance' },
    plot_bgcolor: "rgba(255, 255, 255, 0.2)", // تنظیم پس‌زمینه نمودار
    paper_bgcolor: "rgba(0, 0, 0, 0)", // تنظیم پس‌زمینه کل نمودار
  };

  Plotly.newPlot(fitnessChart, data, layout);
}

// رسم نمودار پس از پایان الگوریتم
drawDistanceChart();



// عنصر canvas را از DOM بگیرید
const canvas = document.getElementById('cityMap');
const ctx = canvas.getContext('2d');

// تنظیم ابعاد canvas
canvas.width = 650; // افزایش عرض
canvas.height = 650; // افزایش ارتفاع

// مقیاس‌دهی مختصات برای نمایش روی canvas
const padding = 10; // فاصله از لبه‌ها
const scaleX = (canvas.width - 2 * padding) / Math.max(...cities.map(c => c.x));
const scaleY = (canvas.height - 2 * padding) / Math.max(...cities.map(c => c.y));

// مجموعه رنگ‌ها برای شهرها
const colors = ['#cc00cc', '#cc99ff', '#ff66cc', '#660066', '#ff99cc', '#cc0099', '#ff3399', '#ffccff'];

// رسم دایره‌ها برای نشان دادن شهرها
function drawCities(cities) {
  cities.forEach((city, index) => {
    ctx.beginPath();
    ctx.arc(padding + city.x * scaleX, padding + city.y * scaleY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = colors[index % colors.length]; // انتخاب رنگ بر اساس ایندکس
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.font = '12px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(city.id, padding + city.x * scaleX + 5, padding + city.y * scaleY - 5);
  });
}

// رسم مسیر بین شهرها
function drawPath(path) {
  ctx.beginPath();
  ctx.strokeStyle = '#660066';
  ctx.lineWidth = 2;
  const startCity = cities[path[0] - 1];
  ctx.moveTo(padding + startCity.x * scaleX, padding + startCity.y * scaleY);

  for (let i = 1; i < path.length; i++) {
    const city = cities[path[i] - 1];
    ctx.lineTo(padding + city.x * scaleX, padding + city.y * scaleY);
  }

  // برگشت به شهر اول
  const endCity = cities[path[0] - 1];
  ctx.lineTo(padding + endCity.x * scaleX, padding + endCity.y * scaleY);
  ctx.stroke();
}

// پاک کردن canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// رسم گراف
function renderGraph(bestPath) {
  clearCanvas();
  drawCities(cities);
  drawPath(bestPath);
}

//  نمایش شهر ها
renderGraph(bestPath);
