/**
 * PULZ — Authentication v4.0 (Supabase)
 * Handles: sign up with roles, sign in, sign out, session, profiles, UI
 */

/* ============================================
   SUPABASE CLIENT
   ============================================ */
const SUPABASE_URL = 'https://wpolabdhyqcajseegdlr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_f9AdrcGSGcT73Be7VAlI2A_j3zzLSkr';

let sbClient;
let currentUser = null;
let currentProfile = null;
let authInitialized = false;

/* Focus stack for modal accessibility — restores focus to trigger on close */
const _modalFocusStack = [];
function pushModalTrigger() {
    const el = document.activeElement;
    _modalFocusStack.push(el && el !== document.body ? el : null);
}
function popModalTrigger() {
    const el = _modalFocusStack.pop();
    if (el && el.isConnected && typeof el.focus === 'function') {
        try { el.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    }
}

async function initAuth() {
    if (authInitialized) return;
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
        /* Supabase not loaded — running offline */
        loadFallbackData();
        updateAuthUI();
        return;
    }

    // Check existing session
    try {
        const { data: { session } } = await sbClient.auth.getSession();
        if (session) {
            currentUser = session.user;
            await loadProfile();
            await Promise.allSettled([loadFavorites(), loadAlerts(), loadTeamRaces(), typeof loadTeamFollows==='function'?loadTeamFollows():Promise.resolve(), typeof loadCompletions==='function'?loadCompletions():Promise.resolve()]);
        }
    } catch (e) {
        /* session check failed — continue without auth */
    }

    // Load data from DB
    await loadRacesFromDB();
    await loadFavCounts();

    updateAuthUI();
    if(currentUser&&typeof showOnboarding==='function')setTimeout(showOnboarding,600);

    authInitialized = true;

    // Listen for auth changes
    sbClient.auth.onAuthStateChange(async (event, session) => {
        currentUser = session?.user || null;
        if (currentUser) {
            await loadProfile();
            await Promise.allSettled([loadFavorites(), loadAlerts(), loadTeamRaces(), typeof loadTeamFollows==='function'?loadTeamFollows():Promise.resolve(), typeof loadCompletions==='function'?loadCompletions():Promise.resolve()]);
        } else {
            currentProfile = null;
            if(typeof favorites!=='undefined')favorites=[];
            if(typeof alerts!=='undefined')alerts=[];
            if(typeof teamRaces!=='undefined')teamRaces=[];
            if(typeof teamFollows!=='undefined')teamFollows=[];
            if(typeof completions!=='undefined')completions={};
        }
        updateAuthUI();
        if (activeCountry) renderRaces(activeCountry);

        if (event === 'SIGNED_IN') {
            closeAuthModal();
            if(typeof showOnboarding==='function')setTimeout(showOnboarding,400);
        }
    });
}

/* ============================================
   PROFILE MANAGEMENT
   ============================================ */
function syncSentryUser() {
    const role = (currentProfile && currentProfile.role) || 'unknown';
    const country = (currentProfile && (currentProfile.org_country || currentProfile.team_country)) || null;
    if (window.Sentry && typeof window.Sentry.setUser === 'function') {
        if (currentUser) {
            window.Sentry.setUser({ id: currentUser.id, email: currentUser.email, role });
        } else {
            window.Sentry.setUser(null);
        }
    }
    if (typeof gtag === 'function') {
        if (currentUser) {
            gtag('set', 'user_properties', { role, country });
        } else {
            gtag('set', 'user_properties', { role: 'guest', country: null });
        }
    }
}

async function loadProfile() {
    if (!sbClient || !currentUser) return;
    try {
        const { data, error } = await sbClient
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
    syncSentryUser();
}

async function updateProfile(updates) {
    if (!sbClient || !currentUser) return { error: 'Not authenticated' };
    const { data, error } = await sbClient
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
/* Retry a profile update with backoff while waiting for the Supabase trigger
   that creates the profile row. Aborts cleanly if the user signs out or
   switches accounts mid-retry to avoid writing to the wrong profile. */
async function retryProfileUpdate(uid, updates, errorMsg, attempts = 5) {
    if (!sbClient || !uid) return;
    for (let i = 0; i < attempts; i++) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        // Bail if user signed out or switched account during the wait
        if (!currentUser || currentUser.id !== uid) return;
        try {
            const { error } = await sbClient.from('profiles').update(updates).eq('id', uid);
            if (!error) return;
        } catch (e) { /* network error — retry */ }
    }
    if (currentUser && currentUser.id === uid && typeof showToast === 'function') {
        showToast(errorMsg, 'error');
    }
}

async function authSignUp(email, password, role = 'runner', orgData = null, teamData = null) {
    if (!sbClient) { showAuthError(T[lang].authErrService||'Service unavailable'); return; }
    showAuthLoading(true);
    clearAuthError();

    const safeRole = ['organizer','team'].includes(role) ? role : 'runner';
    const { data, error } = await sbClient.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: window.location.origin,
            data: {
                role: safeRole,
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
    if (safeRole === 'organizer' && orgData && data.user) {
        const orgUpdate = {
            role: 'organizer',
            org_name: orgData.org_name || null,
            org_website: orgData.org_website || null,
            org_country: orgData.org_country || null,
            org_social_ig: orgData.org_social_ig || null,
            org_social_fb: orgData.org_social_fb || null
        };
        const uid = data.user.id;
        retryProfileUpdate(uid, orgUpdate, T[lang].orgProfileError || 'No pudimos guardar los datos de tu organización. Completalos desde tu perfil.');
    }

    // If team, update profile with team data after signup
    if (safeRole === 'team' && teamData && data.user) {
        const teamUpdate = {
            role: 'team',
            team_name: teamData.team_name || null,
            team_city: teamData.team_city || null,
            team_modality: teamData.team_modality || null,
            team_instagram: teamData.team_instagram || null,
            team_contact: teamData.team_contact || null,
            team_country: teamData.team_country || null
        };
        const uid = data.user.id;
        retryProfileUpdate(uid, teamUpdate, T[lang].teamProfileEmpty || 'No pudimos guardar los datos de tu equipo. Completalos desde tu perfil.');
    }

    if(typeof track==='function')track('sign_up',{method:'email',role:safeRole});
    showAuthView('confirm');
}

async function authSignIn(email, password) {
    const t = T[lang];
    if (!sbClient) { showAuthError(T[lang].authErrService||'Service unavailable'); return; }
    showAuthLoading(true);
    clearAuthError();

    try {
        const { data, error } = await sbClient.auth.signInWithPassword({ email, password });

        if (error) {
            if (error.message.includes('Invalid login')) {
                showAuthError(t.authErrCreds);
            } else if (error.message.includes('Email not confirmed')) {
                showAuthError(t.authErrConfirm);
            } else {
                showAuthError(error.message);
            }
        } else {
            if(typeof track==='function')track('login',{method:'email'});
        }
    } catch (e) {
        showAuthError(t.authErrService||'Service unavailable');
    } finally {
        showAuthLoading(false);
    }
}

async function authSignOut() {
    if (sbClient) await sbClient.auth.signOut();
    currentUser = null;
    currentProfile = null;
    if(typeof favorites!=='undefined')favorites=[];
    if(typeof alerts!=='undefined')alerts=[];
    if(typeof teamRaces!=='undefined')teamRaces=[];
    if(typeof teamFollows!=='undefined')teamFollows=[];
    if(typeof completions!=='undefined')completions={};
    syncSentryUser();
    updateAuthUI();
    closeUserMenu();
    if (activeCountry) renderRaces(activeCountry);
}

async function authResetPassword(email) {
    if (!sbClient) { showAuthError(T[lang].authErrService||'Service unavailable'); return; }
    showAuthLoading(true);
    clearAuthError();

    try {
        const { error } = await sbClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin
        });

        if (error) { showAuthError(error.message); return; }
        showAuthView('reset-sent');
    } catch (e) {
        showAuthError(T[lang].authErrService||'Service unavailable');
    } finally {
        showAuthLoading(false);
    }
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

    if (!R[countryId]) return;
    const r = R[countryId][raceIdx];
    const c = countries.find(x => x.id === countryId);
    if (!r || !c) return;

    const dateStr = r.d.replace(/-/g, '');
    const nextDay = new Date(r.d + 'T12:00:00');
    nextDay.setDate(nextDay.getDate() + 1);
    const endStr = nextDay.toISOString().slice(0, 10).replace(/-/g, '');

    const title = encodeURIComponent(r.n);
    const location = encodeURIComponent(r.l + ', ' + c.name);
    const details = encodeURIComponent(r.desc || r.n + ' - ' + (r.c||[]).join(', '));

    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}/${endStr}&location=${location}&details=${details}`;
    window.open(gcalUrl, '_blank');
}

/* ============================================
   AUTH UI
   ============================================ */
function updateAuthUI() {
    const headerRight = document.querySelector('.hdr-r');
    if (!headerRight) return;
    const existingAuth = document.getElementById('authHeaderBtn');
    const existingMenu = document.getElementById('userMenu');
    if (existingMenu) existingMenu.remove();

    const benefitsCta = document.querySelector('.benefits-cta-wrap');
    if (benefitsCta) {
        benefitsCta.style.display = currentUser ? 'none' : '';
    }
    const heroPills = document.getElementById('heroPills');
    if (heroPills) {
        heroPills.style.display = currentUser ? 'none' : '';
    }
    // Hide marketing sections for logged-in users
    ['benefitsBar','benefitsTeam','benefitsOrg','ecosystem'].forEach(id=>{
        const el=document.getElementById(id);
        if(el)el.style.display=currentUser?'none':'';
    });
    if (currentUser) {
        // Logged in — remove login/signup buttons, show avatar
        if (existingAuth) existingAuth.remove();

        const displayName = currentProfile?.display_name || currentUser.email?.split('@')[0] || 'User';
        const initial = (displayName[0] || 'U').toUpperCase();
        const role = currentProfile?.role || 'runner';
        const isOrg = role === 'organizer';
        const isTeam = role === 'team';

        const btn = document.createElement('div');
        btn.id = 'authHeaderBtn';
        btn.className = 'auth-avatar';
        if (isOrg) btn.classList.add('auth-avatar-org');
        if (isTeam) btn.classList.add('auth-avatar-team');
        btn.onclick = toggleUserMenu;
        btn.innerHTML = `<span>${esc(initial)}</span>`;
        headerRight.appendChild(btn);

        const t = T[lang];
        let menuItems = '';
        const roleName = isOrg ? (t.authRoleOrg || 'Organizador') : isTeam ? (t.authRoleTeam || 'Running Team') : 'Runner';
        const roleClass = isOrg ? 'role-org' : isTeam ? 'role-team' : 'role-runner';
        menuItems += `<div class="user-menu-role ${roleClass}">${roleName}</div>`;

        if (isOrg) {
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

        if (isTeam) {
            menuItems += `
                <button class="user-menu-item" onclick="openMyTeam()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                    ${t.authMyTeam || 'Mi equipo'}
                </button>
                <button class="user-menu-item" onclick="openTeamRaces()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    ${t.authTeamRaces || 'Nuestras carreras'}
                </button>
                <button class="user-menu-item" onclick="openTeamMembers()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>
                    ${t.teamMembersTitle || 'Miembros'}
                </button>`;
        }

        if (role === 'runner') {
            menuItems += `
                <button class="user-menu-item" onclick="openPulzIdSetup()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><line x1="12" y1="11" x2="12" y2="17" stroke-dasharray="2 2"/></svg>
                    ${t.pidTitle || 'Mi PULZ ID'}
                </button>
                <button class="user-menu-item" onclick="openMySeason()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    ${t.authMySeason || 'Mi temporada'}
                </button>
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
            <div class="user-menu-email">${esc(currentUser.email)}</div>
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
function openAuthModal(view = 'login', role = null) {
    const overlay = document.getElementById('authOverlay');
    const modal = document.getElementById('authModal');
    if (!overlay || !modal) return;
    if (!modal.classList.contains('open')) pushModalTrigger();
    overlay.classList.add('open');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    showAuthView(view);
    if (role && view === 'signup') {
        setTimeout(() => {
            const btn = document.querySelector(`.auth-role-btn[data-role="${role}"]`);
            if (btn) selectAuthRole(btn);
        }, 60);
    }
}

