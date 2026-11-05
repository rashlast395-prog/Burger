/* MotorMate Ghana storefront – shared shell + all pages (selected by <body data-page>) */
(function(){
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ls={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let DB,OFFLINE=false,cart=ls.get("mm_cart",{}),wish=ls.get("mm_wish",[]);
const S=()=>DB.settings,fmt=n=>S().currency+" "+Number(n).toLocaleString();
const url=u=>!u?"":/^(https?:|data:|\/)/.test(u)?u:"/"+u;
const byId=(a,id)=>a.find(x=>x.id===id);
const cat=id=>byId(DB.categories,id),brand=id=>byId(DB.brands,id),prod=id=>byId(DB.products,id);
const pct=p=>p.old>p.price?Math.round((1-p.price/p.old)*100):0;
const page=document.body.dataset.page;
const P=new URLSearchParams(location.search);

async function api(p,o={}){
 const h={"Content-Type":"application/json"},t=ls.get("mm_token",null);if(t)h.Authorization="Bearer "+t;
 const r=await fetch("/api"+p,{...o,headers:h,body:o.body?JSON.stringify(o.body):undefined});
 const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||"Something went wrong");return j;
}
window.MM={api,ls,esc};

/* ---------- visuals ---------- */
const GR=[["#3ad04a","#0b3d14"],["#2d8cff","#0a2a66"],["#ff9a3d","#7a2e00"],["#a06bff","#2a0f66"],["#ff5d7a","#5a0a1f"],["#19c2a3","#064d40"]];
function tile(catId,i){const c=cat(catId)||{icon:"box",name:""},g=GR[(i==null?(DB.categories.indexOf(c)):i)%6]||GR[0];
 return `<div class="tile" style="--g1:${g[0]};--g2:${g[1]}">${ic(c.icon,54)}<span style="font-weight:700;font-size:13px;padding:0 8px">${esc(c.name)}</span></div>`}
window.imgFail=el=>{const w=document.createElement("div");w.style.cssText="width:100%;height:100%";w.innerHTML=tile(el.dataset.cat);el.replaceWith(w.firstChild)};
const img=(src,catId,alt)=>src?`<img src="${esc(url(src))}" alt="${esc(alt||"")}" loading="lazy" data-cat="${esc(catId)}" onerror="imgFail(this)">`:tile(catId);
const flag=c=>c?`<img class="flag" src="https://flagcdn.com/w40/${esc(c)}.png" alt="" loading="lazy" onerror="this.style.display='none'">`:"";

function card(p){const o=pct(p),inW=wish.includes(p.id);
 return `<div class="card"><div class="pimg" data-go="${p.id}">${o?`<span class="off">${o}% Off</span>`:""}
 <button class="wishb ${inW?"on":""}" data-wish="${p.id}" aria-label="Add to wishlist">${ic("heart",18)}</button>${img(p.image,p.cat,p.name)}
 <button class="addbtn" data-add="${p.id}" aria-label="Add to cart" ${p.stock<=0?"disabled style='opacity:.4'":""}>${ic("cartplus",24)}</button></div>
 <div class="pname" data-go="${p.id}" title="${esc(p.name)}">${esc(p.name)}</div>
 <div class="price">${fmt(p.price)}${p.old>p.price?`<s>${fmt(p.old)}</s>`:""}</div>
 ${p.stock<=0?`<div class="oos">Out of stock</div>`:""}
 <div class="pts"><b>MOTORPOINTS</b> ${(p.price*S().pointsRate).toLocaleString()} Points</div></div>`}
const secHead=(t,right)=>`<div class="sec-head"><div><h2 class="sec-title">${esc(t)}</h2><div class="bar"><i></i><i></i><i></i></div></div>${right||""}</div>`;
const viewAll=u=>`<a class="viewall" href="${u}">View All ${ic("arrow",22)}</a>`;
const active=a=>a.filter(x=>x.active!==false);

function toast(m){let t=$("#toast");if(!t){t=document.createElement("div");t.id="toast";t.className="toast";document.body.appendChild(t)}t.textContent=m;t.classList.add("on");clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("on"),2200)}
const saveCart=()=>{ls.set("mm_cart",cart);badge()};
const cartCount=()=>Object.values(cart).reduce((a,b)=>a+b,0);
function badge(){const c=$("#cartCnt"),w=$("#wishCnt");if(c){c.textContent=cartCount();c.style.display=cartCount()?"flex":"none"}if(w){w.textContent=wish.length;w.style.display=wish.length?"flex":"none"}}
function addToCart(id,q){const p=prod(id);if(!p||p.stock<=0)return toast("Sorry, this part is out of stock");cart[id]=Math.min((cart[id]||0)+(q||1),Math.max(p.stock,1));saveCart();toast("Added to cart")}
function toggleWish(id){wish=wish.includes(id)?wish.filter(x=>x!==id):[...wish,id];ls.set("mm_wish",wish);badge();$$(`[data-wish="${id}"]`).forEach(b=>b.classList.toggle("on",wish.includes(id)));toast(wish.includes(id)?"Saved to wishlist":"Removed from wishlist")}

document.addEventListener("click",e=>{
 const a=e.target.closest("[data-add]");if(a){e.stopPropagation();return addToCart(a.dataset.add)}
 const w=e.target.closest("[data-wish]");if(w){e.stopPropagation();return toggleWish(w.dataset.wish)}
 const g=e.target.closest("[data-go]");if(g)return location.href="product.html?id="+g.dataset.go;
 if(e.target.closest("[data-req]")||(e.target.closest("a")||{}).hash==="#request"){e.preventDefault();return openReq()}
 const sc=e.target.closest("[data-scroll]");if(sc){const el=$("#"+sc.dataset.scroll);el.scrollBy({left:sc.dataset.dir*el.clientWidth*.8,behavior:"smooth"})}
 if(!e.target.closest(".navbar"))$(".mega")&&$(".mega").classList.remove("on");
});

/* ---------- shell ---------- */
function logo(){return `<a class="logo" href="index.html"><svg class="logo-mark" viewBox="0 0 52 46"><path d="M2 40V8l12 14L26 8l12 14L50 8v32h-9V24L26 40 11 24v16z" fill="#35a73b"/><circle cx="26" cy="9" r="4" fill="#000"/></svg><span><b>${esc(S().logoText)}</b><small>${esc(S().logoSub)}</small></span></a>`}
function theme(){const s=S();document.documentElement.style.setProperty("--green",s.green);document.documentElement.style.setProperty("--green-d",s.green);document.title=document.title.replace(/MotorMate Ghana/,s.name)}
function topbar(){const s=S(),msgs=[`${esc(s.topbarText)} <a class="tel" href="https://wa.me/${esc(s.whatsapp)}">${esc(s.phone)}</a>`,...active(DB.announcements).map(a=>`<a href="${esc(a.link||"#")}">${esc(a.text)}</a>`)];
 return `<div class="topbar"><div class="tb-msg" id="tbMsg">${msgs[0]}</div><a class="pillbtn" href="#request" data-req>${ic("gift",20)} ${esc(s.topbarButton)}</a></div>`+`<script type="application/json" id="tbData">${JSON.stringify(msgs).replace(/</g,"\\u003c")}</script>`}
function header(){const s=S(),groups={};active(DB.categories).forEach(c=>(groups[c.group||"Parts"]=groups[c.group||"Parts"]||[]).push(c));
 return topbar()+`<header class="header"><div class="container hdr">${logo()}
 <form class="search" id="sf"><input id="q" type="search" placeholder='Try "Toyota Corolla brake pads under GH₵400"' value="${esc(P.get("q")||"")}"><button type="button" class="chip" data-req title="Find a part by VIN">VIN</button><span class="sparkle">${ic("sparkle",26)}</span><button class="go">Search</button></form>
 <div class="hactions"><a class="hact" href="${ls.get("mm_token",null)?"account.html":"login.html"}">${ic("user",30)}<span class="lbl">${ls.get("mm_user",null)?esc(ls.get("mm_user").name.split(" ")[0]):"Sign In"}</span></a>
 <a class="hact" href="wishlist.html">${ic("heart",30)}<span class="lbl">WishList</span><b class="cnt" id="wishCnt"></b></a>
 <a class="hact" href="help.html">${ic("help",30)}<span class="lbl">Help</span></a>
 <a class="hact" href="cart.html">${ic("cart",30)}<span class="lbl">My Cart</span><b class="cnt" id="cartCnt"></b></a></div></div>
 <div class="navbar"><div class="navwrap"><button class="allcat" id="allcat">${ic("menu",30)}<span>All Categories</span>${ic("chevd",26)}</button>
 <nav class="navlinks">${(s.navLinks||[]).map(l=>`<a href="${esc(l.url)}">${esc(l.label)}</a>`).join("")}</nav></div>
 <div class="mega" id="mega">${Object.keys(groups).map(g=>`<h6>${esc(g)}</h6>`+groups[g].map(c=>`<a href="shop.html?cat=${c.id}"><span>${ic(c.icon,22)}${esc(c.name)}</span>${ic("chevr",20)}</a>`).join("")).join("")}
 <h6>Shop by Brand</h6>${active(DB.brands).slice(0,12).map(b=>`<a href="shop.html?brand=${b.id}"><span>${flag(b.flag)}${esc(b.name)}</span>${ic("chevr",20)}</a>`).join("")}</div></div></header>`}
function footer(){const s=S(),f=s.footer||{},col=(t,l)=>`<div><h4>${t}</h4>${(l||[]).map(x=>`<a href="${esc(x.url)}">${esc(x.label)}</a>`).join("")}</div>`;
 return `<footer class="footer"><div class="container fgrid">${col("Account",f.account)}${col("Need help?",f.help)}${col("Marketplace",f.market)}</div><div class="copy">${esc(s.copyright)}</div></footer>
 <nav class="mobnav"><a href="index.html">${ic("grid",22)}Home</a><a href="shop.html">${ic("menu",22)}Categories</a><a href="help.html">${ic("help",22)}Help</a><a href="${ls.get("mm_token",null)?"account.html":"login.html"}">${ic("user",22)}Account</a></nav>
 <a class="wafloat" href="https://wa.me/${esc(s.whatsapp)}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${ic("whatsapp",32)}</a>
 <button class="accbtn" id="accbtn" aria-label="Accessibility">${ic("access",30)}</button>
 <div class="accpanel" id="accp"><button data-acc="up">Increase text</button><button data-acc="down">Decrease text</button><button data-acc="hc">High contrast</button><button data-acc="reset">Reset</button></div>`}
function shell(){
 $("#hdr").innerHTML=header();$("#ftr").innerHTML=footer();badge();
 $("#sf").onsubmit=e=>{e.preventDefault();location.href="shop.html?q="+encodeURIComponent($("#q").value.trim())};
 $("#allcat").onclick=e=>{e.stopPropagation();$("#mega").classList.toggle("on")};
 // rotating announcements
 const msgs=JSON.parse($("#tbData").textContent);if(msgs.length>1){let i=0;setInterval(()=>{const m=$("#tbMsg");m.style.opacity=0;setTimeout(()=>{i=(i+1)%msgs.length;m.innerHTML=msgs[i];m.style.opacity=1},400)},5000)}
 // accessibility
 let fs=ls.get("mm_fs",16),hc=ls.get("mm_hc",false);const apply=()=>{document.documentElement.style.setProperty("--fs",fs+"px");document.body.classList.toggle("hc",hc)};apply();
 $("#accbtn").onclick=()=>$("#accp").classList.toggle("on");
 $("#accp").onclick=e=>{const a=e.target.dataset.acc;if(!a)return;if(a==="up")fs=Math.min(22,fs+1);if(a==="down")fs=Math.max(13,fs-1);if(a==="hc")hc=!hc;if(a==="reset"){fs=16;hc=false}ls.set("mm_fs",fs);ls.set("mm_hc",hc);apply()};
 // cookies
 if(ls.get("mm_cookie",null)===null){const c=document.createElement("div");c.className="cookie";c.innerHTML=`<span>We use cookies to ensure that we give you the best experience on our website</span><button class="btn out sm" data-c="0">Decline</button><button class="btn sm" data-c="1">Allow</button>`;c.onclick=e=>{const v=e.target.dataset.c;if(v==null)return;ls.set("mm_cookie",v);c.remove()};document.body.appendChild(c)}
}
function openReq(){
 let m=$("#reqm");if(!m){m=document.createElement("div");m.id="reqm";m.className="mback";document.body.appendChild(m)}
 m.innerHTML=`<div class="modal"><button class="x" data-x>${ic("x",22)}</button><h3>Request a Part</h3><p style="color:var(--mut);margin-bottom:16px">Can't find it? Tell us the part and your car's details and we'll source it.</p>
 <form class="form" id="reqf"><div class="row2"><label>Your name<input name="name" required></label><label>Phone<input name="phone" required type="tel"></label></div>
 <label>Car make, model & year<input name="car" placeholder="e.g. Toyota Corolla 2014"></label><label>Chassis / VIN (optional)<input name="vin"></label>
 <label>Part you need<textarea name="part" required rows="3" placeholder="e.g. Front brake pads, ceramic"></textarea></label><div id="reqmsg"></div><button class="btn full">Send Request</button></form></div>`;
 m.classList.add("on");m.onclick=e=>{if(e.target===m||e.target.closest("[data-x]"))m.classList.remove("on")};
 $("#reqf").onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target)),msg=$("#reqmsg");
  const wa=`https://wa.me/${S().whatsapp}?text=${encodeURIComponent(`Part request from ${d.name} (${d.phone})\nCar: ${d.car}\nVIN: ${d.vin}\nPart: ${d.part}`)}`;
  try{if(!OFFLINE)await api("/requests",{method:"POST",body:d});msg.innerHTML=`<div class="ok">Request received! We'll contact you shortly. <a href="${wa}" target="_blank" rel="noopener" style="font-weight:700;text-decoration:underline">Also send on WhatsApp</a></div>`;e.target.reset()}catch(er){msg.innerHTML=`<div class="err">${esc(er.message)}</div>`}};
}

