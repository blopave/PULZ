/**
 * PULZ — Application Logic v3.0
 * Handles: splash parallax, particles, navigation, filtering, rendering
 */
/* ============================================
   APP
   ============================================ */
let activeCountry=null;
let showPast=false;
const F={}; // Active filters per country

/* ============================================
   THEME TOGGLE — Dark / Light
   ============================================ */
function applyThemeMeta(theme){
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.content=theme==='light'?'#F5F3EF':'#0A0A0C';
}
(function(){
    const saved=getLS('pulz-theme');
    const theme=saved||(window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark');
    if(theme==='light')document.documentElement.setAttribute('data-theme','light');
    applyThemeMeta(theme);
})();

function toggleTheme(){
    const html=document.documentElement;
    const isLight=html.getAttribute('data-theme')==='light';
    const newTheme=isLight?'dark':'light';
    if(newTheme==='light')html.setAttribute('data-theme','light');
    else html.removeAttribute('data-theme');
    setLS('pulz-theme',newTheme);
    applyThemeMeta(newTheme);
    track('toggle_theme',{theme:newTheme});
}

/* HTML escape — prevents XSS in user/race content */
function esc(s){if(s==null||s==='')return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}

/* Sanitize URL — only allow http/https */
function safeUrl(u){if(!u)return'';try{const url=new URL(u);return['http:','https:'].includes(url.protocol)?url.href:'';}catch{return'';}}

/* Debounce helper */
function debounce(fn,ms){let t;return function(...a){clearTimeout(t);t=setTimeout(()=>fn.apply(this,a),ms);}}

/* Analytics helper */
function track(event,params){if(typeof gtag==='function')gtag('event',event,params);}

/* Cookie consent */
function handleCookieConsent(accepted){
    setLS('pulz-cookies',accepted?'accepted':'rejected');
    const b=document.getElementById('cookieBanner');
    if(b)b.classList.remove('visible');
    if(accepted&&typeof loadGA==='function')loadGA();
}
(function(){
    if(!getLS('pulz-cookies')){
        setTimeout(()=>{const b=document.getElementById('cookieBanner');if(b)b.classList.add('visible');},1500);
    }
})();

/* Slug helper for URLs */
function slugify(text){
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}
/* Strip diacritics for search */
function norm(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
/* Locale for date formatting */
function getLocale(){return lang==='pt'?'pt-BR':lang==='en'?'en-US':'es-AR';}

function getMaxDist(c){let m=0;c.forEach(x=>{const n=parseFloat(x);if(!isNaN(n))m=Math.max(m,n);if(x.toLowerCase().includes('ultra'))m=Math.max(m,100)});return m}
function distCat(c){const m=getMaxDist(c);if(m>42.195)return'ultra';if(m>=42)return'42k';if(m>=21)return'21k';if(m>0)return'10k';return c.join(' ').toLowerCase().includes('ultra')?'ultra':'10k'}
function tagCls(c){const n=parseFloat(c),l=c.toLowerCase();if(l.includes('ultra')||n>50)return'tag-u';if(l.includes('trail'))return'tag-t';if(l.includes('42')||n===42)return'tag-f';if(l.includes('21')||(n>=21&&n<42))return'tag-h';return'tag-s'}

/* Particles — skip on mobile for performance */
(function(){
    if(window.innerWidth<=768)return;
    const el=document.getElementById('particles');
    if(!el)return;
    for(let i=0;i<20;i++){
        const p=document.createElement('div');
        p.className='particle';
        p.style.left=Math.random()*100+'%';
        p.style.animationDuration=(8+Math.random()*12)+'s';
        p.style.animationDelay=(Math.random()*10)+'s';
        p.style.width=p.style.height=(1+Math.random()*2)+'px';
        p.style.opacity=0;
        el.appendChild(p);
    }
})();

/* Card mouse glow (throttled via rAF) */
let glowRAF=0;
document.addEventListener('mousemove',e=>{
    if(glowRAF)return;
    glowRAF=requestAnimationFrame(()=>{
        document.querySelectorAll('.race-card,.benefit-card').forEach(c=>{
            const r=c.getBoundingClientRect();
            c.style.setProperty('--mx',(e.clientX-r.left)+'px');
            c.style.setProperty('--my',(e.clientY-r.top)+'px');
        });
        glowRAF=0;
    });
});

/* Dropdown */
/* Today at midnight for filtering past races */
function getToday(){const d=new Date();d.setHours(0,0,0,0);return d;}

function futureRaces(arr){return arr.filter(r=>new Date(r.d+'T23:59:59')>=getToday());}

function buildDD(){
    const t=T[lang];
    let totalRaces=0;
    countries.forEach(c=>{totalRaces+=getVisibleRaces(R[c.id]||[]).length;});
    let html=`<div class="co co-all" onclick="selC('all')"><span class="co-flag">ALL</span><span class="co-name">${t.allCountries||'Todos los países'}</span><span class="co-count">${totalRaces} ${t.cR}</span></div>`;
    html+=countries.map(c=>{
        const cnt=getVisibleRaces(R[c.id]||[]).length;
        return`<div class="co" onclick="selC('${esc(c.id)}')"><span class="co-flag">${esc(c.code)}</span><span class="co-name">${esc(c.name)}</span><span class="co-count">${cnt} ${t.cR}</span></div>`;
    }).join('');
    document.getElementById('dd').innerHTML=html;
}

function toggleDD(){
    const dd=document.getElementById('dd');
    const tr=document.getElementById('csTrigger');
    dd.classList.toggle('open');
    tr.classList.toggle('open');
    tr.setAttribute('aria-expanded',dd.classList.contains('open'));
}

/* Select country */
let buildTO;
function selC(id){
    document.getElementById('dd').classList.remove('open');
    document.getElementById('csTrigger').classList.remove('open');

    // Toggle: clicking same country deselects
    if(activeCountry===id){
        goHome();
        return;
    }

    const t=T[lang];
    if(id==='all'){
        document.getElementById('csTrigger').querySelector('.cs-label').textContent=t.allCountries||'Todos los países';
        document.getElementById('csTrigger').querySelector('.cs-icon').textContent='ALL';
    } else {
        const c=countries.find(x=>x.id===id);
        if(!c)return;
        document.getElementById('csTrigger').querySelector('.cs-label').textContent=c.name;
        document.getElementById('csTrigger').querySelector('.cs-icon').textContent=c.code;
    }
    activeCountry=id;
    track('select_country',{country:id});
    searchQuery='';

    // Auto-dismiss onboarding on country select
    const onb=document.getElementById('onboardingWelcome');
    if(onb){onb.style.opacity='0';onb.style.transition='opacity 0.2s';setTimeout(()=>onb.remove(),200);setLS('pulz-onboarded','1');}
    F[id]={month:'all',type:'all',dist:'all',dateFrom:'',dateTo:''};

    // Show clear button in selector
    updateSelectorClear();

    // Show skeleton while building content
    const cc=document.getElementById('countryContent');
    cc.innerHTML=buildSkeleton();

    cc.classList.add('active');
    document.getElementById('mainHeader').classList.add('visible');
    setTimeout(()=>cc.scrollIntoView({behavior:'smooth',block:'start'}),80);

    // Build real content after brief skeleton
    clearTimeout(buildTO);
    buildTO=setTimeout(()=>buildCountryContent(id),300);
}

function clearCountry(){
    activeCountry=null;
    searchQuery='';
    _activeTab='races';
    clearTimeout(buildTO);
    document.getElementById('countryContent').classList.remove('active');
    document.getElementById('countryContent').innerHTML='';
    const tr=document.getElementById('csTrigger');
    tr.querySelector('.cs-label').textContent=T[lang].selC;
    tr.querySelector('.cs-icon').textContent='↓';
    updateSelectorClear();
    if(location.hash)history.replaceState(null,'',location.pathname);
}

function updateSelectorClear(){
    const trigger=document.getElementById('csTrigger');
    let clearBtn=trigger.querySelector('.cs-clear');
    if(activeCountry){
        if(!clearBtn){
            clearBtn=document.createElement('button');
            clearBtn.className='cs-clear';
            clearBtn.setAttribute('aria-label',T[lang].clearSelection||'Limpiar selección');
            clearBtn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';
            clearBtn.onclick=function(e){e.stopPropagation();clearCountry()};
            trigger.appendChild(clearBtn);
        }
    } else {
        if(clearBtn) clearBtn.remove();
    }
}

function buildSkeleton(){
    let cards='';
    for(let i=0;i<6;i++){
        cards+=`<div class="skeleton-card"><div class="skeleton-line w40 h8"></div><div class="skeleton-line w80 h16"></div><div class="skeleton-line w60"></div><div class="skeleton-tags"><div class="skeleton-tag"></div><div class="skeleton-tag"></div><div class="skeleton-tag"></div></div></div>`;
    }
    return`<div style="padding:2rem 0"><div class="skeleton-grid">${cards}</div></div>`;
}

function getVisibleRaces(arr){return showPast?arr:futureRaces(arr);}

function getAllRaces(){
    const all=[];
    countries.forEach(c=>{
        const cRaces=R[c.id]||[];
        getVisibleRaces(cRaces).forEach(r=>{
            const idx=cRaces.indexOf(r);
            all.push({...r,_countryId:c.id,_countryCode:c.code,_countryName:c.name,_origIdx:idx});
        });
    });
    return all;
}

function togglePast(){
    showPast=!showPast;
    if(activeCountry)buildCountryContent(activeCountry);
    buildDD();
}

let _activeTab='races';

function buildCountryContent(id){
    const isAll=id==='all';
    const races=isAll?getAllRaces():getVisibleRaces(R[id]||[]);
    const c=isAll?null:countries.find(x=>x.id===id);
    const t=T[lang];
    const trail=races.filter(r=>r.t==='trail').length;
    const road=races.filter(r=>r.t==='asfalto').length;
    const iconic=races.filter(r=>r.i).length;
    const monthSet=new Set();
    races.forEach(r=>monthSet.add(new Date(r.d+'T00:00:00').getMonth()));
    const mn=MN[lang];

    let mH=`<button class="month-btn${F[id].month==='all'?' active':''}" onclick="fM('${id}','all')">ALL</button>`;
    mn.forEach((name,i)=>{const has=monthSet.has(i);mH+=`<button class="month-btn${!has?' disabled':''}${F[id].month===i?' active':''}" onclick="fM('${id}',${i})" ${has?'':'disabled'}>${name}</button>`});

    const tH=['all','asfalto','trail'].map(v=>`<button class="filter-btn${F[id].type===v?' active':''}" onclick="fT('${id}','${v}')">${v==='all'?t.all:v==='asfalto'?t.road:'Trail'}</button>`).join('');
    const dH=['all','10k','21k','42k','ultra'].map(v=>{const lb=v==='all'?t.all:v==='10k'?'≤10K':v==='21k'?'21K':v==='42k'?'42K':'Ultra';return`<button class="filter-btn${F[id].dist===v?' active':''}" onclick="fD('${id}','${v}')">${lb}</button>`}).join('');

    const titleName=isAll?(t.allCountries||'Todos los países'):esc(c.name);
    const pastToggleLabel=showPast?(t.hidePast||'Ocultar finalizadas'):(t.showPast||'Mostrar finalizadas');
    const pastToggleCls=showPast?' active':'';
    const racesTabLabel=t.tabRaces||'Carreras';
    const teamsTabLabel=t.tabTeams||'Running Teams';
    const orgsTabLabel=t.tabOrgs||'Organizadores';
    document.getElementById('countryContent').innerHTML=`
        <div class="page-hdr"><h2 class="page-title">${titleName}</h2></div>
        <div class="country-tabs" role="tablist">
            <button class="country-tab${_activeTab==='races'?' active':''}" role="tab" aria-selected="${_activeTab==='races'}" onclick="switchTab('${id}','races')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                ${racesTabLabel}
                <span class="country-tab-count">${races.length}</span>
            </button>
            <button class="country-tab${_activeTab==='teams'?' active':''}" role="tab" aria-selected="${_activeTab==='teams'}" onclick="switchTab('${id}','teams')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                ${teamsTabLabel}
                <span class="country-tab-count" id="teamsTabCount">…</span>
            </button>
            <button class="country-tab${_activeTab==='orgs'?' active':''}" role="tab" aria-selected="${_activeTab==='orgs'}" onclick="switchTab('${id}','orgs')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                ${orgsTabLabel}
                <span class="country-tab-count" id="orgsTabCount">…</span>
            </button>
        </div>
        <div id="tabRaces" class="tab-panel" role="tabpanel" style="display:${_activeTab==='races'?'block':'none'}">
            <div class="stats-bar">
                <div class="stat-item"><div class="stat-val">${races.length}</div><div class="stat-lbl">${t.statR}</div></div>
                <div class="stat-item"><div class="stat-val">${road}</div><div class="stat-lbl">${t.statA}</div></div>
                <div class="stat-item"><div class="stat-val">${trail}</div><div class="stat-lbl">${t.statT}</div></div>
                <div class="stat-item"><div class="stat-val">${iconic}</div><div class="stat-lbl">${t.statI}</div></div>
            </div>
            <div class="search-bar">
                <div class="search-bar-wrap">
                    <svg class="search-bar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" class="search-bar-input" id="countrySearch" placeholder="${t.sPh}" aria-label="${t.sPh}" autocomplete="off" spellcheck="false" oninput="onSearchInput('${id}',this.value)">
                    <button class="search-bar-clear" onclick="clearSearch('${id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
                    <span class="search-bar-count" id="searchCount"></span>
                    <span class="search-bar-kbd">${navigator.platform&&navigator.platform.indexOf('Mac')>-1?'⌘':'Ctrl+'}K</span>
                </div>
            </div>
            <div class="filters-section">
                <div class="filter-row"><div class="filter-group"><div class="filter-label">${t.month}</div><div class="filter-set">${mH}</div></div></div>
                <div class="filter-row">
                    <div class="filter-group"><div class="filter-label">${t.type}</div><div class="filter-set">${tH}</div></div>
                    <div class="filter-group"><div class="filter-label">${t.dist}</div><div class="filter-set">${dH}</div></div>
                    <div class="filter-group"><div class="filter-label">${t.dateRange||'Rango de fecha'}</div><div class="filter-set date-range-set"><input type="date" class="date-range-input" id="dateFrom" aria-label="${t.dateFrom||'Desde'}" value="${F[id].dateFrom||''}" onchange="fDate('${id}')"><span class="date-range-sep">→</span><input type="date" class="date-range-input" id="dateTo" aria-label="${t.dateTo||'Hasta'}" value="${F[id].dateTo||''}" onchange="fDate('${id}')"></div></div>
                </div>
                <div class="filter-row filter-row-toggle">
                    <button class="past-toggle${pastToggleCls}" onclick="togglePast()" aria-pressed="${showPast}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        ${pastToggleLabel}
                    </button>
                </div>
            </div>
            <div id="race-list"></div>
        </div>
        <div id="tabTeams" class="tab-panel" role="tabpanel" style="display:${_activeTab==='teams'?'block':'none'}">
            <div id="teamsDirectory"></div>
        </div>
        <div id="tabOrgs" class="tab-panel" role="tabpanel" style="display:${_activeTab==='orgs'?'block':'none'}">
            <div id="orgsDirectory"></div>
        </div>
    `;
    renderRaces(id);
    loadTeamsForCountry(id);
    loadOrgsForCountry(id);
}

function switchTab(countryId,tab){
    _activeTab=tab;
    const panels={races:'tabRaces',teams:'tabTeams',orgs:'tabOrgs'};
    const tabKeys=['races','teams','orgs'];
    tabKeys.forEach(k=>{
        const el=document.getElementById(panels[k]);
        if(el)el.style.display=k===tab?'block':'none';
    });
    document.querySelectorAll('.country-tab').forEach((btn,i)=>{
        const isActive=tabKeys[i]===tab;
        btn.classList.toggle('active',isActive);
        btn.setAttribute('aria-selected',isActive);
    });
    if(typeof track==='function')track('switch_tab',{tab:tab,country:countryId});
}

function renderRaces(id){
    const isAll=id==='all';
    const races=isAll?getAllRaces():getVisibleRaces(R[id]||[]);
    if(!F[id])F[id]={month:'all',type:'all',dist:'all',dateFrom:'',dateTo:''};
    const{month,type,dist,dateFrom,dateTo}=F[id];
    const dfFrom=dateFrom?new Date(dateFrom+'T00:00:00'):null;
    const dfTo=dateTo?new Date(dateTo+'T23:59:59'):null;
    const sorted=[...races].sort((a,b)=>new Date(a.d)-new Date(b.d));
    const locale=getLocale();
    const t=T[lang];
    let vis=0;
    let h='<div class="race-grid">';

    // Search tokens
    const tokens=searchQuery?norm(searchQuery).split(/\s+/).filter(Boolean):[];

    sorted.forEach(r=>{
        const dt=new Date(r.d+'T00:00:00'),mo=dt.getMonth(),dc=distCat(r.c);
        const matchMonth=(dfFrom||dfTo)?true:(month==='all'||mo===month);
        const matchType=type==='all'||r.t===type;
        const matchDist=dist==='all'||dist===dc;
        const matchDateRange=(!dfFrom||dt>=dfFrom)&&(!dfTo||dt<=dfTo);

        // Search match (include country name in haystack for "all" mode)
        let matchSearch=true;
        if(tokens.length){
            const extra=isAll?(r._countryName||''):'';
            const haystack=norm(r.n+' '+r.l+' '+r.c.join(' ')+' '+r.t+' '+extra);
            matchSearch=tokens.every(tok=>haystack.includes(tok));
        }

        const ok=matchMonth&&matchType&&matchDist&&matchDateRange&&matchSearch;
        if(ok)vis++;
        const isPastRace=dt<getToday();
        const ds=dt.toLocaleDateString(locale,{day:'numeric',month:'short',year:'numeric'}).toUpperCase();
        const tgs=r.c.map(c=>`<span class="tag ${tagCls(c)}">${esc(c)}</span>`).join('');
        const ic=r.i?' iconic':'';
        const pastCls=isPastRace?' race-past':'';
        const pastBadge=isPastRace?`<div class="past-badge">${t.pastBadge||'Finalizada'}</div>`:'';
        const bg=r.i?`<div class="iconic-badge">★ ${t.iconic}</div>`:'';
        const cardCountryId=isAll?r._countryId:id;
        const riOrig=isAll?r._origIdx:(R[id]||[]).indexOf(r);
        const favId=r._id||cardCountryId+'_'+riOrig;
        const isFav=typeof isFavorite==='function'&&isFavorite(favId);
        const favCls=isFav?' fav-active':'';
        const favBtn=`<button class="fav-btn${favCls}" onclick="event.stopPropagation();toggleFav('${favId}')" title="♥"><svg viewBox="0 0 24 24" fill="${isFav?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></button>`;
        const statusCls=r.s==='c'?'status-confirmed':'status-estimated';
        const statusTxt=r.s==='c'?(t.confirmed||'Confirmada'):(t.estimated||'Fecha estimada');
        const statusBadge=`<span class="race-status ${statusCls}">${statusTxt}</span>`;
        const src=r.source||'pulz';
        const srcCls=src==='organizer'?'source-organizer':src==='community'?'source-community':'source-pulz';
        const srcTxt=src==='organizer'?(t.srcOrganizer||'Oficial'):src==='community'?(t.srcCommunity||'Comunidad'):(t.srcPulz||'PULZ');
        const srcBadge=`<span class="race-source ${srcCls}">${srcTxt}</span>`;
        const countryBadge=isAll?`<span class="global-country-badge">${r._countryCode} · ${esc(r._countryName)}</span>`:'';
        const fc=r._id?getFavCount(r._id):0;
        const fcHTML=fc>0?`<div class="race-fav-count"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>${fc}</div>`:'';
        h+=`<div class="race-card card-reveal${ic}${pastCls}" role="button" tabindex="0" onclick="openDrawer('${esc(cardCountryId)}',${riOrig})" onkeydown="if(event.key==='Enter')openDrawer('${esc(cardCountryId)}',${riOrig})" style="display:${ok?'block':'none'}" data-reveal-delay="${0.04*Math.min(vis,12)}">${bg}${pastBadge}${favBtn}${fcHTML}<div class="race-date">${ds} ${statusBadge} ${srcBadge} ${countryBadge}</div><h3 class="race-name">${esc(r.n)}</h3><p class="race-loc">${esc(r.l)}</p><div class="race-tags">${tgs}</div></div>`;
    });
    h+='</div>';
    if(!vis)h+=`<div class="no-results"><svg class="no-results-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="28" cy="28" r="18"/><line x1="40.5" y1="40.5" x2="56" y2="56" stroke-width="2.5" stroke-linecap="round"/><path d="M20 28h16" stroke-linecap="round"/><circle cx="28" cy="28" r="24" stroke-dasharray="4 6" opacity="0.2"/></svg><div class="no-results-text">${t.noT}</div><div class="no-results-hint">${t.noH}</div><button class="no-results-cta" onclick="fM('${id}','all');fT('${id}','all');fD('${id}','all');clearSearch('${id}');buildCountryContent('${id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 109-9"/><polyline points="3 3 3 7 7 7"/></svg>${t.noReset||'Limpiar filtros'}</button></div>`;
    // Empty favorites nudge for logged-in users
    let favNudge='';
    if(currentUser&&vis>0&&typeof favorites!=='undefined'&&favorites.length===0&&!getLS('pulz-fav-nudge-dismissed')){
        const tt=T[lang];
        favNudge=`<div class="empty-favs" id="favNudge">
            <div class="empty-favs-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></div>
            <div class="empty-favs-title">${tt.emptyFavTitle||'Todavía no guardaste carreras'}</div>
            <div class="empty-favs-hint">${tt.emptyFavHint||'Tocá el corazón en cualquier carrera para guardarla y armar tu calendario personal.'}</div>
            <button class="empty-favs-cta" onclick="this.closest('.empty-favs').remove();setLS('pulz-fav-nudge-dismissed','1')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                ${tt.emptyFavDismiss||'Entendido'}
            </button>
        </div>`;
    }

    document.getElementById('race-list').innerHTML=favNudge+h;

    // Scroll-triggered reveal for race cards
    observeRaceCards();

    // Update search count
    const countEl=document.getElementById('searchCount');
    if(countEl){
        if(searchQuery){
            const resWord=vis===1?t.sRes:t.sResPl;
            countEl.textContent=vis+' '+resWord;
        } else {
            countEl.textContent='';
        }
    }
}

function fM(id,m){F[id].month=m;F[id].dateFrom='';F[id].dateTo='';buildCountryContent(id)}
function fT(id,t){F[id].type=t;buildCountryContent(id)}
function fD(id,d){F[id].dist=d;buildCountryContent(id)}
function fDate(id){
    const from=document.getElementById('dateFrom')?.value||'';
    const to=document.getElementById('dateTo')?.value||'';
    F[id].dateFrom=from;F[id].dateTo=to;
    if(from||to)F[id].month='all';
    buildCountryContent(id);
}

function goHome(){
    clearCountry();
    window.scrollTo({top:0,behavior:'instant'});
}

/* ============================================
   RACE DRAWER
   ============================================ */
function openDrawer(countryId, raceIdx){
    if(!R[countryId])return;
    const r=R[countryId][raceIdx];
    if(!r)return;
    track('view_race',{race_name:r.n,country:countryId});
    const t=T[lang];
    const c=countries.find(x=>x.id===countryId)||{name:countryId,code:''};
    const locale=getLocale();
    const dt=new Date(r.d+'T00:00:00');
    const dateStr=dt.toLocaleDateString(locale,{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    const dateCap=dateStr.charAt(0).toUpperCase()+dateStr.slice(1);

    // Countdown
    const now=new Date();
    const diff=dt-now;
    const days=Math.ceil(diff/(1000*60*60*24));
    const isPast=days<0;
    let countdownHTML;
    if(isPast){
        countdownHTML=`<div class="drawer-countdown past"><div class="countdown-dot"></div><span class="countdown-text">${t.dPast}</span></div>`;
    } else if(days===0){
        const todayTxt=lang==='en'?'Today!':lang==='pt'?'Hoje!':'¡Hoy!';
        countdownHTML=`<div class="drawer-countdown"><div class="countdown-dot"></div><span class="countdown-text">${todayTxt}</span></div>`;
    } else {
        const prefix=t.dFor?t.dFor+' ':'';
        countdownHTML=`<div class="drawer-countdown"><div class="countdown-dot"></div><span class="countdown-text">${prefix}${days} ${t.dDays}</span></div>`;
    }

    // Iconic
    const iconicHTML=r.i?`<div class="drawer-iconic">★ ${t.iconic}</div>`:'';

    // Type
    const typeLabel=r.t==='trail'?'Trail':t.road;
    const typeCls=r.t==='trail'?'trail':'road';

    // Tags
    const tagsHTML=r.c.map(x=>`<span class="tag ${tagCls(x)}">${esc(x)}</span>`).join('');

    // Description
    const descHTML=r.desc?`<div class="drawer-desc">${esc(r.desc)}</div>`:'';

    // Website row
    let webVal;
    const safeW=safeUrl(r.w);
    if(safeW){
        const domain=safeW.replace(/^https?:\/\/(www\.)?/,'').split('/')[0];
        webVal=`<a href="${esc(safeW)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">${esc(domain)} ↗</a>`;
    } else {
        webVal=`<span class="muted">${t.dNoWeb}</span>`;
    }

    // Price row (if available)
    const priceRow=r.price?`
        <div class="drawer-row">
            <div class="drawer-row-icon"><svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div>
            <div class="drawer-row-content">
                <div class="drawer-row-label">${t.dInsc}</div>
                <div class="drawer-row-value">${esc(r.price)}</div>
            </div>
        </div>`:'';

    // Registration URL
    const regUrl=r.registration_url?safeUrl(r.registration_url):'';

    // CTA
    let ctaHTML;
    if(regUrl){
        ctaHTML=`<div class="drawer-cta"><a href="${esc(regUrl)}" target="_blank" rel="noopener noreferrer" class="drawer-cta-primary" onclick="event.stopPropagation();if(typeof trackRaceClick==='function')trackRaceClick('${esc(r._id||'')}')"><svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>${t.dInsc||'Inscripción'}</a></div>`;
        if(safeW&&safeW!==regUrl){
            ctaHTML+=`<div class="drawer-cta" style="margin-top:0.3rem"><a href="${esc(safeW)}" target="_blank" rel="noopener noreferrer" class="drawer-cta-secondary" onclick="event.stopPropagation()"><svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>${t.dWeb}</a></div>`;
        }
    } else if(safeW){
        ctaHTML=`<div class="drawer-cta"><a href="${esc(safeW)}" target="_blank" rel="noopener noreferrer" class="drawer-cta-primary" onclick="event.stopPropagation();if(typeof trackRaceClick==='function')trackRaceClick('${esc(r._id||'')}')"><svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>${t.dWeb}</a></div>`;
    } else {
        ctaHTML=`<div class="drawer-cta"><span class="drawer-cta-disabled">${t.dNoWeb}</span></div>`;
    }

    // Favorite + Calendar + Share actions
    const favId=r._id||countryId+'_'+raceIdx;
    const isFav=typeof isFavorite==='function'&&isFavorite(favId);
    const favActiveCls=isFav?' active':'';
    const favFill=isFav?'currentColor':'none';
    const shareText=encodeURIComponent(`${r.n} — ${r.l}\n${dateCap}\n${r.c.join(' · ')}`);
    const shareUrl=r.w?encodeURIComponent(r.w):'';
    const actionsHTML=`
        <div class="drawer-actions">
            <button class="drawer-action-btn${favActiveCls}" id="drawerFavBtn" onclick="toggleFav('${favId}')">
                <svg viewBox="0 0 24 24" fill="${favFill}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                <span>${isFav?(t.saved||'Guardada'):t.benefitFav}</span>
            </button>
            <button class="drawer-action-btn" onclick="addToCalendar('${countryId}',${raceIdx})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg>
                <span>${t.benefitCal}</span>
            </button>
            <button class="drawer-action-btn${typeof isAlertActive==='function'&&isAlertActive(favId)?' alert-active':''}" onclick="toggleAlert('${favId}')" id="drawerAlertBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                <span>${typeof isAlertActive==='function'&&isAlertActive(favId)?(t.alertActive||'Alerta activa'):(t.alertActivate||'Activar alerta')}</span>
            </button>
            <button class="drawer-action-btn" onclick="shareRace('${countryId}',${raceIdx})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                <span>${t.share||'Compartir'}</span>
            </button>
            ${currentProfile?.role==='team'?`<button class="drawer-action-btn${typeof isTeamRace==='function'&&isTeamRace(favId)?' team-going-active':''}" id="drawerTeamGoBtn" onclick="toggleTeamRace('${favId}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg><span>${typeof isTeamRace==='function'&&isTeamRace(favId)?(t.teamGoing||'Vamos'):(t.teamMarkGoing||'Vamos a esta carrera')}</span></button>`:''}
            ${isPast&&isFav?`<button class="drawer-action-btn${typeof isCompleted==='function'&&isCompleted(favId)?' completion-active':''}" id="drawerCompBtn" onclick="openCompletionDialog('${favId}',${JSON.stringify(r.c||[]).replace(/"/g,'&quot;')})"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span>${typeof isCompleted==='function'&&isCompleted(favId)?(t.completionDone||'Completada'):(t.completionMark||'Marcar completada')}</span></button>`:''}
        </div>
        <div class="share-options" id="shareOptions" style="display:none">
            <a class="share-opt" href="https://wa.me/?text=${shareText}${shareUrl?'%0A'+shareUrl:''}" target="_blank" onclick="event.stopPropagation()">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
            </a>
            <button class="share-opt" onclick="copyRaceInfo('${countryId}',${raceIdx})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                ${t.copyInfo||'Copiar info'}
            </button>
        </div>
    `;

    // Organizer badge (if race was published by an organizer)
    const orgId=r.organizer_id||null;
    const orgBadgeId='drawerOrgBadge_'+Date.now();

    document.getElementById('drawerBody').innerHTML=`
        ${countdownHTML}
        ${iconicHTML}
        <h2 class="drawer-title">${esc(r.n)}</h2>
        <div class="drawer-type ${typeCls}">${esc(typeLabel)}</div>
        <div class="drawer-tags">${tagsHTML}</div>
        ${descHTML}
        <div id="${orgBadgeId}"></div>
        <div class="drawer-info">
            <div class="drawer-row">
                <div class="drawer-row-icon"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
                <div class="drawer-row-content">
                    <div class="drawer-row-label">${t.dLoc}</div>
                    <div class="drawer-row-value">${esc(r.l)}<br><span style="font-size:0.68rem;color:var(--txt3);font-weight:400">${esc(c.name)}</span></div>
                </div>
            </div>
            <div class="drawer-row">
                <div class="drawer-row-icon"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                <div class="drawer-row-content">
                    <div class="drawer-row-label">${t.dDate}</div>
                    <div class="drawer-row-value">${dateCap}<br><span class="race-status ${r.s==='c'?'status-confirmed':'status-estimated'}" style="margin-top:0.3rem">${r.s==='c'?(t.confirmed||'Confirmada'):(t.estimated||'Fecha estimada')}</span></div>
                </div>
            </div>
            <div class="drawer-row">
                <div class="drawer-row-icon"><svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
                <div class="drawer-row-content">
                    <div class="drawer-row-label">${t.dDist}</div>
                    <div class="drawer-row-value">${r.c.map(x=>esc(x)).join(' · ')}</div>
                </div>
            </div>
            <div class="drawer-row">
                <div class="drawer-row-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                <div class="drawer-row-content">
                    <div class="drawer-row-label">${t.dWeb}</div>
                    <div class="drawer-row-value">${webVal}</div>
                </div>
            </div>
            ${priceRow}
        </div>
        ${isPast&&r.results_url?`<div class="drawer-results"><a href="${esc(safeUrl(r.results_url))}" target="_blank" rel="noopener noreferrer" class="drawer-results-btn" onclick="event.stopPropagation()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>${t.resultsBtn||'Ver resultados'}</a></div>`:''}
        ${ctaHTML}
        ${actionsHTML}
    `;

    // Favorites count in drawer
    const drawerFavCount=r._id?getFavCount(r._id):0;
    const drawerFavCountHTML=drawerFavCount>0?`<div class="drawer-fav-count"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg><span>${drawerFavCount} ${drawerFavCount===1?t.oneRunnerInterested:t.runnersInterested}</span></div>`:'';

    // Teams sections (loads async)
    const teamsGoingId='drawerTeamsGoing_'+Date.now();
    const teamsCityId='drawerTeamsCity_'+Date.now();

    // Reviews section (loads async)
    const reviewsContainerId='drawerReviews_'+Date.now();
    const reviewsSectionHTML=`<div class="drawer-reviews" id="${reviewsContainerId}"></div>`;

    document.getElementById('drawerBody').innerHTML+=`
        ${drawerFavCountHTML}
        <div id="${teamsGoingId}"></div>
        <div id="${teamsCityId}"></div>
        ${reviewsSectionHTML}
    `;

    // Load organizer notifications for this race (async)
    if(r._id&&typeof loadRaceNotifications==='function'){
        const notifContainerId='drawerNotifs_'+Date.now();
        const orgBadgeEl=document.getElementById(orgBadgeId);
        if(orgBadgeEl){
            const notifDiv=document.createElement('div');
            notifDiv.id=notifContainerId;
            orgBadgeEl.parentNode.insertBefore(notifDiv,orgBadgeEl.nextSibling);
        }
        loadRaceNotifications(r._id).then(notifs=>{
            if(!notifs||!notifs.length)return;
            const container=document.getElementById(notifContainerId);
            if(!container)return;
            const locale=getLocale();
            let html='';
            notifs.forEach(n=>{
                const dt=new Date(n.created_at);
                const dateStr=dt.toLocaleDateString(locale,{day:'numeric',month:'short'});
                html+=`<div class="drawer-org-notice"><div class="drawer-org-notice-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg></div><div class="drawer-org-notice-body"><div class="drawer-org-notice-text">${esc(n.message)}</div><div class="drawer-org-notice-date">${dateStr}</div></div></div>`;
            });
            container.innerHTML=html;
        });
    }

    // Load organizer badge (async)
    loadOrgBadge(orgId, orgBadgeId);
    // Load teams going to this race (async)
    loadTeamsGoingToRace(r._id||null, teamsGoingId);
    // Load teams in the race's city (async)
    loadTeamsInRaceCity(r.l, teamsCityId);

    // Load reviews async
    loadAndRenderReviews(r._id||null, countryId, raceIdx, reviewsContainerId, isPast);

    // Contextual nudge for first-time non-logged visitors
    if(!currentUser&&!getLS('pulz-nudge-seen')){
        setLS('pulz-nudge-seen','1');
        const t=T[lang];
        const nudge=document.createElement('div');
        nudge.className='drawer-nudge';
        nudge.innerHTML=`<div class="drawer-nudge-content"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg><span>${t.nudgeText||'Guardá esta carrera, sumala a tu calendario y recibí alertas'}</span></div><button class="drawer-nudge-cta" onclick="closeDrawer();openAuthModal('signup')">${t.nudgeCta||'Crear cuenta gratis'}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button><button class="drawer-nudge-close" onclick="this.closest('.drawer-nudge').remove()" aria-label="Cerrar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M18 6L6 18M6 6l12 12"/></svg></button>`;
        const drawerBody=document.getElementById('drawerBody');
        drawerBody.insertBefore(nudge,drawerBody.firstChild);
    }

    document.getElementById('drawerOverlay').classList.add('open');
    document.getElementById('drawer').classList.add('open');
    document.getElementById('drawer').scrollTop=0;
    document.getElementById('drawerBody').scrollTop=0;
    document.body.style.overflow='hidden';

    // Push URL for sharing
    const raceSlug=slugify(r.n)+'-'+raceIdx;
    history.pushState({country:countryId,race:raceIdx},'',`#${countryId}/${raceSlug}`);
}

