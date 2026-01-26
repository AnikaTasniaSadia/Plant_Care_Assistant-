const ADMIN_GATE_STORAGE_KEY = 'pcaAdminGate';

function isAdminGateActive() {
    try {
        const raw = localStorage.getItem(ADMIN_GATE_STORAGE_KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        if (!parsed || parsed.email !== 'admin@gmail.com') return false;

        // Optional expiry: 24h
        const ts = Number(parsed.ts || 0);
        if (!ts) return false;
        const maxAgeMs = 24 * 60 * 60 * 1000;
        return Date.now() - ts < maxAgeMs;
    } catch {
        return false;
    }
}

function setAdminGateActive() {
    localStorage.setItem(
        ADMIN_GATE_STORAGE_KEY,
        JSON.stringify({ email: 'admin@gmail.com', ts: Date.now() })
    );
}

function clearAdminGate() {
    localStorage.removeItem(ADMIN_GATE_STORAGE_KEY);
}

function requireAdminGate({ redirectTo = 'admin-login.html' } = {}) {
    if (isAdminGateActive()) return true;
    const next = encodeURIComponent(window.location.pathname.split('/').pop() || 'admin.html');
    window.location.href = `${redirectTo}?next=${next}`;
    return false;
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('admin-login-form');
    if (!form) return;

    const emailInput = document.getElementById('admin-email');
    const passwordInput = document.getElementById('admin-password');
    const messageEl = document.getElementById('admin-login-message');

    const url = new URL(window.location.href);
    const next = url.searchParams.get('next') || 'admin.html';

    if (isAdminGateActive()) {
        window.location.href = next;
        return;
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const email = (emailInput?.value || '').trim().toLowerCase();
        const password = passwordInput?.value || '';

        if (email === 'admin@gmail.com' && password === 'admin123') {
            setAdminGateActive();
            if (messageEl) {
                messageEl.textContent = 'Login successful. Redirecting to dashboard...';
                messageEl.classList.remove('error');
                messageEl.classList.add('success');
            }
            window.location.href = next;
            return;
        }

        if (messageEl) {
            messageEl.textContent = 'Invalid admin credentials.';
            messageEl.classList.remove('success');
            messageEl.classList.add('error');
        }
    });
});

// Expose helpers globally.
window.isAdminGateActive = isAdminGateActive;
window.requireAdminGate = requireAdminGate;
window.clearAdminGate = clearAdminGate;
