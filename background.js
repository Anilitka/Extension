chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "dataFetched") {
        data = request.data;
        processAllCars(); // Start processing all cars immediately after fetching data
    }
});