function closeDrawer(fromPopstate){
    document.getElementById('drawerOverlay').classList.remove('open');
    document.getElementById('drawer').classList.remove('open');
    document.body.style.overflow='';
    selectedRating=0;
    if(!fromPopstate&&location.hash)history.replaceState(null,'',location.pathname);
}

function openCompletionDialog(raceId,raceCategories){
    if(!currentUser){openAuthModal('signup');return;}
    const t=T[lang];
    if(typeof isCompleted==='function'&&isCompleted(raceId)){
        // If already completed, open enhanced editor
        if(typeof openEnhancedCompletion==='function'){
            openEnhancedCompletion(raceId,raceCategories||[]);
            return;
        }
        toggleCompletion(raceId,null);
        const btn=document.getElementById('drawerCompBtn');
        if(btn){btn.classList.remove('completion-active');const s=btn.querySelector('span');if(s)s.textContent=t.completionMark||'Marcar completada';}
        return;
    }
    // Open enhanced completion form for new completions
    if(typeof openEnhancedCompletion==='function'){
        openEnhancedCompletion(raceId,raceCategories||[]);
        return;
    }
    const btn=document.getElementById('drawerCompBtn');
    if(!btn)return;
    const existing=document.getElementById('completionTimeInput');
    if(existing){existing.remove();return;}
    const inputHTML=`<div id="completionTimeInput" class="completion-input-row">
        <input type="text" class="auth-input" id="compTimeVal" placeholder="${t.completionTimePh||'Tu tiempo (ej: 1:45:30)'}" style="font-size:0.8rem">
        <button class="drawer-action-btn completion-active" onclick="confirmCompletion('${raceId}')" style="padding:0.4rem 0.8rem;font-size:0.75rem">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
    </div>`;
    btn.insertAdjacentHTML('afterend',inputHTML);
    document.getElementById('compTimeVal')?.focus();
}