function closeAuthModal() {
    const overlay = document.getElementById('authOverlay');
    const modal = document.getElementById('authModal');
    const wasOpen = modal && modal.classList.contains('open');
    if (overlay) overlay.classList.remove('open');
    if (!modal) return;
    modal.classList.remove('open');
    modal.classList.remove('auth-wide');
    const drawer = document.getElementById('drawer');
    if (!drawer || !drawer.classList.contains('open')) {
        document.body.style.overflow = '';
    }
    clearAuthError();
    showAuthLoading(false);
    if (wasOpen) popModalTrigger();
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
                    <label class="auth-label" for="authEmail">Email</label>
                    <input type="email" class="auth-input" id="authEmail" placeholder="tu@email.com" autocomplete="email" required aria-required="true">
                </div>
                <div class="auth-field">
                    <label class="auth-label" for="authPassword">${t.authPassword}</label>
                    <div class="auth-pass-wrap">
                        <input type="password" class="auth-input" id="authPassword" placeholder="••••••••" autocomplete="current-password" required aria-required="true">
                        <button type="button" class="auth-pass-toggle" aria-label="${t.authPassShow||'Mostrar contraseña'}" onclick="togglePasswordVisibility('authPassword',this)">
                            <svg class="eye-on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            <svg class="eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="display:none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        </button>
                    </div>
                </div>
                <button class="auth-submit" id="authSubmit" onclick="handleLogin()">
                    <span class="auth-submit-text">${t.authLogin}</span>
                    <span class="auth-submit-loader"></span>
                </button>
                <button class="auth-text-btn" onclick="showAuthView('reset')">${t.authForgot}</button>
            </div>
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
                    <label class="auth-label" for="authEmail">Email</label>
                    <input type="email" class="auth-input" id="authEmail" placeholder="tu@email.com" autocomplete="email" required aria-required="true">
                </div>
                <div class="auth-field">
                    <label class="auth-label" for="authPassword">${t.authPassword}</label>
                    <div class="auth-pass-wrap">
                        <input type="password" class="auth-input" id="authPassword" placeholder="${t.authPassHint}" autocomplete="new-password" required aria-required="true" oninput="updatePasswordStrength(this.value)">
                        <button type="button" class="auth-pass-toggle" aria-label="${t.authPassShow||'Mostrar contraseña'}" onclick="togglePasswordVisibility('authPassword',this)">
                            <svg class="eye-on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            <svg class="eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="display:none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        </button>
                    </div>
                    <div class="password-strength" id="passwordStrength">
                        <div class="password-strength-bars">
                            <div class="password-strength-bar"></div>
                            <div class="password-strength-bar"></div>
                            <div class="password-strength-bar"></div>
                            <div class="password-strength-bar"></div>
                        </div>
                        <span class="password-strength-text" id="passwordStrengthText"></span>
                    </div>
                </div>
                <div class="auth-field">
                    <label class="auth-label" for="authPasswordConfirm">${t.authPassConfirmLabel || 'Confirmar contraseña'}</label>
                    <div class="auth-pass-wrap">
                        <input type="password" class="auth-input" id="authPasswordConfirm" placeholder="${t.authPassConfirmHint || 'Repetí tu contraseña'}" autocomplete="new-password" required aria-required="true">
                        <button type="button" class="auth-pass-toggle" aria-label="${t.authPassShow||'Mostrar contraseña'}" onclick="togglePasswordVisibility('authPasswordConfirm',this)">
                            <svg class="eye-on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            <svg class="eye-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="display:none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        </button>
                    </div>
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
                        <button class="auth-role-btn" data-role="team" onclick="selectAuthRole(this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                            <span class="auth-role-name">${t.authRoleTeam || 'Running Team'}</span>
                            <span class="auth-role-desc">${t.authRoleTeamDesc || 'Registrá tu equipo y mostrá en qué carreras corren'}</span>
                        </button>
                    </div>
                </div>
                <div id="orgFields" class="auth-org-fields" style="display:none">
                    <div class="auth-field">
                        <label class="auth-label">${t.authOrgName || 'Nombre de la organización'} *</label>
                        <input type="text" class="auth-input" id="authOrgName" placeholder="${t.authOrgNamePh || 'Ej: Sportsfacilities, Running Club Córdoba'}">
                    </div>
                    <div class="auth-org-grid">
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
                    </div>
                    <div class="auth-org-grid">
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
                <div id="teamFields" class="auth-org-fields" style="display:none">
                    <div class="auth-field">
                        <label class="auth-label">${t.authTeamName || 'Nombre del equipo'} *</label>
                        <input type="text" class="auth-input" id="authTeamName" placeholder="${t.authTeamNamePh || 'Ej: NRC Buenos Aires, Trail Runners Mendoza'}">
                    </div>
                    <div class="auth-org-grid">
                        <div class="auth-field">
                            <label class="auth-label">${t.authTeamCity || 'Ciudad / Zona'} *</label>
                            <input type="text" class="auth-input" id="authTeamCity" placeholder="${t.authTeamCityPh || 'Ej: Palermo, Buenos Aires'}">
                        </div>
                        <div class="auth-field">
                            <label class="auth-label">${t.authTeamCountry || 'País'}</label>
                            <select class="auth-input auth-select" id="authTeamCountry">
                                <option value="">${t.selC || 'Elegí un país'}</option>
                                ${countries.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="auth-org-grid">
                        <div class="auth-field">
                            <label class="auth-label">${t.authTeamModality || 'Modalidad'}</label>
                            <select class="auth-input auth-select" id="authTeamModality">
                                <option value="" disabled selected>${t.authTeamModalityPh || 'Seleccioná'}</option>
                                <option value="road">${t.road || 'Asfalto'}</option>
                                <option value="trail">Trail</option>
                                <option value="both">${t.authTeamBoth || 'Ambos'}</option>
                            </select>
                        </div>
                        <div class="auth-field">
                            <label class="auth-label">Instagram</label>
                            <input type="text" class="auth-input" id="authTeamIG" placeholder="@equipo">
                        </div>
                    </div>
                    <div class="auth-field">
                        <label class="auth-label">${t.authTeamContact || 'WhatsApp / Contacto'}</label>
                        <input type="url" class="auth-input" id="authTeamContact" placeholder="${t.authTeamContactPh || 'https://wa.me/...'}" pattern="https://wa\.me/.*">
                    </div>
                </div>
                <label class="auth-terms-check">
                    <input type="checkbox" id="authTermsCheck">
                    <span class="auth-terms-text">${t.authTerms}</span>
                </label>
                <button class="auth-submit" id="authSubmit" onclick="handleSignup()">
                    <span class="auth-submit-text">${t.authCreateAccount}</span>
                    <span class="auth-submit-loader"></span>
                </button>
            </div>
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
                    <label class="auth-label" for="authEmail">Email</label>
                    <input type="email" class="auth-input" id="authEmail" placeholder="tu@email.com" autocomplete="email" required aria-required="true">
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
    const teamFields = document.getElementById('teamFields');
    const modal = document.getElementById('authModal');
    if (orgFields) orgFields.style.display = role === 'organizer' ? 'flex' : 'none';
    if (teamFields) teamFields.style.display = role === 'team' ? 'flex' : 'none';
    if (modal) modal.classList.toggle('auth-wide', role === 'organizer' || role === 'team');

    /* Scroll modal down to reveal extra fields + submit button */
    if (role !== 'runner' && modal) {
        setTimeout(() => {
            modal.scrollTo({ top: modal.scrollHeight, behavior: 'smooth' });
        }, 350);
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
    const passwordConfirm = document.getElementById('authPasswordConfirm')?.value;
    const t = T[lang];

    if (!email) { showAuthError(t.authErrEmail); return; }
    if (!password || password.length < 8) { showAuthError(t.authErrPassLen); return; }
    if (!/[A-Z]/.test(password)) { showAuthError(t.authErrPassUpper); return; }
    if (!/[0-9]/.test(password)) { showAuthError(t.authErrPassNumber); return; }
    if (password !== passwordConfirm) { showAuthError(t.authErrPassMatch); return; }
    if (!document.getElementById('authTermsCheck')?.checked) { showAuthError(t.authErrTerms); return; }

    const activeRole = document.querySelector('.auth-role-btn.active');
    const role = activeRole?.dataset.role || 'runner';

    let orgData = null;
    let teamData = null;
    if (role === 'organizer') {
        const orgName = document.getElementById('authOrgName')?.value?.trim();
        if (!orgName) {
            showAuthError(t.authErrOrgName || 'Ingresá el nombre de la organización');
            return;
        }
        const orgIG = document.getElementById('authOrgIG')?.value?.trim() || null;
        if (orgIG && !orgIG.startsWith('@')) {
            showAuthError(t.authErrIGFormat);
            return;
        }
        orgData = {
            org_name: orgName,
            org_website: document.getElementById('authOrgWeb')?.value?.trim() || null,
            org_country: document.getElementById('authOrgCountry')?.value || null,
            org_social_ig: orgIG,
            org_social_fb: document.getElementById('authOrgFB')?.value?.trim() || null
        };
    } else if (role === 'team') {
        const teamName = document.getElementById('authTeamName')?.value?.trim();
        const teamCity = document.getElementById('authTeamCity')?.value?.trim();
        if (!teamName) {
            showAuthError(t.authErrTeamName || 'Ingresá el nombre del equipo');
            return;
        }
        if (!teamCity) {
            showAuthError(t.authErrTeamCity || 'Ingresá la ciudad del equipo');
            return;
        }
        const teamIG = document.getElementById('authTeamIG')?.value?.trim() || null;
        if (teamIG && !teamIG.startsWith('@')) {
            showAuthError(t.authErrIGFormat);
            return;
        }
        const teamContact = document.getElementById('authTeamContact')?.value?.trim() || null;
        if (teamContact && !/^https:\/\/wa\.me\/.+/.test(teamContact)) {
            showAuthError(t.authErrWhatsApp);
            return;
        }
        teamData = {
            team_name: teamName,
            team_city: teamCity,
            team_country: document.getElementById('authTeamCountry')?.value || null,
            team_modality: document.getElementById('authTeamModality')?.value || null,
            team_instagram: teamIG,
            team_contact: teamContact
        };
    }

    authSignUp(email, password, role, orgData, teamData);
}

/* Toggle password visibility (show/hide on click) */
function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    const eyeOn = btn.querySelector('.eye-on');
    const eyeOff = btn.querySelector('.eye-off');
    if (eyeOn && eyeOff) {
        eyeOn.style.display = showing ? '' : 'none';
        eyeOff.style.display = showing ? 'none' : '';
    }
    const t = T[lang] || {};
    btn.setAttribute('aria-label', showing ? (t.authPassShow || 'Mostrar contraseña') : (t.authPassHide || 'Ocultar contraseña'));
}

/* Password strength meter */
function updatePasswordStrength(password) {
    const bars = document.querySelectorAll('.password-strength-bar');
    const textEl = document.getElementById('passwordStrengthText');
    const container = document.getElementById('passwordStrength');
    const t = T[lang];

    if (!container) return;
    if (!password) { container.style.display = 'none'; return; }
    container.style.display = 'flex';

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
        { label: t.passWeak, color: 'var(--status-danger)' },
        { label: t.passFair, color: 'var(--status-warn)' },
        { label: t.passGood, color: 'var(--status-info)' },
        { label: t.passStrong, color: 'var(--status-ok)' }
    ];

    const level = levels[Math.max(0, score - 1)] || levels[0];
    bars.forEach((bar, i) => {
        bar.style.background = i < score ? level.color : 'var(--brd)';
    });
    textEl.textContent = level.label;
    textEl.style.color = level.color;
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
    const overlay = document.getElementById('raceOverlay');
    const modal = document.getElementById('raceModal');
    if (modal && !modal.classList.contains('open')) pushModalTrigger();
    if (overlay) overlay.classList.add('open');
    if (modal) modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeRaceModal() {
    const overlay = document.getElementById('raceOverlay');
    const modal = document.getElementById('raceModal');
    const wasOpen = modal && modal.classList.contains('open');
    if (overlay) overlay.classList.remove('open');
    if (modal) modal.classList.remove('open');
    const drawer = document.getElementById('drawer');
    if (!drawer || !drawer.classList.contains('open')) {
        document.body.style.overflow = '';
    }
    if (wasOpen) popModalTrigger();
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
                <input type="text" class="auth-input" id="raceName" placeholder="${t.raceNamePh || 'Ej: Maratón de Buenos Aires'}" value="${prefill ? esc(prefill.n) : ''}">
            </div>
            <div class="race-form-row">
                <div class="auth-field">
                    <label class="auth-label">${t.raceDate || 'Fecha'} *</label>
                    <input type="date" class="auth-input" id="raceDate" value="${esc(prefill?.d || '')}">
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
                    <input type="text" class="auth-input" id="raceLocation" placeholder="${t.raceLocationPh || 'Ej: Bariloche, Río Negro'}" value="${prefill ? esc(prefill.l) : ''}">
                </div>
            </div>
            <div class="auth-field">
                <label class="auth-label">${t.raceDist || 'Distancias'} *</label>
                <div class="race-form-chips" id="raceChips">${chips}</div>
                <input type="text" class="auth-input" id="raceCustomDist" placeholder="${t.raceCustomDist || 'Otra distancia (ej: 8K, 60K)'}" style="margin-top:0.4rem">
            </div>
            <div class="auth-field">
                <label class="auth-label">${t.raceWebsite || 'Sitio web'}</label>
                <input type="url" class="auth-input" id="raceWebsite" placeholder="https://..." value="${esc(prefill?.w || '')}">
            </div>
            <div class="auth-field">
                <label class="auth-label">${t.raceDesc || 'Descripción'}</label>
                <textarea class="auth-input" id="raceDesc" placeholder="${t.raceDescPh || 'Contá de qué se trata la carrera...'}" rows="3">${esc(prefill?.desc || '')}</textarea>
            </div>
            <div class="auth-field">
                <label class="auth-label">${t.racePrice || 'Precio / Inscripción'}</label>
                <input type="text" class="auth-input" id="racePrice" placeholder="${t.racePricePh || 'Ej: ARS 15.000 / USD 50'}" value="${esc(prefill?.price || '')}">
            </div>
            <div class="auth-field">
                <label class="auth-label">${t.resultsUrl || 'Link a resultados'}</label>
                <input type="url" class="auth-input" id="raceResultsUrl" placeholder="${t.resultsUrlPh || 'https://...'}" value="${esc(prefill?.results_url || '')}">
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
    const resultsUrl = document.getElementById('raceResultsUrl')?.value?.trim() || '';
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
        price: price || null,
        results_url: resultsUrl || null
    };

    let result;
    if (editingRaceId) {
        result = await updateRace(editingRaceId, {
            name: raceData.name, date: raceData.date, type: raceData.type,
            country_id: raceData.country_id, location: raceData.location,
            categories: raceData.categories, website: raceData.website,
            description: raceData.description, price: raceData.price,
            results_url: raceData.results_url
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
async function openMyRaces() {
    closeUserMenu();
    const t = T[lang];
    const locale = lang === 'pt' ? 'pt-BR' : lang === 'en' ? 'en-US' : 'es-AR';
    const now = new Date();

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

    // Load click counts for organizer's races
    const raceIds=myRaces.filter(r=>r._id).map(r=>r._id);
    if(raceIds.length)await loadClickCounts(raceIds);

    // Results prompt for past races
    let resultsPromptHTML='';
    const pastNoResults=myRaces.filter(r=>{
        const dt=new Date(r.d+'T00:00:00');
        return dt<now&&!r.results_url;
    });
    if(pastNoResults.length){
        resultsPromptHTML='<div class="results-prompts">';
        pastNoResults.forEach(r=>{
            const daysDiff=Math.floor((now-new Date(r.d+'T00:00:00'))/(1000*60*60*24));
            resultsPromptHTML+=`<div class="results-prompt-card">
                <div class="results-prompt-text">🏁 <strong>${esc(r.n)}</strong> ${t.resultsPrompt||'fue hace'} ${daysDiff} ${t.resultsPromptSuffix||'días. ¡Agregá los resultados!'}</div>
                <button class="results-prompt-btn" onclick="editRaceResults('${esc(r._id)}','${esc(r._country)}')">${t.resultsPromptBtn||'Agregar resultados'}</button>
            </div>`;
        });
        resultsPromptHTML+='</div>';
    }

    let listHTML = '';
    if (myRaces.length) {
        listHTML = '<div class="my-races-list">';
        myRaces.forEach(r => {
            const dt = new Date(r.d + 'T00:00:00');
            const dateStr = dt.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
            const country = countries.find(c => c.id === r._country);
            const fc = r._id && typeof getFavCount === 'function' ? getFavCount(r._id) : 0;
            const cc = r._id ? getClickCount(r._id) : 0;
            const isPastRace = dt < now;
            const hasResults = !!r.results_url;
            const insightHTML = fc > 0 ? `<span class="org-insight"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="12" height="12"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> ${fc}</span>` : '';
            const clicksHTML = cc > 0 ? `<span class="org-insight org-clicks"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="12" height="12"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg> ${cc} ${cc===1?(t.clickLabel||'click'):(t.clicksLabel||'clicks')}</span>` : '';
            const resultsIcon = isPastRace ? (hasResults ? '<span class="results-check" title="'+esc(t.resultsPublished||'Resultados publicados')+'">✓</span>' : '') : '';
            listHTML += `
                <div class="my-race-item">
                    <div class="my-race-info">
                        <div class="my-race-name">${esc(r.n)} ${insightHTML} ${clicksHTML} ${resultsIcon}</div>
                        <div class="my-race-meta">${dateStr} · ${esc(r.l)} · ${country ? country.name : ''}</div>
                    </div>
                    <div class="my-race-actions">
                        <button class="my-race-btn" onclick="openOrgNoticeModal('${esc(r._id)}','${esc(r.n)}')" title="${t.orgSendNotice || 'Enviar aviso'}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                        </button>
                        <button class="my-race-btn" onclick="openOrgKit('${esc(r._id)}','${esc(r._country)}')" title="${t.orgKitTitle || 'Kit de difusión'}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        </button>
                        <button class="my-race-btn" onclick="cloneRace('${esc(r._id)}','${esc(r._country)}')" title="${t.cloneRace || 'Crear nueva edición'}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                        </button>
                        <button class="my-race-btn" onclick="editMyRace('${esc(r._id)}','${esc(r._country)}')" title="${t.raceEdit || 'Editar'}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </button>
                        <button class="my-race-btn delete" onclick="deleteMyRace('${esc(r._id)}')" title="${t.raceDelete || 'Eliminar'}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        </button>
                    </div>
                </div>`;
        });
        listHTML += '</div>';
    } else {
        listHTML = `<div class="my-races-empty empty-state-rich">
            <div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg></div>
            <div class="empty-title">${t.orgEmptyTitle||'Aún no publicaste carreras'}</div>
            <div class="empty-sub">${t.orgEmptySub||'Sumá tu primera carrera al calendario más grande de Latinoamérica en menos de 2 minutos.'}</div>
            <button class="empty-cta" onclick="openPublishRaceModal()">
                <span>${t.orgEmptyCta||'Publicar mi primera carrera'}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
        </div>`;
    }

    // Org insights summary
    const totalFavs = myRaces.reduce((s, r) => s + (r._id && typeof getFavCount === 'function' ? getFavCount(r._id) : 0), 0);
    const totalClicks = myRaces.reduce((s, r) => s + (r._id ? getClickCount(r._id) : 0), 0);
    let insightSummary = '';
    if(totalFavs > 0 || totalClicks > 0){
        insightSummary='<div class="org-insights-bar">';
        if(totalFavs>0)insightSummary+=`<span class="org-insights-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> ${totalFavs} ${totalFavs === 1 ? (t.oneRunnerInterested || 'runner interesado') : (t.runnersInterested || 'runners interesados')}</span>`;
        if(totalClicks>0)insightSummary+=`<span class="org-insights-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg> ${totalClicks} ${totalClicks===1?(t.clickLabel||'click'):(t.clicksLabel||'clicks')}</span>`;
        insightSummary+='</div>';
    }

    // Analytics section
    const analyticsHTML=typeof renderOrgAnalyticsHTML==='function'?renderOrgAnalyticsHTML(myRaces):'';

    document.getElementById('raceModalBody').innerHTML = `
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${t.authMyRaces || 'Mis carreras'}</h2>
            <p class="auth-subtitle">${myRaces.length} ${myRaces.length === 1 ? (t.raceOne || 'carrera publicada') : (t.racePlural || 'carreras publicadas')}</p>
        </div>
        ${insightSummary}
        ${analyticsHTML}
        ${resultsPromptHTML}
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

function cloneRace(raceId,countryId){
    const race=(R[countryId]||[]).find(r=>r._id===raceId);
    if(!race)return;
    // Clone with date +1 year, clear results_url
    const nextDate=new Date(race.d+'T00:00:00');
    nextDate.setFullYear(nextDate.getFullYear()+1);
    const nextDateStr=nextDate.toISOString().slice(0,10);
    openPublishRaceModal({...race,_country:countryId,_id:null,d:nextDateStr,results_url:null});
}

function editRaceResults(raceId,countryId){
    const race=(R[countryId]||[]).find(r=>r._id===raceId);
    if(!race)return;
    openPublishRaceModal({...race,_country:countryId});
    // Focus on results URL field after modal opens
    setTimeout(()=>{
        const el=document.getElementById('raceResultsUrl');
        if(el){el.focus();el.scrollIntoView({behavior:'smooth',block:'center'});}
    },300);
}

/* ============================================
   RUNNING TEAM — Profile & Races
   ============================================ */
function openMyTeam() {
    closeUserMenu();
    const t = T[lang];
    const p = currentProfile || {};

    document.getElementById('raceModalBody').innerHTML = `
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${t.authMyTeam || 'Mi equipo'}</h2>
            <p class="auth-subtitle">${t.teamProfileTitle || 'Perfil del equipo'}</p>
        </div>
        <div id="raceError" class="auth-error"></div>
        <div class="race-form">
            <div class="auth-field">
                <label class="auth-label">${t.authTeamName || 'Nombre del equipo'} *</label>
                <input type="text" class="auth-input" id="teamEditName" value="${esc(p.team_name || '')}">
            </div>
            <div class="race-form-row">
                <div class="auth-field">
                    <label class="auth-label">${t.authTeamCity || 'Ciudad / Zona'} *</label>
                    <input type="text" class="auth-input" id="teamEditCity" value="${esc(p.team_city || '')}">
                </div>
                <div class="auth-field">
                    <label class="auth-label">${t.authTeamModality || 'Modalidad'}</label>
                    <select class="auth-input auth-select" id="teamEditModality">
                        <option value="road" ${p.team_modality==='road'?'selected':''}>${t.road || 'Asfalto'}</option>
                        <option value="trail" ${p.team_modality==='trail'?'selected':''}>Trail</option>
                        <option value="both" ${p.team_modality==='both'?'selected':''}>${t.authTeamBoth || 'Ambos'}</option>
                    </select>
                </div>
            </div>
            <div class="auth-field">
                <label class="auth-label">${t.authTeamCountry || 'País'}</label>
                <select class="auth-input auth-select" id="teamEditCountry">
                    ${countries.map(c => `<option value="${c.id}" ${p.team_country===c.id?'selected':''}>${c.name}</option>`).join('')}
                </select>
            </div>
            <div class="race-form-row">
                <div class="auth-field">
                    <label class="auth-label">Instagram</label>
                    <input type="text" class="auth-input" id="teamEditIG" value="${esc(p.team_instagram || '')}" placeholder="@equipo">
                </div>
                <div class="auth-field">
                    <label class="auth-label">${t.authTeamContact || 'WhatsApp / Contacto'}</label>
                    <input type="text" class="auth-input" id="teamEditContact" value="${esc(p.team_contact || '')}" placeholder="https://wa.me/...">
                </div>
            </div>
            ${typeof renderRecruitingToggle==='function'?renderRecruitingToggle():''}
            <button class="auth-submit" onclick="saveTeamProfile()">
                <span class="auth-submit-text">${t.raceSave || 'Guardar cambios'}</span>
                <span class="auth-submit-loader"></span>
            </button>
        </div>
    `;
    openRaceModal();
}

async function saveTeamProfile() {
    const t = T[lang];
    const name = document.getElementById('teamEditName')?.value?.trim();
    const city = document.getElementById('teamEditCity')?.value?.trim();
    if (!name) { showRaceError(t.authErrTeamName || 'Ingresá el nombre del equipo'); return; }
    if (!city) { showRaceError(t.authErrTeamCity || 'Ingresá la ciudad'); return; }

    const result = await updateProfile({
        team_name: name,
        team_city: city,
        team_modality: document.getElementById('teamEditModality')?.value || 'road',
        team_country: document.getElementById('teamEditCountry')?.value || null,
        team_instagram: document.getElementById('teamEditIG')?.value?.trim() || null,
        team_contact: document.getElementById('teamEditContact')?.value?.trim() || null
    });

    if (result.error) {
        showRaceError(result.error.message || result.error);
        return;
    }
    closeRaceModal();
    showToast(t.teamSaved || 'Equipo actualizado', 'success');
}

function openTeamRaces() {
    closeUserMenu();
    const t = T[lang];
    const locale = lang === 'pt' ? 'pt-BR' : lang === 'en' ? 'en-US' : 'es-AR';
    const monthNames = t.monthNames || ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const now = new Date();

    // Find races this team has marked
    const myTeamRaces = [];
    if (currentUser && typeof teamRaces !== 'undefined') {
        for (const cid of Object.keys(R)) {
            R[cid].forEach((r, idx) => {
                const raceId = r._id || cid + '_' + idx;
                if (teamRaces.includes(raceId)) {
                    myTeamRaces.push({ ...r, _country: cid, _idx: idx, _rid: raceId });
                }
            });
        }
    }
    myTeamRaces.sort((a, b) => new Date(a.d + 'T00:00:00') - new Date(b.d + 'T00:00:00'));

    // Next race countdown
    const upcoming = myTeamRaces.filter(r => new Date(r.d+'T00:00:00') >= now);
    let nextHTML = '';
    if(upcoming.length){
        const next=upcoming[0];
        const nextDt=new Date(next.d+'T00:00:00');
        const diffDays=Math.ceil((nextDt-now)/(1000*60*60*24));
        nextHTML=`<div class="season-next" style="margin-bottom:1rem">
            <div class="season-next-label">${t.teamCalendarNext||'Próxima carrera en'}</div>
            <div class="season-next-name">${esc(next.n)}</div>
            <div class="season-next-countdown"><span class="season-countdown-num">${diffDays}</span> ${t.dDays||'días'}</div>
        </div>`;
    }

    // Group by month
    let calendarHTML = '';
    if (myTeamRaces.length) {
        const byMonth = {};
        myTeamRaces.forEach(r => {
            const dt = new Date(r.d + 'T00:00:00');
            const key = dt.getFullYear() + '-' + String(dt.getMonth()).padStart(2,'0');
            if(!byMonth[key])byMonth[key]={label:monthNames[dt.getMonth()]+' '+dt.getFullYear(),races:[]};
            byMonth[key].races.push(r);
        });
        const sortedKeys = Object.keys(byMonth).sort();
        calendarHTML = '<div class="team-calendar">';
        sortedKeys.forEach(key => {
            const grp = byMonth[key];
            calendarHTML += `<div class="team-cal-month">
                <div class="team-cal-month-label">${esc(grp.label)} <span class="team-cal-month-count">${grp.races.length}</span></div>
                <div class="team-cal-races">`;
            grp.races.forEach(r => {
                const dt = new Date(r.d + 'T00:00:00');
                const dayStr = dt.toLocaleDateString(locale, { day:'numeric', month:'short' });
                const isPast = dt < now;
                const typeClass = r.t === 'trail' ? 'type-trail' : 'type-road';
                const raceId = r._rid;
                calendarHTML += `
                    <div class="team-cal-race${isPast?' past':''}" onclick="closeRaceModal();setTimeout(()=>openDrawer('${esc(r._country)}',${r._idx}),300)" style="cursor:pointer">
                        <div class="team-cal-race-date">${dayStr}</div>
                        <div class="team-cal-race-info">
                            <div class="team-cal-race-name">${esc(r.n)}</div>
                            <div class="team-cal-race-meta">${esc(r.l)} · <span class="${typeClass}">${r.t==='trail'?'Trail':(t.road||'Asfalto')}</span></div>
                        </div>
                        <button class="my-race-btn delete" onclick="event.stopPropagation();toggleTeamRace('${esc(raceId)}');openTeamRaces();" title="${t.teamRemoved||'Quitar'}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    </div>`;
            });
            calendarHTML += '</div></div>';
        });
        calendarHTML += '</div>';
    } else {
        calendarHTML = `<div class="my-races-empty empty-state-rich">
            <div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg></div>
            <div class="empty-title">${t.teamCalEmptyTitle||'Tu equipo aún no marcó carreras'}</div>
            <div class="empty-sub">${t.teamCalEmptySub||'Marcá las carreras donde van a correr para mostrarlas en el calendario compartido.'}</div>
            <button class="empty-cta" onclick="closeRaceModal();setTimeout(()=>{const e=document.getElementById('csTrigger');if(e)e.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>{if(typeof toggleDD==='function')toggleDD();},400);},300)">
                <span>${t.teamCalEmptyCta||'Explorar carreras'}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
        </div>`;
    }

    // Share button
    const shareHTML = myTeamRaces.length ? `<div class="season-action-btns">
        <button class="season-action-btn" onclick="shareTeamCalendar()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            ${t.teamCalendarShare||'Compartir calendario'}
        </button>
        <button class="season-action-btn" onclick="openTeamSeasonPlanner()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            ${t.teamPlannerTitle||'Planificador'}
        </button>
    </div>` : `<button class="auth-submit" onclick="openTeamSeasonPlanner()" style="margin-top:1rem">
        <span class="auth-submit-text">${t.teamPlannerTitle||'Planificador de temporada'}</span>
    </button>`;

    // Announcements
    const announcementsHTML=typeof renderTeamAnnouncementsHTML==='function'?renderTeamAnnouncementsHTML(true):'';

    document.getElementById('raceModalBody').innerHTML = `
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${t.teamCalendarTitle || 'Calendario del equipo'}</h2>
            <p class="auth-subtitle">${myTeamRaces.length} ${t.teamCalendarTotal||'carreras marcadas'}</p>
        </div>
        ${nextHTML}
        ${shareHTML}
        ${announcementsHTML}
        ${calendarHTML}
    `;
    openRaceModal();
}

function shareTeamCalendar(){
    if(!currentUser||!currentProfile)return;
    const teamName=currentProfile.team_name||'Equipo';
    const myTeamRaces=[];
    for(const cid of Object.keys(R)){
        R[cid].forEach((r,idx)=>{
            const raceId=r._id||cid+'_'+idx;
            if(teamRaces.includes(raceId))myTeamRaces.push(r);
        });
    }
    myTeamRaces.sort((a,b)=>new Date(a.d)-new Date(b.d));
    const upcoming=myTeamRaces.filter(r=>new Date(r.d+'T00:00:00')>=new Date());
    let text=`🏃 ${teamName} — Calendario de carreras\n\n`;
    upcoming.slice(0,10).forEach(r=>{
        const dt=new Date(r.d+'T00:00:00');
        const dateStr=dt.toLocaleDateString(lang==='pt'?'pt-BR':lang==='en'?'en-US':'es-ES',{day:'numeric',month:'short'});
        text+=`📅 ${dateStr} — ${r.n} (${r.l})\n`;
    });
    text+=`\n— PULZ · ${T[lang].ftTagline}`;
    const waUrl='https://wa.me/?text='+encodeURIComponent(text);
    window.open(waUrl,'_blank');
}

/* ============================================
   TEAM SEASON PLANNER (Bulk Race Marking)
   ============================================ */
