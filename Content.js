console.log("chrome extension go..!");

const teckInput = document.getElementById("documentNo");
const numInput = document.getElementById("vehicleNo2");
const capInput = document.getElementById("captcha_code");
const form = document.getElementById("form");

let data = [];
let currentIndex = 0;

async function fetchFakeData() {
    const jsonUrl = chrome.runtime.getURL("fakejson.json");
    try {
        const response = await fetch(jsonUrl);
        const jsonData = await response.json();

        data = jsonData.cars;
    } catch (error) {
        console.error("Error fetching or parsing JSON:", error);
    }
    console.log("Fetched data:", data);
}

chrome.runtime.sendMessage({ action: "dataFetched", data: data });

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

    // Send base64 image data to 2Captcha for solving
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

async function submitFormAndNavigate(car) {
    teckInput.value = car.techPass;
    numInput.value = car.carNum;

    const captchaSolution = await solveCaptcha();
    if (captchaSolution !== null) {
        capInput.value = captchaSolution;
        form.submit();
        await new Promise(resolve => setTimeout(resolve, 2000)); // Delay after form submission
        await navigateBack();
    }
}
async function processNextCar(carIndex) {
    if (carIndex < data.length) {
        const car = data[carIndex];
        await submitFormAndNavigate(car);

        // Process the next car after a delay
        setTimeout(() => {
            processNextCar(carIndex + 1);
        }, 2000); // Delay after form submission
    } else {
        console.log("All cars processed.");
    }
}

async function processAllCars() {
    try {
        // Send a message to the background script to request the stored index
        chrome.runtime.sendMessage({ action: "requestStoredIndex" }, async (response) => {
            currentIndex = response.storedIndex || currentIndex;

            while (currentIndex < data.length) {
                const car = data[currentIndex];
                await submitFormAndNavigate(car);
                currentIndex++;
            }

            console.log("All cars processed.");
        });
    } catch (error) {
        console.error("Error processing cars:", error);
    }
}


chrome.runtime.sendMessage({ action: "storeIndex", index: currentIndex });


chrome.runtime.sendMessage({ action: "startProcessing" });

async function navigateBack() {
    const backButtonSelector = 'input[type="submit"][value="უკან დაბრუნება"]';

    const waitForButtonAndProcessNextCar = async () => {
        const backButton = document.querySelector(backButtonSelector);
        if (backButton) {
            backButton.click();
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for navigation
            currentIndex++; // Increment index for the next car
            processNextCar(); // Process the next car
        } else {
            setTimeout(waitForButtonAndProcessNextCar, 1000); // Retry after 1 second
        }
    };

    waitForButtonAndProcessNextCar();
}

fetchFakeData()
    
setTimeout(async () => {
    await fetchFakeData();
    processNextCar(0); 
}, 5000);

