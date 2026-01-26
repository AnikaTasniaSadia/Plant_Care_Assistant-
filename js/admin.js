let supabase;
const adminState = {
    countriesById: new Map(),
    plantsById: new Map()
};

function setAdminStatus(message, { isError = false } = {}) {
    const statusCard = document.getElementById('admin-status');
    const messageEl = statusCard ? statusCard.querySelector('p') : null;
    if (!messageEl) return;
    messageEl.textContent = message;
    messageEl.style.color = isError ? '#b42318' : '';
}

function formatSupabaseError(error) {
    if (!error) return '';
    const parts = [error.message, error.details, error.hint, error.code].filter(Boolean);
    return parts.join(' • ');
}

function logSupabaseError(context, error) {
    if (!error) return;
    // Visible in DevTools for debugging.
    console.error(`[Admin] ${context}:`, error);
}

// Surface runtime errors to the Status card so failures aren't silent.
window.addEventListener('error', (event) => {
    const message = event?.error?.message || event?.message || 'Unknown script error';
    setAdminStatus(`Error: ${message}`, { isError: true });
});

window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    const message = (reason && (reason.message || String(reason))) || 'Unhandled promise rejection';
    setAdminStatus(`Error: ${message}`, { isError: true });
});

document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.requireAdminGate === 'function') {
        const ok = window.requireAdminGate({ redirectTo: 'admin-login.html' });
        if (!ok) return;
    }

    if (typeof window.getSupabaseClient !== 'function') {
        setAdminStatus('Supabase auth helper is missing. Ensure js/main.js is loaded before js/admin.js.', { isError: true });
        return;
    }
    supabase = window.getSupabaseClient();
    if (!supabase) {
        setAdminStatus('Supabase client failed to load. Check your internet connection and refresh.', { isError: true });
        return;
    }
    initAdmin();
});

async function initAdmin() {
    const seedBtn = document.getElementById('seed-data-btn');

    setAdminStatus('Initializing admin dashboard...');

    try {
        setAdminStatus('Reading session...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
            logSupabaseError('getSession failed', sessionError);
            setAdminStatus(`Unable to read session: ${formatSupabaseError(sessionError)}`, { isError: true });
            lockAdminForms();
            return;
        }

        const session = sessionData?.session;

        if (!session) {
            setAdminStatus('Please sign in to access admin features.');
            if (typeof window.openAuthOverlay === 'function') {
                window.openAuthOverlay('login');
            }
            lockAdminForms();
            return;
        }

        setAdminStatus('Verifying admin role...');
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('is_admin, full_name')
            .eq('id', session.user.id)
            .single();

        if (profileError) {
            logSupabaseError('profiles select failed', profileError);
            setAdminStatus(`Unable to verify admin role: ${formatSupabaseError(profileError)}`, { isError: true });
            lockAdminForms();
            return;
        }

        if (!profileData?.is_admin) {
            setAdminStatus('Access denied. Admin role required.', { isError: true });
            lockAdminForms();
            return;
        }

        setAdminStatus(`Welcome, ${profileData.full_name || 'Admin'}! You can manage the database below.`);

        setAdminStatus('Loading data...');
        await refreshAll();
        await ensureSeedButton(seedBtn);
        bindForms();
    } catch (err) {
        console.error('[Admin] Unexpected init error:', err);
        setAdminStatus('Unexpected error while loading admin dashboard. Check DevTools Console.', { isError: true });
        lockAdminForms();
    }
}

async function ensureSeedButton(seedBtn) {
    if (!seedBtn) return;

    const { count, error } = await supabase
        .from('countries')
        .select('id', { count: 'exact', head: true });

    if (error) {
        logSupabaseError('countries count failed', error);
        setAdminStatus(`Cannot read countries table: ${formatSupabaseError(error)}`, { isError: true });
        // If the schema isn't created yet, importing won't work.
        seedBtn.style.display = 'none';
        return;
    }

    if (count === 0) {
        setAdminStatus('No countries found. Import your local data to get started.');
        seedBtn.style.display = 'inline-flex';
        seedBtn.addEventListener('click', async () => {
            seedBtn.disabled = true;
            const originalText = seedBtn.textContent;
            seedBtn.textContent = 'Importing...';
            const result = await seedFromLocalData();
            if (!result.ok) {
                setAdminStatus(`Import failed: ${result.message}`, { isError: true });
                seedBtn.disabled = false;
                seedBtn.textContent = originalText;
                return;
            }
            seedBtn.style.display = 'none';
            setAdminStatus('Local data imported successfully.');
            await refreshAll();
        }, { once: true });
    } else {
        seedBtn.style.display = 'none';
    }
}