function openTeamSeasonPlanner(){
    const t=T[lang];
    const locale=lang==='pt'?'pt-BR':lang==='en'?'en-US':'es-ES';
    const teamCountry=currentProfile?.team_country||activeCountry||countries[0]?.id;
    if(!teamCountry)return;
    const now=new Date();
    const allRaces=getVisibleRaces(R[teamCountry]||[]).filter(r=>new Date(r.d+'T00:00:00')>=now);
    allRaces.sort((a,b)=>new Date(a.d)-new Date(b.d));

    let listHTML='';
    if(allRaces.length){
        listHTML='<div class="planner-race-list">';
        allRaces.forEach((r,idx)=>{
            const raceId=r._id||teamCountry+'_'+(R[teamCountry]||[]).indexOf(r);
            const isMarked=teamRaces.includes(raceId);
            const dt=new Date(r.d+'T00:00:00');
            const dateStr=dt.toLocaleDateString(locale,{day:'numeric',month:'short'});
            const typeClass=r.t==='trail'?'type-trail':'type-road';
            listHTML+=`<label class="planner-race-item${isMarked?' checked':''}">
                <input type="checkbox" class="planner-check" data-race-id="${esc(raceId)}" ${isMarked?'checked':''} onchange="this.parentNode.classList.toggle('checked',this.checked)">
                <div class="planner-race-date">${dateStr}</div>
                <div class="planner-race-info">
                    <div class="planner-race-name">${esc(r.n)}</div>
                    <div class="planner-race-meta">${esc(r.l)} · <span class="${typeClass}">${r.t==='trail'?'Trail':(t.road||'Asfalto')}</span> · ${esc((r.c||[]).join(', '))}</div>
                </div>
            </label>`;
        });
        listHTML+='</div>';
    } else {
        listHTML=`<div class="my-races-empty">${t.noT||'Sin carreras'}</div>`;
    }

    const countrySelect=countries.map(c=>`<option value="${c.id}" ${c.id===teamCountry?'selected':''}>${c.name}</option>`).join('');

    document.getElementById('raceModalBody').innerHTML=`
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${t.teamPlannerTitle||'Planificador de temporada'}</h2>
            <p class="auth-subtitle">${t.teamPlannerSub||'Marcá varias carreras de una vez'}</p>
        </div>
        <div class="planner-toolbar">
            <select class="auth-input auth-select" onchange="openTeamSeasonPlannerForCountry(this.value)" style="max-width:200px">${countrySelect}</select>
        </div>
        ${listHTML}
        ${allRaces.length?`<button class="auth-submit" onclick="savePlannerSelection('${esc(teamCountry)}')" style="margin-top:1rem">
            <span class="auth-submit-text">${t.teamPlannerSave||'Guardar selección'}</span>
        </button>`:''}
        <button class="auth-text-btn" onclick="openTeamRaces()" style="margin-top:0.5rem">← ${t.back||'Volver'}</button>
    `;
    openRaceModal();
}

function openTeamSeasonPlannerForCountry(countryId){
    const saved=currentProfile?.team_country;
    if(currentProfile)currentProfile.team_country=countryId;
    openTeamSeasonPlanner();
    if(currentProfile)currentProfile.team_country=saved;
}

async function savePlannerSelection(countryId){
    const checkboxes=document.querySelectorAll('.planner-check');
    const addIds=[],removeIds=[];
    checkboxes.forEach(cb=>{
        const rid=cb.dataset.raceId;
        const wasMarked=teamRaces.includes(rid);
        if(cb.checked&&!wasMarked)addIds.push(rid);
        if(!cb.checked&&wasMarked)removeIds.push(rid);
    });
    if(addIds.length||removeIds.length){
        await batchToggleTeamRaces(addIds,removeIds);
        showToast(T[lang].teamPlannerSaved||'Selección guardada','success');
    }
    openTeamRaces();
}

/* ============================================
   RUNNER DASHBOARD — "Mi temporada"
   ============================================ */
function openMySeason() {
    closeUserMenu();
    if(!currentUser)return;
    const t = T[lang];
    const locale = lang === 'pt' ? 'pt-BR' : lang === 'en' ? 'en-US' : 'es-AR';
    const now = new Date();

    // Gather favorite races
    const favRaces = [];
    if (currentUser && typeof favorites !== 'undefined') {
        for (const cid of Object.keys(R)) {
            R[cid].forEach((r, idx) => {
                const raceId = r._id || cid + '_' + idx;
                if (favorites.includes(raceId)) {
                    favRaces.push({ ...r, _country: cid, _idx: idx, _fid: raceId });
                }
            });
        }
    }
    favRaces.sort((a, b) => new Date(a.d + 'T00:00:00') - new Date(b.d + 'T00:00:00'));

    const upcoming = favRaces.filter(r => new Date(r.d + 'T00:00:00') >= now);
    const past = favRaces.filter(r => new Date(r.d + 'T00:00:00') < now);
    const totalKm = favRaces.reduce((s, r) => {
        const maxD = (r.c || []).reduce((m, c) => {
            const num = parseFloat(c);
            return !isNaN(num) && num > m ? num : m;
        }, 0);
        return s + maxD;
    }, 0);

    // Next race countdown
    let nextRaceHTML = '';
    if (upcoming.length) {
        const next = upcoming[0];
        const nextDt = new Date(next.d + 'T00:00:00');
        const diffDays = Math.ceil((nextDt - now) / (1000 * 60 * 60 * 24));
        const dateStr = nextDt.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
        nextRaceHTML = `
            <div class="season-next">
                <div class="season-next-label">${t.seasonNext || 'Próxima carrera'}</div>
                <div class="season-next-name">${esc(next.n)}</div>
                <div class="season-next-meta">${dateStr} · ${esc(next.l)}</div>
                <div class="season-next-countdown"><span class="season-countdown-num">${diffDays}</span> ${t.dDays || 'días'}</div>
            </div>`;
    }

    // Stats bar
    const statsHTML = `
        <div class="season-stats">
            <div class="season-stat">
                <div class="season-stat-num">${favRaces.length}</div>
                <div class="season-stat-label">${t.seasonSaved || 'Guardadas'}</div>
            </div>
            <div class="season-stat">
                <div class="season-stat-num">${upcoming.length}</div>
                <div class="season-stat-label">${t.seasonUpcoming || 'Por correr'}</div>
            </div>
            <div class="season-stat">
                <div class="season-stat-num">${past.length}</div>
                <div class="season-stat-label">${t.seasonDone || 'Corridas'}</div>
            </div>
            ${totalKm > 0 ? `<div class="season-stat"><div class="season-stat-num">${Math.round(totalKm)}<span class="season-stat-unit">K</span></div><div class="season-stat-label">${t.seasonKm || 'Km en agenda'}</div></div>` : ''}
        </div>`;

    // Race list grouped by month
    let listHTML = '';
    if (upcoming.length) {
        listHTML += `<div class="season-section-title">${t.seasonUpcoming || 'Por correr'}</div>`;
        listHTML += '<div class="my-races-list">';
        upcoming.forEach(r => {
            const dt = new Date(r.d + 'T00:00:00');
            const dateStr = dt.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
            const diffD = Math.ceil((dt - now) / (1000 * 60 * 60 * 24));
            const country = countries.find(c => c.id === r._country);
            const typeClass = r.t === 'trail' ? 'type-trail' : 'type-road';
            listHTML += `
                <div class="my-race-item season-race" onclick="closeRaceModal();setTimeout(()=>openDrawer('${esc(r._country)}',${r._idx}),300)" style="cursor:pointer">
                    <div class="my-race-info">
                        <div class="my-race-name">${esc(r.n)}</div>
                        <div class="my-race-meta">${dateStr} · ${esc(r.l)} · ${country ? country.name : ''}</div>
                    </div>
                    <div class="season-race-badge"><span class="${typeClass}">${diffD}d</span></div>
                    <button class="my-race-unlike" onclick="event.stopPropagation();toggleFav('${esc(r._fid)}');setTimeout(openMySeason,80)" title="${esc(t.dClose||'Quitar')}" aria-label="${esc(t.dClose||'Quitar')}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>`;
        });
        listHTML += '</div>';
    }

    if (past.length) {
        const completedCount = past.filter(r => typeof isCompleted === 'function' && isCompleted(r._fid)).length;
        listHTML += `<div class="season-section-title" style="margin-top:1rem">${t.seasonDone || 'Corridas'} ✓${completedCount > 0 ? ` <span style="font-size:0.7rem;color:var(--pulse);margin-left:0.3rem">${completedCount} ${t.completionDone || 'completadas'}</span>` : ''}</div>`;
        listHTML += '<div class="my-races-list">';
        past.slice(-10).reverse().forEach(r => {
            const dt = new Date(r.d + 'T00:00:00');
            const dateStr = dt.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
            const completed = typeof isCompleted === 'function' && isCompleted(r._fid);
            const compData = completed ? getCompletionData(r._fid) : null;
            const compTime = compData?.finish_time||'';
            const catsAttr = esc(JSON.stringify(r.c||[]));
            const compBadge = completed
                ? `<div class="season-race-badge"><span class="completion-badge" onclick="event.stopPropagation();openEnhancedCompletion('${esc(r._fid)}',JSON.parse(this.dataset.cats))" data-cats="${catsAttr}" style="cursor:pointer" title="${t.raceEdit||'Editar'}">✓${compTime ? ' ' + esc(compTime) : ''}</span></div>`
                : `<div class="season-race-badge"><button class="completion-mark-btn" onclick="event.stopPropagation();openEnhancedCompletion('${esc(r._fid)}',JSON.parse(this.dataset.cats))" data-cats="${catsAttr}">${t.completionMark || 'Completar'}</button></div>`;
            // Expandable log details
            let logExpandHTML='';
            if(compData&&(compData.distance_run||compData.effort||compData.weather||compData.notes)){
                const parts=[];
                if(compData.distance_run)parts.push(compData.distance_run);
                if(compData.effort)parts.push('⚡'+compData.effort+'/5');
                if(compData.weather){const wIcons={sun:'☀️',cloud:'☁️',rain:'🌧️',wind:'💨',cold:'❄️',hot:'🔥'};parts.push(wIcons[compData.weather]||compData.weather);}
                if(compData.would_repeat===true)parts.push('👍');
                if(compData.would_repeat===false)parts.push('👎');
                logExpandHTML=`<div class="race-log-summary">${parts.join(' · ')}${compData.notes?'<div class="race-log-notes">'+esc(compData.notes)+'</div>':''}</div>`;
            }
            listHTML += `
                <div class="my-race-item season-race season-past" onclick="closeRaceModal();setTimeout(()=>openDrawer('${esc(r._country)}',${r._idx}),300)" style="cursor:pointer">
                    <div class="my-race-info">
                        <div class="my-race-name">${esc(r.n)}</div>
                        <div class="my-race-meta">${dateStr} · ${esc(r.l)}</div>
                        ${logExpandHTML}
                    </div>
                    ${compBadge}
                    <button class="my-race-unlike" onclick="event.stopPropagation();toggleFav('${esc(r._fid)}');setTimeout(openMySeason,80)" title="${esc(t.dClose||'Quitar')}" aria-label="${esc(t.dClose||'Quitar')}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>`;
        });
        listHTML += '</div>';
    }

    if (!favRaces.length) {
        listHTML = `<div class="my-races-empty empty-state-rich">
            <div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></div>
            <div class="empty-title">${t.seasonEmptyTitle||'Tu temporada está vacía'}</div>
            <div class="empty-sub">${t.seasonEmptySub||'Tocá el corazón en cualquier carrera para guardarla y armar tu calendario personal.'}</div>
            <button class="empty-cta" onclick="closeRaceModal();setTimeout(()=>{const e=document.getElementById('csTrigger');if(e)e.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>{if(typeof toggleDD==='function')toggleDD();},400);},300)">
                <span>${t.seasonEmptyCta||'Explorar carreras'}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
        </div>`;
    }

    // Alert races
    let alertsHTML = '';
    if (typeof alerts !== 'undefined' && alerts.length) {
        alertsHTML = `<div class="season-section-title" style="margin-top:1rem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg> ${t.seasonAlerts || 'Alertas activas'}: ${alerts.length}</div>`;
    }

    // Annual stats section
    const completedRaces=past.filter(r=>typeof isCompleted==='function'&&isCompleted(r._fid));
    let annualStatsHTML='';
    if(completedRaces.length>0){
        let totalCompKm=0,trailCount=0,roadCount=0,countriesSet=new Set(),longestKm=0,longestName='',totalEffort=0,effortCount=0;
        completedRaces.forEach(r=>{
            const cd=getCompletionData(r._fid);
            const distStr=cd?.distance_run||'';
            const distNum=parseFloat(distStr);
            if(!isNaN(distNum)&&distNum>0)totalCompKm+=distNum;
            else{const maxD=(r.c||[]).reduce((m,c)=>{const n=parseFloat(c);return!isNaN(n)&&n>m?n:m;},0);totalCompKm+=maxD;}
            if(r.t==='trail')trailCount++;else roadCount++;
            const country=countries.find(c=>c.id===r._country);
            if(country)countriesSet.add(country.name);
            const raceKm=(r.c||[]).reduce((m,c)=>{const n=parseFloat(c);return!isNaN(n)&&n>m?n:m;},0);
            if(raceKm>longestKm){longestKm=raceKm;longestName=r.n;}
            if(cd?.effort>0){totalEffort+=cd.effort;effortCount++;}
        });
        const avgEffort=effortCount>0?(totalEffort/effortCount).toFixed(1):'—';
        annualStatsHTML=`
            <div class="season-section-title" style="margin-top:1.2rem">${t.statsTitle||'Mi año en números'}</div>
            <div class="annual-stats-grid">
                <div class="annual-stat"><div class="annual-stat-num">${completedRaces.length}</div><div class="annual-stat-label">${t.statsRaces||'Carreras corridas'}</div></div>
                <div class="annual-stat"><div class="annual-stat-num">${Math.round(totalCompKm)}K</div><div class="annual-stat-label">${t.statsKm||'Km en competencia'}</div></div>
                <div class="annual-stat"><div class="annual-stat-num">${trailCount}/${roadCount}</div><div class="annual-stat-label">${t.statsTrailRoad||'Trail vs Asfalto'}</div></div>
                <div class="annual-stat"><div class="annual-stat-num">${countriesSet.size}</div><div class="annual-stat-label">${t.statsCountries||'Países'}</div></div>
                ${longestName?`<div class="annual-stat"><div class="annual-stat-num">${longestKm}K</div><div class="annual-stat-label">${t.statsLongest||'Más larga'}</div></div>`:''}
                <div class="annual-stat"><div class="annual-stat-num">${avgEffort}</div><div class="annual-stat-label">${t.statsAvgEffort||'Esfuerzo promedio'}</div></div>
            </div>`;
    }

    // iCal + Compare header buttons
    const actionBtnsHTML=favRaces.length?`
        <div class="season-action-btns">
            <button class="season-action-btn" onclick="generateICS()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                ${t.icalExport||'Exportar calendario'}
            </button>
            <button class="season-action-btn replay-btn" onclick="openPulzReplay()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                ${t.replayBtn||'Mi Replay'}
            </button>
            <button class="season-action-btn passport-btn" onclick="openPulzPassport()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="2" y="3" width="20" height="18" rx="2"/><circle cx="12" cy="11" r="3"/><path d="M7 21v-1a5 5 0 0110 0v1"/></svg>
                ${t.passportBtn||'Mi Passport'}
            </button>
            <button class="season-action-btn" id="compareBtn" onclick="openCompareFromSeason()" style="display:none">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                ${t.compareBtn||'Comparar'}
            </button>
        </div>`:'';

    // New features
    const matchHTML=typeof renderMatchHTML==='function'?renderMatchHTML():'';
    const badgesHTML=typeof renderBadgesHTML==='function'?renderBadgesHTML():'';
    const predictorHTML=typeof renderPredictorHTML==='function'?renderPredictorHTML():'';
    const trendsHTML=typeof renderTrendsHTML==='function'?renderTrendsHTML():'';
    const warningsHTML=typeof renderPlannerWarningsHTML==='function'?renderPlannerWarningsHTML():'';

    // PULZ ID prompt — only nudge once user has at least 2 favorites (avoid pushing it on day-one users)
    const pidPromptHTML=(currentProfile&&!currentProfile.username&&favRaces.length>=2)?`<div class="pid-prompt" onclick="openPulzIdSetup()"><div class="pid-prompt-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div><div class="pid-prompt-text"><strong>${t.pidSetup||'Configurá tu PULZ ID'}</strong><span>${t.pidSetupSub||'Creá tu perfil público y compartilo'}</span></div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg></div>`:'';

    document.getElementById('raceModalBody').innerHTML = `
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${t.authMySeason || 'Mi temporada'}</h2>
            <p class="auth-subtitle">${currentProfile?.display_name || currentUser.email?.split('@')[0] || 'Runner'} · ${now.getFullYear()}</p>
        </div>
        ${nextRaceHTML}
        ${statsHTML}
        ${actionBtnsHTML}
        ${listHTML}
        ${warningsHTML}
        ${alertsHTML}
        ${matchHTML}
        ${pidPromptHTML}
        ${annualStatsHTML}
        ${badgesHTML}
        ${predictorHTML}
        ${trendsHTML}
    `;
    openRaceModal();

    // Add compare checkbox logic
    addCompareCheckboxes();
}

/* ============================================
   ENHANCED COMPLETION DIALOG (Race Log)
   ============================================ */
function openEnhancedCompletion(raceId, raceCategories){
    if(!currentUser){openAuthModal('signup');return;}
    const t=T[lang];
    const existing=getCompletionData(raceId);
    const cats=raceCategories||[];
    const distChips=cats.map(c=>{
        const active=existing&&existing.distance_run===c?' active':'';
        return `<button type="button" class="race-form-chip${active}" onclick="this.parentNode.querySelectorAll('.race-form-chip').forEach(b=>b.classList.remove('active'));this.classList.add('active')" data-dist="${esc(c)}">${esc(c)}</button>`;
    }).join('');
    const effortBtns=[1,2,3,4,5].map(i=>{
        const active=existing&&existing.effort===i?' active':'';
        return `<button type="button" class="effort-btn${active}" data-val="${i}" onclick="this.parentNode.querySelectorAll('.effort-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">${i}</button>`;
    }).join('');
    const weatherOpts=[
        {k:'sun',icon:'☀️'},
        {k:'cloud',icon:'☁️'},
        {k:'rain',icon:'🌧️'},
        {k:'wind',icon:'💨'},
        {k:'cold',icon:'❄️'},
        {k:'hot',icon:'🔥'}
    ];
    const weatherBtns=weatherOpts.map(w=>{
        const active=existing&&existing.weather===w.k?' active':'';
        return `<button type="button" class="weather-btn${active}" data-val="${w.k}" onclick="this.parentNode.querySelectorAll('.weather-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">${w.icon}<span>${t['logWeather'+w.k.charAt(0).toUpperCase()+w.k.slice(1)]||w.k}</span></button>`;
    }).join('');
    const wouldRepeatYes=existing&&existing.would_repeat===true?' active':'';
    const wouldRepeatNo=existing&&existing.would_repeat===false?' active':'';

    document.getElementById('raceModalBody').innerHTML=`
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${t.logDetails||'Detalle de carrera'}</h2>
        </div>
        <div class="race-form completion-form">
            <div class="auth-field">
                <label class="auth-label">${t.completionTimePh||'Tu tiempo'}</label>
                <input type="text" class="auth-input" id="compDetailTime" placeholder="1:45:30" value="${esc(existing?.finish_time||'')}">
            </div>
            ${cats.length?`<div class="auth-field">
                <label class="auth-label">${t.logDistLabel||'Distancia corrida'}</label>
                <div class="race-form-chips">${distChips}</div>
            </div>`:''}
            <div class="auth-field">
                <label class="auth-label">${t.logEffortLabel||'Esfuerzo percibido'} (1-5)</label>
                <div class="effort-scale">${effortBtns}</div>
            </div>
            <div class="auth-field">
                <label class="auth-label">${t.logWeatherLabel||'Clima'}</label>
                <div class="weather-select">${weatherBtns}</div>
            </div>
            <div class="auth-field">
                <label class="auth-label">${t.logWouldRepeat||'¿La repetirías?'}</label>
                <div class="repeat-toggle">
                    <button type="button" class="repeat-btn${wouldRepeatYes}" data-val="yes" onclick="this.parentNode.querySelectorAll('.repeat-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">👍 ${t.logYes||'Sí'}</button>
                    <button type="button" class="repeat-btn${wouldRepeatNo}" data-val="no" onclick="this.parentNode.querySelectorAll('.repeat-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">👎 ${t.logNo||'No'}</button>
                </div>
            </div>
            <div class="auth-field">
                <label class="auth-label">${t.logNotesLabel||'Notas personales'}</label>
                <textarea class="auth-input" id="compDetailNotes" rows="3" placeholder="...">${esc(existing?.notes||'')}</textarea>
            </div>
            <button class="auth-submit" onclick="saveEnhancedCompletion('${esc(raceId)}')">
                <span class="auth-submit-text">${t.logSave||'Guardar'}</span>
            </button>
        </div>
    `;
    openRaceModal();
}

async function saveEnhancedCompletion(raceId){
    const finishTime=document.getElementById('compDetailTime')?.value?.trim()||'';
    const distBtn=document.querySelector('.completion-form .race-form-chip.active');
    const distanceRun=distBtn?distBtn.dataset.dist:'';
    const effortBtn=document.querySelector('.completion-form .effort-btn.active');
    const effort=effortBtn?parseInt(effortBtn.dataset.val):0;
    const weatherBtn=document.querySelector('.completion-form .weather-btn.active');
    const weather=weatherBtn?weatherBtn.dataset.val:'';
    const repeatBtn=document.querySelector('.completion-form .repeat-btn.active');
    const wouldRepeat=repeatBtn?(repeatBtn.dataset.val==='yes'):null;
    const notes=document.getElementById('compDetailNotes')?.value?.trim()||'';

    // If not completed yet, mark as completed first
    if(typeof isCompleted!=='function'||!isCompleted(raceId)){
        completions[raceId]={finish_time:finishTime,distance_run:distanceRun,effort:effort,notes:notes,weather:weather,would_repeat:wouldRepeat};
        safeLS('pulz_completions',completions);
        if(sbClient)await sbClient.from('race_completions').upsert({user_id:currentUser.id,race_id:raceId,finish_time:finishTime||null,distance_run:distanceRun||null,effort:effort||null,notes:notes||null,weather:weather||null,would_repeat:wouldRepeat},{onConflict:'user_id,race_id'});
    } else {
        await saveCompletionDetails(raceId,{finish_time:finishTime,distance_run:distanceRun,effort,notes,weather,would_repeat:wouldRepeat});
    }
    closeRaceModal();
}

