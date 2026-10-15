const CACHE='my-books-v14';
const PATCH=`<style>
.detailTabs,.tabs{display:grid!important;grid-template-columns:repeat(3,1fr)!important;background:#efede8!important;border-radius:20px!important;overflow:hidden!important;border:0!important;margin:16px 0 24px!important}.detailTabs button,.tabs button{border:0!important;background:transparent!important;padding:15px 8px!important;font-size:16px!important;cursor:pointer!important;pointer-events:auto!important;position:relative!important;z-index:5!important}.detailTabs button.on,.tabs button.on{background:#fff!important;border-radius:20px!important;box-shadow:0 5px 16px #00000012!important}.detailTop{display:grid;grid-template-columns:130px 1fr;gap:20px;align-items:center;padding:10px 0 18px}.detailTop .cover{width:130px}.detailHead{display:flex;align-items:center;justify-content:space-between}.detailHead h1{font:700 27px Georgia,serif}.noteBox{background:#fffdf8;border-radius:18px;padding:20px;min-height:165px}.drow{display:grid;grid-template-columns:120px 1fr;padding:17px 12px;border-bottom:1px solid #e6dfd5}.drow span:first-child{color:#777}.aboutCopy{font-size:16px;line-height:1.6}
</style><script>
(function(){
 function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
 function tabs(active){return '<div class="detailTabs" data-book-tabs><button data-tab="about" class="'+(active==='about'?'on':'')+'">About</button><button data-tab="notes" class="'+(active==='notes'?'on':'')+'">Notes</button><button data-tab="details" class="'+(active==='details'?'on':'')+'">Details</button></div>'}
 function bookHead(b,title,plus){return '<div class="detailHead"><button class="btn" data-tab="about">‹</button><h1>'+title+'</h1>'+(plus?'<button class="btn" id="notePlus" style="font-size:28px">＋</button>':'<span></span>')+'</div><div class="detailTop"><img class="cover" src="'+esc(b.cover||'')+'"><div><h2 style="font-family:-apple-system,BlinkMacSystemFont,Arial;margin:0 0 5px">'+esc(b.title)+'</h2><div class="meta">'+esc(b.author)+'</div></div></div>'}
 window.showBookTab=function(tab){
  var b=window.current;if(!b||!window.detailbody)return;
  if(tab==='notes') detailbody.innerHTML=bookHead(b,'Notes',true)+tabs('notes')+'<div class="noteBox"><h3>My Notes</h3><div class="aboutCopy">'+(b.notes?esc(b.notes):'No notes yet. Tap + to add notes.')+'</div></div>';
  else if(tab==='details') detailbody.innerHTML=bookHead(b,'Details',false)+tabs('details')+'<div>'+[['Genre',b.genre],['Status',b.status],['My Rating',b.rating?'★'.repeat(Number(b.rating))+'☆'.repeat(5-Number(b.rating)):'☆☆☆☆☆'],['ISBN',b.isbn||'—'],['Published',b.published||'—'],['Pages',b.pages||'—'],['Date Added',b.dateAdded?new Date(b.dateAdded).toLocaleDateString():'—'],['Date Read',b.dateRead?new Date(b.dateRead).toLocaleDateString():'—']].map(x=>'<div class="drow"><span>'+x[0]+'</span><span>'+esc(x[1])+'</span></div>').join('')+'</div>';
  else { if(typeof window.renderBook==='function') return window.renderBook('about'); if(typeof window.detail==='function') return window.detail('about'); }
 };
 document.addEventListener('click',function(e){
  var t=e.target.closest('[data-tab]');
  if(t){e.preventDefault();e.stopImmediatePropagation();showBookTab(t.dataset.tab);return}
  var p=e.target.closest('#notePlus');if(p){e.preventDefault();e.stopImmediatePropagation();var v=prompt('My Notes',window.current?.notes||'');if(v!==null&&window.current){window.current.notes=v;if(typeof save==='function')save();showBookTab('notes')}return}
  var btn=e.target.closest('.detailTabs button,.tabs button');if(btn&&document.getElementById('detail')?.classList.contains('on')){var tx=btn.textContent.trim().toLowerCase();if(['about','notes','details'].includes(tx)){e.preventDefault();e.stopImmediatePropagation();showBookTab(tx)}}
 },true);
 var observer=new MutationObserver(function(){var d=document.getElementById('detailbody');if(!d)return;var old=d.querySelector('.tabs:not([data-book-tabs]),.detailTabs:not([data-book-tabs])');if(old){var active=[...old.querySelectorAll('button')].find(x=>x.classList.contains('on'))?.textContent.trim().toLowerCase()||'about';old.outerHTML=tabs(active)}});
 setTimeout(function(){var d=document.getElementById('detailbody');if(d)observer.observe(d,{childList:true,subtree:true})},100);
})();
<\/script>`;
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE))});
self.addEventListener('activate',e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))])));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin===location.origin&&(u.pathname.endsWith('/')||u.pathname.endsWith('/index.html'))){e.respondWith(fetch(e.request,{cache:'no-store'}).then(async r=>{let h=await r.text();h=h.replace('</body>',PATCH+'</body>');return new Response(h,{status:r.status,statusText:r.statusText,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}})}));return}e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request)))});