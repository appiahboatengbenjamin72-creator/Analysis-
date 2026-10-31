/* Independent public-indicator strategy for Trade Analyzer.
   Uses public concepts (SMA 50, RSI 50, Stochastic 14-3-3, pullback and candle confirmation).
   Not BLW proprietary code/signals. Analysis only: no broker connection or trade execution. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const fmt=n=>Number.isFinite(n)?n.toLocaleString(undefined,{maximumFractionDigits:6}):"—";
function sma(a,p){return a.length<p?NaN:a.slice(-p).reduce((s,v)=>s+v,0)/p;}
function rsi(a,p=14){if(a.length<p+1)return NaN;let g=0,l=0;for(let i=a.length-p;i<a.length;i++){const d=a[i]-a[i-1];g+=Math.max(0,d);l+=Math.max(0,-d);}return l===0?(g===0?50:100):100-100/(1+g/l);}
function stochK(rows,end,p=14){if(end+1<p)return NaN;const a=rows.slice(end-p+1,end+1),lo=Math.min(...a.map(x=>x.low)),hi=Math.max(...a.map(x=>x.high));return hi===lo?50:100*(rows[end].close-lo)/(hi-lo);}
function stoch(rows,endOffset=0){const n=rows.length-1-endOffset,k=stochK(rows,n,14),ks=[stochK(rows,n-2,14),stochK(rows,n-1,14),k];return {k,d:ks.every(Number.isFinite)?ks.reduce((a,b)=>a+b,0)/3:NaN};}
function renderCard(){
 let el=$("blwStyleCard");if(el)return el;
 const anchor=$("botConsensusCard");if(!anchor)return null;
 el=document.createElement("section");el.id="blwStyleCard";el.className="card wide";
 el.innerHTML='<h2>Pro Pullback Analysis</h2><p class="small muted">Faster pullback setup: M5 trend + RSI 50 + pullback + separate M1 direction. Stochastic and candle strength are supporting checks.</p><div class="stats"><div class="stat"><span>SMA 50 trend</span><b id="blwTrend" style="font-size:14px">WAIT</b></div><div class="stat"><span>RSI (14)</span><b id="blwRsi" style="font-size:14px">—</b></div><div class="stat"><span>Stochastic K / D</span><b id="blwStoch" style="font-size:14px">—</b></div><div class="stat"><span>Pullback / S-R</span><b id="blwPullback" style="font-size:14px">—</b></div><div class="stat"><span>M1 confirmation</span><b id="blwM1Status" style="font-size:14px">WAIT</b></div></div><div class="signal" style="margin-top:14px"><div><div class="muted small">Strategy signal</div><div id="blwVote" class="signalword wait">WAIT</div></div><div id="blwAgreement" class="signalbadge">0/6 checks</div></div><div class="meter"><span id="blwMeter"></span></div><p id="blwReason" class="small muted">Waiting for valid live candles.</p><div class="notice">Analysis only; no Pocket Option connection or automatic trade execution. The separate 1-minute micro-structure check is not claimed unless 1-minute candles are supplied. No signal guarantees the next result; OTC prices may differ from public feeds.</div>';
 anchor.insertAdjacentElement("afterend",el);return el;
}
function analyze(detail){
 const rows=(detail.candles||[]).filter(c=>c&&[c.open,c.high,c.low,c.close].every(v=>Number.isFinite(Number(v)))).map(c=>({...c,open:Number(c.open),high:Number(c.high),low:Number(c.low),close:Number(c.close),time:Number(c.time)||0})).sort((a,b)=>a.time-b.time);
 renderCard();if(!$("blwVote"))return;
 const put=(id,v)=>{const e=$(id);if(e)e.textContent=v;};
 const vote=v=>{put("blwVote",v);const e=$("blwVote");if(e)e.className="signalword "+v.toLowerCase();};
 if(detail.sampleMode){vote("WAIT");put("blwAgreement","LIVE DATA REQUIRED");put("blwM1Status","Sample data not accepted");put("blwReason","Sample candles are excluded. Refresh to load live market data.");const m=$("blwMeter");if(m)m.style.width="0%";return;}
 if(rows.length<60){vote("WAIT");put("blwAgreement","Need 60+ candles");put("blwM1Status","WAIT");put("blwReason","Not enough candles for SMA 50 and indicator history. Load more live market data.");const m=$("blwMeter");if(m)m.style.width="0%";return;}
 const closes=rows.map(c=>c.close),last=rows[rows.length-1],prev=rows[rows.length-2],s50=sma(closes,50),s50prev=sma(closes.slice(0,-1),50),rv=rsi(closes),rvPrev=rsi(closes.slice(0,-1)),st=stoch(rows),stPrev=stoch(rows,1);
 const up=last.close>s50&&s50>s50prev,down=last.close<s50&&s50<s50prev,trend=up?"UPTREND":down?"DOWNTREND":"MIXED";
 const span=Math.max(last.high-last.low,1e-12),body=Math.abs(last.close-last.open)/span;
 const bullish=last.close>last.open&&body>=.35,bearish=last.close<last.open&&body>=.35;
 const atr=rows.slice(-14).reduce((s,c)=>s+(c.high-c.low),0)/14;
 const nearSma=Math.abs(last.close-s50)<=Math.max(atr*1.2,Math.abs(s50)*.00015);
 const recent=rows.slice(-5,-1),bullPullback=up&&recent.some(c=>c.close<c.open)&&bullish,bearPullback=down&&recent.some(c=>c.close>c.open)&&bearish;
 const m1=(detail.m1Candles||[]).filter(c=>c&&[c.open,c.high,c.low,c.close].every(v=>Number.isFinite(Number(v)))).map(c=>({...c,open:Number(c.open),high:Number(c.high),low:Number(c.low),close:Number(c.close),time:Number(c.time)||0})).sort((a,b)=>a.time-b.time);
 const m1Last=m1[m1.length-1],m1Prev=m1[m1.length-2];
 const m1Bull=m1.length>=3&&m1Last.close>m1Last.open&&m1Last.close>m1Prev.close&&m1Last.close>m1Prev.open;
 const m1Bear=m1.length>=3&&m1Last.close<m1Last.open&&m1Last.close<m1Prev.close&&m1Last.close<m1Prev.open;
 const m1Ready=m1.length>=3;
 const m1Label=!m1Ready?(detail.m1Status||"M1 unavailable"):(m1Bull?"CALL confirmed":m1Bear?"PUT confirmed":"No direction");
 put("blwM1Status",m1Label);
 const support=Number(detail.supportLevel),resistance=Number(detail.resistanceLevel);
 const nearSupport=Number.isFinite(support)&&support>0&&Math.abs(last.close-support)<=Math.max(atr*.65,Math.abs(last.close)*.0001);
 const nearResistance=Number.isFinite(resistance)&&resistance>0&&Math.abs(last.close-resistance)<=Math.max(atr*.65,Math.abs(last.close)*.0001);
 const pullUp=nearSma||bullPullback||nearSupport,pullDown=nearSma||bearPullback||nearResistance;
 const rsiUp=rv>=50&&rv<=70,rsiDown=rv<50&&rv>=30;
 const stochUp=st.k>st.d&&st.k>50&&st.k<90,stochDown=st.k<st.d&&st.k<50&&st.k>10;
 const srUp=nearSupport&&!nearResistance,srDown=nearResistance&&!nearSupport;
 const bullChecks=[up,rsiUp,stochUp,pullUp,bullish,srUp,m1Bull].filter(Boolean).length;
 const bearChecks=[down,rsiDown,stochDown,pullDown,bearish,srDown,m1Bear].filter(Boolean).length;
 let result="WAIT",reason="Evidence is mixed. Wait for the trend, RSI 50, Stochastic direction, pullback and candle confirmation to agree.";
 if(up&&rsiUp&&pullUp&&m1Bull&&bullChecks>=4){result="CALL";reason="Faster setup: M5 trend, RSI bias, pullback and M1 candle direction align. Stochastic and candle strength remain supporting checks; wait for a closed M1 candle and verify the feed before demo use.";} 
 else if(down&&rsiDown&&pullDown&&m1Bear&&bearChecks>=4){result="PUT";reason="Faster setup: M5 trend, RSI bias, pullback and M1 candle direction align. Stochastic and candle strength remain supporting checks; wait for a closed M1 candle and verify the feed before demo use."; }
 put("blwTrend",trend+" · SMA "+fmt(s50));
 put("blwRsi",Number.isFinite(rv)?rv.toFixed(1)+" · "+(rv>=50?"above 50":"below 50"):"—");
 put("blwStoch",Number.isFinite(st.k)&&Number.isFinite(st.d)?st.k.toFixed(1)+" / "+st.d.toFixed(1):"—");
 put("blwPullback",nearSupport?"Near support":nearResistance?"Near resistance":nearSma?"Near SMA 50":bullPullback||bearPullback?"Retrace seen":"No clear zone");
 vote(result);
 const count=result==="CALL"?bullChecks:result==="PUT"?bearChecks:Math.max(bullChecks,bearChecks);
 put("blwAgreement",count+"/7 checks");const meter=$("blwMeter");if(meter)meter.style.width=(count/7*100)+"%";
 put("blwReason",(detail.symbol||"Market")+" · "+(detail.timeframe||"timeframe")+" · "+reason+" This is not a verified prediction of the next expiry outcome.");
}
window.addEventListener("trade-analyzer-update",e=>{try{analyze(e.detail||{});}catch(err){const v=$("blwVote");if(v){v.textContent="WAIT";v.className="signalword wait";}const r=$("blwReason");if(r)r.textContent="Analysis unavailable; refresh the live market feed and try again."; }});
})();