/* MotorMate Ghana – admin CMS. Everything on the storefront (products, hero slides, announcements, pages, branding…) is edited here. */
(function(){
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const tok={get:()=>{try{return localStorage.getItem("mm_admin")}catch(e){return null}},set:v=>{try{v?localStorage.setItem("mm_admin",v):localStorage.removeItem("mm_admin")}catch(e){}}};
let D=null,view="dashboard";
const url=u=>!u?"":/^(https?:|data:|\/)/.test(u)?u:"/"+u;
async function api(p,o={}){
 const r=await fetch("/api/admin"+p,{method:o.method||"GET",headers:{"Content-Type":"application/json",Authorization:"Bearer "+tok.get()},body:o.body?JSON.stringify(o.body):undefined});
 const j=await r.json().catch(()=>({}));if(r.status===401&&p!=="/login"){tok.set(null);login();throw new Error("Session expired")}if(!r.ok)throw new Error(j.error||"Error");return j}
const save=async k=>{await api("/db/"+k,{method:"PUT",body:{value:D[k]}});toast("Saved – live on the storefront")};
function toast(m,bad){let t=$("#toast");if(!t){t=document.createElement("div");t.id="toast";t.className="toast";document.body.appendChild(t)}t.textContent=m;t.style.background=bad?"#b4233a":"#000";t.classList.add("on");clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove("on"),2400)}
const money=n=>(D.settings.currency||"GH₵")+" "+Number(n||0).toLocaleString();
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,5);

/* ---------- schemas ---------- */
const refOpts=k=>D[k].map(x=>[x.id,x.name]);
const SC={
 products:{label:"Products",icon:"box",id:"p",cols:[["image","img"],["name"],["cat","ref","categories"],["brand","ref","brands"],["price","money"],["stock"],["active","bool"]],
  f:[["name","text"],["cat","ref","categories"],["brand","ref","brands"],["price","num"],["old","num","Old price (set 0 for no discount)"],["stock","num"],["image","image","Product photo – upload or paste a URL"],["desc","area"],["specs","area","One spec per line"],["featured","bool","Show in “Exclusive offers” section"],["active","bool","Visible in store"]],blank:{price:0,old:0,stock:10,active:true,featured:false,desc:"",specs:"",image:""}},
 categories:{label:"Categories",icon:"grid",id:"c",move:1,cols:[["image","img"],["name"],["group"],["icon","icon"],["active","bool"]],
  f:[["name","text"],["group","text","Mega-menu heading, e.g. Engine & Drivetrain"],["icon","icon"],["image","image","Category tile photo (leave blank to use an icon tile)"],["active","bool"]],blank:{group:"",icon:"box",image:"",active:true}},
 brands:{label:"Brands & Countries",icon:"globe",id:"b",cols:[["name"],["country"],["flag","flag"],["active","bool"]],
  f:[["name","text"],["country","text","Country the brand comes from"],["flag","text","2-letter country code for the flag, e.g. jp, de, us, gb, kr, fr, it, cn"],["about","area"],["active","bool"]],blank:{country:"",flag:"",about:"",active:true}},
 slides:{label:"Hero Slideshow",icon:"slides",id:"s",move:1,cols:[["image","img"],["title"],["subtitle"],["active","bool"]],
  f:[["title","text"],["subtitle","text"],["button","text","Button text"],["link","text","Button link, e.g. shop.html?cat=brakes"],["image","image","Wide background photo (1600×600 works best)"],["active","bool"]],blank:{title:"",subtitle:"",button:"Shop Now",link:"shop.html",image:"",active:true}},
 banners:{label:"Discover-More Banners",icon:"image",id:"b",move:1,cols:[["image","img"],["title"],["link"],["active","bool"]],
  f:[["title","text"],["link","text"],["image","image"],["active","bool"]],blank:{title:"",link:"shop.html",image:"",active:true}},
 announcements:{label:"Announcements",icon:"mega",id:"a",move:1,cols:[["text"],["link"],["active","bool"]],
  f:[["text","text","Shown in the black top bar, rotating"],["link","text"],["active","bool"]],blank:{text:"",link:"",active:true}},
 sections:{label:"Homepage Sections",icon:"list",id:"h",move:1,cols:[["title"],["source"],["limit"],["active","bool"]],
  f:[["title","text"],["source","text","discount · featured · cat:<category id> · brand:<brand id>"],["limit","num"],["active","bool"]],blank:{title:"",source:"discount",limit:8,active:true}},
 pages:{label:"Pages (FAQ, Terms…)",icon:"file",idk:"slug",cols:[["slug"],["title"]],
  f:[["slug","text","URL name, e.g. terms  →  page.html?slug=terms"],["title","text"],["html","area","Page content (HTML allowed)"]],blank:{slug:"",title:"",html:""}}
};
const idOf=(k,x)=>x[SC[k].idk||"id"];

