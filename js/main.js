/* ========================================
   Plant Care Assistant - Main JavaScript
   Shared utilities and helper functions
   ======================================== */

/**
 * Get stored user location from sessionStorage
 * @returns {Object} Location data or null
 */
function getUserLocation() {
    const stored = sessionStorage.getItem('userLocation');
    return stored ? JSON.parse(stored) : null;
}

/**
 * Store location in sessionStorage
 * @param {Object} location - Location data object
 */
function storeLocation(location) {
    sessionStorage.setItem('userLocation', JSON.stringify(location));
}

/**
 * Detect user's location using IP-API
 * @returns {Promise<Object>} Location data
 */
async function detectUserLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) {
            throw new Error('Failed to detect location');
        }
        const data = await response.json();
        
        // Store the location data
        const locationData = {
            country: data.country_name,
            country_code: data.country_code,
            city: data.city,
            region: data.region,
            latitude: data.latitude,
            longitude: data.longitude
        };
        
        storeLocation(locationData);
        return locationData;
    } catch (error) {
        console.error('Location detection error:', error);
        throw error;
    }
}

/**
 * Create and display a loading spinner
 * @returns {HTMLElement} Spinner element
 */
function createLoader() {
    const loader = document.createElement('div');
    loader.className = 'loading';
    loader.textContent = 'Loading...';
    return loader;
}

/**
 * Show error message
 * @param {HTMLElement} container - Container to insert error
 * @param {string} message - Error message to display
 */
function showError(container, message) {
    container.innerHTML = `
        <div class="error">
            <p><strong>Error:</strong> ${message}</p>
        </div>
    `;
}

/**
 * Show success message
 * @param {HTMLElement} container - Container to insert success message
 * @param {string} message - Success message to display
 */
function showSuccess(container, message) {
    container.innerHTML = `
        <div class="success">
            <p><strong>Success:</strong> ${message}</p>
        </div>
    `;
}

/**
 * Format temperature based on user preference
 * @param {number} kelvin - Temperature in Kelvin
 * @returns {string} Formatted temperature string
 */
function formatTemperature(kelvin) {
    const celsius = (kelvin - 273.15).toFixed(1);
    const fahrenheit = (celsius * 9/5 + 32).toFixed(1);
    return `${celsius}°C / ${fahrenheit}°F`;
}

/**
 * Convert wind speed from m/s to km/h
 * @param {number} mps - Wind speed in meters per second
 * @returns {number} Wind speed in km/h
 */
function convertWindSpeed(mps) {
    return (mps * 3.6).toFixed(1);
}

/**
 * Get humidity assessment
 * @param {number} humidity - Humidity percentage
 * @returns {string} Humidity assessment
 */
function getHumidityAssessment(humidity) {
    if (humidity < 30) return 'Very Low';
    if (humidity < 50) return 'Low';
    if (humidity < 70) return 'Moderate';
    if (humidity < 85) return 'High';
    return 'Very High';
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Update active navigation link
 * @param {string} pageName - Name of current page (e.g., 'index', 'weather')
 */
function updateActiveNav(pageName) {
    // Remove active class from all links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current page link
    const currentLink = document.querySelector(`a[href="${pageName}.html"]`);
    if (currentLink) {
        currentLink.classList.add('active');
    }
}

/**
 * Parse filename from current page
 * @returns {string} Page name without extension
 */
function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1);
    return filename.replace('.html', '') || 'index';
}

// Update navigation on page load
document.addEventListener('DOMContentLoaded', function() {
    updateActiveNav(getCurrentPage());
});

/**
 * Make API call with error handling
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} API response data
 */
async function fetchAPI(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}
