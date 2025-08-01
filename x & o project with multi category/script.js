let $ = document;
let gridBtn = $.querySelectorAll(".grid");
let Trainbtn = $.querySelector(".trainBtn");
let testBtn = $.querySelector(".testBtn");
let modal = $.querySelector(".modal-parent")
let ModalValue = $.querySelector(".modalValue")
let exit = $.querySelector(".X")
let box = $.querySelector(".bigBox")
let accuracy = $.querySelector(".accNum")

// تابع بسته شدن مودال بعد از 3 ثانیه
function closingModal(){
  setTimeout(function(){
    modal.style.display = "none"
    box.style.filter="blur(0px)"
  },3000)
}
//تابع نمایش مودال
function showingModal(message){
  modal.style.display = "block"
  ModalValue.innerHTML = message
  box.style.filter="blur(10px)"
  closingModal()
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

          
      });
});

//مقدار دهی های اولیه
let weights = []

let b = null

let alpha = 0.002;
let teta = 0.25;

let dataForTrain = []
function accCalculate(ws, bias) {
  let netInput = [0, 0];
  let counter = 0;

  fetch("testDataSet.json")
      .then(res => res.json())
      .then(array => {
          array.forEach(item => {
              item.data = item.data.flat();
          });

          array.forEach(item => {
              for (let j = 0; j < 2; j++) {
                  let sum = 0;
                  item.data.forEach((info, index) => {
                      sum += ws[index][j] * info;
                  });
                  netInput[j] = sum + bias[j];
              }

              let javab;
              if (netInput[0] > teta && netInput[1] < -teta) {
                  javab = [1, -1];
              } else if (netInput[0] < -teta && netInput[1] > teta) {
                  javab = [-1, 1];
              } else {
                  javab = [0, 0];
              }

              if (isArraysEqual(javab, item.y)) {
                  counter++;
              }
          });
          function isArraysEqual(arr1, arr2) {
            for (let i = 0; i < arr1.length; i++) {
                if (arr1[i] !== arr2[i]) return false;
            }
            return true;
        }

          
          accuracy.innerHTML = `${((counter / array.length) * 100).toFixed(2)}%`;
      });
}

 function wAndBiasDeclare(){
  for (let i = 0; i < 25; i++) {
    weights[i] = [Math.random() * 0.5, Math.random() * 0.5];
}
b = [Math.random() * 0.5, Math.random() * 0.5];
  console.log(weights)
  console.log(b)

  
}
// سیو کردن داده ها در یک ارایه
function saveData(data,y1,y2){
let dataObject = {
  data : data,
  y1 : y1,
  y2 : y2
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



Trainbtn.addEventListener("click", () => {

    fetch("trainingDataSet.json")
        .then(response=> response.json())
        .then(total => {
        total.forEach(item => {
            item.data = item.data.flat()
        })
        let yNI = null;

        let yFinal = 0;

        let index = null

        let epochCount = 0

        let stopCondition = true

        wAndBiasDeclare()


        for (let j = 0; j < 2; j++) {
            stopCondition = true;
            let WeightChange = 0; 
            while (stopCondition) {
                WeightChange = 0; //ذخیره تغغییرات وزن ها ددر هر ایپوک

                total.forEach(function(item){
                  yNI = 0;
                  index = 0;
                  item.data.forEach(function(x){
                    yNI += weights[index][j] * x;
                      index++;
                  }) 
                    
                  yNI += b[j];

                  if (yNI > teta) {
                      yFinal = 1;
                  } else if (yNI <= teta && yNI >= -teta) {
                      yFinal = 0;
                  } else {
                      yFinal = -1;
                  }

                  if (yFinal != item.y[j]) {
                      let i = 0;
                      item.data.forEach((x) => {
                          let weightDelta = alpha * x * item.y[j];
                          weights[i][j] += weightDelta;
                          WeightChange += Math.abs(weightDelta); 
                          i++;
                      });
                      let biasDelta = alpha * item.y[j];
                      b[j] += biasDelta;
                      WeightChange += Math.abs(biasDelta); 
                  }
                }) 
                    
                
                console.log(WeightChange);
                if (WeightChange < 1.1) { //اگر تغییرات وزن از این عدد کمتر باشد از حلقه خارج میشویم
                    stopCondition = false;
                }
                epochCount++;
            }
        }

        console.log("finished at", epochCount, "epoches");


        saveWeights()

        testBtn.style.display = "block";
    Trainbtn.style.display = "none";
    showingModal("you have trained your AI now you can test")

    }).catch(err => {
        console.error(err)
    })

});


// تابع برای ذخیره وزن ها در فایل جیسون
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
  let yNI1 = null;
  let yNI2 = null
  let sum1 = 0;
  let sum2 = 0
  if (active) {
    gridBtn.forEach(function (grids) {
      if (grids.id === "active") {
        testData.push(1);
      } else {
        testData.push(-1);
      }
    });
    for (let j = 0; j < testData.length; j++) {
      sum1 += testData[j] * weights[j][0];
      sum2 += testData[j] * weights[j][1];

    }
    yNI1 = b[0] + sum1;
    yNI2 = b[1] + sum2;

    if (yNI1 > teta && yNI2 < teta) {
      showingModal("the pattern is x")
    } else if(yNI1 < -teta && yNI2 > teta){
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