/* ---------- home ---------- */
function slider(){
 const sl=active(DB.slides);if(!sl.length)return "";
 return `<section class="container hero"><div class="slider" id="slider">${sl.map((s,i)=>`<div class="slide ${i?"":"on"}" style="background-image:url('${esc(url(s.image))}')"><div class="sc"><h2>${esc(s.title)}</h2><p>${esc(s.subtitle)}</p><a class="shopnow" href="${esc(s.link||"shop.html")}">${esc(s.button||"Shop Now")}</a></div></div>`).join("")}
 <button class="sl-arrow l" aria-label="Previous">${ic("chevl",22)}</button><button class="sl-arrow r" aria-label="Next">${ic("chevr",22)}</button></div><div class="dots">${sl.map((_,i)=>`<i class="${i?"":"on"}" data-i="${i}"></i>`).join("")}</div></section>`}
function initSlider(){const el=$("#slider");if(!el)return;const sl=$$(".slide",el),dots=$$(".dots i");let c=0,t;
 const go=i=>{c=(i+sl.length)%sl.length;sl.forEach((s,k)=>s.classList.toggle("on",k===c));dots.forEach((d,k)=>d.classList.toggle("on",k===c))};
 const auto=()=>{clearInterval(t);t=setInterval(()=>go(c+1),5500)};
 $(".sl-arrow.l").onclick=()=>{go(c-1);auto()};$(".sl-arrow.r").onclick=()=>{go(c+1);auto()};dots.forEach(d=>d.onclick=()=>{go(+d.dataset.i);auto()});
 let x0=null;el.addEventListener("touchstart",e=>x0=e.touches[0].clientX,{passive:true});el.addEventListener("touchend",e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40){go(c+(dx<0?1:-1));auto()}x0=null});
 el.onmouseenter=()=>clearInterval(t);el.onmouseleave=auto;auto()}
