const apiKey = "17ed43d4cafa2a1e3ad540507b8ce715";
const url = `https://api.openweathermap.org/data/2.5/forecast`;
const cityInput = document.querySelector("#city-input");
const dataContainer = document.querySelector(".data-container");
const locationForm = document.querySelector("#location-form");


window.addEventListener("load", e => {
    getLocation();
})

locationForm.addEventListener("submit", e => {
    e.preventDefault();
    $("#city-input").blur();
})

cityInput.addEventListener("keydown", e => {
    if (e.which === 13) {
        const cityName = cityInput.value;
        getCurrentWeather(cityName);
    }
})

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
}

function showPosition(position) {
    fetchPositionAPI(position.coords.latitude, position.coords.longitude);
}


function fetchPositionAPI(latitude, longitude) {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    $.ajax({
        url: url,
        type: "GET",
        success: function (response) {
            setPosition(response);
        },
        error: function (error) {
            console.log("Cannot set position: " + error);
        }
    })

}

function setPosition(response) {
    cityInput.value = response.city;
}

function fetchWeatherAPI(cityName) {
    $.ajax({
        url: url,
        type: "GET",
        data: {
            q: cityName,
            units: "metric",
            appid: apiKey,
            compact: "ultra"
        },
        success: function (response) {
            if (!cityInput.classList.contains("input-up")) {
                cityInput.classList.add("input-up");
            }
            showWeatherInfo(response);
            dataContainer.classList.toggle("show-data");
            if (!dataContainer.classList.contains("data-up")) {
                dataContainer.classList.add("data-up");
            }
        },
        error: function (xhr, options, error) {
            if (!cityInput.classList.contains("input-up")) {
                cityInput.classList.add("input-up");
            }
            handleResponseError(xhr, error);
            const errorContainer = document.querySelector(".error-container");
            dataContainer.classList.toggle("show-data");
            if (!dataContainer.classList.contains("data-up")) {
                dataContainer.classList.add("data-up");
            }
            if (!errorContainer.classList.contains("error-up")) {
                errorContainer.classList.toggle("error-up");
            }
        }
    })
}

function getCurrentWeather(cityName) {
    if (dataContainer.classList.contains("show-data")) {
        dataContainer.classList.toggle("show-data");
        setTimeout(() => {
            fetchWeatherAPI(cityName);
        }, 800);
    } else {
        fetchWeatherAPI(cityName);
    }
}

function showWeatherInfo(response) {
    dataContainer.innerHTML = `<div class="current-place">
    <h2 id="city"></h2>
    <h3 id="date"></h3>
</div>
<div class="current-weather">
    <div class="weather-symbol">
        <img src="" alt="Weather Icon" id="weather-ico">
    </div>
    <div class="weather-temp">
        <h4 id="temp"></h4>
        <h5 id="description"></h5>
    </div>
    </div>
    <div class="current-info">
                </div>
                <div class="forecast-container">
                    <h3>Forecast</h3>
                    <div class="forecast-list">
                    </div>
                </div>
`;
    setLocationInfo(response.city.name, response.city.country);

    const date = convertDate(response.list[0].dt);
    const dateHeader = document.querySelector("#date");
    dateHeader.innerHTML = convertDateToStr(date);

    setWeatherIcon(response.list[0].weather[0].icon);
    setWeatherDescription(response.list[0].weather[0].description);
    setWeatherTemp(response.list[0].main.temp);
    setCurrentInfo(response)

}

function handleResponseError(xhr, error) {
    let errorTemplate;
    if (xhr.status === 404) {
        errorTemplate = `<div class="error-container">Sorry, the city was not found.</div>`;
    }
    else {
        errorTemplate = `<div class="error-container">Sorry, something went wrong.</div>`;
    }

    dataContainer.innerHTML = errorTemplate;
}

function convertDate(unixDate) {
    const milliseconds = unixDate * 1000;
    const date = new Date(milliseconds);
    return date;
}

function convertDateToStr(date) {
    const options = { weekday: "long", day: "numeric", month: "long" };

    const dateString = date.toLocaleString("en-US", options);
    return dateString;
}

function getMonthDayFromDate(date) {
    return date.toLocaleString("en-US", { month: "numeric", day: "numeric" }).replace("/", ".");
}

