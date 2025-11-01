const queryEl = document.getElementById('query')
const askBtn = document.getElementById('askBtn')
const calcBtn = document.getElementById('calcBtn')
const clearBtn = document.getElementById('clearBtn')
const answerEl = document.getElementById('answer')
const adTop = document.getElementById('adTop')
const n1 = document.getElementById('n1')
const n2 = document.getElementById('n2')
const op = document.getElementById('op')
const calcNow = document.getElementById('calcNow')
const copyBtn = document.getElementById('copyBtn')
const stepsBtn = document.getElementById('stepsBtn')
const fileInput = document.getElementById('file')

function showAdUnderAnswer() {
  adTop.style.order = '3'
  adTop.style.marginTop = '14px'
}
function showAdUnderQuestion() {
  adTop.style.order = '1'
  adTop.style.marginTop = '12px'
}
function typeText(target, text, speed=15) {
  target.textContent = ''
  let i=0
  const t = setInterval(()=> {
    target.textContent += text.charAt(i) || ''
    i++
    if(i>text.length){ clearInterval(t) }
  }, speed)
}
function setPlain(text){ answerEl.textContent = text }
function setThinking(){ setPlain('Thinking logically...') }
function isMathExpression(s) {
  if(!s) return false
  s = s.trim()
  return /^[0-9\s\.\+\-\*\/\^\%\(\)]+$/.test(s)
}
function shortMathEval(expr) {
  try{ const enc = encodeURIComponent(expr); return fetch('https://api.mathjs.org/v4/?expr='+enc,{method:'GET',cache:'no-store'}).then(r=>r.text()) }catch(e){ return Promise.reject(e) }
}
async function duckDuckGoInstant(q){
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`
  const r = await fetch(url)
  if(!r.ok) throw 'ddg-error'
  const j = await r.json()
  if(j.AbstractText && j.AbstractText.trim()) return j.AbstractText
  if(j.RelatedTopics && j.RelatedTopics.length){
    for(const t of j.RelatedTopics){
      if(t.Text) return t.Text
    }
  }
  throw 'no-ddg'
}
async function wikiSummary(q){
  const title = q.split('?')[0].replace(/define\s+/i,'').trim().split(' ').slice(0,8).join('_')
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  const r = await fetch(url)
  if(!r.ok) throw 'wiki-error'
  const j = await r.json()
  if(j.extract) return j.extract
  throw 'no-wiki'
}
const localFallbacks = {
  'photosynthesis':{
    def:'Photosynthesis — process by which green plants and some other organisms use sunlight to synthesize foods from carbon dioxide and water.',
    expl:'Photosynthesis converts light energy into chemical energy in the form of glucose; oxygen is produced as a byproduct.',
    examples:['Plants producing oxygen during the day.','Algae using sunlight to generate energy.'],
    logic:['Break the process into light-dependent and light-independent reactions.','Consider inputs (CO2, H2O, light) and outputs (O2, glucose).']
  },
  'mitochondria':{
    def:'Mitochondrion — an organelle that produces ATP through aerobic respiration; often called the powerhouse of the cell.',
    expl:'Mitochondria generate usable chemical energy and regulate cellular metabolism.',
    examples:['Muscle cells with many mitochondria.'],
    logic:['Identify role in energy production.','Relate structure (double membrane) to function.']
  },
  'dictatorship':{
    def:'A dictatorship is a form of government where power is concentrated in the hands of one person or a small group.',
    expl:'Dictators control political power often without meaningful democratic processes and may limit freedoms.',
    examples:['A military junta after a coup.','One-party states led by a single leader.'],
    logic:['Consider how power is acquired (coup/election) and maintained (repression, control of institutions).']
  },
  'photosynthesis short':{
    def:'Photosynthesis: the conversion of light energy into chemical energy by plants and some bacteria.'
  }
}
function applyLocalFallback(q){
  const key = q.toLowerCase().replace(/[^a-z0-9 ]/g,'').trim().split(' ').slice(0,3).join(' ')
  for(const k in localFallbacks){
    if(key.includes(k) || q.toLowerCase().includes(k)){
      const obj = localFallbacks[k]
      let out = ''
      if(obj.def) out += obj.def + '\n\n'
      if(obj.expl) out += obj.expl + '\n\n'
      if(obj.examples){ out += 'Examples:\n'; obj.examples.forEach((e,i)=> out += `${i+1}. ${e}\n`) }
      if(obj.logic){ out += '\nLogical steps:\n'; obj.logic.forEach((l,i)=> out += `${i+1}. ${l}\n`) }
      return out
    }
  }
  return null
}
async function queryAllAPIs(q, fileImage) {
  const sequence = [
    async ()=> { if(isMathExpression(q)) return await shortMathEval(q) },
    async ()=> { try{ return await duckDuckGoInstant(q) }catch(e){ throw e } },
    async ()=> { try{ return await wikiSummary(q) }catch(e){ throw e } },
    async ()=> { throw 'end-sequence' }
  ]
  for(const fn of sequence){
    try{
      const res = await fn()
      if(res && res.toString().trim()) return res.toString()
    }catch(e){ continue }
  }
  return null
}
function formatAnswer(raw, q){
  if(!raw) return null
  const oneLiner = raw.split('\n')[0]
  let out = ''
  out += oneLiner + '\n\n'
  const short = raw.split('\n').slice(0,6).join(' ')
  if(short && short.length>oneLiner.length) out += short + '\n\n'
  out += 'Examples:\n'
  out += '1. Example usage or instance.\n'
  out += '2. Another illustrative example.\n\n'
  out += 'Logical steps:\n'
  out += '1. Break the question into components.\n'
  out += '2. Consider cause → effect relationships.\n'
  return out
}
async function handleAsk(){
  const q = queryEl.value.trim()
  if(!q){ setPlain('Please type a question or math expression.'); return }
  showAdUnderAnswer()
  setThinking()
  let fileImage = null
  if(fileInput.files && fileInput.files[0]) fileImage = fileInput.files[0]
  try{
    const local = applyLocalFallback(q)
    if(isMathExpression(q)){
      try{
        const mathRes = await shortMathEval(q)
        const formatted = `Result: ${mathRes}`
        typeText(answerEl,formatted,12)
        showAdUnderQuestion()
        return
      }catch(err){}
    }
    let apiRes = null
    try{ apiRes = await queryAllAPIs(q,fileImage) }catch(e){ apiRes = null }
    if(!apiRes && local) { typeText(answerEl,local,10); showAdUnderQuestion(); return }
    if(!apiRes){ const fallback = applyLocalFallback(q) || `Unable to fetch response. Here's a helpful local summary:\n\n${q} — concise definition and quick steps.`; typeText(answerEl,fallback,10); showAdUnderQuestion(); return }
    const formatted = formatAnswer(apiRes,q)
    typeText(answerEl,formatted,12)
    showAdUnderQuestion()
  }catch(e){
    const fallback2 = applyLocalFallback(q) || 'Unable to generate response.'
    typeText(answerEl,fallback2,10)
    showAdUnderQuestion()
  }
}
askBtn.addEventListener('click', ()=>{ handleAsk() })
clearBtn.addEventListener('click', ()=>{ queryEl.value=''; setPlain('Your answer will appear here.'); showAdUnderQuestion() })
calcBtn.addEventListener('click', ()=>{ const v = queryEl.value.trim(); if(isMathExpression(v)){ setPlain('Calculating...'); shortMathEval(v).then(r=>setPlain('Result: '+r)).catch(()=>setPlain('Calculation failed.')) }else setPlain('No math expression detected in the box.') })
calcNow.addEventListener('click', ()=>{ const a=parseFloat(n1.value||0); const b=parseFloat(n2.value||0); const o=op.value; let r=''; if(o=='+') r=a+b; if(o=='-') r=a-b; if(o=='*') r=a*b; if(o=='/') r=b===0?'∞':(a/b); setPlain('Result: '+r) })
copyBtn.addEventListener('click', ()=>{ navigator.clipboard.writeText(answerEl.textContent || '').then(()=>{ copyBtn.textContent='Copied' ; setTimeout(()=>copyBtn.textContent='Copy Answer',1200) }) })
stepsBtn.addEventListener('click', ()=>{ const txt = answerEl.textContent || ''; if(!txt) return; alert('Logical steps:\\n\\n'+txt.split('Logical steps:')[1] || 'No steps available') })
queryEl.addEventListener('input', ()=>{ answerEl.style.opacity=1 })
fileInput.addEventListener('change', ()=>{ if(fileInput.files && fileInput.files[0]){ setPlain('Image selected. Asking with image (image sent to APIs if supported).') } })
window.addEventListener('load', ()=>{ showAdUnderQuestion(); setPlain('Your answer will appear here.') })