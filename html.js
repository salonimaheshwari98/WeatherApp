// DOM Elements
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userConatiner = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

let currentTab = userTab;
const API_KEY = "5a4eceb84897a1bcdf68d9e8829aab84";
currentTab.classList.add("current-tab");
getfromSessionStorage();  // Check if coordinates are in sessionStorage on page load

// Switch between tabs
function switchTab(clickedTab) {
    if (clickedTab != currentTab) {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if (!searchForm.classList.contains("active")) {
            // Switch to search form
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        } else {
            // Switch back to user info (Weather data)
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getfromSessionStorage(); // Retrieve weather info from session if available
        }
    }
}

userTab.addEventListener("click", () => switchTab(userTab));
searchTab.addEventListener("click", () => switchTab(searchTab));

// Check if coordinates are already in sessionStorage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    console.log(localCoordinates);

    if (!localCoordinates) {
        grantAccessContainer.classList.add("active");
    } else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates); // Fetch weather info based on coordinates
    }
}

// Fetch weather info based on coordinates or city name
async function fetchUserWeatherInfo(input) {
    let lat, lon;

    if (typeof input === 'object' && input.lat && input.lon) {
        // Coordinates case (object with lat and lon)
        lat = input.lat;
        lon = input.lon;
    } else if (typeof input === 'string') {
        // City name case
        return fetchSearchWeatherInfo(input); // Handle city search
    } else {
        console.error("Invalid input provided to fetchUserWeatherInfo");
        return;
    }

    // Make grant access invisible and show loading screen
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data); // Render the fetched weather data
    } catch (err) {
        console.error("Error fetching weather data:", err);
        loadingScreen.classList.remove("active");
    }
}

// Render the weather information in the UI
function renderWeatherInfo(weatherInfo) {
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = weatherInfo?.main?.temp;
    windspeed.innerText = weatherInfo?.wind?.speed;
    humidity.innerText = weatherInfo?.main?.humidity;
    cloudiness.innerText = weatherInfo?.clouds?.all;
}

// Get the user's location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation not supported by this browser.");
    }
}

// Store coordinates in sessionStorage and fetch weather info
function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates); // Show weather for current location
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation); // Trigger location access

// Search for weather based on user input
const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value.trim();

    if (cityName === "") return; // No city entered
    fetchUserWeatherInfo(cityName); // Fetch weather for the entered city
});

// Fetch weather for a searched city
async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
        );
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data); // Render weather info for the searched city
    } catch (err) {
        console.error("Error fetching weather data for city:", err);
        loadingScreen.classList.remove("active");
    }
}
