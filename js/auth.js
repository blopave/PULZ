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
async function authSignUp(email, password, role = 'runner', orgData = null, teamData = null) {
    if (!sbClient) { showAuthError(T[lang].authErrService||'Service unavailable'); return; }
    showAuthLoading(true);
    clearAuthError();

    /* Restrict role to runner/organizer/team — admin requires manual DB assignment */
    const safeRole = ['organizer','team'].includes(role) ? role : 'runner';
    const { data, error } = await sbClient.auth.signUp({
        email,
        password,
        options: {
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
        // Retry with backoff to wait for the trigger to create the profile
        (async () => {
            for (let i = 0; i < 5; i++) {
                await new Promise(r => setTimeout(r, 1000 * (i + 1)));
                const { error } = await sbClient.from('profiles').update(orgUpdate).eq('id', uid);
                if (!error) return;
            }
            if(typeof showToast==='function')showToast(T[lang].orgProfileError||'No pudimos guardar los datos de tu organización. Completalos desde tu perfil.','error');
        })();
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
        (async () => {
            for (let i = 0; i < 5; i++) {
                await new Promise(r => setTimeout(r, 1000 * (i + 1)));
                const { error } = await sbClient.from('profiles').update(teamUpdate).eq('id', uid);
                if (!error) return;
            }
            if(typeof showToast==='function')showToast(T[lang].teamProfileEmpty||'No pudimos guardar los datos de tu equipo. Completalos desde tu perfil.','error');
        })();
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
    favorites = [];
    alerts = [];
    teamRaces = [];
    if(typeof teamFollows!=='undefined')teamFollows=[];
    if(typeof completions!=='undefined')completions={};
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
    const details = encodeURIComponent(r.desc || r.n + ' - ' + r.c.join(', '));

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
        const isAdmin = role === 'admin';
        const isTeam = role === 'team';

        const btn = document.createElement('div');
        btn.id = 'authHeaderBtn';
        btn.className = 'auth-avatar';
        if (isOrg) btn.classList.add('auth-avatar-org');
        if (isAdmin) btn.classList.add('auth-avatar-admin');
        if (isTeam) btn.classList.add('auth-avatar-team');
        btn.onclick = toggleUserMenu;
        btn.innerHTML = `<span>${esc(initial)}</span>`;
        headerRight.appendChild(btn);

        const t = T[lang];
        let menuItems = '';
        const roleName = isAdmin ? 'Admin' : isOrg ? (t.authRoleOrg || 'Organizador') : isTeam ? (t.authRoleTeam || 'Running Team') : 'Runner';
        const roleClass = isAdmin ? 'role-admin' : isOrg ? 'role-org' : isTeam ? 'role-team' : 'role-runner';
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
                    ${t.adminPanel||'Panel admin'}
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
                    <input type="password" class="auth-input" id="authPassword" placeholder="${t.authPassHint}" autocomplete="new-password" oninput="updatePasswordStrength(this.value)">
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
                    <label class="auth-label">${t.authPassConfirmLabel || 'Confirmar contraseña'}</label>
                    <input type="password" class="auth-input" id="authPasswordConfirm" placeholder="${t.authPassConfirmHint || 'Repetí tu contraseña'}" autocomplete="new-password">
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
        { label: t.passWeak, color: '#ef4444' },
        { label: t.passFair, color: '#f59e0b' },
        { label: t.passGood, color: '#3b82f6' },
        { label: t.passStrong, color: '#22c55e' }
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
    if (overlay) overlay.classList.add('open');
    if (modal) modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeRaceModal() {
    const overlay = document.getElementById('raceOverlay');
    const modal = document.getElementById('raceModal');
    if (overlay) overlay.classList.remove('open');
    if (modal) modal.classList.remove('open');
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
        listHTML = `<div class="my-races-empty">${t.myRacesEmpty || 'Todavía no publicaste ninguna carrera.'}</div>`;
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

    document.getElementById('raceModalBody').innerHTML = `
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${t.authMyRaces || 'Mis carreras'}</h2>
            <p class="auth-subtitle">${myRaces.length} ${myRaces.length === 1 ? (t.raceOne || 'carrera publicada') : (t.racePlural || 'carreras publicadas')}</p>
        </div>
        ${insightSummary}
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
        calendarHTML = `<div class="my-races-empty">${t.teamCalendarEmpty || 'Tu equipo aún no marcó carreras.'}</div>`;
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

    document.getElementById('raceModalBody').innerHTML = `
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${t.teamCalendarTitle || 'Calendario del equipo'}</h2>
            <p class="auth-subtitle">${myTeamRaces.length} ${t.teamCalendarTotal||'carreras marcadas'}</p>
        </div>
        ${nextHTML}
        ${shareHTML}
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
                    <div class="planner-race-meta">${esc(r.l)} · <span class="${typeClass}">${r.t==='trail'?'Trail':(t.road||'Asfalto')}</span> · ${(r.c||[]).join(', ')}</div>
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
            const compBadge = completed
                ? `<div class="season-race-badge"><span class="completion-badge" onclick="event.stopPropagation();openEnhancedCompletion('${esc(r._fid)}',${JSON.stringify(r.c||[]).replace(/'/g,"\\'")})" style="cursor:pointer" title="${t.raceEdit||'Editar'}">✓${compTime ? ' ' + esc(compTime) : ''}</span></div>`
                : `<div class="season-race-badge"><button class="completion-mark-btn" onclick="event.stopPropagation();openEnhancedCompletion('${esc(r._fid)}',${JSON.stringify(r.c||[]).replace(/'/g,"\\'")})">${t.completionMark || 'Completar'}</button></div>`;
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
                </div>`;
        });
        listHTML += '</div>';
    }

    if (!favRaces.length) {
        listHTML = `<div class="my-races-empty">${t.seasonEmpty || 'Guardá carreras para armar tu temporada.'}</div>`;
    }

    // Alert races
    let alertsHTML = '';
    if (typeof alerts !== 'undefined' && alerts.length) {
        alertsHTML = `<div class="season-section-title" style="margin-top:1rem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg> ${t.seasonAlerts || 'Alertas activas'}: ${alerts.length}</div>`;
    }

    // Annual stats section
    const completedRaces=past.filter(r=>isCompleted(r._fid));
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
            <button class="season-action-btn" id="compareBtn" onclick="openCompareFromSeason()" style="display:none">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                ${t.compareBtn||'Comparar'}
            </button>
        </div>`:'';

    document.getElementById('raceModalBody').innerHTML = `
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${t.authMySeason || 'Mi temporada'}</h2>
            <p class="auth-subtitle">${currentProfile?.display_name || currentUser.email?.split('@')[0] || 'Runner'} · ${now.getFullYear()}</p>
        </div>
        ${nextRaceHTML}
        ${statsHTML}
        ${actionBtnsHTML}
        ${alertsHTML}
        ${annualStatsHTML}
        ${listHTML}
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
    if(!isCompleted(raceId)){
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
function icsEscape(s){return(s||'').replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n');}

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
            <div class="compare-row"><span class="compare-label">${t.dDist||'Distancias'}</span><span class="compare-val">${(r.c||[]).join(', ')}</span></div>
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

    // Also load which of those members have favorited team races
    const memberIds=members.map(m=>m.user_id);
    const memberFavs=memberIds.length?await loadMemberFavorites(memberIds):{};

    // Team races for overlap calculation
    const teamRaceSet=new Set(typeof teamRaces!=='undefined'?teamRaces:[]);

    if(!members.length){
        document.getElementById('raceModalBody').innerHTML=`
            <div class="auth-header">
                <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
                <h2 class="auth-title">${t.teamMembersTitle||'Miembros del equipo'}</h2>
                <p class="auth-subtitle">${t.teamMembersSub||'Runners que se unieron a tu equipo'}</p>
            </div>
            <div class="my-races-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28" style="display:block;margin:0 auto 0.5rem"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>
                ${t.teamMembersEmpty||'Todavía no hay runners en tu equipo'}
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

        // Stat pills
        let pills='';
        if(racesNum>0)pills+=`<span class="member-pill">${racesNum} ${t.teamMemberRaces||'carreras'}</span>`;
        if(kmNum>0)pills+=`<span class="member-pill">${Math.round(kmNum)}${t.teamMemberKm||'km'}</span>`;
        if(effortNum)pills+=`<span class="member-pill">⚡${effortNum}</span>`;
        if(overlap>0)pills+=`<span class="member-pill accent">${overlap} ${t.teamMembersOverlap||'en común'}</span>`;
        if(!pills)pills=`<span class="member-pill muted">${t.teamMembersNoData||'Sin actividad aún'}</span>`;

        listHTML+=`
            <div class="team-member-card">
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
            </div>`;
    });
    listHTML+='</div>';

    document.getElementById('raceModalBody').innerHTML=`
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${t.teamMembersTitle||'Miembros del equipo'}</h2>
            <p class="auth-subtitle">${members.length} ${t.teamMembersCount||'miembros'}</p>
        </div>
        ${teamStatsHTML}
        ${listHTML}
    `;
}

function openAdminPanel() {
    closeUserMenu();
    showToast(T[lang].toastComingSoon, 'info');
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
