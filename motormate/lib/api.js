/* Shared API handler used by the local server (server.js) and Vercel (api/[...path].js). */
const crypto=require("crypto");
const WRITABLE=["settings","announcements","slides","categories","brands","products","sections","banners","pages"];
const hash=(pw,salt=crypto.randomBytes(12).toString("hex"))=>salt+":"+crypto.scryptSync(pw,salt,32).toString("hex");
const verify=(pw,h)=>{const[s]=h.split(":");try{return crypto.timingSafeEqual(Buffer.from(hash(pw,s)),Buffer.from(h))}catch(e){return false}};
const uid=p=>p+Date.now().toString(36)+crypto.randomBytes(3).toString("hex");
const clean=s=>String(s==null?"":s).slice(0,500);

function initialDb(){
 return {...JSON.parse(JSON.stringify(require("../js/seed.js"))),orders:[],users:[],requests:[],
  secret:crypto.randomBytes(24).toString("hex"),adminHash:hash(process.env.ADMIN_PASSWORD||"admin123")};
}

function readBody(q){
 return new Promise((res,rej)=>{
  if(q.body&&typeof q.body==="object"&&!Buffer.isBuffer(q.body))return res(q.body);
  const d=[];let n=0;
  q.on("data",c=>{n+=c.length;if(n>12e6){rej(new Error("too large"));q.destroy()}else d.push(c)});
  q.on("end",()=>{try{res(d.length?JSON.parse(Buffer.concat(d)):{})}catch(e){rej(e)}});
  q.on("error",rej);
 });
}

