let $ = document;
let Trainbtn = $.querySelector(".trainBtn");
let accuracy = $.querySelector(".accNum");
let modal = $.querySelector(".modal-parent")
let ModalValue = $.querySelector(".modalValue")
let exit = $.querySelector(".X")
let box = $.querySelector(".countainer")

//تابع نمایش مودال
function showingModal(message){
    modal.style.display = "block"
    ModalValue.innerHTML = message
    box.style.filter="blur(10px)"
  }

window.addEventListener("load", () => {

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
          bz = data.bz;
          inputNeurons = data.inputNeurons
          outputNeurons = data.outputNeurons
          testDataSet = data.testDataSet
          accCalculate()
          
          Trainbtn.style.display = "none";
      })
      .catch(error => {
          fetch("DataSet.json")
          .then(response => {
            if (!response.ok) {
                throw new Error('File not found');
            }
            return response.json();
        })
        .then(item => {
             validationDataSet = getRandomFifteenPercent(item)
             testDataSet = getRandomFifteenPercent(item)
             trainDataSet = [...item]
            inputNeurons = trainDataSet[0].data.length
            outputNeurons = trainDataSet[0].y.length
        }).catch(err => {
          console.log(err)
        })

      });
});
//تابع انتخاب 15  درصد از ارایه به صورت تصادفی
function getRandomFifteenPercent(array) {
  // محاسبه تعداد المان‌ها معادل 15 درصد آرایه
  const count = Math.ceil(array.length * 0.15);
  
  // کپی آرایه برای جلوگیری از تغییر آرایه اصلی
  const arrayCopy = [...array];
  
  // آرایه برای نگهداری المان‌های انتخاب شده
  const selected = [];
  
  
  for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * arrayCopy.length);
      selected.push(arrayCopy[randomIndex]);
      arrayCopy.splice(randomIndex, 1); // حذف المان انتخاب شده از کپی آرایه
  }
  
  return selected;
}


//مقدار دهی های اولیه
let weights = []
let vs = []

let bx = []
let bz = []

let inputNeurons = 0
let middleNeurons = 21
let outputNeurons = 0

let alpha = 0.1;




//تابع محاسبهaccuracy
function accCalculate() {
  let counter = 0;

  

          let x = Array(inputNeurons).fill(0);
          let z = Array(middleNeurons).fill(0);
          let y = Array(outputNeurons).fill(0);
          
          let zNI = 0
          
          
          testDataSet.forEach(item => {
              item.data.forEach((num, index) => {
                  x[index] = num
                  
              })

              zNI = 0

              for (let j = 0; j < middleNeurons; j++) {
                  zNI = bx[j];
                  for (let i = 0; i < inputNeurons; i++) {
                      zNI += (x[i] * vs[i][j]);
                  }
                  z[j] = (binarySigmoid(zNI));
              }
  
              let yNI = 0
  
              for (let k = 0; k < outputNeurons; k++) {
                  yNI = bz[k]
                  for (let j = 0; j < middleNeurons; j++) {
                      yNI += (z[j] * weights[j][k])
                  }
                  y[k] = binarySigmoid(yNI);
                  if (y[k] > 0.5){
                      y[k]=1
                  }else{
                      y[k]=0
                  }
              }

              if(arrayEqualityCheck(item.y,y)){
                  counter++
              }
 

          })
          
          accuracy.innerHTML = `${((counter / testDataSet.length) * 100).toFixed(2)}%`;
          
          
}

function arrayEqualityCheck(arr1, arr2) {
  for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}


// تابع سیگموید باینری
function binarySigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}
// مشتق تابع سیگموید باینری
function binarySigmoidDerivative(y) {
  const BSvalue = binarySigmoid(y);
  return BSvalue * (1 - BSvalue);
}




