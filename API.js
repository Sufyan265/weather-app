let locationId;
let locations;
const getCityName = (city) => {
    const cityUrl = `https://foreca-weather.p.rapidapi.com/location/search/${city}?lang=en`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '67fa3dc230msh361cff959de71d5p153b9ejsned2f1d5f1e18',
            'X-RapidAPI-Host': 'foreca-weather.p.rapidapi.com'
        }
    };
    return new Promise(async (resolve, reject) => {
        try {
            (async () => {
                const response = await fetch(cityUrl, options);


                if (!response.ok) {
                    overlay.style.display = 'block';
                    popup.style.height = '53px';
                    throw new Error(`Error fetching data for city ID: ${city}`);
                }

                const result = await response.json();
                // console.log(result);
                let arr = result.locations

                if (arr.length == 0) {
                    overlay.style.display = 'block';
                    popup.style.height = '53px';
                    throw new Error(`Error fetching data for city ID: ${city}`);
                }

                // let location = result.locations[0]
                locations = result.locations[0]

                timezone.innerHTML = locations.timezone;
                lat.innerHTML = locations.lat;
                lon.innerHTML = locations.lon;

                country.innerHTML = locations.country;
                adminArea.innerHTML = locations.adminArea;
                adminArea2.innerHTML = locations.adminArea2;

                { // time with timezone
                    function formatTime() {
                        const now = new Date();
                        const options = {
                            // timeZone: 'Asia/Karachi', // Set the desired time zone
                            timeZone: locations.timezone, // Set the desired time zone
                            hour12: true,
                            hour: 'numeric',
                            minute: 'numeric',
                            second: 'numeric',
                            weekday: 'long',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        };
                        const formattedTime = new Intl.DateTimeFormat('en-US', options).format(now);

                        const date = new Date(formattedTime);
                        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                        const [day, month, year] = [date.getDate(), monthNames[date.getMonth()], date.getFullYear()];
                        const [hours, minutes, ampm] = [date.getHours() % 12, date.getMinutes(), date.getHours() >= 12 ? "PM" : "AM"];
                        let formattedString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm} - ${date.toLocaleDateString('en-US', { weekday: 'long' })}, ${day} ${month} '${year}`;

                        if (hours == 0) {
                            formattedString = `12:${minutes.toString().padStart(2, '0')} ${ampm} - ${date.toLocaleDateString('en-US', { weekday: 'long' })}, ${day} ${month} '${year}`;
                        }
                        return formattedString;
                    }
                    function updateClock() {
                        const timeParagraph = document.getElementById('time');
                        const formattedTime = formatTime();
                        timeParagraph.innerHTML = formattedTime;
                        // console.log(formattedTime)
                    }
                    // Update the clock immediately and then every second
                    updateClock();
                    setInterval(updateClock, 1000);
                }

                locationId = locations.id;

                resolve(locationId, locations)

            })();
        } catch (error) {
            console.error(reject(error));
            console.error(error);
        }
    })
}


