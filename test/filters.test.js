/* Harness de testing para los filtros del buscador de carreras.
   Reproduce la lógica de renderRaces() en app.js sin DOM,
   con carreras sintéticas que ejercitan cada filtro y combinaciones. */

// ===== Helpers copiados literal de js/app.js (líneas 67-118) =====
function norm(s){return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');}
function getMaxDist(c){let m=0;c.forEach(x=>{const n=parseFloat(x);if(!isNaN(n))m=Math.max(m,n);if(x.toLowerCase().includes('ultra'))m=Math.max(m,100)});return m}
function distCats(c){
    const cats=new Set();
    c.forEach(x=>{
        const n=parseFloat(x);
        if(!isNaN(n)){
            if(n>42.195)cats.add('ultra');
            else if(n>=42)cats.add('42k');
            else if(n>=21)cats.add('21k');
            else if(n>0)cats.add('10k');
        }
        if(x.toLowerCase().includes('ultra'))cats.add('ultra');
    });
    return cats;
}
function getToday(){const d=new Date('2026-05-18T00:00:00');d.setHours(0,0,0,0);return d;} // hoy fijo para repetibilidad
function futureRaces(arr){return arr.filter(r=>new Date(r.d+'T23:59:59')>=getToday());}

// ===== Lógica de filtro extraída de renderRaces() (líneas 367-382) =====
function applyFilters(races, F, searchQuery, showPast, isAll = false) {
    const visible = showPast ? races : futureRaces(races);
    const { month, type, dist, dateFrom, dateTo } = F;
    const dfFrom = dateFrom ? new Date(dateFrom + 'T00:00:00') : null;
    const dfTo = dateTo ? new Date(dateTo + 'T23:59:59') : null;
    const tokens = searchQuery ? norm(searchQuery).split(/\s+/).filter(Boolean) : [];

    return visible.filter(r => {
        const dt = new Date(r.d + 'T00:00:00');
        const mo = dt.getMonth();
        const dcSet = distCats(r.c);
        const matchMonth = (dfFrom || dfTo) ? true : (month === 'all' || mo === month);
        const matchType = type === 'all' || r.t === type;
        const matchDist = dist === 'all' || dcSet.has(dist);
        const matchDateRange = (!dfFrom || dt >= dfFrom) && (!dfTo || dt <= dfTo);

        let matchSearch = true;
        if (tokens.length) {
            const extra = isAll ? (r._countryName || '') : '';
            const haystack = norm(r.n + ' ' + r.l + ' ' + r.c.join(' ') + ' ' + r.t + ' ' + extra);
            matchSearch = tokens.every(tok => haystack.includes(tok));
        }
        return matchMonth && matchType && matchDist && matchDateRange && matchSearch;
    });
}

// ===== Carreras sintéticas =====
// Hoy fijo = 2026-05-18. Construyo races futuras y pasadas, tipos y distancias variadas.
const RACES = [
    // Futuras
    { n: 'Maratón de Buenos Aires', d: '2026-09-20', l: 'Buenos Aires, CABA', c: ['42K','21K','10K'], t: 'asfalto' },
    { n: 'Media de Rosario', d: '2026-06-15', l: 'Rosario, Santa Fe', c: ['21K','10K'], t: 'asfalto' },
    { n: '10K Palermo', d: '2026-07-04', l: 'Palermo, CABA', c: ['10K','5K'], t: 'asfalto' },
    { n: 'Trail Patagonia', d: '2026-08-10', l: 'Bariloche, Río Negro', c: ['50K','25K'], t: 'trail' },
    { n: 'Trail Norte', d: '2026-06-22', l: 'Salta', c: ['Trail'], t: 'trail' }, // sin distancia numérica
    { n: 'Ultra Mendoza', d: '2026-11-15', l: 'Mendoza', c: ['100K','50K','30K'], t: 'trail' },
    { n: 'Iconic 42K', d: '2026-10-12', l: 'Mar del Plata', c: ['42K'], t: 'asfalto' },
    { n: 'Solo Ultra', d: '2026-12-01', l: 'Catamarca', c: ['Ultra'], t: 'trail' },
    // Pasadas (anteriores a 2026-05-18)
    { n: 'Maratón Ya Pasada', d: '2026-03-15', l: 'Buenos Aires', c: ['42K'], t: 'asfalto' },
    { n: 'Trail Pasada', d: '2026-02-20', l: 'Córdoba', c: ['Trail'], t: 'trail' },
];

// ===== Test runner =====
let passed = 0, failed = 0;
const failures = [];

function test(name, fn) {
    try {
        const result = fn();
        if (result === true) { passed++; console.log('  PASS  ' + name); }
        else { failed++; failures.push({ name, result }); console.log('  FAIL  ' + name + '  →  ' + result); }
    } catch (e) {
        failed++; failures.push({ name, error: e.message });
        console.log('  ERR   ' + name + '  →  ' + e.message);
    }
}

function names(arr) { return arr.map(r => r.n).sort(); }
function expect(actual, expected) {
    const a = JSON.stringify(actual.sort());
    const e = JSON.stringify(expected.sort());
    return a === e ? true : `expected ${e}\n         got      ${a}`;
}

const F0 = () => ({ month: 'all', type: 'all', dist: 'all', dateFrom: '', dateTo: '' });

console.log('\n=== Filtro: showPast (toggle finalizadas) ===');
test('showPast=false oculta carreras pasadas', () => {
    const r = applyFilters(RACES, F0(), '', false);
    return expect(names(r), names(RACES.filter(x => x.d >= '2026-05-18')));
});
test('showPast=true incluye todas', () => {
    const r = applyFilters(RACES, F0(), '', true);
    return expect(names(r), names(RACES));
});

console.log('\n=== Filtro: Tipo ===');
test('type=asfalto solo trae asfalto', () => {
    const r = applyFilters(RACES, { ...F0(), type: 'asfalto' }, '', true);
    return r.every(x => x.t === 'asfalto') ? true : 'incluyó tipo no-asfalto: ' + JSON.stringify(r.map(x=>x.t));
});
test('type=trail solo trae trail', () => {
    const r = applyFilters(RACES, { ...F0(), type: 'trail' }, '', true);
    return r.every(x => x.t === 'trail') ? true : 'incluyó tipo no-trail: ' + JSON.stringify(r.map(x=>x.t));
});

console.log('\n=== Filtro: Mes ===');
test('month=5 (junio) solo trae carreras de junio', () => {
    const r = applyFilters(RACES, { ...F0(), month: 5 }, '', true);
    return r.every(x => x.d.startsWith('2026-06')) ? true : 'mes incorrecto: ' + JSON.stringify(r.map(x=>x.d));
});
test('month=11 (diciembre) trae carreras de diciembre', () => {
    const r = applyFilters(RACES, { ...F0(), month: 11 }, '', true);
    return expect(names(r), ['Solo Ultra']);
});

console.log('\n=== Filtro: Distancia (semántica: "ofrece esta distancia") ===');
test('dist=42k incluye toda carrera con 42K disponible', () => {
    const r = applyFilters(RACES, { ...F0(), dist: '42k' }, '', true);
    return expect(names(r), ['Iconic 42K', 'Maratón Ya Pasada', 'Maratón de Buenos Aires']);
});
test('dist=ultra incluye Trail Patagonia (50K), Ultra Mendoza (100K), Solo Ultra', () => {
    const r = applyFilters(RACES, { ...F0(), dist: 'ultra' }, '', true);
    return expect(names(r), ['Trail Patagonia', 'Ultra Mendoza', 'Solo Ultra']);
});
test('dist=21k incluye toda carrera con distancia en [21K, 42K)', () => {
    const r = applyFilters(RACES, { ...F0(), dist: '21k' }, '', true);
    // Maratón BsAs (21K), Media Rosario (21K), Trail Patagonia (25K), Ultra Mendoza (30K)
    return expect(names(r), ['Maratón de Buenos Aires', 'Media de Rosario', 'Trail Patagonia', 'Ultra Mendoza']);
});
test('dist=10k incluye toda carrera con 10K disponible', () => {
    const r = applyFilters(RACES, { ...F0(), dist: '10k' }, '', true);
    return expect(names(r), ['10K Palermo', 'Media de Rosario', 'Maratón de Buenos Aires']);
});
test('dist=10k NO incluye trail genéricos sin distancia conocida', () => {
    const r = applyFilters(RACES, { ...F0(), dist: '10k' }, '', true);
    const trailNames = ['Trail Norte', 'Trail Pasada'];
    const included = r.filter(x => trailNames.includes(x.n));
    return included.length === 0 ? true : 'Aparecen: ' + JSON.stringify(included.map(x=>x.n));
});

console.log('\n=== Filtro: Rango de fechas ===');
test('dateFrom=2026-06-01, dateTo=2026-06-30 solo junio', () => {
    const r = applyFilters(RACES, { ...F0(), dateFrom: '2026-06-01', dateTo: '2026-06-30' }, '', true);
    return r.every(x => x.d >= '2026-06-01' && x.d <= '2026-06-30') ? true : 'fechas fuera de rango: ' + JSON.stringify(r.map(x=>x.d));
});
test('dateFrom solo (sin dateTo) filtra >=', () => {
    const r = applyFilters(RACES, { ...F0(), dateFrom: '2026-10-01' }, '', true);
    return r.every(x => x.d >= '2026-10-01') ? true : JSON.stringify(r.map(x=>x.d));
});
test('dateTo solo (sin dateFrom) filtra <=', () => {
    const r = applyFilters(RACES, { ...F0(), dateTo: '2026-06-30' }, '', true);
    return r.every(x => x.d <= '2026-06-30') ? true : JSON.stringify(r.map(x=>x.d));
});

console.log('\n=== Filtro: Búsqueda ===');
test('búsqueda "bariloche" matchea por location', () => {
    const r = applyFilters(RACES, F0(), 'bariloche', true);
    return expect(names(r), ['Trail Patagonia']);
});
test('búsqueda "trail" matchea por type', () => {
    const r = applyFilters(RACES, F0(), 'trail', true);
    return r.every(x => x.t === 'trail' || x.c.some(c => c.toLowerCase().includes('trail'))) ? true : 'no-trail incluida';
});
test('búsqueda con acentos: "maraton" matchea "Maratón"', () => {
    const r = applyFilters(RACES, F0(), 'maraton', true);
    return r.some(x => x.n === 'Maratón de Buenos Aires') ? true : 'no matcheó acento';
});

console.log('\n=== Combinaciones ===');
test('tipo=asfalto + mes=junio + futuras', () => {
    const r = applyFilters(RACES, { ...F0(), type: 'asfalto', month: 5 }, '', false);
    return expect(names(r), ['Media de Rosario']);
});
test('búsqueda + tipo combinados', () => {
    const r = applyFilters(RACES, { ...F0(), type: 'asfalto' }, 'palermo', true);
    return expect(names(r), ['10K Palermo']);
});

console.log('\n=== Edge cases ===');
test('c=["Trail"] (sin nro) tiene set vacío → solo matchea "all"', () => {
    const cats = distCats(['Trail']);
    return cats.size === 0 ? true : 'expected set vacío, got ' + JSON.stringify([...cats]);
});
test('c=["Ultra"] (sin nro) → set {ultra}', () => {
    const cats = distCats(['Ultra']);
    return cats.has('ultra') && cats.size === 1 ? true : 'got ' + JSON.stringify([...cats]);
});
test('c=["42K","21K","10K"] → set {42k, 21k, 10k}', () => {
    const cats = distCats(['42K','21K','10K']);
    return cats.size === 3 && cats.has('42k') && cats.has('21k') && cats.has('10k') ? true : 'got ' + JSON.stringify([...cats]);
});
test('c=["6K"] → set {10k}', () => {
    const cats = distCats(['6K']);
    return cats.has('10k') && cats.size === 1 ? true : 'got ' + JSON.stringify([...cats]);
});
test('c=["70K","50K","42K","25K","15K","6K"] (Aconcagua) cubre todas las cats', () => {
    const cats = distCats(['70K','50K','42K','25K','15K','6K']);
    return cats.has('ultra') && cats.has('42k') && cats.has('21k') && cats.has('10k') ? true : 'got ' + JSON.stringify([...cats]);
});

// ===== Resumen =====
console.log('\n' + '='.repeat(60));
console.log(`PASSED: ${passed}   FAILED: ${failed}`);
if (failed > 0) {
    console.log('\nFAILURES:');
    failures.forEach(f => console.log('  - ' + f.name + (f.error ? ' [' + f.error + ']' : '')));
    process.exit(1);
}
process.exit(0);
