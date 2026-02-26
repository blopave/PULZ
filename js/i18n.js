/**
 * PULZ — Internationalization (i18n)
 * Supports: ES (Spanish), EN (English), PT (Portuguese)
 */

const T = {
    es: {
        tag: "Sudamérica 2026",
        heroLbl: "110+ carreras · 6 países",
        heroH1: "Encontrá tu",
        heroH2: "carrera.",
        heroSub: "Todas las carreras de running y trail de Sudamérica en un solo lugar.",
        selC: "Elegí un país",
        back: "← Volver",
        races: "carreras",
        road: "Asfalto",
        trail: "Trail",
        all: "Todas",
        type: "Tipo",
        dist: "Distancia",
        month: "Mes",
        iconic: "Icónica",
        more: "Ver más →",
        soon: "Próximamente",
        noT: "Sin carreras en este filtro",
        noH: "Probá con otro mes o distancia",
        statR: "Carreras",
        statA: "Asfalto",
        statT: "Trail",
        statI: "Icónicas",
        ftxt: "Carreras de running Sudamérica",
        cR: "carreras"
    },
    en: {
        tag: "South America 2026",
        heroLbl: "110+ races · 6 countries",
        heroH1: "Find your",
        heroH2: "race.",
        heroSub: "All running and trail races in South America in one place.",
        selC: "Choose a country",
        back: "← Back",
        races: "races",
        road: "Road",
        trail: "Trail",
        all: "All",
        type: "Type",
        dist: "Distance",
        month: "Month",
        iconic: "Iconic",
        more: "See more →",
        soon: "Coming soon",
        noT: "No races match this filter",
        noH: "Try another month or distance",
        statR: "Races",
        statA: "Road",
        statT: "Trail",
        statI: "Iconic",
        ftxt: "Running races South America",
        cR: "races"
    },
    pt: {
        tag: "América do Sul 2026",
        heroLbl: "110+ corridas · 6 países",
        heroH1: "Encontre sua",
        heroH2: "corrida.",
        heroSub: "Todas as corridas de running e trail da América do Sul em um só lugar.",
        selC: "Escolha um país",
        back: "← Voltar",
        races: "corridas",
        road: "Asfalto",
        trail: "Trail",
        all: "Todas",
        type: "Tipo",
        dist: "Distância",
        month: "Mês",
        iconic: "Icônica",
        more: "Ver mais →",
        soon: "Em breve",
        noT: "Sem corridas neste filtro",
        noH: "Tente outro mês ou distância",
        statR: "Corridas",
        statA: "Asfalto",
        statT: "Trail",
        statI: "Icônicas",
        ftxt: "Corridas de running América do Sul",
        cR: "corridas"
    }
};

const MN = {
    es: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'],
    en: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
    pt: ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
};

let lang = 'es';

function setLang(l) {
    lang = l;
    document.querySelectorAll('.lang-btn').forEach(b =>
        b.classList.toggle('active', b.textContent === l.toUpperCase())
    );
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const k = el.dataset.i18n;
        if (T[l][k]) el.textContent = T[l][k];
    });
    const active = document.querySelector('.cp.active');
    if (active) {
        const id = active.id.replace('p-', '');
        loadPage(id);
    }
    buildDD();
}
