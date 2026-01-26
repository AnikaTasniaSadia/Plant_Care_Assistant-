const SUPABASE_URL = 'https://anmfapmftqxnbdhjefrt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8YmzFwOnHKcvOJlsgcGJ6A_lHLg1ZG9';

let supabase;

document.addEventListener('DOMContentLoaded', () => {
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        return;
    }
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    initAdmin();
});

async function initAdmin() {
    const statusCard = document.getElementById('admin-status');
    const messageEl = statusCard ? statusCard.querySelector('p') : null;

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;

    if (!session) {
        if (messageEl) messageEl.textContent = 'Please sign in to access admin features.';
        if (typeof window.openAuthOverlay === 'function') {
            window.openAuthOverlay('login');
        }
        lockAdminForms();
        return;
    }

    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin, full_name')
        .eq('id', session.user.id)
        .single();

    if (profileError || !profileData?.is_admin) {
        if (messageEl) messageEl.textContent = 'Access denied. Admin role required.';
        lockAdminForms();
        return;
    }

    if (messageEl) {
        messageEl.textContent = `Welcome, ${profileData.full_name || 'Admin'}! You can manage the database below.`;
    }

    await refreshAll();
    bindForms();
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
        await supabase.from('countries').insert({ name, climate });
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
        await supabase.from('plants').insert({
            country_id: countryId,
            name,
            type,
            light,
            water_freq,
            care
        });
        plantForm.reset();
        await refreshAll();
    });

    imageForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const plantId = document.getElementById('image-plant').value;
        const url = document.getElementById('image-url').value.trim();
        const caption = document.getElementById('image-caption').value.trim();
        if (!plantId || !url) return;
        await supabase.from('plant_images').insert({
            plant_id: plantId,
            url,
            caption
        });
        imageForm.reset();
        await refreshAll();
    });

    diseaseForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const plantId = document.getElementById('disease-plant').value;
        const name = document.getElementById('disease-name').value.trim();
        if (!plantId || !name) return;
        await supabase.from('plant_diseases').insert({
            plant_id: plantId,
            name
        });
        diseaseForm.reset();
        await refreshAll();
    });
}

async function loadCountries() {
    const list = document.getElementById('country-list');
    const select = document.getElementById('plant-country');
    if (!list || !select) return;

    const { data } = await supabase.from('countries').select('id,name,climate').order('name');
    select.innerHTML = '<option value="">Select country</option>';

    (data || []).forEach(country => {
        const option = document.createElement('option');
        option.value = country.id;
        option.textContent = country.name;
        select.appendChild(option);
    });

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
            await supabase.from('countries').delete().eq('id', id);
            await refreshAll();
        });
    });
}

async function loadPlants() {
    const list = document.getElementById('plant-list');
    const selectImage = document.getElementById('image-plant');
    const selectDisease = document.getElementById('disease-plant');
    if (!list || !selectImage || !selectDisease) return;

    const { data } = await supabase
        .from('plants')
        .select('id,name,type,light,water_freq,countries(name)')
        .order('name');

    selectImage.innerHTML = '<option value="">Select plant</option>';
    selectDisease.innerHTML = '<option value="">Select plant</option>';

    (data || []).forEach(plant => {
        const option = document.createElement('option');
        option.value = plant.id;
        option.textContent = `${plant.name}${plant.countries?.name ? ` (${plant.countries.name})` : ''}`;
        selectImage.appendChild(option.cloneNode(true));
        selectDisease.appendChild(option);
    });

    list.innerHTML = (data || []).map(plant => `
        <div class="admin-item">
            <div>
                <strong>${plant.name}</strong>
                <p>${plant.countries?.name || 'No country'} • ${plant.type || 'Type'} • ${plant.light || 'Light'} • ${plant.water_freq || 'Watering'}</p>
            </div>
            <button class="btn btn-secondary" data-delete-plant="${plant.id}">Delete</button>
        </div>
    `).join('');

    list.querySelectorAll('[data-delete-plant]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.deletePlant;
            await supabase.from('plants').delete().eq('id', id);
            await refreshAll();
        });
    });
}

async function loadImages() {
    const list = document.getElementById('image-list');
    if (!list) return;
    const { data } = await supabase
        .from('plant_images')
        .select('id,url,caption,plants(name)')
        .order('created_at', { ascending: false });

    list.innerHTML = (data || []).map(item => `
        <div class="admin-item">
            <div>
                <strong>${item.plants?.name || 'Plant'}</strong>
                <p>${item.caption || item.url}</p>
            </div>
            <button class="btn btn-secondary" data-delete-image="${item.id}">Delete</button>
        </div>
    `).join('');

    list.querySelectorAll('[data-delete-image]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.deleteImage;
            await supabase.from('plant_images').delete().eq('id', id);
            await refreshAll();
        });
    });
}

async function loadDiseases() {
    const list = document.getElementById('disease-list');
    if (!list) return;
    const { data } = await supabase
        .from('plant_diseases')
        .select('id,name,plants(name)')
        .order('created_at', { ascending: false });

    list.innerHTML = (data || []).map(item => `
        <div class="admin-item">
            <div>
                <strong>${item.name}</strong>
                <p>${item.plants?.name || 'Plant'}</p>
            </div>
            <button class="btn btn-secondary" data-delete-disease="${item.id}">Delete</button>
        </div>
    `).join('');

    list.querySelectorAll('[data-delete-disease]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.deleteDisease;
            await supabase.from('plant_diseases').delete().eq('id', id);
            await refreshAll();
        });
    });
}
