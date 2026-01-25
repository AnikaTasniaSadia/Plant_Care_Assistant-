/* ========================================
   Plants Page JavaScript
   Handles plant data display and selection
   ======================================== */

// Initialize plants page on load
document.addEventListener('DOMContentLoaded', function() {
    initializePlantsPage();
});

/**
 * Initialize the plants page
 */
async function initializePlantsPage() {
    try {
        // Populate country selector
        populateCountrySelector();
        
        // Get user's detected country
        let location = getUserLocation();
        if (!location) {
            // Try to detect location
            try {
                location = await detectUserLocation();
            } catch (error) {
                console.error('Could not detect location:', error);
            }
        }
        
        // Select detected country or default
        if (location) {
            const select = document.getElementById('country-select');
            const foundOption = Array.from(select.options).find(opt => 
                opt.value.toLowerCase() === location.country.toLowerCase()
            );
            if (foundOption) {
                select.value = foundOption.value;
                showDetectedCountryInfo(location.country);
            } else {
                // Select first option as fallback
                select.value = select.options[1].value;
            }
        }
        
        // Load initial plant data
        const selectedCountry = document.getElementById('country-select').value;
        if (selectedCountry) {
            loadPlantData(selectedCountry);
        }
        
    } catch (error) {
        console.error('Plants page initialization error:', error);
    }
}

/**
 * Populate country dropdown selector
 */
function populateCountrySelector() {
    const select = document.getElementById('country-select');
    const dropdownMenu = document.getElementById('country-dropdown-menu');
    const dropdownToggle = document.getElementById('country-dropdown-toggle');
    const dropdownLabel = document.getElementById('country-dropdown-label');
    const dropdownWrapper = document.getElementById('country-dropdown');
    const countries = getAllCountries();
    
    // Clear existing options
    select.innerHTML = '<option value="">Select a country...</option>';
    if (dropdownMenu) {
        dropdownMenu.innerHTML = '';
    }
    
    // Add countries
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        select.appendChild(option);

        if (dropdownMenu) {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'country-dropdown-item';
            item.role = 'option';
            item.dataset.value = country;
            item.textContent = country;
            dropdownMenu.appendChild(item);
        }
    });

    const closeMenu = () => {
        if (!dropdownMenu || !dropdownToggle) return;
        dropdownMenu.classList.remove('show');
        dropdownMenu.setAttribute('aria-hidden', 'true');
        dropdownToggle.setAttribute('aria-expanded', 'false');
    };

    const openMenu = () => {
        if (!dropdownMenu || !dropdownToggle) return;
        dropdownMenu.classList.add('show');
        dropdownMenu.setAttribute('aria-hidden', 'false');
        dropdownToggle.setAttribute('aria-expanded', 'true');
    };

    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener('click', () => {
            if (dropdownMenu.classList.contains('show')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        dropdownMenu.addEventListener('click', (event) => {
            const target = event.target.closest('.country-dropdown-item');
            if (!target) return;
            const value = target.dataset.value;
            select.value = value;
            if (dropdownLabel) {
                dropdownLabel.textContent = value;
            }
            closeMenu();
            if (value) {
                loadPlantData(value);
            }
        });

        document.addEventListener('click', (event) => {
            if (!dropdownWrapper || dropdownWrapper.contains(event.target)) return;
            closeMenu();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeMenu();
            }
        });
    }

    // Sync when select changes programmatically
    select.addEventListener('change', function() {
        if (dropdownLabel) {
            dropdownLabel.textContent = this.value || 'Select a country...';
        }
        if (this.value) {
            loadPlantData(this.value);
        }
    });
}

/**
 * Display detected country information
 * @param {string} country - Detected country name
 */
function showDetectedCountryInfo(country) {
    const detectedInfo = document.getElementById('detected-country');
    detectedInfo.innerHTML = `✓ Your location detected: <strong>${sanitizeHTML(country)}</strong>`;
}

/**
 * Load and display plant data for selected country
 * @param {string} country - Country name
 */
function loadPlantData(country) {
    const data = getCountryPlantData(country);
    
    // Display climate information
    displayClimateInfo(data.climate, country);
    
    // Display common plants
    displayCommonPlants(data.commonPlants, country);
    
    // Display common problems
    displayCommonProblems(data.commonProblems);
    
    // Display care guide
    displayCareGuide(data.careGuide);
}

/**
 * Display climate information
 * @param {string} climate - Climate description
 * @param {string} country - Country name
 */
