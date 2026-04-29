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

/* ============================================
   LUCIDE ICONS — Sistema oficial de iconografía PULZ
   https://lucide.dev — MIT License
   Inline SVG paths con stroke-width=2, currentColor. Coherente con la estética premium.
   ============================================ */
const LUCIDE_ICONS = {
    'medal': '<circle cx="12" cy="15" r="6"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="15" r="2"/><path d="m9 18-1 5 4-2 4 2-1-5"/>',
    'mountain': '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
    'globe': '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    'flag': '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
    'award': '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/>',
    'zap': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    'trending-up': '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    'flame': '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    'crown': '<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>',
    'map': '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
    'plane': '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    'calendar-check': '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>',
    'calendar': '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    'sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    'cloud': '<path d="M17.5 19a4.5 4.5 0 1 0-1.96-8.55 6 6 0 1 0-11.32 4.05A4 4 0 0 0 6.5 19z"/>',
    'cloud-rain': '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>',
    'wind': '<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>',
    'snowflake': '<path d="m10 20-1.25-2.5L6 18"/><path d="M10 4 8.75 6.5 6 6"/><path d="m14 20 1.25-2.5L18 18"/><path d="m14 4 1.25 2.5L18 6"/><path d="m17 21-3-6h-4"/><path d="m17 3-3 6 1.5 3"/><path d="M2 12h6.5L10 9"/><path d="m20 10-1.5 2 1.5 2"/><path d="M22 12h-6.5L14 15"/><path d="m4 10 1.5 2L4 14"/><path d="m7 21 3-6-1.5-3"/><path d="m7 3 3 6h4"/>',
    'thermometer-sun': '<path d="M12 9a4 4 0 0 0-2 7.5"/><path d="M12 3v2"/><path d="m6.6 18.4-1.4 1.4"/><path d="M20 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/><path d="M4 13H2"/><path d="M6.6 7.6 5.2 6.2"/>',
    'mail-check': '<path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><path d="m16 19 2 2 4-4"/>',
    'thumbs-up': '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H7V10l4.34-9.66a1.93 1.93 0 0 1 2.83 1z"/>',
    'thumbs-down': '<path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H17v12l-4.34 9.66a1.93 1.93 0 0 1-2.83-1z"/>',
    'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    'map-pin': '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    'lightbulb': '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    'trophy': '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    'star': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    'check': '<polyline points="20 6 9 17 4 12"/>',
    'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    'mail': '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    'flag-triangle-right': '<path d="M7 22V2l10 5-10 5"/>',
    'user-plus': '<path d="M2 21a8 8 0 0 1 13.292-6"/><circle cx="10" cy="8" r="5"/><path d="M19 16v6"/><path d="M22 19h-6"/>',
    'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    'link-2': '<path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/>',
    'hash': '<line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>',
    'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    'copy': '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'inbox': '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    'megaphone': '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    'calendar-days': '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
    'plus': '<path d="M5 12h14"/><path d="M12 5v14"/>',
    'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    'bell': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    'user-minus': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="22" x2="16" y1="11" y2="11"/>'
};

/**
 * Devuelve un SVG inline de Lucide listo para insertar en HTML.
 * @param {string} name - Nombre del icono (ver LUCIDE_ICONS)
 * @param {number} size - Tamaño en píxeles (default 16)
 * @param {string} extraClass - Clase CSS adicional (opcional)
 * @returns {string} SVG inline o string vacío si el icono no existe
 */
function lucideIcon(name, size = 16, extraClass = '') {
    const path = LUCIDE_ICONS[name];
    if (!path) return '';
    const cls = extraClass ? ` class="lucide ${extraClass}"` : ' class="lucide"';
    return `<svg${cls} xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

/* ============================================
   PULZ ID — validación, reservas y disponibilidad
   El PULZ ID es identidad permanente del usuario en PULZ.
   Reglas: 3-30 caracteres, lowercase, números y guiones, único global.
   ============================================ */
const PULZ_ID_MIN = 3;
const PULZ_ID_MAX = 30;
const PULZ_ID_REGEX = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
const PULZ_ID_RESERVED = new Set([
    'admin','administrator','root','pulz','support','help','oficial','official','staff',
    'team','runner','runners','org','organizer','organizers','user','users',
    'null','undefined','api','www','app','mail','email','ftp',
    'about','contact','privacy','terms','login','signup','signin','signout','logout',
    'register','dashboard','settings','profile','public','home','docs','blog',
    'pulz-lat','pulz-app','test','demo','example'
]);

/**
 * Valida un PULZ ID localmente (sin verificar disponibilidad en BD).
 * @param {string} value
 * @returns {{valid: boolean, errorKey: string|null}} errorKey es la clave de traducción del error.
 */
function validatePulzIdLocal(value) {
    if (!value) return { valid: false, errorKey: 'pidErrEmpty' };
    if (value.length < PULZ_ID_MIN) return { valid: false, errorKey: 'pidErrShort' };
    if (value.length > PULZ_ID_MAX) return { valid: false, errorKey: 'pidErrLong' };
    if (!PULZ_ID_REGEX.test(value)) return { valid: false, errorKey: 'pidErrFormat' };
    if (PULZ_ID_RESERVED.has(value)) return { valid: false, errorKey: 'pidErrReserved' };
    return { valid: true, errorKey: null };
}

/* Estado de la validación en vivo del campo PULZ ID en signup. */
let _pulzIdCheckTimer = null;
let _pulzIdLastChecked = '';
let _pulzIdIsValid = false;

/**
 * Validación en vivo del campo PULZ ID del signup form.
 * Llamada en oninput del input. Debounce 500ms para el check de disponibilidad.
 */
function onPulzIdInput(input) {
    // Normalizar input: lowercase + solo chars válidos
    const original = input.value;
    const normalized = original.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (original !== normalized) {
        const pos = input.selectionStart;
        input.value = normalized;
        try { input.setSelectionRange(pos - (original.length - normalized.length), pos - (original.length - normalized.length)); } catch (e) {}
    }
    const value = normalized.trim();
    _pulzIdIsValid = false;

    const statusEl = document.getElementById('pulzIdStatus');
    const previewEl = document.getElementById('pulzIdSlugPreview');
    if (previewEl) previewEl.textContent = value || '...';

    const t = T[lang] || {};
    if (!statusEl) return;

    // Validación local instantánea
    const localCheck = validatePulzIdLocal(value);
    if (!localCheck.valid) {
        if (value === '') {
            statusEl.className = 'pulz-id-status';
            statusEl.innerHTML = '';
        } else {
            statusEl.className = 'pulz-id-status error';
            statusEl.innerHTML = `${lucideIcon('x', 12)} <span>${esc(t[localCheck.errorKey] || localCheck.errorKey)}</span>`;
        }
        if (_pulzIdCheckTimer) { clearTimeout(_pulzIdCheckTimer); _pulzIdCheckTimer = null; }
        return;
    }

    // Validación remota con debounce
    statusEl.className = 'pulz-id-status checking';
    statusEl.innerHTML = `<span class="auth-submit-loader" style="display:inline-block;position:static;width:12px;height:12px;border-width:2px;border-top-color:var(--txt3)"></span> <span>${esc(t.pidChecking || 'Verificando disponibilidad...')}</span>`;

    if (_pulzIdCheckTimer) clearTimeout(_pulzIdCheckTimer);
    _pulzIdCheckTimer = setTimeout(async () => {
        const checkValue = value;
        _pulzIdLastChecked = checkValue;
        try {
            const available = await checkUsernameAvailable(checkValue);
            // Race: si el user siguió tipeando, ignorar
            if (_pulzIdLastChecked !== checkValue) return;
            if (available) {
                _pulzIdIsValid = true;
                statusEl.className = 'pulz-id-status ok';
                statusEl.innerHTML = `${lucideIcon('check', 12)} <span>${esc(t.pidAvailable || 'Disponible')}</span>`;
            } else {
                statusEl.className = 'pulz-id-status error';
                statusEl.innerHTML = `${lucideIcon('x', 12)} <span>${esc(t.pidTaken || 'Este PULZ ID ya está en uso')}</span>`;
            }
        } catch (e) {
            statusEl.className = 'pulz-id-status error';
            statusEl.innerHTML = `${lucideIcon('alert-triangle', 12)} <span>${esc(t.pidCheckErr || 'No pudimos verificar. Probá de nuevo.')}</span>`;
        }
    }, 500);
}

/**
 * Actualiza el prefijo de la URL preview según el rol seleccionado en signup.
 * Llamada desde selectAuthRole().
 */
function updatePulzIdPrefix(role) {
    const prefixEl = document.getElementById('pulzIdPrefix');
    if (!prefixEl) return;
    const slug = role === 'team' ? 'team' : role === 'organizer' ? 'org' : 'runner';
    prefixEl.textContent = `pulz.lat/#${slug}/`;
}

/**
 * Verifica si el usuario logueado tiene PULZ ID. Si no, muestra un modal bloqueante
 * que lo obliga a configurarlo antes de continuar usando PULZ.
 * Se llama después de loadProfile() en initAuth y onAuthStateChange.
 */
function enforcePulzIdRequired() {
    if (!currentUser || !currentProfile) return;
    if (currentProfile.username && currentProfile.username.trim()) return;
    // Solo mostrar una vez por sesión (si ya está abierto, no duplicar)
    if (document.getElementById('pulzIdRequiredOverlay')) return;

    const t = T[lang] || {};
    const role = currentProfile.role === 'team' ? 'team' : currentProfile.role === 'organizer' ? 'org' : 'runner';

    const overlay = document.createElement('div');
    overlay.id = 'pulzIdRequiredOverlay';
    overlay.className = 'pulz-id-required-overlay';
    overlay.innerHTML = `
        <div class="pulz-id-required-card" role="dialog" aria-modal="true" aria-labelledby="pulzIdRequiredTitle">
            <div class="auth-header">
                <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
                <h2 class="auth-title" id="pulzIdRequiredTitle">${esc(t.pidSignupLabel || 'PULZ ID')}</h2>
                <p class="auth-subtitle">${esc(t.pidRequiredSub || t.pidSignupHint || 'Tu @ único para que te encuentren en PULZ')}</p>
            </div>
            <div id="pulzIdRequiredError" class="auth-error"></div>
            <div class="auth-field auth-field-pulz-id">
                <div class="pulz-id-input-wrap">
                    <span class="pulz-id-prefix">pulz.lat/#${role}/</span>
                    <input type="text" class="auth-input pulz-id-input" id="pulzIdRequiredInput" placeholder="${esc(t.pidSignupPh || 'tu-pulz-id')}" autocomplete="off" maxlength="${PULZ_ID_MAX}" autocapitalize="off" autocorrect="off" spellcheck="false" oninput="onPulzIdRequiredInput(this)" onkeydown="if(event.key==='Enter'){event.preventDefault();submitPulzIdRequired();}" autofocus required>
                </div>
                <div class="pulz-id-status" id="pulzIdRequiredStatus"></div>
                <div class="auth-field-hint">${esc(t.pidSignupRules || 'Entre 3 y 30 caracteres. Solo letras minúsculas, números y guiones. Es permanente.')}</div>
            </div>
            <button class="auth-submit" id="pulzIdRequiredSubmit" onclick="submitPulzIdRequired()">
                <span class="auth-submit-text">${esc(t.pidSave || 'Guardar PULZ ID')}</span>
                <span class="auth-submit-loader"></span>
            </button>
        </div>
    `;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    setTimeout(() => { document.getElementById('pulzIdRequiredInput')?.focus(); }, 50);
}

/* Validación en vivo del input del modal bloqueante (variante de onPulzIdInput) */
let _pulzIdReqIsValid = false;
let _pulzIdReqCheckTimer = null;
let _pulzIdReqLastChecked = '';

function onPulzIdRequiredInput(input) {
    const original = input.value;
    const normalized = original.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (original !== normalized) input.value = normalized;
    const value = normalized.trim();
    _pulzIdReqIsValid = false;

    const statusEl = document.getElementById('pulzIdRequiredStatus');
    const t = T[lang] || {};
    if (!statusEl) return;

    const localCheck = validatePulzIdLocal(value);
    if (!localCheck.valid) {
        if (value === '') {
            statusEl.className = 'pulz-id-status';
            statusEl.innerHTML = '';
        } else {
            statusEl.className = 'pulz-id-status error';
            statusEl.innerHTML = `${lucideIcon('x', 12)} <span>${esc(t[localCheck.errorKey] || localCheck.errorKey)}</span>`;
        }
        if (_pulzIdReqCheckTimer) { clearTimeout(_pulzIdReqCheckTimer); _pulzIdReqCheckTimer = null; }
        return;
    }

    statusEl.className = 'pulz-id-status checking';
    statusEl.innerHTML = `<span class="auth-submit-loader" style="display:inline-block;position:static;width:12px;height:12px;border-width:2px;border-top-color:var(--txt3)"></span> <span>${esc(t.pidChecking || 'Verificando disponibilidad...')}</span>`;

    if (_pulzIdReqCheckTimer) clearTimeout(_pulzIdReqCheckTimer);
    _pulzIdReqCheckTimer = setTimeout(async () => {
        const checkValue = value;
        _pulzIdReqLastChecked = checkValue;
        try {
            const available = await checkUsernameAvailable(checkValue);
            if (_pulzIdReqLastChecked !== checkValue) return;
            if (available) {
                _pulzIdReqIsValid = true;
                statusEl.className = 'pulz-id-status ok';
                statusEl.innerHTML = `${lucideIcon('check', 12)} <span>${esc(t.pidAvailable || 'Disponible')}</span>`;
            } else {
                statusEl.className = 'pulz-id-status error';
                statusEl.innerHTML = `${lucideIcon('x', 12)} <span>${esc(t.pidTaken || 'Este PULZ ID ya está en uso')}</span>`;
            }
        } catch (e) {
            statusEl.className = 'pulz-id-status error';
            statusEl.innerHTML = `${lucideIcon('alert-triangle', 12)} <span>${esc(t.pidCheckErr || 'No pudimos verificar. Probá de nuevo.')}</span>`;
        }
    }, 500);
}

