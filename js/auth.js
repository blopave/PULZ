/**
 * PULZ — Authentication v4.0 (Supabase)
 * Handles: sign up with roles, sign in, sign out, session, profiles, UI
 */

/* ============================================
   SUPABASE CLIENT
   ============================================ */
const SUPABASE_URL = 'https://wpolabdhyqcajseegdlr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_f9AdrcGSGcT73Be7VAlI2A_j3zzLSkr';

let supabase;
let currentUser = null;
let currentProfile = null;

async function initAuth() {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
        /* Supabase not loaded — running offline */
        loadFallbackData();
        updateAuthUI();
        return;
    }

    // Check existing session
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            currentUser = session.user;
            await loadProfile();
            await loadFavorites();
            await loadAlerts();
        }
    } catch (e) {
        /* session check failed — continue without auth */
    }

    // Load data from DB
    await loadRacesFromDB();
    await loadFavCounts();

    updateAuthUI();

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
        currentUser = session?.user || null;
        if (currentUser) {
            await loadProfile();
            await loadFavorites();
            await loadAlerts();
        } else {
            currentProfile = null;
            favorites = [];
            alerts = [];
        }
        updateAuthUI();
        if (activeCountry) renderRaces(activeCountry);

        if (event === 'SIGNED_IN') {
            closeAuthModal();
        }
    });
}

/* ============================================
   PROFILE MANAGEMENT
   ============================================ */
async function loadProfile() {
    if (!supabase || !currentUser) return;
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        if (!error && data) {
            currentProfile = data;
        }
    } catch (e) {
        /* profile load failed — continue with defaults */
    }
}

async function updateProfile(updates) {
    if (!supabase || !currentUser) return { error: 'Not authenticated' };
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', currentUser.id)
        .select()
        .single();
    if (!error && data) {
        currentProfile = data;
        updateAuthUI();
    }
    return { data, error };
}

/* ============================================
   AUTH ACTIONS
   ============================================ */
async function authSignUp(email, password, role = 'runner', orgData = null) {
    const t = T[lang];
    if (!supabase) { showAuthError('Servicio no disponible. Intentá de nuevo.'); return; }
    showAuthLoading(true);
    clearAuthError();

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                role: role,
                display_name: email.split('@')[0]
            }
        }
    });

    showAuthLoading(false);

    if (error) {
        showAuthError(error.message);
        return;
    }

    // If organizer, update profile with org data after signup
    if (role === 'organizer' && orgData && data.user) {
        const orgUpdate = {
            role: 'organizer',
            org_name: orgData.org_name || null,
            org_website: orgData.org_website || null,
            org_country: orgData.org_country || null,
            org_social_ig: orgData.org_social_ig || null,
            org_social_fb: orgData.org_social_fb || null
        };
        const uid = data.user.id;
        // Retry with backoff to wait for the trigger to create the profile
        (async () => {
            for (let i = 0; i < 5; i++) {
                await new Promise(r => setTimeout(r, 1000 * (i + 1)));
                const { error } = await supabase.from('profiles').update(orgUpdate).eq('id', uid);
                if (!error) return;
            }
        })();
    }

    showAuthView('confirm');
}

async function authSignIn(email, password) {
    const t = T[lang];
    if (!supabase) { showAuthError('Servicio no disponible. Intentá de nuevo.'); return; }
    showAuthLoading(true);
    clearAuthError();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    showAuthLoading(false);

    if (error) {
        if (error.message.includes('Invalid login')) {
            showAuthError(t.authErrCreds);
        } else if (error.message.includes('Email not confirmed')) {
            showAuthError(t.authErrConfirm);
        } else {
            showAuthError(error.message);
        }
    }
}

async function authSignOut() {
    if (supabase) await supabase.auth.signOut();
    currentUser = null;
    currentProfile = null;
    favorites = [];
    updateAuthUI();
    closeUserMenu();
    if (activeCountry) renderRaces(activeCountry);
}

async function authResetPassword(email) {
    if (!supabase) { showAuthError('Servicio no disponible. Intentá de nuevo.'); return; }
    showAuthLoading(true);
    clearAuthError();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
    });

    showAuthLoading(false);
    if (error) { showAuthError(error.message); return; }
    showAuthView('reset-sent');
}

