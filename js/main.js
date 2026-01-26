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
        const coords = await getBrowserLocation();
        try {
            const locationData = await reverseGeocode(coords.latitude, coords.longitude);
            storeLocation(locationData);
            return locationData;
        } catch (error) {
            const locationData = {
                country: 'Unknown',
                country_code: '',
                city: 'Unknown',
                region: '',
                latitude: coords.latitude,
                longitude: coords.longitude
            };
            storeLocation(locationData);
            return locationData;
        }
    } catch (error) {
        console.warn('Browser geolocation failed:', error);
    }

    const providers = [
        async () => {
            const response = await fetch('https://ipapi.co/json/');
            if (!response.ok) throw new Error('ipapi.co failed');
            const data = await response.json();
            return {
                country: data.country_name,
                country_code: data.country_code,
                city: data.city,
                region: data.region,
                latitude: data.latitude,
                longitude: data.longitude
            };
        },
        async () => {
            const response = await fetch('https://ipwho.is/');
            if (!response.ok) throw new Error('ipwho.is failed');
            const data = await response.json();
            if (!data.success) throw new Error('ipwho.is error');
            return {
                country: data.country,
                country_code: data.country_code,
                city: data.city,
                region: data.region,
                latitude: data.latitude,
                longitude: data.longitude
            };
        },
        async () => {
            const response = await fetch('https://ipinfo.io/json');
            if (!response.ok) throw new Error('ipinfo.io failed');
            const data = await response.json();
            const [lat, lon] = (data.loc || ',').split(',').map(Number);
            return {
                country: data.country || '',
                country_code: data.country || '',
                city: data.city || '',
                region: data.region || '',
                latitude: lat || 0,
                longitude: lon || 0
            };
        }
    ];

    for (const provider of providers) {
        try {
            const locationData = await provider();
            if (locationData && locationData.country) {
                storeLocation(locationData);
                return locationData;
            }
        } catch (error) {
            console.warn('Location provider failed:', error);
        }
    }

    const fallback = {
        country: 'United States',
        country_code: 'US',
        city: 'New York',
        region: 'NY',
        latitude: 40.7128,
        longitude: -74.006
    };
    storeLocation(fallback);
    return fallback;
}

function getBrowserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => reject(error),
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
        );
    });
}

async function reverseGeocode(latitude, longitude) {
    const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Reverse geocode failed');
    const data = await response.json();
    const place = data.results && data.results[0];
    if (!place) throw new Error('Reverse geocode no results');
    return {
        country: place.country,
        country_code: place.country_code,
        city: place.city || place.name || '',
        region: place.admin1 || '',
        latitude,
        longitude
    };
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
    initProfileMenu();
    initChatWidget();
    initThemeToggle();
});

/* ========================================
   Auth Modal Logic
   ======================================== */

const SUPABASE_URL = 'https://anmfapmftqxnbdhjefrt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8YmzFwOnHKcvOJlsgcGJ6A_lHLg1ZG9';

function getSupabaseClient() {
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        return null;
    }
    return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

