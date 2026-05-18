/* Tests del componente HH:MM:SS con auto-jump.
   Valida renderTimeFields, readTimeFields, onTimeFieldInput, onTimeFieldKey. */

// Stub mínimo de DOM
class FakeInput {
    constructor(id) { this.id = id; this.value = ''; this.maxLength = 2; }
    focus() { lastFocused = this.id; }
    select() {}
    setSelectionRange() {}
}
let lastFocused = null;
const _byId = {};
global.document = {
    getElementById: (id) => _byId[id] || null
};

// Helpers reales copiados de auth.js
function renderTimeFields(prefix, value = '', required = false) {
    let h = '', m = '', s = '';
    if (value) {
        const parts = String(value).split(':');
        if (parts.length === 3) { h = parts[0]; m = parts[1]; s = parts[2]; }
        else if (parts.length === 2) { m = parts[0]; s = parts[1]; }
    }
    const norm = v => (v || '').replace(/\D/g, '').slice(0, 2);
    h = norm(h); m = norm(m); s = norm(s);
    return { prefix, h, m, s, required };
}

function onTimeFieldInput(input, nextId) {
    input.value = input.value.replace(/\D/g, '');
    if (input.value.length >= 2 && nextId) {
        const next = document.getElementById(nextId);
        if (next) { next.focus(); next.select(); }
    }
}

function onTimeFieldKey(e, prevId) {
    if (e.key === 'Backspace' && e.target.value === '' && prevId) {
        e.preventDefault();
        const prev = document.getElementById(prevId);
        if (prev) { prev.focus(); prev.setSelectionRange(prev.value.length, prev.value.length); }
    }
}

function readTimeFields(prefix) {
    const pad = v => (v || '').padStart(2, '0').slice(0, 2);
    const h = pad(document.getElementById(prefix + 'H')?.value);
    const m = pad(document.getElementById(prefix + 'M')?.value);
    const s = pad(document.getElementById(prefix + 'S')?.value);
    if (h === '00' && m === '00' && s === '00') return '';
    return `${h}:${m}:${s}`;
}

// === Test runner ===
let pass = 0, fail = 0;
function test(name, fn) {
    const before = fail;
    try { fn(); if (fail === before) { pass++; console.log('  PASS ' + name); } }
    catch (e) { fail++; console.log('  FAIL ' + name + ' → ' + e.message); }
}
function expectEq(actual, expected) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        fail++; throw new Error(`expected ${JSON.stringify(expected)} got ${JSON.stringify(actual)}`);
    }
}

function setupInputs(prefix) {
    _byId[prefix + 'H'] = new FakeInput(prefix + 'H');
    _byId[prefix + 'M'] = new FakeInput(prefix + 'M');
    _byId[prefix + 'S'] = new FakeInput(prefix + 'S');
}
function reset() {
    Object.keys(_byId).forEach(k => delete _byId[k]);
    lastFocused = null;
}

console.log('\n=== renderTimeFields parsing ===');
test('value="" → h=m=s=""', () => {
    const r = renderTimeFields('train', '');
    expectEq([r.h, r.m, r.s], ['', '', '']);
});
test('value="01:23:45" → h=01, m=23, s=45', () => {
    const r = renderTimeFields('train', '01:23:45');
    expectEq([r.h, r.m, r.s], ['01', '23', '45']);
});
test('value="52:30" (MM:SS) → h="", m=52, s=30', () => {
    const r = renderTimeFields('train', '52:30');
    expectEq([r.h, r.m, r.s], ['', '52', '30']);
});
test('value con basura "1a:2b:3c" → solo dígitos', () => {
    const r = renderTimeFields('train', '1a:2b:3c');
    expectEq([r.h, r.m, r.s], ['1', '2', '3']);
});
test('value largo "100:200:300" → truncado a 2 dígitos', () => {
    const r = renderTimeFields('train', '100:200:300');
    expectEq([r.h, r.m, r.s], ['10', '20', '30']);
});

console.log('\n=== readTimeFields output ===');
test('todos vacíos → ""', () => {
    reset(); setupInputs('train');
    expectEq(readTimeFields('train'), '');
});
test('solo segundos → "00:00:45"', () => {
    reset(); setupInputs('train');
    _byId['trainS'].value = '45';
    expectEq(readTimeFields('train'), '00:00:45');
});
test('minutos y segundos → "00:52:30"', () => {
    reset(); setupInputs('train');
    _byId['trainM'].value = '52';
    _byId['trainS'].value = '30';
    expectEq(readTimeFields('train'), '00:52:30');
});
test('h, m, s → "01:23:45"', () => {
    reset(); setupInputs('train');
    _byId['trainH'].value = '1';
    _byId['trainM'].value = '23';
    _byId['trainS'].value = '45';
    expectEq(readTimeFields('train'), '01:23:45');
});
test('prefix dinámico funciona (reviewTime_abc)', () => {
    reset(); setupInputs('reviewTime_abc');
    _byId['reviewTime_abcM'].value = '10';
    _byId['reviewTime_abcS'].value = '5';
    expectEq(readTimeFields('reviewTime_abc'), '00:10:05');
});

console.log('\n=== onTimeFieldInput auto-jump ===');
test('escribir 2 dígitos en H salta a M', () => {
    reset(); setupInputs('train');
    const inp = _byId['trainH'];
    inp.value = '01';
    onTimeFieldInput(inp, 'trainM');
    expectEq(lastFocused, 'trainM');
});
test('escribir 1 dígito en H NO salta', () => {
    reset(); setupInputs('train');
    const inp = _byId['trainH'];
    inp.value = '0';
    onTimeFieldInput(inp, 'trainM');
    expectEq(lastFocused, null);
});
test('input filtra no-dígitos', () => {
    reset(); setupInputs('train');
    const inp = _byId['trainH'];
    inp.value = '1a';
    onTimeFieldInput(inp, 'trainM');
    expectEq(inp.value, '1');
});
test('último input (S) no salta a ninguno', () => {
    reset(); setupInputs('train');
    const inp = _byId['trainS'];
    inp.value = '45';
    onTimeFieldInput(inp, null);
    expectEq(lastFocused, null);
});

console.log('\n=== onTimeFieldKey backspace ===');
test('Backspace en M vacío vuelve a H', () => {
    reset(); setupInputs('train');
    const inp = _byId['trainM'];
    inp.value = '';
    let prevented = false;
    onTimeFieldKey({ key: 'Backspace', target: inp, preventDefault(){ prevented = true; } }, 'trainH');
    expectEq(lastFocused, 'trainH');
    expectEq(prevented, true);
});
test('Backspace en M con valor NO salta', () => {
    reset(); setupInputs('train');
    const inp = _byId['trainM'];
    inp.value = '5';
    onTimeFieldKey({ key: 'Backspace', target: inp, preventDefault(){} }, 'trainH');
    expectEq(lastFocused, null);
});
test('Otra tecla no afecta', () => {
    reset(); setupInputs('train');
    const inp = _byId['trainM'];
    inp.value = '';
    onTimeFieldKey({ key: 'a', target: inp, preventDefault(){} }, 'trainH');
    expectEq(lastFocused, null);
});

console.log(`\nPASSED: ${pass}   FAILED: ${fail}`);
process.exit(fail > 0 ? 1 : 0);
