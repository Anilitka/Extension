

console.log("chrome extension go..!");

const teckInput = document.getElementById("documentNo");
const numInput = document.getElementById("vehicleNo2");
const capInput = document.getElementById("captcha_code");
const form = document.getElementById("form");
const isLoginPage = window.location.href.includes("https://videos.police.ge/protocols.php?lang=ge");
const warning = document.getElementsByClassName("warning");
 

let data = [];
let currentIndex = 0;

let isProcessing = false; 


if(!isLoginPage){
    
    fetchAndProcessData()  
}
if(isLoginPage){
    processRows();
}
async function fetchAndProcessData() {


    if (isProcessing) {
        return;
    }

    isProcessing = true;

    const apiUrl = 'https://' + getQueryParam();

    console.log("Before API call: ", getQueryParam());
    console.log("Before API call: apiUrl =", apiUrl);
    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const car = await response.json();

            if (car) {
                console.log(car);
                
                await submitForm(car);
            } else {
                console.log("All cars processed!!");
            }
        } else {
            throw new Error("Invalid response format");
        }
    } catch (error) {
        console.error("Error fetching and processing data:", error);
    } finally {
        isProcessing = false;
    }
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
                    `https://`
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

 
async function submitForm(car) {
    teckInput.value = car.techPassportId;
    numInput.value = car.carNumber;
    const captchaSolution = await solveCaptcha();


    if (captchaSolution !== null) {
        capInput.value = captchaSolution;

        console.log("Warning element:", warning);
        
        setTimeout(() => {
            console.log("Submitting form...");
             form.submit();
             console.log("Form submitted!");      
        }, 3000)
  
         fetchAndProcessData(); 

    }
}
function getQueryParam() {
    const warning = document.querySelector(".warning");
    
    if (warning !== null) {
    const message = warning.textContent;
    if(message.includes("ადმინისტრაციული სამართალდარღვევები ვერ მოიძებნა.")){
        return "true";
    }else{
     return "false";    
    }
    } else {
        return "true";
    }
}

async function processRows() {
    const rows = document.querySelectorAll('.row');
   let paid;
    rows.forEach(row => {
        const fineNum = row.querySelector('.col:nth-child(2)');
        const fineDate = row.querySelector('.col:nth-child(3)');
        const fineArticle = row.querySelector('.col:nth-child(4)');
        const fineAmount = row.querySelector('.col:nth-child(5)');
        const fineStatus = row.querySelector('.col:nth-child(7)');

       

        if (fineNum && fineDate && fineArticle && fineAmount && fineStatus) {
            const fineNumText = fineNum.textContent.trim();           
            const fineDateText = fineDate.textContent.trim().slice(0, 10);
            const fineArticleText = fineArticle.textContent.trim();
            const finAmountText = parseInt(fineAmount.textContent.trim().slice(0, -4));
            const fineStatusText = fineStatus.textContent.trim();
         
            if (fineStatusText.includes('გადაუხდელია')) {
                paid = false;
            } else {
                paid = true;
            }
            console.log(paid);
            const receivedData = {
                receiptNumber: fineNumText,
                date: fineDateText,
                article: fineArticleText,
                amount: finAmountText,
                paid: paid
            };

            data.push(receivedData);
            console.log(receivedData);
        }
    });

    const url = 'https://';
 

        const formattedData = data.map(item => ({
            receiptNumber: item.receiptNumber,
            date: item.date,
            article: item.article,
            amount: item.amount,
            paid: item.paid
        }));
        console.log(formattedData)
         
        const formattedData1 = JSON.stringify(formattedData);
        console.log(formattedData1)

        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin':'*'
            },
            body: formattedData1
        });

        if (response.ok) {
            console.log('Data sent to backend successfully');

        } else {
            console.error('Failed to send data to backend');
        }
        console.log(response)

}

async function navigateBack() {
    const backButtonSelector = 'input[type="submit"][value="უკან დაბრუნება"]';

    const backButton = document.querySelector(backButtonSelector);
    if (backButton) {
        backButton.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
        teckInput.value = '';
        numInput.value = '';
        capInput.value = '';
    }
}


setTimeout(() => {
    navigateBack();
},5000)
