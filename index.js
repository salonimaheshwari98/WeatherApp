const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userConatiner = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");


let currentTab = userTab;
const API_KEY = "5a4eceb84897a1bcdf68d9e8829aab84";
currentTab.classList.add("current-tab");//current tab k classlist mein particular tab ki properties add kardoh
//mtlb jaise hi tab kholo uski by deafult properties show ho
getfromSessionStorage();




function switchTab(clickedTab) {
    if (clickedTab != currentTab) {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");
        // the above three lines of code is ensuring that the background of the currenttab/clicked is grey in color

        if (!searchForm.classList.contains("active")) {
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
            //agar search form mein active nhi hain mtlb woh visible nhi hain
            // so humey iseh visible karwana hain so switch karne k liye visisble ko invisible karna hoga

        }
        else {
            //pehle search wale form peh hain aur abh humey user info peh switch karna hain
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            //now i am in your weather tab  so we will have to display weather so 
            //we need to check the local storage(session) for the coordinates,if we have saved there
            getfromSessionStorage();

        }

    }
}

userTab.addEventListener("click", () => {
    //pass clicked tab as input parameter
    switchTab(userTab);
});
searchTab.addEventListener("click", () => {
    //pass clicked tab as input parameter
    switchTab(searchTab);
});


//checks if coordinates are already pres
function getfromSessionStorage() {
    //session storgae mein user coordinates ko local wale mein daal rahe 
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    console.log(localCoordinates);
    if (!localCoordinates) {
        //agar local coordinates nhi mile
        grantAccessContainer.classList.add("active");

    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);

    }

}

async function fetchUserWeatherInfo(coordinates) {//since api call hain toh async function
    let lat ,lon;
    if(typeof coordinates==='object'&& coordinates.lat&&coordinates.lon){
        lat=coordinates.lat;
        lon=coordinates.lon;
    }
    else if(typeof coordinates==='string'){
        return fetchSearchWeatherInfo(coordinates);

    }
    else{
        console.error("invalid input provided to fetchuserweather info");
        return;
    }
    //make grant location access invisible
    grantAccessContainer.classList.remove("active");
    //make loading screen visible
    loadingScreen.classList.add("active");

    //API Call
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch (err){
        console.error("error fetching weather data:",err);
        loadingScreen.classList.remove("active");
    }


}




function renderWeatherInfo(weatherInfo) {
    //firstly we will need to fetch elements
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");
    //response.json will convert the response into json format 
    //response.parse will convert the string to the json object

    //fetch values from weatherinfo object and put it into the ui element

    //if we want to access a particular property in the json object then
    //optional chaining parameter is used
    //in case this doesnot exist the this parameter will through an undefined value

    cityName.innerText = weatherInfo?.name;
    countryIcon.src=`https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    // weather info k andar weather mein jakar uske pehle element seh description utha liye
    weatherIcon.src=`http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${(weatherInfo?.main?.temp-273.15).toFixed(1)} ℃`;
    windspeed.innerText =`${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all} %`;






}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
        //agar navigator.geolocation support karta hain toh current position find out karo
    }
    else {
        alert("no geolocation support available");
    }
}
function showPosition(position){
    const userCoordinates={
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates",JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates)//ui peh dikhana hain
    //session storage mein user coordinates naam seh store karlo location ko
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);


const searchInput=document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    let cityName=searchInput.value;

    if(cityName==="")
        return;
    else
    fetchUserWeatherInfo(cityName);

})

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try{
        const response=await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
        );
        const data=await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err){
        console.error("error fetching weather data for city :",err);
        loadingScreen.classList.remove("active");
         
    }
    
}





