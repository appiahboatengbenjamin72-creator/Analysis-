/* Trade Analyzer ML engine: locally trained logistic regression with chronological holdout validation.
   This is not a pretrained commercial AI and never places trades. */
(function(){
"use strict";
const cache=new Map(); const $=id=>document.getElementById(id);
function ema(v,p){const k=2/(p+1);let x=v[0];for(let i=1;i<v.length;i++)x=v[i]*k+x*(1-k);return x;}
function rsi(v,end){let g=0,l=0;for(let i=end-13;i<=end;i++){const d=v[i]-v[i-1];g+=Math.max(d,0);l+=Math.max(-d,0);}return l===0?(g===0?50:100):100-100/(1+g/l);}
function features(rows,i){
 const c=rows.slice(0,i+1),cl=c.map(x=>x.close),last=c[i],prev=c[i-1],trs=[];
 for(let j=Math.max(1,i-13);j<=i;j++)trs.push(Math.max(c[j].high-c[j].low,Math.abs(c[j].high-c[j-1].close),Math.abs(c[j].low-c[j-1].close)));
 const atr=trs.reduce((a,b)=>a+b,0)/Math.max(1,trs.length),range=Math.max(last.high-last.low,1e-12);
 const e9=ema(cl.slice(-Math.min(40,cl.length)),9),e21=ema(cl.slice(-Math.min(60,cl.length)),21),e12=ema(cl.slice(-Math.min(60,cl.length)),12),e26=ema(cl.slice(-Math.min(80,cl.length)),26);
 const ret=n=>i>=n&&cl[i-n]!==0?cl[i]/cl[i-n]-1:0;
 return [ret(1),ret(2),ret(3),ret(5),ret(8),(e9-e21)/(atr||1),(e12-e26)/(atr||1),(last.close-e21)/(atr||1),(last.close-last.open)/range,(Math.min(last.open,last.close)-last.low)/range,(last.high-Math.max(last.open,last.close))/range,atr/(last.close||1),(rsi(cl,i)-50)/50,prev.close===0?0:(last.close-prev.close)/(atr||1)];
}
function sigmoid(z){z=Math.max(-30,Math.min(30,z));return 1/(1+Math.exp(-z));}
function fit(X,y){
 const n=X.length,d=X[0].length,mean=Array(d).fill(0),sd=Array(d).fill(0);
 for(const row of X)row.forEach((v,j)=>mean[j]+=v/n);
 for(const row of X)row.forEach((v,j)=>sd[j]+=(v-mean[j])**2/n);
 for(let j=0;j<d;j++)sd[j]=Math.sqrt(sd[j])||1;
 const Z=X.map(row=>row.map((v,j)=>(v-mean[j])/sd[j])),w=Array(d).fill(0),lr=.025,lambda=.015;
 for(let epoch=0;epoch<180;epoch++){
  const grad=Array(d).fill(0);
  for(let i=0;i<Z.length;i++){const p=sigmoid(Z[i].reduce((s,v,j)=>s+v*w[j],0)),err=p-y[i];for(let j=0;j<d;j++)grad[j]+=err*Z[i][j]/Z.length;}
  for(let j=0;j<d;j++)w[j]-=lr*(grad[j]+lambda*w[j]);
 }
 return {predict(row){return sigmoid(row.reduce((s,v,j)=>s+((v-mean[j])/sd[j])*w[j],0));}};
}
function train(rows){
 const X=[],y=[];
 // Train on next-candle close direction. Latest candle is excluded from labels.
 for(let i=30;i<rows.length-2;i++){
  const f=features(rows,i),next=rows[i+1],base=rows[i].close;
  if(f.every(Number.isFinite)&&Number.isFinite(next.close)&&base>0){X.push(f);y.push(next.close>base?1:0);}
 }
 if(X.length<120)return {ready:false,vote:"WAIT",reason:"Need 120 labelled examples (usually at least 155+ candles).",samples:X.length};
 const split=Math.floor(X.length*.78),Xtr=X.slice(0,split),ytr=y.slice(0,split),Xv=X.slice(split),yv=y.slice(split);
 if(Xv.length<20)return {ready:false,vote:"WAIT",reason:"Not enough later unseen candles for validation.",samples:X.length};
 const model=fit(Xtr,ytr);let correct=0,positive=0;
 for(let i=0;i<yv.length;i++){if((model.predict(Xv[i])>=.5?1:0)===yv[i])correct++;positive+=yv[i];}
 const accuracy=correct/yv.length,baseline=Math.max(positive,yv.length-positive)/yv.length,ready=accuracy>=.53&&accuracy>=baseline+.02;
 const probability=model.predict(features(rows,rows.length-1));let vote="WAIT";
 if(ready&&probability>=.58)vote="CALL";else if(ready&&probability<=.42)vote="PUT";
 return {ready,vote,probability,validationAccuracy:accuracy,baseline,samples:X.length,validationSamples:yv.length,reason:ready?"Chronological holdout passed. Model score is not a win probability.":"Holdout did not beat majority-class baseline by the required margin; WAIT."};
}
function render(state,symbol,timeframe){
 let card=$("mlBotCard");
 if(!card){const anchor=$("botConsensusCard");if(!anchor)return;card=document.createElement("section");card.className="card wide";card.id="mlBotCard";
 card.innerHTML='<h2>Trained ML Bot</h2><div class="stats"><div class="stat"><span>ML decision</span><b id="mlVote" style="font-size:18px">WAIT</b><span id="mlConfidence">Not validated</span></div><div class="stat"><span>Unseen-candle validation</span><b id="mlAccuracy">—</b><span id="mlBaseline">Baseline —</span></div><div class="stat"><span>Training examples</span><b id="mlSamples">0</b><span id="mlValidationSamples">Validation: —</span></div></div><p id="mlReason" class="small muted" style="margin-bottom:0">Waiting for live candles.</p><p class="small muted">Trains locally from historical candles for the selected instrument/timeframe and validates on later unseen candles. This is a small logistic-regression model, not pretrained commercial AI. Past patterns do not guarantee the next result.</p>';
 anchor.insertAdjacentElement("afterend",card);}
 const set=(id,v)=>{const e=$(id);if(e)e.textContent=v;};
 set("mlVote",state.vote||"WAIT");const v=$("mlVote");if(v)v.style.color=state.vote==="CALL"?"var(--green)":state.vote==="PUT"?"var(--red)":"var(--amber)";
 set("mlConfidence",Number.isFinite(state.probability)?Math.round(Math.max(state.probability,1-state.probability)*100)+"% model score":"Not validated");
 set("mlAccuracy",Number.isFinite(state.validationAccuracy)?Math.round(state.validationAccuracy*100)+"%":"—");
 set("mlBaseline",Number.isFinite(state.baseline)?"Baseline "+Math.round(state.baseline*100)+"%":"Baseline —");
 set("mlSamples",String(state.samples||0));set("mlValidationSamples","Validation: "+(state.validationSamples||0));
 set("mlReason",(symbol||"Market")+" · "+(timeframe||"timeframe")+" · "+(state.reason||"Model ready."));
}
function analyze(candles,symbol,timeframe){
 const rows=(candles||[]).filter(c=>c&&[c.open,c.high,c.low,c.close].every(Number.isFinite)&&c.high>=Math.max(c.open,c.close)&&c.low<=Math.min(c.open,c.close)&&c.high>=c.low).sort((a,b)=>Number(a.time)-Number(b.time));
 if(rows.length<35){const state={ready:false,vote:"WAIT",reason:"Waiting for sufficient historical candles.",samples:0};render(state,symbol,timeframe);return state;}
 const key=[symbol,timeframe,rows.length,rows.length>1?rows[rows.length-2].time:"",rows.length>1?rows[rows.length-2].close:""].join("|");
 let state=cache.get(key);if(!state){state=train(rows);cache.clear();cache.set(key,state);}
 render(state,symbol,timeframe);return state;
}
window.TradeML={analyze};
})();