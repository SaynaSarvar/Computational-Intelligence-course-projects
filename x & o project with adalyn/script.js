let $ = document;
let gridBtn = $.querySelectorAll(".grid");
let Trainbtn = $.querySelector(".trainBtn");
let testBtn = $.querySelector(".testBtn");
let modal = $.querySelector(".modal-parent")
let ModalValue = $.querySelector(".modalValue")
let exit = $.querySelector(".X")
let box = $.querySelector(".bigBox")
let accuracy = $.querySelector(".accNum")
//تابع نمایش مودال
function showingModal(message){
  modal.style.display = "block"
  ModalValue.innerHTML = message
  box.style.filter="blur(10px)"
  closingModal()
}
// تابع بسته شدن مودال بعد از 3 ثانیه
function closingModal(){
  setTimeout(function(){
    modal.style.display = "none"
    box.style.filter="blur(0px)"
  },3000)
}
window.addEventListener("load", () => {
  changeColor();

  fetch('weightsAndBias.json')
      .then(response => {
          if (!response.ok) {
              throw new Error('File not found');
          }
          return response.json();
      })
      .then(data => {
          console.log("Data exists, returning 1");
          console.log("Weights:", data.weights);
          console.log("b:", data.b);

          weights = data.weights;
          b = data.b;
          accCalculate(weights,b)

          testBtn.style.display = "block";
         Trainbtn.style.display = "none";
      })
      .catch(error => {
          console.log("No data found or error occurred, returning 0");
          console.error(error);

          wAndBiasDeclare();
      });
});

//مقدار دهی های اولیه
let weights = []

let b = null

let alpha = 0.01


let dataForTrain = []
function accCalculate(ws, bias) {
  let NI = null
  let sum = 0
  let index = 0
  let final = 0
  let counter = 0
  fetch("testDataSet.json")
      .then(res => res.json())
      .then(array => {
          array.forEach(item => {
              item.data = item.data.flat();
          });
          array.forEach(item => {
              index = 0
              sum = 0
              item.data.forEach(info => {
                  sum += ws[index] * info
                  index++
              })
              NI = bias + sum;
              if (NI >= 0) {
                  final = 1
              } else if (NI < 0) {
                  final = -1
              }
              if (final == item.y) {
                  counter++
              }
          })
          accuracy.innerHTML = `${((counter / array.length) * 100).toFixed(2)}%`
      })
}

 function wAndBiasDeclare(){
  for(let i = 0; i<25 ; i++){
    weights.push(0)
    console.log(weights)
  }
  b = 0
  console.log(b)
}
// سیو کردن داده ها در یک ارایه
function saveData(data,y){
let dataObject = {
  data : data,
  y : y
}
dataForTrain.push(dataObject)
console.log(dataForTrain)
}

//تغییر رنگ دکمه ها
function changeColor() {
  gridBtn.forEach(function (grids) {
    grids.addEventListener("click", function () {
      if (grids.id == "notactive") {
        grids.classList.add("active");
        grids.id = "active";
      } else if (grids.id == "active") {
        grids.classList.remove("active");
        grids.id = "notactive";
      }
    });
  });
}



Trainbtn.addEventListener("click", function () {
  fetch('trainingDataSet.json')
    .then(response => response.json())
    .then(total => {
      console.log("Training Data Loaded:", total);
      
      wAndBiasDeclare()
  
      let epochCount = 0;
      
      // Flag برای بررسی شرط توقف
      let stopCondition = true;
      
      
      while(stopCondition){
       let  weightChange = 0; //ذخیره تغییرات وزن ها در هر ایپوک
  
        total.forEach(function (item) {
          let x = item.data.flat();
          let y = item.y;
  
         let yNI= b; 
  
  
          x.forEach(function (eachX, index) {
            yNI += weights[index] * eachX;
          });
          yNI += b;
  
            x.forEach(function (eachX, i) {
              let weightDelta = alpha * eachX * (y - yNI);
              weights[i] += weightDelta;
              weightChange += Math.abs(weightDelta);
            });
  
            let biasDelta = alpha * (y - yNI);
            b += biasDelta;
            weightChange += Math.abs(biasDelta);
        
        });
  
        // بررسی شرط توقف برای تعداد ایپوک ها یا یک مقداری ثابت
        if (weightChange < 13.28 || epochCount == 10000 ){
          stopCondition = false;
        }
  
        epochCount++; 
        console.log('EpochCount:' + epochCount, 'weightChange:' + weightChange );
      }
  
      console.log("Training Complete!");
      console.log("total epoch count:" + epochCount)
      saveWeights()
      })
    .catch(error => console.error('Error loading JSON:', error));
    testBtn.style.display = "block";
    Trainbtn.style.display = "none";
    showingModal("you have trained your AI now you can test")
    console.log(weights);
  
  
  });
  

//تابع برای ذخیره وزن ها در فایل جیسون
function saveWeights(){
  const data = {
    weights: weights,
    b: b
};

const jsonData = JSON.stringify(data);

const blob = new Blob([jsonData], { type: 'application/json' });

const url = URL.createObjectURL(blob);

const a = document.createElement('a');
a.href = url;
a.download = 'weightsAndBias.json'; 
document.body.appendChild(a);
a.click();

document.body.removeChild(a);

URL.revokeObjectURL(url);

console.log("Data has been saved as JSON file!");
}


testBtn.addEventListener("click", function () {
  let testData = [];
  // flag برای اینکه حداقل یه دکمه active باشه
  let active = document.querySelectorAll("#active").length > 0;
  let yNI = null;
  let sum = 0;
  if (active) {
    gridBtn.forEach(function (grids) {
      if (grids.id === "active") {
        testData.push(1);
      } else {
        testData.push(-1);
      }
    });
    for (let j = 0; j < testData.length; j++) {
      sum += testData[j] * weights[j];
    }
    yNI = b + sum;
    if (yNI >= 0) {
      showingModal("the pattern is x")
    } else if(yNI < 0){
      showingModal("the pattern is o")
    }
    gridBtn.forEach(function (grids) {
      if (grids.id == "active") {
        grids.classList.remove("active");
        grids.id = "notactive";
      }
    });
  } else {
    showingModal("make a x or o first")
  }
});

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