/* FINVIZ-inspired market intelligence panel.
   Uses the Trade Analyzer's selected live candle feed only; it does not scrape
   FINVIZ or imply FINVIZ is the source of Forex/crypto prices. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const fmt=(n,d=2)=>Number.isFinite(n)?n.toFixed(d):"—";
const ema=(a,p)=>{if(a.length<p)return NaN;const k=2/(p+1);let v=a[0];for(let i=1;i<a.length;i++)v=a[i]*k+v*(1-k);return v;};
function rsi(a,p=14){if(a.length<p+1)return NaN;let g=0,l=0;for(let i=a.length-p;i<a.length;i++){const d=a[i]-a[i-1];g+=Math.max(0,d);l+=Math.max(0,-d);}return l===0?(g===0?50:100):100-100/(1+g/l);}
function mount(){
 if($("finvizIntelCard"))return;
 const anchor=$("botConsensusCard")||$("marketChart")?.closest(".card")||document.querySelector(".grid");
 if(!anchor)return;
 const card=document.createElement("section");card.id="finvizIntelCard";card.className="card wide";
 card.innerHTML=`
 <div class="fi-head"><div><div class="fi-kicker">MARKET INTELLIGENCE</div><h2>Market strength scanner</h2></div><span class="signalbadge" id="fiStatus">WAITING FOR LIVE FEED</span></div>
 <p class="small muted">FINVIZ-inspired market snapshot using the selected instrument's live candles. Switch pairs or assets above to rescan. Not a full-market heatmap.</p>
 <div class="fi-tiles" id="fiTiles">
  <div class="fi-tile"><span>Trend</span><b id="fiTrend">—</b><small id="fiTrendSub">EMA 9 / 21</small></div>
  <div class="fi-tile"><span>RSI (14)</span><b id="fiRsi">—</b><small id="fiRsiSub">Momentum</small></div>
  <div class="fi-tile"><span>MACD</span><b id="fiMacd">—</b><small id="fiMacdSub">EMA spread</small></div>
  <div class="fi-tile"><span>Volatility</span><b id="fiAtr">—</b><small id="fiAtrSub">ATR / price</small></div>
 </div>
 <div class="fi-strength"><div class="fi-strength-head"><b>Directional strength</b><strong id="fiStrength">—</strong></div><div class="meter"><span id="fiStrengthBar"></span></div><div class="fi-strength-labels"><span>BEARISH</span><span>NEUTRAL</span><span>BULLISH</span></div></div>
 <div class="fi-bottom"><div><span class="fi-label">Candle pressure</span><b id="fiPressure">—</b></div><div><span class="fi-label">Recent range</span><b id="fiRange">—</b></div><div><span class="fi-label">Feed</span><b id="fiFeed">—</b></div></div>
 <div class="fi-links"><a href="https://finviz.com/forex" target="_blank" rel="noopener noreferrer">FINVIZ Forex ↗</a><a href="https://finviz.com/crypto" target="_blank" rel="noopener noreferrer">FINVIZ Crypto ↗</a><a href="https://finviz.com/map.ashx" target="_blank" rel="noopener noreferrer">FINVIZ Stock Map ↗</a></div>
 <p class="notice" id="fiNote">Waiting for closed-candle data. FINVIZ links open its own research pages; this panel does not import FINVIZ data.</p>`;
 anchor.insertAdjacentElement("afterend",card);
 const style=document.createElement("style");style.textContent=`
 #finvizIntelCard .fi-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
 #finvizIntelCard .fi-head h2{margin:3px 0 0;font-size:15px}
 #finvizIntelCard .fi-kicker{font-size:10px;letter-spacing:1.3px;color:#79aaff;font-weight:850}
 #finvizIntelCard .fi-tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:13px 0}
 #finvizIntelCard .fi-tile{background:#0b1626;border:1px solid #263a56;border-radius:12px;padding:11px;min-width:0}
 #finvizIntelCard .fi-tile span,#finvizIntelCard .fi-label{display:block;color:#91a5c2;font-size:10px}
 #finvizIntelCard .fi-tile b{display:block;font-size:15px;margin:5px 0;overflow-wrap:anywhere}
 #finvizIntelCard .fi-tile small{font-size:10px;color:#91a5c2}
 #finvizIntelCard .fi-strength{background:#0b1626;border:1px solid #263a56;border-radius:12px;padding:12px}
 #finvizIntelCard .fi-strength-head{display:flex;justify-content:space-between;font-size:12px}
 #finvizIntelCard .fi-strength .meter{margin:10px 0 5px}
 #finvizIntelCard .fi-strength .meter span{background:linear-gradient(90deg,#ff5d73,#f5bf58,#28d99a)}
 #finvizIntelCard .fi-strength-labels{display:flex;justify-content:space-between;color:#91a5c2;font-size:9px}
 #finvizIntelCard .fi-bottom{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:10px 0}
 #finvizIntelCard .fi-bottom>div{background:#0b1626;border:1px solid #263a56;border-radius:10px;padding:10px;min-width:0}
 #finvizIntelCard .fi-bottom b{display:block;font-size:12px;margin-top:4px;overflow-wrap:anywhere}
 #finvizIntelCard .fi-links{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
 #finvizIntelCard .fi-links a{font-size:11px;color:#9fc0ff;text-decoration:none;border:1px solid #314762;background:#101a2b;padding:8px 10px;border-radius:9px;font-weight:700}
 @media(max-width:460px){#finvizIntelCard .fi-tiles{grid-template-columns:repeat(2,minmax(0,1fr))}}
 `;document.head.appendChild(style);
}
function render(d){
 mount();if(!$("fiStatus"))return;
 const rows=(d.candles||[]).filter(c=>c&&[c.open,c.high,c.low,c.close].every(v=>Number.isFinite(Number(v)))&&Number(c.high)>=Math.max(Number(c.open),Number(c.close))&&Number(c.low)<=Math.min(Number(c.open),Number(c.close))).map(c=>({open:+c.open,high:+c.high,low:+c.low,close:+c.close,volume:Number(c.volume)||0}));
 const put=(id,v)=>{const e=$(id);if(e)e.textContent=v;};
 const tint=(id,color)=>{const e=$(id);if(e)e.style.color=color;};
 if(d.sampleMode){put("fiStatus","SAMPLE DATA");put("fiNote","Sample candles are not used for live market intelligence. Refresh the live feed.");return;}
 if(rows.length<30){put("fiStatus","NEED MORE CANDLES");put("fiNote","At least 30 valid candles are required for a useful market snapshot.");return;}
 const cl=rows.map(x=>x.close),last=rows.at(-1),recent=rows.slice(-14);
 const e9=ema(cl,9),e21=ema(cl,21),rv=rsi(cl),macd=ema(cl,12)-ema(cl,26);
 const atr=recent.reduce((s,c)=>s+c.high-c.low,0)/recent.length,atrPct=atr/last.close*100;
 const trend=e9>e21&&last.close>e21?"BULLISH":e9<e21&&last.close<e21?"BEARISH":"MIXED";
 const macdDir=macd>0?"POSITIVE":macd<0?"NEGATIVE":"FLAT";
 const pressure=recent.reduce((s,c)=>s+(c.close>c.open?1:c.close<c.open?-1:0),0);
 const score=Math.max(-100,Math.min(100,(trend==="BULLISH"?35:trend==="BEARISH"?-35:0)+(rv>=55?20:rv<=45?-20:0)+(macd>0?20:macd<0?-20:0)+(pressure/14*25)));
 const pct=Math.round((score+100)/2);
 const color=score>15?"#28d99a":score< -15?"#ff5d73":"#f5bf58";
 put("fiStatus",d.symbol+" · "+d.timeframe+" · LIVE CANDLES");put("fiTrend",trend);put("fiTrendSub","EMA 9 "+fmt(e9,5)+" / EMA 21 "+fmt(e21,5));tint("fiTrend",color);
 put("fiRsi",fmt(rv,1));put("fiRsiSub",rv>=70?"Overbought zone":rv<=30?"Oversold zone":rv>=50?"Positive momentum":"Negative momentum");tint("fiRsi",rv>=55?"#28d99a":rv<=45?"#ff5d73":"#f5bf58");
 put("fiMacd",macdDir);put("fiMacdSub","EMA 12 − EMA 26: "+fmt(macd,6));tint("fiMacd",macd>0?"#28d99a":macd<0?"#ff5d73":"#f5bf58");
 put("fiAtr",fmt(atrPct,3)+"%");put("fiAtrSub",atrPct>.5?"High relative range":atrPct<.1?"Low relative range":"Moderate relative range");
 put("fiStrength",score>15?"Bullish "+Math.abs(score)+"/100":score< -15?"Bearish "+Math.abs(score)+"/100":"Neutral "+Math.abs(score)+"/100");put("fiStrengthBar", "");const bar=$("fiStrengthBar");if(bar){bar.style.width=pct+"%";bar.style.marginLeft="0";bar.style.background=color;}
 put("fiPressure",pressure>2?"Buyers led":pressure< -2?"Sellers led":"Balanced");put("fiRange",fmt(Math.max(...recent.map(c=>c.high))-Math.min(...recent.map(c=>c.low)),6));put("fiFeed",d.symbol&&d.symbol.endsWith("_otc")?"OTC proxy":d.symbol&&d.symbol.startsWith("FX:")?"Forex feed":"Crypto feed");
 put("fiNote","Snapshot from "+rows.length+" available candles. Direction score is an indicator summary, not a probability or CALL/PUT signal. Confirm on higher timeframes and the broker's own quote.");
}
window.addEventListener("trade-analyzer-update",e=>{try{render(e.detail||{});}catch(_){putFallback();}});
function putFallback(){const e=$("fiStatus");if(e)e.textContent="ANALYSIS UNAVAILABLE";}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);else mount();
})();