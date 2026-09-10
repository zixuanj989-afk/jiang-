import assert from 'node:assert/strict';
import fs from 'node:fs';
import {findPath} from '../dist/navigation.js';
import {blocked,buildings,kindFor,placeSpots} from '../dist/world-data.js';
import {direction,directions,drawWorld,loadArt} from '../dist/renderer.js';
for(const [dx,dy,d]of [[0,1,'front'],[-1,1,'frontLeft'],[-1,0,'left'],[-1,-1,'backLeft'],[0,-1,'back'],[1,-1,'backRight'],[1,0,'right'],[1,1,'frontRight']])assert.equal(direction(dx,dy),d);
const origin={x:317,y:376};
for(const dest of [...buildings.filter(kindFor).map(b=>({label:b[1],x:b[2]+b[4]/2,y:b[3]+b[5]+9})),...placeSpots.filter(p=>['court','pond'].includes(p[0])).map(p=>({label:p[1],x:p[2],y:p[3]}))]){const route=findPath(origin,dest);assert(route.length,dest.label+' has a path');assert(route.every(p=>!blocked(p.x,p.y)),dest.label+' has no blocked waypoint');}
global.Image=class{width=1280;height=1280;set src(v){assert(fs.existsSync(new URL('../dist/'+v,import.meta.url)),v);this.onload()}};
let total=0;await loadArt((done,n)=>{total=done;assert(done<=n)});assert.equal(total,49);
let images=0;const ctx=new Proxy({measureText:t=>({width:t.length*2}),drawImage:()=>images++},{get:(obj,k)=>obj[k]||(()=>{})});
drawWorld(ctx,{cam:origin,p:{...origin,dir:directions[0]},zoom:1},1440,900,1,null);assert(images>1&&images<200,'only nearby layers drawn');
console.log('PASS: eight headings; all doors and two outdoor regions path-reachable; 49 loadable assets; culled layer drawing.');