/* ============================================
   iCal EXPORT
   ============================================ */
function generateICS(){
    if(!currentUser||typeof favorites==='undefined')return;
    const events=[];
    for(const cid of Object.keys(R)){
        R[cid].forEach((r,idx)=>{
            const raceId=r._id||cid+'_'+idx;
            if(!favorites.includes(raceId))return;
            const c=countries.find(x=>x.id===cid);
            const dtStr=r.d.replace(/-/g,'');
            const nextDay=new Date(r.d+'T12:00:00');
            nextDay.setDate(nextDay.getDate()+1);
            const endStr=nextDay.toISOString().slice(0,10).replace(/-/g,'');
            const loc=r.l+(c?', '+c.name:'');
            const descParts=[(r.desc||r.n)+' — '+(r.c||[]).join(', ')];
            if(r.w)descParts.push(r.w);
            const desc=descParts.join('\\n');
            const uid=raceId+'@pulz.lat';
            events.push('BEGIN:VEVENT\r\nUID:'+uid+'\r\nDTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').split('.')[0]+'Z\r\nDTSTART;VALUE=DATE:'+dtStr+'\r\nDTEND;VALUE=DATE:'+endStr+'\r\nSUMMARY:'+icsEscape(r.n)+'\r\nLOCATION:'+icsEscape(loc)+'\r\nDESCRIPTION:'+icsEscape(desc)+(r.w?'\r\nURL:'+icsEscape(r.w):'')+'\r\nEND:VEVENT');
        });
    }
    if(!events.length){showToast(T[lang].seasonEmpty||'No hay carreras guardadas','info');return;}
    const cal=`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//PULZ//Temporada//ES\r\nCALSCALE:GREGORIAN\r\nX-WR-CALNAME:PULZ Temporada ${new Date().getFullYear()}\r\n${events.join('\r\n')}\r\nEND:VCALENDAR`;
    const blob=new Blob([cal],{type:'text/calendar;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=`pulz-temporada-${new Date().getFullYear()}.ics`;
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if(typeof track==='function')track('ical_export',{count:events.length});
}
function icsEscape(s){return(s||'').replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\r?\n/g,'\\n').replace(/\r/g,'\\n');}

/* ============================================
   PLACEHOLDER FUNCTIONS (post-launch)
   ============================================ */
/* ============================================
   COMPARE CHECKBOXES (Mi Temporada)
   ============================================ */
let _compareSelected=[];

function addCompareCheckboxes(){
    _compareSelected=[];
    document.querySelectorAll('.season-race').forEach(item=>{
        if(item.querySelector('.compare-check'))return;
        // Get the race info from onclick
        const onc=item.getAttribute('onclick')||'';
        const match=onc.match(/openDrawer\('([^']+)',(\d+)\)/);
        if(!match)return;
        const cid=match[1],idx=parseInt(match[2]);
        const races=R[cid]||[];
        const r=races[idx];
        if(!r)return;
        const raceId=r._id||cid+'_'+idx;
        const cb=document.createElement('input');
        cb.type='checkbox';
        cb.className='compare-check';
        cb.dataset.raceId=raceId;
        cb.dataset.country=cid;
        cb.dataset.idx=idx;
        cb.onclick=function(e){
            e.stopPropagation();
            if(this.checked){
                if(_compareSelected.length>=3){this.checked=false;return;}
                _compareSelected.push({raceId,cid,idx});
            }else{
                _compareSelected=_compareSelected.filter(x=>x.raceId!==raceId);
            }
            const btn=document.getElementById('compareBtn');
            if(btn)btn.style.display=_compareSelected.length>=2?'inline-flex':'none';
        };
        item.insertBefore(cb,item.firstChild);
    });
}

function openCompareFromSeason(){
    if(_compareSelected.length<2)return;
    const raceData=_compareSelected.map(s=>{
        const races=R[s.cid]||[];
        const r=races[s.idx];
        if(!r)return null;
        const c=countries.find(x=>x.id===s.cid);
        return{...r,_country:s.cid,_idx:s.idx,_countryName:c?c.name:''};
    }).filter(Boolean);
    if(raceData.length<2)return;
    renderComparison(raceData);
}

function renderComparison(races){
    const t=T[lang];
    const locale=lang==='pt'?'pt-BR':lang==='en'?'en-US':'es-ES';
    const cols=races.map(r=>{
        const dt=new Date(r.d+'T00:00:00');
        const dateStr=dt.toLocaleDateString(locale,{day:'numeric',month:'short',year:'numeric'});
        const fc=r._id?getFavCount(r._id):0;
        const typeLabel=r.t==='trail'?'Trail':(t.road||'Asfalto');
        return `<div class="compare-col">
            <div class="compare-name">${esc(r.n)}</div>
            <div class="compare-row"><span class="compare-label">${t.dDate||'Fecha'}</span><span class="compare-val">${dateStr}</span></div>
            <div class="compare-row"><span class="compare-label">${t.dLoc||'Ubicación'}</span><span class="compare-val">${esc(r.l)}<br><small>${esc(r._countryName)}</small></span></div>
            <div class="compare-row"><span class="compare-label">${t.dType||'Tipo'}</span><span class="compare-val">${typeLabel}</span></div>
            <div class="compare-row"><span class="compare-label">${t.dDist||'Distancias'}</span><span class="compare-val">${esc((r.c||[]).join(', '))}</span></div>
            ${r.price?`<div class="compare-row"><span class="compare-label">${t.dInsc||'Precio'}</span><span class="compare-val">${esc(r.price)}</span></div>`:''}
            ${r.elevation_gain?`<div class="compare-row"><span class="compare-label">Elevación</span><span class="compare-val">${esc(r.elevation_gain)}</span></div>`:''}
            <div class="compare-row"><span class="compare-label">${t.compareFavs||'Interesados'}</span><span class="compare-val">${fc}</span></div>
            <div class="compare-row"><span class="compare-label">${t.dWeb||'Web'}</span><span class="compare-val">${r.w?`<a href="${esc(safeUrl(r.w))}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">↗</a>`:'—'}</span></div>
            <button class="compare-choose-btn" onclick="closeRaceModal();setTimeout(()=>openDrawer('${esc(r._country)}',${r._idx}),300)">${t.compareChoose||'Elegir'}</button>
        </div>`;
    }).join('');

    document.getElementById('raceModalBody').innerHTML=`
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${t.compareTitle||'Comparar carreras'}</h2>
        </div>
        <div class="compare-grid">${cols}</div>
        <button class="auth-text-btn" onclick="openMySeason()" style="margin-top:1rem">← ${t.back||'Volver'}</button>
    `;
}

/* ============================================
   TEAM MEMBERS — Panel for team owner
   ============================================ */
async function openTeamMembers(){
    closeUserMenu();
    if(!currentUser||currentProfile?.role!=='team')return;
    const t=T[lang];
    const locale=lang==='pt'?'pt-BR':lang==='en'?'en-US':'es-ES';

    // Show loading
    document.getElementById('raceModalBody').innerHTML=`
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${t.teamMembersTitle||'Miembros del equipo'}</h2>
            <p class="auth-subtitle">${t.teamMembersSub||'Runners que se unieron a tu equipo'}</p>
        </div>
        <div class="teams-directory-loading"><span class="auth-submit-loader" style="display:block;position:static;border-top-color:var(--txt3)"></span></div>
    `;
    openRaceModal();

    const members=await loadTeamMembers();

    // Also load which of those members have favorited team races and their completions
    const memberIds=members.map(m=>m.user_id);
    const [memberFavs,memberComps]=await Promise.all([
        memberIds.length?loadMemberFavorites(memberIds):{},
        memberIds.length&&typeof loadMemberCompletions==='function'?loadMemberCompletions(memberIds):{}
    ]);

    // Team races for overlap calculation
    const teamRaceSet=new Set(typeof teamRaces!=='undefined'?teamRaces:[]);

    // Store for member profile access
    window._teamMembersData={members,memberFavs,memberComps,teamRaceSet};

    if(!members.length){
        document.getElementById('raceModalBody').innerHTML=`
            <div class="auth-header">
                <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
                <h2 class="auth-title">${t.teamMembersTitle||'Miembros del equipo'}</h2>
                <p class="auth-subtitle">${t.teamMembersSub||'Runners que se unieron a tu equipo'}</p>
            </div>
            <div class="my-races-empty empty-state-rich">
                <div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg></div>
                <div class="empty-title">${t.teamMembersEmptyTitle||'Todavía no hay miembros'}</div>
                <div class="empty-sub">${t.teamMembersEmptySub||'Compartí el link de tu equipo para que los runners se sumen y vean su progreso colectivo.'}</div>
                <button class="empty-cta" onclick="(async()=>{const url=location.origin+'/#team/'+((currentProfile&&currentProfile.id)||currentUser.id);try{await navigator.clipboard.writeText(url);if(typeof showToast==='function')showToast(T[lang].copied||'¡Copiado!','success');}catch(e){if(typeof showToast==='function')showToast(url,'info');}})()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    <span>${t.teamMembersEmptyCta||'Copiar link del equipo'}</span>
                </button>
            </div>
        `;
        return;
    }

    // Aggregate team stats
    const totalKm=members.reduce((s,m)=>s+parseFloat(m.total_km||0),0);
    const totalRaces=members.reduce((s,m)=>s+parseInt(m.races_completed||0),0);
    const activeMembers=members.filter(m=>parseInt(m.races_completed||0)>0).length;

    const teamStatsHTML=`
        <div class="team-members-summary">
            <div class="annual-stat"><div class="annual-stat-num">${members.length}</div><div class="annual-stat-label">${t.teamMembersCount||'miembros'}</div></div>
            <div class="annual-stat"><div class="annual-stat-num">${activeMembers}</div><div class="annual-stat-label">${t.teamMembersActiveRunners||'runners activos'}</div></div>
            <div class="annual-stat"><div class="annual-stat-num">${Math.round(totalKm)}K</div><div class="annual-stat-label">${t.teamMembersTotalKm||'km entre todos'}</div></div>
            <div class="annual-stat"><div class="annual-stat-num">${totalRaces}</div><div class="annual-stat-label">${t.teamMembersTotalRaces||'carreras completadas'}</div></div>
        </div>`;

    // Member list
    let listHTML='<div class="team-members-list">';
    members.forEach(m=>{
        const name=m.display_name||'Runner';
        const initial=(name[0]||'R').toUpperCase();
        const joinDate=m.joined_at?new Date(m.joined_at).toLocaleDateString(locale,{day:'numeric',month:'short'}):'';
        const racesNum=parseInt(m.races_completed||0);
        const kmNum=parseFloat(m.total_km||0);
        const effortNum=m.avg_effort?parseFloat(m.avg_effort):null;

        // Overlap: how many of their favorites match team races
        const userFavs=memberFavs[m.user_id]||[];
        const overlap=userFavs.filter(fid=>teamRaceSet.has(fid)).length;

        // Find their next upcoming race from their favorites
        let nextRaceName='';
        if(userFavs.length){
            const now=new Date();
            let nearest=null,nearestDt=null;
            for(const cid of Object.keys(R)){
                R[cid].forEach(r=>{
                    const rid=r._id||'';
                    if(userFavs.includes(rid)){
                        const dt=new Date(r.d+'T00:00:00');
                        if(dt>=now&&(!nearestDt||dt<nearestDt)){nearestDt=dt;nearest=r;}
                    }
                });
            }
            if(nearest)nextRaceName=nearest.n;
        }

        // Member trend
        const trend=typeof getMemberTrend==='function'?getMemberTrend(m):'stable';
        const trendBadge=typeof renderMemberTrendBadge==='function'?renderMemberTrendBadge(trend):'';

        // Stat pills
        let pills='';
        if(racesNum>0)pills+=`<span class="member-pill">${racesNum} ${t.teamMemberRaces||'carreras'}</span>`;
        if(kmNum>0)pills+=`<span class="member-pill">${Math.round(kmNum)}${t.teamMemberKm||'km'}</span>`;
        if(effortNum)pills+=`<span class="member-pill">⚡${effortNum}</span>`;
        pills+=trendBadge;
        if(overlap>0)pills+=`<span class="member-pill accent">${overlap} ${t.teamMembersOverlap||'en común'}</span>`;
        if(!pills)pills=`<span class="member-pill muted">${t.teamMembersNoData||'Sin actividad aún'}</span>`;

        listHTML+=`
            <div class="team-member-card" onclick="openMemberProfile('${esc(m.user_id)}')" style="cursor:pointer">
                <div class="team-member-header">
                    <div class="team-member-avatar">${initial}</div>
                    <div class="team-member-info">
                        <div class="team-member-name">${esc(name)}</div>
                        <div class="team-member-email">${esc(m.email||'')}</div>
                    </div>
                    ${joinDate?`<div class="team-member-joined">${t.teamMemberJoined||'se unió'} ${joinDate}</div>`:''}
                </div>
                <div class="team-member-pills">${pills}</div>
                ${nextRaceName?`<div class="team-member-next"><span class="member-next-label">${t.teamMemberNextRace||'Próxima'}:</span> ${esc(nextRaceName)}</div>`:''}
                <div class="member-expand-hint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><polyline points="9 18 15 12 9 6"/></svg></div>
            </div>`;
    });
    listHTML+='</div>';

    // Leaderboard
    const leaderHTML=typeof renderTeamLeaderboardHTML==='function'?renderTeamLeaderboardHTML(members):'';

    // Inactive alert
    const inactiveCount=members.filter(m=>parseInt(m.races_completed||0)===0).length;
    const inactiveAlertHTML=inactiveCount>=2?`<div class="member-inactive-alert">⚠️ ${inactiveCount} ${t.teamMemberInactiveAlert||'miembros inactivos hace +60 días'}</div>`:'';

    document.getElementById('raceModalBody').innerHTML=`
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${t.teamMembersTitle||'Miembros del equipo'}</h2>
            <p class="auth-subtitle">${members.length} ${t.teamMembersCount||'miembros'}</p>
        </div>
        ${teamStatsHTML}
        ${leaderHTML}
        ${inactiveAlertHTML}
        ${listHTML}
    `;
}

/* ============================================
   MEMBER PROFILE — Expandable member detail
   ============================================ */
function openMemberProfile(userId){
    const t=T[lang];
    const locale=lang==='pt'?'pt-BR':lang==='en'?'en-US':'es-AR';
    const data=window._teamMembersData;
    if(!data)return;
    const member=data.members.find(m=>m.user_id===userId);
    if(!member)return;

    const name=member.display_name||'Runner';
    const initial=(name[0]||'R').toUpperCase();
    const joinDate=member.joined_at?new Date(member.joined_at).toLocaleDateString(locale,{day:'numeric',month:'short',year:'numeric'}):'';
    const racesNum=parseInt(member.races_completed||0);
    const kmNum=parseFloat(member.total_km||0);
    const effortNum=member.avg_effort?parseFloat(member.avg_effort).toFixed(1):null;
    const trend=typeof getMemberTrend==='function'?getMemberTrend(member):'stable';
    const trendBadge=typeof renderMemberTrendBadge==='function'?renderMemberTrendBadge(trend):'';

    // Member completions — resolve race names
    const userComps=data.memberComps[userId]||[];
    const userFavs=data.memberFavs[userId]||[];
    const teamRaceSet=data.teamRaceSet;

    // Build completed races list with details
    const completedRaces=[];
    for(const cid of Object.keys(R)){
        R[cid].forEach((r,idx)=>{
            const rid=r._id||cid+'_'+idx;
            const comp=userComps.find(c=>c.race_id===rid);
            if(comp){
                const isTeamRace=teamRaceSet.has(rid);
                completedRaces.push({...r,_country:cid,_idx:idx,_comp:comp,_isTeamRace:isTeamRace});
            }
        });
    }
    completedRaces.sort((a,b)=>new Date(b.d+'T00:00:00')-new Date(a.d+'T00:00:00'));

    // Attendance: how many team races did this member complete
    const teamRaceIds=[...teamRaceSet];
    const teamRacesCompleted=userComps.filter(c=>teamRaceSet.has(c.race_id)).length;
    const totalTeamRaces=teamRaceIds.length;
    const attendancePct=totalTeamRaces>0?Math.round((teamRacesCompleted/totalTeamRaces)*100):0;

    // Stats section
    const statsHTML=`<div class="member-profile-stats">
        <div class="annual-stat"><div class="annual-stat-num">${racesNum}</div><div class="annual-stat-label">${t.memberProfileRaces||'Carreras completadas'}</div></div>
        <div class="annual-stat"><div class="annual-stat-num">${Math.round(kmNum)}K</div><div class="annual-stat-label">km</div></div>
        ${effortNum?`<div class="annual-stat"><div class="annual-stat-num">${effortNum}</div><div class="annual-stat-label">${t.memberProfileEffort||'Esfuerzo'}</div></div>`:''}
        ${totalTeamRaces>0?`<div class="annual-stat"><div class="annual-stat-num">${teamRacesCompleted}/${totalTeamRaces}</div><div class="annual-stat-label">${t.memberProfileAttendance||'Asistencia'}</div></div>`:''}
    </div>`;

    // Attendance bar
    let attendanceHTML='';
    if(totalTeamRaces>0){
        attendanceHTML=`<div class="member-attendance">
            <div class="member-attendance-label">${t.memberProfileAttendance||'Asistencia al equipo'}: ${attendancePct}%</div>
            <div class="member-attendance-bar"><div class="member-attendance-fill" style="width:${attendancePct}%"></div></div>
        </div>`;
    }

    // Completed races list
    let racesHTML='';
    if(completedRaces.length){
        racesHTML=`<div class="season-section-title" style="margin-top:0.8rem">${t.memberProfileRaces||'Carreras completadas'}</div>`;
        racesHTML+='<div class="member-races-list">';
        completedRaces.forEach(r=>{
            const dt=new Date(r.d+'T00:00:00');
            const dateStr=dt.toLocaleDateString(locale,{day:'numeric',month:'short'});
            const comp=r._comp;
            const timeStr=comp.finish_time||'';
            const distStr=comp.distance_run||'';
            const effortStr=comp.effort?comp.effort+'/5':'';
            const typeClass=r.t==='trail'?'type-trail':'type-road';
            const teamBadge=r._isTeamRace?'<span class="member-team-race-badge">equipo</span>':'';
            racesHTML+=`<div class="member-race-row" onclick="closeRaceModal();setTimeout(()=>openDrawer('${esc(r._country)}',${r._idx}),300)" style="cursor:pointer">
                <div class="member-race-date">${dateStr}</div>
                <div class="member-race-info">
                    <div class="member-race-name">${esc(r.n)} ${teamBadge}</div>
                    <div class="member-race-meta"><span class="${typeClass}">${r.t==='trail'?'Trail':(t.road||'Asfalto')}</span>${distStr?' · '+esc(distStr):''}${timeStr?' · '+esc(timeStr):''}${effortStr?' · '+effortStr:''}</div>
                </div>
            </div>`;
        });
        racesHTML+='</div>';
    }else{
        racesHTML=`<div class="my-races-empty" style="padding:0.8rem 0">${t.memberProfileNoRaces||'Sin carreras completadas aún'}</div>`;
    }

    // Contact button (if member has a visible contact method)
    let contactHTML='';
    if(member.team_contact||member.contact){
        const contactUrl=member.team_contact||member.contact;
        contactHTML=`<a href="${esc(safeUrl(contactUrl))}" target="_blank" rel="noopener noreferrer" class="member-contact-btn">${t.memberProfileContact||'Contactar'}</a>`;
    }

    document.getElementById('raceModalBody').innerHTML=`
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${t.memberProfileTitle||'Ficha del runner'}</h2>
        </div>
        <div class="member-profile-header">
            <div class="team-member-avatar large">${initial}</div>
            <div>
                <div class="member-profile-name">${esc(name)} ${trendBadge}</div>
                <div class="member-profile-email">${esc(member.email||'')}</div>
                ${joinDate?`<div class="member-profile-joined">${t.teamMemberJoined||'Se unió'} ${joinDate}</div>`:''}
            </div>
        </div>
        ${statsHTML}
        ${attendanceHTML}
        ${contactHTML}
        ${racesHTML}
        <button class="auth-text-btn" onclick="openTeamMembers()" style="margin-top:0.8rem">&larr; ${t.back||'Volver'}</button>
    `;
    openRaceModal();
}