function displayClimateInfo(climate, country) {
    const container = document.getElementById('climate-info');
    
    const climateDetails = {
        'Temperate to Subtropical': {
            icon: '🌤️',
            temp: '5-35°C',
            humidity: '40-60%',
            rain: 'Moderate'
        },
        'Temperate Maritime': {
            icon: '☔',
            temp: '2-20°C',
            humidity: '60-80%',
            rain: 'Frequent'
        },
        'Arid to Subtropical': {
            icon: '🏜️',
            temp: '15-45°C',
            humidity: '20-40%',
            rain: 'Minimal'
        },
        'Tropical Monsoon': {
            icon: '🌧️',
            temp: '20-35°C',
            humidity: '60-90%',
            rain: 'Heavy seasonal'
        },
        'Temperate with Four Seasons': {
            icon: '🍂',
            temp: '-5-30°C',
            humidity: '40-70%',
            rain: 'Moderate seasonal'
        },
        'Tropical to Subtropical': {
            icon: '🌴',
            temp: '15-35°C',
            humidity: '70-90%',
            rain: 'Heavy'
        }
    };
    
    const details = climateDetails[climate] || {
        icon: '🌍',
        temp: 'Varies',
        humidity: 'Varies',
        rain: 'Varies'
    };
    
    container.innerHTML = `
        <div class="climate-grid">
            <div class="weather-item">
                <h4>${details.icon} Climate Type</h4>
                <p><strong>${sanitizeHTML(climate)}</strong></p>
            </div>
            <div class="weather-item">
                <h4>🌡️ Temperature Range</h4>
                <p><strong>${details.temp}</strong></p>
            </div>
            <div class="weather-item">
                <h4>💧 Humidity Level</h4>
                <p><strong>${details.humidity}</strong></p>
            </div>
            <div class="weather-item">
                <h4>☔ Rainfall</h4>
                <p><strong>${details.rain}</strong></p>
            </div>
        </div>
    `;
}

/**
 * Display common plants for selected country
 * @param {Array} plants - Array of plant objects
 */
function displayCommonPlants(plants, country) {
    const container = document.getElementById('plants-list');
    const displayPlants = (plants || []).slice(0, 10);

    if (!displayPlants.length) {
        container.innerHTML = '<p class="loading">No plants found for this country.</p>';
        return;
    }

    container.innerHTML = displayPlants.map((plant, index) => {
        return `
        <div class="plant-card" data-plant-index="${index}" aria-expanded="false">
            ${plant.image ? `<img class="plant-image" src="${sanitizeHTML(plant.image)}" alt="${sanitizeHTML(plant.name)}" loading="lazy">` : ''}
            <h4 class="plant-title">🌿 ${sanitizeHTML(plant.name)}</h4>
            <div class="plant-details">
                <p class="plant-type"><strong>Type:</strong> ${sanitizeHTML(plant.type)}</p>
                <p><strong>Care:</strong> ${sanitizeHTML(plant.care)}</p>
                <p><strong>💧 Watering:</strong> ${sanitizeHTML(plant.waterFreq)}</p>
                <p><strong>☀️ Light:</strong> ${sanitizeHTML(plant.light)}</p>
                ${plant.diseases && plant.diseases.length ? `<p class="plant-diseases"><strong>🩺 Diseases:</strong> ${plant.diseases.map(item => sanitizeHTML(item)).join(', ')}</p>` : ''}
            </div>
        </div>
    `;
    }).join('');

    container.querySelectorAll('.plant-card').forEach(card => {
        card.addEventListener('click', () => {
            const isExpanded = card.classList.toggle('expanded');
            card.setAttribute('aria-expanded', String(isExpanded));
        });
    });

}

/**
 * Display common plant problems and solutions
 * @param {Array} problems - Array of problem objects
 */
function displayCommonProblems(problems) {
    const container = document.getElementById('problems-list');
    
    if (!problems || problems.length === 0) {
        container.innerHTML = '<p class="loading">No common problems documented for this region.</p>';
        return;
    }
    
    container.innerHTML = problems.map(prob => `
        <div class="problem-card">
            <h4>⚠️ ${sanitizeHTML(prob.problem)}</h4>
            <p><strong>Causes:</strong> ${sanitizeHTML(prob.causes)}</p>
            <p><strong>Solution:</strong> ${sanitizeHTML(prob.solution)}</p>
        </div>
    `).join('');
}

/**
 * Display comprehensive care guide
 * @param {Array} guidePoints - Array of care guide strings
 */
function displayCareGuide(guidePoints) {
    const container = document.getElementById('care-guide-content');
    
    if (!guidePoints || guidePoints.length === 0) {
        container.innerHTML = '<p class="loading">No care guide available for this region.</p>';
        return;
    }
    
    let html = '<div class="care-guide-items">';
    
    guidePoints.forEach((point, index) => {
        // Split into title and description
        const parts = point.split(':');
        const title = parts[0];
        const description = parts.slice(1).join(':').trim();
        
        html += `
            <div class="care-guide-item">
                <h4>📍 ${sanitizeHTML(title)}</h4>
                <p>${sanitizeHTML(description)}</p>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Add CSS for care guide items
 */
if (!document.querySelector('#care-guide-styles')) {
    const style = document.createElement('style');
    style.id = 'care-guide-styles';
    style.textContent = `
        .care-guide-items {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
        }
        
        .care-guide-item {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 1.5rem;
            border-radius: 10px;
            border-left: 4px solid var(--secondary-color);
        }
        
        .care-guide-item h4 {
            color: var(--primary-color);
            margin-bottom: 0.75rem;
            font-size: 1rem;
        }
        
        .care-guide-item p {
            color: var(--text-light);
            margin: 0;
            line-height: 1.6;
        }
    `;
    document.head.appendChild(style);
}