/* ---------- login ---------- */
function login(){
 $("#root").innerHTML=`<div class="lg"><form id="lf"><div style="text-align:center;font-weight:800;font-size:22px">MOTOR<span style="color:var(--green)">MATE</span> Admin</div><p class="muted" style="text-align:center">Sign in to manage your store</p><input id="pw" type="password" placeholder="Admin password" required autofocus style="padding:14px;border:1px solid #d5d9de;border-radius:10px"><div id="le"></div><button class="btn full">Sign in</button><p class="muted" style="text-align:center">First time? The default password is <b>admin123</b> – change it in Settings.</p></form></div>`;
 $("#lf").onsubmit=async e=>{e.preventDefault();try{const r=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:$("#pw").value})});const j=await r.json();if(!r.ok)throw new Error(j.error);tok.set(j.token);start()}catch(er){$("#le").innerHTML=`<div class="err">${esc(er.message)}</div>`}}}
async function start(){try{D=await api("/all")}catch(e){return}shell();go(location.hash.slice(1)||"dashboard")}

/* ---------- shell ---------- */
const NAV=[["dashboard","Dashboard","dash"],["sep","Sales"],["orders","Orders","clip"],["requests","Part Requests","mail"],["customers","Customers","users"],["sep","Catalogue"],["products","Products","box"],["categories","Categories","grid"],["brands","Brands & Countries","globe"],["sep","Website content"],["slides","Hero Slideshow","slides"],["sections","Homepage Sections","list"],["banners","Banners","image"],["announcements","Announcements","mega"],["pages","Pages (FAQ, Terms)","file"],["settings","Settings & Branding","gear"]];
function shell(){
 $("#root").innerHTML=`<div class="shellA"><aside class="sb" id="sb"><div class="brandA">${ic("wrench",22)} MOTOR<span>MATE</span> Admin</div>${NAV.map(n=>n[0]==="sep"?`<div class="sep">${n[1]}</div>`:`<a data-v="${n[0]}">${ic(n[2],19)}${n[1]}</a>`).join("")}<div class="sep">Account</div><a href="/" target="_blank">${ic("globe",19)}View store</a><a id="lo">${ic("logout",19)}Sign out</a></aside><main class="mainA" id="mA"></main></div>`;
 $$("[data-v]").forEach(a=>a.onclick=()=>{go(a.dataset.v);$("#sb").classList.remove("on")});$("#lo").onclick=()=>{tok.set(null);login()}}
function go(v){view=v;location.hash=v;$$("[data-v]").forEach(a=>a.classList.toggle("on",a.dataset.v===v));const m=$("#mA");
 const top=t=>`<div class="topA"><div style="display:flex;gap:12px;align-items:center"><button class="btn out sm menuA" id="mb">${ic("menu",18)}</button><h1>${t}</h1></div><div id="topr"></div></div>`;
 m.innerHTML=top((NAV.find(n=>n[0]===v)||[0,"Dashboard"])[1])+`<div id="body"></div>`;$("#mb").onclick=()=>$("#sb").classList.toggle("on");
 ({dashboard:dash,orders:orders,requests:requests,customers:customers,settings:settings}[v]||(()=>crud(v)))()}