function confirmCompletion(raceId){
    const timeVal=document.getElementById('compTimeVal')?.value?.trim()||'';
    toggleCompletion(raceId,timeVal);
    const btn=document.getElementById('drawerCompBtn');
    if(btn){btn.classList.add('completion-active');const s=btn.querySelector('span');if(s)s.textContent=T[lang].completionDone||'Completada';}
    const inputRow=document.getElementById('completionTimeInput');
    if(inputRow)inputRow.remove();
}

function shareRace(countryId, raceIdx){
    const opts=document.getElementById('shareOptions');
    if(opts) opts.style.display = opts.style.display==='none'?'flex':'none';
}

function copyRaceInfo(countryId, raceIdx){
    if(!R[countryId])return;
    const r=R[countryId][raceIdx];
    if(!r)return;
    const c=countries.find(x=>x.id===countryId);
    if(!c)return;
    const locale=getLocale();
    const dt=new Date(r.d+'T00:00:00');
    const dateStr=dt.toLocaleDateString(locale,{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    const t=T[lang];
    let text=`${r.n}\n${r.l}, ${c.name}\n${dateStr}\n${r.c.join(' · ')}`;
    if(r.w) text+=`\n${r.w}`;
    text+=`\n\n— PULZ · ${t.ftTagline||'La plataforma runner de Sudamérica'}`;
    (navigator.clipboard?navigator.clipboard.writeText(text):Promise.reject()).catch(()=>{const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);return Promise.resolve()}).then(()=>{
        const btn=document.querySelector('#shareOptions .share-opt:last-child');
        if(btn){
            const orig=btn.innerHTML;
            btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> '+(t.copied||'¡Copiado!');
            setTimeout(()=>{btn.innerHTML=orig},1500);
        }
    });
}

// Keyboard shortcuts: Escape to close, Cmd+K to search
document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
        const raceModal=document.getElementById('raceModal');
        const authModal=document.getElementById('authModal');
        if(raceModal&&raceModal.classList.contains('open')){if(typeof closeRaceModal==='function')closeRaceModal();}
        else if(authModal&&authModal.classList.contains('open')){if(typeof closeAuthModal==='function')closeAuthModal();}
        else{closeDrawer();}
    }
    if((e.metaKey||e.ctrlKey)&&e.key==='k'){
        e.preventDefault();
        const inp=document.getElementById('countrySearch');
        if(inp){inp.focus();inp.select()}
    }
});

