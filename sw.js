const CACHE='pulz-v7';
const ASSETS=[
  '/',
  '/index.html',
  '/css/style.css',
  '/js/i18n.js',
  '/js/auth.js',
  '/js/data.js',
  '/js/app.js',
  '/img/favicon.svg',
  '/img/icon-192.png',
  '/img/icon-512.png',
  '/manifest.json'
];

// Install — cache core assets
self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
    ).then(()=>self.clients.claim())
  );
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  // Skip external requests (analytics, supabase, fonts CDN)
  if(!e.request.url.startsWith(self.location.origin))return;

  e.respondWith(
    fetch(e.request).then(res=>{
      if(res.ok){const clone=res.clone();caches.open(CACHE).then(c=>c.put(e.request,clone));}
      return res;
    }).catch(()=>caches.match(e.request))
  );
});
