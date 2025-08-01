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

let weights = [];
let b = null;
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
        console.log("data:" + data)
          console.log("Data exists, returning 1");
          console.log("Weights:", data.weights);
          console.log("b:", data.b);

          weights = data.weights;
          b = data.b;

          testBtn.style.display = "block";
         Trainbtn.style.display = "none";
         accCalculate(data.weights, data.b)
      })
      .catch(error => {
          console.log("No data found or error occurred, returning 0");
          console.error(error);

         
      });
});
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




// تابع برای تغییر رنگ موقع کلیک کردن
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
  testBtn.style.display = "block";
  Trainbtn.style.display = "none";
  console.log(weights);
fetch('trainingDataSet.json')
    .then(response => response.json())  
    .then(total => {
        console.log(total); 
        //مقداردهی های اولیه
        for (let i = 0; i < 25; i++) {
          weights.push(0);
        }
        b = 0;
        total.forEach(function(item){
          let y = item.y
          console.log(y)
        let dataForTrain = item.data.flat()
        console.log(dataForTrain)
        let i = 0;
        dataForTrain.forEach(function (x) {
          weights[i] += x * y;
          i++;
        });
        b += y;
        console.log("weights: " + weights)
        console.log("bias:" + b)

        })
        saveweights()
        
    })
    .catch(error => console.error('Error loading JSON:', error));
    
    

console.log("Data has been saved as JSON file!");
testBtn.style.display = "block";
  Trainbtn.style.display = "none";
  showingModal("you have trained your AI now you can test")
  console.log(weights);

});
//تابه ذخیره وزن ها و بایاس در فایل جیسون
function saveweights(){
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
    } else {
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