// console.log("________________________________________current________________________________________________2")
const getWeather = async (id) => {
    let cityName = document.getElementById('cityName');
    cityName.innerHTML = locations.name;
    const url = `https://foreca-weather.p.rapidapi.com/current/${id}?alt=0&tempunit=C&windunit=KMH&lang=en`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '67fa3dc230msh361cff959de71d5p153b9ejsned2f1d5f1e18',
            'X-RapidAPI-Host': 'foreca-weather.p.rapidapi.com'
        }
    };

    try {
        (async () => {
            showLoadingSpinner();
            const response = await fetch(url, options);

            if (!response.ok) {
                overlay.style.display = 'block';
                popup.style.height = '53px';
                throw new Error(`Error fetching data for city ID: ${id}`);
            }

            const result = await response.json();
            // console.log(result);
            const data = result.current
            // console.log(data)

            symbolPhrase.innerHTML = data.symbolPhrase
            temperature.innerHTML = data.temperature
            feelsLikeTemp.innerHTML = data.feelsLikeTemp
            relHumidity.innerHTML = data.relHumidity
            windSpeed.innerHTML = data.windSpeed
            precipRate.innerHTML = data.precipRate
            cloudiness.innerHTML = data.cloudiness

            let symbolBox = document.getElementById('symbolBox');
            symbolBox.innerHTML = `<img class="symbol" src="symbols/${data.symbol}.png" alt="Weather ${data.symbol} symbol">`

            { // Precipitation probability
                let percentageSvg = document.querySelectorAll('.percentage-svg')[0];
                percentageSvg.setAttribute('data-value', data.precipProb);
                const meter = document.querySelector('.percentage-svg[data-value] .percentage-meter'); // path
                const length = meter.getTotalLength();
                const value = parseInt(meter.parentNode.getAttribute('data-value'));
                const to = length * ((100 - value) / 100);
                meter.style.strokeDashoffset = Math.max(0, to);
                meter.nextElementSibling.innerHTML = `${value}%`;
            }

            { // Dew point
                let percentageSvg = document.querySelectorAll('.percentage-svg')[1];
                let percentageMeter = document.querySelectorAll('.percentage-meter')[1];
                if (data.dewPoint >= '35') {
                    percentageMeter.style.stroke = "#ff4747"
                } else {
                    percentageMeter.style.stroke = "#94fffb"
                }
                percentageSvg.setAttribute('data-value', data.dewPoint);
                const meter = document.querySelectorAll('.percentage-svg[data-value] .percentage-meter')[1];
                const length = meter.getTotalLength();
                const value = parseInt(meter.parentNode.getAttribute('data-value'));
                const to = length * ((35 - value) / 35);
                meter.style.strokeDashoffset = Math.max(0, to);
                meter.nextElementSibling.innerHTML = `${value}&deg;C`;
            }

            { // UV Index
                let uvIndex = data.uvIndex;
                let percentageSvg = document.querySelectorAll('.percentage-svg')[2];
                let percentageMeter = document.querySelectorAll('.percentage-meter')[2];

                if (uvIndex >= '12') {
                    percentageMeter.style.stroke = "#ff4747"
                } else {
                    percentageMeter.style.stroke = "#94fffb"
                }

                { // low high conditions
                    const uvIndexLevel = document.querySelector('.uvIndex-level');
                    if (uvIndex <= '2') {
                        uvIndexLevel.style.fill = '#ffffba';
                        uvIndexLevel.innerHTML = 'Low';
                    }
                    else if (uvIndex <= '5' && uvIndex > '2') {
                        uvIndexLevel.style.fill = 'white';
                        uvIndexLevel.innerHTML = 'Moderate';
                    }
                    else if (uvIndex <= '7' && uvIndex > '5') {
                        uvIndexLevel.style.fill = 'rgb(255 226 209)';
                        uvIndexLevel.innerHTML = 'High';
                    }
                    else if (uvIndex <= '10' && uvIndex > '7') {
                        uvIndexLevel.style.fill = 'rgb(255 213 208)';
                        uvIndexLevel.innerHTML = 'Very High';
                    }
                    else {
                        uvIndexLevel.style.fill = '#ff4242';
                        uvIndexLevel.innerHTML = 'Extreme';
                    }
                }
                percentageSvg.setAttribute('data-value', uvIndex);
                const meter = document.querySelectorAll('.percentage-svg[data-value] .percentage-meter')[2];
                const length = meter.getTotalLength();
                const value = parseInt(meter.parentNode.getAttribute('data-value'));
                const to = length * ((12 - value) / 12);
                meter.style.strokeDashoffset = Math.max(0, to);
                meter.nextElementSibling.innerHTML = `${value}`;
            }

            { // Wind direction
                const windDirArrow = document.querySelector('.windDir-arrow');
                const windDirSvg = document.querySelector('.windDir-svg');
                const windDir = document.getElementById('windDir');

                windDirArrow.classList.remove(windDirArrow.classList[windDirArrow.classList.length - 1]);
                windDirArrow.classList.add(data.windDirString)
                windDirSvg.classList.remove(windDirSvg.classList[windDirSvg.classList.length - 1]);
                windDirSvg.classList.add(data.windDirString)
                windDir.innerHTML = data.windDirString;

                const windSpeed2 = document.getElementById('windSpeed2');
                windSpeed2.innerHTML = data.windSpeed;
            }


        })();
    } catch (error) {
        hideLoadingSpinner();
        console.error(error);
    }
}

