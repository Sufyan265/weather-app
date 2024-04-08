{ // suggestions
  const apiKey = 'f2c179e824msh22acf5d7dc3bb20p155cb3jsn707788328deb';
  const apiUrl = 'https://city-and-state-search-api.p.rapidapi.com/cities/search';

  // const cityInput = document.getElementById('cityInput');
  const suggestionsDiv = document.getElementById('suggestions');
  const suggestionsList = suggestionsDiv.querySelector('ul');
  const loadingDiv = document.getElementById('suggestionLoading');
  let suggestionList = [];
  let selectedIndex = -1;

  // Function to fetch and sort city suggestions
  async function fetchAndSortCitySuggestions(query) {
    try {
      const response = await fetch(`${apiUrl}?q=${query}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'city-and-state-search-api.p.rapidapi.com'
        }
      });
      const data = await response.json();

      // Sort suggestions by matching query at the beginning of full name
      const sortedSuggestions = data.sort((a, b) => {
        const aIndex = a.name.toLowerCase().indexOf(query.toLowerCase());
        const bIndex = b.name.toLowerCase().indexOf(query.toLowerCase());
        return aIndex - bIndex;
      });

      return sortedSuggestions;
    } catch (error) {
      console.error(error);
    }
  }

  // Function to display city suggestions
  function displaySuggestions() {
    suggestionsList.innerHTML = '';

    if (suggestionList.length === 0) {
      suggestionsDiv.style.display = 'none';
      return;
    }

    suggestionList.forEach((suggestion, index) => {
      const li = document.createElement('li');
      li.textContent = suggestion.name;
      li.addEventListener('mouseenter', () => {
        selectedIndex = index;
        highlightSelectedSuggestion();
      });
      li.addEventListener('mouseleave', () => {
        selectedIndex = -1;
        removeHighlightSelectedSuggestion();
      });


      li.addEventListener('click', () => {
        cityInput.value = suggestion.name;
        suggestionsDiv.style.display = 'none';
      });

      suggestionsList.appendChild(li);
    });

    suggestionsDiv.style.display = 'block';
  }

  // Highlight the selected suggestion
  function highlightSelectedSuggestion() {
    const lis = suggestionsList.querySelectorAll('li');
    lis.forEach((li, index) => {
      if (index === selectedIndex) {
        li.classList.add('selected');
      } else {
        li.classList.remove('selected');
      }
    });
  }

  function removeHighlightSelectedSuggestion() {
    const lis = suggestionsList.querySelectorAll('li');
    lis.forEach((li) => {
      li.classList.remove('selected');
    });
  }


  let overlay2 = document.querySelectorAll('.overlay2')[0]

  // Show the loading icon within the suggestions box
  function showLoading() {
    cityInput.value = cityInput.value;
    loadingDiv.style.display = 'block';
    overlay2.style.display = 'block';
  }

  // Hide the loading icon
  function hideLoading() {
    loadingDiv.style.display = 'none';
    overlay2.style.display = 'none';
  }

  // Event listener for input changes
  cityInput.addEventListener('input', async () => {
    const query = cityInput.value.trim();

    if (query === '') {
      suggestionsDiv.style.display = 'none';
      return;
    }

    showLoading();
    suggestionList = await fetchAndSortCitySuggestions(query);
    selectedIndex = -1;
    hideLoading();
    displaySuggestions();
  });

  // Event listener for keydown events
  cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (selectedIndex < suggestionList.length - 1) {
        selectedIndex++;
        highlightSelectedSuggestion();
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (selectedIndex > 0) {
        selectedIndex--;
        highlightSelectedSuggestion();
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (selectedIndex !== -1 && loadingDiv.style.display == 'none') {
        cityInput.value = suggestionList[selectedIndex].name;
        suggestionsDiv.style.display = 'none';
      }
    }
  });

  // Close the suggestions when clicking outside
  document.addEventListener('click', (event) => {
    if (!suggestionsDiv.contains(event.target) && event.target !== cityInput) {
      suggestionsDiv.style.display = 'none';
    }
  });

}



//"_____________________________Make first character capital__________________________2")


const textElement = document.getElementById('symbolPhrase');
textElement.addEventListener('input', function () {
  textElement.textContent = textElement.textContent.charAt(0).toUpperCase() + textElement.textContent.slice(1);
});


// console.log("_________________________________3")

const overlay = document.getElementById('overlay');
const popup = document.getElementById('popup');
function closePopup() {
  overlay.style.display = 'none';
  popup.style.height = '0';
}

document.addEventListener('keydown', function (event) {
  // Check if the Enter key (key code 13) was pressed
  if (event.keyCode === 13 || event.key === 'Enter') {
    // submitButton.click();
    closePopup();
  }
});


// console.log("________________enter_________________4")

cityInput.addEventListener("keyup", function (event) {
  if (cityInput.value == "") {
    overlay.style.display = 'none';
    popup.style.height = '0';
  }
  else if (event.key === "Enter") {
    submit.click()
    // cityInput.value = "";
    cityInput.blur();
  }
});

// ______________________________________Favorite City___________________________________________________

{ // Add City To Favorite button
  const addCityButton2 = document.getElementById('addCityButton');
  const favoriteList = document.getElementById('favoriteList');
  // localStorage.clear();





  async function addCityToFavorite(cityName) {

    if (favoriteList.childElementCount === 4) {
      addCityButton2.disabled = true;
      addCityButton2.style.filter = 'grayscale(1)';
      addCityButton2.classList.remove('btn-active');
      console.log("Don't limit the crose")
      return;
    }
    addCityButton2.style.filter = 'unset';
    addCityButton2.disabled = false;

    const listItem = await document.createElement('li');
    listItem.classList.add("light-text", "animation-text");

    listItem.innerHTML = await `<span>${cityName}</span><span class="city-remove-icon"> &times;</span>`;
    listItem.addEventListener("click", async function (event) {
      if (event.target === listItem || event.target === listItem.firstElementChild) {
        showLoadingSpinner()
        await getCityName(cityName)
        await getWeather(locationId);
        await getHourlyWeather(locationId);
        await getDailyWeather(locationId);
        await dailyTempChart(locationId);
      }
    });

    if (!favoriteList.innerHTML.includes(cityName)) {
      favoriteList.appendChild(listItem);
    }
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favorites.push(cityName);
    localStorage.setItem("favorites", JSON.stringify(favorites));

  }

  function isCityInFavorites(cityName) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    return favorites.includes(cityName);
  }

  function initializeFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const favoriteList = document.getElementById("favoriteList");

    favorites.forEach(cityName => {
      const listItem = document.createElement("li");
      listItem.classList.add("light-text", "animation-text");

      listItem.innerHTML = `<span>${cityName}</span><span class="city-remove-icon"> &times;</span>`;

      listItem.addEventListener("click", async function (event) {
        if (event.target === listItem || event.target === listItem.firstElementChild) {
          // alert('LI Element Clicked');
          showLoadingSpinner()
          await getCityName(cityName)
          await getWeather(locationId);
          await getHourlyWeather(locationId);
          await getDailyWeather(locationId);
          await dailyTempChart(locationId);
        }
      });
      favoriteList.appendChild(listItem);

    });

  }
  initializeFavorites();
  // localStorage.clear();

  { // for remove favorite city 
    function removeFromLocalStorageArray(key, valueToRemove) {
      const storedArray = JSON.parse(localStorage.getItem(key) || '[]');
      const indexToRemove = storedArray.indexOf(valueToRemove);
      if (indexToRemove !== -1) {
        storedArray.splice(indexToRemove, 1);
        localStorage.setItem(key, JSON.stringify(storedArray));
        // console.log(`Removed "${valueToRemove}" from the array.`);
      } else {
        console.log(`"${valueToRemove}" not found in the array.`);
      }
    }

    // if (favoriteList.getElementsByTagName("li").length > 0) {
    //   let cityRemoveIcon = document.querySelectorAll('.city-remove-icon');
    //   // console.log(cityRemoveIcon)

    //   cityRemoveIcon.forEach(span2Element => {
    //     span2Element.addEventListener('click', function (event) {
    //       // if (shouldStopPropagation) {
    //       // event.stopPropagation();
    //       // }

    //       addCityButton2.style.filter = 'unset';
    //       addCityButton2.disabled = false;
    //       addCityButton2.classList.add('btn-active')


    //       // shouldStopPropagation = !shouldStopPropagation;
    //       let listItem = event.target.parentElement;
    //       listItem.remove();
    //       let cityToRemove2 = listItem.firstElementChild.textContent;
    //       // console.log(cityToRemove2)
    //       removeFromLocalStorageArray('favorites', cityToRemove2);


    //     });

    //   });
    //   // let shouldStopPropagation = true;
    // }

    favoriteList.addEventListener("click", function (event) {
      if (event.target.classList.contains("city-remove-icon")) {

        addCityButton2.style.filter = 'unset';
        addCityButton2.disabled = false;
        addCityButton2.classList.add('btn-active')

        let listItem = event.target.parentElement;
        listItem.remove();
        let cityToRemove2 = listItem.firstElementChild.textContent;
        // console.log(cityToRemove2)
        removeFromLocalStorageArray('favorites', cityToRemove2);
      }
    });

  }

  addCityButton2.addEventListener('click', function () {

    const cityNameH2 = document.getElementById('cityName');
    const cityName = cityNameH2.textContent.trim();

    if (isCityInFavorites(cityName)) { // Animate again if city name already exist
      const favListItems = document.querySelectorAll('#favoriteList li');
      favListItems.forEach(item => {
        if (item.textContent.includes(cityName)) {
          // console.log(item);
          item.classList.remove('animation-text');
          void item.offsetWidth; // Trigger a reflow to apply the removal
          item.classList.add('animation-text');
        }
      });
      console.log('This city already in favorites');
      // return;
    }
    else if (cityName !== "") {
      addCityToFavorite(cityName);
    }
  });
  // */
}

// _______________________________________Daily Temp Chart__________________________________________________


const dailyTempChart = async (id) => {
  let data = await getDailyWeather(id)
  console.log(data)

  function dailyDayFormat(index) {
    let longDayName = new Date(data[index].date).toLocaleDateString('en-US', { weekday: 'long' });
    // console.log(longDayName); // Output: "Sun"
    return longDayName;
  }

  let minimumValue = 10;
  let maximumValue = 50;

  let minimumValue10 = data.some(item => item.minTemp < 15);
  if (minimumValue10) {
    minimumValue = 0;
    maximumValue = 40;
  }




  let chart = new CanvasJS.Chart("chartContainer", {
    backgroundColor: "transparent",

    title: {
      text: "Weekly Weather Forecast",
      margin: 50,
      fontColor: "white",
      fontWeight: "normal",
    },
    axisY: {
      suffix: " °C",
      minimum: minimumValue,
      maximum: maximumValue,
      gridThickness: 0,
      lineColor: "white",
      tickColor: "white",
      labelFontColor: "white",

    },

    axisX: {
      lineColor: "white",
      tickColor: "white",
      labelFontColor: "white",
    },

    toolTip: {
      shared: true,
      content: "{name} </br> <strong>Temperature: </strong> </br> Min: {y[0]} °C, Max: {y[1]} °C",
    },
    data: [{
      // indexLabelFontColor: "#eeeeee",
      indexLabelFontColor: "white",
      type: "rangeSplineArea",
      fillOpacity: 0.06,
      color: "#d9d9d9",
      // color: "#91AAB1",
      // lineColor: "blue",


      indexLabelFormatter: formatter,
      dataPoints: [
        { label: dailyDayFormat(0), y: [data[0].minTemp, data[0].maxTemp,], name: data[0].symbolPhrase },
        { label: dailyDayFormat(1), y: [data[1].minTemp, data[1].maxTemp,], name: data[1].symbolPhrase },
        { label: dailyDayFormat(2), y: [data[2].minTemp, data[2].maxTemp,], name: data[2].symbolPhrase },
        { label: dailyDayFormat(3), y: [data[3].minTemp, data[3].maxTemp,], name: data[3].symbolPhrase },
        { label: dailyDayFormat(4), y: [data[4].minTemp, data[4].maxTemp,], name: data[4].symbolPhrase },
        { label: dailyDayFormat(5), y: [data[5].minTemp, data[5].maxTemp,], name: data[5].symbolPhrase },
        { label: dailyDayFormat(6), y: [data[6].minTemp, data[6].maxTemp,], name: data[6].symbolPhrase }
      ]
    }]
  });
  chart.render();

  var images = [];

  addImages(chart);

  function addImages(chart) {
    for (var i = 0; i < chart.data[0].dataPoints.length; i++) {
      var dpsName = chart.data[0].dataPoints[i].name;

      images.push($(`<img src="symbols/${data[0].symbol}.png" alt="Symbol" width="40px">`));
      images.push($(`<img src="symbols/${data[1].symbol}.png" alt="Symbol" width="40px">`));
      images.push($(`<img src="symbols/${data[2].symbol}.png" alt="Symbol" width="40px">`));
      images.push($(`<img src="symbols/${data[3].symbol}.png" alt="Symbol" width="40px">`));
      images.push($(`<img src="symbols/${data[4].symbol}.png" alt="Symbol" width="40px">`));
      images.push($(`<img src="symbols/${data[5].symbol}.png" alt="Symbol" width="40px">`));
      images.push($(`<img src="symbols/${data[6].symbol}.png" alt="Symbol" width="40px">`));


      images[i].attr("class", dpsName).appendTo($("#chartContainer>.canvasjs-chart-container"));
      positionImage(images[i], i);
    }
  }

  function positionImage(image, index) {
    var imageCenter = chart.axisX[0].convertValueToPixel(chart.data[0].dataPoints[index].x);
    var imageTop = chart.axisY[0].convertValueToPixel(chart.axisY[0].maximum);

    let imgPositionTop = data.some(item => item.maxTemp > 40);
    if (imgPositionTop) {
      imageTop = imageTop - 45;
    }

    const imgSize = window.innerWidth < 500 ? '25px' : '40px';
    image.width(imgSize)
      .css({
        "left": imageCenter - 20 + "px",
        "position": "absolute", "top": imageTop + "px",
        "position": "absolute",
      });


  }

  // $(window).resize(function () {
  //   var cloudyCounter = 0, rainyCounter = 0, sunnyCounter = 0;
  //   var imageCenter = 0;
  //   for (var i = 0; i < chart.data[0].dataPoints.length; i++) {
  //     imageCenter = chart.axisX[0].convertValueToPixel(chart.data[0].dataPoints[i].x) - 20;
  //     if (chart.data[0].dataPoints[i].name == "cloudy") {
  //       $(".cloudy").eq(cloudyCounter++).css({ "left": imageCenter });
  //     } else if (chart.data[0].dataPoints[i].name == "rainy") {
  //       $(".rainy").eq(rainyCounter++).css({ "left": imageCenter });
  //     } else if (chart.data[0].dataPoints[i].name == "sunny") {
  //       $(".sunny").eq(sunnyCounter++).css({ "left": imageCenter });
  //     }
  //   }
  // });

  function formatter(e) {
    if (e.index === 0 && e.dataPoint.x === 0) {
      return " Min " + e.dataPoint.y[e.index] + "°";
    } else if (e.index == 1 && e.dataPoint.x === 0) {
      return " Max " + e.dataPoint.y[e.index] + "°";
    } else {
      return e.dataPoint.y[e.index] + "°";
    }
  }

}
// dailyTempChart();
