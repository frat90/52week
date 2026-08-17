const STORAGE_KEY = "52weekchallenge-v1";
const TOTAL = 1378;

let data = loadData();
let selectedWeek = null;

const $ = id => document.getElementById(id);
const euro = value => new Intl.NumberFormat("it-IT",{style:"currency",currency:"EUR",maximumFractionDigits:2}).format(Number(value)||0);

function loadData(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}
function saveData(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

function render(){
  const entries = Object.values(data);
  const completed = entries.length;
  const saved = entries.reduce((s,e)=>s+Number(e.amount||0),0);
  const expected = Array.from({length:completed},(_,i)=>i+1).reduce((a,b)=>a+b,0);
  const diff = saved-expected;
  $("completedCount").textContent = completed;
  $("savedAmount").textContent = euro(saved);
  $("expectedAmount").textContent = euro(expected);
  $("differenceAmount").textContent = (diff>=0?"+":"") + euro(diff);
  $("differenceLabel").textContent = diff > 0 ? "sei avanti rispetto al piano" : diff < 0 ? "sei sotto al piano" : "sei in linea";
  $("progressPercent").textContent = `${Math.round(completed/52*100)}% completato`;
  $("progressBar").style.width = `${completed/52*100}%`;

  const next = Array.from({length:52},(_,i)=>i+1).find(w=>!data[w]);
  if(!next){
    $("statusTitle").textContent = "Challenge completata";
    $("statusText").textContent = `Hai completato tutte le 52 settimane. Totale versato: ${euro(saved)}.`;
    $("nextBadge").textContent = "✓";
  }else{
    $("statusTitle").textContent = `Prossima: settimana ${next}`;
    $("statusText").textContent = `Obiettivo della settimana ${next}: ${euro(next)}.`;
    $("nextBadge").textContent = euro(next);
  }

  const filter = $("filterSelect").value;
  $("weeksGrid").innerHTML = "";
  for(let w=1;w<=52;w++){
    const done = !!data[w];
    if(filter==="done" && !done) continue;
    if(filter==="pending" && done) continue;
    const el=document.createElement("button");
    el.className="week"+(done?" done":"");
    const e=data[w];
    el.innerHTML=`
      <span class="week-num">SETTIMANA ${w}</span>
      <div class="week-amount">${euro(done?e.amount:w)}</div>
      <div class="week-meta">${done ? `${formatDate(e.date)}${e.notes ? " · "+escapeHtml(e.notes) : ""}` : "Da completare"}</div>
      <span class="week-check">${done?"✓":"+"}</span>`;
    el.addEventListener("click",()=>openModal(w));
    $("weeksGrid").appendChild(el);
  }
}
function formatDate(value){
  if(!value) return "";
  return new Intl.DateTimeFormat("it-IT").format(new Date(value+"T00:00:00"));
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}
function openModal(w){
  selectedWeek=w;
  const e=data[w];
  $("modalEyebrow").textContent=`SETTIMANA ${w}`;
  $("modalTitle").textContent=e?"Modifica versamento":"Registra versamento";
  $("modalTarget").textContent=euro(w);
  $("dateInput").value=e?.date || new Date().toISOString().slice(0,10);
  $("amountInput").value=e?.amount ?? w;
  $("notesInput").value=e?.notes || "";
  $("deleteBtn").classList.toggle("hidden",!e);
  $("modal").classList.remove("hidden");
  $("amountInput").focus();
}
function closeModal(){ $("modal").classList.add("hidden"); selectedWeek=null; }

$("weekForm").addEventListener("submit",ev=>{
  ev.preventDefault();
  const amount=Number($("amountInput").value);
  if(!Number.isFinite(amount) || amount<0) return;
  data[selectedWeek]={date:$("dateInput").value,amount:Math.round(amount*100)/100,notes:$("notesInput").value.trim()};
  saveData(); closeModal(); render();
});
$("deleteBtn").addEventListener("click",()=>{
  if(selectedWeek && confirm(`Eliminare il versamento della settimana ${selectedWeek}?`)){
    delete data[selectedWeek]; saveData(); closeModal(); render();
  }
});
$("closeModal").addEventListener("click",closeModal);
$("modal").addEventListener("click",e=>{if(e.target.classList.contains("modal-backdrop")) closeModal()});
$("filterSelect").addEventListener("change",render);

$("resetBtn").addEventListener("click",()=>{
  if(confirm("Vuoi davvero azzerare tutti i 52 versamenti? Questa operazione non può essere annullata.")){
    data={}; saveData(); render();
  }
});

$("exportBtn").addEventListener("click",()=>{
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="52-week-challenge-backup.json";
  a.click();
  URL.revokeObjectURL(a.href);
});
$("importInput").addEventListener("change",ev=>{
  const file=ev.target.files[0]; if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const imported=JSON.parse(reader.result);
      if(!imported || typeof imported!=="object") throw new Error();
      data=imported; saveData(); render(); alert("Backup importato correttamente.");
    }catch{alert("File di backup non valido.")}
    ev.target.value="";
  };
  reader.readAsText(file);
});

if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
render();