/* ============================================
   INLINE SEARCH (within country)
   ============================================ */
let searchQuery='';

const debouncedRender=debounce(renderRaces,150);
function onSearchInput(id,val){
    searchQuery=val.trim().toLowerCase();
    const clearBtn=document.querySelector('#countryContent .search-bar-clear');
    if(clearBtn)clearBtn.classList.toggle('visible',searchQuery.length>0);
    debouncedRender(id);
}

function clearSearch(id){
    searchQuery='';
    const inp=document.getElementById('countrySearch');
    if(inp)inp.value='';
    const clearBtn=document.querySelector('#countryContent .search-bar-clear');
    if(clearBtn)clearBtn.classList.remove('visible');
    renderRaces(id);
    if(inp)inp.focus();
}


/* ============================================
   SCROLL-TRIGGERED RACE CARD REVEAL
   ============================================ */
let cardObserver;
function observeRaceCards(){
    if(cardObserver)cardObserver.disconnect();
    cardObserver=new IntersectionObserver((entries)=>{
        entries.forEach(e=>{
            if(e.isIntersecting){
                const delay=parseFloat(e.target.dataset.revealDelay)||0;
                e.target.style.transitionDelay=delay+'s';
                e.target.classList.add('card-visible');
                cardObserver.unobserve(e.target);
            }
        });
    },{threshold:0.08,rootMargin:'0px 0px -40px 0px'});
    document.querySelectorAll('.race-card.card-reveal:not(.card-visible)').forEach(c=>cardObserver.observe(c));
}