async function seedFromLocalData() {
    if (!window.PLANTS_DATABASE) {
        return { ok: false, message: 'Local PLANTS_DATABASE not found. Ensure js/data.js loads before js/admin.js.' };
    }

    const countries = Object.entries(window.PLANTS_DATABASE).map(([name, data]) => ({
        name,
        climate: data.climate || null
    }));

    const { error: upsertCountriesError } = await supabase
        .from('countries')
        .upsert(countries, { onConflict: 'name' });
    if (upsertCountriesError) {
        logSupabaseError('countries upsert failed', upsertCountriesError);
        return { ok: false, message: formatSupabaseError(upsertCountriesError) };
    }

    const { data: countryRows, error: readCountriesError } = await supabase
        .from('countries')
        .select('id,name');
    if (readCountriesError) {
        logSupabaseError('countries select failed', readCountriesError);
        return { ok: false, message: formatSupabaseError(readCountriesError) };
    }
    const countryMap = new Map((countryRows || []).map(row => [row.name, row.id]));

    // Seed plants idempotently (best effort) by inserting only missing (country_id, name).
    const { data: existingPlants, error: existingPlantsError } = await supabase
        .from('plants')
        .select('id,name,country_id');
    if (existingPlantsError) {
        logSupabaseError('plants select (pre-seed) failed', existingPlantsError);
        return { ok: false, message: formatSupabaseError(existingPlantsError) };
    }

    const existingPlantKey = new Set(
        (existingPlants || []).map(row => `${row.country_id}:${row.name}`)
    );

    const plantRows = [];
    const plantImages = [];
    const plantDiseases = [];

    Object.entries(window.PLANTS_DATABASE).forEach(([countryName, data]) => {
        const countryId = countryMap.get(countryName);
        (data.commonPlants || []).forEach(plant => {
            if (!countryId || !plant?.name) return;
            const key = `${countryId}:${plant.name}`;
            if (existingPlantKey.has(key)) return;
            plantRows.push({
                country_id: countryId,
                name: plant.name,
                type: plant.type,
                care: plant.care,
                water_freq: plant.waterFreq,
                light: plant.light
            });
        });
    });

    if (plantRows.length) {
        const { error: insertPlantsError } = await supabase.from('plants').insert(plantRows);
        if (insertPlantsError) {
            logSupabaseError('plants insert failed', insertPlantsError);
            return { ok: false, message: formatSupabaseError(insertPlantsError) };
        }
    }

    const { data: plantRowsDb, error: readPlantsError } = await supabase
        .from('plants')
        .select('id,name,country_id');
    if (readPlantsError) {
        logSupabaseError('plants select (post-seed) failed', readPlantsError);
        return { ok: false, message: formatSupabaseError(readPlantsError) };
    }

    const plantMap = new Map();
    (plantRowsDb || []).forEach(row => {
        plantMap.set(`${row.country_id}:${row.name}`, row.id);
    });

    Object.entries(window.PLANTS_DATABASE).forEach(([countryName, data]) => {
        const countryId = countryMap.get(countryName);
        (data.commonPlants || []).forEach(plant => {
            const plantId = plantMap.get(`${countryId}:${plant.name}`);
            if (!plantId) return;
            if (plant.image) {
                plantImages.push({
                    plant_id: plantId,
                    url: plant.image,
                    caption: plant.name
                });
            }
            if (plant.diseases && plant.diseases.length) {
                plant.diseases.forEach(disease => {
                    plantDiseases.push({
                        plant_id: plantId,
                        name: disease
                    });
                });
            }
        });
    });

    if (plantImages.length) {
        const { error: insertImagesError } = await supabase.from('plant_images').insert(plantImages);
        if (insertImagesError) {
            logSupabaseError('plant_images insert failed', insertImagesError);
            return { ok: false, message: formatSupabaseError(insertImagesError) };
        }
    }
    if (plantDiseases.length) {
        const { error: insertDiseasesError } = await supabase.from('plant_diseases').insert(plantDiseases);
        if (insertDiseasesError) {
            logSupabaseError('plant_diseases insert failed', insertDiseasesError);
            return { ok: false, message: formatSupabaseError(insertDiseasesError) };
        }
    }

    return { ok: true };
}

function lockAdminForms() {
    document.querySelectorAll('.admin-form input, .admin-form select, .admin-form textarea, .admin-form button').forEach(el => {
        el.disabled = true;
    });
}

