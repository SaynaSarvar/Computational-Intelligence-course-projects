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
          console.log("V:", data.vs);
          console.log("b:", data.bx);

          weights = data.weights;
          vs = data.vs;
          bx = data.bx;
          bz = data.bz
          accCalculate()

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
let vs = []

let bx = []
let bz = []
let alpha = 0.01;

let dataForTrain = []
//تابع محاسبهaccuracy
function accCalculate() {
  let counter = 0;

  fetch("testDataSet.json")
      .then(res => res.json())
      .then(total => {
          total.forEach(function(item){
            item.data = item.data.flat()
          })

          let x = Array(25).fill(0);
          let z = Array(19).fill(0);
          let y = Array(2).fill(0);
          
          let zNI = 0
          
          
          total.forEach(item => {
              item.data.forEach((num, index) => {
                  x[index] = num
                  
              })

              zNI = 0

              for (let j = 0; j < 19; j++) {
                  zNI = bx[j];
                  for (let i = 0; i < 25; i++) {
                      zNI += (x[i] * vs[i][j]);
                  }
                  z[j] = (bipolarSigmoid(zNI));
              }
  
              let yNI = 0
  
              for (let k = 0; k < 2; k++) {
                  yNI = bz[k]
                  for (let j = 0; j < 19; j++) {
                      yNI += (z[j] * weights[j][k])
                  }
                  y[k] = bipolarSigmoid(yNI);
                  if (y[k] > 0){
                      y[k]=1
                  }else{
                      y[k]=-1
                  }
              }

              if(arrayEqualityCheck(item.y,y)){
                  counter++
              }

          })

        
          accuracy.innerHTML = `${((counter / total.length) * 100).toFixed(2)}%`;
      });
}

function arrayEqualityCheck(arr1, arr2) {
  for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
  }
  return true;
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
// تابع سیگموید بای‌پولار
function bipolarSigmoid(x) {
  return (2 / (1 + Math.exp(-x))) - 1;
}
// مشتق تابع سیگموید بای‌پولار
function bipolarSigmoidDerivative(y) {
  const BSvalue = bipolarSigmoid(y);
  return ((1 + BSvalue) * (1 - BSvalue)) / 2;
}



