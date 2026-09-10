import {buildings,placeSpots,roads} from './world-data.js';
import {trees} from './trees-data.js';
const art=new Map();
export const directions=['front','frontLeft','left','backLeft','back','backRight','right','frontRight'];
export function direction(dx,dy){return directions[(Math.round(Math.atan2(-dx,dy)/(Math.PI/4))+8)%8]}
export async function loadArt(progress=()=>{}){
 const paths=['layers/ground.webp','layers/tree.png','walk.png',...['dorm','canteen','class','library','court','pond'].map(n=>n+'-v3.webp'),...buildings.map(b=>'layers/'+b[0]+'.svg')];let done=0;
 await Promise.all(paths.map(path=>new Promise((resolve,reject)=>{const i=new Image(),timer=setTimeout(()=>reject(new Error('素材加载超时：'+path)),45000);i.onload=()=>{clearTimeout(timer);art.set(path,i);progress(++done,paths.length);resolve()};i.onerror=()=>{clearTimeout(timer);reject(new Error(path))};i.src='assets/'+path})));return true;
}
export function drawStudent(ctx,x,y,height,dir,frame){const sheet=art.get('walk.png');ctx.fillStyle='#263e4b38';ctx.beginPath();ctx.ellipse(x,y,height*.19,height*.065,0,0,Math.PI*2);ctx.fill();if(!sheet)return;const cellW=sheet.width/8,cellH=sheet.height/8,row=Math.max(0,directions.indexOf(dir));ctx.drawImage(sheet,(frame%8)*cellW,row*cellH,cellW,cellH,x-height*.5,y-height*.93,height,height)}
export function drawWorld(ctx,s,w,h,frame,target){
 const z=8*s.zoom,left=s.cam.x-w/2/z,top=s.cam.y-h/2/z,right=left+w/z,bottom=top+h/z;
 ctx.save();ctx.translate(w/2-s.cam.x*z,h/2-s.cam.y*z);ctx.scale(z,z);ctx.fillStyle='#78928e';ctx.fillRect(left,top,w/z,h/z);
 const ground=art.get('layers/ground.webp');if(ground)ctx.drawImage(ground,0,0,1080,1476);
 // Road curbs stay vector-sharp even when the ground texture is zoomed.
 ctx.lineJoin='round';ctx.lineCap='round';for(const r of roads){for(const [width,color]of [[16.5,'#4b667477'],[15.5,'#dce1d8bb'],[13.6,'#c2ccc7']]){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();r.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke()}ctx.setLineDash([.8,2.7]);ctx.lineWidth=.18;ctx.strokeStyle='#627b8477';ctx.stroke();ctx.setLineDash([])}
 const items=[];
 for(const b of buildings){if(b[2]+b[4]+10<left||b[2]-10>right||b[3]+b[5]+10<top||b[3]-10>bottom)continue;items.push({y:b[3]+b[5],draw(){const im=art.get('layers/'+b[0]+'.svg');if(im)ctx.drawImage(im,b[2]-8,b[3]-8,b[4]+16,b[5]+16)}})}
 const tree=art.get('layers/tree.png');for(const t of trees){const size=t[2];if(t[0]+size<left||t[0]-size>right||t[1]+size<top||t[1]-size>bottom)continue;items.push({y:t[1],draw(){if(tree)ctx.drawImage(tree,t[0]-size/2,t[1]-size*1.2,size,size*1.3)}})}
 items.push({y:s.p.y,draw(){drawStudent(ctx,s.p.x,s.p.y,11.5,s.p.dir,frame)}});items.sort((a,b)=>a.y-b.y);for(const item of items)item.draw();
 if(target){ctx.strokeStyle='#f7e7af';ctx.lineWidth=.3;ctx.beginPath();ctx.ellipse(target.x,target.y,2,1,0,0,7);ctx.stroke()}
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${14/z}px "Microsoft YaHei", sans-serif`;
 for(const b of buildings){const x=b[2]+b[4]/2,y=b[3]+b[5]+5;if(x<left-20||x>right+20||y<top||y>bottom)continue;const tw=ctx.measureText(b[1]).width;ctx.fillStyle='#213b4dde';ctx.fillRect(x-tw/2-5/z,y-10/z,tw+10/z,20/z);ctx.fillStyle='#edf1e7';ctx.fillText(b[1],x,y)}
 for(const p of placeSpots.filter(p=>['court','pond'].includes(p[0]))){ctx.fillStyle='#213b4ddd';const label=p[1]+' · E',tw=ctx.measureText(label).width;ctx.fillRect(p[2]-tw/2-5/z,p[3]-10/z,tw+10/z,20/z);ctx.fillStyle='#f8edbd';ctx.fillText(label,p[2],p[3])}
 ctx.restore();
}
