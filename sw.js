/* Service worker: caches the app so it opens and works without internet.
   Bump VERSION whenever you change any file, so phones pick up the update. */
const VERSION='juz30-v1';
const FILES=['./','index.html','manifest.webmanifest','fonts/amiri-regular.woff2',
  'icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/apple-touch-icon.png','icons/favicon-32.png'];

self.addEventListener('install',function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){
    return Promise.all(FILES.map(function(f){return c.add(f).catch(function(){});}));
  }).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==VERSION;}).map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(function(hit){
    if(hit)return hit;
    return fetch(req).then(function(res){
      if(res&&res.ok){var copy=res.clone();caches.open(VERSION).then(function(c){c.put(req,copy);});}
      return res;
    }).catch(function(){
      if(req.mode==='navigate')return caches.match('index.html');
      return Response.error();
    });
  }));
});
