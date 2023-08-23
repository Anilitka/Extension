
console.log("chrome extension go!");

const teckInput = document.getElementById("documentNo");
const numInput = document.getElementById("vehicleNo2");
const capInput = document.getElementById("captcha_code");
const form = document.getElementById("form");


let data = [];
let currentIndex = 0;


async function fetchFakeData() {

    // const jsonUrl = "fakejson.json"; // Adjust the URL as needed
    // try {
    //     const response = await fetch(jsonUrl);
    //     const jsonData = await response.json();
    //     data = jsonData.cars;

    //     for (let i = currentIndex; i < data.length; ) {
    //         const car = data[currentIndex];
    //         submitFormData(car);
    //     }Function sendGETRequest() {
    fetch(URL, { method: "GET", headers: {'Content-Type': 'fakejson.json'}})
    .then(response => response.json())
    .then(data => {
       chrome.storage.local.set({"currentIndex": 0})

        for (let i = currentIndex; i < data.length;) {
        chrome.storage.local.get(['currentIndex'], (result) => {
            const currentIndex = result.currentIndex || 0;
            // Incremented currentIndex will be used in the next loop iteration
            i = currentIndex;
        });
        console.log(chrome.storage.local.get(['currentIndex']))
            const car = data[i];
            submitFormData(car);
        }

//      chrome.storage.sync.set({ "index": 0 }); chrome.storage.local.set({ "data": data });
//      chrome.storage.sync.set({ "currentData": data[0] });
//      })
//      state = false;
//      chrome.storage.sync.set({ "state": state });
//      window.close();
//      chrome.runtime.sendMessage({ message: "writeCarNumber" });
//      .catch((error) => {
// console.log(error);
//      });
     
    })
    .catch ((error) => {
        console.error("Error fetching or parsing JSON:", error);
    })
}
    

async function solveCaptcha() {
    const apiKey = '5e53dcfd4c785787b7fd85aad8544a2a';
    const captchaImageElement = document.querySelector('#captcha_code_img');

    // Fetch the captcha image as base64
    const response = await fetch(captchaImageElement.src);
    const blob = await response.blob();

    const reader = new FileReader();
    reader.readAsDataURL(blob);

    const base64ImageData = await new Promise(resolve => {
        reader.onloadend = () => {
            const base64Data = reader.result.split(',')[1];
            resolve(base64Data);
        };
    });


    const formData = new FormData();
    formData.append('method', 'base64');
    formData.append('key', apiKey);
    formData.append('body', base64ImageData);

    try {
        const solutionResponse = await fetch('https://2captcha.com/in.php', {
            method: 'POST',
            body: formData,
        });

        const solutionData = await solutionResponse.text();

        if (solutionData.startsWith('OK|')) {
            const captchaId = solutionData.split('|')[1];

            while (true) {
                const checkSolutionResponse = await fetch(
                    `https://2captcha.com/res.php?key=${apiKey}&action=get&id=${captchaId}&json=1`
                );
                const checkSolutionData = await checkSolutionResponse.json();

                if (checkSolutionData.status === 1) {
                    return checkSolutionData.request;
                }

                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        } else {
            console.error('Captcha solving failed:', solutionData);
            return null;
        }
      } catch (error) {
        console.error('Error solving CAPTCHA:', error);
        return null;
    }
}



async function submitFormData(car) {
    const teckInput = document.querySelector("#documentNo");
    const numInput = document.querySelector("#vehicleNo2");
    const capInput = document.querySelector("#captcha_code");

    teckInput.value = car.techPass;
    numInput.value = car.carNum;

    const captchaSolution = await solveCaptcha();
    if (captchaSolution !== null) {
        capInput.value = captchaSolution;
 
        form.submit();
        chrome.storage.local.get(['currentIndex'], (result) => {
            const currentIndex = result.currentIndex || 0;
            chrome.storage.local.set({ currentIndex: currentIndex + 1 });
        });
    } else {
        console.log("Captcha solution failed for this car. Skipping.");
    }

}



async function waitForElement(selector) {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(interval);
                resolve(element);
            }
        }, 100);
    });
}

function navigateBack() {
    const backButton = document.querySelector('input[type="submit"][value="უკან დაბრუნება"]');
        backButton.click();

}

fetchFakeData();

setTimeout(() => {
    navigateBack();
}, 1000)