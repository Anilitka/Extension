let data;
let processedIndices = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "dataFetched") {
        data = request.data;
        initializeProcessedIndices(); 
        processAllCars();
    }
});

function initializeProcessedIndices() {
    chrome.storage.local.get("processedIndices", (result) => {
        processedIndices = result.processedIndices || [];
    });
}

async function processAllCars() {


        initializeProcessedIndices();
        chrome.storage.local.get("data", (result) => {
            data = result.data || [];
            

            let nextIndex = 0;
            while (processedIndices.includes(nextIndex)) {
                nextIndex++;
            }
            

            if (nextIndex < data.length) {
                chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        function: processNextCar,
                        args: [nextIndex] 
                    });
                });
            } else {
                console.log("All cars processed!");
            }
        });
    }
async function processNextCar(currentIndex) {
    if (currentIndex < data.length) {
        if (!processedIndices.includes(currentIndex)) {
            processedIndices.push(currentIndex);
            console.log(currentIndex)
            const car = data[currentIndex];
            await submitFormAndNavigate(car);

            data.shift();

            
           chrome.storage.local.set({ processedIndices, data });

         chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
         chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: navigateBack
        });
    });
        } else {
            currentIndex++;
            processNextCar();
        }
    } else {
        console.log("All cars processed...");
    }
}