/* ============================================
   ONBOARDING — Welcome state for new users
   ============================================ */
function showOnboarding(){
    if(!currentUser)return;
    if(getLS('pulz-onboarded'))return;
    const t=T[lang];
    const cc=document.getElementById('countryContent');
    if(activeCountry||!cc)return;

    const benefits=document.getElementById('benefitsBar');
    if(!benefits)return;
    if(document.getElementById('onboardingWelcome'))return;

    const el=document.createElement('div');
    el.id='onboardingWelcome';
    el.className='onboarding-welcome';
    const role=currentProfile?.role||'runner';
    const name=currentProfile?.display_name||currentUser.email?.split('@')[0]||'';
    const greeting=name?`, ${esc(name)}`:'';

    let stepsHTML='', ctaText='', ctaAction='';
    if(role==='runner'){
        stepsHTML=`
            <div class="onboarding-step"><span class="onboarding-step-num">1</span>${t.onboardStep1||'Elegí un país'}</div>
            <div class="onboarding-step"><span class="onboarding-step-num">2</span>${t.onboardStep2||'Explorá carreras'}</div>
            <div class="onboarding-step"><span class="onboarding-step-num">3</span>${t.onboardStep3||'Guardá tus favoritas'}</div>`;
        ctaText=t.onboardCta||'Explorar carreras';
        ctaAction=`onboardingCta('runner');document.getElementById('csTrigger').scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>toggleDD(),400)`;
    } else if(role==='team'){
        stepsHTML=`
            <div class="onboarding-step"><span class="onboarding-step-num">1</span>${t.onboardTeamStep1||'Completá tu perfil de equipo'}</div>
            <div class="onboarding-step"><span class="onboarding-step-num">2</span>${t.onboardTeamStep2||'Marcá las carreras donde corren'}</div>
            <div class="onboarding-step"><span class="onboarding-step-num">3</span>${t.onboardTeamStep3||'Compartí el perfil con tus miembros'}</div>`;
        ctaText=t.onboardTeamCta||'Marcar nuestras carreras';
        ctaAction=`onboardingCta('team');document.getElementById('csTrigger').scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>toggleDD(),400)`;
    } else if(role==='organizer'){
        stepsHTML=`
            <div class="onboarding-step"><span class="onboarding-step-num">1</span>${t.onboardOrgStep1||'Publicá tu primera carrera'}</div>
            <div class="onboarding-step"><span class="onboarding-step-num">2</span>${t.onboardOrgStep2||'Llegá a runners de toda Sudamérica'}</div>
            <div class="onboarding-step"><span class="onboarding-step-num">3</span>${t.onboardOrgStep3||'Trackeá clicks a tu inscripción'}</div>`;
        ctaText=t.onboardOrgCta||'Publicar mi primera carrera';
        ctaAction=`onboardingCta('organizer');if(typeof openPublishRaceModal==='function')openPublishRaceModal()`;
    }

    el.innerHTML=`
        <div class="onboarding-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></div>
        <h2 class="onboarding-title">${t.onboardTitle||'Bienvenido a PULZ'}${greeting}</h2>
        <p class="onboarding-sub">${t.onboardSub||'Tu cuenta está lista. Ahora empezá a armar tu temporada de carreras.'}</p>
        <div class="onboarding-steps">${stepsHTML}</div>
        <button class="onboarding-cta" onclick="${ctaAction}">
            <span>${ctaText}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
        <button class="onboarding-dismiss" onclick="dismissOnboarding()">${t.onboardDismiss||'Ya conozco PULZ, cerrar'}</button>
    `;

    benefits.parentNode.insertBefore(el,benefits);
    if(typeof track==='function')track('onboarding_shown',{role});
}

function fadeOutOnboarding(){
    const el=document.getElementById('onboardingWelcome');
    if(!el)return;
    el.style.transition='opacity 0.3s ease, transform 0.3s ease';
    el.style.opacity='0';
    el.style.transform='translateY(-10px)';
    setTimeout(()=>el.remove(),300);
}

function dismissOnboarding(){
    setLS('pulz-onboarded','1');
    if(typeof track==='function')track('onboarding_dismissed',{role:(currentProfile&&currentProfile.role)||'unknown'});
    fadeOutOnboarding();
}

function onboardingCta(role){
    setLS('pulz-onboarded','1');
    if(typeof track==='function')track('onboarding_cta',{role:role||'unknown'});
    fadeOutOnboarding();
}

/* ============================================
   SPLASH PARALLAX + SCROLL PROGRESS
   ============================================ */
(function(){
    const splash=document.getElementById('splash');
    const logo=document.getElementById('splashLogo');
    const header=document.getElementById('mainHeader');
    const cue=document.getElementById('scrollCue');
    const progressBar=document.getElementById('scrollProgress');
    let tick=false;

    function onScroll(){if(!tick){tick=true;requestAnimationFrame(()=>{upd();tick=false})}}

    function upd(){
        const rect=splash.getBoundingClientRect();
        const h=splash.offsetHeight;
        const s=Math.max(-rect.top,0);
        const p=Math.min(s/(h*0.6),1);

        logo.style.transform=`scale(${Math.max(1-p*0.85,0.12)}) translateY(${-s*0.4}px)`;
        logo.style.opacity=Math.max(1-p*1.4,0);

        const q=1-p*4;
        const sub=splash.querySelector('.splash-sub');
        if(sub)sub.style.opacity=Math.max(q,0);
        if(cue)cue.style.opacity=Math.max(q,0);

        const bg=splash.querySelector('.splash-bg');
        if(bg)bg.style.opacity=1-p;

        const parts=document.getElementById('particles');
        if(parts)parts.style.opacity=1-p;

        if(p>0.5||activeCountry)header.classList.add('visible');
        else header.classList.remove('visible');

        /* Hero staggered entrance — trigger when splash is mostly gone */
        const home=document.getElementById('home');
        if(home && !home.classList.contains('hero-visible') && p>0.4){
            home.classList.add('hero-visible');
        }

        /* Scroll progress bar */
        if(progressBar){
            const docH=document.documentElement.scrollHeight-window.innerHeight;
            const pct=docH>0?(window.scrollY/docH)*100:0;
            progressBar.style.width=pct+'%';
        }
    }

    window.addEventListener('scroll',onScroll,{passive:true});
    upd();
})();

document.addEventListener('click',e=>{
    if(!e.target.closest('.cs')){
        document.getElementById('dd').classList.remove('open');
        document.getElementById('csTrigger').classList.remove('open');
    }
});

buildDD();

/* Update organizer stats with real race count */
function updateOrgStats(){
    let total=0;
    countries.forEach(c=>{if(R[c.id])total+=getVisibleRaces(R[c.id]).length;});
    const el=document.getElementById('orgStatRaces');
    if(el)el.textContent=total;
    const cross=document.getElementById('crossRaces');
    if(cross)cross.textContent=total;
}
updateOrgStats();

/* ============================================
   CUSTOM CURSOR
   ============================================ */
(function(){
    const dot=document.getElementById('cursorDot');
    const ring=document.getElementById('cursorRing');
    if(!dot||!ring)return;

    // Only on non-touch devices
    if(window.matchMedia('(hover:none)').matches)return;

    document.documentElement.classList.add('cursor-active');

    let mx=0,my=0;
    let ringX=0,ringY=0;
    let visible=false;

    document.addEventListener('mousemove',e=>{
        mx=e.clientX;my=e.clientY;
        if(!visible){
            visible=true;
            dot.classList.add('visible');
            ring.classList.add('visible');
        }
        // Dot follows instantly
        dot.style.left=(mx-4)+'px';
        dot.style.top=(my-4)+'px';
        if(!animating){animating=true;requestAnimationFrame(animate);}
    });

    // Ring follows with smooth lag
    let animating=false;
    function animate(){
        ringX+=(mx-ringX)*0.15;
        ringY+=(my-ringY)*0.15;
        ring.style.left=ringX+'px';
        ring.style.top=ringY+'px';
        if(Math.abs(mx-ringX)>0.5||Math.abs(my-ringY)>0.5)requestAnimationFrame(animate);
        else animating=false;
    }

    // Hover state on interactive elements
    const hoverSelectors='a,button,[onclick],.race-card,.co,.cs-trigger,.lang-btn,.benefit-card,.filter-btn,.month-btn,.auth-btn-ghost,.auth-btn-header,.benefits-cta,.drawer-action-btn,.share-opt,.ft-link,.no-results-cta,.cs-clear,.org-feature,.org-stat,.org-cta,.team-cta,.eco-node,.hero-role,.fav-btn,.cookie-btn,.auth-submit,.auth-text-btn,.auth-role-btn,.race-form-chip,.team-feature,.cross-proof-item,select';
    document.addEventListener('mouseover',e=>{
        if(e.target.closest(hoverSelectors)){
            dot.classList.add('hovering');
            ring.classList.add('hovering');
        }
    });
    document.addEventListener('mouseout',e=>{
        if(e.target.closest(hoverSelectors)){
            dot.classList.remove('hovering');
            ring.classList.remove('hovering');
        }
    });

    // Click state
    document.addEventListener('mousedown',()=>{
        dot.classList.add('clicking');
        ring.classList.add('clicking');
    });
    document.addEventListener('mouseup',()=>{
        dot.classList.remove('clicking');
        ring.classList.remove('clicking');
    });

    // Hide when mouse leaves window
    document.addEventListener('mouseleave',()=>{
        dot.classList.remove('visible');
        ring.classList.remove('visible');
        visible=false;
    });
})();

/* ============================================
   SCROLL REVEAL — Layer transitions
   ============================================ */
