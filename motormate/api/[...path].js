/* Vercel serverless entry for every /api/* route. Needs the DATABASE_URL env var (Neon Postgres). */
const {makeHandler}=require("../lib/api");
const store=require("../lib/store-neon");
const handle=makeHandler(store);
module.exports=async(req,res)=>{
 if(!process.env.DATABASE_URL){res.statusCode=503;res.setHeader("Content-Type","application/json");return res.end(JSON.stringify({error:"DATABASE_URL is not set"}))}
 return handle(req,res);
};
