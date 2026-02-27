/**
 * PULZ — Authentication (Supabase)
 * Handles: sign up, sign in, sign out, session management, UI state
 */

/* ============================================
   SUPABASE CLIENT
   ============================================ */
const SUPABASE_URL = 'https://wpolabdhyqcajseegdlr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_f9AdrcGSGcT73Be7VAlI2A_j3zzLSkr';

let supabase;
let currentUser = null;

async function initAuth() {
    // Load Supabase client from CDN
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
        console.warn('Supabase client not loaded — auth running in offline mode');
        updateAuthUI();
        return;
    }

    // Check existing session
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            currentUser = session.user;
        }
    } catch (e) {
        console.warn('Auth session check failed:', e);
    }

    // Always update UI
    updateAuthUI();

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
        currentUser = session?.user || null;
        updateAuthUI();

        if (event === 'SIGNED_IN') {
            closeAuthModal();
        }
    });
}

/* ============================================
   AUTH ACTIONS
   ============================================ */
async function authSignUp(email, password) {
    const t = T[lang];
    if (!supabase) { showAuthError('Servicio no disponible. Intentá de nuevo.'); return; }
    showAuthLoading(true);
    clearAuthError();

    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });

    showAuthLoading(false);

    if (error) {
        showAuthError(error.message);
        return;
    }

    // Show confirmation message
    showAuthView('confirm');
}

async function authSignIn(email, password) {
    const t = T[lang];
    if (!supabase) { showAuthError('Servicio no disponible. Intentá de nuevo.'); return; }
    showAuthLoading(true);
    clearAuthError();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    showAuthLoading(false);

    if (error) {
        if (error.message.includes('Invalid login')) {
            showAuthError(t.authErrCreds);
        } else if (error.message.includes('Email not confirmed')) {
            showAuthError(t.authErrConfirm);
        } else {
            showAuthError(error.message);
        }
        return;
    }
}

async function authSignOut() {
    if (supabase) await supabase.auth.signOut();
    currentUser = null;
    updateAuthUI();
    closeUserMenu();
}

async function authResetPassword(email) {
    if (!supabase) { showAuthError('Servicio no disponible. Intentá de nuevo.'); return; }
    showAuthLoading(true);
    clearAuthError();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
    });

    showAuthLoading(false);

    if (error) {
        showAuthError(error.message);
        return;
    }

    showAuthView('reset-sent');
}

async function authSignInWithGoogle() {
    if (!supabase) { showAuthError('Servicio no disponible. Intentá de nuevo.'); return; }
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin
        }
    });

    if (error) {
        showAuthError(error.message);
    }
}

/* ============================================
   FAVORITES
   ============================================ */
let favorites = JSON.parse(localStorage.getItem('pulz_favs') || '[]');

function isFavorite(favId) {
    return favorites.includes(favId);
}

function toggleFav(favId) {
    if (!currentUser) {
        // Not logged in — open auth with contextual message
        openAuthModal('signup');
        setTimeout(() => {
            const sub = document.querySelector('.auth-subtitle');
            if (sub) sub.textContent = T[lang].favLogin;
        }, 120);
        return;
    }

    const idx = favorites.indexOf(favId);
    if (idx > -1) {
        favorites.splice(idx, 1);
    } else {
        favorites.push(favId);
    }
    localStorage.setItem('pulz_favs', JSON.stringify(favorites));

    // Re-render current cards
    if (activeCountry) renderRaces(activeCountry);

    // Update drawer button if open
    const drawerFavBtn = document.getElementById('drawerFavBtn');
    if (drawerFavBtn) {
        const isFav = favorites.includes(favId);
        drawerFavBtn.classList.toggle('active', isFav);
        const svg = drawerFavBtn.querySelector('svg');
        if (svg) svg.setAttribute('fill', isFav ? 'currentColor' : 'none');
    }

    // Pop animation on card button
    document.querySelectorAll('.fav-btn').forEach(btn => {
        btn.classList.remove('fav-pop');
    });
    setTimeout(() => {
        document.querySelectorAll('.fav-btn.fav-active').forEach(btn => {
            btn.classList.add('fav-pop');
        });
    }, 10);
}

/* ============================================
   CALENDAR EXPORT
   ============================================ */
