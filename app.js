const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const demoNews = [
 {id:"f1", important:true, category:"ایران", source:"تحریریه فروهر", title:"نمونه خبر منتخب برای نمایش ساختار صفحه اصلی فروهر", summary:"این متن صرفاً محتوای آزمایشی رابط کاربری است. پس از اتصال منابع خبری، اطلاعات واقعی همراه با زمان انتشار و لینک منبع نمایش داده می‌شود.", publishedAt:Date.now()-8*60000, body:"این یک خبر نمونه است و گزارش واقعی محسوب نمی‌شود. برای انتشار عمومی باید متن از منبع مجاز دریافت شود، زمان اصلی آن ثبت شود و حداقل پنج دقیقه پس از انتشار منبع در دسترس کاربران قرار گیرد."},
 {id:"f2", important:true, category:"اقتصاد", source:"نموذج اقتصادی", title:"نمایش نمونه خبر اقتصادی با تأکید بر منبع و زمان", summary:"کارت خبر مهم از سایر خبرها متمایز است، اما خبرهای عادی همچنان بر اساس ترتیب زمانی نمایش داده می‌شوند.", publishedAt:Date.now()-14*60000, body:"محتوای نمایشی. برای نرخ‌های مالی باید منبع، واحد پول، زمان به‌روزرسانی و روش تبدیل مشخص باشد."},
 {id:"f3", important:false, category:"فناوری", source:"نمونه فناوری", title:"فناوری؛ نمونه‌ای برای بررسی خوانایی تیترهای طولانی در موبایل", summary:"نمایش خلاصه خبر در این فهرست قابل خاموش کردن است.", publishedAt:Date.now()-18*60000, body:"متن نمایشی خبر فناوری. خبر واقعی پس از دریافت و اعتبارسنجی از منبع مجاز اضافه خواهد شد."},
 {id:"f4", important:false, category:"جهان", source:"نمونه جهان", title:"جهان؛ قالب استاندارد برای خبرهای بین‌المللی", summary:"منبع اصلی و زمان انتشار در جزئیات خبر نمایش داده می‌شود.", publishedAt:Date.now()-26*60000, body:"متن نمایشی خبر جهان. این برنامه هنوز به منبع زنده متصل نیست."},
 {id:"f5", important:false, category:"ورزش", source:"نمونه ورزش", title:"ورزش؛ نمونه خبر با چیدمان راست‌چین و نمایش زمان", summary:"ساختار فهرست برای نمایش دسته‌بندی‌های مختلف آماده شده است.", publishedAt:Date.now()-38*60000, body:"متن آزمایشی. برای افزودن اخبار زنده باید API یا RSS منابع تنظیم شود."},
 {id:"f6", important:false, category:"ایران", source:"نمونه ایران", title:"ایران؛ خبر نمونه دیگر برای بررسی ترتیب زمانی", summary:"خبرهای تکراری باید در لایه دریافت با شناسه یا هش محتوا شناسایی شوند.", publishedAt:Date.now()-50*60000, body:"متن نمایشی خبر. محتوای نهایی باید لینک منبع را همراه داشته باشد."}
];
let selectedCategory="همه", saved=new Set(JSON.parse(localStorage.getItem("faravahar-saved")||"[]"));
let summaryVisible=localStorage.getItem("faravahar-summary")!=="false";
const faNumber = n => new Intl.NumberFormat("fa-IR").format(n);
const timeAgo = ts => { const m=Math.max(1,Math.floor((Date.now()-ts)/60000)); return m<60?`${faNumber(m)} دقیقه پیش`:`${faNumber(Math.floor(m/60))} ساعت پیش`; };
function setTheme(theme){const actual=theme==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):theme;document.documentElement.dataset.theme=actual;localStorage.setItem("faravahar-theme",theme);$("#themeSelect").value=theme;}
function render(){
 const query=$("#searchInput").value.trim().toLocaleLowerCase("fa");
 const visible=demoNews.filter(n=>(selectedCategory==="همه"||n.category===selectedCategory)&&`${n.title} ${n.summary} ${n.source}`.toLocaleLowerCase("fa").includes(query));
 const important=visible.filter(n=>n.important);
 $("#importantCount").textContent=`${faNumber(important.length)} خبر`;
 $("#importantNews").innerHTML=important.map((n,i)=>`<button class="featured-card ${i===0?"primary":""}" data-open="${n.id}"><span class="tag">${n.category} · مهم</span><h3>${n.title}</h3><p class="feature-summary">${n.summary}</p><div class="news-meta"><span>${n.source}</span><span>${timeAgo(n.publishedAt)}</span></div></button>`).join("")||'<p class="subhead">خبر مهمی مطابق جست‌وجو پیدا نشد.</p>';
 const ordinary=visible.filter(n=>!n.important).sort((a,b)=>b.publishedAt-a.publishedAt);
 $("#newsList").innerHTML=ordinary.map(n=>`<article class="news-card" data-open="${n.id}"><div class="news-symbol">${n.category==="اقتصاد"?"↗":n.category==="فناوری"?"⌘":n.category==="ورزش"?"◉":"✦"}</div><div class="news-body"><h3>${n.title}</h3>${summaryVisible?`<p>${n.summary}</p>`:""}<div class="news-actions"><div class="news-meta"><span>${n.source}</span><span>${timeAgo(n.publishedAt)}</span></div><button class="save-button ${saved.has(n.id)?"saved":""}" data-save="${n.id}" aria-label="ذخیره خبر">${saved.has(n.id)?"★":"☆"}</button></div></div></article>`).join("");
 $("#emptyState").classList.toggle("hidden",visible.length>0);
 $$("[data-open]").forEach(el=>el.addEventListener("click",e=>{if(e.target.closest("[data-save]"))return;openArticle(el.dataset.open)}));
 $$("[data-save]").forEach(el=>el.addEventListener("click",e=>{e.stopPropagation();const id=el.dataset.save;saved.has(id)?saved.delete(id):saved.add(id);localStorage.setItem("faravahar-saved",JSON.stringify([...saved]));render();}));
}
function openArticle(id){const n=demoNews.find(x=>x.id===id);if(!n)return;$("#articleContent").innerHTML=`<span class="tag">${n.category}${n.important?" · خبر مهم":""}</span><h1 class="article-title">${n.title}</h1><div class="news-meta"><span>${n.source}</span><span>${timeAgo(n.publishedAt)}</span></div><p class="article-text">${n.body}</p><p class="demo-note">این محتوا نمونه است. لینک منبع اصلی پس از اتصال منابع خبری نمایش داده می‌شود.</p><button class="primary-button" id="articleSave">${saved.has(n.id)?"حذف از ذخیره‌شده‌ها":"ذخیره خبر"}</button>`;$("#articleDialog").showModal();$("#articleSave").onclick=()=>{saved.has(n.id)?saved.delete(n.id):saved.add(n.id);localStorage.setItem("faravahar-saved",JSON.stringify([...saved]));$("#articleSave").textContent=saved.has(n.id)?"حذف از ذخیره‌شده‌ها":"ذخیره خبر";render();};}
$("#todayLabel").textContent=new Intl.DateTimeFormat("fa-IR",{weekday:"long",day:"numeric",month:"long"}).format(new Date());
$("#searchInput").addEventListener("input",render);
$$(".category").forEach(b=>b.addEventListener("click",()=>{selectedCategory=b.dataset.category;$$(".category").forEach(x=>x.classList.toggle("active",x===b));render();}));
$("#themeToggle").onclick=()=>setTheme(document.documentElement.dataset.theme==="dark"?"light":"dark");
$("#settingsToggle").onclick=()=>$("#settingsDialog").showModal();
$("#closeSettings").onclick=()=>$("#settingsDialog").close();
$("#closeArticle").onclick=()=>$("#articleDialog").close();
$("#closeTranslate").onclick=()=>$("#translateDialog").close();
$("#apiBaseInput").value=localStorage.getItem("faravahar-api-base")||"";
function apiUrl(path){
 const configured=(localStorage.getItem("faravahar-api-base")||"").trim();
 if(configured){
   try { const u=new URL(configured); if(u.protocol!=="https:") throw new Error(); return new URL(path,u.origin).toString(); }
   catch { throw new Error("نشانی سرور باید یک آدرس معتبر HTTPS باشد."); }
 }
 if((location.protocol==="http:"||location.protocol==="https:") && location.hostname!=="localhost") return new URL(path,location.origin).toString();
 if(location.hostname==="localhost") throw new Error("برای نسخه اندروید ابتدا نشانی HTTPS سرور API را در تنظیمات وارد کنید.");
 throw new Error("برای نسخه اندروید ابتدا نشانی HTTPS سرور API را در تنظیمات وارد کنید.");
}
$("#saveSettings").onclick=()=>{
 const raw=$("#apiBaseInput").value.trim();
 if(raw){try{const u=new URL(raw);if(u.protocol!=="https:")throw new Error();localStorage.setItem("faravahar-api-base",u.origin);}catch{$("#apiBaseInput").setCustomValidity("نشانی باید HTTPS معتبر باشد.");$("#apiBaseInput").reportValidity();return;}}
 else localStorage.removeItem("faravahar-api-base");
 $("#apiBaseInput").setCustomValidity("");
 summaryVisible=$("#summaryToggle").checked;localStorage.setItem("faravahar-summary",String(summaryVisible));setTheme($("#themeSelect").value);$("#settingsDialog").close();render();
};
$("#summaryToggle").checked=summaryVisible;
$$("[data-nav]").forEach(b=>b.addEventListener("click",()=>{ $$("[data-nav]").forEach(x=>x.classList.toggle("selected",x===b));if(b.dataset.nav==="settings")$("#settingsDialog").showModal();else if(b.dataset.nav==="translate")$("#translateDialog").showModal();else if(b.dataset.nav==="saved"){const ids=new Set(saved);$("#searchInput").value="";selectedCategory="همه";render();$("#newsList").innerHTML=demoNews.filter(n=>ids.has(n.id)).map(n=>`<article class="news-card" data-open="${n.id}"><div class="news-symbol">☆</div><div class="news-body"><h3>${n.title}</h3><div class="news-meta">${n.source}</div></div></article>`).join("")||'<p class="subhead">هنوز خبری ذخیره نکرده‌اید.</p>';$("#emptyState").classList.add("hidden");}else{render();window.scrollTo({top:0,behavior:"smooth"});}}));
$("#translateButton").onclick=async()=>{const input=$("#translateInput").value.trim();const out=$("#translateOutput");if(!input){out.textContent="ابتدا متن را وارد کنید.";return;}out.textContent="در حال بررسی سرویس ترجمه…";try{const res=await fetch(apiUrl("/api/translate"),{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({text:input,targetLanguage:"Persian"})});const data=await res.json();if(!res.ok)throw new Error(data.error||"سرویس ترجمه تنظیم نشده است.");out.textContent=data.translation||"پاسخ ترجمه خالی بود.";}catch(e){out.textContent="سرویس ترجمه هنوز فعال نشده است. برای فعال‌سازی، راهنمای README را ببینید. ("+e.message+")";}};
async function loadRate(){try{const r=await fetch(apiUrl("/api/exchange-rate"));if(!r.ok)throw Error();const d=await r.json();if(d.currency==="IRR"&&Number.isFinite(d.usdIrr)){ $("#usdValue").textContent=faNumber(Math.round(d.usdIrr));$("#rateStatus").textContent=`به‌روزرسانی: ${d.updatedAt||"نامشخص"} · منبع: ${d.source||"نامشخص"}`;return;}}catch{}$("#usdValue").textContent="—";$("#rateStatus").textContent="منبع نرخ ارز هنوز تنظیم نشده";}
setTheme(localStorage.getItem("faravahar-theme")||"system");render();loadRate();
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register(new URL("./sw.js", document.baseURI)).catch(()=>{}));
