/**
 * PULZ — Application Logic v3.0
 * Handles: splash parallax, particles, navigation, filtering, rendering
 */
/* ============================================
   APP
   ============================================ */
let activeCountry=null;
const F={};

function getMaxDist(c){let m=0;c.forEach(x=>{const n=parseFloat(x);if(!isNaN(n))m=Math.max(m,n);if(x.toLowerCase().includes('ultra'))m=Math.max(m,100)});return m}
function distCat(c){const m=getMaxDist(c);if(m>42.195)return'ultra';if(m>=42)return'42k';if(m>=21)return'21k';if(m>0)return'10k';return c.join(' ').toLowerCase().includes('ultra')?'ultra':'10k'}
function tagCls(c){const n=parseFloat(c),l=c.toLowerCase();if(l.includes('ultra')||n>50)return'tag-u';if(l.includes('trail'))return'tag-t';if(l.includes('42')||n===42)return'tag-f';if(l.includes('21')||(n>=21&&n<42))return'tag-h';return'tag-s'}

/* Particles */
(function(){
    const el=document.getElementById('particles');
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

/* Card mouse glow */
document.addEventListener('mousemove',e=>{
    document.querySelectorAll('.race-card').forEach(c=>{
        const r=c.getBoundingClientRect();
        c.style.setProperty('--mx',(e.clientX-r.left)+'px');
        c.style.setProperty('--my',(e.clientY-r.top)+'px');
    });
});

/* Dropdown */
function buildDD(){
    document.getElementById('dd').innerHTML=countries.map(c=>{
        const cnt=R[c.id].length;
        return`<div class="co" onclick="selC('${c.id}')"><span class="co-flag">${c.code}</span><span class="co-name">${c.name}</span><span class="co-count">${cnt}</span></div>`;
    }).join('');
}

function toggleDD(){
    document.getElementById('dd').classList.toggle('open');
    document.getElementById('csTrigger').classList.toggle('open');
}

/* Select country */
function selC(id){
    document.getElementById('dd').classList.remove('open');
    document.getElementById('csTrigger').classList.remove('open');
    const c=countries.find(x=>x.id===id);
    document.getElementById('csTrigger').querySelector('.cs-label').textContent=c.name;
    document.getElementById('csTrigger').querySelector('.cs-icon').textContent=c.code;
    activeCountry=id;
    searchQuery='';
    F[id]={month:'all',type:'all',dist:'all'};
    buildCountryContent(id);
    document.getElementById('sectionLine').style.display='block';
    const cc=document.getElementById('countryContent');
    cc.classList.add('active');
    document.getElementById('mainHeader').classList.add('visible');
    setTimeout(()=>cc.scrollIntoView({behavior:'smooth',block:'start'}),80);
}

function buildCountryContent(id){
    const races=R[id]||[];
    const c=countries.find(x=>x.id===id);
    const t=T[lang];
    const trail=races.filter(r=>r.t==='trail').length;
    const road=races.filter(r=>r.t==='asfalto').length;
    const iconic=races.filter(r=>r.i).length;
    const monthSet=new Set();
    races.forEach(r=>monthSet.add(new Date(r.d).getMonth()));
    const mn=MN[lang];

    let mH=`<button class="month-btn${F[id].month==='all'?' active':''}" onclick="fM('${id}','all')">ALL</button>`;
    mn.forEach((name,i)=>{const has=monthSet.has(i);mH+=`<button class="month-btn${!has?' disabled':''}${F[id].month===i?' active':''}" onclick="fM('${id}',${i})" ${has?'':'disabled'}>${name}</button>`});

    const tH=['all','asfalto','trail'].map(v=>`<button class="filter-btn${F[id].type===v?' active':''}" onclick="fT('${id}','${v}')">${v==='all'?t.all:v==='asfalto'?t.road:'Trail'}</button>`).join('');
    const dH=['all','10k','21k','42k','ultra'].map(v=>{const lb=v==='all'?t.all:v==='10k'?'≤10K':v==='21k'?'21K':v==='42k'?'42K':'Ultra';return`<button class="filter-btn${F[id].dist===v?' active':''}" onclick="fD('${id}','${v}')">${lb}</button>`}).join('');

    document.getElementById('countryContent').innerHTML=`
        <button class="back-link" onclick="goHome()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>${t.back}</button>
        <div class="page-hdr"><h2 class="page-title">${c.name}</h2><span class="page-badge">${races.length} ${t.cR}</span></div>
        <div class="stats-bar">
            <div class="stat-item"><div class="stat-val">${races.length}</div><div class="stat-lbl">${t.statR}</div></div>
            <div class="stat-item"><div class="stat-val">${road}</div><div class="stat-lbl">${t.statA}</div></div>
            <div class="stat-item"><div class="stat-val">${trail}</div><div class="stat-lbl">${t.statT}</div></div>
            <div class="stat-item"><div class="stat-val">${iconic}</div><div class="stat-lbl">${t.statI}</div></div>
        </div>
        <div class="search-bar">
            <div class="search-bar-wrap">
                <svg class="search-bar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" class="search-bar-input" id="countrySearch" placeholder="${t.sPh}" autocomplete="off" spellcheck="false" oninput="onSearchInput('${id}',this.value)">
                <button class="search-bar-clear" onclick="clearSearch('${id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
                <span class="search-bar-count" id="searchCount"></span>
                <span class="search-bar-kbd">⌘K</span>
            </div>
        </div>
        <div class="filters-section">
            <div class="filter-row"><div class="filter-group"><div class="filter-label">${t.month}</div><div class="filter-set">${mH}</div></div></div>
            <div class="filter-row">
                <div class="filter-group"><div class="filter-label">${t.type}</div><div class="filter-set">${tH}</div></div>
                <div class="filter-group"><div class="filter-label">${t.dist}</div><div class="filter-set">${dH}</div></div>
            </div>
        </div>
        <div id="race-list"></div>
    `;
    renderRaces(id);
}

function renderRaces(id){
    const races=R[id]||[];
    const{month,type,dist}=F[id];
    const sorted=[...races].sort((a,b)=>new Date(a.d)-new Date(b.d));
    const locale=lang==='pt'?'pt-BR':lang==='en'?'en-US':'es-ES';
    const t=T[lang];
    let vis=0;
    let h='<div class="race-grid">';

    // Search tokens
    const tokens=searchQuery?searchQuery.split(/\s+/).filter(Boolean):[];

    sorted.forEach(r=>{
        const dt=new Date(r.d),mo=dt.getMonth(),dc=distCat(r.c);
        const matchMonth=month==='all'||mo===month;
        const matchType=type==='all'||r.t===type;
        const matchDist=dist==='all'||dist===dc;

        // Search match
        let matchSearch=true;
        if(tokens.length){
            const haystack=(r.n+' '+r.l+' '+r.c.join(' ')+' '+r.t).toLowerCase();
            matchSearch=tokens.every(tok=>haystack.includes(tok));
        }

        const ok=matchMonth&&matchType&&matchDist&&matchSearch;
        if(ok)vis++;
        const ds=dt.toLocaleDateString(locale,{day:'numeric',month:'short',year:'numeric'}).toUpperCase();
        const tgs=r.c.map(c=>`<span class="tag ${tagCls(c)}">${c}</span>`).join('');
        const ic=r.i?' iconic':'';
        const bg=r.i?`<div class="iconic-badge">★ ${t.iconic}</div>`:'';
        const ri=races.indexOf(r);
        const favId=r._id||id+'_'+ri;
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
        h+=`<div class="race-card${ic}" onclick="openDrawer('${id}',${ri})" style="display:${ok?'block':'none'};animation:fadeUp .4s ease forwards ${0.03*Math.min(vis,25)}s;opacity:0">${bg}${favBtn}<div class="race-date">${ds} ${statusBadge} ${srcBadge}</div><h3 class="race-name">${r.n}</h3><p class="race-loc">${r.l}</p><div class="race-tags">${tgs}</div></div>`;
    });
    h+='</div>';
    if(!vis)h+=`<div class="no-results"><div class="no-results-text">${t.noT}</div><div class="no-results-hint">${t.noH}</div></div>`;
    document.getElementById('race-list').innerHTML=h;

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

function fM(id,m){F[id].month=m;buildCountryContent(id)}
function fT(id,t){F[id].type=t;buildCountryContent(id)}
function fD(id,d){F[id].dist=d;buildCountryContent(id)}

function goHome(){
    activeCountry=null;
    searchQuery='';
    document.getElementById('countryContent').classList.remove('active');
    document.getElementById('countryContent').innerHTML='';
    document.getElementById('sectionLine').style.display='none';
    const tr=document.getElementById('csTrigger');
    tr.querySelector('.cs-label').textContent=T[lang].selC;
    tr.querySelector('.cs-icon').textContent='↓';
    window.scrollTo({top:0,behavior:'instant'});
}

/* ============================================
   RACE DRAWER
   ============================================ */
function openDrawer(countryId, raceIdx){
    const r=R[countryId][raceIdx];
    if(!r)return;
    const t=T[lang];
    const c=countries.find(x=>x.id===countryId);
    const locale=lang==='pt'?'pt-BR':lang==='en'?'en-US':'es-ES';
    const dt=new Date(r.d);
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
        countdownHTML=`<div class="drawer-countdown"><div class="countdown-dot"></div><span class="countdown-text">¡Hoy!</span></div>`;
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
    const tagsHTML=r.c.map(x=>`<span class="tag ${tagCls(x)}">${x}</span>`).join('');

    // Description
    const descHTML=r.desc?`<div class="drawer-desc">${r.desc}</div>`:'';

    // Website row
    let webVal;
    if(r.w){
        const domain=r.w.replace(/^https?:\/\/(www\.)?/,'').split('/')[0];
        webVal=`<a href="${r.w}" target="_blank" onclick="event.stopPropagation()">${domain} ↗</a>`;
    } else {
        webVal=`<span class="muted">${t.dNoWeb}</span>`;
    }

    // Price row (if available)
    const priceRow=r.price?`
        <div class="drawer-row">
            <div class="drawer-row-icon"><svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div>
            <div class="drawer-row-content">
                <div class="drawer-row-label">${t.dInsc}</div>
                <div class="drawer-row-value">${r.price}</div>
            </div>
        </div>`:'';

    // CTA
    let ctaHTML;
    if(r.w){
        ctaHTML=`<div class="drawer-cta"><a href="${r.w}" target="_blank" class="drawer-cta-primary" onclick="event.stopPropagation()"><svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>${t.dWeb}</a></div>`;
    } else {
        ctaHTML=`<div class="drawer-cta"><span class="drawer-cta-disabled">${t.dNoWeb}</span></div>`;
    }

    // Favorite + Calendar actions
    const favId=r._id||countryId+'_'+raceIdx;
    const isFav=typeof isFavorite==='function'&&isFavorite(favId);
    const favActiveCls=isFav?' active':'';
    const favFill=isFav?'currentColor':'none';
    const actionsHTML=`
        <div class="drawer-actions">
            <button class="drawer-action-btn${favActiveCls}" id="drawerFavBtn" onclick="toggleFav('${favId}')">
                <svg viewBox="0 0 24 24" fill="${favFill}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                <span>${isFav?t.benefitFav:t.benefitFav}</span>
            </button>
            <button class="drawer-action-btn" onclick="addToCalendar('${countryId}',${raceIdx})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg>
                <span>${t.benefitCal}</span>
            </button>
        </div>
    `;

    document.getElementById('drawerBody').innerHTML=`
        ${countdownHTML}
        ${iconicHTML}
        <h2 class="drawer-title">${r.n}</h2>
        <div class="drawer-type ${typeCls}">${typeLabel}</div>
        <div class="drawer-tags">${tagsHTML}</div>
        ${descHTML}
        <div class="drawer-info">
            <div class="drawer-row">
                <div class="drawer-row-icon"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
                <div class="drawer-row-content">
                    <div class="drawer-row-label">${t.dLoc}</div>
                    <div class="drawer-row-value">${r.l}<br><span style="font-size:0.68rem;color:var(--txt3);font-weight:400">${c.name}</span></div>
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
                    <div class="drawer-row-value">${r.c.join(' · ')}</div>
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
        ${ctaHTML}
        ${actionsHTML}
    `;

    document.getElementById('drawerOverlay').classList.add('open');
    document.getElementById('drawer').classList.add('open');
    document.body.style.overflow='hidden';
}

function closeDrawer(){
    document.getElementById('drawerOverlay').classList.remove('open');
    document.getElementById('drawer').classList.remove('open');
    document.body.style.overflow='';
}

// Close drawer on Escape
document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
        closeDrawer();
        if(typeof closeAuthModal==='function')closeAuthModal();
    }
});

/* ============================================
   INLINE SEARCH (within country)
   ============================================ */
let searchQuery='';

function onSearchInput(id,val){
    searchQuery=val.trim().toLowerCase();
    // Update clear button visibility
    const clearBtn=document.querySelector('.search-bar-clear');
    if(clearBtn)clearBtn.classList.toggle('visible',searchQuery.length>0);
    renderRaces(id);
}

function clearSearch(id){
    searchQuery='';
    const inp=document.getElementById('countrySearch');
    if(inp)inp.value='';
    const clearBtn=document.querySelector('.search-bar-clear');
    if(clearBtn)clearBtn.classList.remove('visible');
    renderRaces(id);
    if(inp)inp.focus();
}

// Cmd+K focuses the search bar if country is active
document.addEventListener('keydown',e=>{
    if((e.metaKey||e.ctrlKey)&&e.key==='k'){
        e.preventDefault();
        const inp=document.getElementById('countrySearch');
        if(inp){inp.focus();inp.select()}
    }
});

/* ============================================
   SPLASH PARALLAX
   ============================================ */
(function(){
    const splash=document.getElementById('splash');
    const logo=document.getElementById('splashLogo');
    const header=document.getElementById('mainHeader');
    const cue=document.getElementById('scrollCue');
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