function openSuggestRaceModal() {
    closeUserMenu();
    const t = T[lang];

    const distOptions = ['5K','10K','15K','21K','25K','30K','42K','50K','80K','100K','Trail','Ultra'];
    const chips = distOptions.map(d => `<button type="button" class="race-form-chip" onclick="this.classList.toggle('active')">${d}</button>`).join('');

    document.getElementById('raceModalBody').innerHTML = `
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${t.suggestTitle || 'Sugerir carrera'}</h2>
            <p class="auth-subtitle">${t.suggestSub || '¿Conocés una carrera que falta en PULZ? Contanos y la sumamos.'}</p>
        </div>
        <div id="raceError" class="auth-error"></div>
        <div class="race-form">
            <div class="auth-field">
                <label class="auth-label">${t.raceName || 'Nombre de la carrera'} *</label>
                <input type="text" class="auth-input" id="raceName" placeholder="${t.raceNamePh || 'Ej: Maratón de Buenos Aires'}">
            </div>
            <div class="race-form-row">
                <div class="auth-field">
                    <label class="auth-label">${t.raceDate || 'Fecha'}</label>
                    <input type="date" class="auth-input" id="raceDate">
                </div>
                <div class="auth-field">
                    <label class="auth-label">${t.raceType || 'Tipo'}</label>
                    <select class="auth-input auth-select" id="raceType">
                        <option value="road">${t.road || 'Asfalto'}</option>
                        <option value="trail">Trail</option>
                    </select>
                </div>
            </div>
            <div class="race-form-row">
                <div class="auth-field">
                    <label class="auth-label">${t.raceCountry || 'País'} *</label>
                    <select class="auth-input auth-select" id="raceCountry">
                        ${countries.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                </div>
                <div class="auth-field">
                    <label class="auth-label">${t.raceLocation || 'Ciudad / Ubicación'} *</label>
                    <input type="text" class="auth-input" id="raceLocation" placeholder="${t.raceLocationPh || 'Ej: Bariloche, Río Negro'}">
                </div>
            </div>
            <div class="auth-field">
                <label class="auth-label">${t.raceDist || 'Distancias'}</label>
                <div class="race-form-chips" id="raceChips">${chips}</div>
                <input type="text" class="auth-input" id="raceCustomDist" placeholder="${t.raceCustomDist || 'Otra distancia (ej: 8K, 60K)'}" style="margin-top:0.4rem">
            </div>
            <div class="auth-field">
                <label class="auth-label">${t.raceWebsite || 'Sitio web'}</label>
                <input type="url" class="auth-input" id="raceWebsite" placeholder="https://...">
            </div>
            <button class="auth-submit" id="raceSubmit" onclick="handleSuggestRace()">
                <span class="auth-submit-text">${t.suggestSubmit || 'Enviar sugerencia'}</span>
                <span class="auth-submit-loader"></span>
            </button>
        </div>
    `;
    openRaceModal();
}

async function handleSuggestRace() {
    if(!currentUser){if(typeof openAuthModal==='function')openAuthModal('login');return;}
    const t = T[lang];
    const name = document.getElementById('raceName')?.value?.trim();
    const date = document.getElementById('raceDate')?.value || null;
    const countryId = document.getElementById('raceCountry')?.value;
    const location = document.getElementById('raceLocation')?.value?.trim();
    const website = document.getElementById('raceWebsite')?.value?.trim() || null;
    const customDist = document.getElementById('raceCustomDist')?.value?.trim();

    const chips = document.querySelectorAll('#raceChips .race-form-chip.active');
    const categories = Array.from(chips).map(c => c.textContent);
    if (customDist) customDist.split(',').forEach(d => { const tr = d.trim(); if (tr) categories.push(tr); });

    if (!name) { showRaceError(t.raceErrName || 'Ingresá el nombre'); return; }
    if (!location) { showRaceError(t.raceErrLocation || 'Ingresá la ubicación'); return; }

    const btn = document.getElementById('raceSubmit');
    if (btn) btn.classList.add('loading');

    // Build notes with extra info
    const distInfo = categories.length ? categories.join(', ') : '';
    const typeVal = document.getElementById('raceType')?.value || '';
    const notes = [typeVal ? `Tipo: ${typeVal}` : '', distInfo ? `Distancias: ${distInfo}` : ''].filter(Boolean).join(' | ');

    try {
        const { error } = await sbClient.from('race_suggestions').insert({
            suggested_by: currentUser.id,
            name,
            date: date || null,
            country_id: countryId,
            location,
            website,
            notes: notes || null,
            status: 'pending'
        });

        if (btn) btn.classList.remove('loading');

        if (error) {
            showRaceError(error.message || 'Error');
            return;
        }

        closeRaceModal();
        showToast(t.suggestThanks || '¡Gracias! Tu sugerencia fue enviada.', 'success');
        if (typeof track === 'function') track('suggest_race', { name, country: countryId });
    } catch (e) {
        if (btn) btn.classList.remove('loading');
        showRaceError(t.authErrService || 'Error de conexión');
    }
}

/* ============================================
   RUNNER — BADGES / ACHIEVEMENTS
   ============================================ */
function computeBadges(){
    const badges=[];
    const completed=[];
    if(!currentUser||typeof completions==='undefined')return badges;
    // Gather completed race data
    for(const cid of Object.keys(R)){
        R[cid].forEach((r,idx)=>{
            const rid=r._id||cid+'_'+idx;
            if(completions[rid]){
                completed.push({...r,_country:cid,_rid:rid,_comp:completions[rid]});
            }
        });
    }
    const totalRaces=completed.length;
    let totalKm=0,trailCount=0,countriesSet=new Set(),hasUltra=false;
    const distsDone=new Set();
    // Track monthly activity for streak
    const monthsActive=new Set();
    completed.forEach(r=>{
        const cd=r._comp;
        const distNum=parseFloat(cd.distance_run||'');
        const maxD=(r.c||[]).reduce((m,c)=>{const n=parseFloat(c);return!isNaN(n)&&n>m?n:m;},0);
        const km=!isNaN(distNum)&&distNum>0?distNum:maxD;
        totalKm+=km;
        if(r.t==='trail')trailCount++;
        countriesSet.add(r._country);
        if(km>=10)distsDone.add('10K');
        if(km>=21)distsDone.add('21K');
        if(km>=42)distsDone.add('42K');
        if(km>42.195||r.c?.some(c=>c.toLowerCase().includes('ultra')))hasUltra=true;
        const dt=new Date(r.d+'T00:00:00');
        monthsActive.add(dt.getFullYear()+'-'+dt.getMonth());
    });
    // Check for 3-month streak
    let hasStreak=false;
    const now=new Date();
    for(let i=0;i<10;i++){
        const d=new Date(now.getFullYear(),now.getMonth()-i,1);
        const k1=d.getFullYear()+'-'+d.getMonth();
        const d2=new Date(d.getFullYear(),d.getMonth()-1,1);
        const k2=d2.getFullYear()+'-'+d2.getMonth();
        const d3=new Date(d2.getFullYear(),d2.getMonth()-1,1);
        const k3=d3.getFullYear()+'-'+d3.getMonth();
        if(monthsActive.has(k1)&&monthsActive.has(k2)&&monthsActive.has(k3)){hasStreak=true;break;}
    }
    const intlCountries=countriesSet.size;
    const defs=[
        {id:'firstRace',icon:'🏅',test:totalRaces>=1},
        {id:'firstTrail',icon:'🌲',test:trailCount>=1},
        {id:'firstIntl',icon:'🌎',test:intlCountries>=2},
        {id:'first10K',icon:'🔟',test:distsDone.has('10K')},
        {id:'first21K',icon:'🏃',test:distsDone.has('21K')},
        {id:'first42K',icon:'🎖️',test:distsDone.has('42K')},
        {id:'firstUltra',icon:'⚡',test:hasUltra},
        {id:'100km',icon:'💯',test:totalKm>=100},
        {id:'500km',icon:'🔥',test:totalKm>=500},
        {id:'1000km',icon:'👑',test:totalKm>=1000},
        {id:'2Countries',icon:'🗺️',test:intlCountries>=3},
        {id:'3Countries',icon:'✈️',test:intlCountries>=3},
        {id:'6Countries',icon:'🌍',test:intlCountries>=6},
        {id:'streak3',icon:'📆',test:hasStreak}
    ];
    defs.forEach(d=>{
        const t=T[lang];
        badges.push({id:d.id,icon:d.icon,name:t['badge'+d.id.charAt(0).toUpperCase()+d.id.slice(1)]||d.id,unlocked:d.test});
    });
    return badges;
}

function renderBadgesHTML(){
    const t=T[lang];
    const badges=computeBadges();
    if(!badges.length)return'';
    const unlocked=badges.filter(b=>b.unlocked).length;
    if(!unlocked)return'';
    let html=`<div class="badges-section">
        <div class="season-section-title">${t.badgesTitle||'Logros'} <span class="badge-count">${unlocked}/${badges.length} ${t.badgesUnlocked||'desbloqueados'}</span></div>
        <div class="badges-grid">`;
    badges.forEach(b=>{
        html+=`<div class="badge-item ${b.unlocked?'unlocked':'locked'}">
            <div class="badge-icon">${b.icon}</div>
            <div class="badge-name">${b.name}</div>
        </div>`;
    });
    html+='</div></div>';
    return html;
}

/* ============================================
   RUNNER — TIME PREDICTOR (Riegel Formula)
   ============================================ */
function renderPredictorHTML(){
    const t=T[lang];
    if(!currentUser||typeof completions==='undefined')return'';
    // Find best completion with time
    let bestDist=0,bestTimeSec=0,bestRaceName='';
    for(const cid of Object.keys(R)){
        R[cid].forEach((r,idx)=>{
            const rid=r._id||cid+'_'+idx;
            const cd=completions[rid];
            if(!cd||!cd.finish_time)return;
            const sec=parseTimeToSeconds(cd.finish_time);
            if(!sec)return;
            const distNum=parseFloat(cd.distance_run||'');
            const maxD=(r.c||[]).reduce((m,c)=>{const n=parseFloat(c);return!isNaN(n)&&n>m?n:m;},0);
            const km=!isNaN(distNum)&&distNum>0?distNum:maxD;
            if(km>bestDist){bestDist=km;bestTimeSec=sec;bestRaceName=r.n;}
        });
    }
    if(!bestDist||!bestTimeSec)return'';
    const targets=[5,10,15,21.1,42.195,50,80,100].filter(d=>Math.abs(d-bestDist)>1);
    let html=`<div class="predictor-section"><div class="season-section-title">${t.predictorTitle||'Predictor de tiempos'}</div>
        <div class="predictor-note">${t.predictorFrom||'Basado en'}: ${esc(bestRaceName)} (${bestDist}K — ${formatSeconds(bestTimeSec)})</div>
        <div class="predictor-grid">`;
    targets.forEach(d=>{
        const predicted=bestTimeSec*Math.pow(d/bestDist,1.06);
        const label=d===21.1?'21K':d===42.195?'42K':d+'K';
        html+=`<div class="predictor-card"><div class="predictor-dist">${label}</div><div class="predictor-time">${formatSeconds(Math.round(predicted))}</div></div>`;
    });
    html+='</div></div>';
    return html;
}

function parseTimeToSeconds(t){
    if(!t)return 0;
    const parts=t.replace(/\s/g,'').split(':').map(Number);
    if(parts.length===3)return parts[0]*3600+parts[1]*60+(parts[2]||0);
    if(parts.length===2)return parts[0]*60+parts[1];
    if(parts.length===1&&!isNaN(parts[0]))return parts[0]*60;
    return 0;
}

function formatSeconds(s){
    const h=Math.floor(s/3600);
    const m=Math.floor((s%3600)/60);
    const sec=Math.floor(s%60);
    if(h>0)return h+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0');
    return m+':'+String(sec).padStart(2,'0');
}

/* ============================================
   RUNNER — TRENDS (CSS-only charts)
   ============================================ */
function renderTrendsHTML(){
    const t=T[lang];
    if(!currentUser||typeof completions==='undefined')return'';
    const completed=[];
    for(const cid of Object.keys(R)){
        R[cid].forEach((r,idx)=>{
            const rid=r._id||cid+'_'+idx;
            if(completions[rid])completed.push({...r,_comp:completions[rid]});
        });
    }
    if(completed.length<2)return'';
    // Group by month
    const monthData={};
    const mn=(T[lang].monthNames||['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']);
    completed.forEach(r=>{
        const dt=new Date(r.d+'T00:00:00');
        const key=dt.getFullYear()+'-'+String(dt.getMonth()).padStart(2,'0');
        if(!monthData[key])monthData[key]={label:mn[dt.getMonth()]?.substring(0,3)||'',km:0,effort:[],trail:0,road:0};
        const cd=r._comp;
        const distNum=parseFloat(cd.distance_run||'');
        const maxD=(r.c||[]).reduce((m,c)=>{const n=parseFloat(c);return!isNaN(n)&&n>m?n:m;},0);
        monthData[key].km+=(!isNaN(distNum)&&distNum>0)?distNum:maxD;
        if(cd.effort>0)monthData[key].effort.push(cd.effort);
        if(r.t==='trail')monthData[key].trail++;else monthData[key].road++;
    });
    const sortedKeys=Object.keys(monthData).sort().slice(-6);
    if(sortedKeys.length<2)return'';
    // Km chart
    const maxKm=Math.max(...sortedKeys.map(k=>monthData[k].km),1);
    let kmBars='';
    sortedKeys.forEach(k=>{
        const d=monthData[k];
        const h=Math.max(2,Math.round((d.km/maxKm)*70));
        kmBars+=`<div class="trend-bar-wrap"><div class="trend-bar-val">${Math.round(d.km)}</div><div class="trend-bar" style="height:${h}px"></div><div class="trend-bar-label">${d.label}</div></div>`;
    });
    // Effort chart
    const maxEff=5;
    let effBars='';
    sortedKeys.forEach(k=>{
        const d=monthData[k];
        const avg=d.effort.length?(d.effort.reduce((a,b)=>a+b,0)/d.effort.length):0;
        const h=Math.max(2,Math.round((avg/maxEff)*70));
        effBars+=`<div class="trend-bar-wrap"><div class="trend-bar-val">${avg?avg.toFixed(1):'—'}</div><div class="trend-bar" style="height:${h}px;background:var(--trail)"></div><div class="trend-bar-label">${d.label}</div></div>`;
    });
    // Trail vs Road
    const totalTrail=Object.values(monthData).reduce((s,d)=>s+d.trail,0);
    const totalRoad=Object.values(monthData).reduce((s,d)=>s+d.road,0);
    const total=totalTrail+totalRoad||1;
    const trailPct=Math.round((totalTrail/total)*100);
    const roadPct=100-trailPct;

    return `<div class="trends-section">
        <div class="season-section-title">${t.trendsTitle||'Tendencias'}</div>
        <div class="trend-chart"><div class="trend-label">${t.trendsKm||'Km por mes'}</div><div class="trend-bars">${kmBars}</div></div>
        <div class="trend-chart"><div class="trend-label">${t.trendsEffort||'Esfuerzo por mes'}</div><div class="trend-bars">${effBars}</div></div>
        <div class="trend-chart"><div class="trend-label">${t.trendsType||'Trail vs Asfalto'}</div>
            <div class="trend-donut"><div class="trend-donut-bar"><div class="trend-donut-seg trail" style="width:${trailPct}%"></div><div class="trend-donut-seg road" style="width:${roadPct}%"></div></div></div>
            <div class="trend-donut-labels"><span><span class="trend-donut-dot" style="background:var(--trail)"></span>Trail ${trailPct}%</span><span><span class="trend-donut-dot" style="background:var(--short)"></span>${t.road||'Asfalto'} ${roadPct}%</span></div>
        </div>
    </div>`;
}

/* ============================================
   RUNNER — SMART PLANNER (Conflicts & Gaps)
   ============================================ */
function renderPlannerWarningsHTML(){
    const t=T[lang];
    if(!currentUser||typeof favorites==='undefined')return'';
    const now=new Date();
    const upcoming=[];
    for(const cid of Object.keys(R)){
        R[cid].forEach((r,idx)=>{
            const rid=r._id||cid+'_'+idx;
            if(favorites.includes(rid)){
                const dt=new Date(r.d+'T00:00:00');
                if(dt>=now)upcoming.push({...r,_dt:dt,_country:cid});
            }
        });
    }
    upcoming.sort((a,b)=>a._dt-b._dt);
    if(!upcoming.length)return'';
    const warnings=[];
    // Check conflicts (< 14 days apart)
    for(let i=0;i<upcoming.length-1;i++){
        const diff=Math.ceil((upcoming[i+1]._dt-upcoming[i]._dt)/(1000*60*60*24));
        if(diff<14&&diff>=0){
            warnings.push({type:'conflict',text:`<strong>⚠️ ${t.plannerConflict||'Conflicto'}</strong> ${esc(upcoming[i].n)} → ${esc(upcoming[i+1].n)} (${diff} ${t.dDays||'días'}). ${t.plannerRecovery||'Considerá tu recuperación.'}`});
        }
    }
    // Check gap months
    const mn=(T[lang].monthNames||['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']);
    const monthsWithRaces=new Set(upcoming.map(r=>r._dt.getMonth()));
    for(let m=now.getMonth();m<12;m++){
        if(!monthsWithRaces.has(m)){
            warnings.push({type:'gap',text:`<strong>📅 ${t.plannerGapMonth||'Sin carreras en'} ${mn[m]}</strong> ${t.plannerGapHint||'Explorá opciones'}`});
        }
    }
    if(!warnings.length)return'';
    let html='<div class="planner-warnings">';
    warnings.forEach(w=>{
        html+=`<div class="planner-warning ${w.type}"><div class="planner-warning-text">${w.text}</div></div>`;
    });
    html+='</div>';
    return html;
}

/* ============================================
   ORGANIZER — ANALYTICS DASHBOARD
   ============================================ */
function renderOrgAnalyticsHTML(myRaces){
    const t=T[lang];
    if(!myRaces.length)return'';
    const totalFavs=myRaces.reduce((s,r)=>s+(r._id&&typeof getFavCount==='function'?getFavCount(r._id):0),0);
    const totalClicks=myRaces.reduce((s,r)=>s+(r._id?getClickCount(r._id):0),0);
    const convRate=totalFavs>0?((totalClicks/totalFavs)*100).toFixed(1):0;
    // Distance popularity
    const distCount={};
    myRaces.forEach(r=>{
        (r.c||[]).forEach(c=>{
            const key=c.toUpperCase();
            distCount[key]=(distCount[key]||0)+1;
        });
    });
    const topDists=Object.entries(distCount).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const maxDistCount=topDists.length?topDists[0][1]:1;
    let distBarsHTML='';
    topDists.forEach(([name,count])=>{
        const w=Math.max(10,Math.round((count/maxDistCount)*100));
        distBarsHTML+=`<div style="display:flex;align-items:center;gap:0.4rem;font-size:0.7rem"><span style="width:40px;font-family:'JetBrains Mono',monospace;font-size:0.6rem;text-align:right">${esc(name)}</span><div style="flex:1;height:6px;background:var(--brd);border-radius:3px;overflow:hidden"><div style="width:${w}%;height:100%;background:var(--pulse);border-radius:3px"></div></div><span style="font-size:0.6rem;color:var(--txt3)">${count}</span></div>`;
    });

    return `<div class="org-analytics">
        <div class="season-section-title">${t.orgAnalyticsTitle||'Analytics'}</div>
        <div class="org-metrics-row">
            <div class="org-metric-card"><div class="org-metric-label">${t.orgConversion||'Conversión'}</div><div class="org-metric-val">${convRate}%</div><div class="org-metric-sub">${totalClicks} clicks / ${totalFavs} interesados</div></div>
            <div class="org-metric-card"><div class="org-metric-label">${t.orgTrend||'Tendencia'}</div><div class="org-metric-val">${totalFavs}</div><div class="org-metric-sub">${t.runnersInterested||'runners interesados'}</div></div>
        </div>
        ${topDists.length?`<div class="org-metric-card"><div class="org-metric-label">${t.orgTopDist||'Distancias populares'}</div><div style="display:flex;flex-direction:column;gap:0.3rem;margin-top:0.3rem">${distBarsHTML}</div></div>`:''}
    </div>`;
}

/* ============================================
   ORGANIZER — SEND NOTICE TO RUNNERS
   ============================================ */
let _raceNotices={};
function openOrgNoticeModal(raceId,raceName){
    const t=T[lang];
    const notices=_raceNotices[raceId]||[];
    const remaining=2-notices.length;
    if(remaining<=0){showToast(t.orgNoticeLimit||'Máximo 2 avisos por carrera','info');return;}
    document.getElementById('raceModalBody').innerHTML=`
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${t.orgNoticeTitle||'Enviar aviso'}</h2>
            <p class="auth-subtitle">${esc(raceName)}</p>
        </div>
        <p style="font-size:0.75rem;color:var(--txt3);margin-bottom:0.5rem">${t.orgNoticeSub||'Los runners que guardaron esta carrera verán tu mensaje'}</p>
        <div class="org-notice-form">
            <textarea class="auth-input" id="orgNoticeText" rows="3" maxlength="280" placeholder="${t.orgNoticePh||'Ej: ¡Últimos cupos!'}">${''}</textarea>
            <div class="org-notice-remaining">${remaining} ${t.orgNoticeRemaining||'avisos restantes'}</div>
            <button class="auth-submit" onclick="sendOrgNotice('${esc(raceId)}')">
                <span class="auth-submit-text">${t.orgNoticeSend||'Enviar'}</span>
            </button>
        </div>
        <button class="auth-text-btn" onclick="openMyRaces()" style="margin-top:0.5rem">← ${t.back||'Volver'}</button>
    `;
    openRaceModal();
}

async function sendOrgNotice(raceId){
    const text=document.getElementById('orgNoticeText')?.value?.trim();
    if(!text)return;
    const t=T[lang];
    if(!_raceNotices[raceId])_raceNotices[raceId]=[];
    if(_raceNotices[raceId].length>=2){showToast(t.orgNoticeLimit||'Máximo 2 avisos por carrera','error');return;}
    _raceNotices[raceId].push({message:text,created_at:new Date().toISOString()});
    safeLS('pulz_race_notices',_raceNotices);
    // Store in Supabase if available
    if(sbClient&&currentUser){
        await sbClient.from('race_notifications').insert({race_id:raceId,organizer_id:currentUser.id,message:text}).catch(()=>{});
    }
    showToast(t.orgNoticeSent||'Aviso enviado','success');
    openMyRaces();
}

// Load notices on init
function loadRaceNotices(){
    try{const d=JSON.parse(localStorage.getItem('pulz_race_notices'));if(d)_raceNotices=d;}catch(e){}
}
loadRaceNotices();

/* ============================================
   ORGANIZER — ENHANCED RESULTS TABLE
   ============================================ */