/* ---------- dashboard ---------- */
function dash(){
 const rev=D.orders.filter(o=>o.status!=="Cancelled").reduce((a,o)=>a+o.total,0),pend=D.orders.filter(o=>o.status==="Pending").length,low=D.products.filter(p=>p.stock<=5);
 $("#body").innerHTML=`<div class="cards">${[["clip","Orders",D.orders.length],["card","Revenue",money(rev)],["clock","Pending orders",pend],["mail","New part requests",D.requests.filter(r=>r.status==="New").length],["box","Products",D.products.length],["users","Customers",D.users.length]].map(s=>`<div class="stat"><span>${ic(s[0],18)}${s[1]}</span><b>${s[2]}</b></div>`).join("")}</div>
 <div class="panel"><h3>Recent orders</h3>${D.orders.length?`<table class="t"><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr>${[...D.orders].reverse().slice(0,8).map(o=>`<tr><td><b>${esc(o.id)}</b></td><td>${esc(o.name)}</td><td>${money(o.total)}</td><td><span class="pill ${esc(o.status)}">${esc(o.status)}</span></td><td>${new Date(o.created).toLocaleDateString()}</td></tr>`).join("")}</table>`:`<p class="muted">No orders yet.</p>`}</div>
 <div class="panel"><h3>Low stock (5 or fewer)</h3>${low.length?`<table class="t">${low.map(p=>`<tr><td>${esc(p.name)}</td><td><b>${p.stock}</b> left</td></tr>`).join("")}</table>`:`<p class="muted">All products are well stocked.</p>`}</div>
 <div class="note">Tip: use the menu on the left to change anything customers see – hero images, announcements, categories, prices, pages and your branding.</div>`}

/* ---------- orders / requests / customers ---------- */
function orders(){
 const ST=["Pending","Confirmed","Processing","Shipped","Delivered","Cancelled"];
 $("#body").innerHTML=`<div class="panel">${D.orders.length?`<table class="t"><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th></th></tr>${[...D.orders].reverse().map(o=>`<tr><td><b>${esc(o.id)}</b><br><span class="muted">${new Date(o.created).toLocaleString()}</span></td><td>${esc(o.name)}<br><span class="muted">${esc(o.phone)}</span></td><td>${o.items.reduce((a,i)=>a+i.qty,0)}</td><td>${money(o.total)}</td><td>${esc(o.payment)}</td><td><select data-o="${o.id}">${ST.map(s=>`<option ${s===o.status?"selected":""}>${s}</option>`).join("")}</select></td><td class="acts"><button data-view="${o.id}" title="View">${ic("eye",16)}</button></td></tr>`).join("")}</table>`:`<p class="muted">No orders yet. They will appear here when customers check out.</p>`}</div>`;
 $$("[data-o]").forEach(s=>s.onchange=async()=>{await api("/orders/"+s.dataset.o,{method:"PATCH",body:{status:s.value}});D.orders.find(o=>o.id===s.dataset.o).status=s.value;toast("Order status updated")});
 $$("[data-view]").forEach(b=>b.onclick=()=>{const o=D.orders.find(x=>x.id===b.dataset.view);
  modal(`<h3>Order ${esc(o.id)}</h3><p class="muted">${new Date(o.created).toLocaleString()}</p><p><b>${esc(o.name)}</b> · ${esc(o.phone)} ${o.email?"· "+esc(o.email):""}</p><p>${esc(o.address)}, ${esc(o.city)}, ${esc(o.region)}</p>${o.notes?`<p><i>Notes: ${esc(o.notes)}</i></p>`:""}<p>Payment: ${esc(o.payment)}</p><table class="t" style="margin:12px 0">${o.items.map(i=>`<tr><td>${i.qty} × ${esc(i.name)}</td><td>${money(i.price*i.qty)}</td></tr>`).join("")}<tr><td>Delivery</td><td>${money(o.delivery)}</td></tr><tr><td><b>Total</b></td><td><b>${money(o.total)}</b></td></tr></table><a class="btn" target="_blank" rel="noopener" href="https://wa.me/${esc(o.phone.replace(/\D/g,"").replace(/^0/,"233"))}">${ic("whatsapp",18)} Message customer</a>`)})}
function requests(){
 $("#body").innerHTML=`<div class="panel">${D.requests.length?`<table class="t"><tr><th>Customer</th><th>Car</th><th>Part wanted</th><th>Status</th></tr>${[...D.requests].reverse().map(r=>`<tr><td>${esc(r.name)}<br><span class="muted">${esc(r.phone)}</span></td><td>${esc(r.car)}<br><span class="muted">${esc(r.vin)}</span></td><td>${esc(r.part)}</td><td><select data-r="${r.id}">${["New","Contacted","Closed"].map(s=>`<option ${s===r.status?"selected":""}>${s}</option>`).join("")}</select></td></tr>`).join("")}</table>`:`<p class="muted">No part requests yet.</p>`}</div>`;
 $$("[data-r]").forEach(s=>s.onchange=async()=>{await api("/requests/"+s.dataset.r,{method:"PATCH",body:{status:s.value}});toast("Updated")})}