// console.log("________________________________________hourly_____________________________________________3")
const getHourlyWeather = (id) => {
    const url = `https://foreca-weather.p.rapidapi.com/forecast/hourly/${id}?alt=0&tempunit=C&windunit=KMH&periods=16&dataset=full`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '67fa3dc230msh361cff959de71d5p153b9ejsned2f1d5f1e18',
            'X-RapidAPI-Host': 'foreca-weather.p.rapidapi.com'
        }
    };
    // const usage = `https://foreca-weather.p.rapidapi.com/climate/monthly`

    try {
        (async () => {
            const response = await fetch(url, options);
            const result = await response.json();

            // const response2 = await fetch(usage, options);
            // const result2 = await response2.json();
            // console.log(result2)

            // console.log(result);
            let hourlyData = result.forecast

            { // hourly time
                let hourTime = document.querySelectorAll('.hourly-time')
                function hourlyTime(index) {
                    // const inputDatetime = "2023-09-11T07:00-04:00";
                    const date = new Date(hourlyData[index].time);
                    const options = {
                        // timeZone: "America/New_York",
                        timeZone: locations.timezone,
                        hour12: true,
                        hour: "numeric",
                        // minute: "2-digit",
                    };
                    const formattedTime = date.toLocaleString("en-US", options);
                    // console.log(formattedTime);
                    return formattedTime;
                }
                // console.log(hourlyTime(0))
                hourTime[0].innerHTML = hourlyTime(1);
                hourTime[1].innerHTML = hourlyTime(3);
                hourTime[2].innerHTML = hourlyTime(5);
                hourTime[3].innerHTML = hourlyTime(7);
                hourTime[4].innerHTML = hourlyTime(9);
                hourTime[5].innerHTML = hourlyTime(11);
                hourTime[6].innerHTML = hourlyTime(13);
                hourTime[7].innerHTML = hourlyTime(15);
            }

            { // Hourly symbol 
                let hourSymbol = document.querySelectorAll('.hourly-symbol');
                function hourlySymbol(index) {
                    return hourlyData[index].symbol;
                }
                hourSymbol[0].innerHTML = `<img src="symbols/${hourlySymbol(1)}.png" alt="Symbol">`
                hourSymbol[1].innerHTML = `<img src="symbols/${hourlySymbol(3)}.png" alt="Symbol">`
                hourSymbol[2].innerHTML = `<img src="symbols/${hourlySymbol(5)}.png" alt="Symbol">`
                hourSymbol[3].innerHTML = `<img src="symbols/${hourlySymbol(7)}.png" alt="Symbol">`
                hourSymbol[4].innerHTML = `<img src="symbols/${hourlySymbol(9)}.png" alt="Symbol">`
                hourSymbol[5].innerHTML = `<img src="symbols/${hourlySymbol(11)}.png" alt="Symbol">`
                hourSymbol[6].innerHTML = `<img src="symbols/${hourlySymbol(13)}.png" alt="Symbol">`
                hourSymbol[7].innerHTML = `<img src="symbols/${hourlySymbol(15)}.png" alt="Symbol">`
            }

            {// Hourly temp
                let hourTemp = document.querySelectorAll('.hourly-temp');
                function hourlyTemp(index) {
                    return hourlyData[index].temperature;
                }
                // console.log(hourlyTemp(0))
                hourTemp[0].innerHTML = hourlyTemp(1);
                hourTemp[1].innerHTML = hourlyTemp(3);
                hourTemp[2].innerHTML = hourlyTemp(5);
                hourTemp[3].innerHTML = hourlyTemp(7);
                hourTemp[4].innerHTML = hourlyTemp(9);
                hourTemp[5].innerHTML = hourlyTemp(11);
                hourTemp[6].innerHTML = hourlyTemp(13);
                hourTemp[7].innerHTML = hourlyTemp(15);
            }
        })();
    } catch (error) {
        hideLoadingSpinner();
        console.error(error);
    }


}


