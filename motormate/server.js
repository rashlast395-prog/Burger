/* MotorMate Ghana – local server (static files + JSON API, data in data/db.json).
   Run:  node server.js     Store: http://localhost:3000    Admin: http://localhost:3000/admin/
   Default admin password: admin123  (change it in Admin > Settings, or set ADMIN_PASSWORD before first run)
   On Vercel the same API runs from api/[...path].js with a Neon Postgres database instead. */
const http=require("http"),fs=require("fs"),path=require("path");
const {makeHandler}=require("./lib/api"),store=require("./lib/store-file");
const handle=makeHandler(store),ROOT=__dirname,PORT=process.env.PORT||3000;
const MIME={".html":"text/html",".css":"text/css",".js":"text/javascript",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".gif":"image/gif",".ico":"image/x-icon"};
http.createServer((q,r)=>{
 const u=new URL(q.url,"http://x");
 if(u.pathname.startsWith("/api/"))return handle(q,r);
 let f=decodeURIComponent(u.pathname);if(f.endsWith("/"))f+="index.html";
 const full=path.normalize(path.join(ROOT,f)),rel=path.relative(ROOT,full);
 const blocked=rel.startsWith("..")||/^(data|lib|node_modules|api)([\\/]|$)/.test(rel)||/^(server\.js|package(-lock)?\.json|vercel\.json)$/.test(rel)||/(^|[\\/])\./.test(rel);
 if(blocked||!fs.existsSync(full)||fs.statSync(full).isDirectory()){r.writeHead(404);return r.end("Not found")}
 r.writeHead(200,{"Content-Type":MIME[path.extname(full).toLowerCase()]||"application/octet-stream"});fs.createReadStream(full).pipe(r);
}).listen(PORT,()=>console.log("MotorMate Ghana running:  http://localhost:"+PORT+"   Admin: http://localhost:"+PORT+"/admin/"));
