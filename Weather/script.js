let debounceTimer;
function debounce(func, delay) {
    return function(...args) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
}
async function fetchSuggestions(query) {
    const suggestionBox=document.getElementById('suggestions');
    suggestionBox.innerHTML='';

    if(query.length<3){
        return;
    }
    const apiKey = '5b7eaf046fc7efb723a15d34be086c59';
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`;
    try{
        const response=await fetch(url);
        const locations=await response.json();
        if(locations.length==0){
            suggestionBox.innerHTML='<div class="no-results">No results found</div>';
            return;
        }
        const topMatches=locations.slice(0,5);
        topMatches.forEach(location=>{
            const suggestionItem=document.createElement('div');
            suggestionItem.classList.add('suggestion-item');
            suggestionItem.textContent=`${location.name}, ${location.country}`;
            suggestionItem.onclick=()=>{
                document.querySelector('.search-bar').value=`${location.name}, ${location.country}`;
                suggestionBox.innerHTML='';
            };
            suggestionBox.appendChild(suggestionItem);
        });
    } catch(error){
        console.error('Error fetching suggestions:', error);
    }
}
async function fetchWeatherData() {
    const location=document.querySelector('.search-bar').value;
    if(!location){
        alert('Please enter a valid location');
        return;
    }
    const apiKey = '5b7eaf046fc7efb723a15d34be086c59';
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=5&appid=${apiKey}&units=metric`;
    try{
        const geoResponse=await fetch(url);
        const geoData=await geoResponse.json();
        console.log(geoData);
        if(!geoData.length){
            alert('Location not found');
            return;
        }
        const {lat, lon}=geoData[0];
        const weatherUrl=`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const weatherResponse=await fetch(weatherUrl);
        const weatherData=await weatherResponse.json();

        console.log(weatherData);
        const weatherDescription=weatherData.weather[0].description;
        console.log('Weather Description:', weatherDescription);
        const temperature=weatherData.main.temp;
        const weatherEmoji=getWeatherEmoji(weatherDescription);

        const resultBox=document.querySelector('.weather-box');
        resultBox.innerHTML=`
                <h2>${location}</h2>
                <p>${weatherEmoji} ${weatherDescription}</p>
                <p>Temperature: ${temperature}°C</p>
        `;

    } catch(error){
        console.error('Error fetching weather data:', error);
    }
}
function getWeatherEmoji(description) {
    const weatherMap = {
        "clear sky": "☀️",
        "few clouds": "🌤️",
        "scattered clouds": "☁️",
        "broken clouds": "☁️",
        "overcast clouds": "☁️",
        "shower rain": "🌧️",
        "rain": "🌧️",
        "light rain": "🌦️",
        "moderate rain": "🌧️",
        "thunderstorm": "⛈️",
        "snow": "❄️",
        "mist": "🌫️",
        "fog": "🌁",
        "haze": "🌫️",
        "drizzle": "🌦️"
    };

    // Normalize the description to lowercase for matching
    const normalizedDescription = description.toLowerCase();
    return weatherMap[normalizedDescription] || "🌍"; // Default to Earth emoji if no match
}

document.getElementById('search-bar').addEventListener('input', debounce(fetchSuggestions, 10000));
