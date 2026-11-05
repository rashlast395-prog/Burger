/* Local JSON-file store (node server.js). */
const fs=require("fs"),path=require("path");
const {initialDb}=require("./api");
const ROOT=path.join(__dirname,".."),DATA=path.join(ROOT,"data"),FILE=path.join(DATA,"db.json"),UP=path.join(ROOT,"uploads");
fs.mkdirSync(DATA,{recursive:true});fs.mkdirSync(UP,{recursive:true});
let db=fs.existsSync(FILE)?JSON.parse(fs.readFileSync(FILE,"utf8")):initialDb();
let t=null;const flush=()=>{clearTimeout(t);t=setTimeout(()=>fs.writeFileSync(FILE,JSON.stringify(db,null,1)),50)};flush();
module.exports={
 async load(){return db},
 async save(_db,_keys){flush()},
 async append(_db,key,item){db[key].push(item);flush()},
 async putImage(name,mime,buf){fs.writeFileSync(path.join(UP,name),buf);return "uploads/"+name},
 async getImage(){return null}
};
