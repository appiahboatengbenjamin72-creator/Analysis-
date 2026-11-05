(() => {
  "use strict";
  const STORE="tradeAnalyzerExternalSignalsV1";
  const providers=[
    {id:"sweetex",name:"Sweetex AI",url:"https://sweetex-ai.com/binary",fit:"Binary signals · 1m–1h",note:"Public signal page; no verified public import API."},
    {id:"binaryai",name:"Binary AI",url:"",fit:"Binary signal assistant",note:"Generic provider name. Exact official website is needed before linking."},
    {id:"pocketsignals",name:"Pocket Option Signals",url:"",fit:"Pocket Option signal provider",note:"Provider identity is not specific enough yet. Exact official website or Telegram handle is needed."},
    {id:"optencis",name:"Optencis",url:"https://optencis.com/signals/",fit:"Pocket Option · 1–60m",note:"Member/Telegram access may apply. Its terms describe optional martingale packs; avoid those if you do not want martingale."},
    {id:"signalbots",name:"SignalBots.AI",url:"https://signalbots.ai/signals/binary",fit:"Binary signals · 1m/5m",note:"Dashboard and Telegram signals; no verified public import API."},
    {id:"sam",name:"SAM Trading",url:"https://samtrading.space/",fit:"Pocket Option · CALL/PUT",note:"Offers a limited free analysis trial; no verified public import API."},
    {id:"forexsignals",name:"ForexSignals.io",url:"https://forexsignals.io/",fit:"Forex trade plans",note:"Forex entries/SL/TP; not necessarily 5-minute binary signals."}
  ];
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const normalizePair=v=>String(v||"").replace(/\s+/g,"").replace(/\//g,"").toUpperCase();
  const read=()=>{try{const v=JSON.parse(localStorage.getItem(STORE)||"[]");return Array.isArray(v)?v:[]}catch(_){return[]}};
  const write=rows=>{try{localStorage.setItem(STORE,JSON.stringify(rows.slice(-200)))}catch(_){}};
  function mount(){
    if(document.getElementById("externalAssistantsCard"))return;
    const anchor=document.getElementById("botConsensusCard");if(!anchor)return;
    const card=document.createElement("section");card.id="externalAssistantsCard";card.className="card wide";
    card.innerHTML=`
      <div class="signal-heading"><h2>External Signal Assistants</h2><span class="signalbadge">Manual review · not API-connected</span></div>
      <p class="small muted">Check multiple independent providers beside our own bots. Open each official source to view its signal. No authorised public import API has been verified for these providers, so this panel does not pretend to fetch their signals automatically.</p>
      <div id="externalProviderList" class="ext-provider-grid"></div>
      <div class="ext-entry"><h3>Record a signal received from a provider</h3>
        <div class="controls">
          <div class="field"><label for="extProvider">Provider</label><select id="extProvider"></select></div>
          <div class="field"><label for="extPair">Pair / asset</label><input id="extPair" value="EUR/USD" maxlength="24" autocomplete="off"></div>
          <div class="field"><label for="extTimeframe">Timeframe / expiry</label><select id="extTimeframe"><option value="1m">1 minute</option><option value="5m" selected>5 minutes</option><option value="15m">15 minutes</option><option value="30m">30 minutes</option><option value="1h">1 hour</option></select></div>
          <div class="field"><label for="extDirection">Direction</label><select id="extDirection"><option value="CALL">CALL</option><option value="PUT">PUT</option><option value="WAIT">NO SIGNAL / WAIT</option></select></div>
        </div>
        <div class="btnrow"><button id="saveExternalSignal" class="btn-blue" type="button">Save provider signal</button><button id="clearExternalSignals" class="btn-secondary" type="button">Clear history</button></div>
        <p class="small muted" id="extSaveStatus" role="status">Enter the direction exactly as shown by the provider. The app records when you save it.</p>
      </div>
      <div class="ext-summary"><div class="signal-heading"><h3>Provider agreement for selected pair and timeframe</h3><span id="extAgreement" class="signalbadge">No recent signals</span></div><p class="small muted" id="extAgreementDetail">Only entries recorded in this app within the last 15 minutes are counted. Agreement is not proof of accuracy.</p></div>
      <div class="tablewrap"><table><thead><tr><th>Time saved</th><th>Provider</th><th>Pair</th><th>Expiry</th><th>Direction</th></tr></thead><tbody id="externalSignalRows"><tr><td colspan="5" class="muted">No provider signals recorded yet.</td></tr></tbody></table></div>
      <div class="notice" style="margin-top:12px">External signals can be delayed, paid, affiliate-linked or inaccurate. Some providers require account eligibility. This panel never asks for your Pocket Option password, bypasses VIP access or places trades. Check the broker's own chart before considering any signal.</div>`;
    anchor.insertAdjacentElement("beforebegin",card);
    const style=document.createElement("style");
    style.textContent=`
      #externalAssistantsCard .ext-provider-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:9px;margin:12px 0}
      #externalAssistantsCard .ext-provider{background:#091321;border:1px solid #263b58;border-radius:12px;padding:11px;min-width:0}
      #externalAssistantsCard .ext-provider strong{display:block;font-size:13px;margin-bottom:4px}
      #externalAssistantsCard .ext-fit{font-size:11px;color:#9fb2cc}
      #externalAssistantsCard .ext-provider p{font-size:11px;line-height:1.45;color:#91a5c2;min-height:32px;margin:7px 0}
      #externalAssistantsCard .ext-provider a{display:inline-block;color:#9fc0ff;font-size:11px;font-weight:750;text-decoration:none}
      #externalAssistantsCard .ext-status{font-size:10px;color:#f5bf58;margin-top:7px}
      #externalAssistantsCard .ext-entry,#externalAssistantsCard .ext-summary{margin-top:14px;padding:12px;background:#0b1626;border:1px solid #263b58;border-radius:12px}
      #externalAssistantsCard h3{font-size:12px;margin:0 0 10px;color:#d8e6fa}
      #externalAssistantsCard .ext-entry .controls{grid-template-columns:repeat(2,minmax(0,1fr))}
      #externalAssistantsCard .ext-entry input,#externalAssistantsCard .ext-entry select{width:100%;min-width:0;padding:10px;background:#091321;border:1px solid #2c415e;border-radius:10px;color:#edf4ff;min-height:42px}
      #externalAssistantsCard .ext-entry label{display:block;font-size:11px;color:#9fb2cc;margin-bottom:6px}
      #externalAssistantsCard .ext-summary{margin-bottom:12px}
      @media(max-width:420px){#externalAssistantsCard .ext-entry .controls{grid-template-columns:1fr 1fr}}
    `;
    document.head.appendChild(style);
    document.getElementById("externalProviderList").innerHTML=providers.map(p=>`<article class="ext-provider"><strong>${esc(p.name)}</strong><div class="ext-fit">${esc(p.fit)}</div><p>${esc(p.note)}</p>${p.url?`<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Open official source ↗</a>`:`<span class="ext-fit">Official link needed</span>`}<div class="ext-status">NOT CONNECTED · manual review</div></article>`).join("");
    document.getElementById("extProvider").innerHTML=providers.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("");
    document.getElementById("saveExternalSignal").addEventListener("click",()=>{
      const provider=providers.find(p=>p.id===document.getElementById("extProvider").value);
      const pair=document.getElementById("extPair").value.trim().toUpperCase();
      const timeframe=document.getElementById("extTimeframe").value;
      const direction=document.getElementById("extDirection").value;
      if(!provider||!pair){document.getElementById("extSaveStatus").textContent="Choose a provider and enter a pair or asset.";return;}
      const rows=read();rows.push({id:String(Date.now()),provider:provider.name,pair,timeframe,direction,time:Date.now()});write(rows);render();
      document.getElementById("extSaveStatus").textContent="Saved "+direction+" from "+provider.name+" for "+pair+" ("+timeframe+"). This is a manual record, not an imported feed.";
    });
    document.getElementById("clearExternalSignals").addEventListener("click",()=>{
      if(!confirm("Clear all manually recorded external provider signals on this device?"))return;
      write([]);render();document.getElementById("extSaveStatus").textContent="External signal history cleared on this device.";
    });
    render();
  }
  function render(){
    const rows=read().sort((a,b)=>b.time-a.time),body=document.getElementById("externalSignalRows");if(!body)return;
    body.innerHTML=rows.length?rows.slice(0,30).map(x=>`<tr><td>${new Date(x.time).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit"})}</td><td>${esc(x.provider)}</td><td>${esc(x.pair)}</td><td>${esc(x.timeframe)}</td><td class="${x.direction==="CALL"?"good":x.direction==="PUT"?"bad":"warn"}">${esc(x.direction)}</td></tr>`).join(""):'<tr><td colspan="5" class="muted">No provider signals recorded yet.</td></tr>';
    const pair=normalizePair(document.getElementById("symbol")?.selectedOptions?.[0]?.textContent||"EUR / USD");
    const tf=document.getElementById("timeframe")?.value||"5m";
    const recent=rows.filter(x=>x.time>Date.now()-15*60*1000&&x.timeframe===tf&&normalizePair(x.pair)===pair);
    const calls=recent.filter(x=>x.direction==="CALL").length,puts=recent.filter(x=>x.direction==="PUT").length;
    const agreement=document.getElementById("extAgreement"),detail=document.getElementById("extAgreementDetail");
    if(agreement)agreement.textContent=recent.length?calls+" CALL · "+puts+" PUT":"No recent signals";
    if(detail)detail.textContent=recent.length?("For "+pair+" · "+tf+": "+(calls>puts?"CALL leads":puts>calls?"PUT leads":"directions are tied")+". "+recent.length+" manually recorded provider entries in the last 15 minutes."):("No manually recorded "+pair+" "+tf+" provider signals in the last 15 minutes.");
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);else mount();
  document.addEventListener("change",e=>{if(e.target&&["symbol","timeframe"].includes(e.target.id))setTimeout(render,0);});
})();