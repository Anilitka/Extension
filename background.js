let currentIndex = 0;
let data; // Define data variable in the background script

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "dataFetched") {
        data = request.data;
        processAllCars();
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "storeIndex") {
        currentIndex = request.index;
        chrome.storage.local.set({ currentIndex }); // Store in chrome.storage
    } else if (request.action === "requestStoredIndex") {
        // Respond with the stored index when requested by the content script
        sendResponse({ storedIndex: currentIndex });
    } else if (request.action === "startProcessing") {
        processAllCars();
    }
});

async function processAllCars() {
    try {
        const storedIndex = await new Promise(resolve => {
            chrome.storage.local.get(["currentIndex"], (result) => {
                resolve(result.currentIndex);
            });
        });

        currentIndex = storedIndex || currentIndex;

        while (currentIndex < data.length) {
            const car = data[currentIndex];
            await submitFormAndNavigate(car);
            currentIndex++;
        }

        console.log("All cars processed.");
    } catch (error) {
        console.error("Error processing cars:", error);
    }
}


chrome.runtime.onInstalled.addListener(() => {
    chrome.action.onClicked.addListener(tab => {
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            function: startProcessing
        });
    });
});