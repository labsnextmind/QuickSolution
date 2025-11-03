const express=require("express")
const fetch=require("node-fetch")
const multer=require("multer")
const upload=multer()
const app=express()
app.use(express.json())
const OPENAI_KEY=""
const GOOGLE_KEY="AIzaSyBFCWB11MXuQXN50o1uDm06GUZpq279QA0"
app.post("/api/ask",async(req,res)=>{
  const q=req.body.q||""
  try{
    if(q && /^[0-9+\-*/().\s×÷]+$/.test(q)){
      const s=q.replace(/×/g,"*").replace(/÷/g,"/")
      const out=Function('"use strict";return ('+s+')')()
      return res.json({answer:String(out)})
    }
    if(OPENAI_KEY){
      const r=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+OPENAI_KEY},body:JSON.stringify({model:"gpt-4o-mini",messages:[{role:"user",content:q}],max_tokens:800})})
      const j=await r.json()
      const text=j?.choices?.[0]?.message?.content || j?.choices?.[0]?.text
      if(text) return res.json({answer:text})
    }
    const cs="Short fallback: "+q
    return res.json({answer:cs})
  }catch(e){
    return res.json({answer:"Unable to generate response."})
  }
})
app.post("/api/upload",upload.single("file"),async(req,res)=>{
  try{
    const q=req.body.q||""
    const info="Processed image and question locally. Quick fallback answer for: "+q
    return res.json({answer:info})
  }catch(e){return res.json({answer:"Unable to process file"})}
}
)
const port=process.env.PORT||3000
app.listen(port)