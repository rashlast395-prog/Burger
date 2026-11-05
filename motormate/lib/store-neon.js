/* Neon Postgres store (Vercel). Set DATABASE_URL. Tables are created automatically. */
const {neon}=require("@neondatabase/serverless");
const {initialDb}=require("./api");
let sql,ready=null;
const KEYS=["settings","announcements","slides","categories","brands","products","sections","banners","pages","orders","users","requests","secret","adminHash"];
function init(){
 if(!ready)ready=(async()=>{
  sql=neon(process.env.DATABASE_URL);
  await sql`create table if not exists kv(key text primary key, value jsonb not null)`;
  await sql`create table if not exists images(name text primary key, mime text not null, data bytea not null)`;
  const rows=await sql`select count(*)::int as n from kv`;
  if(!rows[0].n){const d=initialDb();for(const k of KEYS)await sql`insert into kv(key,value) values(${k},${JSON.stringify(d[k])}::jsonb) on conflict (key) do nothing`}
 })().catch(e=>{ready=null;throw e});
 return ready;
}
module.exports={
 async load(){await init();const rows=await sql`select key,value from kv`;const db={};for(const r of rows)db[r.key]=r.value;return db},
 async save(db,keys){await init();for(const k of keys)await sql`insert into kv(key,value) values(${k},${JSON.stringify(db[k])}::jsonb) on conflict (key) do update set value=excluded.value`},
 async append(db,key,item){await init();await sql`update kv set value = value || ${JSON.stringify([item])}::jsonb where key=${key}`;db[key].push(item)},
 async putImage(name,mime,buf){await init();await sql`insert into images(name,mime,data) values(${name},${mime},${buf})`;return "api/img/"+name},
 async getImage(name){await init();const r=await sql`select mime,data from images where name=${name}`;return r[0]?{mime:r[0].mime,data:Buffer.from(r[0].data)}:null}
};