function customers(){$("#body").innerHTML=`<div class="panel">${D.users.length?`<table class="t"><tr><th>Name</th><th>Phone</th><th>Email</th><th>Joined</th><th>Orders</th></tr>${D.users.map(u=>`<tr><td>${esc(u.name)}</td><td>${esc(u.phone)}</td><td>${esc(u.email)}</td><td>${new Date(u.created).toLocaleDateString()}</td><td>${D.orders.filter(o=>o.userId===u.id).length}</td></tr>`).join("")}</table>`:`<p class="muted">No registered customers yet.</p>`}</div>`}

/* ---------- generic CRUD ---------- */
function modal(h){let m=$("#am");if(!m){m=document.createElement("div");m.id="am";m.className="mback";document.body.appendChild(m)}m.innerHTML=`<div class="modal modalA"><button class="x" data-x>${ic("x",22)}</button>${h}</div>`;m.classList.add("on");m.onclick=e=>{if(e.target===m||e.target.closest("[data-x]"))m.classList.remove("on")};return m}
const closeModal=()=>$("#am").classList.remove("on");
function cell(k,col,x){const[f,t,r]=col,v=x[f];
 if(t==="img")return `<img class="thumb" src="${esc(url(v))}" alt="" onerror="this.style.opacity=.2">`;
 if(t==="bool")return `<span class="badge2 ${v?"on2":"off2"}">${v?"Active":"Hidden"}</span>`;
 if(t==="money")return money(v);
 if(t==="ref"){const o=(D[r]||[]).find(y=>y.id===v);return esc(o?o.name:v)}
 if(t==="icon")return ic(v,22);if(t==="flag")return v?`<img class="flag" src="https://flagcdn.com/w40/${esc(v)}.png" alt="">`:"";
 return esc(String(v==null?"":v).slice(0,70))}