async function refreshAll() {
    await loadCountries();
    await loadPlants();
    await loadImages();
    await loadDiseases();
}

function bindForms() {
    const countryForm = document.getElementById('country-form');
    const plantForm = document.getElementById('plant-form');
    const imageForm = document.getElementById('image-form');
    const diseaseForm = document.getElementById('disease-form');

    countryForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('country-name').value.trim();
        const climate = document.getElementById('country-climate').value.trim();
        if (!name) return;
        const { error } = await supabase.from('countries').insert({ name, climate });
        if (error) {
            logSupabaseError('countries insert failed', error);
            setAdminStatus(`Failed to add country: ${formatSupabaseError(error)}`, { isError: true });
            return;
        }
        countryForm.reset();
        await refreshAll();
    });

    plantForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const countryId = document.getElementById('plant-country').value;
        const name = document.getElementById('plant-name').value.trim();
        const type = document.getElementById('plant-type').value.trim();
        const light = document.getElementById('plant-light').value.trim();
        const water_freq = document.getElementById('plant-water').value.trim();
        const care = document.getElementById('plant-care').value.trim();
        if (!countryId || !name) return;
        const { error } = await supabase.from('plants').insert({
            country_id: countryId,
            name,
            type,
            light,
            water_freq,
            care
        });
        if (error) {
            logSupabaseError('plants insert failed', error);
            setAdminStatus(`Failed to add plant: ${formatSupabaseError(error)}`, { isError: true });
            return;
        }
        plantForm.reset();
        await refreshAll();
    });

    imageForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const plantId = document.getElementById('image-plant').value;
        const url = document.getElementById('image-url').value.trim();
        const caption = document.getElementById('image-caption').value.trim();
        if (!plantId || !url) return;
        const { error } = await supabase.from('plant_images').insert({
            plant_id: plantId,
            url,
            caption
        });
        if (error) {
            logSupabaseError('plant_images insert failed', error);
            setAdminStatus(`Failed to add image: ${formatSupabaseError(error)}`, { isError: true });
            return;
        }
        imageForm.reset();
        await refreshAll();
    });

    diseaseForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const plantId = document.getElementById('disease-plant').value;
        const name = document.getElementById('disease-name').value.trim();
        if (!plantId || !name) return;
        const { error } = await supabase.from('plant_diseases').insert({
            plant_id: plantId,
            name
        });
        if (error) {
            logSupabaseError('plant_diseases insert failed', error);
            setAdminStatus(`Failed to add disease: ${formatSupabaseError(error)}`, { isError: true });
            return;
        }
        diseaseForm.reset();
        await refreshAll();
    });
}

async function loadCountries() {
    const list = document.getElementById('country-list');
    const select = document.getElementById('plant-country');
    if (!list || !select) return;

    const { data, error } = await supabase.from('countries').select('id,name,climate').order('name');
    if (error) {
        logSupabaseError('countries select failed', error);
        setAdminStatus(`Failed to load countries: ${formatSupabaseError(error)}`, { isError: true });
    }

    adminState.countriesById.clear();
    (data || []).forEach(country => adminState.countriesById.set(country.id, country));

    select.innerHTML = '<option value="">Select country</option>';

    (data || []).forEach(country => {
        const option = document.createElement('option');
        option.value = country.id;
        option.textContent = country.name;
        select.appendChild(option);
    });

    if (!data || data.length === 0) {
        list.innerHTML = '<p class="muted">No countries yet.</p>';
        return;
    }

    list.innerHTML = (data || []).map(country => `
        <div class="admin-item">
            <div>
                <strong>${country.name}</strong>
                <p>${country.climate || 'No climate info'}</p>
            </div>
            <button class="btn btn-secondary" data-delete-country="${country.id}">Delete</button>
        </div>
    `).join('');

    list.querySelectorAll('[data-delete-country]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.deleteCountry;
            const { error: deleteError } = await supabase.from('countries').delete().eq('id', id);
            if (deleteError) {
                logSupabaseError('countries delete failed', deleteError);
                setAdminStatus(`Failed to delete country: ${formatSupabaseError(deleteError)}`, { isError: true });
                return;
            }
            await refreshAll();
        });
    });
}