// console.log("__________________________________________Daily_____________________________________________3")

let forecastWeather;
const getDailyWeather = (id) => {
    const url = `https://foreca-weather.p.rapidapi.com/forecast/daily/${id}?alt=0&tempunit=C&windunit=KMH&periods=8&dataset=full`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '67fa3dc230msh361cff959de71d5p153b9ejsned2f1d5f1e18',
            'X-RapidAPI-Host': 'foreca-weather.p.rapidapi.com'
        }
    };
    return new Promise(async (resolve, reject) => {
        try {
            (async () => {
                const response = await fetch(url, options);
                const result = await response.json();
                // console.log(result);
                let data = await result.forecast;
                forecastWeather = await result.forecast;
                // console.log(data)

                { // Daily Date
                    function dailyDateFormat(index) {
                        let formattedDate = new Date(data[index].date).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" }).replace(/\//g, '/');
                        // console.log(formattedDate); // Output: "11/09/23"
                        return formattedDate;

                    }
                    let dailyDate = document.querySelectorAll('.daily-date');
                    dailyDate[0].innerHTML = dailyDateFormat(0)
                    dailyDate[1].innerHTML = dailyDateFormat(1)
                    dailyDate[2].innerHTML = dailyDateFormat(2)
                    dailyDate[3].innerHTML = dailyDateFormat(3)
                    dailyDate[4].innerHTML = dailyDateFormat(4)
                    dailyDate[5].innerHTML = dailyDateFormat(5)
                    dailyDate[6].innerHTML = dailyDateFormat(6)
                }

                { // Daily Day
                    function dailyDayFormat(index) {
                        let shortDayName = new Date(data[index].date).toLocaleDateString('en-US', { weekday: 'short' });
                        // console.log(shortDayName); // Output: "Sun"
                        return shortDayName;
                    }

                    let dailyDay = document.querySelectorAll('.daily-day');
                    dailyDay[0].innerHTML = dailyDayFormat(0)
                    dailyDay[1].innerHTML = dailyDayFormat(1)
                    dailyDay[2].innerHTML = dailyDayFormat(2)
                    dailyDay[3].innerHTML = dailyDayFormat(3)
                    dailyDay[4].innerHTML = dailyDayFormat(4)
                    dailyDay[5].innerHTML = dailyDayFormat(5)
                    dailyDay[6].innerHTML = dailyDayFormat(6)
                }

                { // daily Max Temp
                    let dailyMaxTemp = document.querySelectorAll('.daily-max-temp');
                    dailyMaxTemp[0].innerHTML = data[0].maxTemp;
                    dailyMaxTemp[1].innerHTML = data[1].maxTemp;
                    dailyMaxTemp[2].innerHTML = data[2].maxTemp;
                    dailyMaxTemp[3].innerHTML = data[3].maxTemp;
                    dailyMaxTemp[4].innerHTML = data[4].maxTemp;
                    dailyMaxTemp[5].innerHTML = data[5].maxTemp;
                    dailyMaxTemp[6].innerHTML = data[6].maxTemp;
                }

                { // daily Min Temp
                    let dailyMinTemp = document.querySelectorAll('.daily-min-temp');
                    dailyMinTemp[0].innerHTML = data[0].minTemp;
                    dailyMinTemp[1].innerHTML = data[1].minTemp;
                    dailyMinTemp[2].innerHTML = data[2].minTemp;
                    dailyMinTemp[3].innerHTML = data[3].minTemp;
                    dailyMinTemp[4].innerHTML = data[4].minTemp;
                    dailyMinTemp[5].innerHTML = data[5].minTemp;
                    dailyMinTemp[6].innerHTML = data[6].minTemp;
                }

                { // daily Symbol
                    let dailySymbol = document.querySelectorAll('.daily-symbol');
                    dailySymbol[0].innerHTML = `<img src="symbols/${data[0].symbol}.png" alt="Symbol" width="40px">`
                    dailySymbol[1].innerHTML = `<img src="symbols/${data[1].symbol}.png" alt="Symbol" width="40px">`
                    dailySymbol[2].innerHTML = `<img src="symbols/${data[2].symbol}.png" alt="Symbol" width="40px">`
                    dailySymbol[3].innerHTML = `<img src="symbols/${data[3].symbol}.png" alt="Symbol" width="40px">`
                    dailySymbol[4].innerHTML = `<img src="symbols/${data[4].symbol}.png" alt="Symbol" width="40px">`
                    dailySymbol[5].innerHTML = `<img src="symbols/${data[5].symbol}.png" alt="Symbol" width="40px">`
                    dailySymbol[6].innerHTML = `<img src="symbols/${data[6].symbol}.png" alt="Symbol" width="40px">`
                }

                { // daily max Humidity
                    let dailyHumidity = document.querySelectorAll('.daily-humidity');
                    dailyHumidity[0].innerHTML = data[0].maxRelHumidity;
                    dailyHumidity[1].innerHTML = data[1].maxRelHumidity;
                    dailyHumidity[2].innerHTML = data[2].maxRelHumidity;
                    dailyHumidity[3].innerHTML = data[3].maxRelHumidity;
                    dailyHumidity[4].innerHTML = data[4].maxRelHumidity;
                    dailyHumidity[5].innerHTML = data[5].maxRelHumidity;
                    dailyHumidity[6].innerHTML = data[6].maxRelHumidity;
                }

                { // daily min Humidity
                    let dailyMinHumidity = document.querySelectorAll('.daily-min-hum');
                    dailyMinHumidity[0].innerHTML = data[0].minRelHumidity;
                    dailyMinHumidity[1].innerHTML = data[1].minRelHumidity;
                    dailyMinHumidity[2].innerHTML = data[2].minRelHumidity;
                    dailyMinHumidity[3].innerHTML = data[3].minRelHumidity;
                    dailyMinHumidity[4].innerHTML = data[4].minRelHumidity;
                    dailyMinHumidity[5].innerHTML = data[5].minRelHumidity;
                    dailyMinHumidity[6].innerHTML = data[6].minRelHumidity;
                }

                { // daily Wind
                    let dailyWind = document.querySelectorAll('.daily-wind');
                    dailyWind[0].innerHTML = data[0].maxWindSpeed;
                    dailyWind[1].innerHTML = data[1].maxWindSpeed;
                    dailyWind[2].innerHTML = data[2].maxWindSpeed;
                    dailyWind[3].innerHTML = data[3].maxWindSpeed;
                    dailyWind[4].innerHTML = data[4].maxWindSpeed;
                    dailyWind[5].innerHTML = data[5].maxWindSpeed;
                    dailyWind[6].innerHTML = data[6].maxWindSpeed;
                }

                { // daily Sky
                    let dailySky = document.querySelectorAll('.daily-sky');
                    dailySky[0].innerHTML = data[0].symbolPhrase;
                    dailySky[1].innerHTML = data[1].symbolPhrase;
                    dailySky[2].innerHTML = data[2].symbolPhrase;
                    dailySky[3].innerHTML = data[3].symbolPhrase;
                    dailySky[4].innerHTML = data[4].symbolPhrase;
                    dailySky[5].innerHTML = data[5].symbolPhrase;
                    dailySky[6].innerHTML = data[6].symbolPhrase;
                }

                { // daily Rain
                    let dailyRain = document.querySelectorAll('.daily-rain');
                    dailyRain[0].innerHTML = data[0].precipAccum;
                    dailyRain[1].innerHTML = data[1].precipAccum;
                    dailyRain[2].innerHTML = data[2].precipAccum;
                    dailyRain[3].innerHTML = data[3].precipAccum;
                    dailyRain[4].innerHTML = data[4].precipAccum;
                    dailyRain[5].innerHTML = data[5].precipAccum;
                    dailyRain[6].innerHTML = data[6].precipAccum;
                }

                function convertTimeToAMPM(timeString) { // Sun & Moon time convertor
                    if (!timeString || typeof timeString !== 'string') {
                        return 'Invalid time';
                    }
                    const [hours, minutes] = timeString.split(':');
                    // const [ampm, hours12] = hours >= 12 ? ['PM', hours % 12 || 12] : ['AM', hours];
                    const [ampm, hours12] = hours >= 12 ? ['PM', (hours % 12 || 12).toString().padStart(2, '0')] : ['AM', (hours % 12 || 12).toString().padStart(2, '0')];
                    return `${hours12}:${minutes} ${ampm}`;
                }

                { // Sunrise time
                    const sunRiseTime = document.getElementById('sunRiseTime');
                    const sunRiseformattedTime = convertTimeToAMPM(data[0].sunrise);
                    // console.log(sunRiseformattedTime); 
                    sunRiseTime.innerHTML = sunRiseformattedTime
                }

                { // Sunset time
                    const sunSetTime = document.getElementById('sunSetTime');
                    const sunSetformattedTime = convertTimeToAMPM(data[0].sunset);
                    // console.log(sunSetformattedTime);
                    sunSetTime.innerHTML = `${sunSetformattedTime}`
                }

                { // Moonrise time
                    const moonRiseTime = document.getElementById('moonRiseTime');
                    const moonRiseformattedTime = convertTimeToAMPM(data[0].moonrise);
                    // console.log(moonRiseformattedTime);
                    moonRiseTime.innerHTML = moonRiseformattedTime
                }

                { // Moonset time
                    const moonSetTime = document.getElementById('moonSetTime');
                    const moonSetformattedTime = convertTimeToAMPM(data[0].moonset);
                    // console.log(moonSetformattedTime);
                    moonSetTime.innerHTML = `${moonSetformattedTime}`
                }

                { // Moon Phase 
                    const moonPhase = document.getElementById('moonPhase');
                    moonPhase.innerHTML = data[0].moonPhase;
                }

                hideLoadingSpinner();

                resolve(forecastWeather)
            })();
        } catch (error) {
            hideLoadingSpinner();
            console.error(error);
        }
    });

}