(function(){
    const observer=new IntersectionObserver((entries,obs)=>{
        entries.forEach(e=>{
            if(e.isIntersecting){
                e.target.classList.add('in-view');
                obs.unobserve(e.target);
            }
        });
    },{threshold:0.1,rootMargin:'0px 0px -30px 0px'});

    // Runners benefits — header entrance + card stagger
    const benefitsInner=document.querySelector('.benefits-inner');
    if(benefitsInner){
        // Header entrance: observe the benefits-inner itself
        const headerObserver=new IntersectionObserver((entries)=>{
            entries.forEach(e=>{
                if(e.isIntersecting) benefitsInner.classList.add('in-view');
            });
        },{threshold:0.1});
        headerObserver.observe(benefitsInner);

        // Card stagger: observe the cards wrapper
        const cardsWrap=benefitsInner.querySelector('.benefits-cards');
        if(cardsWrap){
            const cardObserver=new IntersectionObserver((entries)=>{
                entries.forEach(e=>{
                    if(e.isIntersecting){
                        benefitsInner.classList.add('in-view-cards');
                    }
                });
            },{threshold:0.15});
            cardObserver.observe(cardsWrap);
        }
    }

    // Running Teams section
    const teamInner=document.querySelector('.benefits-team-inner');
    if(teamInner){
        teamInner.querySelectorAll(':scope > *').forEach(child=>{
            child.classList.add('reveal-item');
            observer.observe(child);
        });
    }
    document.querySelectorAll('.team-feature').forEach(f=>{
        f.classList.add('reveal-item');
        observer.observe(f);
    });

    // Organizer section
    const orgInner=document.querySelector('.benefits-org-inner');
    if(orgInner){
        orgInner.querySelectorAll(':scope > *').forEach(child=>{
            child.classList.add('reveal-item');
            observer.observe(child);
        });
    }

    // Org features individually
    document.querySelectorAll('.org-feature').forEach(f=>{
        f.classList.add('reveal-item');
        observer.observe(f);
    });

    // Org stats stagger
    const orgStats=document.querySelector('.org-stats');
    if(orgStats){
        const statsObserver=new IntersectionObserver((entries)=>{
            entries.forEach(e=>{
                if(e.isIntersecting) e.target.classList.add('in-view');
            });
        },{threshold:0.2});
        statsObserver.observe(orgStats);
    }
})();

/* ============================================
   RUNNING TEAMS — Load & render in drawer
   ============================================ */
/* ============================================
   RUNNING TEAMS — Directory (country content)
   ============================================ */
let _directoryTeams=[];
let _teamSearchQuery='';
let _teamModFilter='all';

async function loadTeamsForCountry(countryId){
    const container=document.getElementById('teamsDirectory');
    if(!container)return;
    const t=T[lang];

    container.innerHTML=`<div class="teams-directory-loading"><span class="auth-submit-loader" style="display:block;position:static;border-top-color:var(--txt3)"></span></div>`;

    let teams=[];
    if(countryId==='all'){
        teams=await getAllTeams();
    }else{
        teams=await getTeamsByCountry(countryId);
    }

    _directoryTeams=teams;
    _teamSearchQuery='';
    _teamModFilter='all';

    // Update teams tab count
    const tabCount=document.getElementById('teamsTabCount');
    if(tabCount)tabCount.textContent=teams.length;

    if(!teams.length){
        container.innerHTML=`<div class="teams-directory-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            <p>${t.teamsDirectoryEmpty||'No hay equipos registrados en este país todavía.'}</p>
        </div>`;
        return;
    }

    renderTeamsDirectory(teams);
}

function renderTeamsDirectory(teams){
    const container=document.getElementById('teamsDirectory');
    if(!container)return;
    const t=T[lang];

    // Build search/filter toolbar
    const toolbarHTML=`<div class="teams-toolbar">
        <div class="teams-search-wrap">
            <svg class="teams-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="teams-search-input" id="teamSearchInput" placeholder="${t.teamSearchPh||'Buscar equipo...'}" value="${esc(_teamSearchQuery)}" oninput="filterTeamsDirectory(this.value,_teamModFilter)" autocomplete="off" spellcheck="false">
        </div>
        <div class="teams-filter-btns">
            <button class="teams-filter-btn${_teamModFilter==='all'?' active':''}" onclick="filterTeamsDirectory(_teamSearchQuery,'all')">${t.teamFilterAll||'Todos'}</button>
            <button class="teams-filter-btn${_teamModFilter==='road'?' active':''}" onclick="filterTeamsDirectory(_teamSearchQuery,'road')">${t.teamFilterRoad||'Asfalto'}</button>
            <button class="teams-filter-btn${_teamModFilter==='trail'?' active':''}" onclick="filterTeamsDirectory(_teamSearchQuery,'trail')">${t.teamFilterTrail||'Trail'}</button>
            <button class="teams-filter-btn${_teamModFilter==='both'?' active':''}" onclick="filterTeamsDirectory(_teamSearchQuery,'both')">${t.teamFilterBoth||'Ambos'}</button>
        </div>
    </div>`;

    // Filter teams
    let filtered=teams;
    if(_teamSearchQuery){
        const tokens=norm(_teamSearchQuery).split(/\s+/).filter(Boolean);
        filtered=filtered.filter(tm=>{
            const haystack=norm((tm.team_name||'')+' '+(tm.team_city||''));
            return tokens.every(tok=>haystack.includes(tok));
        });
    }
    if(_teamModFilter!=='all'){
        filtered=filtered.filter(tm=>tm.team_modality===_teamModFilter);
    }

    if(!filtered.length){
        container.innerHTML=toolbarHTML+`<div class="teams-directory-empty" style="padding:1.5rem">
            <p>${t.noT||'Sin resultados'}</p>
        </div>`;
        return;
    }

    // Group by city
    const byCity={};
    filtered.forEach(tm=>{
        const city=tm.team_city||t.teamsNoCity||'Otras';
        if(!byCity[city])byCity[city]=[];
        byCity[city].push(tm);
    });

    const sortedCities=Object.keys(byCity).sort((a,b)=>a.localeCompare(b));
    let html=toolbarHTML+'<div class="teams-directory-grid">';
    sortedCities.forEach(city=>{
        html+=`<div class="teams-city-group">
            <div class="teams-city-name">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                ${esc(city)}
                <span class="teams-city-count">${byCity[city].length}</span>
            </div>
            <div class="teams-city-list">${byCity[city].map(tm=>renderTeamChip(tm)).join('')}</div>
        </div>`;
    });
    html+='</div>';
    container.innerHTML=html;

    // Restore focus to search input if user was typing
    if(_teamSearchQuery){
        const input=document.getElementById('teamSearchInput');
        if(input){input.focus();input.selectionStart=input.selectionEnd=input.value.length;}
    }
}

function filterTeamsDirectory(query,mod){
    _teamSearchQuery=typeof query==='string'?query:_teamSearchQuery;
    _teamModFilter=mod||'all';
    renderTeamsDirectory(_directoryTeams);
}

/* ============================================
   ORGANIZER DIRECTORY
   ============================================ */
let _directoryOrgs=[];
let _orgSearchQuery='';

async function loadOrgsForCountry(countryId){
    const container=document.getElementById('orgsDirectory');
    if(!container)return;
    const t=T[lang];

    container.innerHTML=`<div class="teams-directory-loading"><span class="auth-submit-loader" style="display:block;position:static;border-top-color:var(--txt3)"></span></div>`;

    let orgs=[];
    if(countryId==='all'){
        orgs=await getAllOrgs();
    }else{
        orgs=await getOrgsByCountry(countryId);
    }

    _directoryOrgs=orgs;
    _orgSearchQuery='';

    // Enrich with race counts
    _directoryOrgs.forEach(org=>{
        let count=0;
        for(const cid of Object.keys(R)){
            R[cid].forEach(r=>{if(r.organizer_id===org.id)count++;});
        }
        org._raceCount=count;
    });

    const tabCount=document.getElementById('orgsTabCount');
    if(tabCount)tabCount.textContent=orgs.length;

    if(!orgs.length){
        container.innerHTML=`<div class="teams-directory-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <p>${t.orgsDirectoryEmpty||'No hay organizadores registrados en este país todavía.'}</p>
        </div>`;
        return;
    }

    renderOrgsDirectory(orgs);
}

function renderOrgsDirectory(orgs){
    const container=document.getElementById('orgsDirectory');
    if(!container)return;
    const t=T[lang];

    const toolbarHTML=`<div class="teams-toolbar">
        <div class="teams-search-wrap">
            <svg class="teams-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" class="teams-search-input" id="orgSearchInput" placeholder="${t.orgSearchPh||'Buscar organizador...'}" value="${esc(_orgSearchQuery)}" oninput="filterOrgsDirectory(this.value)" autocomplete="off" spellcheck="false">
        </div>
    </div>`;

    let filtered=orgs;
    if(_orgSearchQuery){
        const tokens=norm(_orgSearchQuery).split(/\s+/).filter(Boolean);
        filtered=filtered.filter(o=>{
            const haystack=norm((o.org_name||'')+(o.display_name||''));
            return tokens.every(tok=>haystack.includes(tok));
        });
    }

    if(!filtered.length){
        container.innerHTML=toolbarHTML+`<div class="teams-directory-empty" style="padding:1.5rem"><p>${t.noT||'Sin resultados'}</p></div>`;
        return;
    }

    // Sort by race count descending
    filtered.sort((a,b)=>(b._raceCount||0)-(a._raceCount||0));

    let html=toolbarHTML+'<div class="orgs-directory-grid">';
    filtered.forEach(org=>{
        html+=renderOrgChip(org);
    });
    html+='</div>';
    container.innerHTML=html;

    if(_orgSearchQuery){
        const input=document.getElementById('orgSearchInput');
        if(input){input.focus();input.selectionStart=input.selectionEnd=input.value.length;}
    }
}

function renderOrgChip(org){
    const t=T[lang];
    const name=org.org_name||org.display_name||'Organizador';
    const raceCount=org._raceCount||0;
    const countLabel=raceCount>0?`${raceCount} ${raceCount===1?(t.raceOne||'carrera'):(t.cR||'carreras')}`:(t.orgsNoRaces||'Sin carreras aún');
    const safeW=org.org_website?safeUrl(org.org_website):'';
    const domain=safeW?safeW.replace(/^https?:\/\/(www\.)?/,'').split('/')[0]:'';

    return `<button class="org-chip" onclick="openOrgProfile('${esc(org.id)}')">
        <span class="org-chip-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>
        <span class="org-chip-info">
            <span class="org-chip-name">${esc(name)}</span>
            <span class="org-chip-meta">${esc(countLabel)}${domain?' · '+esc(domain):''}</span>
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" class="org-chip-arrow"><polyline points="9 18 15 12 9 6"/></svg>
    </button>`;
}

function filterOrgsDirectory(query){
    _orgSearchQuery=typeof query==='string'?query:_orgSearchQuery;
    renderOrgsDirectory(_directoryOrgs);
}