function crud(k){
 const sc=SC[k];let q="";
 const draw=()=>{const list=D[k].map((x,i)=>({x,i})).filter(({x})=>!q||JSON.stringify(x).toLowerCase().includes(q));
  $("#body").innerHTML=`<div class="tools"><input id="q" placeholder="Search…" value="${esc(q)}"></div><div class="panel"><table class="t"><tr>${sc.cols.map(c=>`<th>${c[0][0].toUpperCase()+c[0].slice(1)}</th>`).join("")}<th></th></tr>${list.map(({x,i})=>`<tr>${sc.cols.map(c=>`<td>${cell(k,c,x)}</td>`).join("")}<td class="acts">${sc.move?`<button data-mv="${i}:-1" title="Move up">${ic("chevu",16)}</button><button data-mv="${i}:1" title="Move down">${ic("chevd",16)}</button>`:""}<button data-ed="${i}" title="Edit">${ic("edit",16)}</button><button class="del" data-dl="${i}" title="Delete">${ic("trash",16)}</button></td></tr>`).join("")||`<tr><td colspan="9" class="muted">Nothing here yet.</td></tr>`}</table></div>`;
  $("#q").oninput=e=>{q=e.target.value.toLowerCase();draw();$("#q").focus();$("#q").setSelectionRange(q.length,q.length)};
  $$("[data-ed]").forEach(b=>b.onclick=()=>edit(+b.dataset.ed));
  $$("[data-dl]").forEach(b=>b.onclick=async()=>{const x=D[k][+b.dataset.dl];if(!confirm("Delete “"+(x.name||x.title||x.text||x.slug)+"”? This cannot be undone."))return;D[k].splice(+b.dataset.dl,1);await save(k);draw()});
  $$("[data-mv]").forEach(b=>b.onclick=async()=>{const[i,d]=b.dataset.mv.split(":").map(Number),j=i+d;if(j<0||j>=D[k].length)return;[D[k][i],D[k][j]]=[D[k][j],D[k][i]];await save(k);draw()})};
 $("#topr").innerHTML=`<button class="btn" id="add">${ic("plus",18)} Add new</button>`;$("#add").onclick=()=>edit(-1);
 function edit(i){const nw=i<0,x=nw?JSON.parse(JSON.stringify(sc.blank)):{...D[k][i]};
  const fld=([f,t,h])=>{const v=x[f]==null?"":x[f],lab=f[0].toUpperCase()+f.slice(1);const hint=h?`<small>${esc(h)}</small>`:"";
   if(t==="bool")return `<label style="grid-template-columns:auto 1fr;align-items:center"><input type="checkbox" name="${f}" ${v?"checked":""}> <span>${lab} ${hint}</span></label>`;
   if(t==="area")return `<label class="full">${lab}${hint}<textarea name="${f}" rows="5">${esc(v)}</textarea></label>`;
   if(t==="num")return `<label>${lab}${hint}<input type="number" step="any" name="${f}" value="${esc(v)}"></label>`;
   if(t==="ref")return `<label>${lab}<select name="${f}">${refOpts(h).map(o=>`<option value="${esc(o[0])}" ${o[0]===v?"selected":""}>${esc(o[1])}</option>`).join("")}</select></label>`;
   if(t==="icon")return `<label>Icon<select name="${f}">${(window.IC_NAMES||[]).map(n=>`<option ${n===v?"selected":""}>${n}</option>`).join("")}</select></label>`;
   if(t==="image")return `<label class="full">${lab}${hint}<div class="imgf"><img class="thumb" id="pv_${f}" src="${esc(url(v))}" alt=""><input name="${f}" value="${esc(v)}" placeholder="https://… or upload →"><button type="button" class="btn out sm" data-up="${f}">${ic("upload",16)} Upload</button><input type="file" accept="image/*" hidden id="fi_${f}"></div></label>`;
   return `<label ${f==="title"||f==="name"||f==="text"?'class="full"':""}>${lab}${hint}<input name="${f}" value="${esc(v)}"></label>`};
  const m=modal(`<h3>${nw?"Add":"Edit"} ${sc.label.replace(/s$/,"")}</h3><form id="ef"><div class="fg">${sc.f.map(a=>fld(a)).join("")}</div><div style="display:flex;gap:10px;margin-top:18px;justify-content:flex-end"><button type="button" class="btn out" data-x>Cancel</button><button class="btn">Save</button></div></form>`);
  $$("[data-up]",m).forEach(b=>{const f=b.dataset.up,fi=$("#fi_"+f,m);b.onclick=()=>fi.click();
   fi.onchange=()=>{const file=fi.files[0];if(!file)return;if(file.size>6e6)return toast("Image too large (max 6 MB)",1);const r=new FileReader();r.onload=async()=>{try{const j=await api("/upload",{method:"POST",body:{data:r.result}});$(`[name=${f}]`,m).value=j.url;$("#pv_"+f,m).src=url(j.url);toast("Image uploaded")}catch(er){toast(er.message,1)}};r.readAsDataURL(file)}});
  $("[name=image]",m)&&($("[name=image]",m).oninput=e=>{$("#pv_image",m).src=url(e.target.value)});
  $("#ef").onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target);
   sc.f.forEach(([f,t])=>{x[f]=t==="bool"?fd.get(f)==="on":t==="num"?Number(fd.get(f)||0):(fd.get(f)||"").trim?(fd.get(f)||"").trim():fd.get(f)});
   if(nw){if(sc.idk){if(!x[sc.idk])return toast("A URL name is required",1);if(D[k].some(y=>y[sc.idk]===x[sc.idk]))return toast("That URL name already exists",1)}else x.id=uid(sc.id||"i");if(k==="products"||k==="categories")x.slug=x.id;D[k].push(x)}else D[k][i]=x;
   await save(k);closeModal();draw()}}
 draw()}

