/* ========================================
   Weather Page JavaScript
   Handles weather data fetching and display
   ======================================== */

// OpenWeather API Configuration
// Important: Replace with your actual API key from https://openweathermap.org/api
const OPENWEATHER_API_KEY = 'YOUR_API_KEY_HERE'; // Get free key from openweathermap.org
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Initialize weather on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeWeatherPage();
});

/**
 * Initialize the weather page
 */
async function initializeWeatherPage() {
    try {
        // Get location
        let location = getUserLocation();
        
        if (!location) {
            // Detect location if not stored
            location = await detectUserLocation();
        }
        
        // Display location
        displayLocation(location);
        
        // Fetch and display weather
        await loadWeather(location);
        
    } catch (error) {
        const weatherInfo = document.getElementById('weather-info');
        showError(weatherInfo, 'Failed to load weather data. Please ensure you have set a valid OpenWeather API key in js/weather.js');
        console.error('Weather initialization error:', error);
    }
}

/**
 * Display location information
 * @param {Object} location - Location data
 */
function displayLocation(location) {
    const container = document.getElementById('location-display');
    if (!location) {
        showError(container, 'Location not detected');
        return;
    }
    
    container.innerHTML = `
        <div class="location-card">
            <p><strong>📍 Country:</strong> ${sanitizeHTML(location.country)}</p>
            <p><strong>🏙️ City:</strong> ${sanitizeHTML(location.city)}</p>
            <p><strong>🗺️ Region:</strong> ${sanitizeHTML(location.region)}</p>
            <p><strong>🧭 Coordinates:</strong> ${location.latitude.toFixed(2)}°N, ${location.longitude.toFixed(2)}°E</p>
        </div>
    `;
}

/**
 * Load and display weather data
 * @param {Object} location - Location object with latitude and longitude
 */
async function loadWeather(location) {
    const weatherInfo = document.getElementById('weather-info');
    const impactContainer = document.getElementById('weather-impact');
    const recommendationsContainer = document.getElementById('care-recommendations');
    
    try {
        // Show loading state
        weatherInfo.innerHTML = '<p class="loading">Fetching weather data...</p>';
        
        // Check if API key is set
        if (OPENWEATHER_API_KEY === 'YOUR_API_KEY_HERE') {
            weatherInfo.innerHTML = `
                <div class="error">
                    <p>⚠️ OpenWeather API key not configured</p>
                    <p class="error-details">Please set your API key in js/weather.js to enable real weather data. Get a free key at <a href="https://openweathermap.org/api" target="_blank">openweathermap.org/api</a></p>
                </div>
            `;
            // Use demo weather instead
            displayDemoWeather();
            return;
        }
        
        // Fetch current weather
        const weatherUrl = `${OPENWEATHER_BASE_URL}/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`;
        const weatherData = await fetchAPI(weatherUrl);
        
        // Fetch forecast (optional, for additional data)
        const forecastUrl = `${OPENWEATHER_BASE_URL}/forecast?lat=${location.latitude}&lon=${location.longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`;
        const forecastData = await fetchAPI(forecastUrl);
        
        // Display weather information
        displayWeather(weatherData);
        displayWeatherImpact(weatherData);
        displayCareRecommendations(weatherData);
        
    } catch (error) {
        console.error('Weather loading error:', error);
        
        // If API fails, show demo data
        if (error.message.includes('API error')) {
            weatherInfo.innerHTML = `
                <div class="error">
                    <p>⚠️ Could not fetch real weather data</p>
                    <p class="error-details">Showing demo data instead. Make sure your API key is valid.</p>
                </div>
            `;
            displayDemoWeather();
        } else {
            showError(weatherInfo, error.message);
        }
    }
}

/**
 * Display current weather data
 * @param {Object} weatherData - OpenWeather API response
 */
function displayWeather(weatherData) {
    const container = document.getElementById('weather-info');
    
    const temp = weatherData.main.temp;
    const feelsLike = weatherData.main.feels_like;
    const humidity = weatherData.main.humidity;
    const pressure = weatherData.main.pressure;
    const windSpeed = convertWindSpeed(weatherData.wind.speed);
    const cloudiness = weatherData.clouds.all;
    const description = weatherData.weather[0].description;
    const icon = weatherData.weather[0].icon;
    
    container.innerHTML = `
        <div class="weather-item">
            <h4>🌡️ Temperature</h4>
            <p><strong>${temp.toFixed(1)}°C</strong></p>
            <p style="font-size: 0.9rem; color: var(--text-light);">Feels like ${feelsLike.toFixed(1)}°C</p>
        </div>
        <div class="weather-item">
            <h4>💧 Humidity</h4>
            <p><strong>${humidity}%</strong></p>
            <p style="font-size: 0.9rem; color: var(--text-light);">${getHumidityAssessment(humidity)}</p>
        </div>
        <div class="weather-item">
            <h4>💨 Wind Speed</h4>
            <p><strong>${windSpeed} km/h</strong></p>
            <p style="font-size: 0.9rem; color: var(--text-light);">${weatherData.wind.speed.toFixed(1)} m/s</p>
        </div>
        <div class="weather-item">
            <h4>🔴 Pressure</h4>
            <p><strong>${pressure} hPa</strong></p>
            <p style="font-size: 0.9rem; color: var(--text-light);">Barometric pressure</p>
        </div>
        <div class="weather-item">
            <h4>☁️ Cloudiness</h4>
            <p><strong>${cloudiness}%</strong></p>
            <p style="font-size: 0.9rem; color: var(--text-light);">Cloud coverage</p>
        </div>
        <div class="weather-item">
            <h4>📋 Condition</h4>
            <p><strong>${description}</strong></p>
            <p style="font-size: 0.9rem; color: var(--text-light);">Currently ${weatherData.weather[0].main}</p>
        </div>
    `;
}

