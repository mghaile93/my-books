const CACHE='my-books-v11';
const PATCH=`<style>
#home .sec{margin:30px 0 42px}#home .st{margin-bottom:14px}#home .st h2{font-size:27px;margin:0}#home .row{grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}#home .title{font-size:13px;line-height:1.15;margin-top:7px}#home .author{font-size:11px}#home .link{font-size:13px;font-weight:700;color:#18221f}#home .cover{border-radius:6px}.coverFallback{display:flex;align-items:center;justify-content:center;text-align:center;padding:10px;background:#eee9df;color:#4d4a44;font:700 12px Georgia,serif;line-height:1.2}
</style><script>
function safeText(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function placeholder(el,b){const d=document.createElement('div');d.className='cover coverFallback';d.textContent=b.title;el.replaceWith(d)}
async function cover(el){
 const b=books.find(x=>x.id===el.dataset.id);if(!b||el.dataset.loading)return;el.dataset.loading='1';
 const set=u=>{b.cover=u;save();el.onerror=()=>placeholder(el,b);el.src=u};
 try{
  let qs='title='+encodeURIComponent(b.title)+'&author='+encodeURIComponent(b.author||'');
  let j=await fetch('https://openlibrary.org/search.json?limit=5&fields=cover_i,isbn,first_publish_year,number_of_pages_median&'+qs).then(r=>r.json());
  let d=(j.docs||[]).find(x=>x.cover_i)||j.docs?.[0];
  if(d?.cover_i){if(!b.isbn)b.isbn=(d.isbn||[]).find(x=>String(x).length===13)||(d.isbn||[])[0]||'';b.published=b.published||d.first_publish_year||'';b.pages=b.pages||d.number_of_pages_median||'';set('https://covers.openlibrary.org/b/id/'+d.cover_i+'-L.jpg');return}
 }catch(e){}
 try{
  let q='intitle:'+b.title+(b.author?' inauthor:'+b.author:'');let j=await fetch('https://www.googleapis.com/books/v1/volumes?maxResults=5&q='+encodeURIComponent(q)).then(r=>r.json());
  let v=(j.items||[]).map(x=>x.volumeInfo).find(x=>x.imageLinks?.thumbnail||x.imageLinks?.smallThumbnail);
  if(v){let u=(v.imageLinks.thumbnail||v.imageLinks.smallThumbnail).replace('http:','https:').replace('&edge=curl','');if(!b.isbn)b.isbn=(v.industryIdentifiers||[]).find(x=>x.type==='ISBN_13')?.identifier||(v.industryIdentifiers||[])[0]?.identifier||'';b.published=b.published||v.publishedDate||'';b.pages=b.pages||v.pageCount||'';set(u);return}
 }catch(e){}
 placeholder(el,b)
}
function card(b){const src=b.cover?safeText(b.cover):'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';return '<div class="book" onclick="openBook(\''+b.id+'\')"><img class="cover" data-id="'+b.id+'" src="'+src+'" onload="if(!this.dataset.checked&&!books.find(x=>x.id===this.dataset.id)?.cover){this.dataset.checked=1;cover(this)}" onerror="cover(this)"><div class="title">'+safeText(b.title)+'</div><div class="author">'+safeText(b.author)+'</div></div>'}
function home(){
 const reading=books.filter(b=>b.status==='Reading');
 const recent=books.filter(b=>b.dateAdded&&Date.now()-new Date(b.dateAdded).getTime()<=2592000000).sort((a,b)=>new Date(b.dateAdded)-new Date(a.dateAdded)).slice(0,5);
 const five=books.filter(b=>Number(b.rating)===5);
 const finished=books.filter(b=>b.status==='Finished');
 const section=(title,items,limit)=>'<div class="sec"><div class="st"><h2>'+title+'</h2>'+(items.length?'<button class="link" onclick="event.stopPropagation();showShelf(\''+title.replace(/'/g,"\\'")+'\')">See All ›</button>':'')+'</div>'+(items.length?'<div class="row">'+items.slice(0,limit).map(card).join('')+'</div>':'<p class="meta">'+(title==='Recently Added'?'No books added in the last 30 days.':'No books here yet.')+'</p>')+'</div>';
 homebody.innerHTML=section('Currently Reading',reading,3)+section('Recently Added',recent,5)+section('5 Star Books',five,3)+section("Books I’ve Read",finished,6);
 setTimeout(()=>document.querySelectorAll('#home img.cover').forEach(x=>{if(!books.find(b=>b.id===x.dataset.id)?.cover)cover(x)}),50)
}
function showShelf(title){let a=title==='Currently Reading'?books.filter(b=>b.status==='Reading'):title==='Recently Added'?books.filter(b=>b.dateAdded&&Date.now()-new Date(b.dateAdded).getTime()<=2592000000):title==='5 Star Books'?books.filter(b=>Number(b.rating)===5):books.filter(b=>b.status==='Finished');ct.textContent=title;cg.innerHTML=a.map(card).join('');go('category')}
setTimeout(home,0);
<\/script>`;
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE))});
self.addEventListener('activate',e=>e.waitUntil(Promise.all([self.clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))])));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);
 if(u.origin===location.origin&&(u.pathname.endsWith('/')||u.pathname.endsWith('/index.html'))){e.respondWith(fetch(e.request,{cache:'no-store'}).then(async r=>{let html=await r.text();html=html.replace('</body>',PATCH+'</body>');return new Response(html,{status:r.status,statusText:r.statusText,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}})}));return}
 e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request)));
});