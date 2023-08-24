console.log("chrome extension go..!");

const teckInput = document.getElementById("documentNo");
const numInput = document.getElementById("vehicleNo2");
const capInput = document.getElementById("captcha_code");
const form = document.getElementById("form");

let data = [];
let currentIndex = 0;

async function fetchAndProcessData() {
    const apiUrl = "https://localhost:44371/api/UserCar/GetAllUserCars";

    try {
        const response = await fetch(apiUrl);
 
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const jsonData = await response.json();
        console.log(jsonData);
 
        submitForm(jsonData)

        // return jsonData;
    } catch (error) {
        throw new Error("Error fetching data from API: " + error.message);
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

 

async function submitForm(car) {
    teckInput.value = car.techPassportId;
    numInput.value = car.carNumber;
    const captchaSolution = await solveCaptcha();
    if (captchaSolution !== null) {
        capInput.value = captchaSolution;
  
        console.log("Submitting form...");
        form.submit();
        console.log("Form submitted!");
        await new Promise(resolve => setTimeout(resolve, 2000)); 
        

    }
}
async function processCar() {
 
    if (currentIndex < data.length) {
            const car = data[currentIndex];
            await submitForm(car);

    } else {
        console.log("All cars processed.!!");
    }
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
 }, 1000)

//  setInterval(() => {
//     console.log('ana');
//  }, 100);

//  0,1 წამში რო გაიმეორებს ამ კოდს ეგაა დააყენებ სიტყვაზე 10 წუთზე მერე 10 წუთში ერთხელ გამოიძახებ ამ ფუნქცხიას
//  შიგნით კიდე შეგიძლია ასეთი რამე ქნა  თუ სტატუს კოდი უდრის 417 თუ რაცაა ცვლადი გახადო false თუ 200 უდრის თრუე და მაგ შემთხვევაში გზავნო მარტო რექვესტი 
//  ცოტა ცუდი გამოსავალი კია :/


   
fetchAndProcessData();