function renderResultsTable(resultsText){
    if(!resultsText)return'';
    const t=T[lang];
    const lines=resultsText.split('\n').filter(l=>l.trim());
    if(!lines.length)return'';
    const rows=[];
    lines.forEach(line=>{
        const parts=line.split(/[,;\t]+/).map(s=>s.trim());
        if(parts.length>=2)rows.push({pos:parts[0],name:parts[1],time:parts[2]||''});
    });
    if(!rows.length)return'';
    // Calc stats
    const times=rows.map(r=>parseTimeToSeconds(r.time)).filter(s=>s>0);
    const avgTime=times.length?times.reduce((a,b)=>a+b,0)/times.length:0;
    const bestTime=times.length?Math.min(...times):0;
    let html=`<div class="results-summary"><span>${rows.length} ${t.orgResultsFinishers||'finishers'}</span>`;
    if(avgTime)html+=`<span>${t.orgResultsAvg||'Promedio'}: ${formatSeconds(Math.round(avgTime))}</span>`;
    if(bestTime)html+=`<span>${t.orgResultsBest||'Mejor'}: ${formatSeconds(bestTime)}</span>`;
    html+=`</div><table class="results-table"><thead><tr><th>#</th><th>${t.resultName||'Nombre'}</th><th>${t.resultTime||'Tiempo'}</th></tr></thead><tbody>`;
    rows.slice(0,50).forEach(r=>{
        html+=`<tr><td>${esc(r.pos)}</td><td>${esc(r.name)}</td><td>${esc(r.time)}</td></tr>`;
    });
    html+='</tbody></table>';
    return html;
}

/* ============================================
   ORGANIZER — MEDIA KIT (Canvas Generator)
   ============================================ */
function openOrgKit(raceId,countryId){
    const t=T[lang];
    const race=(R[countryId]||[]).find(r=>r._id===raceId);
    if(!race)return;
    const country=countries.find(c=>c.id===countryId);
    const dt=new Date(race.d+'T00:00:00');
    const locale=lang==='pt'?'pt-BR':lang==='en'?'en-US':'es-AR';
    const dateStr=dt.toLocaleDateString(locale,{day:'numeric',month:'long',year:'numeric'});

    document.getElementById('raceModalBody').innerHTML=`
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${t.orgKitTitle||'Kit de difusión'}</h2>
            <p class="auth-subtitle">${esc(race.n)}</p>
        </div>
        <div class="kit-preview">
            <div class="kit-card">
                <div style="font-size:0.7rem;font-weight:600;margin-bottom:0.5rem">${t.orgKitStory||'Story'}</div>
                <canvas id="kitStory" width="270" height="480"></canvas>
                <button class="kit-download-btn" onclick="downloadKit('kitStory','${esc(race.n)}-story')">${t.orgKitDownload||'Descargar'}</button>
            </div>
            <div class="kit-card">
                <div style="font-size:0.7rem;font-weight:600;margin-bottom:0.5rem">${t.orgKitFeed||'Feed'}</div>
                <canvas id="kitFeed" width="270" height="270"></canvas>
                <button class="kit-download-btn" onclick="downloadKit('kitFeed','${esc(race.n)}-feed')">${t.orgKitDownload||'Descargar'}</button>
            </div>
        </div>
        <button class="auth-text-btn" onclick="openMyRaces()" style="margin-top:0.8rem">← ${t.back||'Volver'}</button>
    `;
    openRaceModal();
    // Draw canvases after modal renders
    setTimeout(()=>{
        drawKitCanvas('kitStory',1080,1920,race,dateStr,country);
        drawKitCanvas('kitFeed',1080,1080,race,dateStr,country);
    },100);
}

function drawKitCanvas(canvasId,w,h,race,dateStr,country){
    const canvas=document.getElementById(canvasId);
    if(!canvas)return;
    canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext('2d');
    // Background
    const isTrail=race.t==='trail';
    const grad=ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,isTrail?'#0a1a0a':'#0a0a1a');
    grad.addColorStop(1,isTrail?'#1a2a1a':'#0a0a0c');
    ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
    // PULZ branding
    ctx.fillStyle='#DEFF00';
    ctx.font='bold '+Math.round(w*0.04)+'px Inter,Arial,sans-serif';
    ctx.fillText('PULZ',w*0.06,h*0.06);
    // Race name
    ctx.fillStyle='#ffffff';
    ctx.font='bold '+Math.round(w*0.065)+'px Inter,Arial,sans-serif';
    const nameY=h*0.35;
    wrapText(ctx,race.n,w*0.06,nameY,w*0.88,Math.round(w*0.08));
    // Date
    ctx.fillStyle='#DEFF00';
    ctx.font='bold '+Math.round(w*0.035)+'px Inter,Arial,sans-serif';
    ctx.fillText(dateStr,w*0.06,h*0.55);
    // Location
    ctx.fillStyle='rgba(255,255,255,0.7)';
    ctx.font=Math.round(w*0.03)+'px Inter,Arial,sans-serif';
    ctx.fillText(race.l+(country?', '+country.name:''),w*0.06,h*0.6);
    // Distances
    ctx.fillStyle='rgba(255,255,255,0.5)';
    ctx.font=Math.round(w*0.028)+'px Inter,Arial,sans-serif';
    ctx.fillText((race.c||[]).join(' · '),w*0.06,h*0.66);
    // Type badge
    ctx.fillStyle=isTrail?'rgba(0,230,118,0.15)':'rgba(56,189,248,0.15)';
    const typeText=isTrail?'TRAIL':'ROAD';
    ctx.font='bold '+Math.round(w*0.025)+'px Inter,Arial,sans-serif';
    const tw=ctx.measureText(typeText).width+w*0.04;
    const bx=w*0.06,by=h*0.7;
    roundRect(ctx,bx,by,tw,w*0.04,w*0.01);ctx.fill();
    ctx.fillStyle=isTrail?'#00E676':'#38BDF8';
    ctx.fillText(typeText,bx+w*0.02,by+w*0.03);
    // Footer
    ctx.fillStyle='rgba(255,255,255,0.3)';
    ctx.font=Math.round(w*0.02)+'px Inter,Arial,sans-serif';
    ctx.fillText('pulz.lat',w*0.06,h*0.94);
    // Scale canvas display
    canvas.style.width='100%';canvas.style.height='auto';
}

function wrapText(ctx,text,x,y,maxW,lineH){
    const words=text.split(' ');
    let line='';
    for(const word of words){
        const test=line+(line?' ':'')+word;
        if(ctx.measureText(test).width>maxW&&line){
            ctx.fillText(line,x,y);y+=lineH;line=word;
        }else{line=test;}
    }
    ctx.fillText(line,x,y);
}

function roundRect(ctx,x,y,w,h,r){
    ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
}

function downloadKit(canvasId,filename){
    const canvas=document.getElementById(canvasId);
    if(!canvas)return;
    const a=document.createElement('a');
    a.download=(filename||'pulz-kit')+'.png';
    a.href=canvas.toDataURL('image/png');
    document.body.appendChild(a);a.click();document.body.removeChild(a);
}

/* ============================================
   PULZ REPLAY — Season Summary Image
   ============================================ */
function openPulzReplay(){
    if(!currentUser)return;
    const t=T[lang];
    const now=new Date();

    // Gather season data
    const favRaces=[];
    if(typeof favorites!=='undefined'){
        for(const cid of Object.keys(R)){
            (R[cid]||[]).forEach((r,idx)=>{
                const rid=r._id||cid+'_'+idx;
                if(favorites.includes(rid))favRaces.push({...r,_cid:cid,_idx:idx,_rid:rid});
            });
        }
    }

    // Completions
    const compMap=typeof completions!=='undefined'?completions:{};
    const compIds=Object.keys(compMap);
    const completedRaces=favRaces.filter(r=>compIds.includes(r._rid));

    // Stats
    const totalRaces=favRaces.length;
    const totalCompleted=completedRaces.length;
    const countriesSet=new Set(favRaces.map(r=>r._cid));
    const totalCountries=countriesSet.size;

    // Km: prefer completion data, fallback to max distance per race
    let totalKm=0;
    const kmSource=completedRaces.length?completedRaces:favRaces;
    kmSource.forEach(r=>{
        const cd=compMap[r._rid];
        if(cd&&cd.distance_run){const n=parseFloat(cd.distance_run);if(!isNaN(n)){totalKm+=n;return;}}
        const maxD=(r.c||[]).reduce((m,c)=>{const n=parseFloat(c);return!isNaN(n)&&n>m?n:m;},0);
        totalKm+=maxD;
    });

    // Best time
    let bestTime='';let bestDist='';let bestSec=Infinity;
    compIds.forEach(rid=>{
        const cd=compMap[rid];
        if(cd&&cd.finish_time){
            const sec=parseTimeToSeconds(cd.finish_time);
            if(sec>0&&sec<bestSec){bestSec=sec;bestTime=cd.finish_time;bestDist=cd.distance_run||'';}
        }
    });

    // Trail vs road
    let trailCount=0,roadCount=0;
    favRaces.forEach(r=>{if(r.t==='trail')trailCount++;else roadCount++;});
    const prefType=trailCount>roadCount?'Trail':'Road';
    const trailPct=totalRaces?Math.round(trailCount/totalRaces*100):0;

    // Badges count
    const badges=typeof computeBadges==='function'?computeBadges():[];
    const unlockedBadges=badges.filter(b=>b.unlocked).length;

    // Runner name
    const displayName=currentProfile?.display_name||currentUser.email?.split('@')[0]||'Runner';
    const username=currentProfile?.username||'';

    const replayData={totalRaces,totalCompleted,totalCountries,totalKm:Math.round(totalKm),trailPct,prefType,bestTime,bestDist,unlockedBadges,displayName,username,year:now.getFullYear()};

    document.getElementById('raceModalBody').innerHTML=`
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${t.replayTitle||'Tu Replay'}</h2>
            <p class="auth-subtitle">${t.replaySub||'Tu temporada en una imagen'}</p>
        </div>
        <div class="replay-preview">
            <canvas id="replayStory" width="270" height="480"></canvas>
        </div>
        <div class="replay-formats">
            <button class="replay-format-btn active" onclick="switchReplayFormat('story',this)">${t.replayStory||'Story'} 9:16</button>
            <button class="replay-format-btn" onclick="switchReplayFormat('feed',this)">${t.replayFeed||'Feed'} 1:1</button>
        </div>
        <button class="auth-submit" onclick="downloadKit('replayStory','pulz-replay-${now.getFullYear()}')">
            <span class="auth-submit-text">${t.replayDownload||'Descargar imagen'}</span>
        </button>
        <button class="auth-text-btn" onclick="openMySeason()" style="margin-top:0.5rem">&larr; ${t.back||'Volver'}</button>
    `;
    openRaceModal();

    setTimeout(()=>drawReplayCanvas('replayStory',1080,1920,replayData),50);
    window._replayData=replayData;
}

function switchReplayFormat(format,btn){
    const preview=document.querySelector('.replay-preview');
    if(!preview)return;
    // Update active button
    document.querySelectorAll('.replay-format-btn').forEach(b=>b.classList.remove('active'));
    if(btn)btn.classList.add('active');

    const data=window._replayData;
    if(!data)return;
    const t=T[lang];
    const year=data.year||new Date().getFullYear();

    if(format==='feed'){
        preview.innerHTML='<canvas id="replayFeed" width="270" height="270"></canvas>';
        setTimeout(()=>drawReplayCanvas('replayFeed',1080,1080,data),50);
        // Update download button
        const dlBtn=document.querySelector('.auth-submit');
        if(dlBtn)dlBtn.setAttribute('onclick',`downloadKit('replayFeed','pulz-replay-feed-${year}')`);
    }else{
        preview.innerHTML='<canvas id="replayStory" width="270" height="480"></canvas>';
        setTimeout(()=>drawReplayCanvas('replayStory',1080,1920,data),50);
        const dlBtn=document.querySelector('.auth-submit');
        if(dlBtn)dlBtn.setAttribute('onclick',`downloadKit('replayStory','pulz-replay-${year}')`);
    }
}

function drawReplayCanvas(canvasId,w,h,data){
    const canvas=document.getElementById(canvasId);
    if(!canvas)return;
    canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext('2d');
    const isStory=h>w;

    // Background gradient
    const grad=ctx.createLinearGradient(0,0,w*0.3,h);
    grad.addColorStop(0,'#0a0a0c');
    grad.addColorStop(0.5,'#0d0d12');
    grad.addColorStop(1,'#0a0a0c');
    ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);

    // Subtle grid pattern
    ctx.strokeStyle='rgba(222,255,0,0.03)';
    ctx.lineWidth=1;
    const gridSize=w*0.05;
    for(let x=0;x<w;x+=gridSize){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
    for(let y=0;y<h;y+=gridSize){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}

    // Accent glow circle
    const glowGrad=ctx.createRadialGradient(w*0.7,h*0.2,0,w*0.7,h*0.2,w*0.5);
    glowGrad.addColorStop(0,'rgba(222,255,0,0.08)');
    glowGrad.addColorStop(1,'rgba(222,255,0,0)');
    ctx.fillStyle=glowGrad;ctx.fillRect(0,0,w,h);

    const accent='#DEFF00';
    const white='#ffffff';
    const dim='rgba(255,255,255,0.5)';
    const pad=w*0.08;

    // PULZ logo top left
    ctx.fillStyle=accent;
    ctx.font='bold '+Math.round(w*0.04)+'px "Bebas Neue",Impact,Arial,sans-serif';
    ctx.letterSpacing='2px';
    ctx.fillText('PULZ',pad,isStory?h*0.05:h*0.08);

    // Year top right
    ctx.fillStyle=dim;
    ctx.font=Math.round(w*0.035)+'px "JetBrains Mono",monospace';
    ctx.textAlign='right';
    ctx.fillText(data.year.toString(),w-pad,isStory?h*0.05:h*0.08);
    ctx.textAlign='left';

    // "REPLAY" label
    ctx.fillStyle=accent;
    ctx.font='bold '+Math.round(w*0.025)+'px Inter,Arial,sans-serif';
    const replayLabelY=isStory?h*0.1:h*0.16;
    ctx.fillText('REPLAY',pad,replayLabelY);

    // Runner name
    ctx.fillStyle=white;
    ctx.font='bold '+Math.round(w*(isStory?0.07:0.065))+'px Inter,Arial,sans-serif';
    const nameY=isStory?h*0.16:h*0.26;
    wrapText(ctx,data.displayName.toUpperCase(),pad,nameY,w-pad*2,Math.round(w*0.08));

    if(data.username){
        ctx.fillStyle=dim;
        ctx.font=Math.round(w*0.025)+'px "JetBrains Mono",monospace';
        ctx.fillText('@'+data.username,pad,nameY+w*0.05);
    }

    // Main stats — big numbers
    const statsStartY=isStory?h*0.3:h*0.42;
    const statGap=isStory?h*0.1:h*0.13;

    // Stat: Total Km
    drawReplayStat(ctx,pad,statsStartY,w,data.totalKm.toString(),'KM',accent,isStory);

    // Stat: Races
    drawReplayStat(ctx,w*0.4,statsStartY,w,data.totalCompleted.toString()+'/'+data.totalRaces.toString(),lang==='en'?'RACES':'CARRERAS',white,isStory);

    // Stat: Countries
    if(data.totalCountries>1){
        drawReplayStat(ctx,w*0.7,statsStartY,w,data.totalCountries.toString(),lang==='en'?'COUNTRIES':lang==='pt'?'PAISES':'PAISES',white,isStory);
    }

    // Trail/Road bar
    const barY=statsStartY+statGap;
    const barW=w-pad*2;
    const barH=w*0.025;
    // Background bar
    roundRect(ctx,pad,barY,barW,barH,barH/2);
    ctx.fillStyle='rgba(255,255,255,0.1)';ctx.fill();
    // Trail portion
    if(data.trailPct>0){
        const trailW=Math.max(barH,barW*(data.trailPct/100));
        roundRect(ctx,pad,barY,trailW,barH,barH/2);
        ctx.fillStyle='#00E676';ctx.fill();
    }
    // Road portion (remaining)
    if(data.trailPct<100){
        const roadX=pad+barW*(data.trailPct/100);
        const roadW=Math.max(barH,barW*((100-data.trailPct)/100));
        roundRect(ctx,roadX,barY,roadW,barH,barH/2);
        ctx.fillStyle='#38BDF8';ctx.fill();
    }
    // Labels
    ctx.font=Math.round(w*0.02)+'px Inter,Arial,sans-serif';
    ctx.fillStyle='#00E676';
    ctx.fillText('Trail '+data.trailPct+'%',pad,barY+barH+w*0.035);
    ctx.fillStyle='#38BDF8';
    ctx.textAlign='right';
    ctx.fillText('Road '+(100-data.trailPct)+'%',w-pad,barY+barH+w*0.035);
    ctx.textAlign='left';

    // Best time (if available)
    const extraY=barY+barH+w*0.08;
    if(data.bestTime){
        ctx.fillStyle=dim;
        ctx.font=Math.round(w*0.02)+'px Inter,Arial,sans-serif';
        ctx.fillText(lang==='en'?'BEST TIME':'MEJOR TIEMPO',pad,extraY);
        ctx.fillStyle=accent;
        ctx.font='bold '+Math.round(w*0.04)+'px "JetBrains Mono",monospace';
        ctx.fillText(data.bestTime+(data.bestDist?' ('+data.bestDist+')':''),pad,extraY+w*0.055);
    }

    // Badges
    if(data.unlockedBadges>0){
        const badgeY=data.bestTime?extraY+w*0.1:extraY;
        ctx.fillStyle=dim;
        ctx.font=Math.round(w*0.02)+'px Inter,Arial,sans-serif';
        ctx.fillText('BADGES',pad,badgeY);
        ctx.fillStyle=accent;
        ctx.font='bold '+Math.round(w*0.045)+'px Inter,Arial,sans-serif';
        ctx.fillText(data.unlockedBadges.toString(),pad,badgeY+w*0.06);
        ctx.fillStyle=dim;
        ctx.font=Math.round(w*0.025)+'px Inter,Arial,sans-serif';
        const bw=ctx.measureText(data.unlockedBadges.toString()).width;
        ctx.fillText(' '+(lang==='en'?'unlocked':'desbloqueados'),pad+bw,badgeY+w*0.06);
    }

    // Footer
    ctx.fillStyle=accent;
    ctx.font='bold '+Math.round(w*0.03)+'px "Bebas Neue",Impact,Arial,sans-serif';
    const footY=isStory?h*0.92:h*0.88;
    ctx.fillText('PULZ',pad,footY);
    ctx.fillStyle=dim;
    ctx.font=Math.round(w*0.018)+'px Inter,Arial,sans-serif';
    ctx.fillText('pulz.lat'+(data.username?' · pulz.lat/#runner/'+data.username:''),pad,footY+w*0.03);

    // Decorative accent line
    ctx.fillStyle=accent;
    ctx.fillRect(pad,footY-w*0.02,w*0.12,2);

    // Scale display
    canvas.style.width='100%';canvas.style.height='auto';
}

function drawReplayStat(ctx,x,y,w,value,label,color,isStory){
    ctx.fillStyle=color;
    ctx.font='bold '+Math.round(w*(isStory?0.06:0.055))+'px "JetBrains Mono",monospace';
    ctx.fillText(value,x,y);
    ctx.fillStyle='rgba(255,255,255,0.4)';
    ctx.font=Math.round(w*0.018)+'px Inter,Arial,sans-serif';
    ctx.fillText(label,x,y+w*0.03);
}

/* ============================================
   PULZ PASSPORT — Runner Travel Map
   ============================================ */
function getPassportData(){
    if(!currentUser)return null;
    const compMap=typeof completions!=='undefined'?completions:{};
    const compIds=Object.keys(compMap);
    const favs=typeof favorites!=='undefined'?favorites:[];

    // Build stamps: completed races grouped by country
    const stamps={};// {countryId: [{name,date,dist,type},...]}
    const visited=new Set();

    for(const cid of Object.keys(R)){
        (R[cid]||[]).forEach((r,idx)=>{
            const rid=r._id||cid+'_'+idx;
            if(compIds.includes(rid)){
                if(!stamps[cid])stamps[cid]=[];
                const cd=compMap[rid];
                stamps[cid].push({name:r.n,date:r.d,dist:cd?.distance_run||(r.c||[])[0]||'',type:r.t,time:cd?.finish_time||''});
                visited.add(cid);
            }
        });
    }

    // Also count saved (not completed) races per country
    const planned={};
    for(const cid of Object.keys(R)){
        (R[cid]||[]).forEach((r,idx)=>{
            const rid=r._id||cid+'_'+idx;
            if(favs.includes(rid)&&!compIds.includes(rid)){
                if(!planned[cid])planned[cid]=0;
                planned[cid]++;
            }
        });
    }

    const totalStamps=Object.values(stamps).reduce((s,arr)=>s+arr.length,0);
    const displayName=currentProfile?.display_name||currentUser.email?.split('@')[0]||'Runner';
    const username=currentProfile?.username||'';

    return{stamps,visited,planned,totalStamps,totalCountries:visited.size,displayName,username};
}