async function loadPlants() {
    const list = document.getElementById('plant-list');
    const selectImage = document.getElementById('image-plant');
    const selectDisease = document.getElementById('disease-plant');
    if (!list || !selectImage || !selectDisease) return;

    const { data, error } = await supabase
        .from('plants')
        .select('id,name,type,light,water_freq,country_id')
        .order('name');

    if (error) {
        logSupabaseError('plants select failed', error);
        setAdminStatus(`Failed to load plants: ${formatSupabaseError(error)}`, { isError: true });
    }

    adminState.plantsById.clear();
    (data || []).forEach(plant => adminState.plantsById.set(plant.id, plant));

    selectImage.innerHTML = '<option value="">Select plant</option>';
    selectDisease.innerHTML = '<option value="">Select plant</option>';

    (data || []).forEach(plant => {
        const countryName = adminState.countriesById.get(plant.country_id)?.name;
        const option = document.createElement('option');
        option.value = plant.id;
        option.textContent = `${plant.name}${countryName ? ` (${countryName})` : ''}`;
        selectImage.appendChild(option.cloneNode(true));
        selectDisease.appendChild(option);
    });

    if (!data || data.length === 0) {
        list.innerHTML = '<p class="muted">No plants yet.</p>';
        return;
    }

    list.innerHTML = (data || []).map(plant => `
        <div class="admin-item">
            <div>
                <strong>${plant.name}</strong>
                <p>${adminState.countriesById.get(plant.country_id)?.name || 'No country'} • ${plant.type || 'Type'} • ${plant.light || 'Light'} • ${plant.water_freq || 'Watering'}</p>
            </div>
            <button class="btn btn-secondary" data-delete-plant="${plant.id}">Delete</button>
        </div>
    `).join('');

    list.querySelectorAll('[data-delete-plant]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.deletePlant;
            const { error: deleteError } = await supabase.from('plants').delete().eq('id', id);
            if (deleteError) {
                logSupabaseError('plants delete failed', deleteError);
                setAdminStatus(`Failed to delete plant: ${formatSupabaseError(deleteError)}`, { isError: true });
                return;
            }
            await refreshAll();
        });
    });
}

async function loadImages() {
    const list = document.getElementById('image-list');
    if (!list) return;
    const { data, error } = await supabase
        .from('plant_images')
        .select('id,url,caption,plant_id')
        .order('created_at', { ascending: false });

    if (error) {
        logSupabaseError('plant_images select failed', error);
        setAdminStatus(`Failed to load images: ${formatSupabaseError(error)}`, { isError: true });
    }

    if (!data || data.length === 0) {
        list.innerHTML = '<p class="muted">No images yet.</p>';
        return;
    }

    list.innerHTML = (data || []).map(item => `
        <div class="admin-item">
            <div>
                <strong>${adminState.plantsById.get(item.plant_id)?.name || 'Plant'}</strong>
                <p>${item.caption || item.url}</p>
            </div>
            <button class="btn btn-secondary" data-delete-image="${item.id}">Delete</button>
        </div>
    `).join('');

    list.querySelectorAll('[data-delete-image]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.deleteImage;
            const { error: deleteError } = await supabase.from('plant_images').delete().eq('id', id);
            if (deleteError) {
                logSupabaseError('plant_images delete failed', deleteError);
                setAdminStatus(`Failed to delete image: ${formatSupabaseError(deleteError)}`, { isError: true });
                return;
            }
            await refreshAll();
        });
    });
}

async function loadDiseases() {
    const list = document.getElementById('disease-list');
    if (!list) return;
    const { data, error } = await supabase
        .from('plant_diseases')
        .select('id,name,plant_id')
        .order('created_at', { ascending: false });

    if (error) {
        logSupabaseError('plant_diseases select failed', error);
        setAdminStatus(`Failed to load diseases: ${formatSupabaseError(error)}`, { isError: true });
    }

    if (!data || data.length === 0) {
        list.innerHTML = '<p class="muted">No diseases yet.</p>';
        return;
    }

    list.innerHTML = (data || []).map(item => `
        <div class="admin-item">
            <div>
                <strong>${item.name}</strong>
                <p>${adminState.plantsById.get(item.plant_id)?.name || 'Plant'}</p>
            </div>
            <button class="btn btn-secondary" data-delete-disease="${item.id}">Delete</button>
        </div>
    `).join('');

    list.querySelectorAll('[data-delete-disease]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.deleteDisease;
            const { error: deleteError } = await supabase.from('plant_diseases').delete().eq('id', id);
            if (deleteError) {
                logSupabaseError('plant_diseases delete failed', deleteError);
                setAdminStatus(`Failed to delete disease: ${formatSupabaseError(deleteError)}`, { isError: true });
                return;
            }
            await refreshAll();
        });
    });
}
