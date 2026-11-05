(() => {
  "use strict";
  const STORE = "tradeAnalyzerExternalSignalsV1";
  const providers = [
    {id:"sweetex",name:"Sweetex AI",url:"https://sweetex-ai.com/binary",fit:"Binary signals · 1m–1h",note:"Public signal page; no verified public import API."},
    {id:"optencis",name:"Optencis",url:"https://optencis.com/signals/",fit:"Pocket Option · 1–60m",note:"Member/Telegram access may apply; no verified public import API."},
    {id:"signalbots",name:"SignalBots.AI",url:"https://signalbots.ai/signals/binary",fit:"Binary signals · 1m/5m",note:"Dashboard/Telegram/extension access; no verified public import API."},
    {id:"sam",name:"SAM Trading",url:"https://samtrading.space/",fit:"Pocket Option · CALL/PUT",note:"Free analyses/trial; no verified public import API."},
    {id:"forexsignals",name:"ForexSignals.io",url:"https://forexsignals.io/",fit:"Forex trade plans",note:"Forex entries/SL/TP; not necessarily 5-minute binary signals."}
  ];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const read = () => { try { const v=JSON.parse(localStorage.getItem(STORE)||"[]"); return Array.isArray(v)?v:[]; } catch (_) { return []; } };
  const write = rows => { try { localStorage.setItem(STORE,JSON.stringify(rows.slice(-200))); } catch (_) {} };
  function mount(){
    if(document.getElementById("externalAssistantsCard")) return;
    const anchor=document.getElementById("botConsensusCard");
    if(!anchor) return;
    const card=document.createElement("section");
    card.id="externalAssistantsCard";card.className="card wide";
    card.innerHTML=`
      <div class="signal-heading"><h2>External Signal Assistants</h2><span class="signalbadge" id="extConnectionState">Manual review · not API-connected</span></div>
      <p class="small muted">Check several independent signal services alongside our own bots. These links open each provider's official page. Signals are not imported automatically: no authorised public feed/API has been verified for these sources.</p>
      <div id="externalProviderList" class="ext-provider-grid"></div>
      <div class="ext-entry">
        <h3>Record a signal received from a provider</h3>
        <div class="controls">
          <div class="field"><label for="extProvider">Provider</label><select id="extProvider"></select></div>
          <div class="field"><label for="extPair">Pair / asset</label><input id="extPair" value="EUR/USD" maxlength="24" autocomplete="off"></div>
          <div class="field"><label for="extTimeframe">Timeframe / expiry</label><select id="extTimeframe"><option value="1m">1 minute</option><option value="5m" selected>5 minutes</option><option value="15m">15 minutes</option><option value="30m">30 minutes</option><option value="1h">1 hour</option></select></div>
          <div class="field"><label for="extDirection">Direction</label><select id="extDirection"><option value="CALL">CALL</option><option value="PUT">PUT</option><option value="WAIT">NO SIGNAL / WAIT</option></select></div>
        </div>
        <div class="btnrow"><button id="saveExternalSignal" class="btn-blue" type="button">Save provider signal</button><button id="clearExternalSignals" class="btn-secondary" type="button">Clear history</button></div>
        <p class="small muted" id="extSaveStatus" role="status">Enter a signal exactly as the provider displayed it. The app records the source and time you saved it.</p>
      </div>
      <div class="ext-summary">
        <div class="signal-heading"><h3>Provider agreement for selected pair and timeframe</h3><span id="extAgreement" class="signalbadge">No recent signals</span></div>
        <p class="small muted" id="extAgreementDetail">Only signals recorded in this app within the last 15 minutes are counted. Agreement is not proof of accuracy.</p>
      </div>
      <div class="tablewrap"><table><thead><tr><th>Time saved</th><th>Provider</th><th>Pair</th><th>Expiry</th><th>Direction</th></tr></thead><tbody id="externalSignalRows"><tr><td colspan="5" class="muted">No provider signals recorded yet.</td></tr></tbody></table></div>
      <div class="notice" style="margin-top:12px">Safety: external providers may be delayed, paid, affiliate-linked or inaccurate. Optencis and some other services may require eligibility or account linking. This panel never asks for your Pocket Option password, never bypasses VIP access and never places trades. Verify each signal on the broker's own chart.</div>`;
    anchor.insertAdjacentElement("beforebegin",card);
    const style=document.createElement("style");
    style.textContent=`
      #externalAssistantsCard .ext-provider-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:9px;margin:12px 0}
      #externalAssistantsCard .ext-provider{background:#091321;border:1px solid #263b58;border-radius:12px;padding:11px;min-width:0}
      #externalAssistantsCard .ext-provider strong{display:block;font-size:13px;margin-bottom:4px}
      #externalAssistantsCard .ext-provider .ext-fit{font-size:11px;color:#9fb2cc}
      #externalAssistantsCard .ext-provider p{font-size:11px;line-height:1.45;color:#91a5c2;min-height:32px;margin:7px 0}
      #externalAssistantsCard .ext-provider a{display:inline-block;color:#9fc0ff;font-size:11px;font-weight:750;text-decoration:none}
      #externalAssistantsCard .ext-provider .ext-status{font-size:10px;color:#f5bf58;margin-top:7px}
      #externalAssistantsCard .ext-entry,#externalAssistantsCard .ext-summary{margin-top:14px;padding:12px;background:#0b1626;border:1px solid #263b58;border-radius:12px}
      #externalAssistantsCard h3{font-size:12px;margin:0 0 10px;color:#d8e6fa}
      #externalAssistantsCard .ext-entry .controls{grid-template-columns:repeat(2,minmax(0,1fr))}
      #externalAssistantsCard .ext-entry input,#externalAssistantsCard .ext-entry select{width:100%;min-width:0;padding:10px;background:#091321;border:1px solid #2c415e;border-radius:10px;color:#edf4ff;min-height:42px}
      #externalAssistantsCard .ext-entry label{display:block;font-size:11px;color:#9fb2cc;margin-bottom:6px}
      #externalAssistantsCard .ext-summary{margin-bottom:12px}
      @media(max-width:420px){#externalAssistantsCard .ext-entry .controls{grid-template-columns:1fr 1fr}}
    `;
    document.head.appendChild(style);
    const list=document.getElementById("externalProviderList");
    list.innerHTML=providers.map(p=>`<article class="ext-provider"><strong>${esc(p.name)}</strong><div class="ext-fit">${esc(p.fit)}</div><p>${esc(p.note)}</p><a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Open official source ↗</a><div class="ext-status">NOT CONNECTED · manual review</div></article>`).join("");
    document.getElementById("extProvider").innerHTML=providers.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("");
    document.getElementById("saveExternalSignal").addEventListener("click",()=>{
      const provider=providers.find(p=>p.id===document.getElementById("extProvider").value);
      const normalizePair = value => String(value||"").replace(/\s+/g,"").replace(/\//g,"").toUpperCase();
    const pair=normalizePair(document.getElementById("symbol")?.selectedOptions?.[0]?.textContent||"EUR / USD");
    const tf=document.getElementById("timeframe")?.value||"5m";
    const recent=rows.filter(x=>x.time>Date.now()-15*60*1000&&x.timeframe===tf&&normalizePair(x.pair)===pair);
    const calls=recent.filter(x=>x.direction==="CALL").length,puts=recent.filter(x=>x.direction==="PUT").length;
    const agreement=document.getElementById("extAgreement"),detail=document.getElementById("extAgreementDetail");
    if(agreement){agreement.textContent=recent.length?calls+" CALL · "+puts+" PUT":"No recent signals";}
    if(detail)detail.textContent=recent.length?("For "+pair+" · "+tf+": "+(calls>puts?"CALL leads":puts>calls?"PUT leads":"directions are tied")+". "+recent.length+" manually recorded provider entries in the last 15 minutes."):("No manually recorded "+pair+" "+tf+" provider signals in the last 15 minutes.");
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);else mount();
  document.addEventListener("change",e=>{if(e.target&&["symbol","timeframe"].includes(e.target.id))setTimeout(render,0);});
})();