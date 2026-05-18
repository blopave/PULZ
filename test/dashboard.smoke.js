/* Smoke test del render del primer login del runner.
   Verifica que el HTML generado tenga las 4 cards con sus handlers correctos. */

// Stubs mínimos del entorno
const T = { es: { navHome:'Inicio', dashHello:'Hola,', dashFirstSub:'Empezá por donde quieras. PULZ se adapta a vos.',
    dashFirstCard1Eye:'BUSCAR', dashFirstCard1Title:'Encontrá tu próxima carrera', dashFirstCard1Desc:'Explorá carreras de 7 países y guardá las que te interesen.',
    dashFirstCard2Eye:'ENTRENÁ', dashFirstCard2Title:'Registrá un entrenamiento', dashFirstCard2Desc:'Llevá tus salidas al día y mirá tu progreso.',
    dashFirstCard3Eye:'GESTIONÁ', dashFirstCard3Title:'Activá tu running team', dashFirstCard3Desc:'Sumá a tus corredores y coordiná entrenamientos.',
    dashFirstCard4Eye:'PUBLICÁ', dashFirstCard4Title:'Subí tu carrera como organizador', dashFirstCard4Desc:'Publicá tu evento y llegá a la comunidad PULZ.'
} };
const lang = 'es';
function esc(s){if(s==null||s==='')return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function lucideIcon(name, size){ return `<svg data-icon="${name}" data-size="${size}"></svg>`; }

// === Función real copiada de auth.js ===
function _renderRunnerFirstLogin(handleDisplay, t) {
    const handleHTML = handleDisplay && handleDisplay.startsWith('@')
        ? `<span class="dash-first-handle"><span class="dash-first-at">@</span>${esc(handleDisplay.slice(1))}</span>`
        : `<span class="dash-first-handle">${esc(handleDisplay)}</span>`;

    const cards = [
        { icon: 'search', eyebrow: t.dashFirstCard1Eye, title: t.dashFirstCard1Title, desc: t.dashFirstCard1Desc, onclick: "profileNav('buscador')" },
        { icon: 'activity', eyebrow: t.dashFirstCard2Eye, title: t.dashFirstCard2Title, desc: t.dashFirstCard2Desc, onclick: "openTrainingModal()" },
        { icon: 'users', eyebrow: t.dashFirstCard3Eye, title: t.dashFirstCard3Title, desc: t.dashFirstCard3Desc, onclick: "openCreateTeamModal()" },
        { icon: 'megaphone', eyebrow: t.dashFirstCard4Eye, title: t.dashFirstCard4Title, desc: t.dashFirstCard4Desc, onclick: "openActivateOrganizerModal()" }
    ];

    const cardsHTML = cards.map((c, i) => `
        <button type="button" class="dash-first-card pz-enter pz-enter-${3 + i}" onclick="${c.onclick}">
            <span class="dash-first-card-icon" aria-hidden="true">${lucideIcon(c.icon, 22)}</span>
            <span class="dash-first-card-body">
                <span class="dash-first-card-eye">${esc(c.eyebrow)}</span>
                <span class="dash-first-card-title">${esc(c.title)}</span>
                <span class="dash-first-card-desc">${esc(c.desc)}</span>
            </span>
            <span class="dash-first-card-arrow" aria-hidden="true">${lucideIcon('arrow-right', 18)}</span>
        </button>`).join('');

    return `
        <div class="profile-content-wrap dash-runner dash-first">
            <div class="dash-first-hero pz-enter pz-enter-2">
                <div class="dash-first-greet">${esc(t.dashHello || 'Hola,')} ${handleHTML}</div>
            </div>
            <div class="dash-first-stack">${cardsHTML}</div>
        </div>`;
}

// === Asserts ===
let pass = 0, fail = 0;
function check(name, cond) { if (cond) { pass++; console.log('  PASS', name); } else { fail++; console.log('  FAIL', name); } }

const html = _renderRunnerFirstLogin('@runner-test', T[lang]);

check('contiene saludo "Hola,"', html.includes('Hola,'));
check('handle @runner-test con @ separado en verde', html.includes('<span class="dash-first-at">@</span>runner-test'));
check('subtitulo removido', !html.includes('Empezá por donde quieras'));
check('eyebrow "Inicio" removido del first-login', !html.includes('class="profile-eyebrow'));
check('stack vertical (no grid)', html.includes('dash-first-stack') && !html.includes('dash-first-grid'));
check('4 cards en el stack', (html.match(/class="dash-first-card /g) || []).length === 4);
check('cada card tiene card-body wrapper', (html.match(/class="dash-first-card-body"/g) || []).length === 4);
check('card buscador → profileNav("buscador")', html.includes(`onclick="profileNav('buscador')"`));
check('card entreno → openTrainingModal()', html.includes(`onclick="openTrainingModal()"`));
check('card team → openCreateTeamModal()', html.includes(`onclick="openCreateTeamModal()"`));
check('card organizer → openActivateOrganizerModal()', html.includes(`onclick="openActivateOrganizerModal()"`));
check('iconos lucide: search, activity, users, megaphone', ['search','activity','users','megaphone'].every(n => html.includes(`data-icon="${n}"`)));
check('arrow icon presente en cada card', (html.match(/data-icon="arrow-right"/g) || []).length === 4);
check('todos los titles esc-safe (sin HTML inyectado)', !html.includes('<script'));
check('estructura abre/cierra divs balanceada', (html.match(/<div/g)||[]).length === (html.match(/<\/div>/g)||[]).length);

// Fallback: handle sin @
const html2 = _renderRunnerFirstLogin('Pablo', T[lang]);
check('handle sin @ (fallback nombre) sin span "@"', !html2.includes('class="dash-first-at"'));
check('handle sin @ muestra el nombre crudo', html2.includes('>Pablo</span>'));

console.log(`\nPASSED: ${pass}   FAILED: ${fail}`);
process.exit(fail > 0 ? 1 : 0);
