const CACHE='pulz-v18';
const ASSETS=[
  '/',
  '/index.html',
  '/css/style.css',
  '/js/i18n.js',
  '/js/auth.js',
  '/js/data.js',
  '/js/app.js',
  '/img/favicon.svg',
  '/img/favicon-32.png',
  '/img/icon-192.png',
  '/img/icon-512.png',
  '/img/apple-touch-icon.png',
  '/img/og-share.png',
  '/favicon.ico',
  '/manifest.json',
  '/privacy.html',
  '/terms.html',
  '/404.html'
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

// Fetch — network first, fallback to cache, then offline fallback
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  // Skip external requests (analytics, supabase, fonts CDN)
  if(!e.request.url.startsWith(self.location.origin))return;

  // HTML/navigation: always go to network, never cache the response.
  // Prevents stale shell pointing to old asset URLs after a deploy.
  const isHtml=e.request.mode==='navigate'||(e.request.headers.get('accept')||'').includes('text/html');

  e.respondWith(
    fetch(e.request).then(res=>{
      if(res.ok&&!isHtml){const clone=res.clone();caches.open(CACHE).then(c=>c.put(e.request,clone));}
      return res;
    }).catch(()=>
      caches.match(e.request).then(cached=>{
        if(cached)return cached;
        // Offline fallback for navigation: last known index
        if(isHtml)return caches.match('/index.html');
        return cached;
      })
    )
  );
});
