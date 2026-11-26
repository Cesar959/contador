/* Guarda o app no celular: abre rápido e funciona sem internet.
   Busca a versão nova na rede (até 3 s); se a rede estiver lenta ou fora, usa a cópia guardada. */
const CACHE='contador-v18';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;const url=new URL(req.url);
  if(url.origin!==location.origin){
    /* fontes do Google: guarda depois da primeira vez */
    if(/fonts\.(googleapis|gstatic)\.com/.test(url.host))e.respondWith(caches.open(CACHE).then(c=>c.match(req).then(r=>r||fetch(req).then(n=>{c.put(req,n.clone());return n}))));
    return}
  if(req.mode==='navigate'){
    e.respondWith(new Promise(resolve=>{let done=false;
      const fromCache=()=>caches.match('./index.html').then(r=>{if(!done&&r){done=true;resolve(r)}});
      const t=setTimeout(fromCache,3000);
      fetch(req).then(n=>{clearTimeout(t);caches.open(CACHE).then(c=>c.put('./index.html',n.clone()));if(!done){done=true;resolve(n)}})
        .catch(()=>{clearTimeout(t);caches.match('./index.html').then(r=>{if(!done){done=true;resolve(r||Response.error())}})})}));
    return}
  e.respondWith(caches.match(req).then(r=>r||fetch(req)))});
