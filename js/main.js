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
    initAuthModal();
});

/* ========================================
   Auth Modal Logic
   ======================================== */

const AUTH_STATUS_KEY = 'pcaAuthStatus';
const USER_STORAGE_KEY = 'pcaUserAccount';
const DEFAULT_USER = {
    fullName: 'Anika',
    email: 'anika@gmail.com',
    password: 'anika@123'
};

function getStoredUser() {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
}

function storeUser(user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

function seedDefaultUser() {
    const storedUser = getStoredUser();
    if (!storedUser) {
        storeUser(DEFAULT_USER);
        return;
    }
    if (storedUser.email === DEFAULT_USER.email && storedUser.password === 'amika@123') {
        storeUser({
            ...storedUser,
            password: DEFAULT_USER.password
        });
    }
}

function setAuthMessage(messageEl, message, type) {
    if (!messageEl) return;
    messageEl.textContent = message;
    messageEl.classList.remove('error', 'success');
    if (type) {
        messageEl.classList.add(type);
    }
}

function showAuthOverlay(overlay) {
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('auth-locked');
}

function hideAuthOverlay(overlay) {
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('auth-locked');
}

function initAuthModal() {
    const overlay = document.getElementById('auth-overlay');
    if (!overlay) return;

    seedDefaultUser();

    const tabs = overlay.querySelectorAll('.auth-tab');
    const loginForm = overlay.querySelector('#login-form');
    const registerForm = overlay.querySelector('#register-form');
    const messageEl = overlay.querySelector('#auth-message');

    const activateTab = (tabName) => {
        tabs.forEach(tab => {
            const isActive = tab.dataset.authTab === tabName;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', String(isActive));
        });
        if (loginForm && registerForm) {
            loginForm.classList.toggle('active', tabName === 'login');
            registerForm.classList.toggle('active', tabName === 'register');
        }
        setAuthMessage(messageEl, '', null);
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => activateTab(tab.dataset.authTab));
    });

    const isAuthenticated = sessionStorage.getItem(AUTH_STATUS_KEY) === 'true';
    if (!isAuthenticated) {
        showAuthOverlay(overlay);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = loginForm.querySelector('input[name="email"]').value.trim();
            const password = loginForm.querySelector('input[name="password"]').value;
            const storedUser = getStoredUser();

            if (!storedUser) {
                setAuthMessage(messageEl, 'No account found. Please register first.', 'error');
                activateTab('register');
                return;
            }

            if (storedUser.email !== email || storedUser.password !== password) {
                setAuthMessage(messageEl, 'Invalid email or password. Try again.', 'error');
                return;
            }

            sessionStorage.setItem(AUTH_STATUS_KEY, 'true');
            setAuthMessage(messageEl, 'Login successful. Welcome back!', 'success');
            setTimeout(() => hideAuthOverlay(overlay), 400);
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const fullName = registerForm.querySelector('input[name="fullName"]').value.trim();
            const email = registerForm.querySelector('input[name="email"]').value.trim();
            const password = registerForm.querySelector('input[name="password"]').value;

            if (!fullName || !email || !password) {
                setAuthMessage(messageEl, 'Please fill out all fields to register.', 'error');
                return;
            }

            storeUser({
                fullName,
                email,
                password
            });

            sessionStorage.setItem(AUTH_STATUS_KEY, 'true');
            setAuthMessage(messageEl, 'Account created! You are now logged in.', 'success');
            setTimeout(() => hideAuthOverlay(overlay), 400);
        });
    }
}

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
