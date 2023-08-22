console.log("chrome extension go!");

const teckInput = document.getElementById("documentNo");
const numInput = document.getElementById("vehicleNo2");
const capInput = document.getElementById("captcha_code");

async function fetchFakeData() {
    const jsonUrl = chrome.runtime.getURL("fakejson.json");
    try {
        const response = await fetch(jsonUrl);
        const jsonData = await response.json();

        teckInput.value = jsonData.techPass;
        numInput.value = jsonData.carNum;
    } catch (error) {
        console.error("Error fetching or parsing JSON:", error);
    }
}

fetchFakeData();