async function upsertUserProfile(supabase, userId, profile) {
    if (!userId) return;
    const payload = {
        id: userId,
        ...profile
    };
    const { error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' });
    if (error) {
        console.warn('Profile upsert failed:', error);
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

async function initAuthModal() {
    const overlay = document.getElementById('auth-overlay');
    if (!overlay) return;
    const supabase = getSupabaseClient();
    if (!supabase) {
        const messageEl = overlay.querySelector('#auth-message');
        setAuthMessage(messageEl, 'Auth service unavailable. Please reload the page.', 'error');
        showAuthOverlay(overlay);
        return;
    }

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

    window.openAuthOverlay = (tabName = 'login') => {
        activateTab(tabName);
        showAuthOverlay(overlay);
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => activateTab(tab.dataset.authTab));
    });

    try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
            showAuthOverlay(overlay);
        } else {
            hideAuthOverlay(overlay);
        }
    } catch (error) {
        console.warn('Session check failed:', error);
        showAuthOverlay(overlay);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = loginForm.querySelector('input[name="email"]').value.trim();
            const password = loginForm.querySelector('input[name="password"]').value;

            if (!email || !password) {
                setAuthMessage(messageEl, 'Please enter your email and password.', 'error');
                return;
            }

            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                setAuthMessage(messageEl, error.message || 'Login failed. Try again.', 'error');
                return;
            }

            setAuthMessage(messageEl, 'Login successful. Welcome back!', 'success');
            setTimeout(() => hideAuthOverlay(overlay), 400);
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const fullName = registerForm.querySelector('input[name="fullName"]').value.trim();
            const email = registerForm.querySelector('input[name="email"]').value.trim();
            const password = registerForm.querySelector('input[name="password"]').value;

            if (!fullName || !email || !password) {
                setAuthMessage(messageEl, 'Please fill out all fields to register.', 'error');
                return;
            }

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            });

            if (error) {
                setAuthMessage(messageEl, error.message || 'Registration failed. Try again.', 'error');
                return;
            }

            if (data.user?.id) {
                await upsertUserProfile(supabase, data.user.id, {
                    full_name: fullName,
                    email: data.user.email
                });
            }

            if (data.session) {
                setAuthMessage(messageEl, 'Account created! You are now logged in.', 'success');
                setTimeout(() => hideAuthOverlay(overlay), 400);
                return;
            }

            setAuthMessage(messageEl, 'Check your email to confirm your account, then log in.', 'success');
            activateTab('login');
        });
    }

    supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
            hideAuthOverlay(overlay);
        } else {
            showAuthOverlay(overlay);
        }
    });
}

function getInitials(name = '') {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'P';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

async function getProfileName(supabase, user) {
    if (!user) return 'Guest';
    let name = user.user_metadata?.full_name || '';
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();
        if (!error && data?.full_name) {
            name = data.full_name;
        }
    } catch (error) {
        console.warn('Profile fetch failed:', error);
    }
    if (!name && user.email) {
        name = user.email.split('@')[0];
    }
    return name || 'Plant Lover';
}

async function updateProfileUI(supabase) {
    const profileText = document.getElementById('profile-text');
    const profileBadge = document.getElementById('profile-badge');
    const profileAvatar = document.getElementById('profile-avatar');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const loginBtn = document.getElementById('profile-login-btn');
    const logoutBtn = document.getElementById('profile-logout-btn');

    if (!profileText || !profileBadge || !profileAvatar || !profileName || !profileEmail) {
        return;
    }

    const { data } = await supabase.auth.getSession();
    const session = data?.session;

    if (!session) {
        profileText.textContent = 'Welcome, Guest';
        profileName.textContent = 'Guest';
        profileEmail.textContent = 'Sign in to personalize';
        const initials = 'G';
        profileBadge.textContent = initials;
        profileAvatar.textContent = initials;
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (logoutBtn) logoutBtn.style.display = 'none';
        return;
    }

    const name = await getProfileName(supabase, session.user);
    const initials = getInitials(name);
    profileText.textContent = `Welcome, ${name}`;
    profileName.textContent = name;
    profileEmail.textContent = session.user.email || '';
    profileBadge.textContent = initials;
    profileAvatar.textContent = initials;
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';
}