async function authSignInWithGoogle() {
    if (!supabase) { showAuthError('Servicio no disponible. Intentá de nuevo.'); return; }
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
    });
    if (error) showAuthError(error.message);
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

    const dateStr = r.d.replace(/-/g, '');
    const nextDay = new Date(r.d + 'T12:00:00');
    nextDay.setDate(nextDay.getDate() + 1);
    const endStr = nextDay.toISOString().slice(0, 10).replace(/-/g, '');

    const title = encodeURIComponent(r.n);
    const location = encodeURIComponent(r.l + ', ' + c.name);
    const details = encodeURIComponent(r.desc || r.n + ' - ' + r.c.join(', '));

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}/${endStr}&location=${location}&details=${details}`;
    window.open(gcalUrl, '_blank');
}

/* ============================================
   AUTH UI
   ============================================ */
function updateAuthUI() {
    const headerRight = document.querySelector('.hdr-r');
    const existingAuth = document.getElementById('authHeaderBtn');
    const existingMenu = document.getElementById('userMenu');
    if (existingMenu) existingMenu.remove();

    const benefitsCta = document.querySelector('.benefits-cta-wrap');
    if (benefitsCta) {
        benefitsCta.style.display = currentUser ? 'none' : '';
    }
    const sectionDivider = document.querySelector('.section-divider');
    if (sectionDivider) {
        sectionDivider.style.display = currentUser ? 'none' : '';
    }

    if (currentUser) {
        // Logged in — remove login/signup buttons, show avatar
        if (existingAuth) existingAuth.remove();

        const displayName = currentProfile?.display_name || currentUser.email.split('@')[0];
        const initial = displayName[0].toUpperCase();
        const role = currentProfile?.role || 'runner';
        const isOrg = role === 'organizer';
        const isAdmin = role === 'admin';

        const btn = document.createElement('div');
        btn.id = 'authHeaderBtn';
        btn.className = 'auth-avatar';
        if (isOrg) btn.classList.add('auth-avatar-org');
        if (isAdmin) btn.classList.add('auth-avatar-admin');
        btn.onclick = toggleUserMenu;
        btn.innerHTML = `<span>${initial}</span>`;
        headerRight.appendChild(btn);

        const t = T[lang];
        let menuItems = '';
        const roleName = isAdmin ? 'Admin' : isOrg ? (t.authRoleOrg || 'Organizador') : 'Runner';
        const roleClass = isAdmin ? 'role-admin' : isOrg ? 'role-org' : 'role-runner';
        menuItems += `<div class="user-menu-role ${roleClass}">${roleName}</div>`;

        if (isOrg || isAdmin) {
            menuItems += `
                <button class="user-menu-item" onclick="openPublishRaceModal()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    ${t.authPublish || 'Publicar carrera'}
                </button>
                <button class="user-menu-item" onclick="openMyRaces()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    ${t.authMyRaces || 'Mis carreras'}
                </button>`;
        }

        if (isAdmin) {
            menuItems += `
                <button class="user-menu-item" onclick="openAdminPanel()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                    Panel admin
                </button>`;
        }

        if (role === 'runner') {
            menuItems += `
                <button class="user-menu-item" onclick="openSuggestRaceModal()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    ${t.authSuggest || 'Sugerir carrera'}
                </button>`;
        }

        menuItems += `
            <div class="user-menu-divider"></div>
            <button class="user-menu-item" onclick="authSignOut()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                ${t.authLogout}
            </button>
        `;

        const menu = document.createElement('div');
        menu.id = 'userMenu';
        menu.className = 'user-menu';
        menu.innerHTML = `
            <div class="user-menu-email">${typeof esc==='function'?esc(currentUser.email):currentUser.email}</div>
            ${menuItems}
        `;
        headerRight.appendChild(menu);
    } else {
        // Not logged in — ensure login/signup buttons exist
        if (!existingAuth || !existingAuth.classList.contains('auth-btn-wrap')) {
            if (existingAuth) existingAuth.remove();
            const wrap = document.createElement('div');
            wrap.id = 'authHeaderBtn';
            wrap.className = 'auth-btn-wrap';

            const loginBtn = document.createElement('button');
            loginBtn.className = 'auth-btn-ghost';
            loginBtn.onclick = () => openAuthModal('login');
            loginBtn.textContent = T[lang].authLogin;

            const signupBtn = document.createElement('button');
            signupBtn.className = 'auth-btn-header';
            signupBtn.onclick = () => openAuthModal('signup');
            signupBtn.textContent = T[lang].authCreateAccount || T[lang].authSignup;

            wrap.appendChild(loginBtn);
            wrap.appendChild(signupBtn);
            headerRight.appendChild(wrap);
        }
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
    const drawer = document.getElementById('drawer');
    if (!drawer || !drawer.classList.contains('open')) {
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
                <div class="auth-field">
                    <label class="auth-label">${t.authRoleLabel || '¿Qué tipo de cuenta?'}</label>
                    <div class="auth-role-select">
                        <button class="auth-role-btn active" data-role="runner" onclick="selectAuthRole(this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>
                            <span class="auth-role-name">Runner</span>
                            <span class="auth-role-desc">${t.authRoleRunnerDesc || 'Guardá carreras y armá tu calendario'}</span>
                        </button>
                        <button class="auth-role-btn" data-role="organizer" onclick="selectAuthRole(this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg>
                            <span class="auth-role-name">${t.authRoleOrg || 'Organizador'}</span>
                            <span class="auth-role-desc">${t.authRoleOrgDesc || 'Publicá tus carreras y llegá a más corredores'}</span>
                        </button>
                    </div>
                </div>
                <div id="orgFields" class="auth-org-fields" style="display:none">
                    <div class="auth-field">
                        <label class="auth-label">${t.authOrgName || 'Nombre de la organización'} *</label>
                        <input type="text" class="auth-input" id="authOrgName" placeholder="${t.authOrgNamePh || 'Ej: Sportsfacilities, Running Club Córdoba'}">
                    </div>
                    <div class="auth-field">
                        <label class="auth-label">${t.authOrgWeb || 'Sitio web'}</label>
                        <input type="url" class="auth-input" id="authOrgWeb" placeholder="https://...">
                    </div>
                    <div class="auth-field">
                        <label class="auth-label">${t.authOrgCountry || 'País principal'}</label>
                        <select class="auth-input auth-select" id="authOrgCountry">
                            <option value="">${t.selC || 'Elegí un país'}</option>
                            ${countries.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="auth-field-row">
                        <div class="auth-field">
                            <label class="auth-label">Instagram</label>
                            <input type="text" class="auth-input" id="authOrgIG" placeholder="@cuenta">
                        </div>
                        <div class="auth-field">
                            <label class="auth-label">Facebook</label>
                            <input type="text" class="auth-input" id="authOrgFB" placeholder="@pagina">
                        </div>
                    </div>
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

/* ============================================
   ROLE SELECTOR
   ============================================ */
function selectAuthRole(btn) {
    document.querySelectorAll('.auth-role-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const role = btn.dataset.role;
    const orgFields = document.getElementById('orgFields');
    if (orgFields) {
        orgFields.style.display = role === 'organizer' ? 'block' : 'none';
    }
}

/* ============================================
   FORM HANDLERS
   ============================================ */
function handleLogin() {
    const email = document.getElementById('authEmail')?.value?.trim();
    const password = document.getElementById('authPassword')?.value;
    const t = T[lang];

    if (!email) { showAuthError(t.authErrEmail); return; }
    if (!password) { showAuthError(t.authErrPass); return; }

    authSignIn(email, password);
    if(typeof track==='function')track('login',{method:'email'});
}

function handleSignup() {
    const email = document.getElementById('authEmail')?.value?.trim();
    const password = document.getElementById('authPassword')?.value;
    const t = T[lang];

    if (!email) { showAuthError(t.authErrEmail); return; }
    if (!password || password.length < 6) { showAuthError(t.authErrPassLen); return; }

    const activeRole = document.querySelector('.auth-role-btn.active');
    const role = activeRole?.dataset.role || 'runner';

    let orgData = null;
    if (role === 'organizer') {
        const orgName = document.getElementById('authOrgName')?.value?.trim();
        if (!orgName) {
            showAuthError(t.authErrOrgName || 'Ingresá el nombre de la organización');
            return;
        }
        orgData = {
            org_name: orgName,
            org_website: document.getElementById('authOrgWeb')?.value?.trim() || null,
            org_country: document.getElementById('authOrgCountry')?.value || null,
            org_social_ig: document.getElementById('authOrgIG')?.value?.trim() || null,
            org_social_fb: document.getElementById('authOrgFB')?.value?.trim() || null
        };
    }

    authSignUp(email, password, role, orgData);
    if(typeof track==='function')track('sign_up',{method:'email',role:role});
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

/* Close menus on outside click */
document.addEventListener('click', e => {
    if (!e.target.closest('.auth-avatar') && !e.target.closest('.user-menu')) {
        closeUserMenu();
    }
});

/* ============================================
   TOAST NOTIFICATIONS
   ============================================ */
function showToast(message, type = 'info') {
    const existing = document.getElementById('pulzToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'pulzToast';
    toast.className = `pulz-toast pulz-toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('visible'));

    setTimeout(() => {
        toast.classList.remove('visible');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

/* ============================================
   RACE MODAL — Publish / Edit / My Races
   ============================================ */
function openRaceModal() {
    document.getElementById('raceOverlay').classList.add('open');
    document.getElementById('raceModal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeRaceModal() {
    document.getElementById('raceOverlay').classList.remove('open');
    document.getElementById('raceModal').classList.remove('open');
    const drawer = document.getElementById('drawer');
    if (!drawer || !drawer.classList.contains('open')) {
        document.body.style.overflow = '';
    }
}

let editingRaceId = null;

function openPublishRaceModal(prefill = null) {
    closeUserMenu();
    editingRaceId = prefill?._id || null;
    const t = T[lang];
    const isEdit = !!editingRaceId;

    const distOptions = ['5K','10K','15K','21K','25K','30K','42K','50K','80K','100K','Trail','Ultra'];
    const selectedDists = prefill?.c || [];
    const chips = distOptions.map(d => {
        const active = selectedDists.some(s => s.toLowerCase() === d.toLowerCase()) ? ' active' : '';
        return `<button type="button" class="race-form-chip${active}" onclick="this.classList.toggle('active')">${d}</button>`;
    }).join('');

    document.getElementById('raceModalBody').innerHTML = `
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${isEdit ? (t.raceEditTitle || 'Editar carrera') : (t.racePublishTitle || 'Publicar carrera')}</h2>
            <p class="auth-subtitle">${t.racePublishSub || 'Completá los datos de tu carrera y publicala en PULZ.'}</p>
        </div>
        <div id="raceError" class="auth-error"></div>
        <div class="race-form">
            <div class="auth-field">
                <label class="auth-label">${t.raceName || 'Nombre de la carrera'} *</label>
                <input type="text" class="auth-input" id="raceName" placeholder="${t.raceNamePh || 'Ej: Maratón de Buenos Aires'}" value="${prefill ? (typeof esc==='function'?esc(prefill.n):prefill.n) : ''}">
            </div>
            <div class="race-form-row">
                <div class="auth-field">
                    <label class="auth-label">${t.raceDate || 'Fecha'} *</label>
                    <input type="date" class="auth-input" id="raceDate" value="${prefill?.d || ''}">
                </div>
                <div class="auth-field">
                    <label class="auth-label">${t.raceType || 'Tipo'} *</label>
                    <select class="auth-input auth-select" id="raceType">
                        <option value="road" ${prefill?.t === 'asfalto' || !prefill ? 'selected' : ''}>${t.road || 'Asfalto'}</option>
                        <option value="trail" ${prefill?.t === 'trail' ? 'selected' : ''}>Trail</option>
                    </select>
                </div>
            </div>
            <div class="race-form-row">
                <div class="auth-field">
                    <label class="auth-label">${t.raceCountry || 'País'} *</label>
                    <select class="auth-input auth-select" id="raceCountry">
                        ${countries.map(c => `<option value="${c.id}" ${prefill && prefill._country === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                    </select>
                </div>
                <div class="auth-field">
                    <label class="auth-label">${t.raceLocation || 'Ciudad / Ubicación'} *</label>
                    <input type="text" class="auth-input" id="raceLocation" placeholder="${t.raceLocationPh || 'Ej: Bariloche, Río Negro'}" value="${prefill ? (typeof esc==='function'?esc(prefill.l):prefill.l) : ''}">
                </div>
            </div>
            <div class="auth-field">
                <label class="auth-label">${t.raceDist || 'Distancias'} *</label>
                <div class="race-form-chips" id="raceChips">${chips}</div>
                <input type="text" class="auth-input" id="raceCustomDist" placeholder="${t.raceCustomDist || 'Otra distancia (ej: 8K, 60K)'}" style="margin-top:0.4rem">
            </div>
            <div class="auth-field">
                <label class="auth-label">${t.raceWebsite || 'Sitio web'}</label>
                <input type="url" class="auth-input" id="raceWebsite" placeholder="https://..." value="${prefill?.w || ''}">
            </div>
            <div class="auth-field">
                <label class="auth-label">${t.raceDesc || 'Descripción'}</label>
                <textarea class="auth-input" id="raceDesc" placeholder="${t.raceDescPh || 'Contá de qué se trata la carrera...'}" rows="3">${prefill?.desc || ''}</textarea>
            </div>
            <div class="auth-field">
                <label class="auth-label">${t.racePrice || 'Precio / Inscripción'}</label>
                <input type="text" class="auth-input" id="racePrice" placeholder="${t.racePricePh || 'Ej: ARS 15.000 / USD 50'}" value="${prefill?.price || ''}">
            </div>
            <button class="auth-submit" id="raceSubmit" onclick="handlePublishRace()">
                <span class="auth-submit-text">${isEdit ? (t.raceSave || 'Guardar cambios') : (t.racePublish || 'Publicar carrera')}</span>
                <span class="auth-submit-loader"></span>
            </button>
        </div>
    `;
    openRaceModal();
}

async function handlePublishRace() {
    const t = T[lang];
    const name = document.getElementById('raceName')?.value?.trim();
    const date = document.getElementById('raceDate')?.value;
    const type = document.getElementById('raceType')?.value;
    const countryId = document.getElementById('raceCountry')?.value;
    const location = document.getElementById('raceLocation')?.value?.trim();
    const website = document.getElementById('raceWebsite')?.value?.trim() || '';
    const desc = document.getElementById('raceDesc')?.value?.trim() || '';
    const price = document.getElementById('racePrice')?.value?.trim() || '';
    const customDist = document.getElementById('raceCustomDist')?.value?.trim();

    // Gather selected distance chips
    const chips = document.querySelectorAll('#raceChips .race-form-chip.active');
    const categories = Array.from(chips).map(c => c.textContent);
    if (customDist) {
        customDist.split(',').forEach(d => {
            const trimmed = d.trim();
            if (trimmed) categories.push(trimmed);
        });
    }

    // Validation
    const errEl = document.getElementById('raceError');
    if (!name) { showRaceError(t.raceErrName || 'Ingresá el nombre de la carrera'); return; }
    if (!date) { showRaceError(t.raceErrDate || 'Elegí una fecha'); return; }
    if (!location) { showRaceError(t.raceErrLocation || 'Ingresá la ubicación'); return; }
    if (!categories.length) { showRaceError(t.raceErrDist || 'Seleccioná al menos una distancia'); return; }

    const btn = document.getElementById('raceSubmit');
    if (btn) btn.classList.add('loading');

    const raceData = {
        name, date, type, country_id: countryId, location, categories,
        website: website || null,
        description: desc || null,
        price: price || null
    };

    let result;
    if (editingRaceId) {
        result = await updateRace(editingRaceId, {
            name: raceData.name, date: raceData.date, type: raceData.type,
            country_id: raceData.country_id, location: raceData.location,
            categories: raceData.categories, website: raceData.website,
            description: raceData.description, price: raceData.price
        });
    } else {
        result = await createRace(raceData);
    }

    if (btn) btn.classList.remove('loading');

    if (result.error) {
        showRaceError(result.error.message || result.error);
        return;
    }

    closeRaceModal();
    showToast(editingRaceId ? (t.raceUpdated || 'Carrera actualizada') : (t.racePublished || 'Carrera publicada en PULZ'), 'success');
    editingRaceId = null;
    if (typeof updateOrgStats === 'function') updateOrgStats();
}

function showRaceError(msg) {
    const el = document.getElementById('raceError');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
}

/* ============================================
   MY RACES — Organizer's race list
   ============================================ */
function openMyRaces() {
    closeUserMenu();
    const t = T[lang];
    const locale = lang === 'pt' ? 'pt-BR' : lang === 'en' ? 'en-US' : 'es-ES';

    // Find races created by current user
    const myRaces = [];
    if (currentUser) {
        for (const cid of Object.keys(R)) {
            R[cid].forEach(r => {
                if (r.created_by === currentUser.id || r.organizer_id === currentUser.id) {
                    myRaces.push({ ...r, _country: cid });
                }
            });
        }
    }
    myRaces.sort((a, b) => new Date(a.d + 'T00:00:00') - new Date(b.d + 'T00:00:00'));

    let listHTML = '';
    if (myRaces.length) {
        listHTML = '<div class="my-races-list">';
        myRaces.forEach(r => {
            const dt = new Date(r.d + 'T00:00:00');
            const dateStr = dt.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
            const country = countries.find(c => c.id === r._country);
            listHTML += `
                <div class="my-race-item">
                    <div class="my-race-info">
                        <div class="my-race-name">${typeof esc === 'function' ? esc(r.n) : r.n}</div>
                        <div class="my-race-meta">${dateStr} · ${typeof esc === 'function' ? esc(r.l) : r.l} · ${country ? country.name : ''}</div>
                    </div>
                    <div class="my-race-actions">
                        <button class="my-race-btn" onclick="editMyRace('${r._id}','${r._country}')" title="${t.raceEdit || 'Editar'}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </button>
                        <button class="my-race-btn delete" onclick="deleteMyRace('${r._id}')" title="${t.raceDelete || 'Eliminar'}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        </button>
                    </div>
                </div>`;
        });
        listHTML += '</div>';
    } else {
        listHTML = `<div class="my-races-empty">${t.myRacesEmpty || 'Todavía no publicaste ninguna carrera.'}</div>`;
    }

    document.getElementById('raceModalBody').innerHTML = `
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${t.authMyRaces || 'Mis carreras'}</h2>
            <p class="auth-subtitle">${myRaces.length} ${myRaces.length === 1 ? (t.raceOne || 'carrera publicada') : (t.racePlural || 'carreras publicadas')}</p>
        </div>
        ${listHTML}
        <button class="auth-submit" onclick="openPublishRaceModal()" style="margin-top:1rem">
            <span class="auth-submit-text">+ ${t.authPublish || 'Publicar carrera'}</span>
        </button>
    `;
    openRaceModal();
}

function editMyRace(raceId, countryId) {
    const race = (R[countryId] || []).find(r => r._id === raceId);
    if (!race) return;
    openPublishRaceModal({ ...race, _country: countryId });
}

async function deleteMyRace(raceId) {
    const t = T[lang];
    if (!confirm(t.raceDeleteConfirm || '¿Estás seguro de que querés eliminar esta carrera?')) return;
    const result = await deleteRace(raceId);
    if (result.error) {
        showToast(result.error.message || 'Error', 'error');
        return;
    }
    showToast(t.raceDeleted || 'Carrera eliminada', 'info');
    if (typeof updateOrgStats === 'function') updateOrgStats();
    openMyRaces(); // refresh list
}

/* ============================================
   PLACEHOLDER FUNCTIONS (post-launch)
   ============================================ */
function openAdminPanel() {
    closeUserMenu();
    showToast(T[lang].toastComingSoon, 'info');
}

function openSuggestRaceModal() {
    closeUserMenu();
    showToast(T[lang].toastComingSoon, 'info');
}

/* Init on page load */
document.addEventListener('DOMContentLoaded', () => {
    // If Supabase CDN already loaded (cached), init immediately
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        try { initAuth(); } catch(e) { /* auth init failed */ }
    }
    // Otherwise, just load fallback data so site works immediately
    // Supabase onload will call initAuth() when CDN finishes loading
    if (!dataReady && typeof loadFallbackData === 'function') {
        // R already has inline data from data.js, just build the UI
    }
    if (typeof buildDD === 'function') buildDD();
    // Apply saved language on load
    if (lang !== 'es') setLang(lang);
});