function openPulzPassport(){
    if(!currentUser)return;
    const t=T[lang];
    const data=getPassportData();
    if(!data)return;
    const locale=lang==='pt'?'pt-BR':lang==='en'?'en-US':'es-AR';

    // Country positions for the visual map (simplified Latam layout, north → south)
    const countryMeta={
        mexico:{name:'México',emoji:'🇲🇽',y:0},
        colombia:{name:'Colombia',emoji:'🇨🇴',y:0},
        peru:{name:'Perú',emoji:'🇵🇪',y:1},
        brasil:{name:'Brasil',emoji:'🇧🇷',y:1},
        chile:{name:'Chile',emoji:'🇨🇱',y:2},
        argentina:{name:'Argentina',emoji:'🇦🇷',y:2},
        uruguay:{name:'Uruguay',emoji:'🇺🇾',y:2}
    };

    let mapHTML='<div class="passport-map">';
    countries.forEach(c=>{
        const isVisited=data.visited.has(c.id);
        const stampCount=(data.stamps[c.id]||[]).length;
        const plannedCount=data.planned[c.id]||0;
        const meta=countryMeta[c.id]||{emoji:'',y:0};
        mapHTML+=`<div class="passport-country ${isVisited?'visited':''}" onclick="${isVisited?`showPassportStamps('${c.id}')`:''}">
            <div class="passport-flag">${meta.emoji}</div>
            <div class="passport-country-name">${c.name}</div>
            ${isVisited?`<div class="passport-stamp-count">${stampCount} ${stampCount===1?(t.passportRace||'carrera'):(t.passportRaces||'carreras')}</div>`
            :plannedCount?`<div class="passport-planned">${plannedCount} ${t.passportPlanned||'planificadas'}</div>`
            :`<div class="passport-locked">${t.passportLocked||'Sin visitar'}</div>`}
        </div>`;
    });
    mapHTML+='</div>';

    // Progress bar
    const pct=Math.round(data.totalCountries/countries.length*100);
    const progressHTML=`<div class="passport-progress">
        <div class="passport-progress-label">${data.totalCountries}/${countries.length} ${t.passportCountries||'países'}</div>
        <div class="passport-progress-bar"><div class="passport-progress-fill" style="width:${pct}%"></div></div>
        <div class="passport-progress-pct">${pct}%</div>
    </div>`;

    // Stats
    const statsHTML=`<div class="passport-stats">
        <div class="passport-stat"><div class="passport-stat-num">${data.totalStamps}</div><div class="passport-stat-label">${t.passportStamps||'Sellos'}</div></div>
        <div class="passport-stat"><div class="passport-stat-num">${data.totalCountries}</div><div class="passport-stat-label">${t.passportCountries||'Países'}</div></div>
    </div>`;

    document.getElementById('raceModalBody').innerHTML=`
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${t.passportTitle||'Tu Passport'}</h2>
            <p class="auth-subtitle">${data.displayName} · ${t.passportSub||'Mapa runner de Latinoamérica'}</p>
        </div>
        ${progressHTML}
        ${mapHTML}
        ${statsHTML}
        <div id="passportStampsDetail"></div>
        <div class="passport-actions">
            <button class="auth-submit" onclick="openPassportImage()">
                <span class="auth-submit-text">${t.passportShare||'Compartir imagen'}</span>
            </button>
        </div>
        <button class="auth-text-btn" onclick="openMySeason()" style="margin-top:0.5rem">&larr; ${t.back||'Volver'}</button>
    `;
    openRaceModal();
    window._passportData=data;
}

function showPassportStamps(countryId){
    const data=window._passportData;
    if(!data||!data.stamps[countryId])return;
    const t=T[lang];
    const locale=lang==='pt'?'pt-BR':lang==='en'?'en-US':'es-AR';
    const country=countries.find(c=>c.id===countryId);
    const stamps=data.stamps[countryId];

    let html=`<div class="passport-stamps-section">
        <div class="season-section-title">${country?country.name:countryId}</div>
        <div class="passport-stamps-list">`;
    stamps.sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(s=>{
        const dt=new Date(s.date+'T00:00:00');
        const dateStr=dt.toLocaleDateString(locale,{day:'numeric',month:'short',year:'numeric'});
        const typeClass=s.type==='trail'?'type-trail':'type-road';
        html+=`<div class="passport-stamp">
            <div class="passport-stamp-date">${dateStr}</div>
            <div class="passport-stamp-info">
                <div class="passport-stamp-name">${esc(s.name)}</div>
                <div class="passport-stamp-meta"><span class="${typeClass}">${s.type==='trail'?'Trail':(t.road||'Asfalto')}</span>${s.dist?' · '+esc(s.dist):''}${s.time?' · '+esc(s.time):''}</div>
            </div>
        </div>`;
    });
    html+='</div></div>';

    const detail=document.getElementById('passportStampsDetail');
    if(detail)detail.innerHTML=html;
}

function openPassportImage(){
    const data=window._passportData;
    if(!data)return;
    const t=T[lang];

    document.getElementById('raceModalBody').innerHTML=`
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${t.passportTitle||'Tu Passport'}</h2>
            <p class="auth-subtitle">${t.passportShareSub||'Descargá y compartí'}</p>
        </div>
        <div class="replay-preview">
            <canvas id="passportStory" width="270" height="480"></canvas>
        </div>
        <div class="replay-formats">
            <button class="replay-format-btn active" onclick="switchPassportFormat('story',this)">${t.replayStory||'Story'} 9:16</button>
            <button class="replay-format-btn" onclick="switchPassportFormat('feed',this)">${t.replayFeed||'Feed'} 1:1</button>
        </div>
        <button class="auth-submit" onclick="downloadKit('passportStory','pulz-passport')">
            <span class="auth-submit-text">${t.replayDownload||'Descargar imagen'}</span>
        </button>
        <button class="auth-text-btn" onclick="openPulzPassport()" style="margin-top:0.5rem">&larr; ${t.back||'Volver'}</button>
    `;
    openRaceModal();
    setTimeout(()=>drawPassportCanvas('passportStory',1080,1920,data),50);
}

function switchPassportFormat(format,btn){
    const preview=document.querySelector('.replay-preview');
    if(!preview)return;
    document.querySelectorAll('.replay-format-btn').forEach(b=>b.classList.remove('active'));
    if(btn)btn.classList.add('active');
    const data=window._passportData;
    if(!data)return;

    if(format==='feed'){
        preview.innerHTML='<canvas id="passportFeed" width="270" height="270"></canvas>';
        setTimeout(()=>drawPassportCanvas('passportFeed',1080,1080,data),50);
        const dlBtn=document.querySelector('.auth-submit');
        if(dlBtn)dlBtn.setAttribute('onclick',`downloadKit('passportFeed','pulz-passport-feed')`);
    }else{
        preview.innerHTML='<canvas id="passportStory" width="270" height="480"></canvas>';
        setTimeout(()=>drawPassportCanvas('passportStory',1080,1920,data),50);
        const dlBtn=document.querySelector('.auth-submit');
        if(dlBtn)dlBtn.setAttribute('onclick',`downloadKit('passportStory','pulz-passport')`);
    }
}

function drawPassportCanvas(canvasId,w,h,data){
    const canvas=document.getElementById(canvasId);
    if(!canvas)return;
    canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext('2d');
    const isStory=h>w;
    const accent='#DEFF00';
    const white='#ffffff';
    const dim='rgba(255,255,255,0.4)';
    const pad=w*0.08;

    // Background
    const grad=ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#060610');
    grad.addColorStop(0.5,'#0a0a18');
    grad.addColorStop(1,'#060610');
    ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);

    // Subtle diagonal lines
    ctx.strokeStyle='rgba(222,255,0,0.02)';
    ctx.lineWidth=1;
    for(let i=-h;i<w+h;i+=w*0.04){
        ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i+h*0.3,h);ctx.stroke();
    }

    // PULZ logo
    ctx.fillStyle=accent;
    ctx.font='bold '+Math.round(w*0.04)+'px "Bebas Neue",Impact,Arial,sans-serif';
    ctx.fillText('PULZ',pad,isStory?h*0.045:h*0.07);

    // PASSPORT label
    ctx.fillStyle=accent;
    ctx.font='bold '+Math.round(w*0.022)+'px Inter,Arial,sans-serif';
    ctx.fillText('PASSPORT',pad,isStory?h*0.08:h*0.13);

    // Runner name
    ctx.fillStyle=white;
    ctx.font='bold '+Math.round(w*(isStory?0.055:0.05))+'px Inter,Arial,sans-serif';
    const nameY=isStory?h*0.125:h*0.2;
    ctx.fillText(data.displayName.toUpperCase(),pad,nameY);
    if(data.username){
        ctx.fillStyle=dim;
        ctx.font=Math.round(w*0.022)+'px "JetBrains Mono",monospace';
        ctx.fillText('@'+data.username,pad,nameY+w*0.035);
    }

    // Progress: X/6
    const progY=isStory?h*0.19:h*0.3;
    ctx.fillStyle=accent;
    ctx.font='bold '+Math.round(w*0.08)+'px "JetBrains Mono",monospace';
    ctx.fillText(data.totalCountries+'/6',pad,progY);
    ctx.fillStyle=dim;
    ctx.font=Math.round(w*0.022)+'px Inter,Arial,sans-serif';
    ctx.fillText(lang==='en'?'countries visited':lang==='pt'?'países visitados':'países visitados',pad,progY+w*0.035);

    // Progress bar
    const barY=progY+w*0.06;
    const barW=w-pad*2;
    const barH=w*0.018;
    roundRect(ctx,pad,barY,barW,barH,barH/2);
    ctx.fillStyle='rgba(255,255,255,0.08)';ctx.fill();
    const fillW=Math.max(barH,barW*(data.totalCountries/countries.length));
    roundRect(ctx,pad,barY,fillW,barH,barH/2);
    ctx.fillStyle=accent;ctx.fill();

    // Country grid (north → south)
    const gridY=barY+w*0.06;
    const countryList=[
        {id:'mexico',name:'México',emoji:'🇲🇽'},
        {id:'colombia',name:'Colombia',emoji:'🇨🇴'},
        {id:'peru',name:'Perú',emoji:'🇵🇪'},
        {id:'brasil',name:'Brasil',emoji:'🇧🇷'},
        {id:'chile',name:'Chile',emoji:'🇨🇱'},
        {id:'argentina',name:'Argentina',emoji:'🇦🇷'},
        {id:'uruguay',name:'Uruguay',emoji:'🇺🇾'}
    ];

    const cols=3;
    const cellW=(w-pad*2)/cols;
    const cellH=isStory?h*0.07:h*0.1;

    countryList.forEach((c,i)=>{
        const col=i%cols;
        const row=Math.floor(i/cols);
        const cx=pad+col*cellW;
        const cy=gridY+row*cellH;
        const isVisited=data.visited.has(c.id);
        const stampCount=(data.stamps[c.id]||[]).length;

        // Country card background
        roundRect(ctx,cx+4,cy+4,cellW-8,cellH-8,w*0.01);
        ctx.fillStyle=isVisited?'rgba(222,255,0,0.08)':'rgba(255,255,255,0.03)';
        ctx.fill();
        if(isVisited){
            ctx.strokeStyle='rgba(222,255,0,0.3)';ctx.lineWidth=1;ctx.stroke();
        }

        // Country name
        ctx.fillStyle=isVisited?accent:dim;
        ctx.font=(isVisited?'bold ':'')+Math.round(w*0.022)+'px Inter,Arial,sans-serif';
        ctx.fillText(c.name,cx+w*0.02,cy+cellH*0.45);

        // Stamp count or locked
        if(isVisited){
            ctx.fillStyle='rgba(255,255,255,0.6)';
            ctx.font=Math.round(w*0.016)+'px "JetBrains Mono",monospace';
            ctx.fillText(stampCount+' '+(stampCount===1?'carrera':'carreras'),cx+w*0.02,cy+cellH*0.75);
        }else{
            ctx.fillStyle='rgba(255,255,255,0.15)';
            ctx.font=Math.round(w*0.014)+'px Inter,Arial,sans-serif';
            ctx.fillText('---',cx+w*0.02,cy+cellH*0.75);
        }
    });

    // Stamps section (if story format, we have space)
    const stampsY=gridY+Math.ceil(countryList.length/cols)*cellH+w*0.04;
    if(data.totalStamps>0){
        ctx.fillStyle=dim;
        ctx.font=Math.round(w*0.018)+'px Inter,Arial,sans-serif';
        ctx.fillText((lang==='en'?'RECENT STAMPS':'SELLOS RECIENTES').toUpperCase(),pad,stampsY);

        // Show up to 4 most recent stamps
        const allStamps=[];
        for(const cid of Object.keys(data.stamps)){
            data.stamps[cid].forEach(s=>allStamps.push({...s,_cid:cid}));
        }
        allStamps.sort((a,b)=>new Date(b.date)-new Date(a.date));
        const recent=allStamps.slice(0,isStory?5:3);

        recent.forEach((s,i)=>{
            const sy=stampsY+w*0.04+i*(w*0.045);
            const dt=new Date(s.date+'T00:00:00');
            const mo=dt.toLocaleDateString(lang==='pt'?'pt-BR':lang==='en'?'en-US':'es-AR',{month:'short',year:'2-digit'});
            const country=countries.find(c=>c.id===s._cid);

            // Date
            ctx.fillStyle=accent;
            ctx.font=Math.round(w*0.016)+'px "JetBrains Mono",monospace';
            ctx.fillText(mo,pad,sy);

            // Race name
            ctx.fillStyle=white;
            ctx.font=Math.round(w*0.018)+'px Inter,Arial,sans-serif';
            const nameX=pad+w*0.1;
            const maxNameW=w-nameX-pad;
            const raceName=s.name.length>35?s.name.substring(0,35)+'…':s.name;
            ctx.fillText(raceName,nameX,sy);

            // Country + dist
            ctx.fillStyle=dim;
            ctx.font=Math.round(w*0.014)+'px Inter,Arial,sans-serif';
            ctx.fillText((country?country.name:'')+(s.dist?' · '+s.dist:'')+(s.time?' · '+s.time:''),nameX,sy+w*0.022);
        });
    }

    // Total stamps badge
    const badgeY=isStory?h*0.88:h*0.83;
    ctx.fillStyle=accent;
    ctx.font='bold '+Math.round(w*0.05)+'px "JetBrains Mono",monospace';
    ctx.fillText(data.totalStamps.toString(),pad,badgeY);
    ctx.fillStyle=dim;
    ctx.font=Math.round(w*0.02)+'px Inter,Arial,sans-serif';
    const bw=ctx.measureText(data.totalStamps.toString()).width;
    ctx.fillText(' '+(lang==='en'?'stamps':lang==='pt'?'selos':'sellos'),pad+bw,badgeY);

    // Footer
    ctx.fillStyle=accent;
    ctx.fillRect(pad,isStory?h*0.92:h*0.88,w*0.12,2);
    ctx.font='bold '+Math.round(w*0.03)+'px "Bebas Neue",Impact,Arial,sans-serif';
    ctx.fillText('PULZ',pad,isStory?h*0.945:h*0.91);
    ctx.fillStyle=dim;
    ctx.font=Math.round(w*0.016)+'px Inter,Arial,sans-serif';
    ctx.fillText('pulz.lat'+(data.username?' · pulz.lat/#runner/'+data.username:''),pad,(isStory?h*0.96:h*0.935));

    canvas.style.width='100%';canvas.style.height='auto';
}

/* ============================================
   TEAM — LEADERBOARD
   ============================================ */
function renderTeamLeaderboardHTML(members){
    const t=T[lang];
    if(!members||!members.length)return'';
    const mn=(T[lang].monthNames||['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']);
    const currentMonth=mn[new Date().getMonth()];
    // Sort by km
    const sorted=[...members].sort((a,b)=>parseFloat(b.total_km||0)-parseFloat(a.total_km||0));
    let html=`<div class="leaderboard-section">
        <div class="season-section-title">${t.teamLeaderTitle||'Tabla de posiciones'}</div>
        <div class="leaderboard-challenge">${t.teamLeaderChallengeMsg||'Ranking por km acumulados'}</div>
        <div class="leaderboard-list">`;
    sorted.slice(0,10).forEach((m,i)=>{
        const name=m.display_name||'Runner';
        const initial=(name[0]||'R').toUpperCase();
        const km=Math.round(parseFloat(m.total_km||0));
        const races=parseInt(m.races_completed||0);
        html+=`<div class="leaderboard-item">
            <div class="leaderboard-rank">${i+1}</div>
            <div class="leaderboard-avatar">${initial}</div>
            <div class="leaderboard-info"><div class="leaderboard-name">${esc(name)}</div><div class="leaderboard-stat">${races} ${t.teamLeaderRaces||'carreras'}</div></div>
            <div class="leaderboard-val">${km}K</div>
        </div>`;
    });
    html+='</div></div>';
    return html;
}

/* ============================================
   TEAM — ANNOUNCEMENTS
   ============================================ */
let _teamAnnouncements=[];
function loadTeamAnnouncements(){
    try{const d=JSON.parse(localStorage.getItem('pulz_team_announcements'));if(Array.isArray(d))_teamAnnouncements=d;}catch(e){}
}
loadTeamAnnouncements();

function renderTeamAnnouncementsHTML(isOwner){
    const t=T[lang];
    const teamId=currentUser?.id;
    const teamAnns=_teamAnnouncements.filter(a=>a.team_id===teamId);
    let html=`<div class="announcements-section">
        <div class="season-section-title">${t.teamAnnounceTitle||'Anuncios'}</div>`;
    if(isOwner){
        const canPost=teamAnns.length<5;
        html+=`<div class="announcement-form">
            <textarea class="auth-input" id="teamAnnounceText" rows="2" maxlength="500" placeholder="${t.teamAnnouncePh||'Ej: Nos juntamos 7am en el parque'}" ${canPost?'':'disabled'}></textarea>
            <button class="auth-submit" onclick="postTeamAnnouncement()" ${canPost?'':'disabled'} style="padding:0.5rem">
                <span class="auth-submit-text">${canPost?(t.teamAnnouncePost||'Publicar anuncio'):(t.teamAnnounceMax||'Máximo 5 anuncios')}</span>
            </button>
        </div>`;
    }
    if(teamAnns.length){
        html+='<div class="announcement-list">';
        teamAnns.slice().reverse().forEach((a,i)=>{
            const dt=new Date(a.created_at);
            const locale=lang==='pt'?'pt-BR':lang==='en'?'en-US':'es-AR';
            const dateStr=dt.toLocaleDateString(locale,{day:'numeric',month:'short'});
            html+=`<div class="announcement-card">
                <div class="announcement-text">${esc(a.message)}</div>
                <div class="announcement-meta"><span>${dateStr}</span>${isOwner?`<button class="announcement-delete" onclick="deleteTeamAnnouncement(${teamAnns.length-1-i})">✕</button>`:''}</div>
            </div>`;
        });
        html+='</div>';
    }else{
        html+=`<div class="my-races-empty" style="padding:0.8rem 0">${t.teamAnnounceEmpty||'No hay anuncios'}</div>`;
    }
    html+='</div>';
    return html;
}

function postTeamAnnouncement(){
    const text=document.getElementById('teamAnnounceText')?.value?.trim();
    if(!text||!currentUser)return;
    const t=T[lang];
    _teamAnnouncements.push({team_id:currentUser.id,message:text,created_at:new Date().toISOString()});
    safeLS('pulz_team_announcements',_teamAnnouncements);
    if(sbClient)sbClient.from('team_announcements').insert({team_id:currentUser.id,message:text}).catch(()=>{});
    showToast(t.teamAnnouncePosted||'Anuncio publicado','success');
    openTeamRaces();
}

function deleteTeamAnnouncement(idx){
    const teamAnns=_teamAnnouncements.filter(a=>a.team_id===currentUser?.id);
    if(idx<0||idx>=teamAnns.length)return;
    const target=teamAnns[idx];
    _teamAnnouncements=_teamAnnouncements.filter(a=>a!==target);
    safeLS('pulz_team_announcements',_teamAnnouncements);
    if(sbClient&&target.id){sbClient.from('team_announcements').delete().eq('id',target.id).catch(()=>{});}
    else if(sbClient&&currentUser){sbClient.from('team_announcements').delete().eq('team_id',currentUser.id).eq('message',target.message).eq('created_at',target.created_at).catch(()=>{});}
    openTeamRaces();
}

/* ============================================
   TEAM — MEMBER PROGRESSION ANALYTICS
   ============================================ */
function getMemberTrend(member){
    const races=parseInt(member.races_completed||0);
    const km=parseFloat(member.total_km||0);
    if(races===0)return'inactive';
    // Simple heuristic: if avg_effort > 0 and races > 2, improving
    const effort=parseFloat(member.avg_effort||0);
    if(races>=3&&effort>0&&effort<=3.5)return'improving';
    if(races>=1)return'stable';
    return'inactive';
}

function renderMemberTrendBadge(trend){
    const t=T[lang];
    const labels={improving:t.teamMemberImproving||'Mejorando',stable:t.teamMemberStable||'Estable',inactive:t.teamMemberInactive||'Inactivo'};
    return `<span class="member-trend-badge ${trend}">${labels[trend]||trend}</span>`;
}

/* ============================================
   TEAM — RECRUITING BADGE
   ============================================ */
function renderRecruitingToggle(){
    const t=T[lang];
    const p=currentProfile||{};
    const isRecruiting=!!p.team_recruiting;
    return `<div class="recruit-toggle">
        <label>${t.teamRecruitToggle||'Buscamos miembros'}</label>
        <label class="recruit-switch"><input type="checkbox" id="teamRecruitCheck" ${isRecruiting?'checked':''} onchange="toggleRecruiting(this.checked)"><span class="slider"></span></label>
    </div>
    <div class="auth-field" id="recruitMsgField" style="display:${isRecruiting?'block':'none'};margin-top:0.5rem">
        <label class="auth-label">${t.teamRecruitMsg||'Mensaje para postulantes'}</label>
        <input type="text" class="auth-input" id="teamRecruitMsg" value="${esc(p.team_recruiting_msg||'')}" placeholder="${t.teamRecruitMsgPh||'Ej: Buscamos runners de nivel intermedio...'}" onchange="saveRecruitMsg(this.value)">
    </div>`;
}

async function toggleRecruiting(checked){
    await updateProfile({team_recruiting:checked});
    const field=document.getElementById('recruitMsgField');
    if(field)field.style.display=checked?'block':'none';
}

async function saveRecruitMsg(msg){
    await updateProfile({team_recruiting_msg:msg||null});
}

/* ============================================
   PULZ MATCH — Race Recommendations
   ============================================ */