Trainbtn.addEventListener("click",function(){
        let epochCount = 0

        //فلگی برای شرط توقف
        let stopCondition = true

        

        let vsDelta = []

        let weigthsDelta = [];

        
//مقدار دهی ها
        for (let i = 0; i < inputNeurons; i++) {
            let subArray = []
            for (let j = 0; j < middleNeurons; j++) {
                subArray[j] = (Math.random() - 0.5)
            }
            vs[i] = [...subArray]
            vsDelta.push(subArray);
        }
        let bzDelta = [];
        for(let k = 0 ; k<outputNeurons ; k++){
          bzDelta.push(0)
          bz.push(Math.random() - 0.5)
        }
        let bxDelta = []
        for (let j = 0; j < middleNeurons; j++) {
            bx.push(Math.random() - 0.5)
            bxDelta.push(0)
        }
        
        for (let j = 0; j < middleNeurons; j++) {
          let subArray = []
          for (let k = 0; k < outputNeurons; k++) {
              subArray[k] = (Math.random() - 0.5)
          }
          weights[j] = [...subArray]
      }
      
    for (let j = 0; j < middleNeurons; j++) {
        weigthsDelta[j] = [];  
        for (let k = 0; k < outputNeurons; k++) {
            weigthsDelta[j][k] = 0; 
        }
    }

        let x = Array(inputNeurons).fill(0),
            z = Array(middleNeurons).fill(0),
            y = Array(outputNeurons).fill(0),
            final = Array(outputNeurons).fill(0),
            deltaK = Array(outputNeurons).fill(0),
            D = Array(middleNeurons).fill(0),
            zNetInputs = Array(middleNeurons).fill(0);
        let zNI = 0
        let yNI = 0
        let currentCategory = 0;
  

//forwarding
        while (stopCondition) {

            trainDataSet.forEach(item => {

                item.data.forEach((num, index) => {
                    x[index] = num
                })
                // console.log(x);
                zNI = 0

                for (let j = 0; j < middleNeurons; j++) {
                    zNI = bx[j];
                    for (let i = 0; i < inputNeurons; i++) {
                        zNI += (x[i] * vs[i][j]);
                    }
                    z[j] = (binarySigmoid(zNI));
                    zNetInputs[j] = zNI;
                }

                yNI = 0

                for (let k = 0; k < outputNeurons; k++) {
                    yNI = bz[k]
                    for (let j = 0; j < middleNeurons; j++) {
                        yNI += (z[j] * weights[j][k])
                    }
                    y[k] = binarySigmoid(yNI);
//back propagation                    
                    let moshtagY = binarySigmoidDerivative(yNI)
                    deltaK[k] = ((item.y[k] - y[k]) * moshtagY);
                    for (let j = 0; j < middleNeurons; j++) {
                        weigthsDelta[j][k] = (alpha * deltaK[k] * z[j])
                    }
                    bzDelta[k] = alpha * deltaK[k]
                }

                let deltaJ = Array(middleNeurons).fill(0);
                for (let j = 0; j < middleNeurons; j++) {
                    deltaJ[j] = 0;
                    for (let k = 0; k < outputNeurons; k++) {
                        D[j] = deltaK[k] * weights[j][k]; 
                        let moshtagZ = binarySigmoidDerivative(zNetInputs[j]); 
                        deltaJ[j] += D[j] * moshtagZ; 
                    }
                }


                for (let i = 0; i < inputNeurons; i++) {
                    for (let j = 0; j < middleNeurons; j++) {
                        vsDelta[i][j] = alpha * deltaJ[j] * x[i];
                        bxDelta[i] = alpha * deltaJ[j];
                    }
                }

//weight and bias update
                for (let i = 0; i < inputNeurons; i++) {
                    for (let j = 0; j < middleNeurons; j++) {
                        vs[i][j] += vsDelta[i][j];
                    }
                }


                for (let j = 0; j < middleNeurons; j++) {
                    for (let k = 0; k < outputNeurons; k++) {
                        weights[j][k] += weigthsDelta[j][k];
                    }
                }
                for(let j=0; j<middleNeurons;j++){
                            bx[j]+=bxDelta[j]
                        }
                          
                          for(let k=0; k<outputNeurons;k++){
                            bz[k]+=bzDelta[k]
                        }

            })

            epochCount++
            console.log(epochCount);

            





//شرط توقف با داده های  validation            
if(epochCount % 5 == 0){
  
  let categorySize = 50;

  let startIndex = currentCategory * categorySize;
  let endIndex = Math.min(startIndex + categorySize, validationDataSet.length);

  let allCorrect = true;

  for (let i = startIndex; i < endIndex; i++) {
      let item = validationDataSet[i];
      item.data.forEach((num, index) => {
          x[index] = num;
      });

      for (let j = 0; j < middleNeurons; j++) {
          zNI = bx[j];
          for (let i = 0; i < inputNeurons; i++) {
              zNI += x[i] * vs[i][j];
          }
          z[j] = binarySigmoid(zNI);
      }

      for (let k = 0; k < outputNeurons; k++) {
          yNI = bz[k];
          for (let j = 0; j < middleNeurons; j++) {
              yNI += z[j] * weights[j][k];
          }
          y[k] = binarySigmoid(yNI);

          final[k] = y[k] > 0.5 ? 1 : 0;
      }
       

      if (!arrayEqualityCheck(item.y, final)) {
          allCorrect = false;
          break;
      }
  }

  if (allCorrect) {
      stopCondition = false;
  } 
  else {
      currentCategory++;
  }
}
  
  if(epochCount == 2000){
    break
  }
  
            }

        console.log("finished at", epochCount, "epoches");
        showingModal("finished at " + epochCount + " epochs")

        saveWeights()
    
    Trainbtn.style.display = "none";
    
        
    })


function saveWeights(){
  const data = {
    weights,
    bx,
    bz,
    vs,
    inputNeurons,
    outputNeurons,
    testDataSet
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


