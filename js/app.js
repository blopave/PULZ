/**
 * PULZ — Application Logic v3.0
 * Handles: splash parallax, particles, navigation, filtering, rendering
 */
/* ============================================
   APP
   ============================================ */
let activeCountry=null;
const F={};

/* Analytics helper */
function track(event,params){if(typeof gtag==='function')gtag('event',event,params);}

/* Slug helper for URLs */
function slugify(text){
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

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
    document.querySelectorAll('.race-card,.benefit-card').forEach(c=>{
        const r=c.getBoundingClientRect();
        c.style.setProperty('--mx',(e.clientX-r.left)+'px');
        c.style.setProperty('--my',(e.clientY-r.top)+'px');
    });
});

/* Dropdown */
/* Today at midnight for filtering past races */
const TODAY=new Date();TODAY.setHours(0,0,0,0);

function futureRaces(arr){return arr.filter(r=>new Date(r.d+'T23:59:59')>=TODAY);}

function buildDD(){
    document.getElementById('dd').innerHTML=countries.map(c=>{
        const cnt=futureRaces(R[c.id]).length;
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

    // Toggle: clicking same country deselects
    if(activeCountry===id){
        goHome();
        return;
    }

    const c=countries.find(x=>x.id===id);
    document.getElementById('csTrigger').querySelector('.cs-label').textContent=c.name;
    document.getElementById('csTrigger').querySelector('.cs-icon').textContent=c.code;
    activeCountry=id;
    track('select_country',{country:id});
    searchQuery='';
    F[id]={month:'all',type:'all',dist:'all'};

    // Show clear button in selector
    updateSelectorClear();

    // Show skeleton while building content
    const cc=document.getElementById('countryContent');
    cc.innerHTML=buildSkeleton();
    document.getElementById('sectionLine').style.display='block';
    cc.classList.add('active');
    document.getElementById('mainHeader').classList.add('visible');
    setTimeout(()=>cc.scrollIntoView({behavior:'smooth',block:'start'}),80);

    // Build real content after brief skeleton
    setTimeout(()=>buildCountryContent(id),300);
}

function clearCountry(){
    activeCountry=null;
    searchQuery='';
    document.getElementById('countryContent').classList.remove('active');
    document.getElementById('countryContent').innerHTML='';
    document.getElementById('sectionLine').style.display='none';
    const tr=document.getElementById('csTrigger');
    tr.querySelector('.cs-label').textContent=T[lang].selC;
    tr.querySelector('.cs-icon').textContent='↓';
    updateSelectorClear();
}

function updateSelectorClear(){
    const trigger=document.getElementById('csTrigger');
    let clearBtn=trigger.querySelector('.cs-clear');
    if(activeCountry){
        if(!clearBtn){
            clearBtn=document.createElement('button');
            clearBtn.className='cs-clear';
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

function buildCountryContent(id){
    const races=futureRaces(R[id]||[]);
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
    const races=futureRaces(R[id]||[]);
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
        const riOrig=(R[id]||[]).indexOf(r);
        const favId=r._id||id+'_'+riOrig;
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
        const fc=r._id?getFavCount(r._id):0;
        const fcHTML=fc>0?`<div class="race-fav-count"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>${fc}</div>`:'';
        h+=`<div class="race-card${ic}" onclick="openDrawer('${id}',${riOrig})" style="display:${ok?'block':'none'};animation:cardStagger .45s var(--ease) forwards ${0.05*Math.min(vis,20)}s;opacity:0">${bg}${favBtn}${fcHTML}<div class="race-date">${ds} ${statusBadge} ${srcBadge}</div><h3 class="race-name">${r.n}</h3><p class="race-loc">${r.l}</p><div class="race-tags">${tgs}</div></div>`;
    });
    h+='</div>';
    if(!vis)h+=`<div class="no-results"><svg class="no-results-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="28" cy="28" r="18"/><line x1="40.5" y1="40.5" x2="56" y2="56" stroke-width="2.5" stroke-linecap="round"/><path d="M20 28h16" stroke-linecap="round"/><circle cx="28" cy="28" r="24" stroke-dasharray="4 6" opacity="0.2"/></svg><div class="no-results-text">${t.noT}</div><div class="no-results-hint">${t.noH}</div><button class="no-results-cta" onclick="fM('${id}','all');fT('${id}','all');fD('${id}','all');clearSearch('${id}');buildCountryContent('${id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 109-9"/><polyline points="3 3 3 7 7 7"/></svg>${t.noReset||'Limpiar filtros'}</button></div>`;
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
    updateSelectorClear();
    window.scrollTo({top:0,behavior:'instant'});
}

/* ============================================
   RACE DRAWER
   ============================================ */
function openDrawer(countryId, raceIdx){
    const r=R[countryId][raceIdx];
    if(!r)return;
    track('view_race',{race_name:r.n,country:countryId});
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
                <span>${isFav?t.benefitFav:t.benefitFav}</span>
            </button>
            <button class="drawer-action-btn" onclick="addToCalendar('${countryId}',${raceIdx})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg>
                <span>${t.benefitCal}</span>
            </button>
            <button class="drawer-action-btn" onclick="shareRace('${countryId}',${raceIdx})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                <span>${t.share||'Compartir'}</span>
            </button>
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

    // Favorites count in drawer
    const drawerFavCount=r._id?getFavCount(r._id):0;
    const drawerFavCountHTML=drawerFavCount>0?`<div class="drawer-fav-count"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg><span>${drawerFavCount} ${drawerFavCount===1?t.oneRunnerInterested:t.runnersInterested}</span></div>`:'';

    // Reviews section (loads async)
    const reviewsContainerId='drawerReviews_'+Date.now();
    const reviewsSectionHTML=`<div class="drawer-reviews" id="${reviewsContainerId}"></div>`;

    document.getElementById('drawerBody').innerHTML+=`
        ${drawerFavCountHTML}
        ${reviewsSectionHTML}
    `;

    // Load reviews async
    loadAndRenderReviews(r._id||null, countryId, raceIdx, reviewsContainerId, isPast);

    document.getElementById('drawerOverlay').classList.add('open');
    document.getElementById('drawer').classList.add('open');
    document.body.style.overflow='hidden';

    // Push URL for sharing
    const raceSlug=slugify(r.n);
    history.replaceState({country:countryId,race:raceIdx},'',`#${countryId}/${raceSlug}`);
}

function closeDrawer(){
    document.getElementById('drawerOverlay').classList.remove('open');
    document.getElementById('drawer').classList.remove('open');
    document.body.style.overflow='';
    if(location.hash)history.replaceState(null,'',location.pathname);
}

function shareRace(countryId, raceIdx){
    const opts=document.getElementById('shareOptions');
    if(opts) opts.style.display = opts.style.display==='none'?'flex':'none';
}

function copyRaceInfo(countryId, raceIdx){
    const r=R[countryId][raceIdx];
    if(!r)return;
    const c=countries.find(x=>x.id===countryId);
    const locale=lang==='pt'?'pt-BR':lang==='en'?'en-US':'es-ES';
    const dt=new Date(r.d);
    const dateStr=dt.toLocaleDateString(locale,{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    const t=T[lang];
    let text=`${r.n}\n${r.l}, ${c.name}\n${dateStr}\n${r.c.join(' · ')}`;
    if(r.w) text+=`\n${r.w}`;
    text+=`\n\n— PULZ · ${t.ftTagline||'La plataforma runner de Sudamérica'}`;
    navigator.clipboard.writeText(text).then(()=>{
        const btn=document.querySelector('#shareOptions .share-opt:last-child');
        if(btn){
            const orig=btn.innerHTML;
            btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> '+(t.copied||'¡Copiado!');
            setTimeout(()=>{btn.innerHTML=orig},1500);
        }
    });
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

/* ============================================
   CUSTOM CURSOR
   ============================================ */
(function(){
    const dot=document.getElementById('cursorDot');
    const ring=document.getElementById('cursorRing');
    if(!dot||!ring)return;

    // Only on non-touch devices
    if(window.matchMedia('(hover:none)').matches)return;

    let mx=0,my=0,dx=0,dy=0;
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
    });

    // Ring follows with smooth lag
    function animate(){
        ringX+=(mx-ringX)*0.15;
        ringY+=(my-ringY)*0.15;
        ring.style.left=ringX+'px';
        ring.style.top=ringY+'px';
        requestAnimationFrame(animate);
    }
    animate();

    // Hover state on interactive elements
    const hoverSelectors='a,button,.race-card,.co,.cs-trigger,.lang-btn,.benefit-card,.filter-btn,.month-btn,.auth-btn-ghost,.auth-btn-header,.benefits-cta,.drawer-action-btn,.share-opt,.ft-link,.no-results-cta,.cs-clear,.hero-country,.org-feature,.org-stat,.org-cta';
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
    const observer=new IntersectionObserver((entries)=>{
        entries.forEach(e=>{
            if(e.isIntersecting){
                e.target.classList.add('in-view');
            }
        });
    },{threshold:0.1,rootMargin:'0px 0px -30px 0px'});

    // Runners benefits
    const benefitsInner=document.querySelector('.benefits-inner');
    if(benefitsInner){
        benefitsInner.querySelectorAll(':scope > *').forEach(child=>observer.observe(child));
    }

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
})();

/* ============================================
   REVIEWS — Load & render in drawer
   ============================================ */
async function loadAndRenderReviews(raceId, countryId, raceIdx, containerId, isPast){
    const container=document.getElementById(containerId);
    if(!container)return;
    const t=T[lang];
    const r=R[countryId][raceIdx];

    // Only show review form for past races
    let formHTML='';
    if(isPast){
        if(currentUser){
            const cats=r.c.map(c=>`<option value="${c}">${c}</option>`).join('');
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
                    <button class="review-submit" id="reviewSubmitBtn_${containerId}" onclick="handleReviewSubmit('${raceId}','${containerId}')" disabled>${t.reviewSubmit}</button>
                </div>`;
        } else {
            formHTML=`<button class="review-login-btn" onclick="openAuthModal('login')">${t.reviewLogin}</button>`;
        }
    }

    // If no raceId (hardcoded data), show empty state
    if(!raceId||!supabase){
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
        const name=rev.display_name||'Runner';
        const initial=name[0].toUpperCase();
        const date=new Date(rev.created_at).toLocaleDateString(lang==='pt'?'pt-BR':lang==='en'?'en-US':'es-ES',{day:'numeric',month:'short',year:'numeric'});
        const catBadge=rev.category?`<span class="review-cat-badge">${rev.category}</span>`:'';
        const timeBadge=rev.finish_time?`<span class="review-time-badge">${rev.finish_time}</span>`:'';
        const commentHTML=rev.comment?`<p class="review-comment">${rev.comment}</p>`:'';
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

async function handleReviewSubmit(raceId,containerId){
    if(!raceId||raceId==='null'||!selectedRating)return;
    const cat=document.getElementById(`reviewCat_${containerId}`)?.value||'';
    const time=document.getElementById(`reviewTime_${containerId}`)?.value?.trim()||'';
    const comment=document.getElementById(`reviewComment_${containerId}`)?.value?.trim()||'';
    const btn=document.getElementById(`reviewSubmitBtn_${containerId}`);
    if(btn){btn.disabled=true;btn.textContent='...';}
    await submitReview(raceId,selectedRating,cat,time,comment);
    selectedRating=0;
    // Refresh drawer reviews
    const container=document.getElementById(containerId);
    if(container){
        const section=container.closest('.drawer');
        if(section){
            // Re-render reviews
            const reviews=await loadRaceReviews(raceId);
            // Simple reload by re-calling
            loadAndRenderReviews(raceId,null,null,containerId,true);
        }
    }
}

/* ============================================
   URL ROUTING — Handle shared race URLs
   ============================================ */
function handleHashRoute(){
    const hash=location.hash.replace('#','');
    if(!hash)return;
    const parts=hash.split('/');
    if(parts.length<2)return;
    const countryId=parts[0];
    const raceSlug=parts.slice(1).join('/');

    // Find the country
    const country=countries.find(c=>c.id===countryId);
    if(!country)return;

    // Select country first
    if(activeCountry!==countryId){
        selC(countryId);
    }

    // Find race by slug match
    const races=R[countryId]||[];
    const raceIdx=races.findIndex(r=>slugify(r.n)===raceSlug);
    if(raceIdx>-1){
        // Wait for country content to build, then open drawer
        setTimeout(()=>openDrawer(countryId,raceIdx),500);
    }
}

// Handle hash on page load and on back/forward
window.addEventListener('hashchange',handleHashRoute);
window.addEventListener('load',()=>setTimeout(handleHashRoute,600));