function sectionProducts(sec){let l=active(DB.products);const[k,v]=String(sec.source).split(":");
 if(k==="discount")l=l.filter(p=>p.old>p.price).sort((a,b)=>pct(b)-pct(a));else if(k==="cat")l=l.filter(p=>p.cat===v);else if(k==="brand")l=l.filter(p=>p.brand===v);else if(k==="featured")l=l.filter(p=>p.featured);
 return l.slice(0,sec.limit||8)}
function secUrl(sec){const[k,v]=String(sec.source).split(":");return k==="discount"?"shop.html?deals=1":k==="cat"?"shop.html?cat="+v:k==="brand"?"shop.html?brand="+v:"shop.html"}
function pages_home(){
 const m=$("#main"),s=S(),cats=active(DB.categories);
 const maxOff=Math.max(0,...DB.products.map(pct));
 let h=slider();
 h+=`<section class="container sec">${secHead("Shop by Category","")}<div class="hscroll cats" id="cats"><a class="cat" href="shop.html?deals=1"><div class="ci"><div class="tile promo"><small>Up to ${maxOff}% OFF</small>Black<br>November</div></div>Save up to 30%</a>${cats.map((c,i)=>`<a class="cat" href="shop.html?cat=${c.id}"><div class="ci">${img(c.image,c.id,c.name)}</div>${esc(c.name)}</a>`).join("")}</div></section>`;
 active(DB.sections).forEach(sec=>{const l=sectionProducts(sec);if(l.length)h+=`<section class="container sec">${secHead(sec.title,viewAll(secUrl(sec)))}<div class="products">${l.map(card).join("")}</div></section>`});
 h+=`<section class="container sec">${secHead("Shop by Brand",`<div class="arrows"><button data-scroll="brs" data-dir="-1" aria-label="Previous">${ic("chevl",18)}</button><button data-scroll="brs" data-dir="1" aria-label="Next">${ic("chevr",18)}</button></div>`)}
 <div class="hscroll brands" id="brs">${active(DB.brands).map(b=>`<a class="brand" href="shop.html?brand=${b.id}"><div class="bi"><div class="wordmark">${esc(b.name)}</div>${flag(b.flag)}</div>${esc(b.name)}<br><small>${esc(b.country)}</small></a>`).join("")}</div></section>`;
 h+=`<section class="container discover"><h2 class="sec-title" style="font-size:30px">Discover More</h2><p>Find the latest releases, offers and exclusives right here</p><div class="dgrid">${active(DB.banners).map(b=>`<a class="dban" href="${esc(b.link||"shop.html")}" style="background-image:url('${esc(url(b.image))}')"><div><small>MotorMate Black November</small>${esc(b.title)}</div></a>`).join("")}</div>
 <div class="deal"><h3>${esc(s.dealTitle)}</h3><div class="timer" id="timer"></div></div>
 <div class="promos">${cats.slice(0,5).map(c=>{const mx=Math.max(0,...DB.products.filter(p=>p.cat===c.id).map(pct));return `<a href="shop.html?cat=${c.id}">${ic(c.icon,30)}${esc(c.name)}<span>${mx?`Up to ${mx}% Off`:"Shop now"}</span></a>`}).join("")}</div></section>`;
 h+=`<section class="container sec"><div class="trust">${(s.trust||[]).map(t=>`<div><div class="tc">${ic(t.icon,40)}</div><b>${esc(t.title)}</b><span>${esc(t.text)}</span></div>`).join("")}</div></section>`;
 h+=`<section class="container sec">${secHead("More parts for you",viewAll("shop.html"))}<div class="pgrid" id="more"></div><button class="loadmore" id="lm">Load More</button></section>`;
 h+=`<section class="container sec"><div class="deal" style="background:linear-gradient(120deg,#0b5d1c,#1fa534)"><div><h3>${esc(s.waTitle)}</h3><p style="margin:10px 0 14px;opacity:.95">${esc(s.waText)}</p><ul style="list-style:none;display:grid;gap:8px">${(s.waBullets||[]).map(b=>`<li style="display:flex;gap:10px">${ic("check",20)}${esc(b)}</li>`).join("")}</ul></div><div style="text-align:center"><a class="btn" style="background:#fff;color:#0b5d1c;padding:16px 34px;font-size:17px" href="https://wa.me/${esc(s.whatsapp)}" target="_blank" rel="noopener">JOIN NOW FOR FREE</a><p style="font-size:13px;margin-top:10px;opacity:.9">No spam, just amazing deals! Unsubscribe anytime.</p></div></div></section>`;
 m.innerHTML=h;initSlider();
 let n=0;const all=active(DB.products),step=10;const more=()=>{$("#more").insertAdjacentHTML("beforeend",all.slice(n,n+step).map(card).join(""));n+=step;if(n>=all.length)$("#lm").style.display="none"};$("#lm").onclick=more;more();
 const end=new Date(s.dealEnds).getTime(),tick=()=>{let t=Math.max(0,Math.floor((end-Date.now())/1e3));const v=[["Days",Math.floor(t/86400)],["Hour",Math.floor(t%86400/3600)],["Min",Math.floor(t%3600/60)],["Sec",t%60]];const el=$("#timer");if(el)el.innerHTML=v.map(x=>`<div><b>${String(x[1]).padStart(2,"0")}</b><span>${x[0]}</span></div>`).join("")};tick();setInterval(tick,1e3);
}