function isTodayDate(date) {
    const today = new Date();
    return date.getDate() == today.getDate() &&
        date.getMonth() == today.getMonth() &&
        date.getFullYear() == today.getFullYear();
}

function getTimeStamp(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();

    if (minutes < 10) {
        minutes = `0${minutes}`;
    }

    return `${hours}:${minutes}`;
}

function setWeatherIcon(iconId) {
    const weatherIco = document.querySelector("#weather-ico");
    weatherIco.src = `icons/${iconId}.png`;
}

function setWeatherDescription(description) {
    const weatherDescription = document.querySelector("#description");
    const words = description.split(" ");

    for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }
    weatherDescription.innerHTML = words.join(" ");
}

function setLocationInfo(city, locale) {
    const cityHeader = document.querySelector("#city");
    cityHeader.innerHTML = `${city}, ${locale}`;
}

function setWeatherTemp(temperature) {
    const tempHeader = document.querySelector("#temp");
    tempHeader.innerHTML = `${Math.round(temperature)}°`;
}

function setCurrentInfo(response) {
    const currInfo = document.querySelector(".current-info");

    const sunriseTime = convertDate(response.city.sunrise);
    const sunsetTime = convertDate(response.city.sunset);

    currInfo.innerHTML += `<div class="main-info">
                                <h5 id="wind">
                                ${response.list[0].wind.speed}mph
                                </h5>
                                <span>
                                    Wind
                                </span>
                            </div>`;
    currInfo.innerHTML += `<div class="main-info">
                            <h5 id="sunrise">
                                ${getTimeStamp(sunriseTime)}
                            </h5>
                            <span>
                                Sunrise
                            </span>
                        </div>`;

    currInfo.innerHTML += `<div class="main-info">
                            <h5 id="sunset">
                                ${getTimeStamp(sunsetTime)}
                            </h5>
                            <span>
                                Sunset
                            </span>
                        </div>`;
    currInfo.innerHTML += `<div class="main-info">
                            <h5 id="high">
                                ${Math.round(getHighestWeather(getWeathersToday(response)))}°
                            </h5>
                            <span>
                                High
                            </span>
                        </div>`;
    currInfo.innerHTML += `<div class="main-info">
                        <h5 id="low">
                            ${Math.round(getLowestWeather(getWeathersToday(response)))}°
                        </h5>
                        <span>
                            High
                        </span>
                    </div>`;
    currInfo.innerHTML += `<div class="main-info">
                    <h5 id="rain">
                        ${getRainInfo(response)}
                    </h5>
                    <span>
                        High
                    </span>
                </div>`;
    setForecastInfo(response);
}

function setForecastInfo(response) {
    const forecastList = document.querySelector(".forecast-list");
    forecastList.innerHTML = "";
    for (const forecastInfo of response.list) {
        const forecastTemplate = `<div class="day-forecast">
        <h5 id="day-date">${getMonthDayFromDate(convertDate(forecastInfo.dt))}</h5>
        <h5 id="day-time">${getTimeStamp(convertDate(forecastInfo.dt))}</h5>
        <img src="icons/${forecastInfo.weather[0].icon}.png" class="forecast-img">
        <h5>${Math.round(forecastInfo.main.temp)}°</h5>
    </div>`;

        forecastList.innerHTML += forecastTemplate;
    }

}

function getRainInfo(response) {
    let rain = response.list[0].rain;
    if (rain) {
        rain = rain["3h"];
    }
    else {
        rain = 0;
    }
    return `${rain} mm`;
}

function getWeathersToday(response) {
    const weathers = [];
    for (const weatherInfo of response.list) {
        if (isTodayDate(convertDate(weatherInfo.dt))) {
            weathers.push(weatherInfo);
        }
    }
    return weathers;
}

function getHighestWeather(weathers) {
    let max = weathers[0].main.temp_max;
    for (const weather of weathers) {
        if (weather.main.temp_max > max) {
            max = weather.main.temp_max;
        }
    }
    return max;
}

function getLowestWeather(weathers) {
    let min = weathers[0].main.temp_min;
    for (const weather of weathers) {
        if (weather.main.temp_min < min) {
            min = weather.main.temp_min;
        }
    }
    return min;
}