// Opt-in, local inspection view; absent from the normal game interface.
const enabled=new URLSearchParams(location.search).get('qa')==='1';
const intervals=[],costs=[];let previous=0,updated=0;
let output;if(enabled){output=document.createElement('output');output.id='diagnostics';document.body.append(output)}
export function recordFrame(now,cost){if(!enabled||document.hidden)return;if(previous&&now-previous<1000){intervals.push(now-previous);costs.push(cost);if(intervals.length>180){intervals.shift();costs.shift()}}previous=now;if(now-updated<1000||intervals.length<30)return;updated=now;const sorted=[...costs].sort((a,b)=>a-b),mean=intervals.reduce((a,b)=>a+b)/intervals.length;output.textContent=`${Math.round(1000/mean)} fps · render p95 ${sorted[Math.floor(sorted.length*.95)].toFixed(1)} ms · ${intervals.length} frames`;}
