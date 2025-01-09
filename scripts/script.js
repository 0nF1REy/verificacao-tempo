const API_KEY = '84f3aa180b43d72679017431454b7c84'; // Substitua pela sua chave da API OpenWeather
const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');
const weatherInfoSection = document.querySelector('.weather-info');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');
const countryTxt = document.querySelector('.country-txt')
const tempTxt = document.querySelector('.temp-txt');
const apiKey = API_KEY;
const conditionTxt = document.querySelector('.condition-txt');
const humidityValueTxt = document.querySelector('.humidity-value-txt');
const windValueTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDateTxt = document.querySelector('.current-date-txt');
const forecastItemsContainer = document.querySelector('.forecast-items-container');

searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() != '') {
        updateWeatherInfo(cityInput.value)
        cityInput.value = ''
        cityInput.blur()
    }
});

cityInput.addEventListener('keydown', (event) => {
    if (event.key == 'Enter' &&
        cityInput.value.trim() != ''
    ) {
        updateWeatherInfo(cityInput.value)
        cityInput.value = ''
        cityInput.blur()
    }
});

async function getFetchData(endPoint, city) {

    const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&lang=pt_br&units=metric`
    const response = await fetch(apiUrl)
    return response.json()
};

function getWeaatherIcon(id) {
    if (id <= 232) return 'thunderstorm.svg'
    if (id <= 321) return 'drizzle.svg'
    if (id <= 531) return 'rain.svg'
    if (id <= 622) return 'snow.svg'
    if (id <= 781) return 'atmosphere.svg'
    if (id <= 800) return 'clear.svg'
    else return 'clouds.svg'
}

function getCurrentDate() {
    const currentDate = new Date()
    const options = {
        weekday: 'long',
        day: '2-digit',
        month: 'short'
    }
    return currentDate.toLocaleDateString('pt-BR', options)
}

async function updateWeatherInfo(city) {
    const weatherData = await getFetchData('weather', city)
    if (weatherData.cod != 200) {
        showDisplaySection(notFoundSection)
        return
    }

    const {
        name: country,
        main: { temp, humidity },
        weather: [{ id, description }],
        wind: { speed }
    } = weatherData

    countryTxt.textContent = country
    tempTxt.textContent = Math.round(temp) + ' °C'
    conditionTxt.textContent = description
    humidityValueTxt.textContent = humidity + ' %'
    windValueTxt.textContent = speed + ' M/s'
    currentDateTxt.textContent = getCurrentDate()
    weatherSummaryImg.src = `./assets/svg/${getWeaatherIcon(id)}`;

    await updateForecastsInfo(city)
    showDisplaySection(weatherInfoSection)
};

async function updateForecastsInfo(city) {
    const forecastsData = await getFetchData('forecast', city)
    forecastItemsContainer.innerHTML = '';

    if (!forecastsData || !forecastsData.list) {
        console.error("Erro ao obter dados de previsão: ", forecastsData)
        return;
    }

    const forecastsByDay = {};
    forecastsData.list.forEach(forecastWeather => {
        const date = forecastWeather.dt_txt.split(' ')[0];
        if (!forecastsByDay[date]) {
            forecastsByDay[date] = [];
        }
        forecastsByDay[date].push(forecastWeather);
    });

    for (const day in forecastsByDay) {
        const middayForecast = findClosestToMidday(forecastsByDay[day]);
        if (middayForecast) {
            updateForecastItems(middayForecast)
        }
    }
}

function findClosestToMidday(forecasts) {
    const middayTime = '12:00:00';
    let closestForecast = null;
    let minDiff = Infinity;

    forecasts.forEach(forecast => {
        const time = forecast.dt_txt.split(' ')[1]
        const diff = Math.abs(new Date(`1970-01-01T${time}.000Z`) - new Date(`1970-01-01T${middayTime}.000Z`))

        if (diff < minDiff) {
            minDiff = diff;
            closestForecast = forecast
        }
    })

    return closestForecast;
}

function updateForecastItems(weatherData) {
    const {
        dt_txt: date,
        weather: [{ id }],
        main: { temp }
    } = weatherData

    const dateTaken = new Date(date)
    const dateOptions = {
        weekday: 'short',
    };
    let dateResult = dateTaken.toLocaleDateString('pt-BR', dateOptions);


    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
            <img src="./assets/svg/${getWeaatherIcon(id)}"  class="forecast-item-img">
            <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
         </div>
    `

    forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem)
}

function showDisplaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection]
        .forEach(section => section.style.display = 'none')

    section.style.display = 'flex'
}

const imageUrl = 'https://picsum.photos/1920/1089?random=1';

const img = new Image();
img.src = imageUrl;


img.onload = () => {

    document.getElementById('loading').style.display = 'none';

};

function getRandomHexColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
}

function createRandomGradientKeyframes() {
    const color1 = getRandomHexColor();
    const color2 = getRandomHexColor();
    const color3 = getRandomHexColor();

    const keyframes = `
        @keyframes gradient-animation {
            0% { background: linear-gradient(45deg, ${color1}, ${color2}); background-position: 0% 50%; }
            50% { background: linear-gradient(135deg, ${color2}, ${color3}); background-position: 100% 50%; }
            100% { background: linear-gradient(225deg, ${color3}, ${color1}); background-position: 0% 50%; }
        }
    `;
    return keyframes;
}

function injectKeyframes() {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerHTML = createRandomGradientKeyframes();
    document.head.appendChild(styleSheet);
}

function applyLoadingAnimation() {
    const loadingElement = document.getElementById("loading");
    loadingElement.style.background = `linear-gradient(45deg, ${getRandomHexColor()}, ${getRandomHexColor()})`;
    loadingElement.style.backgroundSize = "400% 400%";
}

injectKeyframes();
applyLoadingAnimation();