async function submitPulzIdRequired() {
    const t = T[lang] || {};
    const input = document.getElementById('pulzIdRequiredInput');
    const errorEl = document.getElementById('pulzIdRequiredError');
    const btn = document.getElementById('pulzIdRequiredSubmit');
    if (!input || !btn) return;

    const value = input.value.trim();
    const showErr = (msg) => { if (errorEl) errorEl.textContent = msg; };
    showErr('');

    const localCheck = validatePulzIdLocal(value);
    if (!localCheck.valid) { showErr(t[localCheck.errorKey] || t.pidErrInvalid || 'PULZ ID inválido'); return; }

    btn.classList.add('loading');
    const available = await checkUsernameAvailable(value);
    if (!available) { btn.classList.remove('loading'); showErr(t.pidTaken || 'Este PULZ ID ya está en uso'); return; }

    const result = await updateProfile({ username: value });
    btn.classList.remove('loading');
    if (result.error) { showErr(result.error.message || t.pidProfileError || 'No pudimos guardar tu PULZ ID'); return; }

    // Reflejar en estado local para que el resto de la app vea el username
    if (currentProfile) currentProfile.username = value;

    // Cerrar overlay y restaurar scroll
    const overlay = document.getElementById('pulzIdRequiredOverlay');
    if (overlay) overlay.remove();
    document.body.style.overflow = '';

    if (typeof showToast === 'function') showToast(t.pidSaved || 'PULZ ID guardado', 'success');
    if (typeof updateAuthUI === 'function') updateAuthUI();
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
            await Promise.allSettled([
                loadFavorites(),
                loadAlerts(),
                loadTeamRaces(),
                typeof loadTeamFollows === 'function' ? loadTeamFollows() : Promise.resolve(),
                typeof loadCompletions === 'function' ? loadCompletions() : Promise.resolve(),
                typeof loadUnreadNotificationsCount === 'function' ? loadUnreadNotificationsCount() : Promise.resolve(),
                (typeof loadTeamAnnouncementsFromDB === 'function' && currentProfile?.role === 'team') ? loadTeamAnnouncementsFromDB() : Promise.resolve()
            ]);
            enforcePulzIdRequired();
        }
    } catch (e) {
        /* session check failed — continue without auth */
    }

    // Load data from DB
    await loadRacesFromDB();
    await loadFavCounts();

    updateAuthUI();
    // On page load with restored session: respect hash, otherwise stay on home (no auto-redirect on refresh)

    authInitialized = true;

    // Listen for auth changes
    sbClient.auth.onAuthStateChange(async (event, session) => {
        currentUser = session?.user || null;
        if (currentUser) {
            await loadProfile();
            await Promise.allSettled([
                loadFavorites(),
                loadAlerts(),
                loadTeamRaces(),
                typeof loadTeamFollows === 'function' ? loadTeamFollows() : Promise.resolve(),
                typeof loadCompletions === 'function' ? loadCompletions() : Promise.resolve(),
                typeof loadUnreadNotificationsCount === 'function' ? loadUnreadNotificationsCount() : Promise.resolve(),
                (typeof loadTeamAnnouncementsFromDB === 'function' && currentProfile?.role === 'team') ? loadTeamAnnouncementsFromDB() : Promise.resolve()
            ]);
            enforcePulzIdRequired();
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
            // After login, take the user straight to their profile dashboard
            setTimeout(() => { if(typeof openProfile==='function') openProfile('home'); }, 400);
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

async function authSignUp(email, password, role = 'runner', orgData = null, teamData = null, runnerData = null, pulzId = null) {
    if (!sbClient) { showAuthError(T[lang].authErrService||'Service unavailable'); return; }
    showAuthLoading(true);
    clearAuthError();

    const safeRole = ['organizer','team'].includes(role) ? role : 'runner';

    // Compute display_name from the role-specific data so we never fall back to the email prefix
    let displayName;
    if (safeRole === 'organizer') displayName = orgData?.org_name || email.split('@')[0];
    else if (safeRole === 'team') displayName = teamData?.team_name || email.split('@')[0];
    else displayName = runnerData?.display_name || email.split('@')[0];

    const userMetadata = {
        role: safeRole,
        display_name: displayName
    };
    if (pulzId) userMetadata.username = pulzId;
    if (safeRole === 'runner' && runnerData) {
        userMetadata.first_name = runnerData.first_name;
        userMetadata.last_name = runnerData.last_name;
    }

    const { data, error } = await sbClient.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: window.location.origin,
            data: userMetadata
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
        if (pulzId) orgUpdate.username = pulzId;
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
        if (pulzId) teamUpdate.username = pulzId;
        const uid = data.user.id;
        retryProfileUpdate(uid, teamUpdate, T[lang].teamProfileEmpty || 'No pudimos guardar los datos de tu equipo. Completalos desde tu perfil.');
    }

    // If runner, persist PULZ ID to profile (display_name comes from user_metadata via trigger).
    if (safeRole === 'runner' && pulzId && data.user) {
        const uid = data.user.id;
        retryProfileUpdate(uid, { username: pulzId }, T[lang].pidProfileError || 'No pudimos guardar tu PULZ ID. Configuralo desde tu perfil.');
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
    // Cerrar dashboard ANTES de signOut para feedback inmediato
    if (typeof closeProfile === 'function') closeProfile();
    closeUserMenu();
    document.body.classList.remove('is-logged-in');
    document.body.classList.remove('profile-mode');

    // Limpiar overlays bloqueantes (PULZ ID required, panel invitar, etc.)
    document.getElementById('pulzIdRequiredOverlay')?.remove();
    document.getElementById('teamInviteOverlay')?.remove();
    document.body.style.overflow = '';

    // Limpiar caches en memoria
    currentUser = null;
    currentProfile = null;
    if (typeof favorites !== 'undefined') favorites = [];
    if (typeof alerts !== 'undefined') alerts = [];
    if (typeof teamRaces !== 'undefined') teamRaces = [];
    if (typeof teamFollows !== 'undefined') teamFollows = [];
    if (typeof completions !== 'undefined') completions = {};
    if (typeof unreadNotificationsCount !== 'undefined') unreadNotificationsCount = 0;

    // Forzar redirección al home (clean URL, sin hash de perfil)
    if (location.hash === '#perfil') {
        try { history.replaceState(null, '', location.pathname || '/'); } catch (e) {}
    }

    // Sign out en Supabase (puede tardar; lo hacemos al final, después del feedback visual)
    try {
        if (sbClient) await sbClient.auth.signOut();
    } catch (e) { /* ignore */ }

    syncSentryUser();
    updateAuthUI();
    if (activeCountry && typeof renderRaces === 'function') renderRaces(activeCountry);

    if (typeof showToast === 'function') {
        const t = T[lang] || {};
        showToast(t.authLoggedOut || 'Sesión cerrada', 'info');
    }
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

    document.body.classList.toggle('is-logged-in', !!currentUser);

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

        const displayName = getUserDisplayName();
        const initial = (displayName[0] || 'U').toUpperCase();
        const role = currentProfile?.role || 'runner';
        const isOrg = role === 'organizer';
        const isTeam = role === 'team';

        const t0 = T[lang];
        const profileLabel = t0.authMySeason || 'Mi perfil';

        const btn = document.createElement('div');
        btn.id = 'authHeaderBtn';
        btn.className = 'profile-pill';
        if (isOrg) btn.classList.add('profile-pill-org');
        if (isTeam) btn.classList.add('profile-pill-team');

        const pendingBadge = (isTeam && typeof teamPendingsCount !== 'undefined' && teamPendingsCount > 0)
            ? `<span class="profile-pill-badge" aria-label="${esc(teamPendingsCount + ' pendientes')}">${teamPendingsCount > 9 ? '9+' : teamPendingsCount}</span>`
            : '';

        btn.innerHTML = `
            <button type="button" class="profile-pill-main" onclick="openProfile()" aria-label="${esc(profileLabel)}">
                <span class="profile-pill-avatar">${esc(initial)}${pendingBadge}</span>
                <span class="profile-pill-label">${esc(profileLabel)}</span>
            </button>
            <span class="profile-pill-divider" aria-hidden="true"></span>
            <button type="button" class="profile-pill-chevron" onclick="event.stopPropagation();toggleUserMenu()" aria-label="Abrir menú" aria-haspopup="menu">
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><polyline points="2,4 6,8 10,4"/></svg>
            </button>
        `;
        headerRight.appendChild(btn);

        const t = T[lang];
        let menuItems = '';
        const roleName = isOrg ? (t.authRoleOrg || 'Organizador') : isTeam ? (t.authRoleTeam || 'Running Team') : 'Runner';
        menuItems += `<div class="user-menu-role"><span class="user-menu-role-dot"></span>${esc(roleName)}</div>`;

        // Mi perfil — opens the full-screen profile dashboard
        menuItems += `
            <button class="user-menu-item" onclick="openProfile()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/></svg>
                ${t.authMySeason || 'Mi perfil'}
            </button>`;

        // Mi temporada — runner-only (the temporada section only exists for runners)
        if (role === 'runner') {
            menuItems += `
                <button class="user-menu-item" onclick="openProfile('temporada')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h4l3-9 4 18 3-9h4"/></svg>
                    ${t.authSeasonItem || 'Mi temporada'}
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
        menu.innerHTML = menuItems;
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
    const pill = document.getElementById('authHeaderBtn');
    if (menu) menu.classList.toggle('open');
    if (pill) pill.classList.toggle('menu-open', menu?.classList.contains('open'));
}

function closeUserMenu() {
    const menu = document.getElementById('userMenu');
    const pill = document.getElementById('authHeaderBtn');
    if (menu) menu.classList.remove('open');
    if (pill) pill.classList.remove('menu-open');
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
                <div class="auth-field auth-field-pulz-id">
                    <label class="auth-label" for="authPulzId">${t.pidSignupLabel || 'PULZ ID'} <span class="auth-required">*</span></label>
                    <div class="auth-field-hint auth-field-hint-top">${t.pidSignupHint || 'Tu @ único para que te encuentren en PULZ'}</div>
                    <div class="pulz-id-input-wrap">
                        <span class="pulz-id-prefix" id="pulzIdPrefix">pulz.lat/#runner/</span>
                        <input type="text" class="auth-input pulz-id-input" id="authPulzId" placeholder="${t.pidSignupPh || 'tu-pulz-id'}" autocomplete="off" maxlength="${PULZ_ID_MAX}" autocapitalize="off" autocorrect="off" spellcheck="false" oninput="onPulzIdInput(this)" required aria-required="true">
                    </div>
                    <div class="pulz-id-preview"><span id="pulzIdSlugPreview">...</span></div>
                    <div class="pulz-id-status" id="pulzIdStatus"></div>
                    <div class="auth-field-hint">${t.pidSignupRules || 'Entre 3 y 30 caracteres. Solo letras minúsculas, números y guiones. Es permanente.'}</div>
                </div>
                <div id="runnerFields" class="auth-org-fields">
                    <div class="auth-org-grid">
                        <div class="auth-field">
                            <label class="auth-label" for="authFirstName">${t.authFirstName || 'Nombre'} *</label>
                            <input type="text" class="auth-input" id="authFirstName" placeholder="${t.authFirstNamePh || 'Pablo'}" autocomplete="given-name" oninput="updateDisplayNamePreview()">
                        </div>
                        <div class="auth-field">
                            <label class="auth-label" for="authLastName">${t.authLastName || 'Apellido'} *</label>
                            <input type="text" class="auth-input" id="authLastName" placeholder="${t.authLastNamePh || 'Vela'}" autocomplete="family-name" oninput="updateDisplayNamePreview()">
                        </div>
                    </div>
                    <div class="auth-field">
                        <label class="auth-label" for="authDisplayName">${t.authDisplayName || 'Cómo querés que te vean'}</label>
                        <input type="text" class="auth-input" id="authDisplayName" placeholder="${t.authDisplayNamePh || 'Pablo V.'}" autocomplete="off" maxlength="40">
                        <div class="auth-field-hint">${t.authDisplayNameHint || 'Opcional. Si lo dejás vacío usamos tu nombre + inicial del apellido.'}</div>
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
            <div class="auth-form" style="margin-top:1.5rem">
                <button class="auth-submit" onclick="showAuthView('login')">
                    <span class="auth-submit-text">${t.authLogin}</span>
                </button>
            </div>
        `;

    } else if (view === 'reset-sent') {
        body.innerHTML = `
            <div class="auth-header">
                <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
                <div class="auth-success-icon">${lucideIcon('mail-check',32)}</div>
                <h2 class="auth-title">${t.authResetSentTitle}</h2>
                <p class="auth-subtitle">${t.authResetSentSub}</p>
            </div>
            <div class="auth-form" style="margin-top:1.5rem">
                <button class="auth-submit" onclick="closeAuthModal()">
                    <span class="auth-submit-text">${t.authClose}</span>
                </button>
            </div>
        `;
    }
}

/* Build a default display_name from first + last (e.g. "Pablo V.") */
function _buildDefaultDisplayName(first, last) {
    const f = (first || '').trim();
    const l = (last || '').trim();
    if (!f && !l) return '';
    if (!l) return f;
    return `${f} ${l[0].toUpperCase()}.`;
}

/* Best-effort display name with a smart fallback chain:
   1. profile.display_name (if it is NOT just the email prefix)
   2. first_name + last initial (built from user_metadata)
   3. user_metadata.display_name (newer signups)
   4. email prefix (last resort) */
function getUserDisplayName() {
    if (!currentUser) return 'Runner';
    const emailPrefix = (currentUser.email || '').split('@')[0];
    const profileName = (currentProfile?.display_name || '').trim();
    const meta = currentUser.user_metadata || {};
    const fromMeta = _buildDefaultDisplayName(meta.first_name, meta.last_name);

    if (profileName && profileName !== emailPrefix) return profileName;
    if (fromMeta) return fromMeta;
    if ((meta.display_name || '').trim() && meta.display_name !== emailPrefix) return meta.display_name;
    return emailPrefix || 'Runner';
}

/* Live update placeholder of display_name input as user types name/last */
function updateDisplayNamePreview() {
    const first = document.getElementById('authFirstName')?.value || '';
    const last = document.getElementById('authLastName')?.value || '';
    const ph = _buildDefaultDisplayName(first, last) || (T[lang]?.authDisplayNamePh || 'Pablo V.');
    const dn = document.getElementById('authDisplayName');
    if (dn) dn.placeholder = ph;
}

/* ============================================
   ROLE SELECTOR
   ============================================ */
function selectAuthRole(btn) {
    document.querySelectorAll('.auth-role-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const role = btn.dataset.role;
    const runnerFields = document.getElementById('runnerFields');
    const orgFields = document.getElementById('orgFields');
    const teamFields = document.getElementById('teamFields');
    const modal = document.getElementById('authModal');
    if (runnerFields) runnerFields.style.display = role === 'runner' ? 'flex' : 'none';
    if (orgFields) orgFields.style.display = role === 'organizer' ? 'flex' : 'none';
    if (teamFields) teamFields.style.display = role === 'team' ? 'flex' : 'none';
    if (modal) modal.classList.toggle('auth-wide', role === 'organizer' || role === 'team');
    updatePulzIdPrefix(role);

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

async function handleSignup() {
    const email = document.getElementById('authEmail')?.value?.trim();
    const password = document.getElementById('authPassword')?.value;
    const passwordConfirm = document.getElementById('authPasswordConfirm')?.value;
    const pulzId = document.getElementById('authPulzId')?.value?.trim() || '';
    const t = T[lang];

    if (!email) { showAuthError(t.authErrEmail); return; }
    if (!password || password.length < 8) { showAuthError(t.authErrPassLen); return; }
    if (!/[A-Z]/.test(password)) { showAuthError(t.authErrPassUpper); return; }
    if (!/[0-9]/.test(password)) { showAuthError(t.authErrPassNumber); return; }
    if (password !== passwordConfirm) { showAuthError(t.authErrPassMatch); return; }

    // PULZ ID validation (formato + reservas + disponibilidad final)
    const pidLocal = validatePulzIdLocal(pulzId);
    if (!pidLocal.valid) { showAuthError(t[pidLocal.errorKey] || t.pidErrInvalid || 'PULZ ID inválido'); return; }
    const pidAvailable = await checkUsernameAvailable(pulzId);
    if (!pidAvailable) { showAuthError(t.pidTaken || 'Este PULZ ID ya está en uso'); return; }

    if (!document.getElementById('authTermsCheck')?.checked) { showAuthError(t.authErrTerms); return; }

    const activeRole = document.querySelector('.auth-role-btn.active');
    const role = activeRole?.dataset.role || 'runner';

    let runnerData = null;
    let orgData = null;
    let teamData = null;
    if (role === 'runner') {
        const firstName = document.getElementById('authFirstName')?.value?.trim();
        const lastName = document.getElementById('authLastName')?.value?.trim();
        const customDisplay = document.getElementById('authDisplayName')?.value?.trim();
        if (!firstName) { showAuthError(t.authErrFirstName || 'Ingresá tu nombre'); return; }
        if (!lastName) { showAuthError(t.authErrLastName || 'Ingresá tu apellido'); return; }
        if (firstName.length > 40 || lastName.length > 40) { showAuthError(t.authErrNameLen || 'Nombre o apellido demasiado largos'); return; }
        const displayName = customDisplay || _buildDefaultDisplayName(firstName, lastName);
        runnerData = {
            first_name: firstName,
            last_name: lastName,
            display_name: displayName
        };
    } else if (role === 'organizer') {
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

    authSignUp(email, password, role, orgData, teamData, runnerData, pulzId);
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
    if (!e.target.closest('.profile-pill') && !e.target.closest('.auth-avatar') && !e.target.closest('.user-menu')) {
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

    // Si estabamos en una sección "loading placeholder" (edit, races) del dashboard,
    // refrescar a la home para evitar que quede "Abriendo …" pegado.
    if (document.body.classList.contains('profile-mode')
        && typeof _profileSection !== 'undefined'
        && (_profileSection === 'edit' || _profileSection === 'races')
        && typeof profileNav === 'function') {
        // 'races' del organizer abre modal externo; del team es inline. Solo refresh si 'edit'.
        if (_profileSection === 'edit') profileNav('home');
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
                <div class="results-prompt-text">${lucideIcon('flag',14)} <strong>${esc(r.n)}</strong> ${t.resultsPrompt||'fue hace'} ${daysDiff} ${t.resultsPromptSuffix||'días. ¡Agregá los resultados!'}</div>
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
            <h2 class="auth-title">${t.authMyRaces || 'Mi perfil'}</h2>
            <p class="auth-subtitle">${esc(currentProfile?.org_name || t.authRoleOrg || 'Organizador')} · ${myRaces.length} ${myRaces.length === 1 ? (t.raceOne || 'carrera publicada') : (t.racePlural || 'carreras publicadas')}</p>
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
async function openMyTeam() {
    closeUserMenu();
    if(!currentUser||currentProfile?.role!=='team')return;
    const t = T[lang];
    const p = currentProfile || {};
    const locale = lang==='pt'?'pt-BR':lang==='en'?'en-US':'es-AR';
    const now = new Date();

    // --- Loading state
    document.getElementById('raceModalBody').innerHTML = `
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${t.authMyTeam || 'Mi perfil'}</h2>
            <p class="auth-subtitle">${esc(p.team_name || t.authRoleTeam || 'Running Team')}${p.team_city ? ' · ' + esc(p.team_city) : ''}</p>
        </div>
        <div class="teams-directory-loading"><span class="auth-submit-loader" style="display:block;position:static;border-top-color:var(--txt3)"></span></div>
    `;
    openRaceModal();

    // --- Fetch dashboard data in parallel
    const [members, pendings] = await Promise.all([
        loadTeamMembers(),
        loadTeamPendings()
    ]);

    // --- Team races (uses local cache `teamRaces` already populated by loadTeamRaces)
    const teamRaceList = [];
    if (typeof teamRaces !== 'undefined') {
        for (const cid of Object.keys(R)) {
            R[cid].forEach((r, idx) => {
                const rid = r._id || cid + '_' + idx;
                if (teamRaces.includes(rid)) {
                    teamRaceList.push({ ...r, _country: cid, _idx: idx, _rid: rid });
                }
            });
        }
    }
    teamRaceList.sort((a,b) => new Date(a.d+'T00:00:00') - new Date(b.d+'T00:00:00'));
    const upcomingTeamRaces = teamRaceList.filter(r => new Date(r.d+'T00:00:00') >= now);

    // --- Header stats
    const totalKm = members.reduce((s,m) => s + parseFloat(m.total_km||0), 0);
    const statsHTML = `
        <div class="season-stats">
            <div class="season-stat">
                <div class="season-stat-num">${members.length}</div>
                <div class="season-stat-label">${t.teamMembersCount || 'miembros'}</div>
            </div>
            <div class="season-stat">
                <div class="season-stat-num">${pendings.length}</div>
                <div class="season-stat-label">${t.teamPendingLabel || 'pendientes'}</div>
            </div>
            <div class="season-stat">
                <div class="season-stat-num">${teamRaceList.length}</div>
                <div class="season-stat-label">${t.teamCalendarTotal || 'carreras marcadas'}</div>
            </div>
            ${totalKm>0 ? `<div class="season-stat"><div class="season-stat-num">${Math.round(totalKm)}<span class="season-stat-unit">K</span></div><div class="season-stat-label">${t.teamMembersTotalKm || 'km del equipo'}</div></div>` : ''}
        </div>`;

    // --- Next race
    let nextHTML = '';
    if (upcomingTeamRaces.length) {
        const next = upcomingTeamRaces[0];
        const nextDt = new Date(next.d+'T00:00:00');
        const diffDays = Math.ceil((nextDt - now) / 86400000);
        const dateStr = nextDt.toLocaleDateString(locale, {day:'numeric', month:'long'});
        nextHTML = `
            <div class="season-next">
                <div class="season-next-label">${t.seasonNext || 'Próxima carrera'}</div>
                <div class="season-next-name">${esc(next.n)}</div>
                <div class="season-next-meta">${dateStr} · ${esc(next.l)}</div>
                <div class="season-next-countdown"><span class="season-countdown-num">${diffDays}</span> ${t.dDays || 'días'}</div>
            </div>`;
    }

    // --- Action buttons
    const actionsHTML = `
        <div class="season-action-btns">
            <button class="season-action-btn" onclick="openEditTeamProfile()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                ${t.teamEditProfileBtn || 'Editar perfil del team'}
            </button>
            <button class="season-action-btn" onclick="openTeamPlanner&&openTeamPlanner()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                ${t.teamMarkRacesBtn || 'Marcar carreras'}
            </button>
            <button class="season-action-btn" onclick="openTeamAnnounceModal&&openTeamAnnounceModal()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                ${t.teamAnnounceTitle || 'Anuncios'}
            </button>
        </div>`;

    // --- Pending postulations (only render section if any)
    let pendingsHTML = '';
    if (pendings.length) {
        pendingsHTML = `<div class="season-section-title">${t.teamPendingTitle || 'Pendientes de aprobar'} <span class="badge-count">${pendings.length}</span></div>`;
        pendingsHTML += '<div class="my-races-list">';
        pendings.forEach(pp => {
            const name = pp.profile?.display_name || 'Runner';
            const username = pp.profile?.username ? '@'+pp.profile.username : '';
            const initial = (name[0]||'R').toUpperCase();
            const since = pp.created_at ? new Date(pp.created_at).toLocaleDateString(locale, {day:'numeric', month:'short'}) : '';
            pendingsHTML += `
                <div class="my-race-item team-pending-item">
                    <div class="team-member-avatar" style="margin-right:0.6rem">${esc(initial)}</div>
                    <div class="my-race-info">
                        <div class="my-race-name">${esc(name)} ${username?`<span style="font-weight:400;color:var(--txt3);font-size:0.72rem;margin-left:0.3rem">${esc(username)}</span>`:''}</div>
                        <div class="my-race-meta">${t.teamPendingSince || 'Postuló'} ${since}</div>
                    </div>
                    <button class="my-race-btn team-approve" onclick="handleApproveTeamMember('${esc(pp.user_id)}')" title="${esc(t.teamApprove||'Aprobar')}" aria-label="${esc(t.teamApprove||'Aprobar')}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                    <button class="my-race-btn team-reject" onclick="handleRejectTeamMember('${esc(pp.user_id)}')" title="${esc(t.teamReject||'Rechazar')}" aria-label="${esc(t.teamReject||'Rechazar')}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>`;
        });
        pendingsHTML += '</div>';
    }

    // --- Members preview (top 4) + link to full list
    let membersHTML = '';
    if (members.length) {
        membersHTML = `<div class="season-section-title">${t.teamMembersTitle || 'Miembros del equipo'} <span class="badge-count">${members.length}</span></div>`;
        membersHTML += '<div class="team-members-list">';
        members.slice(0,4).forEach(m => {
            const name = m.display_name||'Runner';
            const initial = (name[0]||'R').toUpperCase();
            const racesNum = parseInt(m.races_completed||0);
            const kmNum = parseFloat(m.total_km||0);
            let pills = '';
            if (racesNum>0) pills += `<span class="member-pill">${racesNum} ${t.teamMemberRaces||'carreras'}</span>`;
            if (kmNum>0) pills += `<span class="member-pill">${Math.round(kmNum)}${t.teamMemberKm||'km'}</span>`;
            if (!pills) pills = `<span class="member-pill muted">${t.teamMembersNoData||'Sin actividad aún'}</span>`;
            membersHTML += `
                <div class="team-member-card" onclick="openMemberProfile&&openMemberProfile('${esc(m.user_id)}')" style="cursor:pointer">
                    <div class="team-member-header">
                        <div class="team-member-avatar">${esc(initial)}</div>
                        <div class="team-member-info">
                            <div class="team-member-name">${esc(name)}</div>
                            <div class="team-member-email">${esc(m.email||'')}</div>
                        </div>
                    </div>
                    <div class="team-member-pills">${pills}</div>
                </div>`;
        });
        membersHTML += '</div>';
        if (members.length>4) {
            membersHTML += `<button class="empty-cta" style="margin-top:0.6rem" onclick="openTeamMembers()"><span>${t.teamMembersViewAll||'Ver todos los miembros'}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>`;
        }
    } else {
        membersHTML = `<div class="season-section-title">${t.teamMembersTitle || 'Miembros del equipo'}</div>
            <div class="my-races-empty empty-state-rich">
                <div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg></div>
                <div class="empty-title">${t.teamMembersEmptyTitle||'Todavía no hay miembros'}</div>
                <div class="empty-sub">${t.teamMembersEmptySubV2||'Compartí el link público de tu equipo y los runners van a postularse para sumarse.'}</div>
                <button class="empty-cta" onclick="(async()=>{const url=location.origin+'/#team/'+((currentProfile&&currentProfile.id)||currentUser.id);try{await navigator.clipboard.writeText(url);if(typeof showToast==='function')showToast(T[lang].copied||'¡Copiado!','success');}catch(e){if(typeof showToast==='function')showToast(url,'info');}})()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    <span>${t.teamMembersEmptyCta||'Copiar link del equipo'}</span>
                </button>
            </div>`;
    }

    // --- Team races preview (next 3 upcoming)
    let racesHTML = '';
    if (teamRaceList.length) {
        racesHTML = `<div class="season-section-title">${t.teamRacesTitle || 'Carreras del equipo'} <span class="badge-count">${teamRaceList.length}</span></div>`;
        racesHTML += '<div class="my-races-list">';
        const previewRaces = upcomingTeamRaces.length ? upcomingTeamRaces.slice(0,3) : teamRaceList.slice(-3);
        previewRaces.forEach(r => {
            const dt = new Date(r.d+'T00:00:00');
            const dateStr = dt.toLocaleDateString(locale, {day:'numeric', month:'short'});
            const country = countries.find(c => c.id === r._country);
            const diffD = Math.ceil((dt-now)/86400000);
            racesHTML += `
                <div class="my-race-item season-race" onclick="closeRaceModal();setTimeout(()=>openDrawer('${esc(r._country)}',${r._idx}),300)" style="cursor:pointer">
                    <div class="my-race-info">
                        <div class="my-race-name">${esc(r.n)}</div>
                        <div class="my-race-meta">${dateStr} · ${esc(r.l)}${country ? ' · '+country.name : ''}</div>
                    </div>
                    ${diffD>=0?`<div class="season-race-badge"><span class="${r.t==='trail'?'type-trail':'type-road'}">${diffD}d</span></div>`:''}
                </div>`;
        });
        racesHTML += '</div>';
        racesHTML += `<button class="empty-cta" style="margin-top:0.6rem" onclick="openTeamRaces()"><span>${t.teamRacesViewAll||'Ver todas las carreras'}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>`;
    } else {
        racesHTML = `<div class="season-section-title">${t.teamRacesTitle || 'Carreras del equipo'}</div>
            <div class="my-races-empty empty-state-rich">
                <div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                <div class="empty-title">${t.teamCalEmptyTitle||'Tu equipo aún no marcó carreras'}</div>
                <div class="empty-sub">${t.teamCalEmptySub||'Marcá las carreras donde van a correr para mostrarlas en el calendario compartido.'}</div>
                <button class="empty-cta" onclick="closeRaceModal();setTimeout(()=>{const e=document.getElementById('csTrigger');if(e)e.scrollIntoView({behavior:'smooth',block:'center'});},300)">
                    <span>${t.teamCalEmptyCta||'Explorar carreras'}</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
            </div>`;
    }

    document.getElementById('raceModalBody').innerHTML = `
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${t.authMyTeam || 'Mi perfil'}</h2>
            <p class="auth-subtitle">${esc(p.team_name || t.authRoleTeam || 'Running Team')}${p.team_city ? ' · ' + esc(p.team_city) : ''}</p>
        </div>
        ${nextHTML}
        ${statsHTML}
        ${actionsHTML}
        ${pendingsHTML}
        ${racesHTML}
        ${membersHTML}
    `;
}

/* Edit team profile (the old form) — opened from the dashboard's "Editar perfil del team" action */
function openEditTeamProfile() {
    if(!currentUser||currentProfile?.role!=='team')return;
    const t = T[lang];
    const p = currentProfile || {};

    document.getElementById('raceModalBody').innerHTML = `
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${t.teamEditProfileTitle || 'Editar perfil del team'}</h2>
            <p class="auth-subtitle">${t.teamEditProfileSub || 'Actualizá los datos públicos de tu equipo'}</p>
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

/* Approve / Reject pending postulations (used from openMyTeam) */
async function handleApproveTeamMember(userId){
    const t = T[lang];
    const result = await approveTeamMember(userId);
    if (result.error) { showToast((result.error.message||'Error'),'error'); return; }
    if (typeof showToast==='function') showToast(t.teamMemberApproved||'Miembro aprobado','success');
    updateAuthUI(); // refresh header badge
    openMyTeam(); // refresh dashboard
}

async function handleRejectTeamMember(userId){
    const t = T[lang];
    const result = await rejectTeamMember(userId);
    if (result.error) { showToast((result.error.message||'Error'),'error'); return; }
    if (typeof showToast==='function') showToast(t.teamMemberRejected||'Postulación rechazada','info');
    updateAuthUI(); // refresh header badge
    openMyTeam(); // refresh dashboard
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
    // Refrescar el dashboard al home (sino queda con "Abriendo Editar perfil…")
    if (document.body.classList.contains('profile-mode') && typeof profileNav === 'function') {
        if (typeof renderProfileSidebar === 'function') renderProfileSidebar();
        profileNav('home');
    }
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
    let text=`${teamName} — Calendario de carreras\n\n`;
    upcoming.slice(0,10).forEach(r=>{
        const dt=new Date(r.d+'T00:00:00');
        const dateStr=dt.toLocaleDateString(lang==='pt'?'pt-BR':lang==='en'?'en-US':'es-ES',{day:'numeric',month:'short'});
        text+=`· ${dateStr} — ${r.n} (${r.l})\n`;
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
                if(compData.effort)parts.push(lucideIcon('zap',11)+' '+compData.effort+'/5');
                if(compData.weather){const wIconNames={sun:'sun',cloud:'cloud',rain:'cloud-rain',wind:'wind',cold:'snowflake',hot:'thermometer-sun'};parts.push(lucideIcon(wIconNames[compData.weather]||'sun',12));}
                if(compData.would_repeat===true)parts.push(lucideIcon('thumbs-up',11));
                if(compData.would_repeat===false)parts.push(lucideIcon('thumbs-down',11));
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
            <div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
            <div class="empty-title">${t.seasonEmptyTitle||'Tu temporada está vacía'}</div>
            <div class="empty-sub">${t.seasonEmptySub||'Tocá el + en cualquier carrera para sumarla a tu temporada.'}</div>
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
            <h2 class="auth-title">${t.authMySeason || 'Mi perfil'}</h2>
            <p class="auth-subtitle">${t.seasonHeader || 'Tu temporada'} ${now.getFullYear()} · ${esc(getUserDisplayName())}</p>
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
        {k:'sun',icon:'sun'},
        {k:'cloud',icon:'cloud'},
        {k:'rain',icon:'cloud-rain'},
        {k:'wind',icon:'wind'},
        {k:'cold',icon:'snowflake'},
        {k:'hot',icon:'thermometer-sun'}
    ];
    const weatherBtns=weatherOpts.map(w=>{
        const active=existing&&existing.weather===w.k?' active':'';
        return `<button type="button" class="weather-btn${active}" data-val="${w.k}" onclick="this.parentNode.querySelectorAll('.weather-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">${lucideIcon(w.icon,18)}<span>${t['logWeather'+w.k.charAt(0).toUpperCase()+w.k.slice(1)]||w.k}</span></button>`;
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
                    <button type="button" class="repeat-btn${wouldRepeatYes}" data-val="yes" onclick="this.parentNode.querySelectorAll('.repeat-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">${lucideIcon('thumbs-up',14)} ${t.logYes||'Sí'}</button>
                    <button type="button" class="repeat-btn${wouldRepeatNo}" data-val="no" onclick="this.parentNode.querySelectorAll('.repeat-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">${lucideIcon('thumbs-down',14)} ${t.logNo||'No'}</button>
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
        if(effortNum)pills+=`<span class="member-pill">${lucideIcon('zap',11)} ${effortNum}</span>`;
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
    const inactiveAlertHTML=inactiveCount>=2?`<div class="member-inactive-alert">${lucideIcon('alert-triangle',14)} ${inactiveCount} ${t.teamMemberInactiveAlert||'miembros inactivos hace +60 días'}</div>`:'';

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
        {id:'firstRace',icon:'medal',test:totalRaces>=1},
        {id:'firstTrail',icon:'mountain',test:trailCount>=1},
        {id:'firstIntl',icon:'globe',test:intlCountries>=2},
        {id:'first10K',icon:'flag-triangle-right',test:distsDone.has('10K')},
        {id:'first21K',icon:'flag-triangle-right',test:distsDone.has('21K')},
        {id:'first42K',icon:'award',test:distsDone.has('42K')},
        {id:'firstUltra',icon:'zap',test:hasUltra},
        {id:'100km',icon:'trending-up',test:totalKm>=100},
        {id:'500km',icon:'flame',test:totalKm>=500},
        {id:'1000km',icon:'crown',test:totalKm>=1000},
        {id:'2Countries',icon:'map',test:intlCountries>=3},
        {id:'3Countries',icon:'plane',test:intlCountries>=3},
        {id:'6Countries',icon:'globe',test:intlCountries>=6},
        {id:'streak3',icon:'calendar-check',test:hasStreak}
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
            <div class="badge-icon">${lucideIcon(b.icon,24)}</div>
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
            warnings.push({type:'conflict',text:`<strong>${lucideIcon('alert-triangle',12)} ${t.plannerConflict||'Conflicto'}</strong> ${esc(upcoming[i].n)} → ${esc(upcoming[i+1].n)} (${diff} ${t.dDays||'días'}). ${t.plannerRecovery||'Considerá tu recuperación.'}`});
        }
    }
    // Check gap months
    const mn=(T[lang].monthNames||['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']);
    const monthsWithRaces=new Set(upcoming.map(r=>r._dt.getMonth()));
    for(let m=now.getMonth();m<12;m++){
        if(!monthsWithRaces.has(m)){
            warnings.push({type:'gap',text:`<strong>${lucideIcon('calendar',12)} ${t.plannerGapMonth||'Sin carreras en'} ${mn[m]}</strong> ${t.plannerGapHint||'Explorá opciones'}`});
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
    const displayName=getUserDisplayName();
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
    const displayName=getUserDisplayName();
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

    const isEmpty = data.totalStamps === 0;
    const totalPlanned = Object.values(data.planned).reduce((s,n)=>s+n,0);

    let bodyHTML;
    if (isEmpty) {
        // Beautiful empty state — no stamps yet
        const plannedNote = totalPlanned > 0
            ? `<div class="passport-empty-planned"><span class="passport-empty-planned-num">${totalPlanned}</span> ${esc(totalPlanned===1?(t.passportPlannedOne||'carrera en agenda — completala y sumás tu primer sello.'):(t.passportPlannedMany||'carreras en agenda — completá una y sumás tu primer sello.'))}</div>`
            : '';
        bodyHTML = `
            <div class="passport-empty">
                <div class="passport-empty-icon" aria-hidden="true">
                    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="10" y="6" width="44" height="52" rx="3"/>
                        <line x1="10" y1="14" x2="54" y2="14"/>
                        <circle cx="32" cy="30" r="9" stroke-dasharray="2.5 3"/>
                        <line x1="20" y1="48" x2="44" y2="48" stroke-dasharray="2 3"/>
                        <line x1="24" y1="52" x2="40" y2="52" stroke-dasharray="2 3"/>
                    </svg>
                </div>
                <h3 class="passport-empty-title">${esc(t.passportEmptyTitle || 'Pasaporte en blanco.')}</h3>
                <p class="passport-empty-sub">${esc(t.passportEmptySub || 'Cada carrera que completes en Latinoamérica suma un sello al país. Tu mapa runner se construye corriendo.')}</p>

                <div class="passport-empty-steps">
                    <div class="passport-empty-step">
                        <span class="passport-empty-step-num">01</span>
                        <span class="passport-empty-step-label">${esc(t.passportEmptyStep1 || 'Guardá una carrera')}</span>
                    </div>
                    <div class="passport-empty-step">
                        <span class="passport-empty-step-num">02</span>
                        <span class="passport-empty-step-label">${esc(t.passportEmptyStep2 || 'Corré la carrera')}</span>
                    </div>
                    <div class="passport-empty-step">
                        <span class="passport-empty-step-num">03</span>
                        <span class="passport-empty-step-label">${esc(t.passportEmptyStep3 || 'Marcala como completada')}</span>
                    </div>
                </div>

                ${plannedNote}

                <div class="passport-empty-progress">
                    <span>0 / ${countries.length} ${esc(t.passportCountries || 'países')}</span>
                    <span class="passport-empty-progress-dot">·</span>
                    <span>0 ${esc(t.passportStamps || 'sellos')}</span>
                </div>

                <div class="passport-empty-cta-wrap">
                    <button class="auth-submit passport-empty-cta-btn" onclick="closeRaceModal();if(document.body.classList.contains('profile-mode')&&typeof profileNav==='function')profileNav('temporada');else if(typeof selC==='function')selC(countries[0]?.id)">
                        <span class="auth-submit-text">${esc(t.dashExploreRaces?.replace(' →','') || 'Explorar carreras')}</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </button>
                </div>
            </div>
        `;
    } else {
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

        const pct=Math.round(data.totalCountries/countries.length*100);
        const progressHTML=`<div class="passport-progress">
            <div class="passport-progress-label">${data.totalCountries}/${countries.length} ${t.passportCountries||'países'}</div>
            <div class="passport-progress-bar"><div class="passport-progress-fill" style="width:${pct}%"></div></div>
            <div class="passport-progress-pct">${pct}%</div>
        </div>`;

        const statsHTML=`<div class="passport-stats">
            <div class="passport-stat"><div class="passport-stat-num">${data.totalStamps}</div><div class="passport-stat-label">${t.passportStamps||'Sellos'}</div></div>
            <div class="passport-stat"><div class="passport-stat-num">${data.totalCountries}</div><div class="passport-stat-label">${t.passportCountries||'Países'}</div></div>
        </div>`;

        bodyHTML = `
            ${progressHTML}
            ${mapHTML}
            ${statsHTML}
            <div id="passportStampsDetail"></div>
            <div class="passport-actions">
                <button class="auth-submit" onclick="openPassportImage()">
                    <span class="auth-submit-text">${t.passportShare||'Compartir imagen'}</span>
                </button>
            </div>
        `;
    }

    document.getElementById('raceModalBody').innerHTML=`
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${t.passportTitle||'Tu Passport'}</h2>
            <p class="auth-subtitle">${esc(data.displayName)} · ${t.passportSub||'Mapa runner de Latinoamérica'}</p>
        </div>
        ${bodyHTML}
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
   TEAM — ANNOUNCEMENTS (persistencia en BD; localStorage como fallback)
   La BD ahora es la fuente de verdad. El INSERT en team_announcements dispara
   trigger SQL que crea notifications para todos los miembros del team.
   ============================================ */
let _teamAnnouncements=[];

async function loadTeamAnnouncementsFromDB(){
    if(!sbClient||!currentUser)return;
    try{
        const{data,error}=await sbClient.from('team_announcements').select('id,team_id,message,created_at').eq('team_id',currentUser.id).order('created_at',{ascending:true});
        if(!error&&Array.isArray(data)){
            _teamAnnouncements=data;
            try{localStorage.setItem('pulz_team_announcements',JSON.stringify(data));}catch(e){}
        }
    }catch(e){/* silent — fallback a localStorage */}
}

function loadTeamAnnouncements(){
    // Boot: leer cache local mientras la BD termina de cargar
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
                <button class="match-save-btn ${isFav?'saved':''}" onclick="event.stopPropagation();toggleFav('${esc(r._rid)}');this.classList.toggle('saved')" title="${t.matchSave||(isFav?'En mi temporada':'Agregar a mi temporada')}">
                    ${isFav
                        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>'
                        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'}
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

    const result=await updateProfile({ username:username });

    if(btn)btn.classList.remove('loading');
    if(result.error){showRaceError(result.error.message||result.error);return;}

    showToast(t.pidSaved||'PULZ ID guardado','success');
    if(typeof closeRaceModal==='function')closeRaceModal();
    // Refresh whatever profile section is open so the new @username shows up
    if(document.body.classList.contains('profile-mode')&&typeof profileNav==='function'&&typeof _profileSection!=='undefined'){
        if(typeof renderProfileSidebar==='function')renderProfileSidebar();
        profileNav(_profileSection||'home');
    }
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
            {id:'firstRace',icon:'medal',test:completedRaces.length>=1},{id:'firstTrail',icon:'mountain',test:trailCount>=1},
            {id:'firstIntl',icon:'globe',test:countriesSet.size>=2},{id:'first10K',icon:'flag-triangle-right',test:distsDone.has('10K')},
            {id:'first21K',icon:'flag-triangle-right',test:distsDone.has('21K')},{id:'first42K',icon:'award',test:distsDone.has('42K')},
            {id:'firstUltra',icon:'zap',test:hasUltra},{id:'100km',icon:'trending-up',test:totalKm>=100},
            {id:'500km',icon:'flame',test:totalKm>=500},{id:'1000km',icon:'crown',test:totalKm>=1000},
            {id:'streak3',icon:'calendar-check',test:hasStreak}
        ];
        const unlocked=defs.filter(d=>d.test);
        if(unlocked.length){
            badgesHTML='<div class="pid-badges">';
            unlocked.forEach(d=>{
                const bName=t['badge'+d.id.charAt(0).toUpperCase()+d.id.slice(1)]||d.id;
                badgesHTML+=`<span class="pid-badge">${lucideIcon(d.icon,12)} ${bName}</span>`;
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

    // Restore profile view if URL hash is #perfil (back button / refresh)
    // Esperar a que authInitialized + currentProfile estén listos (sino renderiza con role default 'runner')
    if (location.hash === '#perfil') {
        (async () => {
            let tries = 0;
            while ((!authInitialized || (currentUser && !currentProfile)) && tries < 60) {
                await new Promise(r => setTimeout(r, 100));
                tries++;
            }
            if (currentUser && typeof openProfile === 'function') openProfile();
        })();
    }
});

window.addEventListener('popstate', async () => {
    if (location.hash === '#perfil') {
        // Mismo wait que en load
        let tries = 0;
        while ((!authInitialized || (currentUser && !currentProfile)) && tries < 60) {
            await new Promise(r => setTimeout(r, 100));
            tries++;
        }
        if (currentUser && typeof openProfile === 'function') openProfile();
    } else {
        if (typeof closeProfile === 'function') closeProfile();
    }
});

/* ==========================================================================
   PROFILE VIEW — full-screen dashboard for Runner / Team / Organizer
   ========================================================================== */
let _profileSection = 'home';

function openProfile(section) {
    if (!currentUser) { openAuthModal('signup'); return; }
    closeUserMenu();
    const view = document.getElementById('profileView');
    if (!view) return;

    view.style.display = 'flex';
    document.body.classList.add('profile-mode');

    renderProfileSidebar();
    profileNav(section || _profileSection || 'home');

    if (location.hash !== '#perfil') {
        try { history.pushState(null, '', '#perfil'); } catch(e) {}
    }
}

function closeProfile() {
    const view = document.getElementById('profileView');
    if (view) view.style.display = 'none';
    document.body.classList.remove('profile-mode');
    if (location.hash === '#perfil') {
        try { history.pushState(null, '', location.pathname || '/'); } catch(e) {}
    }
}

function profileNav(section) {
    _profileSection = section;
    document.querySelectorAll('.profile-nav-btn').forEach(b =>
        b.classList.toggle('active', b.dataset && b.dataset.section === section)
    );
    const role = currentProfile?.role || 'runner';
    const content = document.getElementById('profileContent');
    if (!content) return;
    if (role === 'team') content.innerHTML = renderTeamSection(section);
    else if (role === 'organizer') content.innerHTML = renderOrganizerSection(section);
    else content.innerHTML = renderRunnerSection(section);
    const main = document.getElementById('profileMain');
    if (main) main.scrollTop = 0;
}

function renderProfileSidebar() {
    const t = T[lang] || {};
    const role = currentProfile?.role || 'runner';
    const sidebar = document.getElementById('profileSidebar');
    if (!sidebar) return;

    const name = role === 'team' ? (currentProfile?.team_name || 'Running Team')
              : role === 'organizer' ? (currentProfile?.org_name || 'Organizador')
              : getUserDisplayName();
    const initial = (name[0] || 'P').toUpperCase();
    const roleLabel = role === 'team' ? (t.authRoleTeam || 'Running Team')
                   : role === 'organizer' ? (t.authRoleOrg || 'Organizador')
                   : 'Runner';

    let nav = '';
    if (role === 'team') nav = renderTeamNav();
    else if (role === 'organizer') nav = renderOrganizerNav();
    else nav = renderRunnerNav();

    const meta = role === 'team' ? (currentProfile?.team_city || '')
              : role === 'organizer' ? (currentProfile?.org_country || '')
              : (currentProfile?.username ? '@' + currentProfile.username : '');

    sidebar.innerHTML = `
        <div class="profile-sidebar-brand">
            <div class="pulz-dot" aria-hidden="true"></div>
            <div class="pulz-text">PULZ</div>
        </div>
        <nav class="profile-nav">${nav}</nav>
        <div class="profile-sidebar-footer">
            <div class="profile-sidebar-utils">
                <button class="profile-util-btn" onclick="if(typeof toggleTheme==='function')toggleTheme()" aria-label="Cambiar tema">
                    <svg class="theme-icon-sun" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                    <svg class="theme-icon-moon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                </button>
                <div class="profile-lang-sw" role="group" aria-label="Idioma">
                    <button class="profile-lang-btn${lang==='es'?' active':''}" onclick="setLang('es')">ES</button>
                    <button class="profile-lang-btn${lang==='en'?' active':''}" onclick="setLang('en')">EN</button>
                    <button class="profile-lang-btn${lang==='pt'?' active':''}" onclick="setLang('pt')">PT</button>
                </div>
            </div>
            <button class="profile-nav-btn" onclick="authSignOut()">
                <span class="nav-label">${esc(t.authLogout || 'Cerrar sesión')}</span>
            </button>
        </div>
    `;
}

function _profileNavItem(it) {
    const badge = it.badge ? `<span class="nav-badge">${it.badge > 9 ? '9+' : it.badge}</span>` : '';
    return `<button class="profile-nav-btn" data-section="${it.id}" onclick="profileNav('${it.id}')"><span class="nav-label">${esc(it.label)}</span>${badge}</button>`;
}

function renderRunnerNav() {
    const t = T[lang] || {};
    const unread = (typeof unreadNotificationsCount !== 'undefined' && unreadNotificationsCount > 0) ? unreadNotificationsCount : 0;
    const items = [
        { id: 'home', label: t.navHome || 'Inicio' },
        { id: 'temporada', label: t.navTemporada || 'Mi temporada' },
        { id: 'trainings', label: t.navTrainings || 'Entrenamientos' },
        { id: 'notifications', label: t.navNotifications || 'Notificaciones', badge: unread },
        { id: 'stats', label: t.navStats || 'Estadísticas' },
        { id: 'passport', label: t.navPassport || 'Passport' },
        { id: 'pulzid', label: t.navPulzId || 'PULZ ID' },
        { id: 'settings', label: t.navSettings || 'Ajustes' }
    ];
    return items.map(_profileNavItem).join('');
}

function renderTeamNav() {
    const t = T[lang] || {};
    const unread = (typeof unreadNotificationsCount !== 'undefined' && unreadNotificationsCount > 0) ? unreadNotificationsCount : 0;
    const items = [
        { id: 'home', label: t.navHome || 'Inicio' },
        { id: 'members', label: t.navMembers || 'Miembros' },
        { id: 'notifications', label: t.navNotifications || 'Notificaciones', badge: unread },
        { id: 'races', label: t.navTeamRaces || 'Carreras del team' },
        { id: 'announcements', label: t.navAnnouncements || 'Anuncios' },
        { id: 'stats', label: t.navStats || 'Estadísticas' },
        { id: 'edit', label: t.navEdit || 'Editar perfil' }
    ];
    return items.map(_profileNavItem).join('');
}

function renderOrganizerNav() {
    const t = T[lang] || {};
    const unread = (typeof unreadNotificationsCount !== 'undefined' && unreadNotificationsCount > 0) ? unreadNotificationsCount : 0;
    const items = [
        { id: 'home', label: t.navHome || 'Inicio' },
        { id: 'races', label: t.navMyRaces || 'Mis carreras' },
        { id: 'notifications', label: t.navNotifications || 'Notificaciones', badge: unread },
        { id: 'analytics', label: t.navAnalytics || 'Analytics' },
        { id: 'public', label: t.navPublicProfile || 'Perfil público' },
        { id: 'edit', label: t.navEdit || 'Editar perfil' }
    ];
    return items.map(_profileNavItem).join('');
}

/* === RUNNER === */
function renderRunnerSection(section) {
    if (section === 'discover') return renderRunnerTemporada(); // legacy alias
    if (section === 'temporada') return renderRunnerTemporada();
    if (section === 'trainings') return renderRunnerTrainings();
    if (section === 'notifications') return renderNotificationsInline();
    if (section === 'stats') return renderRunnerStats();
    if (section === 'passport') return renderRunnerPassportHub();
    if (section === 'pulzid') return renderRunnerPulzIdHub();
    if (section === 'settings') return renderRunnerSettings();
    return renderRunnerHome();
}

function renderRunnerPassportHub() {
    const t = T[lang] || {};
    const data = (typeof getPassportData === 'function') ? getPassportData() : null;
    const visited = data ? data.totalCountries : 0;
    const stamps = data ? data.totalStamps : 0;
    const pct = Math.round((visited / countries.length) * 100);
    const introT = t.passportIntroT || '¿Qué es el Passport?';
    const introBody = (t.passportIntroBody || 'Cada vez que corrés una carrera, sumás un sello al país. Coleccioná los {N} países de Latinoamérica y armá tu historial runner como un pasaporte de viaje. Tocá un país visitado para ver tus sellos.').replace('{N}', countries.length);

    return `<div class="profile-content-wrap">
        <div class="profile-eyebrow">${esc(t.navPassport || 'Passport')}</div>
        <div class="profile-hero" style="margin-bottom:32px">
            <h1 class="profile-hero-title" style="font-size:clamp(48px,7vw,84px)">${esc(t.passportTitle1 || 'Tu mapa')}<br>${esc(t.passportTitle2 || 'runner')}<span class="accent">.</span></h1>
        </div>
        ${_sectionIntro('passport', `
            <strong>${esc(introT)}</strong>
            ${esc(introBody)}
        `)}
        <div class="ph-stats" style="margin-bottom:36px">
            <div class="ph-stat accent">
                <div class="ph-stat-label">${esc(t.statCountries || 'Países')}</div>
                <div class="ph-stat-value">${visited}<span class="unit">/${countries.length}</span></div>
            </div>
            <div class="ph-stat">
                <div class="ph-stat-label">${esc(t.statStamps || 'Sellos')}</div>
                <div class="ph-stat-value">${stamps}</div>
            </div>
            <div class="ph-stat">
                <div class="ph-stat-label">${esc(t.statProgress || 'Progreso')}</div>
                <div class="ph-stat-value">${pct}<span class="unit">%</span></div>
            </div>
            <div class="ph-stat">
                <div class="ph-stat-label">${esc(t.statNext || 'Próximo')}</div>
                <div class="ph-stat-value" style="font-size:24px;letter-spacing:-0.3px">${countries.length - visited}</div>
            </div>
        </div>
        <button class="profile-empty-cta" onclick="if(typeof openPulzPassport==='function')openPulzPassport()">
            ${esc(t.passportOpen || 'Abrir mi Passport')}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
    </div>`;
}

function renderRunnerSettings() {
    const t = T[lang] || {};
    const m = currentUser?.user_metadata || {};
    const p = currentProfile || {};
    const firstName = m.first_name || '';
    const lastName = m.last_name || '';
    const email = currentUser?.email || '';
    const displayName = p.display_name || m.display_name || '';
    const birthdate = m.birthdate || '';
    const gender = m.gender || '';
    const city = m.city || '';
    const country = m.country || '';
    const username = p.username || '';

    const countriesOpts = ['<option value="">—</option>'].concat(
        countries.map(c => `<option value="${esc(c.id)}"${c.id===country?' selected':''}>${esc(c.name)}</option>`)
    ).join('');

    return `<div class="profile-content-wrap">
        <div class="profile-eyebrow">${esc(t.navSettings || 'Ajustes')}</div>
        <div class="profile-hero" style="margin-bottom:32px">
            <h1 class="profile-hero-title" style="font-size:clamp(48px,7vw,84px)">${esc(t.settingsTitle1 || 'Ajustes')}<br>${esc(t.settingsTitle2 || 'de tu cuenta')}<span class="accent">.</span></h1>
        </div>

        <form class="settings-form" id="settingsForm" onsubmit="event.preventDefault();saveRunnerSettings()">
            <section class="settings-section">
                <h3 class="settings-section-title">${esc(t.settingsSection1 || 'Información personal')}</h3>
                <div class="settings-grid">
                    <div class="auth-field">
                        <label class="auth-label">${esc(t.settingsFirstName || 'Nombre')}</label>
                        <input type="text" class="auth-input" id="setFirstName" value="${esc(firstName)}" maxlength="40">
                    </div>
                    <div class="auth-field">
                        <label class="auth-label">${esc(t.settingsLastName || 'Apellido')}</label>
                        <input type="text" class="auth-input" id="setLastName" value="${esc(lastName)}" maxlength="40">
                    </div>
                    <div class="auth-field">
                        <label class="auth-label">${esc(t.settingsEmail || 'Email')}</label>
                        <input type="email" class="auth-input" value="${esc(email)}" disabled>
                        <div class="auth-field-hint">${esc(t.settingsEmailLocked || 'El email está vinculado a tu cuenta. Para cambiarlo, contactanos.')}</div>
                    </div>
                    <div class="auth-field">
                        <label class="auth-label">${esc(t.settingsBirthdate || 'Fecha de nacimiento')}</label>
                        <input type="date" class="auth-input" id="setBirthdate" value="${esc(birthdate)}">
                    </div>
                    <div class="auth-field">
                        <label class="auth-label">${esc(t.settingsGender || 'Género')}</label>
                        <select class="auth-input auth-select" id="setGender">
                            <option value="">—</option>
                            <option value="m"${gender==='m'?' selected':''}>${esc(t.settingsGenderM || 'Masculino')}</option>
                            <option value="f"${gender==='f'?' selected':''}>${esc(t.settingsGenderF || 'Femenino')}</option>
                        </select>
                    </div>
                    <div class="auth-field">
                        <label class="auth-label">${esc(t.settingsCountry || 'País')}</label>
                        <select class="auth-input auth-select" id="setCountry">${countriesOpts}</select>
                    </div>
                    <div class="auth-field settings-grid-full">
                        <label class="auth-label">${esc(t.settingsCity || 'Ciudad')}</label>
                        <input type="text" class="auth-input" id="setCity" value="${esc(city)}" maxlength="60">
                    </div>
                </div>
            </section>

            <section class="settings-section">
                <h3 class="settings-section-title">${esc(t.settingsSection2 || 'Cómo te ven')}</h3>
                <div class="auth-field">
                    <label class="auth-label">${esc(t.settingsDisplayName || 'Cómo querés que te vean')}</label>
                    <input type="text" class="auth-input" id="setDisplayName" value="${esc(displayName)}" maxlength="40">
                    <div class="auth-field-hint">${esc(t.settingsDisplayNameHint || 'Lo que ven los demás runners en tu perfil público.')}</div>
                </div>
            </section>

            <section class="settings-section">
                <h3 class="settings-section-title">${esc(t.settingsSection3 || 'PULZ ID')}</h3>
                <div class="settings-pulzid-row">
                    <div class="settings-pulzid-id">${username ? '@'+esc(username) : '—'}</div>
                    <button type="button" class="auth-submit settings-pulzid-btn" onclick="if(typeof openPulzIdSetup==='function')openPulzIdSetup()">
                        ${esc(username ? (t.settingsPulzIdEdit||'Editar PULZ ID') : (t.settingsPulzIdSet||'Configurar PULZ ID'))}
                    </button>
                </div>
                <div class="auth-field-hint" style="margin-top:0.5rem">${esc(t.settingsPulzIdHint || 'Tu @usuario único en PULZ. Compartilo con otros runners.')}</div>
            </section>

            <section class="settings-section">
                <h3 class="settings-section-title">${esc(t.settingsSection4 || 'Cuenta')}</h3>
                <button type="button" class="auth-text-btn settings-link" onclick="openAuthModal('reset')">${esc(t.settingsPasswordChange || 'Cambiar contraseña')}</button>
            </section>

            <div class="settings-actions">
                <button type="button" class="auth-text-btn" onclick="profileNav('settings')">${esc(t.settingsCancel || 'Cancelar')}</button>
                <button type="submit" class="auth-submit settings-save-btn" id="settingsSaveBtn">
                    <span class="auth-submit-text">${esc(t.settingsSave || 'Guardar cambios')}</span>
                </button>
            </div>
        </form>
    </div>`;
}

async function saveRunnerSettings() {
    if (!sbClient || !currentUser) return;
    const t = T[lang] || {};
    const btn = document.getElementById('settingsSaveBtn');
    const txtSpan = btn?.querySelector('.auth-submit-text');
    const originalText = txtSpan?.textContent;
    if (txtSpan) txtSpan.textContent = t.settingsSaving || 'Guardando…';
    if (btn) btn.disabled = true;

    const firstName = document.getElementById('setFirstName')?.value?.trim() || '';
    const lastName = document.getElementById('setLastName')?.value?.trim() || '';
    const displayName = document.getElementById('setDisplayName')?.value?.trim()
        || _buildDefaultDisplayName(firstName, lastName)
        || (currentUser.email?.split('@')[0] || 'Runner');
    const birthdate = document.getElementById('setBirthdate')?.value || '';
    const gender = document.getElementById('setGender')?.value || '';
    const country = document.getElementById('setCountry')?.value || '';
    const city = document.getElementById('setCity')?.value?.trim() || '';

    try {
        // Persist personal info to user_metadata (works without DB schema changes)
        const { error: metaErr } = await sbClient.auth.updateUser({
            data: {
                first_name: firstName,
                last_name: lastName,
                display_name: displayName,
                birthdate,
                gender,
                country,
                city
            }
        });
        if (metaErr) throw metaErr;

        // Sync display_name to profiles row (the column users actually read across the app)
        const { error: profErr } = await sbClient.from('profiles').update({ display_name: displayName }).eq('id', currentUser.id);
        if (profErr) throw profErr;

        if (currentProfile) currentProfile.display_name = displayName;
        if (typeof showToast === 'function') showToast(t.settingsSaved || 'Cambios guardados', 'success');

        // Refresh sidebar (name might have changed) and stay in settings
        if (typeof renderProfileSidebar === 'function') renderProfileSidebar();
        if (typeof updateAuthUI === 'function') updateAuthUI();
    } catch (e) {
        if (typeof showToast === 'function') showToast(e.message || 'Error al guardar', 'error');
    } finally {
        if (txtSpan && originalText) txtSpan.textContent = originalText;
        if (btn) btn.disabled = false;
    }
}

function renderRunnerPulzIdHub() {
    const t = T[lang] || {};
    const id = currentProfile?.username || '';
    const isSet = !!id;

    return `<div class="profile-content-wrap">
        <div class="profile-eyebrow">${esc(t.navPulzId || 'PULZ ID')}</div>
        <div class="profile-hero" style="margin-bottom:32px">
            <h1 class="profile-hero-title" style="font-size:clamp(48px,7vw,84px)">${esc(t.pulzidTitle1 || 'Tu identidad')}<br>${esc(t.pulzidTitle2 || 'runner')}<span class="accent">.</span></h1>
        </div>
        ${_sectionIntro('pulzid', `
            <strong>${esc(t.pulzidIntroT || '¿Qué es tu PULZ ID?')}</strong>
            ${esc(t.pulzidIntroBody || 'Un código único (tu @usuario) que te identifica en PULZ. Compartilo con otros runners para que vean tu temporada, tus carreras y tu pasaporte. Es tu carta de presentación dentro de la red.')}
        `)}
        ${isSet ? `
            <div class="ph-role-card" style="margin-bottom:28px">
                <div class="ph-role-tag" style="font-size:22px">@${esc(id)}</div>
                <div class="ph-role-desc">${esc(t.pulzidActive || 'Tu PULZ ID está activo. Compartilo o editalo cuando quieras.')}</div>
            </div>
            <button class="profile-empty-cta" onclick="if(typeof openPulzIdSetup==='function')openPulzIdSetup()">
                ${esc(t.pulzidEdit || 'Editar mi PULZ ID')}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
        ` : `
            <button class="profile-empty-cta" onclick="if(typeof openPulzIdSetup==='function')openPulzIdSetup()">
                ${esc(t.pulzidSetup || 'Configurar mi PULZ ID')}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
        `}
    </div>`;
}

function _profileLoadingSection(label) {
    return `<div class="profile-content-wrap"><span class="profile-eyebrow">${esc(label)}</span><div class="profile-empty"><div class="profile-empty-title">Abriendo ${esc(label)}…</div></div></div>`;
}

/* Intro card — shown on a section the first time, dismissable, persisted */
function _sectionIntro(key, body) {
    if (getLS('pulz-intro-' + key)) return '';
    const dismissLabel = (T[lang] && T[lang].introDismiss) || 'Cerrar explicación';
    return `<div class="section-intro" id="sectionIntro-${esc(key)}">
        <div class="section-intro-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        </div>
        <div class="section-intro-body">${body}</div>
        <button class="section-intro-dismiss" onclick="dismissSectionIntro('${esc(key)}')" aria-label="${esc(dismissLabel)}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
    </div>`;
}

function dismissSectionIntro(key) {
    setLS('pulz-intro-' + key, '1');
    const el = document.getElementById('sectionIntro-' + key);
    if (el) {
        el.style.transition = 'opacity 0.25s ease, transform 0.25s ease, max-height 0.3s ease, margin 0.25s ease, padding 0.25s ease';
        el.style.opacity = '0';
        el.style.transform = 'translateY(-6px)';
        el.style.maxHeight = '0';
        el.style.padding = '0';
        el.style.margin = '0';
        setTimeout(() => el.remove(), 320);
    }
}

function _gatherFavRaces() {
    const out = [];
    if (typeof favorites === 'undefined' || !favorites.length) return out;
    for (const cid of Object.keys(R || {})) {
        (R[cid] || []).forEach((r, idx) => {
            const rid = r._id || cid + '_' + idx;
            if (favorites.includes(rid)) out.push({ ...r, _country: cid, _idx: idx, _rid: rid });
        });
    }
    out.sort((a,b) => new Date(a.d+'T00:00:00') - new Date(b.d+'T00:00:00'));
    return out;
}

function _raceRow(r, opts) {
    opts = opts || {};
    const t = T[lang] || {};
    const locale = lang === 'pt' ? 'pt-BR' : lang === 'en' ? 'en-US' : 'es-AR';
    const dt = new Date(r.d + 'T00:00:00');
    const day = dt.toLocaleDateString(locale, { day: '2-digit' });
    const month = dt.toLocaleDateString(locale, { month: 'short' }).replace('.', '').toUpperCase();
    const year = dt.getFullYear();
    const country = countries.find(c => c.id === r._country);
    const isPast = dt < new Date();
    const isFav = (typeof favorites !== 'undefined' && favorites.includes(r._rid));
    const isCompleted = isFav && isPast && (typeof window.completions !== 'undefined' && window.completions && window.completions[r._rid]);

    // All distances (no limit)
    const pills = (r.c || []).map(c => `<span class="rr-pill">${esc(c)}</span>`).join('');
    const typeKey = r.t === 'trail' ? 'trail' : 'road';
    const typeLabel = r.t === 'trail' ? 'Trail' : (t.road || 'Asfalto');
    const iconicBadge = r.i ? `<span class="rr-iconic">★ ${esc(t.iconic || 'Icónica')}</span>` : '';
    const completedBadge = isCompleted ? `<span class="rr-completed">✓ ${esc(t.completionDone || 'Completada')}</span>` : '';

    // Action button
    let action;
    if (opts.unlike) {
        action = `<button class="rr-action rr-action-remove" onclick="event.stopPropagation();toggleFav('${esc(r._rid)}');setTimeout(()=>profileNav('${opts.refreshSection || 'temporada'}'),80)" aria-label="${esc(t.seasonRemove || 'Quitar de mi temporada')}" title="${esc(t.seasonRemove || 'Quitar de mi temporada')}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>`;
    } else {
        action = `<button class="rr-action rr-action-add${isFav?' is-added':''}" onclick="event.stopPropagation();toggleFav('${esc(r._rid)}')" aria-label="${esc(isFav?(t.seasonAdded||'En mi temporada'):(t.seasonAdd||'Agregar a mi temporada'))}" title="${esc(isFav?(t.seasonAdded||'En mi temporada'):(t.seasonAdd||'Agregar a mi temporada'))}">
            ${isFav
                ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"/></svg>'
                : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>'}
        </button>`;
    }

    return `<div class="profile-race-row${isPast?' is-past':''}" onclick="openDrawer('${esc(r._country)}',${r._idx})">
        <div class="rr-date">
            <span class="rr-date-month">${esc(month)}</span>
            <strong class="rr-date-day">${esc(day)}</strong>
            <span class="rr-date-year">${year}</span>
        </div>
        <div class="rr-info">
            <div class="rr-name-row">
                <h3 class="rr-name">${esc(r.n)}</h3>
                ${iconicBadge}
                ${completedBadge}
            </div>
            <div class="rr-meta">
                <span class="rr-meta-loc">${esc(r.l)}${country ? ` · ${esc(country.name)}` : ''}</span>
                <span class="rr-type rr-type-${typeKey}">● ${esc(typeLabel.toUpperCase())}</span>
            </div>
            <div class="rr-pills">${pills}</div>
        </div>
        ${action}
    </div>`;
}

function renderRunnerHome() {
    const t = T[lang] || {};
    const locale = lang === 'pt' ? 'pt-BR' : lang === 'en' ? 'en-US' : 'es-AR';
    const firstName = (currentUser?.user_metadata?.first_name || getUserDisplayName().split(' ')[0]);
    const now = new Date();
    const favRaces = _gatherFavRaces();
    const upcoming = favRaces.filter(r => new Date(r.d+'T00:00:00') >= now);
    const past = favRaces.filter(r => new Date(r.d+'T00:00:00') < now);
    const totalKm = upcoming.reduce((s,r) => {
        const max = (r.c||[]).reduce((m,c) => { const n = parseFloat(c); return !isNaN(n) && n > m ? n : m; }, 0);
        return s + max;
    }, 0);
    const visited = new Set(past.map(r => r._country)).size;

    let nextHTML;
    if (upcoming.length) {
        const next = upcoming[0];
        const dt = new Date(next.d+'T00:00:00');
        const diffDays = Math.ceil((dt - now) / 86400000);
        const dateStr = dt.toLocaleDateString(locale, {day:'numeric', month:'long'});
        const country = countries.find(c => c.id === next._country);
        nextHTML = `
            <div class="ph-next" onclick="openDrawer('${esc(next._country)}',${next._idx})">
                <div class="ph-next-eyebrow">${esc(t.dashNextRace || 'Próxima carrera')}</div>
                <div class="ph-next-name">${esc(next.n)}</div>
                <div class="ph-next-meta">${esc(dateStr)} · ${esc(next.l)}${country ? ' · '+country.name : ''}</div>
                <div class="ph-next-countdown">
                    <span class="ph-next-num">${diffDays}</span>
                    <span class="ph-next-label">${diffDays===1?(t.dashDay||'día'):(t.dashDays||'días')}</span>
                </div>
            </div>`;
    } else {
        nextHTML = `
            <div class="ph-next ph-next-empty" onclick="profileNav('temporada')">
                <div class="ph-next-eyebrow">${esc(t.dashNextRace || 'Próxima carrera')}</div>
                <div class="ph-next-name">${esc(t.dashNoRacesYet || 'Sin carreras aún')}</div>
                <div class="ph-next-meta">${esc(t.dashNoRacesSub || 'Explorá países y guardá tu primera carrera.')}</div>
                <div class="ph-next-cta">${esc(t.dashExploreRaces || 'Explorar carreras →')}</div>
            </div>`;
    }

    return `
        <div class="profile-content-wrap profile-home-compact">
            <div class="ph-header">
                <div class="profile-role-badge">
                    <span class="profile-role-badge-dot" aria-hidden="true"></span>
                    <span>Runner</span>
                    <span class="profile-role-badge-sep">·</span><span class="profile-role-badge-meta">${esc(t.dashSeason || 'Temporada')} ${now.getFullYear()}</span>
                </div>
                <h1 class="ph-title">${esc(t.dashHello || 'Hola,')} ${esc(firstName)}<span class="accent">.</span></h1>
            </div>

            <div class="ph-role-card">
                <div class="ph-role-desc">${esc(t.roleRunnerDesc || 'Guardás carreras, armás tu calendario, sumás sellos al passport y trackeás tu temporada.')}</div>
            </div>

            <div class="ph-stats">
                <div class="ph-stat accent">
                    <div class="ph-stat-label">${esc(t.statSaved || 'Guardadas')}</div>
                    <div class="ph-stat-value">${favRaces.length}</div>
                </div>
                <div class="ph-stat">
                    <div class="ph-stat-label">${esc(t.statToRun || 'Por correr')}</div>
                    <div class="ph-stat-value">${upcoming.length}</div>
                </div>
                <div class="ph-stat">
                    <div class="ph-stat-label">${esc(t.statKmPlan || 'Km en agenda')}</div>
                    <div class="ph-stat-value">${Math.round(totalKm)}<span class="unit">K</span></div>
                </div>
                <div class="ph-stat">
                    <div class="ph-stat-label">${esc(t.statCountries || 'Países')}</div>
                    <div class="ph-stat-value">${visited}<span class="unit">/${countries.length}</span></div>
                </div>
            </div>

            <div class="ph-bottom ph-bottom-solo">
                ${nextHTML}
            </div>
        </div>`;
}

function renderRunnerTemporada() {
    const t = T[lang] || {};
    const favRaces = _gatherFavRaces();
    const now = new Date();
    const upcoming = favRaces.filter(r => new Date(r.d+'T00:00:00') >= now);
    const past = favRaces.filter(r => new Date(r.d+'T00:00:00') < now);

    // Discover selector — country picker (same as before, but inline at bottom)
    const selected = window._discoverCountry || null;
    const country = selected ? countries.find(c => c.id === selected) : null;
    const ddHTML = countries.map(c => {
        const cnt = (R[c.id] || []).filter(r => new Date(r.d+'T00:00:00') >= new Date()).length;
        return `<div class="co" onclick="_selectDiscoverCountry('${esc(c.id)}')"><span class="co-flag">${esc(c.code)}</span><span class="co-name">${esc(c.name)}</span><span class="co-count">${cnt} ${esc(t.cR || 'carreras')}</span></div>`;
    }).join('');

    let discoverListHTML = '';
    if (country) {
        const races = (R[selected] || [])
            .map((r, idx) => ({ ...r, _country: selected, _idx: idx, _rid: r._id || selected + '_' + idx }))
            .filter(r => new Date(r.d+'T00:00:00') >= now)
            .filter(r => !(typeof favorites !== 'undefined' && favorites.includes(r._rid)))
            .sort((a,b) => new Date(a.d+'T00:00:00') - new Date(b.d+'T00:00:00'));
        const racesPreview = races.slice(0, 12);
        const racesHTML = racesPreview.length
            ? racesPreview.map(r => _raceRow(r)).join('')
            : `<div class="profile-empty"><div class="profile-empty-title">${esc(t.dashAllSavedTitle || 'Ya guardaste todas las carreras de')} ${esc(country.name)}</div><div class="profile-empty-sub">${esc(t.dashAllSavedSub || 'Probá con otro país.')}</div></div>`;
        discoverListHTML = `<div class="profile-section">
            <div class="profile-section-header"><div><h2 class="profile-section-title">${esc(country.name)}.</h2><div class="profile-section-sub">${races.length} ${races.length===1?(t.dashRaceUpcoming||'carrera próxima que todavía no guardaste.'):(t.dashRacesUpcoming||'carreras próximas que todavía no guardaste.')}</div></div></div>
            <div class="profile-race-list">${racesHTML}</div>
        </div>`;
    }

    const discoverBlock = `
        <div class="profile-section">
            <div class="profile-section-header">
                <div>
                    <h2 class="profile-section-title">${esc(t.temporadaAddTitle || 'Sumá más carreras.')}</h2>
                    <div class="profile-section-sub">${esc((t.temporadaAddSub || 'Elegí un país para descubrir carreras y agregarlas a tu temporada.'))}</div>
                </div>
            </div>
            <div class="cs discover-cs${country ? ' has-selection' : ''}">
                <button class="cs-trigger" id="discoverTrigger" onclick="_toggleDiscoverDD()" aria-expanded="false" aria-haspopup="listbox">
                    <div class="cs-icon" aria-hidden="true">↓</div>
                    <div class="cs-label">${country ? esc(country.name) : esc(t.selC || 'Elegí un país')}</div>
                    <div class="cs-arrow" aria-hidden="true"><svg viewBox="0 0 12 12"><polyline points="2,4 6,8 10,4"/></svg></div>
                </button>
                ${country ? `<button class="cs-clear" onclick="_clearDiscoverCountry(event)" aria-label="${esc(t.discoverClear || 'Limpiar selección')}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>` : ''}
                <div class="dd" id="discoverDD" role="listbox">${ddHTML}</div>
            </div>
        </div>
        ${discoverListHTML}`;

    if (!favRaces.length) {
        // Empty: focus on discover
        return `<div class="profile-content-wrap">
            <div class="profile-eyebrow">${esc(t.navTemporada || 'Mi temporada')}</div>
            <div class="profile-hero">
                <h1 class="profile-hero-title">${esc(t.temporadaEmptyTitle1 || 'Tu temporada,')}<br>${esc(t.temporadaEmptyTitle2 || 'en blanco')}<span class="accent">.</span></h1>
                <p class="profile-hero-sub">${esc(t.temporadaEmptySub || 'Empezá eligiendo un país abajo y sumá las carreras que querés correr este año.')}</p>
            </div>
            ${discoverBlock}
        </div>`;
    }

    // Has races: show them + the discover block at the bottom to add more
    let html = `<div class="profile-content-wrap">
        <div class="profile-eyebrow">${esc(t.navTemporada || 'Mi temporada')}</div>
        <div class="profile-hero">
            <h1 class="profile-hero-title">${favRaces.length}<br><span class="dim">${esc(favRaces.length===1?(t.temporadaCountOne||'carrera en tu temporada'):(t.temporadaCountMany||'carreras en tu temporada'))}</span><span class="accent">.</span></h1>
            <p class="profile-hero-sub">${upcoming.length} ${esc(t.temporadaToRun||'por correr')} · ${past.length} ${esc(t.temporadaDone||'corridas')}.</p>
        </div>`;
    if (upcoming.length) {
        html += `<div class="profile-section">
            <div class="profile-section-header"><div><h2 class="profile-section-title">${esc(t.temporadaSectionUpcoming || 'Por correr.')}</h2></div></div>
            <div class="profile-race-list">${upcoming.map(r => _raceRow(r, { unlike: true, refreshSection: 'temporada' })).join('')}</div>
        </div>`;
    }
    if (past.length) {
        html += `<div class="profile-section">
            <div class="profile-section-header"><div><h2 class="profile-section-title">${esc(t.temporadaSectionPast || 'Corridas.')}</h2></div></div>
            <div class="profile-race-list">${past.map(r => _raceRow(r, { unlike: true, refreshSection: 'temporada' })).join('')}</div>
        </div>`;
    }
    html += discoverBlock;
    html += '</div>';
    return html;
}

function _toggleDiscoverDD() {
    const dd = document.getElementById('discoverDD');
    const tr = document.getElementById('discoverTrigger');
    if (!dd || !tr) return;
    dd.classList.toggle('open');
    tr.classList.toggle('open');
    tr.setAttribute('aria-expanded', dd.classList.contains('open'));
}

function _selectDiscoverCountry(id) {
    window._discoverCountry = id;
    profileNav('temporada');
}

function _clearDiscoverCountry(ev) {
    if (ev) ev.stopPropagation();
    window._discoverCountry = null;
    profileNav('temporada');
}

function renderRunnerDiscover() {
    const t = T[lang] || {};
    const selected = window._discoverCountry || null;
    const country = selected ? countries.find(c => c.id === selected) : null;

    // Country dropdown options (same styling as the home selector)
    const ddHTML = countries.map(c => {
        const cnt = (R[c.id] || []).filter(r => new Date(r.d+'T00:00:00') >= new Date()).length;
        return `<div class="co" onclick="_selectDiscoverCountry('${esc(c.id)}')"><span class="co-flag">${esc(c.code)}</span><span class="co-name">${esc(c.name)}</span><span class="co-count">${cnt} ${esc(t.cR || 'carreras')}</span></div>`;
    }).join('');

    // Race list — only when a country is selected
    let listHTML = '';
    if (country) {
        const now = new Date();
        const races = (R[selected] || [])
            .map((r, idx) => ({ ...r, _country: selected, _idx: idx, _rid: r._id || selected + '_' + idx }))
            .filter(r => new Date(r.d+'T00:00:00') >= now)
            .filter(r => !(typeof favorites !== 'undefined' && favorites.includes(r._rid)))
            .sort((a,b) => new Date(a.d+'T00:00:00') - new Date(b.d+'T00:00:00'));
        const racesPreview = races.slice(0, 12);

        const racesHTML = racesPreview.length
            ? racesPreview.map(r => _raceRow(r)).join('')
            : `<div class="profile-empty"><div class="profile-empty-title">${esc(t.dashAllSavedTitle || 'Ya guardaste todas las carreras de')} ${esc(country.name)}</div><div class="profile-empty-sub">${esc(t.dashAllSavedSub || 'Probá con otro país.')}</div></div>`;

        listHTML = `<div class="profile-section">
            <div class="profile-section-header">
                <div>
                    <h2 class="profile-section-title">${esc(country.name)}.</h2>
                    <div class="profile-section-sub">${races.length} ${races.length===1?(t.dashRaceUpcoming||'carrera próxima que todavía no guardaste.'):(t.dashRacesUpcoming||'carreras próximas que todavía no guardaste.')}</div>
                </div>
            </div>
            <div class="profile-race-list">${racesHTML}</div>
        </div>`;
    }

    return `<div class="profile-content-wrap">
        <div class="profile-eyebrow">${esc(t.navDiscover || 'Comenzá tu temporada')}</div>
        <div class="profile-hero">
            <h1 class="profile-hero-title">${esc(t.discoverTitle1 || 'Elegí dónde')}<br>${esc(t.discoverTitle2 || 'querés correr')}<span class="accent">.</span></h1>
            <p class="profile-hero-sub">${esc((t.discoverSub || '{N} países en Latinoamérica. Cientos de carreras de asfalto, trail y montaña.').replace('{N}', countries.length))}</p>
        </div>

        <div class="cs discover-cs${country ? ' has-selection' : ''}">
            <button class="cs-trigger" id="discoverTrigger" onclick="_toggleDiscoverDD()" aria-expanded="false" aria-haspopup="listbox">
                <div class="cs-icon" aria-hidden="true">↓</div>
                <div class="cs-label">${country ? esc(country.name) : esc(t.selC || 'Elegí un país')}</div>
                <div class="cs-arrow" aria-hidden="true"><svg viewBox="0 0 12 12"><polyline points="2,4 6,8 10,4"/></svg></div>
            </button>
            ${country ? `<button class="cs-clear" onclick="_clearDiscoverCountry(event)" aria-label="${esc(t.discoverClear || 'Limpiar selección')}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>` : ''}
            <div class="dd" id="discoverDD" role="listbox">${ddHTML}</div>
        </div>

        ${listHTML}
    </div>`;
}

function _trainingsKey() {
    return 'pulz-trainings-' + (currentUser?.id || 'anon');
}

function _getTrainings() {
    try { return JSON.parse(localStorage.getItem(_trainingsKey()) || '[]'); }
    catch { return []; }
}

function _saveTrainings(arr) {
    try { localStorage.setItem(_trainingsKey(), JSON.stringify(arr)); } catch {}
}

function _calcPace(distanceKm, timeStr) {
    if (!distanceKm || !timeStr) return '';
    const parts = timeStr.split(':').map(Number);
    let totalSec = 0;
    if (parts.length === 3) totalSec = parts[0]*3600 + parts[1]*60 + parts[2];
    else if (parts.length === 2) totalSec = parts[0]*60 + parts[1];
    else return '';
    if (!totalSec || isNaN(totalSec)) return '';
    const paceSec = totalSec / distanceKm;
    const min = Math.floor(paceSec / 60);
    const sec = Math.round(paceSec % 60);
    return `${min}:${String(sec).padStart(2,'0')}`;
}

function addTraining() {
    const t = T[lang] || {};
    const get = id => document.getElementById(id)?.value?.trim() || '';
    const date = get('trainDate');
    const type = get('trainType');
    const distance = parseFloat(get('trainDistance'));
    const time = get('trainTime');
    const place = get('trainPlace');
    const effort = parseInt(get('trainEffort'), 10);
    const weather = get('trainWeather');
    const notes = get('trainNotes');

    if (!date) { showToast(t.trainErrDate || 'Ingresá la fecha', 'error'); return; }
    if (!distance || distance <= 0) { showToast(t.trainErrDistance || 'Ingresá una distancia válida', 'error'); return; }
    if (!time) { showToast(t.trainErrTime || 'Ingresá el tiempo', 'error'); return; }
    if (!/^\d{1,2}:\d{2}(:\d{2})?$/.test(time)) { showToast(t.trainErrTimeFormat || 'Formato de tiempo inválido (h:mm:ss o mm:ss)', 'error'); return; }

    const training = {
        id: 'tr_' + Date.now() + '_' + Math.random().toString(36).slice(2,7),
        date, type, distance, time,
        pace: _calcPace(distance, time),
        place, effort: isNaN(effort) ? null : effort,
        weather, notes,
        createdAt: new Date().toISOString()
    };

    const list = _getTrainings();
    list.push(training);
    _saveTrainings(list);

    showToast(t.trainSaved || 'Entrenamiento guardado', 'success');
    profileNav('trainings');
}

function deleteTraining(id) {
    const t = T[lang] || {};
    const list = _getTrainings().filter(x => x.id !== id);
    _saveTrainings(list);
    showToast(t.trainDeleted || 'Entrenamiento eliminado', 'success');
    profileNav('trainings');
}

function renderRunnerTrainings() {
    const t = T[lang] || {};
    const locale = lang === 'pt' ? 'pt-BR' : lang === 'en' ? 'en-US' : 'es-AR';
    const list = _getTrainings().slice().sort((a,b) => (b.date||'').localeCompare(a.date||''));
    const today = new Date().toISOString().slice(0,10);

    // Aggregate stats
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthList = list.filter(x => new Date(x.date+'T00:00:00') >= monthStart);
    const monthKm = monthList.reduce((s,x) => s + (x.distance||0), 0);
    const totalKm = list.reduce((s,x) => s + (x.distance||0), 0);

    const historyHTML = list.length ? list.map(x => {
        const dt = new Date(x.date + 'T00:00:00');
        const dateStr = dt.toLocaleDateString(locale, { day:'2-digit', month:'short' });
        return `<div class="training-row">
            <div class="tr-date">${esc(dateStr)}</div>
            <div class="tr-info">
                <div class="tr-type">${esc(x.type || '—')}${x.place ? ` · <span class="tr-place">${esc(x.place)}</span>` : ''}</div>
                <div class="tr-stats">${(x.distance||0).toFixed(1)} km · ${esc(x.time || '—')}${x.pace ? ` · ${esc(x.pace)}/km` : ''}${x.effort ? ` · ${t.trainEffortShort||'RPE'} ${x.effort}` : ''}</div>
                ${x.notes ? `<div class="tr-notes">${esc(x.notes)}</div>` : ''}
            </div>
            <button class="tr-delete" onclick="deleteTraining('${esc(x.id)}')" aria-label="Eliminar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6"/></svg>
            </button>
        </div>`;
    }).join('') : `<div class="profile-empty">
            <div class="profile-empty-title">${esc(t.trainEmptyTitle || 'Sin entrenamientos todavía')}</div>
            <div class="profile-empty-sub">${esc(t.trainEmptySub || 'Cargá tu primera salida arriba — fecha, distancia, tiempo y listo.')}</div>
        </div>`;

    return `<div class="profile-content-wrap">
        <div class="profile-eyebrow">${esc(t.navTrainings || 'Entrenamientos')}</div>
        <div class="profile-hero" style="margin-bottom:32px">
            <h1 class="profile-hero-title" style="font-size:clamp(48px,7vw,84px)">${esc(t.trainTitle1 || 'Registrá')}<br>${esc(t.trainTitle2 || 'tus salidas')}<span class="accent">.</span></h1>
        </div>
        ${_sectionIntro('trainings', `
            <strong>${esc(t.trainingsIntroT || '¿Cómo se usa esta sección?')}</strong>
            ${esc(t.trainingsIntroBody || 'Cargá cada salida (fecha, distancia, ritmo, lugar, esfuerzo). Con el tiempo PULZ va a calcular tendencias, ritmo promedio, km del mes y un predictor de tiempos para tus próximas carreras.')}
        `)}

        ${list.length ? `<div class="ph-stats" style="margin-bottom:28px">
            <div class="ph-stat accent">
                <div class="ph-stat-label">${esc(t.trainStatTotal || 'Total')}</div>
                <div class="ph-stat-value">${list.length}</div>
            </div>
            <div class="ph-stat">
                <div class="ph-stat-label">${esc(t.trainStatMonth || 'Este mes')}</div>
                <div class="ph-stat-value">${monthList.length}</div>
            </div>
            <div class="ph-stat">
                <div class="ph-stat-label">${esc(t.trainStatKmMonth || 'Km del mes')}</div>
                <div class="ph-stat-value">${monthKm.toFixed(0)}<span class="unit">K</span></div>
            </div>
            <div class="ph-stat">
                <div class="ph-stat-label">${esc(t.trainStatKmTotal || 'Km totales')}</div>
                <div class="ph-stat-value">${totalKm.toFixed(0)}<span class="unit">K</span></div>
            </div>
        </div>` : ''}

        <div class="profile-section">
            <div class="profile-section-header">
                <div>
                    <h2 class="profile-section-title">${esc(t.trainNewSession || 'Nueva sesión.')}</h2>
                    <div class="profile-section-sub">${esc(t.trainNewSub || 'Cargá una salida. El ritmo se calcula automáticamente.')}</div>
                </div>
            </div>
            <form class="profile-training-form" onsubmit="event.preventDefault();addTraining()">
                <div class="profile-training-field">
                    <label>${esc(t.trainDate || 'Fecha')}</label>
                    <input type="date" id="trainDate" value="${today}" required>
                </div>
                <div class="profile-training-field">
                    <label>${esc(t.trainType || 'Tipo')}</label>
                    <select id="trainType">
                        <option>${esc(t.trainTypeEasy || 'Asfalto · Easy run')}</option>
                        <option>Trail</option>
                        <option>${esc(t.trainTypeTrack || 'Pista')}</option>
                        <option>${esc(t.trainTypeLong || 'Long run')}</option>
                        <option>${esc(t.trainTypeTempo || 'Tempo / Series')}</option>
                    </select>
                </div>
                <div class="profile-training-field">
                    <label>${esc(t.trainDistance || 'Distancia (km)')}</label>
                    <input type="number" id="trainDistance" step="0.1" min="0" placeholder="10.5" required>
                </div>
                <div class="profile-training-field">
                    <label>${esc(t.trainTime || 'Tiempo (h:mm:ss o mm:ss)')}</label>
                    <input type="text" id="trainTime" placeholder="00:52:30" pattern="\\d{1,2}:\\d{2}(:\\d{2})?" required>
                </div>
                <div class="profile-training-field">
                    <label>${esc(t.trainPlace || 'Lugar')}</label>
                    <input type="text" id="trainPlace" placeholder="${esc(t.trainPlacePh || 'Bosques de Palermo')}">
                </div>
                <div class="profile-training-field">
                    <label>${esc(t.trainEffort || 'Esfuerzo (1-10)')}</label>
                    <input type="number" id="trainEffort" min="1" max="10" placeholder="6">
                </div>
                <div class="profile-training-field">
                    <label>${esc(t.trainWeather || 'Clima')}</label>
                    <select id="trainWeather">
                        <option value="">—</option>
                        <option>${esc(t.weatherSun || 'Sol')}</option>
                        <option>${esc(t.weatherCloud || 'Nublado')}</option>
                        <option>${esc(t.weatherRain || 'Lluvia')}</option>
                        <option>${esc(t.weatherCold || 'Frío')}</option>
                        <option>${esc(t.weatherHot || 'Calor')}</option>
                        <option>${esc(t.weatherWind || 'Viento')}</option>
                    </select>
                </div>
                <div class="profile-training-field profile-training-form-full">
                    <label>${esc(t.trainNotes || 'Notas')}</label>
                    <textarea id="trainNotes" rows="2" placeholder="${esc(t.trainNotesPh || 'Cómo te sentiste, vibras, qué cambiarías para la próxima…')}"></textarea>
                </div>
                <div class="profile-training-form-actions profile-training-form-full">
                    <button type="submit" class="auth-submit settings-save-btn">
                        <span class="auth-submit-text">${esc(t.trainSave || 'Guardar entrenamiento')}</span>
                    </button>
                </div>
            </form>
        </div>

        <div class="profile-section">
            <div class="profile-section-header">
                <div>
                    <h2 class="profile-section-title">${esc(t.trainHistoryTitle || 'Tu historial.')}</h2>
                    <div class="profile-section-sub">${esc(t.trainHistorySub || 'Ordenado del más reciente al más antiguo.')}</div>
                </div>
            </div>
            <div class="training-list">${historyHTML}</div>
        </div>
    </div>`;
}

function renderRunnerStats() {
    const t = T[lang] || {};
    const now = new Date();

    // Trainings (from localStorage)
    const trainings = (typeof _getTrainings === 'function') ? _getTrainings() : [];
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const trainingsThisMonth = trainings.filter(x => new Date(x.date+'T00:00:00') >= monthStart);
    const trainingsKm = trainings.reduce((s,x) => s + (parseFloat(x.distance)||0), 0);
    const trainingsKmMonth = trainingsThisMonth.reduce((s,x) => s + (parseFloat(x.distance)||0), 0);
    // Average pace across all trainings (weighted by distance)
    let totalSec = 0, totalKmForPace = 0;
    trainings.forEach(x => {
        const km = parseFloat(x.distance)||0;
        if (!km || !x.time) return;
        const parts = x.time.split(':').map(Number);
        let sec = 0;
        if (parts.length === 3) sec = parts[0]*3600 + parts[1]*60 + parts[2];
        else if (parts.length === 2) sec = parts[0]*60 + parts[1];
        if (sec > 0) { totalSec += sec; totalKmForPace += km; }
    });
    const avgPace = totalKmForPace > 0 ? (() => {
        const paceSec = totalSec / totalKmForPace;
        const min = Math.floor(paceSec / 60);
        const sec = Math.round(paceSec % 60);
        return `${min}:${String(sec).padStart(2,'0')}`;
    })() : '—';

    // Completed races
    const completedIds = (typeof completions !== 'undefined') ? Object.keys(completions) : [];
    const completedRaces = [];
    for (const cid of Object.keys(R || {})) {
        (R[cid] || []).forEach((r, idx) => {
            const rid = r._id || cid + '_' + idx;
            if (completedIds.includes(rid)) {
                completedRaces.push({ ...r, _country: cid, _idx: idx, _rid: rid });
            }
        });
    }
    const completedKm = completedRaces.reduce((s,r) => {
        const cd = (typeof getCompletionData === 'function') ? getCompletionData(r._rid) : null;
        const dist = cd?.distance_run ? parseFloat(cd.distance_run) : (r.c||[]).reduce((m,c) => { const n = parseFloat(c); return !isNaN(n) && n > m ? n : m; }, 0);
        return s + (dist || 0);
    }, 0);
    const completedTrail = completedRaces.filter(r => r.t === 'trail').length;
    const completedRoad = completedRaces.filter(r => r.t === 'asfalto' || r.t === 'road').length;

    return `<div class="profile-content-wrap">
        <div class="profile-eyebrow">${esc(t.navStats || 'Estadísticas')}</div>
        <div class="profile-hero">
            <h1 class="profile-hero-title">${esc(t.statsTitle1 || 'Tu temporada')}<br>${esc(t.statsTitle2 || 'en números')}<span class="accent">.</span></h1>
            <p class="profile-hero-sub">${esc(t.statsSub || 'Tus números reales: lo que entrenás y lo que corrés. Cuanto más cargues, más profundo se vuelve el panel.')}</p>
        </div>
        ${_sectionIntro('stats', `
            <strong>${esc(t.statsIntroT || 'Cómo se calculan tus stats')}</strong>
            ${esc(t.statsIntroBody || 'Estos números salen de tus entrenamientos cargados y de las carreras que marcaste como completadas. Cuanto más cargues, más profundo se vuelve el panel.')}
        `)}

        <div class="profile-section">
            <div class="profile-section-header"><div><h2 class="profile-section-title">${esc(t.statsTrainingsTitle || 'Entrenamientos.')}</h2></div></div>
            <div class="profile-stats-row">
                <div class="profile-stat-card accent">
                    <div class="stat-label">${esc(t.trainStatTotal || 'Total')}</div>
                    <div class="stat-value">${trainings.length}</div>
                </div>
                <div class="profile-stat-card">
                    <div class="stat-label">${esc(t.trainStatKmTotal || 'Km totales')}</div>
                    <div class="stat-value">${Math.round(trainingsKm)}<span class="unit">K</span></div>
                </div>
                <div class="profile-stat-card">
                    <div class="stat-label">${esc(t.trainStatKmMonth || 'Km del mes')}</div>
                    <div class="stat-value">${Math.round(trainingsKmMonth)}<span class="unit">K</span></div>
                </div>
                <div class="profile-stat-card">
                    <div class="stat-label">${esc(t.statsAvgPace || 'Ritmo promedio')}</div>
                    <div class="stat-value" style="font-size:32px;letter-spacing:-1px">${esc(avgPace)}<span class="unit">/km</span></div>
                </div>
            </div>
            ${trainings.length === 0 ? `<div class="profile-empty" style="margin-top:24px">
                <div class="profile-empty-title">${esc(t.statsTrainingsEmpty || 'Sin entrenamientos cargados')}</div>
                <div class="profile-empty-sub">${esc(t.statsTrainingsEmptySub || 'Cargá tu primera salida desde Entrenamientos para empezar a ver datos.')}</div>
                <button class="profile-empty-cta" onclick="profileNav('trainings')">
                    ${esc(t.statsTrainingsCta || 'Ir a Entrenamientos')}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
            </div>` : ''}
        </div>

        <div class="profile-section">
            <div class="profile-section-header"><div><h2 class="profile-section-title">${esc(t.statsCompletedTitle || 'Carreras completadas.')}</h2></div></div>
            <div class="profile-stats-row">
                <div class="profile-stat-card accent">
                    <div class="stat-label">${esc(t.statsCompTotal || 'Completadas')}</div>
                    <div class="stat-value">${completedRaces.length}</div>
                </div>
                <div class="profile-stat-card">
                    <div class="stat-label">${esc(t.statsCompKm || 'Km corridos')}</div>
                    <div class="stat-value">${Math.round(completedKm)}<span class="unit">K</span></div>
                </div>
                <div class="profile-stat-card">
                    <div class="stat-label">${esc(t.statsCompTrail || 'Trail')}</div>
                    <div class="stat-value">${completedTrail}</div>
                </div>
                <div class="profile-stat-card">
                    <div class="stat-label">${esc(t.statsCompRoad || 'Asfalto')}</div>
                    <div class="stat-value">${completedRoad}</div>
                </div>
            </div>
            ${completedRaces.length === 0 ? `<div class="profile-empty" style="margin-top:24px">
                <div class="profile-empty-title">${esc(t.statsCompEmpty || 'Sin carreras completadas')}</div>
                <div class="profile-empty-sub">${esc(t.statsCompEmptySub || 'Cuando termines una carrera, abrila desde Mi temporada y tocá "Marcar completada".')}</div>
                <button class="profile-empty-cta" onclick="profileNav('temporada')">
                    ${esc(t.statsCompCta || 'Ir a Mi temporada')}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
            </div>` : ''}
        </div>
    </div>`;
}

/* === TEAM === */
function renderTeamSection(section) {
    try {
        if (section === 'edit') { setTimeout(() => typeof openEditTeamProfile === 'function' && openEditTeamProfile(), 50); return _profileLoadingSection('Editar perfil'); }
        if (section === 'discover') return renderRunnerDiscover();
        if (section === 'stats') return renderTeamStats();
        if (section === 'members') return renderTeamMembersInline();
        if (section === 'notifications') return renderNotificationsInline();
        if (section === 'races') return renderTeamRacesInline();
        if (section === 'announcements') return renderTeamAnnouncementsInline();
        // Legacy 'pendings' redirige a notifications (donde ahora aparecen invitaciones)
        if (section === 'pendings') return renderNotificationsInline();
        return renderTeamHome();
    } catch (e) {
        console.error('[renderTeamSection] Error en sección "' + section + '":', e);
        const t = T[lang] || {};
        return `<div class="profile-content-wrap">
            <div class="profile-section-header">
                <div class="profile-section-eyebrow">${esc(section)}</div>
                <h1 class="profile-section-title">${esc(t.loadError || 'Error al cargar')}<span class="accent">.</span></h1>
            </div>
            <div class="team-members-empty">
                <div class="empty-icon">${typeof lucideIcon === 'function' ? lucideIcon('alert-triangle', 36) : ''}</div>
                <div class="empty-title">${esc(t.loadError || 'No pudimos cargar la información')}</div>
                <div class="empty-sub">${esc(e.message || 'Probá refrescar la página.')}</div>
            </div>
        </div>`;
    }
}

/* ============================================
   TEAM — Sección Miembros (inline en dashboard)
   ============================================ */

/**
 * Calcula el estado de actividad de un miembro según la fecha de su última carrera.
 * Devuelve { dotClass, label, days } para el semáforo + tooltip.
 */
function computeMemberStatus(lastRaceDate, locale) {
    const t = T[lang] || {};
    if (!lastRaceDate) {
        return { dotClass: 'status-dot-none', label: t.memberStatusNoActivity || 'Sin actividad registrada', days: null };
    }
    const ms = Date.now() - new Date(lastRaceDate).getTime();
    const days = Math.max(0, Math.floor(ms / 86400000));
    const daysLabel = days === 0 ? (t.memberStatusToday || 'hoy') : days === 1 ? (t.memberStatusYesterday || 'ayer') : `${t.memberStatusAgo || 'hace'} ${days} ${t.memberStatusDays || 'días'}`;
    if (days <= 60) return { dotClass: 'status-dot-ok', label: `${t.memberStatusActive || 'Activo'} · ${t.memberStatusLastRace || 'última carrera'} ${daysLabel}`, days };
    if (days <= 180) return { dotClass: 'status-dot-warn', label: `${t.memberStatusLatent || 'Latente'} · ${t.memberStatusLastRace || 'última carrera'} ${daysLabel}`, days };
    return { dotClass: 'status-dot-danger', label: `${t.memberStatusInactive || 'Inactivo'} · ${t.memberStatusLastRace || 'última carrera'} ${daysLabel}`, days };
}

/**
 * Devuelve el HTML del badge de dorsal: founding (1-500) con estrella dorada, regular sutil.
 */
function dorsalBadge(num, isFounding) {
    if (!num && num !== 0) return '';
    const padded = String(num).padStart(3, '0');
    if (isFounding) {
        return `<span class="dorsal-badge dorsal-founding" title="Founding Member #${padded}">${lucideIcon('star', 9)}<span class="dorsal-num">#${padded}</span></span>`;
    }
    return `<span class="dorsal-badge dorsal-regular">#${padded}</span>`;
}

/**
 * Sección Miembros — render inline en el dashboard.
 * Devuelve un skeleton inmediato y popula async.
 */
function renderTeamMembersInline() {
    setTimeout(populateTeamMembersInline, 50);
    return `<div id="teamMembersInline" class="profile-content-wrap">
        <div class="profile-section-header section-header-centered">
            <h1 class="profile-section-title">${esc((T[lang]||{}).teamMembersTitle || 'Miembros del equipo')}<span class="accent">.</span></h1>
        </div>
        <div class="team-members-loading-block">
            <span class="auth-submit-loader" style="display:inline-block;position:static;border-top-color:var(--txt3)"></span>
            <span>${esc((T[lang]||{}).loading || 'Cargando…')}</span>
        </div>
    </div>`;
}

async function populateTeamMembersInline() {
    const container = document.getElementById('teamMembersInline');
    if (!container) return;
    if (!currentUser || currentProfile?.role !== 'team') return;

    const t = T[lang] || {};
    const locale = lang === 'pt' ? 'pt-BR' : lang === 'en' ? 'en-US' : 'es-AR';

    try {
        // Cargar datos en paralelo
        const members = (typeof loadTeamMembers === 'function') ? await loadTeamMembers() : [];
        const memberIds = members.map(m => m.user_id);
        const [memberFavs, memberComps] = await Promise.all([
            memberIds.length && typeof loadMemberFavorites === 'function' ? loadMemberFavorites(memberIds) : Promise.resolve({}),
            memberIds.length && typeof loadMemberCompletions === 'function' ? loadMemberCompletions(memberIds) : Promise.resolve({})
        ]);
        const teamRaceSet = new Set(typeof teamRaces !== 'undefined' ? teamRaces : []);

        // Store para que openMemberProfile() siga funcionando
        window._teamMembersData = { members, memberFavs, memberComps, teamRaceSet };

        container.innerHTML = buildTeamMembersHTML(members || [], memberFavs || {}, memberComps || {}, teamRaceSet, locale, t);
    } catch (e) {
        console.error('[populateTeamMembersInline] Error:', e);
        container.innerHTML = `<div class="profile-section-header">
            <div class="profile-section-eyebrow">${esc(t.navMembers || 'Miembros')}</div>
            <h1 class="profile-section-title">${esc(t.teamMembersTitle || 'Miembros del equipo')}<span class="accent">.</span></h1>
        </div>
        <div class="team-members-empty">
            <div class="empty-icon">${lucideIcon('alert-triangle', 36)}</div>
            <div class="empty-title">${esc(t.loadError || 'No pudimos cargar la información')}</div>
            <div class="empty-sub">${esc(e.message || 'Probá refrescar la página.')}</div>
        </div>`;
    }
}

function buildTeamMembersHTML(members, memberFavs, memberComps, teamRaceSet, locale, t) {
    const headerHTML = `<div class="profile-section-header section-header-centered">
        <h1 class="profile-section-title">${esc(t.teamMembersTitle || 'Miembros del equipo')}<span class="accent">.</span></h1>
    </div>`;

    const inviteCtaHTML = `<button class="team-invite-cta" onclick="openTeamInvitePanel()">
        ${lucideIcon('user-plus', 16)}
        <span>${esc(t.teamInviteCta || 'Agregar miembros')}</span>
    </button>`;

    if (!members.length) {
        return `${headerHTML}
        <div class="team-members-empty">
            <div class="empty-icon">${lucideIcon('users', 36)}</div>
            <div class="empty-title">${esc(t.teamMembersEmptyTitle || 'Todavía no hay miembros')}</div>
            <div class="empty-sub">${esc(t.teamMembersEmptySubV2 || 'Compartí el link público de tu equipo y los runners van a postularse para sumarse.')}</div>
            <button class="empty-cta" onclick="openTeamInvitePanel()">${lucideIcon('user-plus', 14)}<span>${esc(t.teamInviteCta || 'Agregar miembros')}</span></button>
        </div>`;
    }

    // Stats agregadas
    const totalKm = members.reduce((s, m) => s + parseFloat(m.total_km || 0), 0);
    const totalRaces = members.reduce((s, m) => s + parseInt(m.races_completed || 0), 0);
    const activeMembers = members.filter(m => {
        const d = m.last_race_date;
        if (!d) return false;
        const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
        return days <= 60;
    }).length;

    const statsHTML = `<div class="team-members-summary">
        <div class="team-stat"><div class="team-stat-num">${members.length}</div><div class="team-stat-label">${esc(t.teamMembersCount || 'miembros')}</div></div>
        <div class="team-stat"><div class="team-stat-num">${activeMembers}</div><div class="team-stat-label">${esc(t.teamMembersActiveRunners || 'runners activos')}</div></div>
        <div class="team-stat"><div class="team-stat-num">${Math.round(totalKm)}</div><div class="team-stat-label">${esc(t.teamMembersTotalKm || 'km entre todos')}</div></div>
        <div class="team-stat"><div class="team-stat-num">${totalRaces}</div><div class="team-stat-label">${esc(t.teamMembersTotalRaces || 'carreras completadas')}</div></div>
    </div>`;

    const legendHTML = `<div class="member-status-legend">
        <span class="legend-item"><span class="status-dot-mini status-dot-ok"></span>${esc(t.memberStatusActive || 'Activo')} <span class="legend-range">−60d</span></span>
        <span class="legend-item"><span class="status-dot-mini status-dot-warn"></span>${esc(t.memberStatusLatent || 'Latente')} <span class="legend-range">60–180d</span></span>
        <span class="legend-item"><span class="status-dot-mini status-dot-danger"></span>${esc(t.memberStatusInactive || 'Inactivo')} <span class="legend-range">+180d</span></span>
    </div>`;

    // Cards
    let cardsHTML = '<div class="team-members-list-v2">';
    members.forEach(m => {
        const name = m.display_name || 'Runner';
        const initial = (name[0] || 'R').toUpperCase();
        const username = m.username || '';
        const dorsal = m.dorsal_number || null;
        const isFounding = !!m.is_founding_member;
        const racesNum = parseInt(m.races_completed || 0);
        const kmNum = parseFloat(m.total_km || 0);
        const effortNum = m.avg_effort ? parseFloat(m.avg_effort).toFixed(1) : null;
        const joinDate = m.joined_at ? new Date(m.joined_at).toLocaleDateString(locale, { month: 'short', year: 'numeric' }) : '';

        const status = computeMemberStatus(m.last_race_date, locale);

        // Overlap con team races
        const userFavs = memberFavs[m.user_id] || [];
        const overlap = userFavs.filter(fid => teamRaceSet.has(fid)).length;

        // Pills
        let pills = '';
        if (kmNum > 0) pills += `<span class="m-pill">${Math.round(kmNum)} ${esc(t.teamMemberKm || 'km')}</span>`;
        if (racesNum > 0) pills += `<span class="m-pill">${lucideIcon('flag-triangle-right', 11)} ${racesNum}</span>`;
        if (effortNum) pills += `<span class="m-pill">${lucideIcon('zap', 11)} ${effortNum}</span>`;
        if (overlap > 0) pills += `<span class="m-pill m-pill-accent">${overlap} ${esc(t.teamMembersOverlap || 'en común')}</span>`;
        if (!pills) pills = `<span class="m-pill m-pill-muted">${esc(t.teamMembersNoData || 'Sin actividad aún')}</span>`;

        const dorsalHTML = dorsalBadge(dorsal, isFounding);
        const usernameHTML = username ? `<span class="m-username">@${esc(username)}</span>` : '';
        const joinedHTML = joinDate ? `<span class="m-joined">${esc(t.teamMemberJoined || 'desde')} ${esc(joinDate)}</span>` : '';
        const metaSep = (usernameHTML && joinedHTML) ? '<span class="m-meta-sep">·</span>' : '';

        cardsHTML += `<div class="team-member-card-v2" onclick="openMemberProfile('${esc(m.user_id)}')" tabindex="0" role="button">
            <span class="status-dot ${status.dotClass}" title="${esc(status.label)}" aria-label="${esc(status.label)}"></span>
            <div class="m-avatar">${esc(initial)}</div>
            <div class="m-body">
                <div class="m-name-row">
                    <span class="m-name">${esc(name)}</span>
                    ${dorsalHTML}
                </div>
                <div class="m-meta">${usernameHTML}${metaSep}${joinedHTML}</div>
                <div class="m-pills">${pills}</div>
            </div>
            <div class="m-chevron">${lucideIcon('chevron-right', 16)}</div>
        </div>`;
    });
    cardsHTML += '</div>';

    // Leaderboard
    const leaderHTML = typeof renderTeamLeaderboardHTML === 'function' ? renderTeamLeaderboardHTML(members) : '';

    // Alerta inactivos
    const inactiveCount = members.filter(m => {
        const d = m.last_race_date;
        if (!d) return true;
        const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
        return days > 180;
    }).length;
    const inactiveAlertHTML = inactiveCount >= 2
        ? `<div class="member-inactive-alert">${lucideIcon('alert-triangle', 14)} ${inactiveCount} ${esc(t.teamMemberInactiveAlert || 'miembros inactivos hace +180 días')}</div>`
        : '';

    return `${headerHTML}
        ${statsHTML}
        <div class="team-members-cta-row">
            ${inviteCtaHTML}
        </div>
        ${legendHTML}
        ${leaderHTML}
        ${inactiveAlertHTML}
        ${cardsHTML}`;
}

/* ============================================
   TEAM — Panel "Agregar miembros" (búsqueda por PULZ ID + invitación)
   ============================================ */
function openTeamInvitePanel() {
    if (!currentUser || currentProfile?.role !== 'team') return;
    const t = T[lang] || {};

    const overlay = document.createElement('div');
    overlay.id = 'teamInviteOverlay';
    overlay.className = 'team-invite-overlay';
    overlay.innerHTML = `
        <div class="team-invite-card" role="dialog" aria-modal="true" aria-labelledby="teamInviteTitle">
            <button class="team-invite-close" onclick="closeTeamInvitePanel()" aria-label="${esc(t.authClose || 'Cerrar')}">${lucideIcon('x', 18)}</button>
            <div class="auth-header">
                <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
                <h2 class="auth-title" id="teamInviteTitle">${esc(t.teamInviteTitle || 'Invitar miembro')}</h2>
            </div>

            <div class="auth-field">
                <label class="auth-label" for="teamInvitePulzId">${esc(t.teamInvitePulzIdLabel || 'PULZ ID del runner')}</label>
                <div class="pulz-id-input-wrap">
                    <span class="pulz-id-prefix">@</span>
                    <input type="text" class="auth-input pulz-id-input" id="teamInvitePulzId" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" maxlength="30" oninput="this.value=this.value.toLowerCase().replace(/[^a-z0-9-]/g,'');" autofocus>
                </div>
            </div>

            <div id="teamInviteFeedback" class="invite-feedback"></div>

            <button class="auth-submit" id="teamInviteSubmit" onclick="submitTeamInvite()">
                <span class="auth-submit-text">${lucideIcon('user-plus', 14)} ${esc(t.teamInviteSend || 'Enviar invitación')}</span>
                <span class="auth-submit-loader"></span>
            </button>
        </div>
    `;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    overlay._escListener = (e) => { if (e.key === 'Escape') closeTeamInvitePanel(); };
    document.addEventListener('keydown', overlay._escListener);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeTeamInvitePanel(); });

    setTimeout(() => document.getElementById('teamInvitePulzId')?.focus(), 50);

    // Enter envía
    const input = document.getElementById('teamInvitePulzId');
    if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submitTeamInvite(); } });
}

async function submitTeamInvite() {
    const t = T[lang] || {};
    const input = document.getElementById('teamInvitePulzId');
    const feedback = document.getElementById('teamInviteFeedback');
    const btn = document.getElementById('teamInviteSubmit');
    if (!input || !feedback || !btn) return;

    const pulzId = (input.value || '').trim().toLowerCase();
    feedback.className = 'invite-feedback';
    feedback.innerHTML = '';

    if (!pulzId) {
        feedback.className = 'invite-feedback error';
        feedback.innerHTML = `${lucideIcon('x', 12)} <span>${esc(t.teamInviteEmpty || 'Ingresá un PULZ ID')}</span>`;
        return;
    }

    btn.classList.add('loading');
    const result = (typeof inviteRunnerByPulzId === 'function') ? await inviteRunnerByPulzId(pulzId) : { error: 'function_missing' };
    btn.classList.remove('loading');

    if (result.error) {
        feedback.className = 'invite-feedback error';
        let msg;
        switch (result.error) {
            case 'runner_not_found': msg = t.teamInviteErrNotFound || 'No encontramos a @' + pulzId + ' en PULZ.'; break;
            case 'not_runner': msg = t.teamInviteErrNotRunner || 'Ese PULZ ID no es de un runner.'; break;
            case 'self_invite': msg = t.teamInviteErrSelf || 'No podés invitarte a vos mismo.'; break;
            case 'already_member': msg = t.teamInviteErrMember || 'Ese runner ya es miembro.'; break;
            case 'already_invited': msg = t.teamInviteErrAlreadyInvited || 'Ya tenés una invitación pendiente para ese runner.'; break;
            case 'not_team': msg = t.teamInviteErrNotTeam || 'Solo running teams pueden invitar.'; break;
            default: msg = result.error;
        }
        feedback.innerHTML = `${lucideIcon('alert-triangle', 12)} <span>${esc(msg)}</span>`;
        return;
    }

    feedback.className = 'invite-feedback ok';
    feedback.innerHTML = `${lucideIcon('check', 12)} <span>${esc((t.teamInviteSentTo || 'Invitación enviada a') + ' ' + (result.runner_name || pulzId))}</span>`;
    if (typeof showToast === 'function') showToast(t.teamInviteSent || 'Invitación enviada', 'success');
    input.value = '';
    setTimeout(() => closeTeamInvitePanel(), 1200);
}

function closeTeamInvitePanel() {
    const overlay = document.getElementById('teamInviteOverlay');
    if (!overlay) return;
    if (overlay._escListener) document.removeEventListener('keydown', overlay._escListener);
    overlay.remove();
    document.body.style.overflow = '';
}

/* legacy noop por compatibilidad */
async function copyTeamInviteLink() { /* deprecated */ }

/* ============================================
   NOTIFICATIONS — sección inline unificada (runner / team / organizer)
   ============================================ */
function renderNotificationsInline() {
    setTimeout(populateNotificationsInline, 50);
    const t = T[lang] || {};
    return `<div id="notificationsInline" class="profile-content-wrap">
        <div class="profile-section-header section-header-centered">
            <h1 class="profile-section-title">${esc(t.notifTitle || 'Tus notificaciones')}<span class="accent">.</span></h1>
        </div>
        <div class="team-members-loading-block"><span class="auth-submit-loader" style="display:inline-block;position:static;border-top-color:var(--txt3)"></span><span>${esc(t.loading || 'Cargando…')}</span></div>
    </div>`;
}

async function populateNotificationsInline() {
    const container = document.getElementById('notificationsInline');
    if (!container) return;
    if (!currentUser) return;

    const t = T[lang] || {};
    const locale = lang === 'pt' ? 'pt-BR' : lang === 'en' ? 'en-US' : 'es-AR';

    let notifs = [];
    try {
        notifs = (typeof loadNotifications === 'function') ? await loadNotifications({ limit: 50 }) : [];
    } catch (e) {
        console.error('[populateNotificationsInline] Error:', e);
    }

    const headerHTML = `<div class="profile-section-header section-header-centered">
        <h1 class="profile-section-title">${esc(t.notifTitle || 'Tus notificaciones')}<span class="accent">.</span></h1>
    </div>`;

    if (!notifs.length) {
        container.innerHTML = `${headerHTML}
        <div class="team-members-empty">
            <div class="empty-icon">${lucideIcon('bell', 36)}</div>
            <div class="empty-title">${esc(t.notifEmptyTitle || 'Sin notificaciones')}</div>
            <div class="empty-sub">${esc(t.notifEmptySub || 'Cuando recibas una invitación, anuncio o evento importante, va a aparecer acá.')}</div>
        </div>`;
        return;
    }

    const unreadCount = notifs.filter(n => !n.read_at).length;
    const markAllHTML = unreadCount > 0
        ? `<button class="notif-mark-all" onclick="handleMarkAllNotificationsRead()">${lucideIcon('check-circle', 13)} ${esc(t.notifMarkAllRead || 'Marcar todas como leídas')}</button>`
        : '';

    let listHTML = '<div class="notif-list">';
    notifs.forEach(n => {
        listHTML += renderNotificationCard(n, locale, t);
    });
    listHTML += '</div>';

    container.innerHTML = `${headerHTML}
        <div class="notif-toolbar">
            <span class="notif-count">${notifs.length} ${esc(notifs.length === 1 ? (t.notifOne || 'notificación') : (t.notifMany || 'notificaciones'))}${unreadCount > 0 ? ` · ${unreadCount} ${esc(t.notifUnread || 'sin leer')}` : ''}</span>
            ${markAllHTML}
        </div>
        ${listHTML}`;
}

function renderNotificationCard(n, locale, t) {
    const isUnread = !n.read_at;
    const dt = new Date(n.created_at);
    const dateStr = dt.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    const timeStr = dt.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    const fullDate = `${dateStr} · ${timeStr}`;
    const p = n.payload || {};

    let icon, title, body, actions = '';

    switch (n.type) {
        case 'team_invitation': {
            icon = 'user-plus';
            const tName = p.team_name || 'Un running team';
            const tCity = p.team_city ? ` · ${esc(p.team_city)}` : '';
            title = esc(tName) + (p.team_username ? ` <span class="notif-handle">@${esc(p.team_username)}</span>` : '');
            body = esc(t.notifInvitationBody || 'te invitó a sumarte como miembro') + tCity;
            actions = `<div class="notif-actions">
                <button class="notif-btn notif-btn-accept" onclick="handleAcceptInvitation('${esc(p.invitation_id)}','${esc(n.id)}')">${lucideIcon('check', 13)} ${esc(t.notifAccept || 'Aceptar')}</button>
                <button class="notif-btn notif-btn-reject" onclick="handleRejectInvitation('${esc(p.invitation_id)}','${esc(n.id)}')">${lucideIcon('x', 13)} ${esc(t.notifReject || 'Rechazar')}</button>
            </div>`;
            break;
        }
        case 'invitation_accepted': {
            icon = 'check-circle';
            const rName = p.runner_name || 'El runner';
            title = esc(rName) + (p.runner_username ? ` <span class="notif-handle">@${esc(p.runner_username)}</span>` : '');
            body = esc(t.notifAcceptedBody || 'aceptó tu invitación. Ya es miembro de tu equipo.');
            break;
        }
        case 'invitation_rejected': {
            icon = 'x';
            const rName = p.runner_name || 'El runner';
            title = esc(rName) + (p.runner_username ? ` <span class="notif-handle">@${esc(p.runner_username)}</span>` : '');
            body = esc(t.notifRejectedBody || 'rechazó tu invitación.');
            break;
        }
        case 'team_announcement': {
            icon = 'megaphone';
            const tName = p.team_name || 'Tu running team';
            title = esc(tName) + (p.team_username ? ` <span class="notif-handle">@${esc(p.team_username)}</span>` : '');
            body = esc(t.notifAnnouncementBody || 'publicó un anuncio') + ': "' + esc(p.message || '') + '"';
            break;
        }
        case 'member_left': {
            icon = 'user-minus';
            title = esc(p.runner_name || 'Un runner');
            body = esc(t.notifMemberLeftBody || 'dejó tu equipo.');
            break;
        }
        default: {
            icon = 'bell';
            title = esc(n.type);
            body = '';
        }
    }

    return `<div class="notif-card ${isUnread ? 'unread' : ''}" data-notif-id="${esc(n.id)}" onclick="handleNotificationClick('${esc(n.id)}')">
        <div class="notif-bar"></div>
        <div class="notif-icon">${lucideIcon(icon, 18)}</div>
        <div class="notif-body">
            <div class="notif-title">${title}</div>
            <div class="notif-text">${body}</div>
            <div class="notif-date">${esc(fullDate)}</div>
            ${actions}
        </div>
    </div>`;
}

async function handleNotificationClick(notifId) {
    if (!notifId) return;
    if (typeof markNotificationRead === 'function') await markNotificationRead(notifId);
    if (typeof refreshNotificationsBadge === 'function') refreshNotificationsBadge();
    // Quitar la marca visual de unread sin re-render completo
    const card = document.querySelector(`.notif-card[data-notif-id="${notifId}"]`);
    if (card) card.classList.remove('unread');
}

async function handleAcceptInvitation(invitationId, notifId) {
    event && event.stopPropagation && event.stopPropagation();
    if (!invitationId) return;
    const t = T[lang] || {};
    if (typeof acceptInvitation === 'function') {
        const res = await acceptInvitation(invitationId);
        if (res.error) {
            if (typeof showToast === 'function') showToast(t.notifAcceptErr || 'No pudimos aceptar la invitación.', 'error');
            return;
        }
    }
    if (notifId && typeof markNotificationRead === 'function') await markNotificationRead(notifId);
    if (typeof showToast === 'function') showToast(t.notifAcceptedToast || '¡Te uniste al equipo!', 'success');
    if (typeof profileNav === 'function') profileNav('notifications');
}

async function handleRejectInvitation(invitationId, notifId) {
    event && event.stopPropagation && event.stopPropagation();
    if (!invitationId) return;
    const t = T[lang] || {};
    if (typeof rejectInvitation === 'function') {
        const res = await rejectInvitation(invitationId);
        if (res.error) {
            if (typeof showToast === 'function') showToast(t.notifRejectErr || 'No pudimos rechazar la invitación.', 'error');
            return;
        }
    }
    if (notifId && typeof markNotificationRead === 'function') await markNotificationRead(notifId);
    if (typeof showToast === 'function') showToast(t.notifRejectedToast || 'Invitación rechazada', 'info');
    if (typeof profileNav === 'function') profileNav('notifications');
}

async function handleMarkAllNotificationsRead() {
    if (typeof markAllNotificationsRead === 'function') await markAllNotificationsRead();
    if (typeof refreshNotificationsBadge === 'function') refreshNotificationsBadge();
    if (typeof profileNav === 'function') profileNav('notifications');
}

/* Refresca el badge del nav lateral. Llamado tras cambios de estado de notificaciones. */
async function refreshNotificationsBadge() {
    if (typeof loadUnreadNotificationsCount === 'function') await loadUnreadNotificationsCount();
    if (typeof renderProfileSidebar === 'function' && document.body.classList.contains('profile-mode')) renderProfileSidebar();
}

/* ============================================
   TEAM — Sección Postulaciones (inline)
   ============================================ */
function renderTeamPendingsInline() {
    setTimeout(populateTeamPendingsInline, 50);
    const t = T[lang] || {};
    return `<div id="teamPendingsInline" class="profile-content-wrap">
        <div class="profile-section-header">
            <div class="profile-section-eyebrow">${esc(t.navPendings || 'Postulaciones')}</div>
            <h1 class="profile-section-title">${esc(t.teamPendingTitle || 'Pendientes de aprobar')}<span class="accent">.</span></h1>
        </div>
        <div class="team-members-loading-block"><span class="auth-submit-loader" style="display:inline-block;position:static;border-top-color:var(--txt3)"></span><span>${esc(t.loading || 'Cargando…')}</span></div>
    </div>`;
}

async function populateTeamPendingsInline() {
    const container = document.getElementById('teamPendingsInline');
    if (!container) return;
    if (!currentUser || currentProfile?.role !== 'team') return;
    const t = T[lang] || {};
    const locale = lang === 'pt' ? 'pt-BR' : lang === 'en' ? 'en-US' : 'es-AR';

    let pendings = [];
    try {
        pendings = (typeof loadTeamPendings === 'function') ? await loadTeamPendings() : [];
    } catch (e) {
        console.error('[populateTeamPendingsInline] Error loading pendings:', e);
        container.innerHTML = `<div class="profile-section-header">
            <div class="profile-section-eyebrow">${esc(t.navPendings || 'Postulaciones')}</div>
            <h1 class="profile-section-title">${esc(t.teamPendingTitle || 'Pendientes de aprobar')}<span class="accent">.</span></h1>
        </div>
        <div class="team-members-empty">
            <div class="empty-icon">${lucideIcon('alert-triangle', 36)}</div>
            <div class="empty-title">${esc(t.loadError || 'No pudimos cargar la información')}</div>
            <div class="empty-sub">${esc(e.message || 'Probá refrescar la página.')}</div>
        </div>`;
        return;
    }

    const headerHTML = `<div class="profile-section-header">
        <div class="profile-section-eyebrow">${esc(t.navPendings || 'Postulaciones')}</div>
        <h1 class="profile-section-title">${esc(t.teamPendingTitle || 'Pendientes de aprobar')}<span class="accent">.</span></h1>
        <p class="profile-section-sub">${esc(t.teamPendingSub || 'Runners que se postularon para sumarse a tu equipo. Aprobá o rechazá cada uno.')}</p>
    </div>`;

    if (!pendings.length) {
        container.innerHTML = `${headerHTML}
        <div class="team-members-empty">
            <div class="empty-icon">${lucideIcon('inbox', 36)}</div>
            <div class="empty-title">${esc(t.teamPendingEmptyTitle || 'Sin postulaciones aún')}</div>
            <div class="empty-sub">${esc(t.teamPendingEmptySub || 'Cuando un runner se postule a tu equipo, aparecerá acá para que lo apruebes o rechaces.')}</div>
            <button class="empty-cta" onclick="profileNav('members')">${lucideIcon('user-plus', 14)}<span>${esc(t.teamInviteCta || 'Agregar miembros')}</span></button>
        </div>`;
        return;
    }

    let listHTML = '<div class="team-pendings-list">';
    pendings.forEach(pp => {
        const name = pp.profile?.display_name || 'Runner';
        const username = pp.profile?.username ? '@' + pp.profile.username : '';
        const initial = (name[0] || 'R').toUpperCase();
        const since = pp.created_at ? new Date(pp.created_at).toLocaleDateString(locale, { day: 'numeric', month: 'short' }) : '';

        listHTML += `<div class="team-pending-card">
            <div class="m-avatar">${esc(initial)}</div>
            <div class="m-body">
                <div class="m-name-row">
                    <span class="m-name">${esc(name)}</span>
                    ${username ? `<span class="m-username">${esc(username)}</span>` : ''}
                </div>
                <div class="m-meta">${esc(t.teamPendingSince || 'Postuló')} ${esc(since)}</div>
            </div>
            <div class="team-pending-actions">
                <button class="team-action-btn team-action-approve" onclick="handleApproveTeamMember('${esc(pp.user_id)}');setTimeout(()=>profileNav('pendings'),300)" title="${esc(t.teamApprove || 'Aprobar')}" aria-label="${esc(t.teamApprove || 'Aprobar')}">
                    ${lucideIcon('check', 16)}
                </button>
                <button class="team-action-btn team-action-reject" onclick="handleRejectTeamMember('${esc(pp.user_id)}');setTimeout(()=>profileNav('pendings'),300)" title="${esc(t.teamReject || 'Rechazar')}" aria-label="${esc(t.teamReject || 'Rechazar')}">
                    ${lucideIcon('x', 16)}
                </button>
            </div>
        </div>`;
    });
    listHTML += '</div>';

    container.innerHTML = `${headerHTML}
        <div class="team-pendings-summary">
            <div class="team-stat"><div class="team-stat-num">${pendings.length}</div><div class="team-stat-label">${esc(t.teamPendingLabel || 'pendientes')}</div></div>
        </div>
        ${listHTML}`;
}

/* ============================================
   TEAM — Sección Carreras del team (inline)
   ============================================ */
function renderTeamRacesInline() {
    const t = T[lang] || {};
    const locale = lang === 'pt' ? 'pt-BR' : lang === 'en' ? 'en-US' : 'es-AR';
    const now = new Date();

    // Construir lista desde teamRaces global + R por país
    const teamRaceList = [];
    if (typeof teamRaces !== 'undefined' && typeof R !== 'undefined') {
        for (const cid of Object.keys(R)) {
            R[cid].forEach((r, idx) => {
                const rid = r._id || cid + '_' + idx;
                if (teamRaces.includes(rid)) {
                    teamRaceList.push({ ...r, _country: cid, _idx: idx, _rid: rid });
                }
            });
        }
    }
    teamRaceList.sort((a, b) => new Date(a.d + 'T00:00:00') - new Date(b.d + 'T00:00:00'));
    const upcoming = teamRaceList.filter(r => new Date(r.d + 'T00:00:00') >= now);
    const past = teamRaceList.filter(r => new Date(r.d + 'T00:00:00') < now);

    const headerHTML = `<div class="profile-section-header section-header-centered">
        <h1 class="profile-section-title">${esc(t.teamCalendarTitle || 'Calendario del equipo')}<span class="accent">.</span></h1>
    </div>`;

    if (!teamRaceList.length) {
        return `<div class="profile-content-wrap">
            ${headerHTML}
            <div class="team-members-empty">
                <div class="empty-icon">${lucideIcon('calendar-days', 36)}</div>
                <div class="empty-title">${esc(t.teamRacesEmptyTitle || 'Sin carreras marcadas aún')}</div>
                <div class="empty-sub">${esc(t.teamRacesEmptySub || 'Marcá las carreras donde va a correr tu equipo y se mostrarán acá en el calendario compartido.')}</div>
                <button class="empty-cta" onclick="profileNav('discover')">${lucideIcon('plus', 14)}<span>${esc(t.teamRacesEmptyCta || 'Sumar carreras')}</span></button>
            </div>
        </div>`;
    }

    const renderRaceCard = (r) => {
        const dt = new Date(r.d + 'T00:00:00');
        const dateStr = dt.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
        const country = (typeof countries !== 'undefined') ? countries.find(c => c.id === r._country) : null;
        const typeLabel = r.t === 'trail' ? 'Trail' : (t.road || 'Asfalto');
        const typeClass = r.t === 'trail' ? 'type-trail' : 'type-road';
        return `<div class="team-race-card" onclick="closeRaceModal&&closeRaceModal();setTimeout(()=>openDrawer&&openDrawer('${esc(r._country)}',${r._idx}),200)">
            <div class="team-race-date">
                <div class="team-race-day">${dt.getDate()}</div>
                <div class="team-race-month">${dt.toLocaleDateString(locale, { month: 'short' }).toUpperCase()}</div>
            </div>
            <div class="team-race-body">
                <div class="team-race-name">${esc(r.n)}</div>
                <div class="team-race-meta">${esc(r.l || '')}${country ? ' · ' + esc(country.name) : ''} · <span class="${typeClass}">${esc(typeLabel)}</span></div>
                <div class="team-race-pills">${(r.c || []).map(d => `<span class="m-pill">${esc(d)}</span>`).join('')}</div>
            </div>
            <div class="m-chevron">${lucideIcon('chevron-right', 16)}</div>
        </div>`;
    };

    let upcomingHTML = '';
    if (upcoming.length) {
        upcomingHTML = `<div class="team-races-section">
            <div class="team-races-section-title">${esc(t.temporadaSectionUpcoming || 'Por correr')} <span class="badge-count">${upcoming.length}</span></div>
            <div class="team-races-list">${upcoming.map(renderRaceCard).join('')}</div>
        </div>`;
    }
    let pastHTML = '';
    if (past.length) {
        pastHTML = `<div class="team-races-section">
            <div class="team-races-section-title">${esc(t.temporadaSectionPast || 'Corridas')} <span class="badge-count">${past.length}</span></div>
            <div class="team-races-list">${past.slice(-5).reverse().map(renderRaceCard).join('')}</div>
        </div>`;
    }

    return `<div class="profile-content-wrap">
        ${headerHTML}
        <div class="team-members-summary">
            <div class="team-stat"><div class="team-stat-num">${teamRaceList.length}</div><div class="team-stat-label">${esc(t.teamCalendarTotal || 'carreras marcadas')}</div></div>
            <div class="team-stat"><div class="team-stat-num">${upcoming.length}</div><div class="team-stat-label">${esc(t.temporadaToRun || 'por correr')}</div></div>
            <div class="team-stat"><div class="team-stat-num">${past.length}</div><div class="team-stat-label">${esc(t.temporadaDone || 'corridas')}</div></div>
        </div>
        <div class="team-members-cta-row">
            <button class="team-invite-cta" onclick="profileNav('discover')">${lucideIcon('plus', 16)}<span>${esc(t.teamRacesEmptyCta || 'Sumar carreras')}</span></button>
        </div>
        ${upcomingHTML}
        ${pastHTML}
    </div>`;
}

/* ============================================
   TEAM — Sección Anuncios (inline, solo el team owner publica)
   ============================================ */
function renderTeamAnnouncementsInline() {
    const t = T[lang] || {};
    const locale = lang === 'pt' ? 'pt-BR' : lang === 'en' ? 'en-US' : 'es-AR';
    const teamId = currentUser?.id;
    const isOwner = currentProfile?.role === 'team';
    const teamAnns = (typeof _teamAnnouncements !== 'undefined' ? _teamAnnouncements : []).filter(a => a.team_id === teamId);

    const headerHTML = `<div class="profile-section-header section-header-centered">
        <h1 class="profile-section-title">${esc(t.teamAnnounceTitle || 'Anuncios')}<span class="accent">.</span></h1>
    </div>`;

    // Form de publicar (solo owner) — minimal: título + textarea + botón
    let formHTML = '';
    if (isOwner) {
        const canPost = teamAnns.length < 5;
        formHTML = `<div class="announce-form-card">
            <div class="announce-form-title">${esc(t.teamAnnouncePostNew || 'Publicar nuevo anuncio')}</div>
            <textarea class="announce-form-input" id="teamAnnounceText" rows="3" maxlength="500" ${canPost ? '' : 'disabled'}></textarea>
            <button class="announce-publish-btn" onclick="postTeamAnnouncementInline()" ${canPost ? '' : 'disabled'}>
                <span>${esc(t.teamAnnouncePost || 'Publicar')}</span>
            </button>
        </div>`;
    }

    // Lista de anuncios
    let listHTML = '';
    if (teamAnns.length) {
        listHTML = '<div class="announcement-list-v2">';
        teamAnns.slice().reverse().forEach((a, i) => {
            const dt = new Date(a.created_at);
            const dateStr = dt.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
            const realIdx = teamAnns.length - 1 - i;
            listHTML += `<div class="announcement-card-v2">
                <div class="announcement-bar"></div>
                <div class="announcement-body">
                    <div class="announcement-text">${esc(a.message)}</div>
                    <div class="announcement-meta">
                        <span class="announcement-date">${esc(dateStr)}</span>
                        ${isOwner ? `<button class="announcement-delete-btn" onclick="deleteTeamAnnouncementInline(${realIdx})" title="${esc(t.raceDelete || 'Eliminar')}" aria-label="${esc(t.raceDelete || 'Eliminar')}">${lucideIcon('x', 14)}</button>` : ''}
                    </div>
                </div>
            </div>`;
        });
        listHTML += '</div>';
    } else {
        listHTML = `<div class="team-members-empty">
            <div class="empty-icon">${lucideIcon('megaphone', 36)}</div>
            <div class="empty-title">${esc(t.teamAnnounceEmptyTitle || 'Sin anuncios todavía')}</div>
            <div class="empty-sub">${isOwner ? esc(t.teamAnnounceEmptySubOwner || 'Publicá el primer anuncio para comunicar algo importante a los miembros de tu equipo.') : esc(t.teamAnnounceEmpty || 'No hay anuncios')}</div>
        </div>`;
    }

    return `<div class="profile-content-wrap">
        ${headerHTML}
        ${formHTML}
        ${listHTML}
    </div>`;
}

/* Persistencia en BD primero. Si falla, fallback al cache local.
   El INSERT en BD dispara el trigger que crea notifications a los miembros. */
async function postTeamAnnouncementInline() {
    const text = document.getElementById('teamAnnounceText')?.value?.trim();
    if (!text || !currentUser) return;
    const t = T[lang] || {};

    if (sbClient) {
        const { data, error } = await sbClient.from('team_announcements').insert({ team_id: currentUser.id, message: text }).select().single();
        if (error) {
            if (typeof showToast === 'function') showToast(error.message || (t.teamAnnounceErr || 'No pudimos publicar el anuncio'), 'error');
            return;
        }
        if (data) _teamAnnouncements.push(data);
    } else {
        _teamAnnouncements.push({ team_id: currentUser.id, message: text, created_at: new Date().toISOString() });
    }
    try { localStorage.setItem('pulz_team_announcements', JSON.stringify(_teamAnnouncements)); } catch (e) {}

    if (typeof showToast === 'function') showToast(t.teamAnnouncePosted || 'Anuncio publicado', 'success');
    if (typeof profileNav === 'function') profileNav('announcements');
}

async function deleteTeamAnnouncementInline(idx) {
    if (typeof _teamAnnouncements === 'undefined') return;
    const teamAnns = _teamAnnouncements.filter(a => a.team_id === currentUser?.id);
    if (idx < 0 || idx >= teamAnns.length) return;
    const target = teamAnns[idx];

    if (sbClient && target.id) {
        const { error } = await sbClient.from('team_announcements').delete().eq('id', target.id);
        if (error) {
            const t = T[lang] || {};
            if (typeof showToast === 'function') showToast(error.message || (t.loadError || 'No pudimos eliminar el anuncio'), 'error');
            return;
        }
    }
    _teamAnnouncements = _teamAnnouncements.filter(a => a !== target);
    try { localStorage.setItem('pulz_team_announcements', JSON.stringify(_teamAnnouncements)); } catch (e) {}
    if (typeof profileNav === 'function') profileNav('announcements');
}

/**
 * Convierte el valor crudo de team_modality (road / trail / both) en un label legible
 * traducido al idioma activo. Para "both" muestra ambas separadas con punto medio.
 */
function formatTeamModality(modality) {
    const t = T[lang] || {};
    if (!modality) return '—';
    const trailLabel = t.trail || 'Trail';
    const roadLabel = t.road || 'Asfalto';
    if (modality === 'both') return `${trailLabel.toUpperCase()} · ${roadLabel.toUpperCase()}`;
    if (modality === 'trail') return trailLabel.toUpperCase();
    if (modality === 'road') return roadLabel.toUpperCase();
    return modality.toString().toUpperCase();
}

function renderTeamHome() {
    const t = T[lang] || {};
    const p = currentProfile || {};
    const name = p.team_name || 'Tu running team';
    const pendingCount = typeof teamPendingsCount !== 'undefined' ? teamPendingsCount : 0;
    const racesCount = (typeof teamRaces !== 'undefined' ? teamRaces.length : 0);
    const memberCount = (typeof teamMembersCount !== 'undefined' ? teamMembersCount : 0);

    const waitingWord = pendingCount === 1 ? (t.dashRunnerWaiting || 'runner esperando') : (t.dashRunnersWaiting || 'runners esperando');
    const primary = pendingCount > 0
        ? { eyebrow: t.dashRevPostulacionesEye || 'Postulaciones', name:`${pendingCount} ${waitingWord}`, meta: t.dashRevPostulacionesSub || 'Tocá para revisar y aprobar/rechazar.', cta: t.dashRevPostulacionesCta || 'Revisar postulaciones', target:'pendings', highlight:true }
        : { eyebrow: t.dashYourTeam || 'Tu team', name:name, meta: t.dashShareTeamLink || 'Compartí el link público y aprobá postulaciones que lleguen.', cta: t.dashViewMembers || 'Ver miembros', target:'members', highlight:false };

    return `<div class="profile-content-wrap profile-home-compact">
        <div class="ph-header">
            <div class="profile-role-badge">
                <span class="profile-role-badge-dot" aria-hidden="true"></span>
                <span>${esc(t.authRoleTeam || 'Running Team')}</span>
                ${p.team_city ? `<span class="profile-role-badge-sep">·</span><span class="profile-role-badge-meta">${esc(p.team_city)}</span>` : ''}
            </div>
            <h1 class="ph-title">${esc(name)}<span class="accent">.</span></h1>
        </div>

        <div class="ph-role-card">
            <div class="ph-role-desc">${esc(t.roleTeamDesc || 'Coordinás miembros, marcás carreras del team, gestionás postulaciones y mantenés viva la comunidad.')}</div>
        </div>

        <div class="ph-stats">
            <div class="ph-stat accent">
                <div class="ph-stat-label">${esc(t.statMembers || 'Miembros')}</div>
                <div class="ph-stat-value">${memberCount || '—'}</div>
            </div>
            <div class="ph-stat">
                <div class="ph-stat-label">${esc(t.statPending || 'Pendientes')}</div>
                <div class="ph-stat-value">${pendingCount}</div>
            </div>
            <div class="ph-stat">
                <div class="ph-stat-label">${esc(t.statRaces || 'Carreras')}</div>
                <div class="ph-stat-value">${racesCount}</div>
            </div>
            <div class="ph-stat">
                <div class="ph-stat-label">${esc(t.statModality || 'Modalidad')}</div>
                <div class="ph-stat-value" style="font-size:${p.team_modality === 'both' ? '15px' : '24px'};letter-spacing:-0.3px;line-height:1.15">${esc(formatTeamModality(p.team_modality))}</div>
            </div>
        </div>

        <div class="ph-bottom ph-bottom-solo">
            <div class="ph-next ${primary.highlight?'':'ph-next-empty'}" onclick="profileNav('${primary.target}')">
                <div class="ph-next-eyebrow">${esc(primary.eyebrow)}</div>
                <div class="ph-next-name">${esc(primary.name)}</div>
                <div class="ph-next-meta">${esc(primary.meta)}</div>
                <div class="ph-next-cta">${esc(primary.cta)} →</div>
            </div>
        </div>
    </div>`;
}

function renderTeamStats() {
    setTimeout(populateTeamStatsInline, 50);
    const t = T[lang] || {};
    return `<div id="teamStatsInline" class="profile-content-wrap">
        <div class="profile-section-header section-header-centered">
            <h1 class="profile-section-title">${esc(t.teamStatsTitle || 'Estadísticas')}<span class="accent">.</span></h1>
        </div>
        <div class="team-members-loading-block"><span class="auth-submit-loader" style="display:inline-block;position:static;border-top-color:var(--txt3)"></span><span>${esc(t.loading || 'Cargando…')}</span></div>
    </div>`;
}

async function populateTeamStatsInline() {
    const container = document.getElementById('teamStatsInline');
    if (!container) return;
    if (!currentUser || currentProfile?.role !== 'team') return;

    const t = T[lang] || {};
    const headerHTML = `<div class="profile-section-header section-header-centered">
        <h1 class="profile-section-title">${esc(t.teamStatsTitle || 'Estadísticas')}<span class="accent">.</span></h1>
    </div>`;

    let members = [];
    try {
        members = (typeof loadTeamMembers === 'function') ? await loadTeamMembers() : [];
    } catch (e) {
        console.error('[populateTeamStatsInline] Error:', e);
    }

    // Empty state nivel 1: sin miembros
    if (!members.length) {
        container.innerHTML = `${headerHTML}
        <div class="team-members-empty">
            <div class="empty-icon">${lucideIcon('trending-up', 36)}</div>
            <div class="empty-title">${esc(t.teamStatsEmpty1Title || 'Las stats se activan con tu primer miembro')}</div>
            <div class="empty-sub">${esc(t.teamStatsEmpty1Sub || 'Cuando invites runners y empiecen a correr, vas a ver acá el pulso colectivo del team: km totales, top runners, distribución trail vs asfalto.')}</div>
        </div>`;
        return;
    }

    // Calcular agregados
    const totalKm = members.reduce((s, m) => s + parseFloat(m.total_km || 0), 0);
    const totalRaces = members.reduce((s, m) => s + parseInt(m.races_completed || 0), 0);
    const activeMembers = members.filter(m => {
        const d = m.last_race_date;
        if (!d) return false;
        const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
        return days <= 60;
    }).length;
    const avgKmPerMember = members.length > 0 ? Math.round(totalKm / members.length) : 0;

    // Empty state nivel 2: hay miembros pero 0 actividad registrada
    if (totalRaces === 0) {
        container.innerHTML = `${headerHTML}
        <div class="team-members-summary">
            <div class="team-stat"><div class="team-stat-num">${members.length}</div><div class="team-stat-label">${esc(t.teamMembersCount || 'miembros')}</div></div>
            <div class="team-stat"><div class="team-stat-num">0</div><div class="team-stat-label">${esc(t.teamMembersTotalRaces || 'carreras completadas')}</div></div>
        </div>
        <div class="team-members-empty">
            <div class="empty-icon">${lucideIcon('flag-triangle-right', 36)}</div>
            <div class="empty-title">${esc(t.teamStatsEmpty2Title || 'Esperando la primera carrera')}</div>
            <div class="empty-sub">${esc(t.teamStatsEmpty2Sub || 'Tenés miembros pero todavía nadie cargó carreras completadas. Cuando un runner marque una carrera como corrida, las stats se actualizan automáticamente.')}</div>
        </div>`;
        return;
    }

    // Dashboard real con datos
    const statsTopHTML = `<div class="team-members-summary">
        <div class="team-stat"><div class="team-stat-num">${members.length}</div><div class="team-stat-label">${esc(t.teamMembersCount || 'miembros')}</div></div>
        <div class="team-stat"><div class="team-stat-num">${activeMembers}</div><div class="team-stat-label">${esc(t.teamMembersActiveRunners || 'runners activos')}</div></div>
        <div class="team-stat"><div class="team-stat-num">${Math.round(totalKm)}</div><div class="team-stat-label">${esc(t.teamMembersTotalKm || 'km entre todos')}</div></div>
        <div class="team-stat"><div class="team-stat-num">${totalRaces}</div><div class="team-stat-label">${esc(t.teamMembersTotalRaces || 'carreras completadas')}</div></div>
    </div>`;

    // Top runners por km
    const topByKm = [...members]
        .filter(m => parseFloat(m.total_km || 0) > 0)
        .sort((a, b) => parseFloat(b.total_km || 0) - parseFloat(a.total_km || 0))
        .slice(0, 5);
    let leaderboardHTML = '';
    if (topByKm.length) {
        leaderboardHTML = `<div class="stats-block">
            <div class="stats-block-title">${esc(t.teamStatsTopKm || 'Top runners por kilómetros')}</div>
            <div class="stats-leaderboard">`;
        topByKm.forEach((m, i) => {
            const name = m.display_name || 'Runner';
            const initial = (name[0] || 'R').toUpperCase();
            const km = Math.round(parseFloat(m.total_km || 0));
            const races = parseInt(m.races_completed || 0);
            const isFounding = !!m.is_founding_member;
            const dorsalHTML = m.dorsal_number ? dorsalBadge(m.dorsal_number, isFounding) : '';
            leaderboardHTML += `<div class="stats-leader-row">
                <div class="stats-leader-rank">${i + 1}</div>
                <div class="m-avatar" style="width:32px;height:32px;font-size:0.85rem">${esc(initial)}</div>
                <div class="stats-leader-info">
                    <div class="stats-leader-name">${esc(name)} ${dorsalHTML}</div>
                    <div class="stats-leader-meta">${races} ${esc(t.teamMemberRaces || 'carreras')}</div>
                </div>
                <div class="stats-leader-val">${km} <span class="stats-leader-unit">km</span></div>
            </div>`;
        });
        leaderboardHTML += `</div></div>`;
    }

    // Promedio por miembro
    const avgHTML = `<div class="stats-block">
        <div class="stats-block-title">${esc(t.teamStatsAvg || 'Promedio por miembro')}</div>
        <div class="stats-avg-grid">
            <div class="stats-avg-item">
                <div class="stats-avg-num">${avgKmPerMember}</div>
                <div class="stats-avg-label">${esc(t.teamStatsAvgKm || 'km por miembro')}</div>
            </div>
            <div class="stats-avg-item">
                <div class="stats-avg-num">${members.length > 0 ? (totalRaces / members.length).toFixed(1) : 0}</div>
                <div class="stats-avg-label">${esc(t.teamStatsAvgRaces || 'carreras por miembro')}</div>
            </div>
        </div>
    </div>`;

    container.innerHTML = `${headerHTML}
        ${statsTopHTML}
        ${leaderboardHTML}
        ${avgHTML}`;
}

/* === ORGANIZER === */
function renderOrganizerSection(section) {
    if (section === 'races') { setTimeout(() => typeof openMyRaces === 'function' && openMyRaces(), 50); return _profileLoadingSection('Mis carreras'); }
    if (section === 'notifications') return renderNotificationsInline();
    return renderOrganizerHome();
}

function renderOrganizerHome() {
    const t = T[lang] || {};
    const p = currentProfile || {};
    const name = p.org_name || 'Tu organización';
    return `<div class="profile-content-wrap profile-home-compact">
        <div class="ph-header">
            <div class="profile-role-badge">
                <span class="profile-role-badge-dot" aria-hidden="true"></span>
                <span>${esc(t.authRoleOrg || 'Organizador')}</span>
                ${p.org_country ? `<span class="profile-role-badge-sep">·</span><span class="profile-role-badge-meta">${esc(p.org_country.toUpperCase())}</span>` : ''}
            </div>
            <h1 class="ph-title">${esc(name)}<span class="accent">.</span></h1>
        </div>

        <div class="ph-role-card">
            <div class="ph-role-desc">${esc(t.roleOrgDesc || 'Publicás carreras, llegás a runners de toda Latinoamérica y trackeás la performance de cada evento.')}</div>
        </div>

        <div class="ph-stats">
            <div class="ph-stat accent">
                <div class="ph-stat-label">${esc(t.statRaces || 'Carreras')}</div>
                <div class="ph-stat-value">—</div>
            </div>
            <div class="ph-stat">
                <div class="ph-stat-label">${esc(t.statInterested || 'Interesados')}</div>
                <div class="ph-stat-value">—</div>
            </div>
            <div class="ph-stat">
                <div class="ph-stat-label">${esc(t.statClicks || 'Clicks')}</div>
                <div class="ph-stat-value">—</div>
            </div>
            <div class="ph-stat">
                <div class="ph-stat-label">${esc(t.statCountry || 'País')}</div>
                <div class="ph-stat-value" style="font-size:24px;letter-spacing:-0.3px">${esc((p.org_country||'—').toString().toUpperCase())}</div>
            </div>
        </div>

        <div class="ph-bottom ph-bottom-solo">
            <div class="ph-next" onclick="if(typeof openPublishRaceModal==='function')openPublishRaceModal()">
                <div class="ph-next-eyebrow">${esc(t.dashPublishEyebrow || 'Publicá una carrera')}</div>
                <div class="ph-next-name">${esc(t.dashPublishHook || 'Llegá a runners de 7 países.')}</div>
                <div class="ph-next-meta">${esc(t.dashPublishSub || 'Cargá fecha, distancias, ubicación e inscripción. En minutos está visible.')}</div>
                <div class="ph-next-cta">${esc(t.dashPublishBtn || 'Publicar carrera')} →</div>
            </div>
        </div>
    </div>`;
}
