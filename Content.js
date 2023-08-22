console.log("chrome extension go!");

const teckInput = document.getElementById("documentNo");
const numInput = document.getElementById("vehicleNo2");
const capInput = document.getElementById("captcha_code");
const form = document.getElementById("form");

let data = [];

async function fetchFakeData() {
    const jsonUrl = chrome.runtime.getURL("fakejson.json");
    try {
        const response = await fetch(jsonUrl);
        const jsonData = await response.json();

        data = jsonData.cars; 

        processCars();
    } catch (error) {
        console.error("Error fetching or parsing JSON:", error);
    }
}

async function submitFormData(car) {

    teckInput.value = car.techPass;
    numInput.value = car.carNum;


    form.submit();
}

async function processCars() {
    for (const car of data) {
        await submitFormData(car);
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

fetchFakeData();
