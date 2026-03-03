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
        console.warn('Supabase client not loaded — auth running in offline mode');
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
        }
    } catch (e) {
        console.warn('Auth session check failed:', e);
    }

    // Load data from DB
    await loadRacesFromDB();

    updateAuthUI();

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
        currentUser = session?.user || null;
        if (currentUser) {
            await loadProfile();
            await loadFavorites();
        } else {
            currentProfile = null;
            favorites = [];
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
        console.warn('Profile load failed:', e);
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
        // Wait briefly for the trigger to create the profile
        setTimeout(async () => {
            await supabase.from('profiles').update({
                role: 'organizer',
                org_name: orgData.org_name || null,
                org_website: orgData.org_website || null,
                org_country: orgData.org_country || null,
                org_social_ig: orgData.org_social_ig || null,
                org_social_fb: orgData.org_social_fb || null
            }).eq('id', data.user.id);
        }, 1000);
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
   AUTH UI
   ============================================ */
function updateAuthUI() {
    const headerRight = document.querySelector('.hdr-r');
    const existingAuth = document.getElementById('authHeaderBtn');
    const existingMenu = document.getElementById('userMenu');
    if (existingMenu) existingMenu.remove();

    const benefitsBar = document.getElementById('benefitsBar');
    const sectionDivider = document.querySelector('.section-divider');
    if (benefitsBar) {
        benefitsBar.classList.toggle('hidden', !!currentUser);
    }
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
            <div class="user-menu-email">${currentUser.email}</div>
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
   PLACEHOLDER FUNCTIONS (to be built next)
   ============================================ */
function openPublishRaceModal() {
    closeUserMenu();
    // TODO: Phase 2 — full publish race form
    alert('Publicar carrera — próximamente');
}

function openMyRaces() {
    closeUserMenu();
    // TODO: Phase 2 — organizer dashboard
    alert('Mis carreras — próximamente');
}

function openAdminPanel() {
    closeUserMenu();
    // TODO: Phase 3 — admin panel
    alert('Panel admin — próximamente');
}

function openSuggestRaceModal() {
    closeUserMenu();
    // TODO: Phase 2 — suggest race form
    alert('Sugerir carrera — próximamente');
}

/* Init on page load */
document.addEventListener('DOMContentLoaded', () => {
    // If Supabase CDN already loaded (cached), init immediately
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        try { initAuth(); } catch(e) { console.warn('Auth init error:', e); }
    }
    // Otherwise, just load fallback data so site works immediately
    // Supabase onload will call initAuth() when CDN finishes loading
    if (!dataReady && typeof loadFallbackData === 'function') {
        // R already has inline data from data.js, just build the UI
    }
    if (typeof buildDD === 'function') buildDD();
});
