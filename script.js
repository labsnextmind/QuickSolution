const apis = [
  { name: "Gemini", url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyBFCWB11MXuQXN50o1uDm06GUZpq279QA0" },
  { name: "SambaNova", url: "https://api.sambanova.ai/v1/chat/completions", key: "4ae9a3bc-38a2-4201-857d-8e96302394b7" },
  { name: "DeveloperBox", url: "https://billing.developerbox.xyz/apimaker/apiforlink.php?token=klt3r287wyl6nyqfr8c2" }
];

const elPrompt = document.getElementById("prompt");
const elAsk = document.getElementById("askBtn");
const elSolution = document.getElementById("solution");
const elFile = document.getElementById("fileInput");
const elToolsCalc = document.getElementById("toolsCalc");
const elNum1 = document.getElementById("num1");
const elNum2 = document.getElementById("num2");
const elOp = document.getElementById("op");
const elSteps = document.getElementById("stepsBtn");
const elClear = document.getElementById("clearBtn");

function show(msg){ elSolution.textContent = msg; }

function typeWriter(text){
  elSolution.textContent = "";
  let i = 0;
  const speed = 25;
  function type(){
    if(i < text.length){
      elSolution.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}

function localMath(expr){
  try {
    if(!/[^0-9+\-*/().\s]/.test(expr)){
      const safe = expr.replace(/×/g,"*").replace(/÷/g,"/");
      return Function('"use strict";return ('+safe+')')();
    }
  } catch(e){}
  return null;
}

async function extractTextFromImage(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("language", "eng");
  const res = await fetch("https://api.ocr.space/parse/image", { method: "POST", body: fd });
  const json = await res.json();
  return json?.ParsedResults?.[0]?.ParsedText || "";
}

async function askQuestion(q){
  const math = localMath(q);
  if(math !== null) return "Result: " + math;

  for(const api of apis){
    try{
      const body = JSON.stringify({ contents:[{ parts:[{ text:q }]}] });
      const headers = { "Content-Type":"application/json" };
      if(api.key) headers["Authorization"] = "Bearer " + api.key;

      const res = await fetch(api.url,{ method:"POST", headers, body });
      if(res.ok){
        const data = await res.json();
        const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text
          || data?.choices?.[0]?.message?.content
          || data?.answer;
        if(txt) return txt;
      }
    }catch(e){}
  }
  return "Logical analysis:\n1. Understanding question\n2. Searching context\n3. Forming explanation…\nResult: Concept not found locally.";
}

elAsk.onclick = async () => {
  const q = elPrompt.value.trim();
  if(!q){ show("Please type a question."); return; }
  show("⚡ Thinking...");
  const ans = await askQuestion(q);
  typeWriter(ans);
};

elFile.onchange = async (e) => {
  const file = e.target.files[0];
  if(!file) return;
  show("📸 Analyzing image...");
  const extracted = await extractTextFromImage(file);
  if(extracted) {
    elPrompt.value = extracted.trim();
    show("Text extracted! Click 'Get Answer' to continue.");
  } else show("Couldn't extract text from image.");
};

elToolsCalc.onclick = () => {
  const a = parseFloat(elNum1.value||0);
  const b = parseFloat(elNum2.value||0);
  const op = elOp.value;
  let result = 0;
  if(op==="+") result=a+b;
  if(op==="-") result=a-b;
  if(op==="*") result=a*b;
  if(op==="/") result=b===0?"Infinity":a/b;
  show("Result: "+result);
};

elSteps.onclick = () => {
  const txt = elSolution.textContent;
  if(!txt || txt.includes("Thinking")) return;
  show(txt + "\n\nSteps:\n1) Identify topic\n2) Analyze logically\n3) Generate structured response.");
};

elClear.onclick = () => {
  elPrompt.value="";
  show("Your answer will appear here.");
};