function initProfileMenu() {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const toggleBtn = document.getElementById('profile-toggle');
    const menu = document.getElementById('profile-menu');
    const loginBtn = document.getElementById('profile-login-btn');
    const logoutBtn = document.getElementById('profile-logout-btn');

    if (!toggleBtn || !menu) return;

    const closeMenu = () => {
        menu.classList.remove('show');
        menu.setAttribute('aria-hidden', 'true');
        toggleBtn.setAttribute('aria-expanded', 'false');
    };

    const openMenu = () => {
        menu.classList.add('show');
        menu.setAttribute('aria-hidden', 'false');
        toggleBtn.setAttribute('aria-expanded', 'true');
    };

    toggleBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        if (menu.classList.contains('show')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    document.addEventListener('click', (event) => {
        if (!menu.contains(event.target) && !toggleBtn.contains(event.target)) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            closeMenu();
            if (typeof window.openAuthOverlay === 'function') {
                window.openAuthOverlay('login');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            closeMenu();
            await supabase.auth.signOut();
            if (typeof window.openAuthOverlay === 'function') {
                window.openAuthOverlay('login');
            }
        });
    }

    updateProfileUI(supabase);
    supabase.auth.onAuthStateChange(() => {
        updateProfileUI(supabase);
    });
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

function initThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    const stored = localStorage.getItem('pcaTheme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldEnable = stored ? stored === 'dark' : prefersDark;
    document.body.classList.toggle('dark-mode', shouldEnable);
    toggle.classList.toggle('is-dark', shouldEnable);
    toggle.setAttribute('aria-pressed', String(shouldEnable));

    toggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        toggle.classList.toggle('is-dark', isDark);
        toggle.setAttribute('aria-pressed', String(isDark));
        localStorage.setItem('pcaTheme', isDark ? 'dark' : 'light');
    });
}

function initChatWidget() {
    if (document.getElementById('chat-widget')) return;

    const widget = document.createElement('div');
    widget.id = 'chat-widget';
    widget.className = 'chat-widget';
    widget.innerHTML = `
        <button class="chat-toggle" id="chat-toggle" type="button" aria-expanded="false">
            <span class="chat-icon">🌿</span>
            <span class="chat-label">Plant Assistant</span>
        </button>
        <div class="chat-panel" id="chat-panel" aria-hidden="true">
            <div class="chat-panel-header">
                <div>
                    <h4>Flora</h4>
                    <p>Your AI Assistant</p>
                </div>
                <button class="chat-close" id="chat-close" type="button" aria-label="Close chat">×</button>
            </div>
            <div class="chat-panel-body" id="chat-messages">
                <div class="chat-bubble bot">Hi! Ask me about plant care, weather tips, or pests.</div>
            </div>
            <div class="chat-panel-input">
                <input id="chat-input" type="text" placeholder="Type your message..." />
                <button class="btn btn-primary" id="chat-send" type="button">Send</button>
            </div>
        </div>
    `;

    document.body.appendChild(widget);

    const toggleBtn = document.getElementById('chat-toggle');
    const panel = document.getElementById('chat-panel');
    const closeBtn = document.getElementById('chat-close');
    const sendBtn = document.getElementById('chat-send');
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');

    const openPanel = () => {
        panel.classList.add('show');
        panel.setAttribute('aria-hidden', 'false');
        toggleBtn.setAttribute('aria-expanded', 'true');
        input.focus();
    };

    const closePanel = () => {
        panel.classList.remove('show');
        panel.setAttribute('aria-hidden', 'true');
        toggleBtn.setAttribute('aria-expanded', 'false');
    };

    toggleBtn.addEventListener('click', () => {
        if (panel.classList.contains('show')) {
            closePanel();
        } else {
            openPanel();
        }
    });

    closeBtn.addEventListener('click', closePanel);

    const addMessage = (text, role) => {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${role}`;
        bubble.textContent = text;
        messages.appendChild(bubble);
        messages.scrollTop = messages.scrollHeight;
        return bubble;
    };

    const sendMessage = async () => {
        const message = input.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        input.value = '';
        const loadingBubble = addMessage('Thinking...', 'bot');

        try {
            const response = await fetch('http://localhost:3000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            loadingBubble.remove();
            addMessage(data.reply || 'No response yet. Try again.', 'bot');
        } catch (error) {
            loadingBubble.remove();
            addMessage('Local AI backend not responding. Start the server to chat.', 'bot');
            console.error(error);
        }
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') sendMessage();
    });
}