function computeMatchRecommendations(){
    if(!currentUser)return[];
    const now=new Date();
    const t=T[lang];

    // 1. Build runner profile from favorites + completions
    const favIds=new Set(typeof favorites!=='undefined'?favorites:[]);
    const compIds=new Set(typeof completions!=='undefined'?Object.keys(completions):[]);
    if(!favIds.size&&!compIds.size)return[];

    // Analyze preferences
    const prefDists=[];// km values the runner has done/saved
    const prefTypes={trail:0,road:0};
    const prefCountries={};
    const monthsWithRaces=new Set();
    const allFavRaces=[];

    for(const cid of Object.keys(R)){
        (R[cid]||[]).forEach((r,idx)=>{
            const rid=r._id||cid+'_'+idx;
            const isFav=favIds.has(rid);
            const isComp=compIds.has(rid);
            if(!isFav&&!isComp)return;
            allFavRaces.push({...r,_cid:cid,_idx:idx,_rid:rid});
            // Extract distance preference
            (r.c||[]).forEach(c=>{const n=parseFloat(c);if(!isNaN(n))prefDists.push(n);});
            // Type preference
            if(r.t==='trail')prefTypes.trail++;else prefTypes.road++;
            // Country preference
            prefCountries[cid]=(prefCountries[cid]||0)+1;
            // Months occupied
            const dt=new Date(r.d+'T00:00:00');
            if(dt>=now)monthsWithRaces.add(dt.getMonth());
        });
    }

    if(!prefDists.length&&!allFavRaces.length)return[];

    // Preferred distance range
    const avgDist=prefDists.length?prefDists.reduce((a,b)=>a+b,0)/prefDists.length:10;
    const minDist=prefDists.length?Math.min(...prefDists)*0.5:5;
    const maxDist=prefDists.length?Math.max(...prefDists)*1.5:50;
    // Preferred type
    const prefType=prefTypes.trail>prefTypes.road?'trail':'road';
    // Top country
    const topCountry=Object.entries(prefCountries).sort((a,b)=>b[1]-a[1])[0]?.[0]||'';
    // Gap months (future months without races)
    const gapMonths=new Set();
    for(let m=now.getMonth();m<12;m++){
        if(!monthsWithRaces.has(m))gapMonths.add(m);
    }
    // Distances runner hasn't tried (for "new distance" signal)
    const doneDistLabels=new Set();
    prefDists.forEach(d=>{
        if(d<=5.5)doneDistLabels.add('5K');
        else if(d<=11)doneDistLabels.add('10K');
        else if(d<=16)doneDistLabels.add('15K');
        else if(d<=22)doneDistLabels.add('21K');
        else if(d<=43)doneDistLabels.add('42K');
        else doneDistLabels.add('ultra');
    });

    // 2. Score every future race the runner hasn't already saved
    const candidates=[];
    for(const cid of Object.keys(R)){
        (R[cid]||[]).forEach((r,idx)=>{
            const rid=r._id||cid+'_'+idx;
            if(favIds.has(rid))return;// already saved
            const dt=new Date(r.d+'T00:00:00');
            if(dt<now)return;// past race

            let score=0;
            const reasons=[];
            const raceDists=(r.c||[]).map(c=>parseFloat(c)).filter(n=>!isNaN(n));
            const raceMaxDist=raceDists.length?Math.max(...raceDists):0;

            // Signal: distance similarity (strongest signal)
            if(raceMaxDist>0){
                const distDiff=Math.abs(raceMaxDist-avgDist);
                if(distDiff<5){score+=30;reasons.push('dist');}
                else if(raceMaxDist>=minDist&&raceMaxDist<=maxDist){score+=20;reasons.push('dist');}
                // New distance to try
                const raceLabel=raceMaxDist<=5.5?'5K':raceMaxDist<=11?'10K':raceMaxDist<=16?'15K':raceMaxDist<=22?'21K':raceMaxDist<=43?'42K':'ultra';
                if(!doneDistLabels.has(raceLabel)&&raceMaxDist<=maxDist*1.2){
                    score+=15;reasons.push('new');
                }
            }

            // Signal: type match
            if(r.t===prefType){score+=20;reasons.push('type');}

            // Signal: same country as top preference
            if(cid===topCountry){score+=15;reasons.push('country');}

            // Signal: fills a gap month
            if(gapMonths.has(dt.getMonth())){score+=25;reasons.push('gap');}

            // Signal: popularity (fav count as proxy)
            const fc=typeof getFavCount==='function'?getFavCount(rid):0;
            if(fc>=3)score+=10;
            if(fc>=10)score+=5;

            // Signal: iconic race
            if(r.i===1)score+=8;

            // Small time bonus: closer races get slight boost (but not too close)
            const daysAway=Math.ceil((dt-now)/(1000*60*60*24));
            if(daysAway>=14&&daysAway<=120)score+=5;

            if(score>0){
                candidates.push({...r,_cid:cid,_idx:idx,_rid:rid,_score:score,_reasons:[...new Set(reasons)],_dt:dt});
            }
        });
    }

    // 3. Sort by score, return top 5
    candidates.sort((a,b)=>b._score-a._score);
    return candidates.slice(0,5);
}

function renderMatchHTML(){
    const t=T[lang];
    if(!currentUser)return'';
    const matches=computeMatchRecommendations();
    if(!matches.length){
        // Only show empty state if user has SOME activity
        const hasFavs=typeof favorites!=='undefined'&&favorites.length>0;
        const hasComps=typeof completions!=='undefined'&&Object.keys(completions).length>0;
        if(!hasFavs&&!hasComps)return'';
        return'';// don't show empty section, keep dashboard clean
    }

    const locale=lang==='pt'?'pt-BR':lang==='en'?'en-US':'es-AR';
    const reasonLabels={
        dist:t.matchWhyDist||'distancia similar',
        type:t.matchWhyType||'tipo que corrés',
        gap:t.matchWhyGap||'mes sin carreras',
        country:t.matchWhyCountry||'tu país',
        similar:t.matchWhySimilar||'runners como vos',
        'new':t.matchWhyNew||'nueva distancia'
    };

    let html=`<div class="match-section">
        <div class="match-header">
            <div class="season-section-title">${t.matchTitle||'Carreras para vos'}</div>
            <div class="match-sub">${t.matchSub||'Basado en tu perfil y actividad'}</div>
        </div>
        <div class="match-list">`;

    matches.forEach(r=>{
        const dt=r._dt;
        const dateStr=dt.toLocaleDateString(locale,{day:'numeric',month:'short'});
        const daysAway=Math.ceil((dt-new Date())/(1000*60*60*24));
        const country=countries.find(c=>c.id===r._cid);
        const typeClass=r.t==='trail'?'type-trail':'type-road';
        const reasonTags=r._reasons.slice(0,3).map(k=>`<span class="match-reason">${reasonLabels[k]||k}</span>`).join('');
        const isFav=typeof favorites!=='undefined'&&favorites.includes(r._rid);

        html+=`<div class="match-card" onclick="closeRaceModal();setTimeout(()=>openDrawer('${esc(r._cid)}',${r._idx}),300)" style="cursor:pointer">
            <div class="match-card-top">
                <div class="match-card-date">
                    <div class="match-date-day">${dateStr}</div>
                    <div class="match-date-countdown">${daysAway}d</div>
                </div>
                <div class="match-card-info">
                    <div class="match-card-name">${esc(r.n)}</div>
                    <div class="match-card-meta">${esc(r.l)}${country?' · '+country.name:''} · <span class="${typeClass}">${r.t==='trail'?'Trail':(t.road||'Asfalto')}</span></div>
                    <div class="match-card-dists">${esc((r.c||[]).join(' · '))}</div>
                </div>
                <button class="match-save-btn ${isFav?'saved':''}" onclick="event.stopPropagation();toggleFav('${esc(r._rid)}');this.classList.toggle('saved')" title="${t.matchSave||'Guardar'}">
                    <svg viewBox="0 0 24 24" fill="${isFav?'currentColor':'none'}" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                </button>
            </div>
            <div class="match-reasons">${reasonTags}</div>
        </div>`;
    });

    html+='</div></div>';
    return html;
}

/* ============================================
   PULZ ID — Public Runner Profile
   ============================================ */
function openPulzIdSetup(){
    closeUserMenu();
    if(!currentUser)return;
    const t=T[lang];
    const p=currentProfile||{};
    const hasUsername=!!p.username;

    document.getElementById('raceModalBody').innerHTML=`
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${t.pidTitle||'Mi PULZ ID'}</h2>
            <p class="auth-subtitle">${t.pidSubtitle||'Tu perfil público de corredor'}</p>
        </div>
        <div id="raceError" class="auth-error"></div>
        <div class="race-form">
            <div class="auth-field">
                <label class="auth-label">${t.pidUsername||'Nombre de usuario'}</label>
                <input type="text" class="auth-input" id="pidUsername" value="${esc(p.username||'')}" placeholder="${t.pidUsernamePh||'ej: juanperez'}" oninput="this.value=this.value.toLowerCase().replace(/[^a-z0-9-]/g,'')">
                <div class="pid-url-hint">${t.pidUsernameHint||'Este será tu link:'} <strong>pulz.lat/#runner/<span id="pidSlugPreview">${esc(p.username||'...')}</span></strong></div>
            </div>
            <div class="auth-field">
                <label class="auth-label">${t.pidPrivacy||'Privacidad'}</label>
                <div class="pid-privacy-options">
                    <label class="pid-privacy-toggle"><input type="checkbox" id="pidShowBadges" ${p.pid_show_badges!==false?'checked':''}><span>${t.pidShowBadges||'Mostrar badges'}</span></label>
                    <label class="pid-privacy-toggle"><input type="checkbox" id="pidShowStats" ${p.pid_show_stats!==false?'checked':''}><span>${t.pidShowStats||'Mostrar estadísticas'}</span></label>
                    <label class="pid-privacy-toggle"><input type="checkbox" id="pidShowHistory" ${p.pid_show_history!==false?'checked':''}><span>${t.pidShowHistory||'Mostrar historial'}</span></label>
                </div>
            </div>
            <button class="auth-submit" onclick="savePulzId()">
                <span class="auth-submit-text">${t.pidSave||'Guardar PULZ ID'}</span>
                <span class="auth-submit-loader"></span>
            </button>
            ${hasUsername?`
                <div class="pid-actions">
                    <button class="season-action-btn" onclick="sharePulzId('${esc(p.username)}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                        ${t.pidShare||'Compartir PULZ ID'}
                    </button>
                    <button class="season-action-btn" onclick="closeRaceModal();location.hash='runner/${esc(p.username)}'">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        ${t.pidViewPublic||'Ver perfil público'}
                    </button>
                </div>
            `:''}
        </div>
    `;
    // Live slug preview
    const input=document.getElementById('pidUsername');
    if(input){
        input.addEventListener('input',()=>{
            const preview=document.getElementById('pidSlugPreview');
            if(preview)preview.textContent=input.value||'...';
        });
    }
    openRaceModal();
}

async function savePulzId(){
    const t=T[lang];
    const username=document.getElementById('pidUsername')?.value?.trim();
    if(!username||username.length<3){showRaceError(t.pidUsernameErr||'Mínimo 3 caracteres');return;}
    if(!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(username)&&username.length>2){showRaceError(t.pidUsernameErr||'Solo letras, números y guiones');return;}

    const btn=document.querySelector('.auth-submit');
    if(btn)btn.classList.add('loading');

    // Check availability
    const available=typeof checkUsernameAvailable==='function'?await checkUsernameAvailable(username):true;
    if(!available){
        if(btn)btn.classList.remove('loading');
        showRaceError(t.pidUsernameTaken||'Este nombre ya está en uso');
        return;
    }

    const showBadges=document.getElementById('pidShowBadges')?.checked!==false;
    const showStats=document.getElementById('pidShowStats')?.checked!==false;
    const showHistory=document.getElementById('pidShowHistory')?.checked!==false;

    const result=await updateProfile({
        username:username,
        pid_show_badges:showBadges,
        pid_show_stats:showStats,
        pid_show_history:showHistory
    });

    if(btn)btn.classList.remove('loading');
    if(result.error){showRaceError(result.error.message||result.error);return;}

    showToast(t.pidSaved||'PULZ ID guardado','success');
    openPulzIdSetup(); // refresh to show share buttons
}

function sharePulzId(username){
    const url=window.location.origin+'/#runner/'+username;
    if(navigator.share){
        navigator.share({title:'PULZ ID',url:url}).catch(()=>{});
    }else{
        navigator.clipboard.writeText(url).then(()=>{
            showToast(T[lang].pidCopied||'Link copiado','success');
        }).catch(()=>{});
    }
}

/* Public profile view — renders for any visitor */
async function openPublicProfile(username){
    const t=T[lang];
    const locale=lang==='pt'?'pt-BR':lang==='en'?'en-US':'es-AR';

    // Show loading in a full-screen overlay
    let container=document.getElementById('pulzIdOverlay');
    if(!container){
        container=document.createElement('div');
        container.id='pulzIdOverlay';
        container.className='pulz-id-overlay';
        document.body.appendChild(container);
    }
    container.classList.add('open');
    document.body.style.overflow='hidden';
    container.innerHTML=`<div class="pulz-id-card"><div class="teams-directory-loading"><span class="auth-submit-loader" style="display:block;position:static;border-top-color:var(--txt3)"></span></div></div>`;

    // Load profile from DB
    const profile=typeof loadPublicProfile==='function'?await loadPublicProfile(username):null;
    if(!profile){
        container.innerHTML=`<div class="pulz-id-card">
            <div class="pulz-id-close" onclick="closePulzId()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <div class="my-races-empty" style="padding:2rem 0">${t.pidNoRaces||'Perfil no encontrado'}</div>
        </div>`;
        return;
    }

    // Load their completions
    const comps=typeof loadPublicCompletions==='function'?await loadPublicCompletions(profile.id):[];

    // Resolve completed races
    const completedRaces=[];
    let totalKm=0,trailCount=0,roadCount=0,countriesSet=new Set();
    let bestTimes={};
    for(const cid of Object.keys(R)){
        R[cid].forEach((r,idx)=>{
            const rid=r._id||cid+'_'+idx;
            const comp=comps.find(c=>c.race_id===rid);
            if(comp){
                const cd=comp;
                const distNum=parseFloat(cd.distance_run||'');
                const maxD=(r.c||[]).reduce((m,c)=>{const n=parseFloat(c);return!isNaN(n)&&n>m?n:m;},0);
                const km=!isNaN(distNum)&&distNum>0?distNum:maxD;
                totalKm+=km;
                if(r.t==='trail')trailCount++;else roadCount++;
                countriesSet.add(cid);
                // Track best time per standard distance
                if(cd.finish_time){
                    const sec=parseTimeToSeconds(cd.finish_time);
                    const label=km<=5.5?'5K':km<=11?'10K':km<=22?'21K':km<=43?'42K':Math.round(km)+'K';
                    if(sec>0&&(!bestTimes[label]||sec<bestTimes[label].sec)){
                        bestTimes[label]={sec,time:cd.finish_time,race:r.n};
                    }
                }
                completedRaces.push({...r,_country:cid,_idx:idx,_comp:cd,_km:km});
            }
        });
    }
    completedRaces.sort((a,b)=>new Date(b.d+'T00:00:00')-new Date(a.d+'T00:00:00'));

    const name=profile.display_name||username;
    const initial=(name[0]||'?').toUpperCase();
    const joinYear=profile.created_at?new Date(profile.created_at).getFullYear():'';
    const showBadges=profile.pid_show_badges!==false;
    const showStats=profile.pid_show_stats!==false;
    const showHistory=profile.pid_show_history!==false;

    // Country names
    const countryNames=[...countriesSet].map(cid=>{const c=countries.find(x=>x.id===cid);return c?c.name:cid;});

    // Badges (compute from completions)
    let badgesHTML='';
    if(showBadges&&completedRaces.length){
        // Reuse badge defs
        const hasUltra=completedRaces.some(r=>r._km>42.195||(r.c||[]).some(c=>c.toLowerCase().includes('ultra')));
        const distsDone=new Set();
        completedRaces.forEach(r=>{if(r._km>=10)distsDone.add('10K');if(r._km>=21)distsDone.add('21K');if(r._km>=42)distsDone.add('42K');});
        const monthsActive=new Set();
        completedRaces.forEach(r=>{const dt=new Date(r.d+'T00:00:00');monthsActive.add(dt.getFullYear()+'-'+dt.getMonth());});
        let hasStreak=false;
        const now=new Date();
        for(let i=0;i<10;i++){const d=new Date(now.getFullYear(),now.getMonth()-i,1);const k1=d.getFullYear()+'-'+d.getMonth();const d2=new Date(d.getFullYear(),d.getMonth()-1,1);const k2=d2.getFullYear()+'-'+d2.getMonth();const d3=new Date(d2.getFullYear(),d2.getMonth()-1,1);const k3=d3.getFullYear()+'-'+d3.getMonth();if(monthsActive.has(k1)&&monthsActive.has(k2)&&monthsActive.has(k3)){hasStreak=true;break;}}
        const defs=[
            {id:'firstRace',icon:'🏅',test:completedRaces.length>=1},{id:'firstTrail',icon:'🌲',test:trailCount>=1},
            {id:'firstIntl',icon:'🌎',test:countriesSet.size>=2},{id:'first10K',icon:'🔟',test:distsDone.has('10K')},
            {id:'first21K',icon:'🏃',test:distsDone.has('21K')},{id:'first42K',icon:'🎖️',test:distsDone.has('42K')},
            {id:'firstUltra',icon:'⚡',test:hasUltra},{id:'100km',icon:'💯',test:totalKm>=100},
            {id:'500km',icon:'🔥',test:totalKm>=500},{id:'1000km',icon:'👑',test:totalKm>=1000},
            {id:'streak3',icon:'📆',test:hasStreak}
        ];
        const unlocked=defs.filter(d=>d.test);
        if(unlocked.length){
            badgesHTML='<div class="pid-badges">';
            unlocked.forEach(d=>{
                const bName=t['badge'+d.id.charAt(0).toUpperCase()+d.id.slice(1)]||d.id;
                badgesHTML+=`<span class="pid-badge">${d.icon} ${bName}</span>`;
            });
            badgesHTML+='</div>';
        }
    }

    // Stats section
    let statsHTML='';
    if(showStats&&completedRaces.length){
        const trailPct=Math.round((trailCount/(trailCount+roadCount||1))*100);
        statsHTML=`<div class="pid-stats">
            <div class="pid-stat"><div class="pid-stat-num">${completedRaces.length}</div><div class="pid-stat-label">${t.pidRaces||'carreras'}</div></div>
            <div class="pid-stat"><div class="pid-stat-num">${Math.round(totalKm)}<span class="pid-stat-unit">K</span></div><div class="pid-stat-label">km</div></div>
            <div class="pid-stat"><div class="pid-stat-num">${countriesSet.size}</div><div class="pid-stat-label">${t.pidCountries||'países'}</div></div>
            <div class="pid-stat"><div class="pid-stat-num">${trailPct}%</div><div class="pid-stat-label">Trail</div></div>
        </div>`;
        // Best times
        const btEntries=Object.entries(bestTimes).sort((a,b)=>{const order=['5K','10K','21K','42K'];const ia=order.indexOf(a[0]),ib=order.indexOf(b[0]);return(ia===-1?99:ia)-(ib===-1?99:ib);});
        if(btEntries.length){
            statsHTML+=`<div class="pid-best-times"><div class="pid-section-label">${t.pidBestTime||'Mejor'}</div><div class="pid-times-grid">`;
            btEntries.forEach(([label,data])=>{
                statsHTML+=`<div class="pid-time-card"><div class="pid-time-dist">${label}</div><div class="pid-time-val">${esc(data.time)}</div></div>`;
            });
            statsHTML+='</div></div>';
        }
    }

    // Race history
    let historyHTML='';
    if(showHistory&&completedRaces.length){
        historyHTML=`<div class="pid-history"><div class="pid-section-label">${t.pidRunnerSince||'Historial'}</div><div class="pid-history-list">`;
        completedRaces.slice(0,20).forEach(r=>{
            const dt=new Date(r.d+'T00:00:00');
            const dateStr=dt.toLocaleDateString(locale,{day:'numeric',month:'short',year:'numeric'});
            const comp=r._comp;
            const typeClass=r.t==='trail'?'type-trail':'type-road';
            const country=countries.find(c=>c.id===r._country);
            historyHTML+=`<div class="pid-race-row">
                <div class="pid-race-date">${dateStr}</div>
                <div class="pid-race-info">
                    <div class="pid-race-name">${esc(r.n)}</div>
                    <div class="pid-race-meta"><span class="${typeClass}">${r.t==='trail'?'Trail':(t.road||'Asfalto')}</span> · ${esc(r.l)}${country?' · '+country.name:''}${comp.finish_time?' · '+esc(comp.finish_time):''}${comp.distance_run?' · '+esc(comp.distance_run):''}</div>
                </div>
            </div>`;
        });
        historyHTML+='</div></div>';
    }

    // Team info
    let teamHTML='';
    if(profile.team_name){
        teamHTML=`<div class="pid-team"><span class="pid-team-label">${t.pidTeam||'Equipo'}:</span> ${esc(profile.team_name)}</div>`;
    }

    // No races fallback
    let emptyHTML='';
    if(!completedRaces.length){
        emptyHTML=`<div class="my-races-empty" style="padding:1.5rem 0">${t.pidNoRaces||'Este runner aún no tiene carreras registradas'}</div>`;
    }

    container.innerHTML=`<div class="pulz-id-card">
        <div class="pulz-id-close" onclick="closePulzId()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>
        <div class="pid-header">
            <div class="pid-avatar">${initial}</div>
            <div class="pid-name-block">
                <div class="pid-name">${esc(name)}</div>
                <div class="pid-handle">@${esc(username)}</div>
                ${joinYear?`<div class="pid-since">${t.pidRunnerSince||'Runner desde'} ${joinYear}</div>`:''}
            </div>
        </div>
        ${teamHTML}
        ${countryNames.length?`<div class="pid-countries">${countryNames.map(n=>'<span class="pid-country-tag">'+esc(n)+'</span>').join('')}</div>`:''}
        ${badgesHTML}
        ${statsHTML}
        ${emptyHTML}
        ${historyHTML}
        <div class="pid-footer">
            <div class="pid-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <div class="pid-tagline">${t.ftTagline||'La plataforma runner de Latinoamérica'}</div>
        </div>
    </div>`;
}

function closePulzId(){
    const el=document.getElementById('pulzIdOverlay');
    if(el)el.classList.remove('open');
    document.body.style.overflow='';
    if(location.hash.startsWith('#runner/'))history.replaceState(null,'',location.pathname);
}

/* Init on page load */
document.addEventListener('DOMContentLoaded', () => {
    // If Supabase CDN already loaded (cached), init immediately
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        try { initAuth(); } catch(e) { /* auth init failed */ }
    }
    // Otherwise, just load fallback data so site works immediately
    // Supabase onload will call initAuth() when CDN finishes loading
    if (typeof buildDD === 'function') buildDD();
    // Apply saved language on load
    if (lang !== 'es') setLang(lang);
});
