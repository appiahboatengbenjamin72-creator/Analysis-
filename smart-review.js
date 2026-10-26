/* Trade Analyzer Smart Review — independent, explainable rule-based confluence overlay.
   This is not machine-learning and never places orders. It only evaluates closed candles. */
(function(){
"use strict";
const style=document.createElement("style");
style.textContent=`
.smart-review{margin-top:12px;border:1px solid #355174;border-radius:14px;padding:14px;background:linear-gradient(160deg,#13243b,#0c1626)}
.smart-review-head{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap}
.smart-review-title{font-size:15px;font-weight:800}.smart-review-sub{font-size:11px;color:var(--muted);margin-top:4px}
.smart-review-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:12px}
.smart-review-tile{border:1px solid var(--line);border-radius:10px;padding:10px;background:#0b1524;min-width:0}
.smart-review-tile span{display:block;color:var(--muted);font-size:10px}.smart-review-tile b{display:block;font-size:14px;margin-top:5px;overflow-wrap:anywhere}
.smart-review-result{font-size:22px;font-weight:900;letter-spacing:.5px}.smart-review-result.call{color:var(--green)}.smart-review-result.put{color:var(--red)}.smart-review-result.wait{color:var(--amber)}
.smart-review-reasons{font-size:12px;line-height:1.55;color:#d2def0;margin-top:10px}
.smart-review-votes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}
.smart-review-vote{font-size:11px;border-radius:9px;padding:8px;background:#0b1524;border:1px solid var(--line)}.smart-review-vote b{display:block;margin-top:4px;font-size:13px}
@media(max-width:420px){.smart-review-grid,.smart-review-votes{grid-template-columns:1fr 1fr}.smart-review-grid .smart-review-tile:first-child{grid-column:1/-1}}
`;
document.head.appendChild(style);
function mount(){
 const anchor=document.getElementById("botConsensusCard");
 if(!anchor||document.getElementById("smartReview"))return;
 const card=document.createElement("section");
 card.className="card wide";card.id="smartReview";
 card.innerHTML='<div class="smart-review"><div class="smart-review-head"><div><div class="smart-review-title">Smart Review · Multi-factor confluence</div><div class="smart-review-sub">EMA trend · pullback · closed-candle reversal · RSI · support/resistance</div></div><div id="smartReviewBadge" class="signalbadge">Waiting for candles</div></div><div style="margin-top:12px"><div class="muted small">Independent review</div><div id="smartReviewResult" class="smart-review-result wait">WAIT</div><div id="smartReviewMeter" class="meter"><span style="width:0%"></span></div><div id="smartReviewSummary" class="smart-review-reasons">Waiting for fresh, fully closed candles.</div></div><div class="smart-review-grid"><div class="smart-review-tile"><span>Trend / EMA</span><b id="smartTrend">—</b></div><div class="smart-review-tile"><span>RSI (14)</span><b id="smartRsi">—</b></div><div class="smart-review-tile"><span>Pullback state</span><b id="smartPullback">—</b></div></div><div class="smart-review-votes"><div class="smart-review-vote">Trend vote<b id="smartTrendVote">WAIT</b></div><div class="smart-review-vote">Reversal vote<b id="smartReversalVote">WAIT</b></div><div class="smart-review-vote">Momentum vote<b id="smartMomentumVote">WAIT</b></div></div><p class="small muted" style="margin:10px 0 0">This is a separate rule-based second opinion, not an AI-trained model or a win probability. It uses closed candles only. If feeds are stale, sample-only, or conflicting, it should stay WAIT. Verify prices on your broker before any manual decision.</p></div>';
 anchor.insertAdjacentElement("afterend",card);
}
function ema(values,p){const k=2/(p+1);let v=values[0];for(let i=1;i<values.length;i++)v=values[i]*k+v*(1-k);return v}
function rsi(values){if(values.length<15)return null;let g=0,l=0;for(let i=1;i<=14;i++){const d=values[i]-values[i-1];g+=Math.max(d,0);l+=Math.max(-d,0)}g/=14;l/=14;for(let i=15;i<values.length;i++){const d=values[i]-values[i-1];g=(g*13+Math.max(d,0))/14;l=(l*13+Math.max(-d,0))/14}return l===0?(g===0?50:100):100-100/(1+g/l)}
function paint(id,value,dir){const el=document.getElementById(id);if(!el)return;el.textContent=value;el.style.color=dir==="CALL"?"var(--green)":dir==="PUT"?"var(--red)":""}
function evaluate(detail){
 mount();
 const valid=(detail.candles||[]).filter(c=>c&&[c.open,c.high,c.low,c.close].every(Number.isFinite)&&c.high>=Math.max(c.open,c.close)&&c.low<=Math.min(c.open,c.close)&&c.high>=c.low).sort((a,b)=>Number(a.time)-Number(b.time));
 const result=document.getElementById("smartReviewResult");if(!result)return;
 const put=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v};
 if(detail.sampleMode){result.textContent="WAIT";result.className="smart-review-result wait";put("smartReviewBadge","Sample data");put("smartReviewSummary","Sample candles are for interface testing only; no market direction is calculated.");put("smartReviewMeter","");return}
 if(valid.length<30){result.textContent="WAIT";result.className="smart-review-result wait";put("smartReviewBadge","Need 30+ closed candles");put("smartReviewSummary","Not enough valid closed candles for a stable multi-factor review.");put("smartTrend","—");put("smartRsi","—");put("smartPullback","Need more data");return}
 const closes=valid.map(c=>c.close),last=valid.at(-1),prev=valid.at(-2),e9=ema(closes,9),e21=ema(closes,21),rv=rsi(closes);
 const tr=valid.slice(1).map((c,i)=>Math.max(c.high-c.low,Math.abs(c.high-valid[i].close),Math.abs(c.low-valid[i].close)));
 const atr=tr.slice(-14).reduce((a,b)=>a+b,0)/14;
 const body=Math.abs(last.close-last.open),range=Math.max(last.high-last.low,1e-12),upW=last.high-Math.max(last.open,last.close),loW=Math.min(last.open,last.close)-last.low;
 const recent=valid.slice(-5),ups=recent.filter(c=>c.close>c.open).length,downs=recent.filter(c=>c.close<c.open).length;
 const bullTrend=e9>e21&&last.close>e21,bearTrend=e9<e21&&last.close<e21;
 const prevBars=valid.slice(-5,-1),pbLow=Math.min(...prevBars.map(c=>c.low)),pbHigh=Math.max(...prevBars.map(c=>c.high));
 const pullBull=bullTrend&&prevBars.some(c=>c.close<c.open)&&atr>0&&(Math.abs(pbLow-e9)<atr*.6||Math.abs(pbLow-e21)<atr*.6||pbLow<=e9&&pbHigh>=e9);
 const pullBear=bearTrend&&prevBars.some(c=>c.close>c.open)&&atr>0&&(Math.abs(pbHigh-e9)<atr*.6||Math.abs(pbHigh-e21)<atr*.6||pbLow<=e9&&pbHigh>=e9);
 const bullConfirm=last.close>last.open&&last.close>prev.high&&last.close>e9;
 const bearConfirm=last.close<last.open&&last.close<prev.low&&last.close<e9;
 const bullishReversal=last.close>last.open&&loW>=Math.max(body*.8,range*.22)&&last.close>=last.low+range*.62;
 const bearishReversal=last.close<last.open&&upW>=Math.max(body*.8,range*.22)&&last.close<=last.low+range*.38;
 const mom=closes.at(-1)-closes.at(-4);
 const tVote=bullTrend?"CALL":bearTrend?"PUT":"WAIT";
 let rVote="WAIT";if(bullishReversal&&last.close>prev.close)rVote="CALL";else if(bearishReversal&&last.close<prev.close)rVote="PUT";
 let mVote="WAIT";if(mom>0&&ups>=3&&rv>=50&&rv<70)mVote="CALL";else if(mom<0&&downs>=3&&rv<=50&&rv>30)mVote="PUT";
 let dir="WAIT",reasons=[];
 const votes=[tVote,rVote,mVote],call=votes.filter(v=>v==="CALL").length,putN=votes.filter(v=>v==="PUT").length;
 const overbought=rv>=70,oversold=rv<=30;
 const srTolerance=Math.max(atr*.4,Math.abs(last.close)*.00025);
 const nearResistance=Number.isFinite(detail.resistanceLevel)&&detail.resistanceLevel>last.close&&(detail.resistanceLevel-last.close)<=srTolerance;
 const nearSupport=Number.isFinite(detail.supportLevel)&&detail.supportLevel<last.close&&(last.close-detail.supportLevel)<=srTolerance;
 if(call>=2&&call>putN&&bullTrend&&pullBull&&bullConfirm&&rv>=45&&rv<70&&!overbought&&!nearResistance){dir="CALL";reasons.push("Bullish trend pullback with closed-candle breakout and at least two aligned votes.");}
 else if(putN>=2&&putN>call&&bearTrend&&pullBear&&bearConfirm&&rv<=55&&rv>30&&!oversold&&!nearSupport){dir="PUT";reasons.push("Bearish trend pullback with closed-candle breakdown and at least two aligned votes.");}
 else reasons.push("No complete setup: wait for a clear trend, pullback and closed confirmation candle.");
 if(overbought)reasons.push("RSI is overbought; avoid chasing bullish momentum.");
 if(oversold)reasons.push("RSI is oversold; avoid chasing bearish momentum.");
 if(body/range<.25)reasons.push("Latest candle body is weak.");
 if(!pullBull&&!pullBear)reasons.push("No clear EMA-area pullback is confirmed.");
 if(nearResistance)reasons.push("Price is close to resistance; bullish entry blocked until price clears and retests it.");
 if(nearSupport)reasons.push("Price is close to support; bearish entry blocked until price clears and retests it.");
 if(call===putN)reasons.push("Votes conflict or are balanced.");
 result.textContent=dir;result.className="smart-review-result "+dir.toLowerCase();
 put("smartReviewBadge",dir==="WAIT"?"Setup incomplete":(dir==="CALL"?"Bullish confluence":"Bearish confluence"));
 put("smartReviewSummary",reasons.join(" "));
 const meter=document.querySelector("#smartReviewMeter span");if(meter)meter.style.width=(dir==="WAIT"?0:call===3||putN===3?90:70)+"%";
 put("smartTrend",bullTrend?"Bullish":bearTrend?"Bearish":"Mixed");
 put("smartRsi",rv.toFixed(1)+(overbought?" · high":oversold?" · low":""));
 put("smartPullback",pullBull?(bullConfirm?"Bull confirm":"Await confirm"):pullBear?(bearConfirm?"Bear confirm":"Await confirm"):"Not confirmed");
 put("smartReviewSummary",reasons.join(" "));
 put("smartTrendVote",tVote);put("smartReversalVote",rVote);put("smartMomentumVote",mVote);
 ["smartTrendVote","smartReversalVote","smartMomentumVote"].forEach(id=>{const el=document.getElementById(id);if(el)el.style.color=el.textContent==="CALL"?"var(--green)":el.textContent==="PUT"?"var(--red)":"var(--amber)"});
}
window.addEventListener("trade-analyzer-update",e=>{try{evaluate(e.detail||{})}catch(err){console.warn("Smart review error",err)}});
document.addEventListener("DOMContentLoaded",mount);
})();