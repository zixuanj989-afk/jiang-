import fs from 'node:fs';
import {buildings,lakes,roads,campusBoundary} from '../dist/world-data.js';
const out=new URL('../dist/assets/',import.meta.url);
let seed=917;const rnd=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
const line=(p)=>p.map(v=>v.join(',')).join(' ');
const rect=(x,y,w,h,fill,stroke='#405563',sw=.32)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const path=(d,fill,stroke='#405563',sw=.5)=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const defs=`<defs><pattern id="paving" width="5" height="3.5" patternUnits="userSpaceOnUse"><rect width="5" height="3.5" fill="#b9c3be"/><path d="M0 0H5M0 0V1.75M2.5 1.75V3.5M0 1.75H5" stroke="#8b9b99" stroke-opacity=".25" stroke-width=".23"/></pattern><pattern id="roof" width="3" height="2.5" patternUnits="userSpaceOnUse"><rect width="3" height="2.5" fill="#c4ccc7"/><path d="M.5 .5h.6M1.8 1.8h.8" stroke="#819495" stroke-width=".3"/></pattern><pattern id="tiles" width="1.5" height="2.7" patternUnits="userSpaceOnUse"><rect width="1.5" height="2.7" fill="#496371"/><path d="M0 0V2.7M0 2.5H1.5" stroke="#91a9ac" stroke-width=".25"/></pattern><pattern id="grass" width="9" height="8" patternUnits="userSpaceOnUse"><rect width="9" height="8" fill="#91a59d"/><path d="M1 2h1.3m3 2h.7m-3 2h1.1m3-4h.5" stroke="#607d78" stroke-opacity=".48" stroke-width=".4"/></pattern><pattern id="water" width="13" height="9" patternUnits="userSpaceOnUse"><rect width="13" height="9" fill="#577d8b"/><path d="M1 2h4M7 6h5M3 8h2" stroke="#aac4c1" stroke-opacity=".34" stroke-width=".4"/></pattern></defs>`;
const treeSource=fs.readFileSync(new URL('tree.svg',out),'utf8');
const treeW=treeSource.match(/width="(\d+)"/)[1],treeH=treeSource.match(/height="(\d+)"/)[1];
const treeBody=treeSource.slice(treeSource.indexOf('>',treeSource.indexOf('<svg'))+1,treeSource.lastIndexOf('</svg>')).replace(/<path\b[^>]*fill="#000000"[^>]*\/>/g,'');
let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="8640" height="11808" viewBox="0 0 1080 1476">${defs}<defs><symbol id="tree" viewBox="0 0 ${treeW} ${treeH}">${treeBody}</symbol></defs><rect width="1080" height="1476" fill="#718d88"/><polygon points="${line(campusBoundary)}" fill="url(#grass)" stroke="#3b595c" stroke-width="2"/>`;
// Natural undergrowth, exact road network overlaid above it.
for(let i=0;i<6500;i++){let x=rnd()*1080,y=rnd()*1476;svg+=`<path d="M${x.toFixed(1)} ${y.toFixed(1)}l1.6 -.4m-1 .3l.2 -1" fill="none" stroke="${['#8ea79b','#617f7b','#a7b8a9'][i%3]}" stroke-width=".4" opacity=".5"/>`;}
for(const pts of roads){svg+=`<polyline points="${line(pts)}" fill="none" stroke="#627d79" stroke-width="18" stroke-linejoin="round" stroke-linecap="round"/><polyline points="${line(pts)}" fill="none" stroke="url(#paving)" stroke-width="15" stroke-linejoin="round" stroke-linecap="round"/>`;}
for(const b of buildings){let x=b[2]+b[4]/2,y=b[3]+b[5];svg+=rect(x-5,y,10,13,'url(#paving)','none');}
for(const l of lakes){svg+=`<polygon points="${line(l.points)}" fill="url(#water)" stroke="#b9c3b9" stroke-width="3"/><polygon points="${line(l.points)}" fill="none" stroke="#3b5661" stroke-width=".65"/>`;}
svg+=rect(498,972,17,116,'url(#paving)','#536d6d',.8);
// Courts, swimming pool and track occupy the positions in the labelled map.
function court(x,y,w,h){return rect(x,y,w,h,'#688c9b','#a4b9b6',1)+`<g transform="translate(${x+2} ${y+2})" fill="none" stroke="#d8e1d3" stroke-width=".45"><rect width="${w-4}" height="${h-4}"/><path d="M0 ${(h-4)/2}H${w-4}"/><circle cx="${(w-4)/2}" cy="${(h-4)/2}" r="${w*.14}"/><path d="M${w*.28} 0v${h*.19}h${w*.36}V0M${w*.28} ${h-4}v-${h*.19}h${w*.36}v${h*.19}"/></g>`;}
for(const c of [[82,473,65,55],[181,234,40, ninety()],[392,106,83,57],[570,113,77,50],[816,870,74,62],[675,1170,47,65],[332,820,61,32]])svg+=court(...c);
function ninety(){return 90}
svg+=rect(329,614,76,102,'#526d77','#b9c4bb',3)+rect(335,620,64,88,'#709ba7','#d7dfd0',1);
for(let i=0;i<6;i++)svg+=path(`M${339+i*10} 623v80`,'none','#dde3d8',.4);
svg+=`<rect x="775" y="1023" width="145" height="278" rx="71" fill="#886f73" stroke="#b6bcb1" stroke-width="3"/>`;
for(let i=0;i<6;i++)svg+=`<rect x="${779+i*3}" y="${1028+i*3}" width="${137-i*6}" height="${268-i*6}" rx="${68-i*3}" fill="none" stroke="#c5c9b9" stroke-width=".55"/>`;
svg+=rect(805,1076,85,167,'#7b9c89','#c3ceba',.8)+path('M805 1159H890M826 1076v25h43v-25M826 1243v-25h43v25','none','#dce1ce',.6)+`<circle cx="847.5" cy="1159" r="19" fill="none" stroke="#dce1ce" stroke-width=".6"/>`;
svg+=rect(390,372,91,68,'url(#paving)','#859795',1)+rect(451,744,70,69,'url(#paving)','#859795',1);
for(let i=0;i<6;i++)svg+=path(`M397 ${377+i*2}H475`,'none','#6a8184',.5);
// Trees are original-style traced assets, stored as an SVG symbol.
const nearRoad=(x,y)=>roads.some(ps=>ps.some((p,i)=>{if(!i)return false;const a=ps[i-1],dx=p[0]-a[0],dy=p[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy)<12;}));
const inside=(x,y)=>{let q=false;for(let i=0,j=campusBoundary.length-1;i<campusBoundary.length;j=i++){let a=campusBoundary[i],b=campusBoundary[j];if((a[1]>y)!=(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])q=!q;}return q;};
const forbidden=(x,y)=>buildings.some(b=>x>b[2]-9&&x<b[2]+b[4]+9&&y>b[3]-9&&y<b[3]+b[5]+15)||lakes.some(l=>x>Math.min(...l.points.map(p=>p[0]))-8&&x<Math.max(...l.points.map(p=>p[0]))+8&&y>Math.min(...l.points.map(p=>p[1]))-8&&y<Math.max(...l.points.map(p=>p[1]))+8)||nearRoad(x,y)||(x> seventy()&&x<154&&y>465&&y<545)||(x>320&&x<423&&y>606&&y<724)||(x>768&&x<927&&y>1010&&y<1310)||(x>388&&x<481&&y>365&&y<446)||(x>445&&x<524&&y>742&&y<817);
function seventy(){return 70}
let trees=[];for(let i=0;i<3400;i++){let x=40+rnd()*1000,y=45+rnd()*1380;if(!inside(x,y)||forbidden(x,y)||trees.some(t=>Math.hypot(x-t[0],y-t[1])<12))continue;trees.push([x,y,19+rnd()*8]);}
let objects=[];
for(const t of trees)objects.push({y:t[1],text:`<use href="#tree" x="${(t[0]-t[2]/2).toFixed(2)}" y="${(t[1]-t[2]*1.2).toFixed(2)}" width="${t[2].toFixed(2)}" height="${(t[2]*1.3).toFixed(2)}"/>`});
function building(b){let[id,name,x,y,w,h,floors,style]=b;
 if(style==='round'){return `<g transform="translate(${x} ${y})">`+path(`M2 ${h*.34}Q${w/2} -8 ${w-2} ${h*.34}V${h-7}Q${w/2} ${h+8} 2 ${h-7}Z`,'#9fadb0','#293f50',1)+Array.from({length:3},(_,j)=>`<path d="M2 ${h*.42+j*10}Q${w/2} ${h*.62+j*10} ${w-2} ${h*.42+j*10}" fill="none" stroke="#354d60" stroke-width="6"/><path d="M1 ${h*.46+j*10}Q${w/2} ${h*.66+j*10} ${w-1} ${h*.46+j*10}" fill="none" stroke="#c3ccc5" stroke-width="2"/>`).join('')+path(`M2 ${h*.34}Q${w/2} -8 ${w-2} ${h*.34}Q${w/2} ${h*.65} 2 ${h*.34}Z`,'#bac6be','#2e4756',.7)+`<ellipse cx="${w/2}" cy="${h*.23}" rx="${w*.19}" ry="${h*.19}" fill="#65838c" stroke="#344f61" stroke-width=".8"/>`+rect(w/2-3,h-9,6,9,'#324d5b')+'</g>';}
 if((id==='class1'||id==='class2'||id==='staffEast')&&!b[8]){
  const traditional=style==='traditional',bw=w*.38,bh=h*.42;
  let compound=rect(x+3,y+3,w-6,h-6,'url(#paving)','#566e76',1);
  const parts=[[0,0,bw,bh],[w-bw,0,bw,bh],[0,h-bh,bw,bh],[w-bw,h-bh,bw,bh]];
  compound+=rect(x+w*.38,y+h*.35,w*.24,h*.3,'url(#grass)','#657f7a',.6);
  for(const [xx,yy,ww,hh]of parts)compound+=building([id,name,x+xx,y+yy,ww,hh,3,traditional?'traditional':'modern',true]);
  compound+=rect(x+w*.45,y+h*.46,w*.1,h*.06,'#91a79c','#465e66',.6);
  return compound;
 }
 let dep=Math.min(19,h*.36),roofh=h-dep,cols=Math.floor(w/5);let s=`<g transform="translate(${x} ${y})">`;
 s+=path(`M3 3H${w+5}V${h+4}H3Z`,'#344e59','none',0);s+=rect(0,roofh,w,dep,'#94a8a9');
 for(let j=0;j<Math.min(floors,4);j++){let yy=roofh+1+j*(dep-2)/Math.min(floors,4);s+=path(`M0 ${yy+2.7}H${w}`,'none','#586e77',.4);for(let i=0;i<cols;i++)s+=rect(1.5+i*(w-3)/cols,yy,2.6,2.1,'#416377','#354c5b',.25)+path(`M${2.8+i*(w-3)/cols} ${yy}v2.1`,'none','#a2b8b7',.17);}
 s+=rect(0,0,w,roofh,style==='traditional'?'url(#tiles)':'url(#roof)','#354e5b',.85);
 if(style==='traditional'){s+=path(`M-2 ${roofh}L${w*.5} ${roofh*.15}L${w+2} ${roofh}M0 1H${w}`,'none','#a8bab5',.75);s+=path(`M${w/2} 1V${roofh*.15}`,'none','#203c4b',1);}
 else {s+=rect(1.4,1.4,w-2.8,roofh-2.8,'none','#8fa2a3',.65)+rect(3,3,w-6,roofh-6,'none','#526c76',.5);let rx=w*.23,ry=roofh*.25;s+=rect(rx,ry,w*.18,roofh*.29,'#81969b','#344f5c',.7)+rect(rx+1.7,ry+1.7,w*.18-3.4,roofh*.29-3.4,'#acc0bd','#58767b',.4);for(let i=0;i<8;i++)s+=path(`M${w-8} ${5+i*1.25}h5`,'none','#6c8189',.4);}
 // Broken ink strokes, parapets, drains and facade fixtures echo the original scene detail.
 if(style!=='traditional'){
  for(let i=0;i<w*roofh*.4;i++){let xx=4+rnd()*(w-8),yy=4+rnd()*(roofh-8);if(xx>w*.21&&xx<w*.45&&yy>roofh*.2&&yy<roofh*.57)continue;s+=path(`M${xx.toFixed(2)} ${yy.toFixed(2)}h${(.15+rnd()*.85).toFixed(2)}`,'none',i%4===0?'#344c5b':'#889b9f',.18+rnd()*.14);}
  s+=path(`M.4 .6H${w-.4}V${roofh}H.4Z`,'none','#263d4c',.9)+path(`M1.9 2H${w-2}V${roofh-1.5}H1.9Z`,'none','#d9ddd2',.8);
  for(let i=0;i<Math.max(1,Math.floor(w/28));i++){let xx=4+i*25;s+=rect(xx,roofh+dep*.5,2.2,1.5,'#bec8c5','#465f6a',.3)+path(`M${xx+.6} ${roofh+dep*.5+.3}v.8m.6-.8v.8`,'none','#586c75',.2);}
 }
 if(style==='dorm')for(let j=0;j<3;j++){let yy=roofh+3+j*(dep-3)/3;s+=path(`M1 ${yy}H${w-1}M1 ${yy+.6}H${w-1}`,'none','#d0d7cb',.25);for(let i=2;i<w;i+=3)s+=path(`M${i} ${yy-.6}v1.4`,'none','#324c5d',.22);}
 for(let i=0;i<w/15;i++)s+=path(`M${2+i*15} ${roofh+.5}V${h-1}`,'none','#c5cfc9',.5);
 s+=rect(w/2-3,h-5,6,5,'#334b57','#273f4c',.5)+path(`M${w/2} ${h-5}v5`,'none','#a2b3b5',.25);for(let i=0;i<3;i++)s+=rect(w/2-5-i*.4,h+i*.7,10+i*.8,.8,'#bbc4bf','#6a8388',.2);s+='</g>';return s;}
for(const b of buildings)objects.push({y:b[3]+b[5],text:building(b)});
objects.sort((a,b)=>a.y-b.y);svg+=objects.map(o=>o.text).join('');
// Benches and lamps enrich roads without obstructing the walking surface.
for(let i=0;i<roads.length;i++){const ps=roads[i];for(let j=1;j<ps.length;j++){let a=ps[j-1],b=ps[j],dist=Math.hypot(a[0]-b[0],a[1]-b[1]);for(let k=15;k<dist;k+=26){let t=k/dist,x=a[0]+(b[0]-a[0])*t+10,y=a[1]+(b[1]-a[1])*t;if(buildings.some(v=>x>v[2]&&x<v[2]+v[4]&&y>v[3]&&y<v[3]+v[5]))continue;svg+=`<g stroke="#354e5a" stroke-width=".6"><path d="M${x} ${y}v-6h2" fill="none"/><rect x="${x+1}" y="${y-7}" width="2" height="1.5" fill="#d2d2af"/></g>`;if(k%52===15)svg+=rect(x+3,y,6,2,'#829494','#3f5965',.3);}}}
svg+='<style>.windowpane{transition:fill 4s}.night .windowpane{fill:#e3d0a1}.night .lamplight{fill:#fff0b3;stroke:#f3d8a3;stroke-width:.6}.dusk .windowpane{fill:#b4b6a0}</style></svg>';
svg=svg.replace('<svg xmlns=', '<svg xmlns:xlink="http://www.w3.org/1999/xlink" xmlns=').replaceAll('<use href=', '<use xlink:href=').replaceAll('fill="#416377"','class="windowpane" fill="#416377"').replaceAll('fill="#d2d2af"','class="lamplight" fill="#d2d2af"');fs.writeFileSync(new URL('world.svg',out),svg);
fs.writeFileSync(new URL('../trees-data.js',out),'// Generated tree trunk collision coordinates.\nexport const trees='+JSON.stringify(trees.map(t=>t.map(v=>Math.round(v*100)/100)))+';\n');
console.log(`World: ${buildings.length} buildings, ${trees.length} trees, ${svg.length} bytes`);
