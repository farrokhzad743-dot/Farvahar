const CACHE_NAME="faravahar-shell-v2";
const SHELL=["/","/index.html","/styles.css","/app.js","/manifest.webmanifest","/assets/faravahar.svg"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
  const req=event.request, u=new URL(req.url);
  if(req.method!=="GET"||u.origin!==location.origin||u.pathname.startsWith("/api/")) return;
  event.respondWith((async()=>{
    const cached=await caches.match(req);
    if(cached) return cached;
    try {
      const res=await fetch(req);
      if(res.ok){const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put(req,copy));}
      return res;
    } catch {
      if(req.mode==="navigate") return (await caches.match("/index.html")) || Response.error();
      return Response.error();
    }
  })());
});
