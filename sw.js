const CACHE='my-books-v10';
const PATCH=`<script>
function home(){
  const reading=books.filter(b=>b.status==='Reading');
  const recent=books.filter(b=>b.dateAdded && Date.now()-new Date(b.dateAdded).getTime()<=2592000000).sort((a,b)=>new Date(b.dateAdded)-new Date(a.dateAdded)).slice(0,5);
  const five=books.filter(b=>Number(b.rating)===5);
  const finished=books.filter(b=>b.status==='Finished');
  const section=(title,items,limit)=>'<div class="sec"><div class="st"><h2>'+title+'</h2></div>'+(items.length?'<div class="row">'+items.slice(0,limit).map(card).join('')+'</div>':'<p class="meta">No books here yet.</p>')+'</div>';
  homebody.innerHTML=section('Currently Reading',reading,3)+section('Recently Added',recent,5)+section('5 Stars',five,3)+section("Books I’ve Read",finished,6);
}
home();
<\/script>`;
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./manifest.webmanifest'])))});
self.addEventListener('activate',e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))])));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);
 if(u.origin===location.origin&&(u.pathname.endsWith('/')||u.pathname.endsWith('/index.html'))){
   e.respondWith(fetch(e.request,{cache:'no-store'}).then(async r=>{
     let html=await r.text();
     html=html.replace('</body>',PATCH+'</body>');
     return new Response(html,{status:r.status,statusText:r.statusText,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}})
   }).catch(()=>caches.match('./index.html')));return;
 }
 e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});