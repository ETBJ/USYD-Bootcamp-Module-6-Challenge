const key = 'f35cbdffa7ea4e7d1e13e8b7d4fff971';
const searchBtnEl = document.getElementById('searchBtn');
const searchInputEl = document.getElementById('citySearch');
const cityNameEl = document.getElementById('cityName');
const forecastRowEl = document.getElementById('forecastRow');
let history = [];

const init = () => {
    history = localStorage.getItem('SearchHistory');
    if (history === null) {
        console.log('No search history');
        history = [];
    } else {
        history = JSON.parse(history);
        displayHistory();
    }
}

const searchHandler = () => {
    const cityName = searchInputEl.value;
    if (cityName == '') {
        console.log('Search bar is empty');
    } else {
        cityNameEl.innerHTML = cityName;
        apiFetchCurrent(cityName);
        apiFetchForecast(cityName);
    }
}

const historyBtnClick = (event) => {
    const btnEl = event.target;
    const cityName = btnEl.innerHTML;
    cityNameEl.innerHTML = cityName;
    apiFetchCurrent(cityName);
    apiFetchForecast(cityName);
}

const updateHistory = (city) => {
    for (let i = 0; i < history.length; i++) {
        const element = history[i];
        if (city === element) {
            history.splice(i, 1);
            history.unshift(element);
            localStorage.setItem('SearchHistory', JSON.stringify(history));
            displayHistory();
        }
    }
    if (history[0] === city) {
        return;
    } else {
        history.unshift(city);
        localStorage.setItem('SearchHistory', JSON.stringify(history));
        displayHistory();
    }
}

const apiFetchCurrent = (city) => {
    const apiURL = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + key + '&units=metric';
    fetch(apiURL)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            if (data.cod == 200) {
                displayCurrentWeather(data);
                updateHistory(city);
            } else {
                renderError(data);
            }
        });
}

const apiFetchForecast = (city) => {
    const apiURL = 'https://api.openweathermap.org/data/2.5/forecast?q=' + city + '&appid=' + key + '&units=metric';
    fetch(apiURL)
        .then((response) => response.json())
        .then((data) => {
            if (data.cod == 200) {
                forecastWeatherHandler(data);
            }
        });
}

const renderError = (data) => {
    const currentSectionEl = document.getElementById('currentSection');
    const forecastSectionEl = document.getElementById('forecastSection');
    const errorCodeEl = document.createElement('h2');
    const errorDescEl = document.createElement('h3');
    errorCodeEl.innerHTML = 'Error - ' + data.cod;
    if (data.cod == 401) {
        errorDescEl.innerHTML = 'Invalid API key';
    } else if (data.cod == 404) {
        errorDescEl.innerHTML = 'City not found.';
    } else {
        errorDescEl.innerHTML = 'Unknown error.';
    }
    currentSectionEl.style.visibility = 'hidden';
    forecastSectionEl.style.visibility = 'hidden';
    currentSectionEl.insertBefore(errorDescEl, currentSectionEl.firstChild);
    currentSectionEl.insertBefore(errorCodeEl, currentSectionEl.firstChild);
    errorCodeEl.setAttribute('id', 'errorCode');
    errorDescEl.setAttribute('id', 'errorDesc');
    errorCodeEl.style.visibility = 'visible';
    errorDescEl.style.visibility = 'visible';
}

const displayCurrentWeather = (data) => {
    const errorCodeEl = document.getElementById('errorCode');
    const errorDescEl = document.getElementById('errorDesc');
    if (errorCodeEl) {
        errorCodeEl.remove();
        errorDescEl.remove();
    }
    const currentWeatherEl = document.getElementById('currentSection');
    const currentCondImgEl = document.getElementById('condImg');
    const currentTempEl = document.getElementById('currentTemp');
    const currentWindEl = document.getElementById('currentWind');
    const currentHumidityEl = document.getElementById('currentHumidity');
    currentWeatherEl.style.visibility = 'visible';
    currentCondImgEl.setAttribute('src', 'https://openweathermap.org/img/wn/' + data.weather[0].icon + '@2x.png');
    currentTempEl.innerHTML = data.main.temp + '&degC';
    currentWindEl.innerHTML = data.wind.speed + ' m/s';
    currentHumidityEl.innerHTML = data.main.humidity + '%';
}

const forecastWeatherHandler = (data) => {
    const arraydays = [7, 15, 23, 31, 39];
    forecastRowEl.innerHTML = '';
    for (let i = 0; i < arraydays.length; i++) {
        const element = arraydays[i];
        DisplayForecast(data.list[element]);
    }
}

const DisplayForecast = (array) => {
    const forecastSectionEl = document.getElementById('forecastSection');
    const forecastCardEl = document.createElement('section');
    const forecastDateEl = document.createElement('h5');
    const forecastCondImgEl = document.createElement('img');
    const forecastTempEl = document.createElement('p');
    const forecastWindEl = document.createElement('p');
    const forecastHumidityEl = document.createElement('p');
    forecastCardEl.setAttribute('class', 'col-6 col-sm-4 col-md-3 col-lg-auto forecastCard');
    let date = dayjs.unix(array.dt).format('DD/MM/YYYY');
    forecastDateEl.innerHTML = date;
    forecastCondImgEl.setAttribute('src', 'https://openweathermap.org/img/wn/' + array.weather[0].icon + '@2x.png');
    forecastTempEl.innerHTML = 'Temp: ' + array.main.temp + '&degC';
    forecastWindEl.innerHTML = 'Wind: ' + array.wind.speed + ' m/s';
    forecastHumidityEl.innerHTML = 'Humidity: ' + array.main.humidity + '%';
    forecastCardEl.appendChild(forecastDateEl);
    forecastCardEl.appendChild(forecastCondImgEl);
    forecastCardEl.appendChild(forecastTempEl);
    forecastCardEl.appendChild(forecastWindEl);
    forecastCardEl.appendChild(forecastHumidityEl);
    forecastRowEl.appendChild(forecastCardEl);
    forecastSectionEl.style.visibility = 'visible';
}

const displayHistory = () => {
    const historyListEl = document.getElementById('searchHistoryList');
    historyListEl.innerHTML = '';
    for (let i = 0; i < history.length; i++) {
        const element = history[i];
        const historyBtn = document.createElement('button');
        historyBtn.setAttribute('class', 'historyItem btn btn-secondary');
        historyBtn.innerHTML = element;
        historyListEl.appendChild(historyBtn);
    }
    const items = document.querySelectorAll('.historyItem');
    if (items) {
        items.forEach(item => {
            item.addEventListener('click', historyBtnClick);
        });
    }
}

searchBtnEl.addEventListener('click', searchHandler);
init();