// console.log("__________________________________________Get city_____________________________________________4")


// console.log(dailyTempChart)


    (async () => {
        await getCityName("bahawalpur");
        console.log(locations)
        await getWeather(locationId);
        await getHourlyWeather(locationId);
        await getDailyWeather(locationId);

        await dailyTempChart(locationId);
        // console.log(locationId)


    })();

let submit = document.getElementById('submit');
let cityInput = document.getElementById('cityInput');

submit.addEventListener('click', async (e) => {
    e.preventDefault()
    await getCityName(cityInput.value)
    await getWeather(locationId);
    // console.log(locationId)
    await getHourlyWeather(locationId);
    await getDailyWeather(locationId);
    await dailyTempChart(locationId);
});

burewala.addEventListener('click', async () => {
    await getCityName("burewala")
    await getWeather(locationId);
    await getHourlyWeather(locationId);
    await getDailyWeather(locationId);
    await dailyTempChart(locationId);
});

newYork.addEventListener('click', async () => {
    await getCityName("new York")
    await getWeather(locationId);
    await getHourlyWeather(locationId);
    await getDailyWeather(locationId);
    await dailyTempChart(locationId);
});

paris.addEventListener('click', async () => {
    await getCityName("paris")
    await getWeather(locationId);
    await getHourlyWeather(locationId);
    await getDailyWeather(locationId);
    await dailyTempChart(locationId);
});

california.addEventListener('click', async () => {
    await getCityName("california")
    await getWeather(locationId);
    await getHourlyWeather(locationId);
    await getDailyWeather(locationId);
    await dailyTempChart(locationId);
});




// console.log("___________________loading___________________________5")
const loading = document.querySelector('#loading');
function showLoadingSpinner() {
    loading.style.display = 'block';
}

// Function to hide the loading loading
function hideLoadingSpinner() {
    loading.style.display = 'none';
}
