/* ========================================
   Plant Care Assistant - Plant Data
   Country-wise plant information database
   ======================================== */

const PLANTS_DATABASE = {
    'United States': {
        climate: 'Temperate to Subtropical',
        commonPlants: [
            {
                name: 'Pothos (Devil\'s Ivy)',
                type: 'Climbing vine',
                care: 'Low light tolerant, water when soil dries. Perfect for beginners.',
                waterFreq: 'Every 2-3 weeks',
                light: 'Low to moderate'
            },
            {
                name: 'Snake Plant',
                type: 'Succulent',
                care: 'Extremely hardy. Prefers dry conditions. Nearly impossible to kill.',
                waterFreq: 'Every 4-6 weeks',
                light: 'Low to bright'
            },
            {
                name: 'Fiddle Leaf Fig',
                type: 'Tree',
                care: 'Loves bright light. Water when top inch of soil is dry. Needs humidity.',
                waterFreq: 'Every 1-2 weeks',
                light: 'Bright indirect light'
            },
            {
                name: 'Spider Plant',
                type: 'Grass-like',
                care: 'Very forgiving. Tolerates various conditions. Produces baby plants.',
                waterFreq: 'Every 1-2 weeks',
                light: 'Bright, indirect light'
            },
            {
                name: 'Monstera Deliciosa',
                type: 'Climbing vine',
                care: 'Large, dramatic leaves. Needs sturdy support. Monthly feeding in growing season.',
                waterFreq: 'Every 1-2 weeks',
                light: 'Bright, indirect light'
            }
        ],
        commonProblems: [
            {
                problem: 'Brown Leaf Tips',
                causes: 'Low humidity, tap water chlorine, underwatering',
                solution: 'Increase humidity by misting, use filtered water, keep soil consistently moist'
            },
            {
                problem: 'Root Rot',
                causes: 'Overwatering, poor drainage',
                solution: 'Repot in fresh soil, reduce watering, ensure pots have drainage holes'
            },
            {
                problem: 'Spider Mites',
                causes: 'Low humidity, dusty conditions',
                solution: 'Mist plants, increase humidity, spray with water or neem oil'
            },
            {
                problem: 'Wilting',
                causes: 'Underwatering or root rot',
                solution: 'Check soil moisture, water thoroughly if dry, inspect roots for rot'
            },
            {
                problem: 'Yellow Leaves',
                causes: 'Overwatering, nutrient deficiency',
                solution: 'Reduce watering, check drainage, fertilize during growing season'
            }
        ],
        careGuide: [
            'WATERING: Most houseplants prefer to dry out slightly between waterings. Overwatering is the #1 killer.',
            'LIGHT: Place plants near windows. South-facing provides most light, north-facing provides least.',
            'HUMIDITY: Group plants together to increase humidity. Most houseplants prefer 40-60% humidity.',
            'TEMPERATURE: Keep between 18-24°C (65-75°F). Avoid drafts and temperature fluctuations.',
            'FERTILIZING: Feed every 2-4 weeks during growing season (spring/summer). Reduce in winter.',
            'REPOTTING: Repot when roots emerge from drainage holes, typically yearly for young plants.',
            'PRUNING: Remove dead/yellow leaves. Pinch stems to encourage bushier growth.',
            'PEST CONTROL: Inspect regularly. Treat pests early with neem oil or insecticidal soap.'
        ]
    },
    'United Kingdom': {
        climate: 'Temperate Maritime',
        commonPlants: [
            {
                name: 'Philodendron',
                type: 'Climbing vine',
                care: 'Tolerant of lower light. Heart-shaped leaves. Grows quickly.',
                waterFreq: 'Every 1-2 weeks',
                light: 'Low to moderate'
            },
            {
                name: 'Rubber Plant',
                type: 'Tree',
                care: 'Large glossy leaves. Prefers bright light. Wipe leaves regularly.',
                waterFreq: 'Every 2-3 weeks',
                light: 'Bright, indirect light'
            },
            {
                name: 'Ivy',
                type: 'Climbing',
                care: 'Classic British choice. Prefers cool conditions and humidity.',
                waterFreq: 'Every 2-3 weeks',
                light: 'Low to moderate'
            },
            {
                name: 'Peace Lily',
                type: 'Flowering',
                care: 'Beautiful white flowers. Tolerates low light. Wilts when thirsty.',
                waterFreq: 'Every 1-2 weeks',
                light: 'Low to moderate'
            },
            {
                name: 'Boston Fern',
                type: 'Fern',
                care: 'Loves humidity. Prefers cool conditions. Needs consistent moisture.',
                waterFreq: 'Frequently (daily misting)',
                light: 'Bright, indirect light'
            }
        ],
        commonProblems: [
            {
                problem: 'Leaf Drop',
                causes: 'Low humidity (common in UK winters), drafts, temperature changes',
                solution: 'Increase humidity, move away from radiators and drafts, maintain stable temperature'
            },
            {
                problem: 'Mold and Mildew',
                causes: 'High humidity without air circulation (damp UK climate)',
                solution: 'Improve ventilation, reduce humidity, remove affected leaves'
            },
            {
                problem: 'Damping Off',
                causes: 'Cool, damp conditions',
                solution: 'Improve air circulation, reduce watering, use well-draining soil'
            },
            {
                problem: 'Condensation Problems',
                causes: 'Cold windows creating condensation',
                solution: 'Move plants away from cold windows, improve insulation, increase air flow'
            }
        ],
        careGuide: [
            'WINTER CARE: UK winters are dark and cold. Reduce watering and feeding. Keep away from cold windows.',
            'HUMIDITY: Year-round concern. Mist regularly, group plants together, use pebble trays.',
            'HEATING: Keep plants away from radiators and heat sources. Room temps between 15-18°C.',
            'DRAINAGE: Ensure excellent drainage due to damp climate. Use peat-free compost.',
            'LIGHT: Many UK homes lack sufficient light. Use grow lights during winter months.',
            'VENTILATION: Always ensure good air circulation to prevent fungal issues.',
            'OUTDOOR TENDING: Brief summer holidays outdoors benefit most houseplants.',
            'DORMANCY: Many plants go dormant in winter. Expect slower growth and fewer waterings.'
        ]
    },
    'Australia': {
        climate: 'Arid to Subtropical',
        commonPlants: [
            {
                name: 'Native Waratah',
                type: 'Shrub',
                care: 'Iconic Australian plant. Prefers well-drained soil. Drought tolerant.',
                waterFreq: 'Every 2-3 weeks',
                light: 'Full sun to part shade'
            },
            {
                name: 'Eucalyptus',
                type: 'Tree',
                care: 'Fast-growing, drought tolerant. Various sizes available.',
                waterFreq: 'Every 3-4 weeks',
                light: 'Full sun'
            },
            {
                name: 'Banksias',
                type: 'Shrub',
                care: 'Beautiful flower spikes. Drought tolerant once established.',
                waterFreq: 'Every 2-3 weeks',
                light: 'Full sun'
            },
            {
                name: 'Macadamia Nut',
                type: 'Tree',
                care: 'Tropical to subtropical. Edible nuts. Requires protection in cool areas.',
                waterFreq: 'Every 1-2 weeks',
                light: 'Full sun to part shade'
            },
            {
                name: 'Bougainvillea',
                type: 'Climbing vine',
                care: 'Colorful bracts. Loves heat and sun. Drought tolerant.',
                waterFreq: 'Every 2-3 weeks',
                light: 'Full sun'
            }
        ],
        commonProblems: [
            {
                problem: 'Heat Stress',
                causes: 'Excessive temperatures (>40°C)',
                solution: 'Provide shade cloth, mulch heavily, increase watering frequency'
            },
            {
                problem: 'Drought Stress',
                causes: 'Low rainfall, dry climate',
                solution: 'Deep watering, apply mulch, choose drought-resistant varieties'
            },
            {
                problem: 'Scale Insects',
                causes: 'Hot, dry conditions',
                solution: 'Spray with horticultural oil, prune affected branches'
            },
            {
                problem: 'Root Problems',
                causes: 'Alkaline or saline soils',
                solution: 'Improve soil with compost, use raised beds, select tolerant species'
            },
            {
                problem: 'Salt Burn',
                causes: 'Salt accumulation in soil or water',
                solution: 'Flush soil thoroughly, use rain water when possible'
            }
        ],
        careGuide: [
            'NATIVE FIRST: Choose native Australian plants suited to your region and climate.',
            'MULCHING: Apply thick mulch to retain moisture and protect roots from extreme heat.',
            'WATER WISELY: Water deeply but less frequently. Early morning watering best.',
            'SOIL: Improve poor soil with compost. Australian soils often need amendment.',
            'HEAT PROTECTION: Shade cloth essential during extreme heat. Light-colored cloth better.',
            'SEASONAL CARE: Summer is growing season. Winter is dormant for many species.',
            'FIRE SAFETY: Choose fire-resistant plants in high-risk areas. Clear dead material.',
            'FERTILIZING: Use slow-release fertilizers. Natural systems prefer organic matter.'
        ]
    },
    'India': {
        climate: 'Tropical Monsoon',
        commonPlants: [
            {
                name: 'Money Plant (Epipremnum)',
                type: 'Climbing vine',
                care: 'Most popular. Thrives in hot, humid climate. Brings good luck.',
                waterFreq: 'Every 3-4 days',
                light: 'Low to moderate'
            },
            {
                name: 'Tulsi (Holy Basil)',
                type: 'Herb',
                care: 'Sacred plant. Medicinal uses. Loves sunlight and warmth.',
                waterFreq: 'Every 1-2 days',
                light: 'Full sun'
            },
            {
                name: 'Neem Tree',
                type: 'Tree',
                care: 'Medicinal properties. Heat tolerant. Uses for pest control.',
                waterFreq: 'Every 3-4 days',
                light: 'Full sun'
            },
            {
                name: 'Jasmine',
                type: 'Flowering vine',
                care: 'Fragrant flowers. Heat loving. Attracts butterflies.',
                waterFreq: 'Every 2-3 days',
                light: 'Full sun to part shade'
            },
            {
                name: 'Hibiscus',
                type: 'Flowering shrub',
                care: 'Colorful blooms year-round. Thrives in heat. Regular pruning needed.',
                waterFreq: 'Every 1-2 days',
                light: 'Full sun'
            }
        ],
        commonProblems: [
            {
                problem: 'Monsoon Damage',
                causes: 'Heavy rains, waterlogging',
                solution: 'Improve drainage, raise beds, reduce watering during monsoon'
            },
            {
                problem: 'Fungal Diseases',
                causes: 'High humidity and warm temperatures',
                solution: 'Improve air circulation, reduce leaf wetness, use fungicide'
            },
            {
                problem: 'Pest Infestation',
                causes: 'Heat and humidity favor pests',
                solution: 'Regular inspection, neem spray, hand-pick pests'
            },
            {
                problem: 'Heat Wilting',
                causes: 'High temperatures (>40°C)',
                solution: 'Water in early morning and evening, provide shade, mulch'
            },
            {
                problem: 'Nutrient Deficiency',
                causes: 'Heavy monsoon rains leach nutrients',
                solution: 'Apply compost, use slow-release fertilizers, mulch'
            }
        ],
        careGuide: [
            'MONSOON PREP: Prepare drainage before monsoon arrives (June-September).',
            'WATERING: Natural rainfall sufficient during monsoon. Reduce supplemental watering.',
            'PEST CONTROL: Use neem (local and organic). Spray early morning to avoid heat.',
            'SUMMER CARE: Mulch heavily. Water twice daily during peak heat (May-June).',
            'HUMIDITY: High humidity promotes fungal issues. Ensure air circulation.',
            'SOIL: Add compost and organic matter annually. Indian soils need enrichment.',
            'PLANTING SEASON: Post-monsoon (October) best for new plantings.',
            'LOCAL FAVORITES: Grow tulsi, neem, papaya - well-adapted to climate.'
        ]
    },
    'Japan': {
        climate: 'Temperate with Four Seasons',
        commonPlants: [
            {
                name: 'Bamboo',
                type: 'Grass',
                care: 'Iconic plant. Various species. Excellent for privacy and decoration.',
                waterFreq: 'Every 2-3 days',
                light: 'Bright indirect to full sun'
            },
            {
                name: 'Cherry Blossom (Sakura)',
                type: 'Tree',
                care: 'Iconic Japanese flower. Blooms spring. Needs winter chill.',
                waterFreq: 'Every 2-3 days',
                light: 'Full sun'
            },
            {
                name: 'Japanese Maple',
                type: 'Tree',
                care: 'Delicate leaves, fall colors. Prefers partial shade and protected spot.',
                waterFreq: 'Every 1-2 days',
                light: 'Partial shade'
            },
            {
                name: 'Bonsai (various)',
                type: 'Miniature trees',
                care: 'Require skill and patience. Popular hobby in Japan.',
                waterFreq: 'Every 1-2 days',
                light: 'Bright light'
            },
            {
                name: 'Moss',
                type: 'Ground cover',
                care: 'Essential in Japanese gardens. Loves moisture and shade.',
                waterFreq: 'Keep consistently moist',
                light: 'Shade to partial shade'
            }
        ],
        commonProblems: [
            {
                problem: 'Winter Damage',
                causes: 'Cold temperatures and frost',
                solution: 'Protect with covers, choose cold-hardy varieties, reduce watering'
            },
            {
                problem: 'Summer Heat Stress',
                causes: 'High humidity and heat',
                solution: 'Provide shade, increase water, improve air circulation'
            },
            {
                problem: 'Typhoon Damage',
                causes: 'Strong winds and heavy rain (late summer/fall)',
                solution: 'Secure plants, stake tall plants, prune weak branches'
            },
            {
                problem: 'Pest & Disease',
                causes: 'High humidity',
                solution: 'Regular inspection, proper pruning, good air flow'
            }
        ],
        careGuide: [
            'SEASONAL CARE: Japanese gardening follows seasons. Different care each season.',
            'WINTER: Many plants go dormant. Reduce watering and feeding. Protect from frost.',
            'SPRING: Pruning season. New growth period. Begin regular fertilizing.',
            'SUMMER: Heavy watering needed. Watch for pests. Provide afternoon shade.',
            'FALL: Enjoy colors. Prepare plants for winter. Clean up fallen leaves.',
            'SOIL: Japanese culture values good drainage. Use quality potting mix.',
            'WATER: Use collected rainwater. Quality of water matters in Japanese tradition.',
            'PATIENCE: Many Japanese plants take years to develop. Bonsai cultivates patience.'
        ]
    },
    'Brazil': {
        climate: 'Tropical to Subtropical',
        commonPlants: [
            {
                name: 'Orchids',
                type: 'Epiphytic plant',
                care: 'National flower. Thousands of species. Require humidity and airflow.',
                waterFreq: 'Every 2-3 days',
                light: 'Bright, indirect light'
            },
            {
                name: 'Passion Flower',
                type: 'Climbing vine',
                care: 'Beautiful intricate flowers. Heat loving. Attracts butterflies.',
                waterFreq: 'Every 1-2 days',
                light: 'Full sun to part shade'
            },
            {
                name: 'Bromeliads',
                type: 'Epiphytic plant',
                care: 'Colorful leaves. Tank-type holds water. Easy care.',
                waterFreq: 'Keep tank filled',
                light: 'Bright, indirect light'
            },
            {
                name: 'Heliconia',
                type: 'Tropical flower',
                care: 'Exotic red/orange flowers. Large plant. Needs space.',
                waterFreq: 'Every 1-2 days',
                light: 'Full sun to bright shade'
            },
            {
                name: 'Avocado Tree',
                type: 'Fruit tree',
                care: 'Can be grown from seed. Tropical climate essential. Takes years to fruit.',
                waterFreq: 'Every 2-3 days',
                light: 'Full sun'
            }
        ],
        commonProblems: [
            {
                problem: 'High Humidity Issues',
                causes: 'Excessive moisture in tropical climate',
                solution: 'Improve drainage, increase air circulation, reduce watering'
            },
            {
                problem: 'Tropical Pests',
                causes: 'Heat and humidity favor pests',
                solution: 'Regular inspection, organic pesticides, biological control'
            },
            {
                problem: 'Nutrient Leaching',
                causes: 'Heavy rainfall washes away nutrients',
                solution: 'Apply fertilizer frequently, use slow-release formulas'
            },
            {
                problem: 'Dry Season Stress',
                causes: 'Some regions have dry season',
                solution: 'Mulch heavily, water in morning/evening, reduce exposure'
            }
        ],
        careGuide: [
            'HUMIDITY: Tropical paradise. Most plants LOVE humidity. Mist regularly.',
            'WATER: Abundant rainfall natural. Well-drain potting mix crucial indoors.',
            'HEAT: Most plants thrive in warmth. No cold dormancy needed.',
            'TROPICAL SELECTION: Grow plants naturally suited to Brazilian climate.',
            'EPIPHYTES: Orchids and bromeliads prefer airflow, not soil. Mount on bark.',
            'PEST MANAGEMENT: Monitor constantly. Use organic methods (neem, etc).',
            'FERTILIZING: Heavy rains leach nutrients. Feed regularly, especially during rainy season.',
            'SEASONAL: Some dry-season plants need different care. Research your region.'
        ]
    }
};

/**
 * Get plant data for a specific country
 * @param {string} country - Country name
 * @returns {Object} Plant data or default data
 */
function getCountryPlantData(country) {
    // Try exact match first
    if (PLANTS_DATABASE[country]) {
        return PLANTS_DATABASE[country];
    }
    
    // Return default if country not found
    return PLANTS_DATABASE['United States'];
}

/**
 * Get list of all available countries
 * @returns {Array} List of country names
 */
function getAllCountries() {
    return Object.keys(PLANTS_DATABASE).sort();
}

/**
 * Search for a plant across all countries
 * @param {string} searchTerm - Plant name to search for
 * @returns {Array} Matching plants with their countries
 */
function searchPlants(searchTerm) {
    const results = [];
    const term = searchTerm.toLowerCase();
    
    Object.entries(PLANTS_DATABASE).forEach(([country, data]) => {
        data.commonPlants.forEach(plant => {
            if (plant.name.toLowerCase().includes(term) || plant.type.toLowerCase().includes(term)) {
                results.push({
                    country: country,
                    plant: plant
                });
            }
        });
    });
    
    return results;
}
