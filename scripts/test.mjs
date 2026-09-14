import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import * as world from '../dist/world-data.js';
import {direction,directions} from '../dist/renderer.js';
import {findPath,prepareNavigation} from '../dist/navigation.js';
const require=createRequire(import.meta.url);
const {JSDOM}=require(process.env.JZ_TEST_DEPS||'jsdom');
const root=new URL('../dist/',import.meta.url);
const html=fs.readFileSync(new URL('index.html',root),'utf8');
const dom=new JSDOM(html,{url:'https://example.test/',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,timers=[];
w.setTimeout=(fn,ms)=>{timers.push({fn,ms});return timers.length};w.clearTimeout=()=>{};
w.requestAnimationFrame=()=>{};w.matchMedia=()=>({matches:false});
w.HTMLDialogElement.prototype.showModal=function(){this.open=true};
w.HTMLDialogElement.prototype.close=function(){this.open=false};
w.HTMLMediaElement.prototype.pause=()=>{};
w.HTMLCanvasElement.prototype.getContext=()=>({setTransform(){},clearRect(){},fillRect(){}});
w.Image=class{set src(v){this.onload?.()}};
const imageSrc=Object.getOwnPropertyDescriptor(w.HTMLImageElement.prototype,'src');
Object.defineProperty(w.HTMLImageElement.prototype,'src',{get:imageSrc.get,set(value){imageSrc.set.call(this,value);this.dispatchEvent(new w.Event('load'))}});
w.fetch=async path=>({ok:true,text:async()=>fs.readFileSync(new URL(path,root),'utf8')});
Object.assign(w,world);
Object.assign(w,{direction,directions,findPath,prepareNavigation,loadArt:async()=>true,drawWorld:()=>{},drawRoomForeground:()=>{},recordFrame:()=>{}});
const js=fs.readFileSync(new URL('app.js',root),'utf8').replace(/^import .*?;\r?\n/gm,'');
w.eval(js+'\nwindow.testAPI={s,enter,enterPlace,exitRoom,phase,wake,sleep,bed,roomConfig,indoorBlocked,follow,frame,keys,setRoute:(path)=>{route=path;tapTarget=route.shift()},getTarget:()=>tapTarget};');
const a=w.testAPI,find=id=>world.buildings.find(b=>b[0]===id);
assert.equal(direction(1,0),'right');assert.equal(direction(-1,-1),'backLeft');assert.equal(direction(1,1),'frontRight');
a.wake();assert.equal(a.s.room,'dorm');assert.equal(a.s.inBed,true);
w.document.getElementById('getUp').click();assert.equal(a.s.inBed,false);
a.exitRoom();assert.equal(a.s.room,null);assert.equal(world.blocked(a.s.p.x,a.s.p.y),false);
const route=[['canteen2',0,0],['class1',1,1],['canteen2',2,2],['class1',3,3],['canteen2',3,4],['class1',5,5]];
for(const [id,inside,outside]of route){a.enter(find(id));assert.equal(a.s.phase,inside,id+' entering');a.exitRoom();assert.equal(a.s.phase,outside,id+' leaving')}
assert.equal(a.s.visits.canteen,3);assert.equal(a.s.visits.class,3);
a.phase(2);assert.equal(a.s.phase,5,'day never regresses');
a.enter(find('library'));assert.equal(a.s.room,'library');assert.equal(a.s.phase,5);assert.equal(a.roomConfig().length,4);a.exitRoom();
assert(a.indoorBlocked(5,50));
for(const id of ['court','pond']){const p=world.placeSpots.find(p=>p[0]===id);a.enterPlace(p);assert.equal(a.s.room,id);assert.equal(a.roomConfig().length,4);a.exitRoom();assert(!world.blocked(a.s.p.x,a.s.p.y),id+' return point');}
a.enter(find('dorm'));a.s.washed=true;a.s.checked=true;a.sleep();
assert.equal(a.s.sleeping,true);assert(timers.some(t=>t.ms===32200),'30 seconds after 2.2-second eyelid close');
timers.findLast(t=>t.ms===32200).fn();
assert.equal(a.s.phase,0);assert.equal(a.s.inBed,true);assert.equal(a.s.visits.class,0);assert.equal(a.s.visits.canteen,0);assert.equal(a.s.sleeping,false);
a.s.washed=true;a.phase(5);assert.equal(a.s.washed,false,'night requires a new wash');
a.s.cam.follow=false;a.follow();assert.equal(a.s.cam.follow,true);
// Collision grid checks: every interactive door must be reachable from the starting dorm.
const step=3,cols=361,rows=493,seen=new Uint8Array(cols*rows),pass=new Uint8Array(cols*rows);
for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)pass[y*cols+x]=!world.blocked(x*step,y*step);
let start=Math.round(376/step)*cols+Math.round(317/step),queue=[start];seen[start]=1;
for(let i=0;i<queue.length;i++){let n=queue[i],x=n%cols,y=Math.floor(n/cols);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){let xx=x+dx,yy=y+dy,k=yy*cols+xx;if(xx>=0&&xx<cols&&yy>=0&&yy<rows&&pass[k]&&!seen[k]){seen[k]=1;queue.push(k)}}}
for(const b of world.buildings.filter(world.kindFor)){const x=b[2]+b[4]/2,y=b[3]+b[5]+9;assert(!world.blocked(x,y),b[1]+' exit blocked');assert(seen[Math.round(y/step)*cols+Math.round(x/step)],b[1]+' unreachable')}
for(const file of ['app.js','style.css','refinements.css','world-data.js','assets/front.svg','assets/back.svg','assets/side.svg','assets/world.svg','assets/dorm.svg','assets/canteen.svg','assets/class.svg','assets/morning.svg','assets/desk.svg','assets/opening.mp4'])assert(fs.existsSync(new URL(file,root)),file+' exists');
for(const name of fs.readdirSync(new URL('assets/',root)).filter(n=>n.endsWith('.svg'))){const svg=fs.readFileSync(new URL('assets/'+name,root),'utf8');assert(/viewBox=/.test(svg),name+' scalable viewport');assert(!/<image\b/.test(svg),name+' has no embedded raster');assert(!/NaN|undefined/.test(svg),name+' valid coordinates')}
// Exercise actual input handlers without a browser or a running web server.
w.document.getElementById('getUp').click();a.exitRoom();
let initialX=a.s.p.x;a.keys.add('d');a.frame(w.performance.now()+40);a.keys.clear();assert(a.s.p.x>initialX,'keyboard moves original actor');
let playerX=a.s.p.x,playerY=a.s.p.y,camX=a.s.cam.x;
const game=w.document.getElementById('game');game.setPointerCapture=()=>{};
game.dispatchEvent(new w.MouseEvent('pointerdown',{clientX:600,clientY:400,bubbles:true}));
game.dispatchEvent(new w.MouseEvent('pointermove',{clientX:750,clientY:400,bubbles:true}));
game.dispatchEvent(new w.MouseEvent('pointerup',{bubbles:true}));
assert.equal(a.s.p.x,playerX);assert.equal(a.s.p.y,playerY);assert.notEqual(a.s.cam.x,camX);assert.equal(a.s.cam.follow,false);
await new Promise(setImmediate);
// Advance the real frame loop across a complete automatic route.
a.s.p.x=317;a.s.p.y=376;a.s.room=null;a.s.inBed=false;a.s.sleeping=false;
const dest=find('canteen2'),target={x:dest[2]+dest[4]/2,y:dest[3]+dest[5]+9};a.setRoute(findPath(a.s.p,target));let now=w.performance.now()+100;
for(let i=0;i<15000&&a.getTarget();i++){now+=16;a.frame(now)}
assert(Math.hypot(a.s.p.x-target.x,a.s.p.y-target.y)<5,'automatic walk reaches canteen without stuck waypoint '+JSON.stringify({position:a.s.p,target,next:a.getTarget()}));
assert.equal(w.document.getElementById('startButton').disabled,false,'preload completes');
// Hold one key across frames: movement must be time-based, including slow frames.
let clearStart;
for(let y=100;y<1400&&!clearStart;y+=10)for(let x=100;x<980;x+=10){
 if(Array.from({length:43},(_,i)=>!world.blocked(x+i-21,y)).every(Boolean)){clearStart={x,y};break}
}
assert(clearStart,'open road segment for speed checks');
a.s.room=null;a.s.started=true;a.s.inBed=false;a.s.sleeping=false;a.setRoute([]);
for(const hz of [60,30,10,5])for(const [key,sign,heading]of [['d',1,'right'],['a',-1,'left']]){
 a.keys.clear();Object.assign(a.s.p,clearStart);now+=1000;a.frame(now);
 w.dispatchEvent(new w.KeyboardEvent('keydown',{key}));
 for(let i=0;i<hz/5;i++){now+=1000/hz;a.frame(now)}
 assert(Math.abs(a.s.p.x-clearStart.x-sign*19.2)<.001,`${hz} fps: outdoor speed stays 96 units/s`);
 assert.equal(a.s.p.dir,heading,'body heading follows movement');
 w.dispatchEvent(new w.KeyboardEvent('keyup',{key}));
 const stopped=a.s.p.x;now+=100;a.frame(now);assert.equal(a.s.p.x,stopped,'keyup stops movement');
}
w.dispatchEvent(new w.KeyboardEvent('keydown',{key:'d'}));w.dispatchEvent(new w.Event('blur'));
assert.equal(a.keys.size,0,'losing focus clears held keys');
console.log('PASS: continuous left/right movement, time-based outdoor speed, key release and focus-loss stop.');
console.log('PASS: startup from bed; six visits; monotonic time; night routine reset; 30-second sleep; keyboard movement; stationary-player camera drag; recenter; '+world.buildings.filter(world.kindFor).length+' reachable entrances; complete local assets; true SVG paths.');
dom.window.close();
