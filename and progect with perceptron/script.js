let $ = document;
let trainBox = $.querySelector(".trainBox");
let testBox = $.querySelector(".testBox");
let x1Value = $.querySelector(".firstInput");
let x2Value = $.querySelector(".secondInput");
let x1ValueTest = $.querySelector(".firstInputTest");
let x2ValueTest = $.querySelector(".secondInputTest");
let yValue = $.querySelector(".thirdInput");
let subBtn = $.querySelector(".subBtn");
let trainBtn = $.querySelector(".trainBtn");
let testBtn = $.querySelector(".testBtn");
let modal = $.querySelector(".modal-parent");
let ModalValue = $.querySelector(".modalValue");
let exit = $.querySelector(".X");
let box = $.querySelector(".mainContainer");

// تابع بسته شدن مودال بعد 3 ثانیه
function closingModal() {
    setTimeout(function () {
        modal.style.display = "none";
        box.style.filter = "blur(0px)";
    }, 3000);
}

// مقدار دهی های اولیه
let w1 = 0;
let w2 = 0;
let b = 0;
let teta = 0.2;
let alpha = 1;
let y = null;
let trainData = [];

// تابع برای ذخیره داده های ترین در یک ارایه
function saveData(x1, x2, target) {
    let dataObject = {
        x1,
        x2,
        target
    };
    trainData.push(dataObject);
}

// تابع الگوریتم پرسپترون
function perceptronAlgorithm() {
    let epochcount = 0;
    let errorExists;
    let w1Old = 0
    let w2Old = 0
    let bOld = 0

    do {
        w1Old = w1
        w2Old = w2
        bOld = b
        trainData.forEach(function (epoch) {
            let x1 = epoch.x1;
            let x2 = epoch.x2;
            let target = epoch.target;
            let yNI = w1 * x1 + w2 * x2 + b;
            if (yNI > teta) {
                y = 1;
            } else if (yNI < -teta) {
                y = -1;
            } else {
                y = 0;
            }
            if (y !== target) {
                w1 += alpha * x1 * target;
                w2 += alpha * x2 * target;
                b += alpha * 1 * target;
            }
        });
        if(w1 == w1Old && w2 == w2Old && b == bOld){
            errorExists = false
        }
        epochcount++;
        console.log("Epoch:", epochcount, "w1:", w1, "w2:", w2, "b:", b);
    } while (errorExists);

    console.log("your system Training is finished after", epochcount, "epochs.");
    saveWeights(); // ذخیره وزن‌ها پس از آموزش
}

// تابع برای ذخیره وزن‌ها در فایل JSON
function saveWeights() {
    const dataOftrain = {
        w1,
        w2,
        b
    };

    const jsonData = JSON.stringify(dataOftrain);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'weightsAndBias.json';  // نام فایلی که دانلود می‌شود
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log("Data has been saved as JSON file!");
    
}

// تابع برای بارگذاری وزن‌ها از فایل JSON
function loadWeights() {
    fetch("weightsAndBias.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error("File not found");
            }
            return response.json();
        })
        .then((data) => {
            if (data && typeof data.w1 === 'number' && typeof data.w2 === 'number' && typeof data.b === 'number') {
                w1 = data.w1;
                w2 = data.w2;
                b = data.b;
                console.log("Loaded weights:", w1, w2, b);
                trainBox.style.display = "none";
                testBox.style.display = "block";
            } else {
                console.warn("Invalid data format in JSON file. Using default weights.");
                w1 = 0;
                w2 = 0;
                b = 0;
            }
        })
        .catch((error) => {
            console.error("Error loading data:", error);
            w1 = 0;
            w2 = 0;
            b = 0;
        });
}

subBtn.addEventListener("click", function () {
    let x1 = parseFloat(x1Value.value);
    let x2 = parseFloat(x2Value.value);
    let target = parseFloat(yValue.value);

    // بررسی اینکه حتما +1 یا -1 وارد شود
    if (x1 !== 1 && x1 !== 0) {
        modal.style.display = "block";
        ModalValue.innerHTML = "x1 must be either 1 or 0";
        box.style.filter = "blur(10px)";
        closingModal();
        return;
    }
    if (x2 !== 1 && x2 !== 0) {
        modal.style.display = "block";
        ModalValue.innerHTML = "x2 must be either 1 or 0";
        box.style.filter = "blur(10px)";
        closingModal();
        return;
    }
    if (target !== 1 && target !== -1) {
        modal.style.display = "block";
        ModalValue.innerHTML = "y must be either 1 or -1";
        box.style.filter = "blur(10px)";
        closingModal();
        return;
    }
    saveData(x1, x2, target);
    console.log(`trainData is x1: ${x1}, x2: ${x2}, y: ${target}`);

    x1Value.value = "";
    x2Value.value = "";
    yValue.value = "";
});

trainBtn.addEventListener("click", function () {
    trainBox.style.display = "none";
    testBox.style.display = "block";
    perceptronAlgorithm();
    modal.style.display = "block";
    ModalValue.innerHTML = "your AI is trained, time for test";
    box.style.filter = "blur(10px)";
    closingModal();
});

testBtn.addEventListener("click", function () {
    let finalResult = null;

    let x1 = parseFloat(Number(x1ValueTest.value));
    let x2 = parseFloat(Number(x2ValueTest.value));

    if (!isNaN(x1) && !isNaN(x2)) {
        let y = b + w1 * x1 + w2 * x2;

        if (y < 0) {
            finalResult = -1;
        } else {
            finalResult = 1;
        }
        modal.style.display = "block";
        ModalValue.innerHTML = `result: ${finalResult}`;
        box.style.filter = "blur(10px)";
        closingModal();
    } else {
        modal.style.display = "block";
        ModalValue.innerHTML = "please provide valid inputs";
        box.style.filter = "blur(10px)";
        closingModal();
    }

    x1ValueTest.value = "";
    x2ValueTest.value = "";
});

exit.addEventListener("click", function () {
    modal.style.display = "none";
    box.style.filter = "blur(0px)";
});

// بارگذاری وزن‌ها از فایل JSON در شروع
loadWeights();
