/**
 * PULZ — Application Logic
 * Handles: navigation, filtering, rendering, page generation
 */

// Filter state per country
const F = {};

// === HELPERS ===

function getMaxDist(cats) {
    let max = 0;
    cats.forEach(c => {
        const n = parseFloat(c);
        if (!isNaN(n)) max = Math.max(max, n);
        if (c.toLowerCase().includes('ultra')) max = Math.max(max, 100);
    });
    return max;
}

function distCategory(cats) {
    const m = getMaxDist(cats);
    if (m > 42.195) return 'ultra';
    if (m >= 42) return '42k';
    if (m >= 21) return '21k';
    if (m > 0) return '10k';
    const joined = cats.join(' ').toLowerCase();
    if (joined.includes('ultra')) return 'ultra';
    return '10k';
}

function tagClass(cat) {
    const n = parseFloat(cat);
    const lo = cat.toLowerCase();
    if (lo.includes('ultra') || n > 50) return 'tg-u';
    if (lo.includes('trail')) return 'tg-t';
    if (lo.includes('42') || n === 42) return 'tg-f';
    if (lo.includes('21') || (n >= 21 && n < 42)) return 'tg-h';
    return 'tg-s';
}


// === BUILD DROPDOWN ===

function buildDD() {
    document.getElementById('dd').innerHTML = countries.map(c => {
        const cnt = R[c.id].length;
        return `<div class="co" onclick="selC('${c.id}')">
            <span class="co-f">${c.flag}</span>
            <span class="co-n">${c.name}</span>
            <span class="co-c">${cnt}</span>
        </div>`;
    }).join('');
}


// === BUILD PAGES ===

function buildPages() {
    document.getElementById('pages').innerHTML = countries.map(c => `
        <section class="cp" id="p-${c.id}">
            <button class="back" onclick="goHome()" data-i18n="back">${T[lang].back}</button>
            <div class="ph">
                <h1 class="pt">${c.name}</h1>
                <span class="pc" id="pc-${c.id}"></span>
            </div>
            <div class="sb" id="sb-${c.id}"></div>
            <div class="ms">
                <div class="sec-l" data-i18n="month">${T[lang].month}</div>
                <div class="mg" id="mg-${c.id}"></div>
            </div>
            <div class="fr">
                <div class="fg">
                    <div class="sec-l" data-i18n="type">${T[lang].type}</div>
                    <div class="fs" id="ft-${c.id}"></div>
                </div>
                <div class="fg">
                    <div class="sec-l" data-i18n="dist">${T[lang].dist}</div>
                    <div class="fs" id="fd-${c.id}"></div>
                </div>
            </div>
            <div id="rc-${c.id}"></div>
        </section>
    `).join('');
}


// === LOAD PAGE ===

function loadPage(id) {
    const races = R[id] || [];
    F[id] = F[id] || { month: 'all', type: 'all', dist: 'all' };

    // Count badge
    document.getElementById('pc-' + id).textContent = races.length + ' ' + T[lang].cR;

    // Stats bar
    const trail = races.filter(r => r.t === 'trail').length;
    const road = races.filter(r => r.t === 'asfalto').length;
    const iconic = races.filter(r => r.i).length;
    document.getElementById('sb-' + id).innerHTML = `
        <div class="si"><div class="sv">${races.length}</div><div class="sl">${T[lang].statR}</div></div>
        <div class="si"><div class="sv">${road}</div><div class="sl">${T[lang].statA}</div></div>
        <div class="si"><div class="sv">${trail}</div><div class="sl">${T[lang].statT}</div></div>
        <div class="si"><div class="sv">${iconic}</div><div class="sl">${T[lang].statI}</div></div>
    `;

    // Month buttons
    const monthSet = new Set();
    races.forEach(r => monthSet.add(new Date(r.d).getMonth()));
    const mn = MN[lang];
    let mHTML = `<button class="mb${F[id].month === 'all' ? ' active' : ''}" onclick="fM('${id}','all')">ALL</button>`;
    mn.forEach((name, i) => {
        const has = monthSet.has(i);
        mHTML += `<button class="mb${!has ? ' disabled' : ''}${F[id].month === i ? ' active' : ''}" onclick="fM('${id}',${i})" ${has ? '' : 'disabled'}>${name}</button>`;
    });
    document.getElementById('mg-' + id).innerHTML = mHTML;

    // Type filters
    document.getElementById('ft-' + id).innerHTML = ['all', 'asfalto', 'trail'].map(v =>
        `<button class="fb${F[id].type === v ? ' active' : ''}" onclick="fT('${id}','${v}')">${v === 'all' ? T[lang].all : v === 'asfalto' ? T[lang].road : 'Trail'}</button>`
    ).join('');

    // Distance filters
    document.getElementById('fd-' + id).innerHTML = ['all', '10k', '21k', '42k', 'ultra'].map(v => {
        const label = v === 'all' ? T[lang].all : v === '10k' ? '≤10K' : v === '21k' ? '21K' : v === '42k' ? '42K' : 'Ultra';
        return `<button class="fb${F[id].dist === v ? ' active' : ''}" onclick="fD('${id}','${v}')">${label}</button>`;
    }).join('');

    renderRaces(id);
}