async function loadTeamsGoingToRace(raceId, containerId){
    const container=document.getElementById(containerId);
    if(!container||!raceId||typeof getTeamsForRace!=='function')return;
    const teams=await getTeamsForRace(raceId);
    if(!teams.length)return;
    const t=T[lang];
    container.innerHTML=`
        <div class="teams-section">
            <div class="teams-heading">${t.teamsGoingTitle||'Equipos que van a esta carrera'}</div>
            <div class="teams-list">${teams.map(tm=>renderTeamChip(tm)).join('')}</div>
        </div>`;
}

async function loadTeamsInRaceCity(location, containerId){
    const container=document.getElementById(containerId);
    if(!container||!location||typeof getTeamsInCity!=='function')return;
    const teams=await getTeamsInCity(location);
    if(!teams.length)return;
    const t=T[lang];
    const cityName=location.split(',')[0].trim();
    container.innerHTML=`
        <div class="teams-section">
            <div class="teams-heading">${t.teamsInCityTitle||'Running teams en'} ${esc(cityName)}</div>
            <div class="teams-list">${teams.map(tm=>renderTeamChip(tm)).join('')}</div>
        </div>`;
}

/* ============================================
   ORGANIZER BADGE — Public org profile in drawer
   ============================================ */
async function loadOrgBadge(orgId, containerId){
    const container=document.getElementById(containerId);
    if(!container||!orgId||!sbClient)return;
    try{
        const{data:org,error}=await sbClient.from('profiles').select('id,display_name,org_name,org_website').eq('id',orgId).single();
        if(error||!org)return;
        const name=org.org_name||org.display_name||'';
        if(!name)return;
        const t=T[lang];
        // Count org's published races
        let raceCount=0;
        for(const cid of Object.keys(R)){
            R[cid].forEach(r=>{if(r.organizer_id===orgId)raceCount++;});
        }
        const countLabel=raceCount>0?` · ${raceCount} ${raceCount===1?(t.raceOne||'carrera'):(t.cR||'carreras')}`:'';
        container.innerHTML=`
            <button class="org-badge" onclick="openOrgProfile('${esc(orgId)}')">
                <span class="org-badge-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>
                <span class="org-badge-info">
                    <span class="org-badge-label">${t.srcOrganizer||'Oficial'}</span>
                    <span class="org-badge-name">${esc(name)}${countLabel}</span>
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" class="org-badge-arrow"><polyline points="9 18 15 12 9 6"/></svg>
            </button>`;
    }catch(e){/* org badge failed */}
}

async function openOrgProfile(orgId){
    if(!sbClient)return;
    const t=T[lang];
    const locale=getLocale();

    const{data:org,error}=await sbClient.from('profiles').select('id,display_name,org_name,org_website').eq('id',orgId).single();
    if(error||!org)return;

    const name=org.org_name||org.display_name||'Organizador';

    // Find all races by this organizer
    const orgRaces=[];
    for(const cid of Object.keys(R)){
        R[cid].forEach((r,idx)=>{
            if(r.organizer_id===orgId)orgRaces.push({...r,_country:cid,_idx:idx});
        });
    }
    orgRaces.sort((a,b)=>new Date(a.d+'T00:00:00')-new Date(b.d+'T00:00:00'));

    // Stats
    const uniqueCountries=new Set(orgRaces.map(r=>r._country));
    const totalFavs=orgRaces.reduce((s,r)=>s+(r._id&&typeof getFavCount==='function'?getFavCount(r._id):0),0);

    let statsHTML='';
    if(orgRaces.length){
        statsHTML=`<div class="team-stats-bar">
            <div class="team-stat-pill"><span class="team-stat-num">${orgRaces.length}</span> ${t.cR||'carreras'}</div>
            <div class="team-stat-pill"><span class="team-stat-num">${uniqueCountries.size}</span> ${uniqueCountries.size===1?(t.authOrgCountry||'país'):(t.orgStatCountries||'países')}</div>
            ${totalFavs?`<div class="team-stat-pill accent"><span class="team-stat-num">${totalFavs}</span> ${t.runnersInterested||'runners interesados'}</div>`:''}
        </div>`;
    }

    // Website
    let webHTML='';
    const safeW=org.org_website?safeUrl(org.org_website):'';
    if(safeW){
        const domain=safeW.replace(/^https?:\/\/(www\.)?/,'').split('/')[0];
        webHTML=`<div class="team-profile-links"><a href="${esc(safeW)}" target="_blank" rel="noopener noreferrer" class="team-profile-link" onclick="event.stopPropagation()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg> ${esc(domain)}</a></div>`;
    }

    // Race list
    let racesHTML='';
    if(orgRaces.length){
        racesHTML='<div class="my-races-list" style="margin-top:1rem">';
        orgRaces.forEach(r=>{
            const dt=new Date(r.d+'T00:00:00');
            const dateStr=dt.toLocaleDateString(locale,{day:'numeric',month:'short'});
            const fc=r._id&&typeof getFavCount==='function'?getFavCount(r._id):0;
            const fcBadge=fc>0?`<span class="org-insight"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="10" height="10"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> ${fc}</span>`:'';
            racesHTML+=`<div class="my-race-item" style="cursor:pointer" onclick="closeRaceModal();setTimeout(()=>openDrawer('${esc(r._country)}',${r._idx}),300)"><div class="my-race-info"><div class="my-race-name">${esc(r.n)} ${fcBadge}</div><div class="my-race-meta">${dateStr} · ${esc(r.l)}</div></div></div>`;
        });
        racesHTML+='</div>';
    }

    document.getElementById('raceModalBody').innerHTML=`
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${esc(name)}</h2>
            <p class="auth-subtitle">${t.authRoleOrg||'Organizador'} · ${orgRaces.length} ${orgRaces.length===1?(t.raceOne||'carrera publicada'):(t.racePlural||'carreras publicadas')}</p>
        </div>
        ${webHTML}
        ${statsHTML}
        ${racesHTML.length?racesHTML:`<div class="my-races-empty">${t.myRacesEmpty||'Sin carreras publicadas.'}</div>`}
    `;
    openRaceModal();
}

function renderTeamChip(team){
    const modLabel=team.team_modality==='trail'?'Trail':team.team_modality==='both'?(T[lang].authTeamBoth||'Ambos'):(T[lang].road||'Asfalto');
    const recruitBadge=team.team_recruiting?`<span class="team-chip-recruit">${T[lang].teamRecruiting||'Buscamos miembros'}</span>`:'';
    return `<button class="team-chip" onclick="openTeamProfile('${esc(team.id)}')">
        <span class="team-chip-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg></span>
        <span class="team-chip-name">${esc(team.team_name)}</span>
        <span class="team-chip-meta">${esc(team.team_city||'')} · ${modLabel}</span>
        ${recruitBadge}
    </button>`;
}

async function openTeamProfile(teamId){
    if(!sbClient)return;
    const t=T[lang];
    const locale=getLocale();

    // Fetch team profile
    const{data:team,error}=await sbClient.from('profiles').select('id,team_name,team_city,team_modality,team_instagram,team_contact,team_recruiting,team_recruiting_msg').eq('id',teamId).eq('role','team').single();
    if(error||!team)return;

    // Fetch team's races
    const{data:trData}=await sbClient.from('team_races').select('race_id').eq('team_id',teamId);
    const teamRaceIds=(trData||[]).map(tr=>tr.race_id);

    // Match with loaded races
    const matchedRaces=[];
    for(const cid of Object.keys(R)){
        R[cid].forEach((r,idx)=>{
            if(r._id&&teamRaceIds.includes(r._id)){
                matchedRaces.push({...r,_country:cid,_idx:idx});
            }
        });
    }
    matchedRaces.sort((a,b)=>new Date(a.d+'T00:00:00')-new Date(b.d+'T00:00:00'));

    const modLabel=team.team_modality==='trail'?'Trail':team.team_modality==='both'?(t.authTeamBoth||'Ambos'):(t.road||'Asfalto');

    let racesHTML='';
    if(matchedRaces.length){
        racesHTML='<div class="my-races-list" style="margin-top:1rem">';
        matchedRaces.forEach(r=>{
            const dt=new Date(r.d+'T00:00:00');
            const dateStr=dt.toLocaleDateString(locale,{day:'numeric',month:'short'});
            racesHTML+=`<div class="my-race-item" style="cursor:pointer" onclick="closeRaceModal();setTimeout(()=>openDrawer('${esc(r._country)}',${r._idx}),300)"><div class="my-race-info"><div class="my-race-name">${esc(r.n)}</div><div class="my-race-meta">${dateStr} · ${esc(r.l)}</div></div></div>`;
        });
        racesHTML+='</div>';
    }

    // Contact links
    let contactHTML='';
    if(team.team_instagram){
        const igHandle=team.team_instagram.replace(/^@/,'');
        contactHTML+=`<a href="https://instagram.com/${encodeURIComponent(igHandle)}" target="_blank" rel="noopener noreferrer" class="team-profile-link" onclick="event.stopPropagation()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> @${esc(igHandle)}</a>`;
    }
    if(team.team_contact){
        const safeContact=safeUrl(team.team_contact);
        if(safeContact){
            contactHTML+=`<a href="${esc(safeContact)}" target="_blank" rel="noopener noreferrer" class="team-profile-link" onclick="event.stopPropagation()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg> ${t.teamContact||'Contactar'}</a>`;
        }
    }

    // Team stats
    const uniqueCities=new Set(matchedRaces.map(r=>(r.l||'').split(',')[0].trim()).filter(Boolean));
    const upcomingCount=matchedRaces.filter(r=>new Date(r.d+'T00:00:00')>=new Date()).length;

    // Follower count
    const followerCount=typeof getTeamFollowerCount==='function'?await getTeamFollowerCount(teamId):0;

    let statsHTML='<div class="team-stats-bar">';
    if(followerCount>0) statsHTML+=`<div class="team-stat-pill"><span class="team-stat-num">${followerCount}</span> ${t.teamFollowers||'miembros'}</div>`;
    statsHTML+=`<div class="team-stat-pill"><span class="team-stat-num">${matchedRaces.length}</span> ${t.teamRacesCount||'carreras'}</div>`;
    if(uniqueCities.size>0) statsHTML+=`<div class="team-stat-pill"><span class="team-stat-num">${uniqueCities.size}</span> ${t.seasonCities||'ciudades'}</div>`;
    if(upcomingCount) statsHTML+=`<div class="team-stat-pill accent"><span class="team-stat-num">${upcomingCount}</span> ${t.seasonUpcoming||'próximas'}</div>`;
    statsHTML+='</div>';

    // Follow/join button (only for runners, not for the team itself)
    const isOwnTeam=currentUser&&currentUser.id===teamId;
    const isFollowing=typeof isFollowingTeam==='function'&&isFollowingTeam(teamId);
    let followBtnHTML='';
    if(!isOwnTeam){
        followBtnHTML=`<button class="team-follow-btn${isFollowing?' following':''}" id="teamFollowBtn" onclick="handleTeamFollow('${esc(teamId)}')">
            <svg viewBox="0 0 24 24" fill="${isFollowing?'currentColor':'none'}" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            <span>${isFollowing?(t.teamFollowing||'Unido'):(t.teamJoin||'Unirme')}</span>
        </button>`;
    }

    // Recruiting badge
    const recruitHTML=team.team_recruiting?`<div class="team-recruiting-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg> ${t.teamRecruiting||'Buscamos miembros'}${team.team_recruiting_msg?`<span class="team-recruiting-msg">${esc(team.team_recruiting_msg)}</span>`:''}</div>`:'';

    document.getElementById('raceModalBody').innerHTML=`
        <div class="auth-header">
            <div class="auth-logo"><div class="auth-logo-dot"></div>PULZ</div>
            <h2 class="auth-title">${esc(team.team_name)}</h2>
            <p class="auth-subtitle">${esc(team.team_city||'')} · ${modLabel}</p>
        </div>
        ${recruitHTML}
        ${contactHTML?`<div class="team-profile-links">${contactHTML}</div>`:''}
        ${followBtnHTML}
        ${statsHTML}
        ${matchedRaces.length?`<div class="teams-heading" style="margin-top:1.2rem">${t.authTeamRaces||'Carreras'} (${matchedRaces.length})</div>`:''}
        ${racesHTML}
    `;
    openRaceModal();
}

