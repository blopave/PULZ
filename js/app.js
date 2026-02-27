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
    sorted.forEach(r=>{
        const dt=new Date(r.d),mo=dt.getMonth(),dc=distCat(r.c);
        const ok=(month==='all'||mo===month)&&(type==='all'||r.t===type)&&(dist==='all'||dist===dc);
        if(ok)vis++;
        const ds=dt.toLocaleDateString(locale,{day:'numeric',month:'short',year:'numeric'}).toUpperCase();
        const tgs=r.c.map(c=>`<span class="tag ${tagCls(c)}">${c}</span>`).join('');
        const lk=r.w?`<a href="${r.w}" target="_blank" class="race-link">${t.more}</a>`:`<span class="race-link off">${t.soon}</span>`;
        const ic=r.i?' iconic':'';
        const bg=r.i?`<div class="iconic-badge">★ ${t.iconic}</div>`:'';
        h+=`<div class="race-card${ic}" style="display:${ok?'block':'none'};animation:fadeUp .4s ease forwards ${0.03*Math.min(vis,25)}s;opacity:0">${bg}<div class="race-date">${ds}</div><h3 class="race-name">${r.n}</h3><p class="race-loc">${r.l}</p><div class="race-tags">${tgs}</div>${lk}</div>`;
    });
    h+='</div>';
    if(!vis)h+=`<div class="no-results"><div class="no-results-text">${t.noT}</div><div class="no-results-hint">${t.noH}</div></div>`;
    document.getElementById('race-list').innerHTML=h;
}

function fM(id,m){F[id].month=m;buildCountryContent(id)}
function fT(id,t){F[id].type=t;buildCountryContent(id)}
function fD(id,d){F[id].dist=d;buildCountryContent(id)}

function goHome(){
    activeCountry=null;
    document.getElementById('countryContent').classList.remove('active');
    document.getElementById('countryContent').innerHTML='';
    document.getElementById('sectionLine').style.display='none';
    const tr=document.getElementById('csTrigger');
    tr.querySelector('.cs-label').textContent=T[lang].selC;
    tr.querySelector('.cs-icon').textContent='↓';
    window.scrollTo({top:0,behavior:'instant'});
}

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