// === RENDER RACES ===

function renderRaces(id) {
    const races = R[id] || [];
    const { month, type, dist } = F[id];
    const sorted = [...races].sort((a, b) => new Date(a.d) - new Date(b.d));
    const locale = lang === 'pt' ? 'pt-BR' : lang === 'en' ? 'en-US' : 'es-ES';

    let visible = 0;
    let html = '<div class="rg">';

    sorted.forEach((r, i) => {
        const dt = new Date(r.d);
        const mo = dt.getMonth();
        const dc = distCategory(r.c);

        const matchMonth = month === 'all' || mo === month;
        const matchType = type === 'all' || r.t === type;
        let matchDist = dist === 'all';
        if (!matchDist) {
            matchDist = dist === dc;
        }

        const show = matchMonth && matchType && matchDist;
        if (show) visible++;

        const dateStr = dt.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
        const tags = r.c.map(c => `<span class="tg ${tagClass(c)}">${c}</span>`).join('');
        const link = r.w
            ? `<a href="${r.w}" target="_blank" class="lk">${T[lang].more}</a>`
            : `<span class="lk off">${T[lang].soon}</span>`;
        const iconicCls = r.i ? ' iconic' : '';
        const badge = r.i ? `<div class="ib">★ ${T[lang].iconic}</div>` : '';

        html += `<div class="rc${iconicCls}" style="display:${show ? 'block' : 'none'};animation:fadeUp .4s ease forwards ${0.04 * Math.min(visible, 15)}s;opacity:0">
            ${badge}
            <div class="rd">${dateStr}</div>
            <h3 class="rn">${r.n}</h3>
            <p class="rl">${r.l}</p>
            <div class="rt">${tags}</div>
            ${link}
        </div>`;
    });

    html += '</div>';

    if (visible === 0) {
        html += `<div class="nr">
            <div class="nr-i">—</div>
            <div class="nr-t">${T[lang].noT}</div>
            <div class="nr-h">${T[lang].noH}</div>
        </div>`;
    }

    document.getElementById('rc-' + id).innerHTML = html;
}


// === FILTER HANDLERS ===

function fM(id, m) { F[id].month = m; loadPage(id); }
function fT(id, t) { F[id].type = t; loadPage(id); }
function fD(id, d) { F[id].dist = d; loadPage(id); }


// === NAVIGATION ===

function toggleDD() {
    document.getElementById('dd').classList.toggle('open');
    document.querySelector('.cs-d').classList.toggle('open');
}

function selC(id) {
    document.getElementById('dd').classList.remove('open');
    document.querySelector('.cs-d').classList.remove('open');
    document.getElementById('home').style.display = 'none';
    document.querySelectorAll('.cp').forEach(p => p.classList.remove('active'));
    document.getElementById('p-' + id).classList.add('active');
    F[id] = { month: 'all', type: 'all', dist: 'all' };
    loadPage(id);
    window.scrollTo(0, 0);
}

function goHome() {
    document.querySelectorAll('.cp').forEach(p => p.classList.remove('active'));
    document.getElementById('home').style.display = 'flex';
    window.scrollTo(0, 0);
}

// Close dropdown on outside click
document.addEventListener('click', e => {
    if (!e.target.closest('.cs')) {
        document.getElementById('dd').classList.remove('open');
        document.querySelector('.cs-d').classList.remove('open');
    }
});


// === INIT ===
buildDD();
buildPages();