/**
 * Display weather impact on plants
 * @param {Object} weatherData - OpenWeather API response
 */
function displayWeatherImpact(weatherData) {
    const container = document.getElementById('weather-impact');
    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const pressure = weatherData.main.pressure;
    
    let impacts = [];
    
    // Temperature assessment
    if (temp < 0) {
        impacts.push({
            icon: '❄️',
            title: 'Freezing Temperature',
            desc: 'Bring tropical plants indoors. Water less frequently.'
        });
    } else if (temp < 10) {
        impacts.push({
            icon: '🥶',
            title: 'Cold Weather',
            desc: 'Move sensitive plants away from windows. Reduce watering.'
        });
    } else if (temp > 30) {
        impacts.push({
            icon: '🔥',
            title: 'Hot Weather',
            desc: 'Increase watering frequency. Provide shade for delicate plants.'
        });
    } else {
        impacts.push({
            icon: '😊',
            title: 'Comfortable Temperature',
            desc: 'Ideal conditions for most plants. Maintain regular care.'
        });
    }
    
    // Humidity assessment
    if (humidity < 30) {
        impacts.push({
            icon: '🏜️',
            title: 'Low Humidity',
            desc: 'Increase watering. Mist leaves regularly. Use humidifier if possible.'
        });
    } else if (humidity > 85) {
        impacts.push({
            icon: '☔',
            title: 'High Humidity',
            desc: 'Improve air circulation. Watch for fungal diseases. Reduce watering.'
        });
    } else {
        impacts.push({
            icon: '✅',
            title: 'Good Humidity',
            desc: 'Optimal moisture levels for most plants.'
        });
    }
    
    // Pressure assessment
    if (pressure < 1000) {
        impacts.push({
            icon: '⛈️',
            title: 'Low Pressure',
            desc: 'Storm approaching. Move plants away from windows. Reduce fertilizing.'
        });
    } else if (pressure > 1020) {
        impacts.push({
            icon: '☀️',
            title: 'High Pressure',
            desc: 'Fair weather ahead. Good time for outdoor watering and feeding.'
        });
    }
    
    // Render impacts
    container.innerHTML = impacts.map(impact => `
        <div class="weather-item">
            <h4>${impact.icon} ${impact.title}</h4>
            <p>${impact.desc}</p>
        </div>
    `).join('');
}

/**
 * Display plant care recommendations based on weather
 * @param {Object} weatherData - OpenWeather API response
 */
function displayCareRecommendations(weatherData) {
    const container = document.getElementById('care-recommendations');
    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;
    const cloudiness = weatherData.clouds.all;
    
    let recommendations = [];
    
    // Watering recommendations
    if (humidity < 40 || temp > 28) {
        recommendations.push('💧 <strong>Increase Watering:</strong> Low humidity and high temperature increase water loss. Water more frequently.');
    } else if (humidity > 75) {
        recommendations.push('💧 <strong>Reduce Watering:</strong> High humidity reduces water loss. Water less to prevent root rot.');
    } else {
        recommendations.push('💧 <strong>Regular Watering:</strong> Conditions are favorable. Water when soil is dry to touch.');
    }
    
    // Light recommendations
    if (cloudiness > 80) {
        recommendations.push('☀️ <strong>Supplement Light:</strong> Heavy cloud cover reduces natural light. Use grow lights if needed.');
    } else if (cloudiness < 20) {
        recommendations.push('☀️ <strong>Protect from Sun:</strong> Clear skies mean strong sunlight. Protect delicate plants from direct sun.');
    } else {
        recommendations.push('☀️ <strong>Normal Light:</strong> Moderate light conditions. Position plants near windows as usual.');
    }
    
    // Temperature-specific care
    if (temp < 15) {
        recommendations.push('🌡️ <strong>Cold Weather Care:</strong> Reduce fertilizing. Move plants away from cold windows. Minimize watering.');
    } else if (temp > 25) {
        recommendations.push('🌡️ <strong>Warm Weather Care:</strong> Increase air circulation. Mist leaves if humidity is low. Fertilize more frequently.');
    } else {
        recommendations.push('🌡️ <strong>Ideal Temperature:</strong> Perfect growing conditions. Normal plant care schedule applies.');
    }
    
    // Wind recommendations
    if (windSpeed > 10) {
        recommendations.push('💨 <strong>Wind Protection:</strong> Strong winds increase water loss and can damage leaves. Move plants to shelter.');
    } else {
        recommendations.push('💨 <strong>Air Circulation:</strong> Good air movement reduces disease. Beneficial for most plants.');
    }
    
    // Render recommendations
    container.innerHTML = recommendations.map(rec => `
        <div class="recommendation-item">
            <p>${rec}</p>
        </div>
    `).join('');
}

/**
 * Display demo weather data (when API key not configured)
 */
function displayDemoWeather() {
    const demoData = {
        main: {
            temp: 22,
            feels_like: 20,
            humidity: 65,
            pressure: 1013
        },
        weather: [{
            main: 'Partly Cloudy',
            description: 'partly cloudy skies'
        }],
        wind: {
            speed: 4.5
        },
        clouds: {
            all: 45
        }
    };
    
    displayWeather(demoData);
    displayWeatherImpact(demoData);
    displayCareRecommendations(demoData);
    
    // Show demo notice
    const weatherInfo = document.getElementById('weather-info');
    const notice = document.createElement('div');
    notice.className = 'success';
    notice.style.marginTop = '1rem';
    notice.innerHTML = '<p>📌 Showing demo data. Configure your OpenWeather API key for real-time data.</p>';
    weatherInfo.parentElement.insertBefore(notice, weatherInfo);
}
