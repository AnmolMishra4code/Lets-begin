const container = document.querySelector('.container');
const searchBtn = document.querySelector('#search-btn');
const searchInput = document.querySelector('#city-input');
const weatherCard = document.querySelector('#weather-card');
const errorMsg = document.querySelector('#error-msg');
const loading = document.querySelector('#loading');

const weatherIcon = document.querySelector('#weather-icon');
const tempElement = document.querySelector('#temp');
const descElement = document.querySelector('#description');
const locationElement = document.querySelector('#location-name');
const humidityElement = document.querySelector('#humidity');
const windElement = document.querySelector('#wind');
const feelsLikeElement = document.querySelector('#feels-like');

// Mapping WMO weather codes to weather conditions and icons
// Source: https://open-meteo.com/en/docs
const weatherCodes = {
    0: { desc: 'Clear sky', icon: 'clear' },
    1: { desc: 'Mainly clear', icon: 'clear' },
    2: { desc: 'Partly cloudy', icon: 'cloudy' },
    3: { desc: 'Overcast', icon: 'cloudy' },
    45: { desc: 'Fog', icon: 'mist' },
    48: { desc: 'Depositing rime fog', icon: 'mist' },
    51: { desc: 'Light drizzle', icon: 'rain' },
    53: { desc: 'Moderate drizzle', icon: 'rain' },
    55: { desc: 'Dense drizzle', icon: 'rain' },
    56: { desc: 'Light freezing drizzle', icon: 'rain' },
    57: { desc: 'Dense freezing drizzle', icon: 'rain' },
    61: { desc: 'Slight rain', icon: 'rain' },
    63: { desc: 'Moderate rain', icon: 'rain' },
    65: { desc: 'Heavy rain', icon: 'rain' },
    66: { desc: 'Light freezing rain', icon: 'rain' },
    67: { desc: 'Heavy freezing rain', icon: 'rain' },
    71: { desc: 'Slight snow fall', icon: 'snow' },
    73: { desc: 'Moderate snow fall', icon: 'snow' },
    75: { desc: 'Heavy snow fall', icon: 'snow' },
    77: { desc: 'Snow grains', icon: 'snow' },
    80: { desc: 'Slight rain showers', icon: 'rain' },
    81: { desc: 'Moderate rain showers', icon: 'rain' },
    82: { desc: 'Violent rain showers', icon: 'rain' },
    85: { desc: 'Slight snow showers', icon: 'snow' },
    86: { desc: 'Heavy snow showers', icon: 'snow' },
    95: { desc: 'Thunderstorm', icon: 'snow' }, 
    96: { desc: 'Thunderstorm with slight hail', icon: 'snow' },
    99: { desc: 'Thunderstorm with heavy hail', icon: 'snow' }
};

// SVG icons data URIs for offline/reliable rendering without extra requests
const icons = {
    clear: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    cloudy: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>',
    rain: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2360a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/><path d="M16 20v-2"/><path d="M12 22v-2"/><path d="M8 20v-2"/></svg>',
    snow: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23e5e7eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m20 17.58-1.73-1"/><path d="m3.73 7.42 1.73 1"/><path d="m20 6.42-1.73 1"/><path d="m3.73 16.58 1.73-1"/><path d="M12 22v-2"/><path d="M12 4V2"/><path d="m19 14-1.73-1"/><path d="m4.73 11 1.73 1"/><path d="m19 10-1.73 1"/><path d="m4.73 13 1.73-1"/><path d="m14 19-1.73-1"/><path d="m9.73 6 1.73 1"/><path d="m14 5-1.73 1"/><path d="m9.73 18 1.73-1"/></svg>',
    mist: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/><line x1="8" y1="12" x2="24" y2="12"/></svg>'
};

searchBtn.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city === '') return;
    fetchWeather(city);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city === '') return;
        fetchWeather(city);
    }
});

async function fetchWeather(city) {
    // UI State Management
    weatherCard.style.display = 'none';
    errorMsg.style.display = 'none';
    loading.style.display = 'block';
    
    try {
        // Step 1: Geocoding API to get coordinates from city name
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('City not found');
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        // Step 2: Fetch weather data using coordinates
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`);
        const weatherData = await weatherResponse.json();
        
        const current = weatherData.current;
        
        // Update UI
        updateUI(current, name, country);

    } catch (error) {
        loading.style.display = 'none';
        errorMsg.style.display = 'block';
        console.error(error);
    }
}

function updateUI(current, name, country) {
    const code = current.weather_code;
    const weatherInfo = weatherCodes[code] || { desc: 'Unknown', icon: 'clear' };
    
    // Set text data
    tempElement.textContent = Math.round(current.temperature_2m);
    descElement.textContent = weatherInfo.desc;
    locationElement.textContent = `${name}, ${country}`;
    humidityElement.textContent = `${current.relative_humidity_2m}%`;
    windElement.textContent = `${current.wind_speed_10m} km/h`;
    feelsLikeElement.textContent = `${Math.round(current.apparent_temperature)}°C`;
    
    // Set icon
    weatherIcon.src = icons[weatherInfo.icon] || icons['clear'];
    
    // Change blob colors slightly based on temperature or day/night
    updateBackground(current.temperature_2m, current.is_day);

    loading.style.display = 'none';
    weatherCard.style.display = 'block';
}

function updateBackground(temp, isDay) {
    const blob1 = document.querySelector('.blob-1');
    const blob2 = document.querySelector('.blob-2');
    
    if (isDay === 0) {
        // Night
        blob1.style.background = 'linear-gradient(135deg, #1e3a8a, #4c1d95)';
        blob2.style.background = 'linear-gradient(135deg, #0f172a, #334155)';
        document.body.style.backgroundColor = '#020617';
    } else {
        if (temp > 25) {
            // Hot
            blob1.style.background = 'linear-gradient(135deg, #f59e0b, #ef4444)';
            blob2.style.background = 'linear-gradient(135deg, #f97316, #db2777)';
            document.body.style.backgroundColor = '#451a03';
        } else if (temp < 10) {
            // Cold
            blob1.style.background = 'linear-gradient(135deg, #38bdf8, #3b82f6)';
            blob2.style.background = 'linear-gradient(135deg, #818cf8, #c084fc)';
            document.body.style.backgroundColor = '#0f172a';
        } else {
            // Mild
            blob1.style.background = 'linear-gradient(135deg, #10b981, #3b82f6)';
            blob2.style.background = 'linear-gradient(135deg, #f43f5e, #8b5cf6)';
            document.body.style.backgroundColor = '#0f172a';
        }
    }
}
