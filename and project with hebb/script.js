let $ = document
let x1Value = $.querySelector(".firstInput")
let x2Value = $.querySelector(".secondInput")
let x1ValueTest = $.querySelector(".firstInputTest")
let x2ValueTest = $.querySelector(".secondInputTest")
let yValue = $.querySelector(".thirdInput")
let graph = $.querySelector("#linearPlot")
let trainBox = $.querySelector(".trainBox")
let testBox = $.querySelector(".testBox")
let trainBtn = $.querySelector(".trainBtn")
let testBtn = $.querySelector(".testBtn")
let modal = $.querySelector(".modal-parent")
let ModalValue = $.querySelector(".modalValue")
let exit = $.querySelector(".X")
let box = $.querySelector(".mainContainer")

//تابع بسته شدن مودال بعد 5 ثانیه
function closingModal(){
  setTimeout(function(){
    modal.style.display = "none"
  box.style.filter="blur(0px)"
  },5000)
}

//مقدار دهی های اولیه
let w1 = 0;
let w2 = 0;
let b = 0;
const andData = [];
//تابع الگوریتم هب
function trainFunc(x1,x2,y){
  w1 += x1*y
  w2 += x2*y
  b += y
  
  console.log(w1)
  console.log(w2)
  console.log(b)
  x1Value.value = ""
  x2Value.value = ""
  yValue.value = ""

}
// رسم نمودار
function drawGraph(){
  const x1Values = andData.map(point => point.x1);
  const x2Values = andData.map(point => point.x2);
  const yValues = andData.map(point => point.y);

  // تنظیمات نقاط داده ها
  const andScatter = {
    x: x1Values,
    y: x2Values,
    mode: 'markers',
    marker: {
        color: yValues.map(y => (y === 1 ? '#660066' : '#FFB2D0')), 
        size: 10
    },
    name: 'AND Points'
  };

  //محاسبات مربوط به خط جدا کننده
  // محاسبه خط تصمیم
  const x1Range = [-1.5, 1.5];
  const x2Line = x1Range.map(x1 => (-b - w1 * x1) / w2);

  //تنظیمات خط جداکننده تابع
  const line = {
    x: x1Range,
    y: x2Line,
    mode: 'lines',
    line: {
        color: '#660066',  
        width: 2
    },
    name: 'Decision Boundary'
};
 // تنظیمات چیدمان نمودار
 const layout = {
  title: 'Decision Boundary graph',
  xaxis: {
      title: 'x1',
      range: [-1.5, 1.5]
  },
  yaxis: {
      title: 'x2',
      range: [-1.5, 1.5]
  },
  plot_bgcolor: 'rgba(255, 255, 255, 0.2)',
  paper_bgcolor: 'rgba(255, 255, 255, 0.2)'
};

// رسم نمودار با استفاده از Plotly
Plotly.newPlot('linearPlot', [andScatter, line], layout);
}

// تابعی برای بررسی وجود مقادیر تکراری
function isDuplicate(x1, x2, y) {
  return andData.some(point => point.x1 === x1 && point.x2 === x2 && point.y === y);
}


// تابعی برای اضافه کردن نقطه
function addPoint() {
const x1 = parseInt(x1Value.value);
const x2 = parseInt(x2Value.value);
const y = parseInt(yValue.value);
//بررسی مقادیر تکراری
if (isDuplicate(x1, x2, y)) {
  x1Value.value = ""
  x2Value.value = ""
  yValue.value = ""
  modal.style.display = "block"
  ModalValue.innerHTML = "this point already exists"
  closingModal()
  return;
}
//بررسی اینکه حتما +1 یا -1 وارد شود
if (x1 !== 1 && x1 !== -1) {
  modal.style.display = "block"
  ModalValue.innerHTML = "x1 must be either 1 or -1"
  box.style.filter="blur(10px)"
  closingModal()
  return;
}
if (x2 !== 1 && x2 !== -1) {
  modal.style.display = "block"
  ModalValue.innerHTML = "x2 must be either 1 or -1"
  box.style.filter="blur(10px)"
  closingModal()
  return;
}
if (y !== 1 && y !== -1) {
  modal.style.display = "block"
  ModalValue.innerHTML = "y must be either 1 or -1"
  box.style.filter="blur(10px)"
  closingModal()
  return;
}

// اضافه کردن نقطه جدید
andData.push({ x1, x2, y });

// به‌روز کردن وزن‌ها و بایاس با الگوریتم Hebb
trainFunc(x1,x2,y)

// رسم مجدد نمودار
drawGraph();
}


trainBtn.addEventListener("click",function(){
  graph.style.display = "block"
  addPoint()
  
  if (andData.length == 4) {
    setTimeout(() => {
      modal.style.display = "block"
      ModalValue.innerHTML = "your AI is trained,time for test"
      box.style.filter="blur(10px)"
      closingModal()
      trainBox.style.display = "none"
      testBox.style.display = "block"
      testBox.style.display = "flex"

    }, 200)}

})

testBtn.addEventListener("click", function(){
  let finalResult = null
  
  let x1 = parseFloat(Number(x1ValueTest.value));
  let x2 = parseFloat(Number(x2ValueTest.value));

  if (!isNaN(x1) && !isNaN(x2)) {

    let y = b + w1 * x1 + w2 * x2

    if (y < 0) {
      finalResult = -1
    } else {
      finalResult = +1
    }
    modal.style.display = "block"
    ModalValue.innerHTML = `result : ${finalResult}`
    box.style.filter="blur(10px)"
    closingModal()
  } else {
    modal.style.display = "block"
    ModalValue.innerHTML = "please enter right amount of numbers"
    box.style.filter="blur(10px)"
    closingModal()
  }
  x1ValueTest.value = ""
  x2ValueTest.value = ""

})
//بستن مودال
exit.addEventListener('click', function(){
  modal.style.display = "none"
  box.style.filter="blur(0px)"
  
})
//بستن مودال با دکمهesc از کیبورد
$.body.addEventListener('keyup', function(event){
  if (event.keyCode === 27){
    modal.style.display = "none"
    box.style.filter="blur(0px)"
    

  }
})

