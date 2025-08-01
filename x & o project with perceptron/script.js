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
          // wAndBiasDeclare()
        
      });
});

//مقدار دهی های اولیه
let weights = []

let b = null

let alpha = 0.2

let teta = 0.1
//تابع محاسبه accuracy
function accCalculate(weights, bias) {
  let yNI = null
  let sum = 0
  let index = 0
  let target = 0
  let trueCount = 0
  fetch("testDataSet.json")
      .then(res => res.json())
      .then(array => {
          array.forEach(item => {
              item.data = item.data.flat();
          });
          array.forEach(item => {
              index = 0
              sum = 0
              item.data.forEach(each => {
                  sum += weights[index] * each
                  index++
              })
              yNI = bias + sum;
              if (yNI >= 0) {
                  target = 1
              } else if (yNI < 0) {
                  target = -1
              }
              if (target == item.y) {
                  trueCount++
              }
          })
          console.log(((trueCount / array.length) * 100).toFixed(2) + "%")
          accuracy.innerHTML =`${((trueCount / array.length) * 100).toFixed(2)}%`;

      })
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
    // مقداردهی اولیه وزن‌ها و بایاس
function wAndDeclare(){
  for(let i = 0; i<25 ; i++){
    weights.push(Math.random() * 0.01)
  }
  b = 0
}


Trainbtn.addEventListener("click", function () {
fetch('trainingDataSet.json')
  .then(response => response.json())
  .then(total => {
    console.log("Training Data Loaded:", total);
    
    wAndDeclare()

    let epochCount = 0;
    
    // Flag برای بررسی شرط توقف
    let stopCondition = true;
    
    
    while(stopCondition){
     let  weightChange = 0; //ذخیره میزان تغییرات وزن ها در هر ایپوک

      total.forEach(function (item) {
        let x = item.data.flat();
        let y = item.y;

       let yNI= b;
       let yFinal = null


        x.forEach(function (eachX, index) {
          yNI += weights[index] * eachX;
        });
        yNI += b;

        // تعیین خروجی نهایی
        if (yNI > teta) {
          yFinal = 1;
      } else if (yNI <= teta && yNI >= -teta) {
          yFinal = 0;
      } else if (yNI < -teta) {
          yFinal = -1;
      }

        // به‌روزرسانی وزن‌ها و بایاس در صورت نیاز
        if (yFinal !== y) {
          x.forEach(function (eachX, i) {
            let weightDelta = alpha * eachX * y;
            weights[i] += weightDelta;
            weightChange += Math.abs(weightDelta);
          });

          let biasDelta = alpha * y;
          b += biasDelta;
          weightChange += Math.abs(biasDelta);
        }
      });

      // بررسی شرط توقف
      if (weightChange < 60 ){
        stopCondition = false;
      }

      epochCount++; // افزایش شمارش ایپوک
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
    if (yNI > teta) {
      showingModal("the pattern is x")
    }else if(yNI < -teta){
      showingModal("the pattern is o")
    }
    else{
      showingModal("unable to recognize")
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