function addToCalendar(countryId, raceIdx) {
    if (!currentUser) {
        openAuthModal('signup');
        setTimeout(() => {
            const sub = document.querySelector('.auth-subtitle');
            if (sub) sub.textContent = T[lang].calLogin;
        }, 120);
        return;
    }

    const r = R[countryId][raceIdx];
    const c = countries.find(x => x.id === countryId);
    if (!r) return;

    const dt = new Date(r.d);
    const endDt = new Date(dt);
    endDt.setHours(endDt.getHours() + 6);

    const fmt = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const title = encodeURIComponent(r.n);
    const location = encodeURIComponent(r.l + ', ' + c.name);
    const details = encodeURIComponent(r.desc || r.n + ' - ' + r.c.join(', '));

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(dt)}/${fmt(endDt)}&location=${location}&details=${details}`;

    window.open(gcalUrl, '_blank');
}

/* ============================================
   BENEFITS BAR VISIBILITY
   ============================================ */
function updateAuthUI() {
    const headerRight = document.querySelector('.hdr-r');
    const existingAuth = document.getElementById('authHeaderBtn');
    if (existingAuth) existingAuth.remove();

    const existingMenu = document.getElementById('userMenu');
    if (existingMenu) existingMenu.remove();

    // Hide/show benefits bar
    const benefitsBar = document.getElementById('benefitsBar');
    if (benefitsBar) {
        benefitsBar.classList.toggle('hidden', !!currentUser);
    }

    if (currentUser) {
        // Logged in — show user avatar/initial
        const initial = (currentUser.email || 'U')[0].toUpperCase();
        const btn = document.createElement('div');
        btn.id = 'authHeaderBtn';
        btn.className = 'auth-avatar';
        btn.onclick = toggleUserMenu;
        btn.innerHTML = `<span>${initial}</span>`;
        headerRight.appendChild(btn);

        // User dropdown menu
        const menu = document.createElement('div');
        menu.id = 'userMenu';
        menu.className = 'user-menu';
        menu.innerHTML = `
            <div class="user-menu-email">${currentUser.email}</div>
            <div class="user-menu-divider"></div>
            <button class="user-menu-item" onclick="authSignOut()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                ${T[lang].authLogout}
            </button>
        `;
        headerRight.appendChild(menu);
    } else {
        // Not logged in — show sign in button
        const btn = document.createElement('button');
        btn.id = 'authHeaderBtn';
        btn.className = 'auth-btn-header';
        btn.onclick = () => openAuthModal('login');
        btn.textContent = T[lang].authLogin;
        headerRight.appendChild(btn);
    }
}

function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    if (menu) menu.classList.toggle('open');
}

function closeUserMenu() {
    const menu = document.getElementById('userMenu');
    if (menu) menu.classList.remove('open');
}

/* ============================================
   AUTH MODAL
   ============================================ */
function openAuthModal(view = 'login') {
    const overlay = document.getElementById('authOverlay');
    const modal = document.getElementById('authModal');
    overlay.classList.add('open');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    showAuthView(view);
}

function closeAuthModal() {
    const overlay = document.getElementById('authOverlay');
    const modal = document.getElementById('authModal');
    overlay.classList.remove('open');
    modal.classList.remove('open');
    if (!document.getElementById('drawer').classList.contains('open')) {
        document.body.style.overflow = '';
    }
    clearAuthError();
    showAuthLoading(false);
}

function showAuthView(view) {
    const t = T[lang];
    const body = document.getElementById('authBody');
    clearAuthError();

    if (view === 'login') {
        body.innerHTML = `
            <div class="auth-header">
                <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
                <h2 class="auth-title">${t.authLoginTitle}</h2>
                <p class="auth-subtitle">${t.authLoginSub}</p>
            </div>
            <div id="authError" class="auth-error"></div>
            <div class="auth-form">
                <div class="auth-field">
                    <label class="auth-label">Email</label>
                    <input type="email" class="auth-input" id="authEmail" placeholder="tu@email.com" autocomplete="email">
                </div>
                <div class="auth-field">
                    <label class="auth-label">${t.authPassword}</label>
                    <input type="password" class="auth-input" id="authPassword" placeholder="••••••••" autocomplete="current-password">
                </div>
                <button class="auth-submit" id="authSubmit" onclick="handleLogin()">
                    <span class="auth-submit-text">${t.authLogin}</span>
                    <span class="auth-submit-loader"></span>
                </button>
                <button class="auth-text-btn" onclick="showAuthView('reset')">${t.authForgot}</button>
            </div>
            <div class="auth-divider"><span>${t.authOr}</span></div>
            <button class="auth-google" onclick="authSignInWithGoogle()">
                <svg viewBox="0 0 24 24" width="18" height="18"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                ${t.authGoogle}
            </button>
            <div class="auth-switch">
                ${t.authNoAccount} <button class="auth-switch-btn" onclick="showAuthView('signup')">${t.authSignup}</button>
            </div>
        `;
        setTimeout(() => document.getElementById('authEmail')?.focus(), 100);

    } else if (view === 'signup') {
        body.innerHTML = `
            <div class="auth-header">
                <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
                <h2 class="auth-title">${t.authSignupTitle}</h2>
                <p class="auth-subtitle">${t.authSignupSub}</p>
            </div>
            <div id="authError" class="auth-error"></div>
            <div class="auth-form">
                <div class="auth-field">
                    <label class="auth-label">Email</label>
                    <input type="email" class="auth-input" id="authEmail" placeholder="tu@email.com" autocomplete="email">
                </div>
                <div class="auth-field">
                    <label class="auth-label">${t.authPassword}</label>
                    <input type="password" class="auth-input" id="authPassword" placeholder="${t.authPassHint}" autocomplete="new-password">
                </div>
                <button class="auth-submit" id="authSubmit" onclick="handleSignup()">
                    <span class="auth-submit-text">${t.authCreateAccount}</span>
                    <span class="auth-submit-loader"></span>
                </button>
            </div>
            <div class="auth-divider"><span>${t.authOr}</span></div>
            <button class="auth-google" onclick="authSignInWithGoogle()">
                <svg viewBox="0 0 24 24" width="18" height="18"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                ${t.authGoogle}
            </button>
            <div class="auth-switch">
                ${t.authHasAccount} <button class="auth-switch-btn" onclick="showAuthView('login')">${t.authLogin}</button>
            </div>
        `;
        setTimeout(() => document.getElementById('authEmail')?.focus(), 100);

    } else if (view === 'reset') {
        body.innerHTML = `
            <div class="auth-header">
                <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
                <h2 class="auth-title">${t.authResetTitle}</h2>
                <p class="auth-subtitle">${t.authResetSub}</p>
            </div>
            <div id="authError" class="auth-error"></div>
            <div class="auth-form">
                <div class="auth-field">
                    <label class="auth-label">Email</label>
                    <input type="email" class="auth-input" id="authEmail" placeholder="tu@email.com" autocomplete="email">
                </div>
                <button class="auth-submit" id="authSubmit" onclick="handleReset()">
                    <span class="auth-submit-text">${t.authSendReset}</span>
                    <span class="auth-submit-loader"></span>
                </button>
            </div>
            <div class="auth-switch">
                <button class="auth-switch-btn" onclick="showAuthView('login')">← ${t.authBackLogin}</button>
            </div>
        `;
        setTimeout(() => document.getElementById('authEmail')?.focus(), 100);

    } else if (view === 'confirm') {
        body.innerHTML = `
            <div class="auth-header">
                <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
                <div class="auth-success-icon">✓</div>
                <h2 class="auth-title">${t.authConfirmTitle}</h2>
                <p class="auth-subtitle">${t.authConfirmSub}</p>
            </div>
            <button class="auth-submit" onclick="showAuthView('login')" style="margin-top:1.5rem">
                <span class="auth-submit-text">${t.authLogin}</span>
            </button>
        `;

    } else if (view === 'reset-sent') {
        body.innerHTML = `
            <div class="auth-header">
                <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
                <div class="auth-success-icon">✉</div>
                <h2 class="auth-title">${t.authResetSentTitle}</h2>
                <p class="auth-subtitle">${t.authResetSentSub}</p>
            </div>
            <button class="auth-submit" onclick="closeAuthModal()" style="margin-top:1.5rem">
                <span class="auth-submit-text">${t.authClose}</span>
            </button>
        `;
    }
}

/* Form handlers */
function handleLogin() {
    const email = document.getElementById('authEmail')?.value?.trim();
    const password = document.getElementById('authPassword')?.value;
    const t = T[lang];

    if (!email) { showAuthError(t.authErrEmail); return; }
    if (!password) { showAuthError(t.authErrPass); return; }

    authSignIn(email, password);
}

function handleSignup() {
    const email = document.getElementById('authEmail')?.value?.trim();
    const password = document.getElementById('authPassword')?.value;
    const t = T[lang];

    if (!email) { showAuthError(t.authErrEmail); return; }
    if (!password || password.length < 6) { showAuthError(t.authErrPassLen); return; }

    authSignUp(email, password);
}

function handleReset() {
    const email = document.getElementById('authEmail')?.value?.trim();
    const t = T[lang];

    if (!email) { showAuthError(t.authErrEmail); return; }

    authResetPassword(email);
}

/* Enter key on inputs */
document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && document.getElementById('authModal')?.classList.contains('open')) {
        const submit = document.getElementById('authSubmit');
        if (submit) submit.click();
    }
});

/* Error & loading helpers */
function showAuthError(msg) {
    const el = document.getElementById('authError');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function clearAuthError() {
    const el = document.getElementById('authError');
    if (el) { el.textContent = ''; el.style.display = 'none'; }
}

function showAuthLoading(loading) {
    const btn = document.getElementById('authSubmit');
    if (btn) btn.classList.toggle('loading', loading);
}

/* Close on outside click */
document.addEventListener('click', e => {
    if (!e.target.closest('.auth-avatar') && !e.target.closest('.user-menu')) {
        closeUserMenu();
    }
});

/* Init on page load */
document.addEventListener('DOMContentLoaded', () => {
    try { initAuth(); } catch(e) { console.warn('Auth init error:', e); updateAuthUI(); }
});