Trainbtn.addEventListener("click",function(){
  fetch("trainingDataSet.json").then(res => {
    if (res.ok) {
        return res.json()
    }
}).then(total => {
    total.forEach(function(item){
      item.data = item.data.flat()
    })
    trainData = JSON.parse(JSON.stringify(total));
    fetch("validationDataSet.json").then(res => {
        if (res.ok) {
            return res.json()
        }
    }).then(v => {
      v.forEach(function(item){
        item.data = item.data.flat()
      })
        let validationData = JSON.parse(JSON.stringify(v));
        let epochCount = 0

        let stopCondition = true

        let vsDelta = []

        let weigthsDelta = [];
//مقدار دهی ها
        for (let i = 0; i < 25; i++) {
            let subArray = []
            for (let j = 0; j < 19; j++) {
                subArray[j] = (Math.random() - 0.5)
            }
            vs[i] = [...subArray]
            vsDelta.push(subArray);
        }
        let bzDelta = [];
        bzDelta.push(0);
        bzDelta.push(0);
        let bxDelta = []
        for (let j = 0; j < 19; j++) {
            bx.push(Math.random() - 0.5)
            bxDelta.push(0)
        }
        bz = [Math.random() - 0.5, Math.random() - 0.5];
        for (let i = 0; i < 19; i++) {
            weights[i] = [Math.random() - 0.5, Math.random() - 0.5]
            weigthsDelta[i] = [0, 0]
        }

        let x = Array(25).fill(0),
            z = Array(19).fill(0),
            y = Array(2).fill(0),
            final = Array(2).fill(0),
            deltaK = Array(2).fill(0),
            D = Array(19).fill(0),
            zNetInputs = Array(19).fill(0);
        let zNI = 0
        let yNI = 0
//forwarding
        while (stopCondition) {

            trainData.forEach(item => {

                item.data.forEach((num, index) => {
                    x[index] = num
                })
                // console.log(x);
                zNI = 0

                for (let j = 0; j < 19; j++) {
                    zNI = bx[j];
                    for (let i = 0; i < 25; i++) {
                        zNI += (x[i] * vs[i][j]);
                    }
                    z[j] = (bipolarSigmoid(zNI));
                    zNetInputs[j] = zNI;
                }

                yNI = 0

                for (let k = 0; k < 2; k++) {
                    yNI = bz[k]
                    for (let j = 0; j < 19; j++) {
                        yNI += (z[j] * weights[j][k])
                    }
                    y[k] = bipolarSigmoid(yNI);
//back propagation                    
                    let moshtagY = bipolarSigmoidDerivative(yNI)
                    deltaK[k] = ((item.y[k] - y[k]) * moshtagY);
                    for (let j = 0; j < 19; j++) {
                        weigthsDelta[j][k] = (alpha * deltaK[k] * z[j])
                    }
                    bzDelta[k] = alpha * deltaK[k]
                }

                let deltaJ = Array(19).fill(0);
                for (let j = 0; j < 19; j++) {
                    deltaJ[j] = 0;
                    for (let k = 0; k < 2; k++) {
                        D[j] = deltaK[k] * weights[j][k]; 
                        let moshtagZ = bipolarSigmoidDerivative(zNetInputs[j]); 
                        deltaJ[j] += D[j] * moshtagZ; 
                    }
                }


                for (let i = 0; i < 25; i++) {
                    for (let j = 0; j < 19; j++) {
                        vsDelta[i][j] = alpha * deltaJ[j] * x[i];
                        bxDelta[i] = alpha * deltaJ[j];
                    }
                }

//weight and bias update
                for (let i = 0; i < 25; i++) {
                    for (let j = 0; j < 19; j++) {
                        vs[i][j] += vsDelta[i][j];
                    }
                }


                for (let j = 0; j < 19; j++) {
                    for (let k = 0; k < 2; k++) {
                        weights[j][k] += weigthsDelta[j][k];
                    }
                }
                for(let j=0; j<19;j++){
                            bx[j]+=bxDelta[j]
                        }
                          
                          for(let k=0; k<2;k++){
                            bz[k]+=bzDelta[k]
                        }

            })

            epochCount++
            console.log(epochCount);
//شرط توقف با داده های  validation            
            let validationCount = Math.ceil(validationData.length * 0.3); // تعداد داده‌های انتخابی 30درصد ولیذیشن
            let randomSamples = [];
            for (let i = 0; i < validationCount; i++) {
                let randomIndex = Math.floor(Math.random() * validationData.length);
                randomSamples.push(validationData[randomIndex]);
            }
        
            let correctResult = true;
        
            randomSamples.forEach(item => {
                item.data.forEach((num, index) => {
                    x[index] = num;
                });
        
                for (let j = 0; j < 19; j++) {
                    zNI = bx[j];
                    for (let i = 0; i < 25; i++) {
                        zNI += x[i] * vs[i][j];
                    }
                    z[j] = bipolarSigmoid(zNI);
                }
        
                for (let k = 0; k < 2; k++) {
                    yNI = bz[k];
                    for (let j = 0; j < 19; j++) {
                        yNI += z[j] * weights[j][k];
                    }
                    y[k] = bipolarSigmoid(yNI);
        
                    final[k] = y[k] > 0 ? 1 : -1;
                }
        
                if (!arrayEqualityCheck(item.y, final)) {
                    correctResult = false;
                }
            });
        
            // اگر دقت برای چند ایپوک متوالی خوب باشد، شرط توقف برقرار شود
            if (correctResult) {
                consecutiveCorrectEpochs++;
            } else {
                consecutiveCorrectEpochs = 0; // اگر خطا داشته باشد، بازنشانی شود
            }
        
            if (consecutiveCorrectEpochs >= 5) { // شرط توقف بعدی: ۵ ایپوک متوالی درست
                stopCondition = false;
            }
      
            if (epochCount == 2000) {//شرط توثف برای تعداد ایپوک ها
                break;
            }
        


            }

        console.log("finished at", epochCount, "epoches");

        saveWeights()
    testBtn.style.display = "block";
    Trainbtn.style.display = "none";
    showingModal("you have trained your AI now you can test")
        
    }).catch(err => console.error(err))


}).catch(err => {
    console.error(err)
})

})
function saveWeights(){
  const data = {
    weights,
    bx,
    bz,
    vs
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
testBtn.addEventListener("click", function(){
  let testData = [];
  // flag برای اینکه حداقل یه دکمه active باشه
  let active = document.querySelectorAll("#active").length > 0;
  let x = Array(25).fill(0)
  let z = Array(19).fill(0)
  let y = Array(2).fill(0)

  let yNI = null;
  let zNI = null;
  let index = 0
  if (active) {
    gridBtn.forEach(function (grids) {
      if (grids.id === "active") {
        testData.push(1);
      } else {
        testData.push(-1);
      }
    });
    testData.forEach(function(each){
      x[index] = each
      index++
    })
   zNI = 0
   for(let j =0; j<19 ; j++){
    zNI = bx[j]
    for(let i=0 ; i<25; i++){
      zNI += x[i] * vs[i][j]
    }
    z[j] = bipolarSigmoid(zNI)
   }
   yNI = 0
   for(let k =0; k<2 ; k++){
    yNI = bz[k]
    for(let j=0 ; j<19; j++){
      yNI += z[j] * weights[j][k]
    }
    y[k] = bipolarSigmoid(yNI)
   }
   if (y[0] > 0 && y[1] < 0) {
    showingModal("the pattern is x")
} else if (y[0] < 0 && y[1] > 0) {
  showingModal("the pattern is o")

} else {
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
})

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