async function handleTeamFollow(teamId){
    if(typeof toggleTeamFollow==='function')await toggleTeamFollow(teamId);
    // Update button state
    const btn=document.getElementById('teamFollowBtn');
    if(btn){
        const t=T[lang];
        const following=typeof isFollowingTeam==='function'&&isFollowingTeam(teamId);
        btn.classList.toggle('following',following);
        const svg=btn.querySelector('svg');
        if(svg)svg.setAttribute('fill',following?'currentColor':'none');
        const span=btn.querySelector('span');
        if(span)span.textContent=following?(t.teamFollowing||'Unido'):(t.teamJoin||'Unirme');
    }
}

/* ============================================
   REVIEWS — Load & render in drawer
   ============================================ */
async function loadAndRenderReviews(raceId, countryId, raceIdx, containerId, isPast){
    const container=document.getElementById(containerId);
    if(!container)return;
    const t=T[lang];
    const r=(countryId&&R[countryId]&&raceIdx!==undefined&&raceIdx!==null)?R[countryId][raceIdx]:null;

    // Only show review form for past races
    let formHTML='';
    if(isPast){
        if(currentUser){
            const cats=r&&r.c?r.c.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join(''):'';
            formHTML=`
                <div class="review-form" id="reviewForm_${containerId}">
                    <div class="review-form-title">${t.reviewAdd}</div>
                    <div class="review-stars-input" id="reviewStars_${containerId}">
                        ${[1,2,3,4,5].map(i=>`<button class="review-star-btn" data-val="${i}" onclick="selectStar('${containerId}',${i})">★</button>`).join('')}
                    </div>
                    <select class="review-select" id="reviewCat_${containerId}">
                        <option value="">${t.reviewCategory}</option>
                        ${cats}
                    </select>
                    <input type="text" class="review-input" id="reviewTime_${containerId}" placeholder="${t.reviewTime}">
                    <textarea class="review-textarea" id="reviewComment_${containerId}" placeholder="${t.reviewComment}" rows="2"></textarea>
                    <button class="review-submit" id="reviewSubmitBtn_${containerId}" onclick="handleReviewSubmit('${esc(raceId)}','${containerId}','${esc(countryId)}',${raceIdx})" disabled>${t.reviewSubmit}</button>
                </div>`;
        } else {
            formHTML=`<button class="review-login-btn" onclick="openAuthModal('login')">${t.reviewLogin}</button>`;
        }
    }

    // If no raceId (hardcoded data), show empty state
    if(!raceId||!sbClient){
        if(isPast) container.innerHTML=`<div class="reviews-section"><h4 class="reviews-heading">${t.reviewTitle}</h4><p class="reviews-empty">${t.reviewEmpty}</p>${formHTML}</div>`;
        return;
    }

    // Load reviews from DB
    const reviews=await loadRaceReviews(raceId);
    if(!reviews.length&&!isPast){container.innerHTML='';return;}

    // Build reviews HTML
    let avg=0;
    if(reviews.length){avg=reviews.reduce((s,r)=>s+r.rating,0)/reviews.length;}
    const avgStr=avg.toFixed(1);
    const fullStars='★'.repeat(Math.round(avg));
    const emptyStars='☆'.repeat(5-Math.round(avg));

    let summaryHTML='';
    if(reviews.length){
        summaryHTML=`<div class="reviews-summary"><div class="reviews-avg"><span class="reviews-avg-num">${avgStr}</span><span class="reviews-avg-stars">${fullStars}${emptyStars}</span></div><span class="reviews-avg-label">${reviews.length} ${t.reviewCount}</span></div>`;
    }

    let listHTML='';
    reviews.forEach(rev=>{
        const stars='★'.repeat(rev.rating)+'☆'.repeat(5-rev.rating);
        const rawName=rev.display_name||'Runner';
        const initial=rawName[0].toUpperCase();
        const name=esc(rawName);
        const date=new Date(rev.created_at).toLocaleDateString(getLocale(),{day:'numeric',month:'short',year:'numeric'});
        const catBadge=rev.category?`<span class="review-cat-badge">${esc(rev.category)}</span>`:'';
        const timeBadge=rev.finish_time?`<span class="review-time-badge">${esc(rev.finish_time)}</span>`:'';
        const commentHTML=rev.comment?`<p class="review-comment">${esc(rev.comment)}</p>`:'';
        listHTML+=`<div class="review-item"><div class="review-header"><div class="review-avatar">${initial}</div><div class="review-meta"><span class="review-name">${name}</span><span class="review-date">${date}</span></div><div class="review-stars">${stars}</div></div><div class="review-badges">${catBadge}${timeBadge}</div>${commentHTML}</div>`;
    });

    const emptyMsg=reviews.length?'':`<p class="reviews-empty">${t.reviewEmpty}</p>`;

    container.innerHTML=`<div class="reviews-section"><h4 class="reviews-heading">${t.reviewTitle}</h4>${summaryHTML}${emptyMsg}${listHTML}${formHTML}</div>`;
}

let selectedRating=0;
function selectStar(containerId,val){
    selectedRating=val;
    document.querySelectorAll(`#reviewStars_${containerId} .review-star-btn`).forEach(btn=>{
        btn.classList.toggle('active',parseInt(btn.dataset.val)<=val);
    });
    const submitBtn=document.getElementById(`reviewSubmitBtn_${containerId}`);
    if(submitBtn)submitBtn.disabled=false;
}

async function handleReviewSubmit(raceId,containerId,countryId,raceIdx){
    if(!raceId||raceId==='null'||!selectedRating)return;
    const cat=document.getElementById(`reviewCat_${containerId}`)?.value||'';
    const time=document.getElementById(`reviewTime_${containerId}`)?.value?.trim()||'';
    const comment=document.getElementById(`reviewComment_${containerId}`)?.value?.trim()||'';
    const btn=document.getElementById(`reviewSubmitBtn_${containerId}`);
    if(btn){btn.disabled=true;btn.textContent='...';}
    const{error}=await submitReview(raceId,selectedRating,cat,time,comment);
    if(error){if(btn){btn.disabled=false;btn.textContent=T[lang].reviewSubmit;}showToast(T[lang].favError||'Error al guardar','error');return;}
    selectedRating=0;
    // Refresh drawer reviews
    const container=document.getElementById(containerId);
    if(container){
        // Re-render reviews in place
        loadAndRenderReviews(raceId,countryId,raceIdx,containerId,true);
    }
}

/* ============================================
   URL ROUTING — Handle shared race URLs
   ============================================ */
function handleHashRoute(){
    const hash=location.hash.replace('#','');
    if(!hash){
        const drawer=document.getElementById('drawer');
        if(drawer&&drawer.classList.contains('open'))closeDrawer(true);
        if(typeof closePulzId==='function')closePulzId();
        return;
    }
    const parts=hash.split('/');
    if(parts.length<2)return;

    // PULZ ID route: #runner/username
    if(parts[0]==='runner'&&parts[1]){
        const username=parts[1];
        if(typeof openPublicProfile==='function')openPublicProfile(username);
        return;
    }

    const countryId=parts[0];
    const raceSlug=parts.slice(1).join('/');

    // Find the country
    const country=countries.find(c=>c.id===countryId);
    if(!country)return;

    // Select country first
    if(activeCountry!==countryId){
        selC(countryId);
    }

    // Find race by slug match (slug format: name-slug-index)
    const races=R[countryId]||[];
    // Try extracting index from slug suffix first
    const slugParts=raceSlug.match(/^(.+)-(\d+)$/);
    let raceIdx=-1;
    if(slugParts){
        const idx=parseInt(slugParts[2],10);
        if(races[idx]&&slugify(races[idx].n)===slugParts[1])raceIdx=idx;
    }
    // Fallback: match by name slug only (backwards compat with old URLs)
    if(raceIdx===-1)raceIdx=races.findIndex(r=>slugify(r.n)===raceSlug);
    if(raceIdx>-1){
        // Wait for country content to build, then open drawer
        const tryOpen=(attempts)=>{
            const ct=document.getElementById('countryContent');
            if(ct&&ct.children.length>0){openDrawer(countryId,raceIdx);}
            else if(attempts>0){setTimeout(()=>tryOpen(attempts-1),200);}
        };
        tryOpen(15);
    }
}

// Handle hash on page load and on back/forward
window.addEventListener('hashchange',handleHashRoute);
window.addEventListener('load',()=>{const tryHash=(a)=>{const ct=document.getElementById('countryContent');if(ct&&ct.children.length>0||a<=0)handleHashRoute();else setTimeout(()=>tryHash(a-1),200);};tryHash(15);});