function makeHandler(store){
 const sign=(db,o)=>{const b=Buffer.from(JSON.stringify({...o,exp:Date.now()+30*864e5})).toString("base64url");return b+"."+crypto.createHmac("sha256",db.secret).update(b).digest("base64url")};
 const unsign=(db,tok)=>{if(!tok)return null;const[b,s]=tok.split(".");if(!b||!s)return null;
  if(crypto.createHmac("sha256",db.secret).update(b).digest("base64url")!==s)return null;
  try{const o=JSON.parse(Buffer.from(b,"base64url"));return o.exp>Date.now()?o:null}catch(e){return null}};
 const publicDb=db=>{const o={};for(const k of WRITABLE)o[k]=db[k];return o};
 const send=(r,c,o)=>{r.statusCode=c;r.setHeader("Content-Type","application/json");r.setHeader("Cache-Control","no-store");r.end(JSON.stringify(o))};

 return async function handle(q,r){
  const u=new URL(q.url,"http://x"),m=q.method,p=u.pathname.replace(/\/+$/,"");
  try{
   const db=await store.load();
   const me=unsign(db,(q.headers.authorization||"").replace("Bearer ",""));
   if(m==="GET"&&p==="/api/public"){r.setHeader("Cache-Control","no-store");return send(r,200,publicDb(db))}
   const im=p.match(/^\/api\/img\/([\w.-]+)$/);
   if(m==="GET"&&im){const f=await store.getImage(im[1]);if(!f){r.statusCode=404;return r.end()}r.statusCode=200;r.setHeader("Content-Type",f.mime);r.setHeader("Cache-Control","public, max-age=31536000, immutable");return r.end(f.data)}
   const b=["POST","PUT","PATCH"].includes(m)?await readBody(q):{};

   if(m==="POST"&&p==="/api/auth/register"){
    const phone=clean(b.phone).replace(/\s/g,""),name=clean(b.name);
    if(!name||phone.length<9||String(b.password||"").length<6)return send(r,400,{error:"Enter your name, a valid phone number and a password of at least 6 characters."});
    if(db.users.find(x=>x.phone===phone))return send(r,409,{error:"An account with this phone number already exists."});
    const user={id:uid("u"),name,phone,email:clean(b.email),hash:hash(b.password),created:new Date().toISOString()};
    await store.append(db,"users",user);
    return send(r,200,{token:sign(db,{role:"user",id:user.id}),user:{id:user.id,name,phone,email:user.email}});
   }
   if(m==="POST"&&p==="/api/auth/login"){
    const phone=clean(b.phone).replace(/\s/g,""),user=db.users.find(x=>x.phone===phone);
    if(!user||!verify(String(b.password||""),user.hash))return send(r,401,{error:"Incorrect phone number or password."});
    return send(r,200,{token:sign(db,{role:"user",id:user.id}),user:{id:user.id,name:user.name,phone:user.phone,email:user.email}});
   }
   if(m==="GET"&&p==="/api/me"){
    const user=me&&me.role==="user"&&db.users.find(x=>x.id===me.id);if(!user)return send(r,401,{error:"Not signed in"});
    return send(r,200,{user:{id:user.id,name:user.name,phone:user.phone,email:user.email},orders:db.orders.filter(o=>o.userId===user.id||String(o.phone).replace(/\s/g,"")===user.phone).reverse()});
   }
   if(m==="POST"&&p==="/api/track"){
    const o=db.orders.find(x=>x.id.toUpperCase()===clean(b.id).trim().toUpperCase()&&String(x.phone).replace(/\s/g,"")===clean(b.phone).replace(/\s/g,""));
    if(!o)return send(r,404,{error:"No order found with that number and phone."});
    return send(r,200,{order:{id:o.id,status:o.status,created:o.created,total:o.total,items:o.items,payment:o.payment}});
   }
   if(m==="POST"&&p==="/api/orders"){
    const items=Array.isArray(b.items)?b.items:[];if(!items.length||!clean(b.name)||!clean(b.phone)||!clean(b.address))return send(r,400,{error:"Please fill in your name, phone, address and cart."});
    let subtotal=0;const lines=[];
    for(const it of items){const pr=db.products.find(x=>x.id===it.id);if(!pr||pr.active===false)continue;const qty=Math.max(1,Math.min(99,parseInt(it.qty)||1));subtotal+=pr.price*qty;lines.push({id:pr.id,name:pr.name,price:pr.price,qty});}
    if(!lines.length)return send(r,400,{error:"Items in your cart are no longer available."});
    const s=db.settings,delivery=subtotal>=s.freeShippingOver?0:s.deliveryFee;
    const order={id:"MM"+(1001+db.orders.length),userId:me&&me.role==="user"?me.id:null,name:clean(b.name),phone:clean(b.phone),email:clean(b.email),region:clean(b.region),city:clean(b.city),address:clean(b.address),notes:clean(b.notes),payment:clean(b.payment),items:lines,subtotal,delivery,total:subtotal+delivery,status:"Pending",created:new Date().toISOString()};
    await store.append(db,"orders",order);return send(r,200,{order});
   }
   if(m==="POST"&&p==="/api/requests"){
    if(!clean(b.name)||!clean(b.phone)||!clean(b.part))return send(r,400,{error:"Name, phone and the part you need are required."});
    await store.append(db,"requests",{id:uid("r"),name:clean(b.name),phone:clean(b.phone),car:clean(b.car),vin:clean(b.vin),part:clean(b.part),status:"New",created:new Date().toISOString()});return send(r,200,{ok:true});
   }
   if(m==="POST"&&p==="/api/admin/login"){
    if(!verify(String(b.password||""),db.adminHash))return send(r,401,{error:"Wrong admin password."});
    return send(r,200,{token:sign(db,{role:"admin"})});
   }
   if(p.startsWith("/api/admin/")){
    if(!me||me.role!=="admin")return send(r,401,{error:"Admin sign-in required"});
    if(m==="GET"&&p==="/api/admin/all")return send(r,200,{...publicDb(db),orders:db.orders,requests:db.requests,users:db.users.map(({hash,...x})=>x)});
    const mm=p.match(/^\/api\/admin\/db\/(\w+)$/);
    if(m==="PUT"&&mm){if(!WRITABLE.includes(mm[1]))return send(r,400,{error:"Unknown collection"});db[mm[1]]=b.value;await store.save(db,[mm[1]]);return send(r,200,{ok:true})}
    const om=p.match(/^\/api\/admin\/(orders|requests)\/([\w-]+)$/);
    if(m==="PATCH"&&om){const it=db[om[1]].find(x=>x.id===om[2]);if(!it)return send(r,404,{error:"Not found"});if(b.status)it.status=clean(b.status);await store.save(db,[om[1]]);return send(r,200,{ok:true})}
    if(m==="POST"&&p==="/api/admin/upload"){
     const mt=String(b.data||"").match(/^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/);if(!mt)return send(r,400,{error:"Upload a PNG, JPG, WEBP or GIF image."});
     const ext=mt[1].replace("jpeg","jpg"),name=uid("img")+"."+ext;
     const urlOut=await store.putImage(name,"image/"+(ext==="jpg"?"jpeg":ext),Buffer.from(mt[2],"base64"));return send(r,200,{url:urlOut});
    }
    if(m==="POST"&&p==="/api/admin/password"){if(String(b.password||"").length<6)return send(r,400,{error:"Use at least 6 characters."});db.adminHash=hash(b.password);await store.save(db,["adminHash"]);return send(r,200,{ok:true})}
   }
   return send(r,404,{error:"Not found"});
  }catch(e){console.error(e);if(!r.headersSent)send(r,500,{error:"Server error"})}
 };
}
module.exports={makeHandler,initialDb};