/* ---------- shop ---------- */
function pages_shop(){
 const m=$("#main");let st={q:P.get("q")||"",cat:P.get("cat")||"",brands:P.get("brand")?P.get("brand").split(","):[],countries:P.get("country")?P.get("country").split(","):[],deals:P.get("deals")==="1",sort:P.get("sort")||"rel",min:P.get("min")||"",max:P.get("max")||"",stock:false,n:24};
 const countries=[...new Set(DB.brands.map(b=>b.country))];
 m.innerHTML=`<div class="container"><div class="crumbs"><a href="index.html">Home</a> / <span id="crumb">Shop</span></div><div class="shop"><aside class="side" id="side"></aside><div><div class="toolbar"><div><h1 style="font-size:24px" id="ttl"></h1><span id="cnt" style="color:var(--mut);font-size:14px"></span></div><div style="display:flex;gap:10px"><button class="btn out sm filtbtn" id="fb">${ic("funnel",16)} Filters</button><select id="sort"><option value="rel">Sort: Featured</option><option value="disc">Biggest discount</option><option value="lo">Price: low to high</option><option value="hi">Price: high to low</option><option value="az">Name A–Z</option></select></div></div><div class="pgrid" id="pg"></div><button class="loadmore" id="lm">Load More</button></div></div></div>`;
 const side=$("#side");
 function drawSide(){side.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:18px">Filters</b><button class="filtbtn" id="sx">${ic("x",22)}</button></div>
 <h5>Category</h5><div class="scr"><label><input type="radio" name="c" value="" ${!st.cat?"checked":""}> All categories</label>${active(DB.categories).map(c=>`<label><input type="radio" name="c" value="${c.id}" ${st.cat===c.id?"checked":""}> ${esc(c.name)}</label>`).join("")}</div>
 <h5>Brand</h5><div class="scr">${active(DB.brands).map(b=>`<label><input type="checkbox" data-b="${b.id}" ${st.brands.includes(b.id)?"checked":""}> ${esc(b.name)}</label>`).join("")}</div>
 <h5>Country of origin</h5>${countries.map(c=>`<label><input type="checkbox" data-co="${esc(c)}" ${st.countries.includes(c)?"checked":""}> ${flag((DB.brands.find(b=>b.country===c)||{}).flag)} ${esc(c)}</label>`).join("")}
 <h5>Price (${esc(S().currency)})</h5><div class="rng"><input id="mn" type="number" placeholder="Min" value="${esc(st.min)}"><input id="mx" type="number" placeholder="Max" value="${esc(st.max)}"></div>
 <h5>Availability</h5><label><input type="checkbox" id="stk" ${st.stock?"checked":""}> In stock only</label><label><input type="checkbox" id="dl" ${st.deals?"checked":""}> On discount</label>
 <button class="btn out full" style="margin-top:16px" id="clr">Clear filters</button>`;
  $$("[name=c]",side).forEach(r=>r.onchange=()=>{st.cat=r.value;run()});
  $$("[data-b]",side).forEach(c=>c.onchange=()=>{st.brands=$$("[data-b]:checked",side).map(x=>x.dataset.b);run()});
  $$("[data-co]",side).forEach(c=>c.onchange=()=>{st.countries=$$("[data-co]:checked",side).map(x=>x.dataset.co);run()});
  $("#mn").onchange=e=>{st.min=e.target.value;run()};$("#mx").onchange=e=>{st.max=e.target.value;run()};$("#stk").onchange=e=>{st.stock=e.target.checked;run()};$("#dl").onchange=e=>{st.deals=e.target.checked;run()};
  $("#clr").onclick=()=>{st={...st,q:"",cat:"",brands:[],countries:[],deals:false,min:"",max:"",stock:false};drawSide();run()};
  $("#sx").onclick=()=>side.classList.remove("on")}
 function run(){
  let l=active(DB.products).filter(p=>{const b=brand(p.brand)||{};
   if(st.cat&&p.cat!==st.cat)return false;if(st.brands.length&&!st.brands.includes(p.brand))return false;if(st.countries.length&&!st.countries.includes(b.country))return false;
   if(st.deals&&!(p.old>p.price))return false;if(st.stock&&p.stock<=0)return false;if(st.min!==""&&p.price<+st.min)return false;if(st.max!==""&&p.price>+st.max)return false;
   if(st.q){const hay=(p.name+" "+(cat(p.cat)||{}).name+" "+b.name+" "+b.country).toLowerCase();if(!st.q.toLowerCase().split(/\s+/).every(w=>hay.includes(w)))return false}return true});
  const s=st.sort;if(s==="lo")l.sort((a,b)=>a.price-b.price);else if(s==="hi")l.sort((a,b)=>b.price-a.price);else if(s==="disc")l.sort((a,b)=>pct(b)-pct(a));else if(s==="az")l.sort((a,b)=>a.name.localeCompare(b.name));else l.sort((a,b)=>(b.featured?1:0)-(a.featured?1:0));
  const c=cat(st.cat);$("#ttl").textContent=st.q?`Results for “${st.q}”`:c?c.name:st.deals?"Black November Deals":st.brands.length===1?(brand(st.brands[0])||{}).name+" Parts":"All Parts";$("#crumb").textContent=$("#ttl").textContent;
  $("#cnt").textContent=l.length+" product"+(l.length===1?"":"s");$("#pg").innerHTML=l.slice(0,st.n).map(card).join("")||`<div class="empty" style="grid-column:1/-1">${ic("search",48)}<p style="margin-top:10px">No parts match your filters. <a href="#request" data-req style="color:var(--green-d);font-weight:700">Request this part</a></p></div>`;
  $("#lm").style.display=l.length>st.n?"block":"none";$("#lm").onclick=()=>{st.n+=24;run()};$("#sort").value=st.sort;
  const q=new URLSearchParams();if(st.q)q.set("q",st.q);if(st.cat)q.set("cat",st.cat);if(st.brands.length)q.set("brand",st.brands.join(","));if(st.countries.length)q.set("country",st.countries.join(","));if(st.deals)q.set("deals","1");history.replaceState(null,"","shop.html"+(q.toString()?"?"+q:""))}
 $("#sort").onchange=e=>{st.sort=e.target.value;run()};$("#fb").onclick=()=>side.classList.add("on");
 drawSide();run();
}

/* ---------- product ---------- */
function pages_product(){
 const p=prod(P.get("id")),m=$("#main");if(!p){m.innerHTML=`<div class="container empty">Part not found. <a href="shop.html" class="btn sm">Browse parts</a></div>`;return}
 const b=brand(p.brand)||{},c=cat(p.cat)||{},o=pct(p);document.title=p.name+" | "+S().name;let q=1;
 const rel=active(DB.products).filter(x=>x.cat===p.cat&&x.id!==p.id).slice(0,8);
 m.innerHTML=`<div class="container"><div class="crumbs"><a href="index.html">Home</a> / <a href="shop.html?cat=${esc(p.cat)}">${esc(c.name)}</a> / ${esc(p.name)}</div>
 <div class="pd"><div class="pd-img">${img(p.image,p.cat,p.name)}</div><div><div class="meta"><span>${ic(c.icon,18)} ${esc(c.name)}</span><span>Brand: <b>${esc(b.name)}</b></span><span>${flag(b.flag)} Made by a <b>${esc(b.country)}</b> brand</span></div>
 <h1>${esc(p.name)}</h1><div class="pd-price">${fmt(p.price)}${p.old>p.price?`<s>${fmt(p.old)}</s><span class="off">${o}% Off</span>`:""}</div>
 <div class="pts"><b>MOTORPOINTS</b> Earn ${(p.price*S().pointsRate).toLocaleString()} Points</div>
 <p style="margin-top:12px;font-weight:600;color:${p.stock>0?"var(--green-d)":"var(--red)"}">${p.stock>0?(p.stock<6?`Only ${p.stock} left in stock`:"In stock"):"Out of stock"}</p>
 <div class="qtyrow"><div class="qty"><button id="qm" aria-label="Less">${ic("minus",16)}</button><span id="qv">1</span><button id="qp" aria-label="More">${ic("plus",16)}</button></div>
 <button class="btn" id="ac">${ic("cartplus",20)} Add to Cart</button><button class="btn dark" id="bn">Buy Now</button><button class="btn out" data-wish="${p.id}">${ic("heart",18)} Wishlist</button></div>
 <ul class="bullets"><li>${ic("shield",20)}Quality-checked parts with money-back guarantee</li><li>${ic("truck",20)}Same-day delivery in Accra, 1–3 days nationwide</li><li>${ic("whatsapp",20)}<span>Unsure about fitment? <a href="https://wa.me/${esc(S().whatsapp)}?text=${encodeURIComponent("Hi MotorMate, does this fit my car? "+p.name)}" target="_blank" rel="noopener" style="color:var(--green-d);font-weight:700">Ask on WhatsApp</a></span></li></ul></div></div>
 <div class="tabs"><button class="on" data-t="d">Description</button><button data-t="s">Specifications</button><button data-t="r">Delivery & Returns</button></div><div class="tabbody" id="tb"></div>
 ${rel.length?`<section class="sec">${secHead("Related parts",viewAll("shop.html?cat="+p.cat))}<div class="products">${rel.map(card).join("")}</div></section>`:""}</div>`;
 const T={d:esc(p.desc),s:esc(p.specs),r:"Delivery: same-day within Accra for orders before 2pm; 1–3 working days elsewhere in Ghana.\nReturns: unused parts in original packaging within 7 days. Electrical parts are non-returnable once installed."};
 const tab=k=>{$("#tb").innerHTML=T[k];$$(".tabs button").forEach(x=>x.classList.toggle("on",x.dataset.t===k))};tab("d");$$(".tabs button").forEach(x=>x.onclick=()=>tab(x.dataset.t));
 $("#qm").onclick=()=>{q=Math.max(1,q-1);$("#qv").textContent=q};$("#qp").onclick=()=>{q=Math.min(Math.max(p.stock,1),q+1);$("#qv").textContent=q};
 $("#ac").onclick=()=>addToCart(p.id,q);$("#bn").onclick=()=>{addToCart(p.id,q);location.href="checkout.html"};
}

/* ---------- cart / checkout ---------- */
const lines=()=>Object.keys(cart).map(id=>({p:prod(id),q:cart[id]})).filter(x=>x.p);
function totals(){const sub=lines().reduce((a,l)=>a+l.p.price*l.q,0),s=S(),del=!sub?0:sub>=s.freeShippingOver?0:s.deliveryFee;return{sub,del,total:sub+del}}
function summary(){const t=totals(),s=S();return `<div class="sumrow"><span>Subtotal</span><b>${fmt(t.sub)}</b></div><div class="sumrow"><span>Delivery</span><b>${t.del?fmt(t.del):"Free"}</b></div>${t.sub&&t.sub<s.freeShippingOver?`<p style="font-size:13px;color:var(--mut)">Add ${fmt(s.freeShippingOver-t.sub)} more for free delivery</p>`:""}<div class="sumrow t"><span>Total</span><span>${fmt(t.total)}</span></div>`}
function pages_cart(){
 const m=$("#main");
 function draw(){const l=lines();
  if(!l.length){m.innerHTML=`<div class="container empty"><div style="color:var(--green)">${ic("cart",72)}</div><h2 style="margin:14px 0 8px">Your cart is empty</h2><a class="btn" href="shop.html">Start shopping</a></div>`;return}
  m.innerHTML=`<div class="container"><h1 style="margin-top:24px">Shopping Cart</h1><div class="two"><div class="box">${l.map(({p,q})=>`<div class="ci-row"><div class="pi" data-go="${p.id}" style="cursor:pointer">${img(p.image,p.cat,p.name)}</div><div><a href="product.html?id=${p.id}" style="font-weight:600">${esc(p.name)}</a><div style="color:var(--mut);font-size:14px;margin:4px 0">${esc((brand(p.brand)||{}).name||"")}</div><div class="qty" style="width:max-content"><button data-d="${p.id}:-1">${ic("minus",14)}</button><span>${q}</span><button data-d="${p.id}:1">${ic("plus",14)}</button></div><button class="rm" data-rm="${p.id}">${ic("trash",14)} Remove</button></div><b>${fmt(p.price*q)}</b></div>`).join("")}</div>
  <div class="box" style="align-self:start"><h3>Order Summary</h3>${summary()}<a class="btn full" href="checkout.html" style="margin-top:14px">Proceed to Checkout</a><a class="btn out full" href="shop.html" style="margin-top:10px">Continue Shopping</a></div></div></div>`}
 m.onclick=e=>{const d=e.target.closest("[data-d]"),r=e.target.closest("[data-rm]");if(d){const[id,n]=d.dataset.d.split(":"),p=prod(id);cart[id]=Math.min(Math.max(p.stock,1),(cart[id]||0)+ +n);if(cart[id]<=0)delete cart[id];saveCart();draw()}if(r){delete cart[r.dataset.rm];saveCart();draw()}};
 draw()}
function pages_checkout(){
 const m=$("#main");if(!lines().length){location.href="cart.html";return}
 const u=ls.get("mm_user",{})||{},regions=["Greater Accra","Ashanti","Western","Central","Eastern","Northern","Volta","Bono","Upper East","Upper West","Other"];
 m.innerHTML=`<div class="container"><h1 style="margin-top:24px">Checkout</h1><div class="two"><form class="box form" id="cof"><h3>Delivery details</h3>
 <div class="row2"><label>Full name *<input name="name" required value="${esc(u.name||"")}"></label><label>Phone number *<input name="phone" required type="tel" value="${esc(u.phone||"")}"></label></div>
 <label>Email (optional)<input name="email" type="email" value="${esc(u.email||"")}"></label>
 <div class="row2"><label>Region *<select name="region" required>${regions.map(r=>`<option>${r}</option>`).join("")}</select></label><label>City / Town *<input name="city" required placeholder="e.g. Osu"></label></div>
 <label>Delivery address / landmark *<textarea name="address" required rows="3"></textarea></label><label>Order notes (car model, VIN…)<textarea name="notes" rows="2"></textarea></label>
 <h3 style="margin-top:6px">Payment method</h3>${(S().paymentMethods||[]).map((x,i)=>`<label style="display:flex;gap:10px;align-items:center;font-weight:500;border:1px solid var(--line);padding:14px;border-radius:10px"><input type="radio" name="payment" value="${esc(x)}" ${i?"":"checked"} style="width:auto;accent-color:var(--green)"> ${esc(x)}</label>`).join("")}
 <div id="cerr"></div><button class="btn full" style="padding:16px">Place Order</button></form>
 <div class="box" style="align-self:start"><h3>Your order</h3>${lines().map(({p,q})=>`<div class="sumrow" style="font-size:14px"><span>${q} × ${esc(p.name.slice(0,44))}</span><b>${fmt(p.price*q)}</b></div>`).join("")}${summary()}</div></div></div>`;
 $("#cof").onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));d.items=lines().map(l=>({id:l.p.id,qty:l.q}));const btn=e.target.querySelector("button.btn");btn.disabled=true;btn.textContent="Placing order…";
  const t=totals();let order;
  try{if(OFFLINE){order={id:"MM-LOCAL",total:t.total,items:lines().map(l=>({name:l.p.name,qty:l.q,price:l.p.price}))}}else order=(await api("/orders",{method:"POST",body:d})).order}
  catch(er){$("#cerr").innerHTML=`<div class="err">${esc(er.message)}</div>`;btn.disabled=false;btn.textContent="Place Order";return}
  const txt=`Hello MotorMate Ghana, I placed order ${order.id}:\n`+order.items.map(i=>`${i.qty} x ${i.name} (${fmt(i.price)})`).join("\n")+`\nTotal: ${fmt(order.total)}\nName: ${d.name}\nPhone: ${d.phone}\nAddress: ${d.city}, ${d.region} – ${d.address}\nPayment: ${d.payment}`;
  cart={};saveCart();
  m.innerHTML=`<div class="container empty"><div style="color:var(--green)">${ic("check",72)}</div><h1 style="margin:14px 0 8px;color:var(--ink)">Thank you! Order ${esc(order.id)} received</h1><p>We'll confirm fitment and delivery with you shortly.</p><div style="margin-top:22px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><a class="btn" target="_blank" rel="noopener" href="https://wa.me/${esc(S().whatsapp)}?text=${encodeURIComponent(txt)}">${ic("whatsapp",20)} Send order on WhatsApp</a><a class="btn out" href="index.html">Continue shopping</a></div></div>`}}

/* ---------- wishlist / account / pages ---------- */
function pages_wishlist(){const l=wish.map(prod).filter(Boolean);$("#main").innerHTML=`<div class="container"><h1 style="margin:24px 0 16px">My Wishlist</h1>${l.length?`<div class="pgrid">${l.map(card).join("")}</div>`:`<div class="empty">${ic("heart",64)}<p style="margin:10px 0 16px">Nothing saved yet.</p><a class="btn" href="shop.html">Browse parts</a></div>`}</div>`}
async function pages_account(){
 const m=$("#main");if(!ls.get("mm_token",null)){location.href="login.html?next=account.html";return}
 let me;try{me=await api("/me")}catch(e){ls.set("mm_token",null);ls.set("mm_user",null);location.href="login.html?next=account.html";return}
 m.innerHTML=`<div class="container"><div style="display:flex;justify-content:space-between;align-items:center;margin:24px 0 16px;flex-wrap:wrap;gap:10px"><div><h1>Hello, ${esc(me.user.name)}</h1><span style="color:var(--mut)">${esc(me.user.phone)}</span></div><button class="btn out" id="lo">${ic("logout",18)} Sign out</button></div><h2 style="margin-bottom:12px">Order History</h2>
 ${me.orders.length?me.orders.map(o=>`<div class="box" style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px"><b>${esc(o.id)}</b><span class="pill ${esc(o.status)}">${esc(o.status)}</span></div><div style="color:var(--mut);font-size:14px;margin:4px 0 10px">${new Date(o.created).toLocaleString()} · ${esc(o.payment)}</div>${o.items.map(i=>`<div class="sumrow" style="padding:4px 0;font-size:14px"><span>${i.qty} × ${esc(i.name)}</span><b>${fmt(i.price*i.qty)}</b></div>`).join("")}<div class="sumrow t"><span>Total</span><span>${fmt(o.total)}</span></div></div>`).join(""):`<div class="empty">No orders yet. <a href="shop.html" style="color:var(--green-d);font-weight:700">Start shopping</a></div>`}</div>`;
 $("#lo").onclick=()=>{ls.set("mm_token",null);ls.set("mm_user",null);location.href="index.html"}}
function pages_page(){const pg=DB.pages.find(x=>x.slug===P.get("slug"));$("#main").innerHTML=pg?`<div class="container"><div class="prose"><h1>${esc(pg.title)}</h1>${pg.html}</div></div>`:`<div class="container empty">Page not found</div>`;if(pg)document.title=pg.title+" | "+S().name}
function pages_help(){const f=DB.pages.find(x=>x.slug==="faq"),s=S();$("#main").innerHTML=`<div class="container"><div class="prose"><h1>Help Centre</h1>${f?f.html:""}<h2 id="contact" style="margin:30px 0 12px">Customer Service</h2><p>${ic("whatsapp",18)} WhatsApp: <a href="https://wa.me/${esc(s.whatsapp)}" style="color:var(--green-d);font-weight:700">${esc(s.phone)}</a></p><p>${ic("mail",18)} ${esc(s.email)}</p><p>${ic("pin",18)} ${esc(s.address)}</p><button class="btn" data-req style="margin-top:8px">Request a Part</button></div></div>`}

/* ---------- login / register ---------- */
function pages_login(){
 const nxt=P.get("next")||"index.html";let mode=P.get("mode")==="register"?"register":"login";
 const draw=()=>{const reg=mode==="register";
  document.body.innerHTML=`<div class="auth"><div class="auth-l">${logo().replace('href="index.html"','href="index.html"')}<a class="back" href="javascript:history.length>1?history.back():location.href='index.html'">${ic("chevl",28)} Back to previous page</a>
  <div class="auth-form">${reg?"":`<h2 style="text-align:center;font-size:24px;margin-top:0">No Account? No Problem</h2><a class="guest" href="shop.html">${ic("users",24)} Continue as a Guest</a><div class="or">Or</div>`}
  <h2 style="margin-top:0">${reg?"Create your account":"Sign In"}</h2><p style="margin-bottom:22px">${reg?"Join MotorMate Ghana to track orders and earn MotorPoints.":"Welcome! Please sign in to your account."}</p>
  <form class="form" id="af">${reg?`<label>Full name *<input name="name" required placeholder="Enter your full name"></label>`:""}
  <label>Phone Number *<div class="pw"><input name="phone" required type="tel" placeholder="Enter your phone number" autocomplete="tel"><span class="hint">${ic("help",22)}</span></div></label>
  <label>Password *<div class="pw"><input name="password" id="pw" required type="password" minlength="6" placeholder="Enter your password"><button type="button" id="eye" aria-label="Show password">${ic("eye",26)}</button></div></label>
  ${reg?"":`<a href="#" class="forgot" id="fg">Forgot Password?</a>`}<div id="aerr"></div><button class="btn full" style="padding:16px;font-size:17px">${reg?"Create account":"Sign In"}</button>
  <p style="text-align:center;color:var(--mut)">${reg?"Already have an account?":"New to MotorMate?"} <a href="#" id="sw" style="color:var(--green-d);font-weight:700">${reg?"Sign in":"Create an account"}</a></p></form></div></div>
  <div class="auth-r"><h3>Don’t have a ${esc(S().name.split(" ")[0])} account?</h3><p>Here are some of the benefits you’ll enjoy:</p>
  ${[["cart","Wide Selection","Access thousands of spare parts at great prices"],["truck","Fast Delivery","Get your orders delivered quickly to your doorstep"],["shield","Secure Shopping","Shop with confidence – quality guaranteed parts"],["tag","Exclusive Deals","Registered customers get special offers and discounts"]].map(b=>`<div class="ben"><div class="bi2">${ic(b[0],38)}</div><div><b>${b[1]}</b><span>${b[2]}</span></div></div>`).join("")}
  <a class="cr" href="#" id="cr">Create an account ${ic("chevr",26)}</a></div></div>`;
  $("#eye").onclick=()=>{const i=$("#pw");i.type=i.type==="password"?"text":"password"};
  $("#sw").onclick=e=>{e.preventDefault();mode=reg?"login":"register";draw()};$("#cr").onclick=e=>{e.preventDefault();mode="register";draw()};
  const fg=$("#fg");if(fg)fg.onclick=e=>{e.preventDefault();$("#aerr").innerHTML=`<div class="ok">To reset your password, WhatsApp us on ${esc(S().phone)} and we'll help you right away.</div>`};
  $("#af").onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));
   try{if(OFFLINE)throw new Error("Accounts need the MotorMate server running (node server.js).");const r=await api(reg?"/auth/register":"/auth/login",{method:"POST",body:d});ls.set("mm_token",r.token);ls.set("mm_user",r.user);location.href=nxt}catch(er){$("#aerr").innerHTML=`<div class="err">${esc(er.message)}</div>`}}};
 draw()}

/* ---------- boot ---------- */
(async function(){
 try{const r=await fetch("/api/public");if(!r.ok)throw 0;DB=await r.json()}catch(e){OFFLINE=true;DB=JSON.parse(JSON.stringify(window.SEED))}
 theme();
 if(page==="login"){pages_login();return}
 shell();
 const fn={home:pages_home,shop:pages_shop,product:pages_product,cart:pages_cart,checkout:pages_checkout,wishlist:pages_wishlist,account:pages_account,page:pages_page,help:pages_help}[page];
 if(fn)fn();
 if(OFFLINE){const b=document.createElement("div");b.style.cssText="background:#fff4d6;color:#7a5b00;text-align:center;padding:6px;font-size:13px";b.textContent="Preview mode – run “node server.js” for accounts, orders and the admin panel.";document.body.prepend(b)}
})();
})();
