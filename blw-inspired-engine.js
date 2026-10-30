/* BLW-inspired public-indicator strategy module for Trade Analyzer.
   Independent implementation using public technical concepts; not BLW code or private signals.
   Analysis only: no broker connection or trade execution. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const fmt=n=>Number.isFinite(n)?n.toLocaleString(undefined,{maximumFractionDigits:6}):"—";
function sma(values,p){if(values.length<p)return NaN;return values.slice(-p).reduce((a,b)=>a+b,0)/p;}
function rsi(values,p=14){if(values.length<p+1)return NaN;let g=0,l=0;for(let i=values.length-p;i<values.length;i++){const d=values[i]-values[i-1];g+=Math.max(0,d);l+=Math.max(0,-d);}return l===0?(g===0?50:100):100-100/(1+g/l);}
function stochastic(rows,p=14){if(rows.length<p)return NaN;const a=rows.slice(-p),lo=Math.min(...a.map(x=>x.low)),hi=Math.max(...a.map(x=>x.high));return hi===lo?50:100*(a[a.length-1].close-lo)/(hi-lo);}
function renderCard(){
 let el=$("blwStyleCard");if(el)return el;
 const anchor=$("botConsensusCard");if(!anchor)return null;
 el=document.createElement("section");el.id="blwStyleCard";el.className="card wide";
 el.innerHTML='<h2>Multi-Indicator Pullback Strategy</h2><p class="small muted">Publicly described technical concepts adapted independently: SMA 50 trend, RSI 50 momentum, Stochastic 14-3-3, pullback, and closed-candle confirmation.</p><div class="stats"><div class="stat"><span>SMA 50 trend</span><b id="blwTrend" style="font-size:14px">WAIT</b></div><div class="stat"><span>RSI (14) vs 50</span><b id="blwRsi" style="font-size:14px">—</b></div><div class="stat"><span>Stochastic (14)</span><b id="blwStoch" style="font-size:14px">—</b></div><div class="stat"><span>Pullback / zone</span><b id="blwPullback" style="font-size:14px">—</b></div></div><div class="signal" style="margin-top:14px"><div><div class="muted small">Strategy suggestion</div><div id="blwVote" class="signalword wait">WAIT</div></div><div id="blwAgreement" class="signalbadge">0/4 checks</div></div><div class="meter"><span id="blwMeter"></span></div><p id="blwReason" class="small muted">Waiting for valid closed candles.</p><div class="notice">This is an educational, independently implemented strategy inspired by publicly described indicators—not the proprietary BLW app or its private signals. Requires adequate candles and aligned evidence; no accuracy or profit is guaranteed. OTC prices may differ from public feeds.</div>';
 anchor.insertAdjacentElement("afterend",el);return el;
}
function analyze(detail){
 const rows=(detail.candles||[]).filter(c=>c&&[c.open,c.high,c.low,c.close].every(Number.isFinite)).sort((a,b)=>Number(a.time)-Number(b.time));
 renderCard();if(!$("blwVote"))return;
 const put=(id,v)=>{const e=$(id);if(e)e.textContent=v;};
 const vote=(v)=>{put("blwVote",v);const e=$("blwVote");e.className="signalword "+v.toLowerCase();};
 if(detail.sampleMode){vote("WAIT");put("blwReason","Sample candles are excluded. Load live market data.");return;}
 if(rows.length<60){vote("WAIT");put("blwAgreement","Need 60+ candles");put("blwReason","Waiting for at least 60 valid candles to calculate SMA 50 and indicator history.");return;}
 const closes=rows.map(c=>c.close),last=rows[rows.length-1],prior=rows[rows.length-2],s50=sma(closes,50),smaPrev=sma(closes.slice(0,-1),50),rv=rsi(closes),st=stochastic(rows);
 const up=last.close>s50&&s50>smaPrev,down=last.close<s50&&s50<smaPrev;
 const trend=up?"UPTREND":down?"DOWNTREND":"MIXED";
 const span=Math.max(last.high-last.low,1e-12),body=Math.abs(last.close-last.open)/span;
 const bullClose=last.close>last.open&&last.close>prior.high&&body>=.35;
 const bearClose=last.close<last.open&&last.close<prior.low&&body>=.35;
 const atrRows=rows.slice(-14),atr=atrRows.reduce((sum,c)=>sum+(c.high-c.low),0)/atrRows.length;
 const nearSma=Math.abs(last.close-s50)<=Math.max(atr*1.2,Math.abs(s50)*0.00015);
 const recent=rows.slice(-4,-1),recentPullbackUp=up&&recent.some(c=>c.close<c.open)&&last.close>last.open;
 const recentPullbackDown=down&&recent.some(c=>c.close>c.open)&&last.close<last.open;
 const pullUp=nearSma||recentPullbackUp,pullDown=nearSma||recentPullbackDown;
 const rsiUp=rv>=50&&rv<=70,rsiDown=rv<50&&rv>=30;
 const stochUp=st>50&&st<90,stochDown=st<50&&st>10;
 const bullChecks=[up,rsiUp,stochUp,pullUp,bullClose].filter(Boolean).length;
 const bearChecks=[down,rsiDown,stochDown,pullDown,bearClose].filter(Boolean).length;
 let result="WAIT",reason="Checks are mixed; wait for trend, momentum, pullback and closed-candle confirmation to align.";
 if(bullChecks>=4&&up&&rsiUp&&bullClose){result="CALL";reason="Bullish SMA 50 trend, RSI above 50, supportive Stochastic, pullback context and bullish closed-candle confirmation align.";}
 else if(bearChecks>=4&&down&&rsiDown&&bearClose){result="PUT";reason="Bearish SMA 50 trend, RSI below 50, supportive Stochastic, pullback context and bearish closed-candle confirmation align.";}
 put("blwTrend",trend+" · "+fmt(s50));put("blwRsi",Number.isFinite(rv)?rv.toFixed(1)+" · "+(rv>=50?"above 50":"below 50"):"—");
 put("blwStoch",Number.isFinite(st)?st.toFixed(1):"—");put("blwPullback",nearSma?"Near SMA 50":pullUp||pullDown?"Possible retrace":"Not clear");
 vote(result);const count=result==="CALL"?bullChecks:result==="PUT"?bearChecks:Math.max(bullChecks,bearChecks);
 put("blwAgreement",count+"/5 checks");const meter=$("blwMeter");if(meter)meter.style.width=(count/5*100)+"%";
 put("blwReason",detail.symbol+" · "+detail.timeframe+" · "+reason+" Current candle feed is only as reliable as its source; this does not guarantee the next expiry outcome.");
}
window.addEventListener("trade-analyzer-update",e=>{try{analyze(e.detail||{});}catch(err){const v=$("blwVote");if(v){v.textContent="WAIT";v.className="signalword wait";}const r=$("blwReason");if(r)r.textContent="Indicator calculation unavailable; refresh the market feed."; }});
})();