/* ---------- settings ---------- */
function settings(){
 const s=D.settings,f=s.footer||{};
 const lines=(a,fn)=>(a||[]).map(fn).join("\n");
 const inp=(k,l,t,h)=>`<label>${l}${h?`<small>${h}</small>`:""}<input name="${k}" type="${t||"text"}" value="${esc(s[k])}"></label>`;
 $("#body").innerHTML=`<form id="sf"><div class="panel"><h3>Store identity</h3><div class="fg">${inp("name","Store name")}${inp("tagline","Tagline")}${inp("logoText","Logo text")}${inp("logoSub","Logo subtext")}${inp("green","Brand colour","color","Buttons, nav bar and highlights")}${inp("currency","Currency symbol")}</div></div>
 <div class="panel"><h3>Contact</h3><div class="fg">${inp("phone","Phone (shown on site)")}${inp("whatsapp","WhatsApp number","text","International format, digits only e.g. 233591972828")}${inp("email","Email")}${inp("address","Address")}</div></div>
 <div class="panel"><h3>Top bar & deals</h3><div class="fg">${inp("topbarText","Top bar message")}${inp("topbarButton","Top bar button text")}${inp("dealTitle","Deal banner title")}${inp("dealEnds","Deal countdown ends","datetime-local")}</div><p class="muted" style="margin-top:8px">Rotating announcements are managed under “Announcements”.</p></div>
 <div class="panel"><h3>Delivery & points</h3><div class="fg">${inp("deliveryFee","Delivery fee","number")}${inp("freeShippingOver","Free delivery above","number")}${inp("pointsRate","MotorPoints per 1 currency unit","number")}<label>Payment methods<small>One per line</small><textarea name="paymentMethods" rows="3">${esc((s.paymentMethods||[]).join("\n"))}</textarea></label></div></div>
 <div class="panel"><h3>Navigation & footer</h3><div class="fg"><label class="full">Green nav-bar links<small>One per line: Label | link</small><textarea name="navLinks" rows="6">${esc(lines(s.navLinks,l=>l.label+" | "+l.url))}</textarea></label>
 <label>Footer – Account links<textarea name="f_account" rows="4">${esc(lines(f.account,l=>l.label+" | "+l.url))}</textarea></label><label>Footer – Help links<textarea name="f_help" rows="4">${esc(lines(f.help,l=>l.label+" | "+l.url))}</textarea></label><label>Footer – Marketplace links<textarea name="f_market" rows="4">${esc(lines(f.market,l=>l.label+" | "+l.url))}</textarea></label>${inp("copyright","Copyright line")}</div></div>
 <div class="panel"><h3>Trust badges & WhatsApp block</h3><div class="fg"><label class="full">Trust badges<small>One per line: icon | title | text (icons: ${["truck","chat","shield","tag","gift","clock","card","check"].join(", ")})</small><textarea name="trust" rows="3">${esc(lines(s.trust,t=>t.icon+" | "+t.title+" | "+t.text))}</textarea></label>${inp("waTitle","WhatsApp block title")}${inp("waText","WhatsApp block text")}<label class="full">Bullet points<small>One per line</small><textarea name="waBullets" rows="3">${esc((s.waBullets||[]).join("\n"))}</textarea></label></div></div>
 <button class="btn">${ic("check",18)} Save settings</button></form>
 <div class="panel" style="margin-top:20px"><h3>Change admin password</h3><form id="pf" class="fg"><label>New password<input type="password" name="p" minlength="6" required></label><label>&nbsp;<button class="btn">Update password</button></label></form></div>`;
 const ln=t=>t.split("\n").map(x=>x.trim()).filter(Boolean);
 $("#sf").onsubmit=async e=>{e.preventDefault();const fd=Object.fromEntries(new FormData(e.target));const n=s;
  ["name","tagline","logoText","logoSub","green","currency","phone","whatsapp","email","address","topbarText","topbarButton","dealTitle","copyright","waTitle","waText"].forEach(k=>n[k]=fd[k]);
  n.dealEnds=fd.dealEnds;["deliveryFee","freeShippingOver","pointsRate"].forEach(k=>n[k]=Number(fd[k]));
  n.paymentMethods=ln(fd.paymentMethods);n.waBullets=ln(fd.waBullets);
  const L=t=>ln(t).map(x=>{const[a,b]=x.split("|").map(y=>y.trim());return{label:a,url:b||"#"}});n.navLinks=L(fd.navLinks);n.footer={account:L(fd.f_account),help:L(fd.f_help),market:L(fd.f_market)};
  n.trust=ln(fd.trust).map(x=>{const[i,t,tx]=x.split("|").map(y=>y.trim());return{icon:i||"check",title:t||"",text:tx||""}});await save("settings")};
 $("#pf").onsubmit=async e=>{e.preventDefault();try{await api("/password",{method:"POST",body:{password:new FormData(e.target).get("p")}});toast("Password updated");e.target.reset()}catch(er){toast(er.message,1)}};
}
if(tok.get())start();else login();
})();
