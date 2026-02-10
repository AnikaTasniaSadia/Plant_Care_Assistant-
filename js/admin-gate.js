const ADMIN_GATE_STORAGE_KEY = 'pcaAdminGate';

function isAdminGateActive() {
    try {
        const raw = localStorage.getItem(ADMIN_GATE_STORAGE_KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        if (!parsed || parsed.email !== 'admin@gmail.com') return false;

        if (parsed.persistent) return true;

        // Optional expiry: 24h
        const ts = Number(parsed.ts || 0);
        if (!ts) return false;
        const maxAgeMs = 24 * 60 * 60 * 1000;
        return Date.now() - ts < maxAgeMs;
    } catch {
        return false;
    }
}

function setAdminGateActive({ persistent = false } = {}) {
    localStorage.setItem(
        ADMIN_GATE_STORAGE_KEY,
        JSON.stringify({ email: 'admin@gmail.com', ts: Date.now(), persistent })
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

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = (emailInput?.value || '').trim().toLowerCase();
        const password = passwordInput?.value || '';

        // Prefer real authentication via Supabase (recommended), fallback to local-only demo gate.
        const canUseSupabase = typeof window.getSupabaseClient === 'function' && !!window.getSupabaseClient();
        if (canUseSupabase) {
            try {
                const supabase = window.getSupabaseClient();
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) {
                    // If Supabase fails, allow the offline admin gate credentials.
                    if (email === 'admin@gmail.com' && password === 'admin123') {
                        setAdminGateActive({ persistent: true });
                        if (messageEl) {
                            messageEl.textContent = 'Login successful (offline admin mode). Redirecting to dashboard...';
                            messageEl.classList.remove('error');
                            messageEl.classList.add('success');
                        }
                        window.location.href = next;
                        return;
                    }

                    if (messageEl) {
                        messageEl.textContent = `Login failed: ${error.message}`;
                        messageEl.classList.remove('success');
                        messageEl.classList.add('error');
                    }
                    return;
                }

                setAdminGateActive({ persistent: false });
                if (messageEl) {
                    messageEl.textContent = 'Login successful. Redirecting to dashboard...';
                    messageEl.classList.remove('error');
                    messageEl.classList.add('success');
                }
                window.location.href = next;
                return;
            } catch (err) {
                if (messageEl) {
                    messageEl.textContent = 'Login failed due to an unexpected error. Check DevTools Console.';
                    messageEl.classList.remove('success');
                    messageEl.classList.add('error');
                }
                console.error('[Admin Gate] Unexpected login error:', err);
                return;
            }
        }

        if (email === 'admin@gmail.com' && password === 'admin123') {
            setAdminGateActive({ persistent: true });
            if (messageEl) {
                messageEl.textContent = 'Login successful (offline admin mode). Redirecting to dashboard...';
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
