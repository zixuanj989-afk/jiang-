import {buildings,placeSpots,roads} from './world-data.js';
import {trees} from './trees-data.js';
const art=new Map();
export const directions=['front','frontLeft','left','backLeft','back','backRight','right','frontRight'];
export function direction(dx,dy){return directions[(Math.round(Math.atan2(-dx,dy)/(Math.PI/4))+8)%8]}
export async function loadArt(progress=()=>{}){
 const paths=['layers/ground.webp','layers/tree.png','walk.png','dorm-v3.svg',...buildings.map(b=>'layers/'+b[0]+'.svg')];let done=0;
 await Promise.all(paths.map(path=>new Promise((resolve,reject)=>{const i=new Image(),timer=setTimeout(()=>reject(new Error('素材加载超时：'+path)),45000);i.onload=()=>{clearTimeout(timer);art.set(path,i);progress(++done,paths.length);resolve()};i.onerror=()=>{clearTimeout(timer);reject(new Error(path))};i.src='assets/'+path})));return true;
}
export function drawStudent(ctx,x,y,height,dir,frame){const sheet=art.get('walk.png');ctx.fillStyle='#263e4b38';ctx.beginPath();ctx.ellipse(x,y,height*.19,height*.065,0,0,Math.PI*2);ctx.fill();if(!sheet)return;const cellW=sheet.width/8,cellH=sheet.height/8,row=Math.max(0,directions.indexOf(dir));ctx.drawImage(sheet,(frame%8)*cellW,row*cellH,cellW,cellH,x-height*.5,y-height*.93,height,height)}

let backgroundCache=null;
function staticWorld(ctx,left,top,right,bottom){
 ctx.fillStyle='#78928e';ctx.fillRect(left,top,right-left,bottom-top);
 const ground=art.get('layers/ground.webp');if(ground)ctx.drawImage(ground,0,0,1080,1476);
 ctx.lineJoin='round';ctx.lineCap='round';for(const r of roads){for(const [width,color]of [[16.5,'#4b667477'],[15.5,'#dce1d8bb'],[13.6,'#c2ccc7']]){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();r.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke()}ctx.setLineDash([.8,2.7]);ctx.lineWidth=.18;ctx.strokeStyle='#627b8477';ctx.stroke();ctx.setLineDash([])}
 const items=visibleObjects(left,top,right,bottom);for(const item of items)item.draw(ctx);return items;
}
function visibleObjects(left,top,right,bottom){
 const items=[];
 for(const b of buildings){const x=b[2]-8,y=b[3]-8,w=b[4]+16,h=b[5]+16;if(x+w<left||x>right||y+h<top||y>bottom)continue;items.push({x,y,w,h,depth:b[3]+b[5],draw(ctx){const im=art.get('layers/'+b[0]+'.svg');if(im)ctx.drawImage(im,x,y,w,h)}})}
 const tree=art.get('layers/tree.png');for(const t of trees){const size=t[2],x=t[0]-size/2,y=t[1]-size*1.2,w=size,h=size*1.3;if(x+w<left||x>right||y+h<top||y>bottom)continue;items.push({x,y,w,h,depth:t[1],draw(ctx){if(tree)ctx.drawImage(tree,x,y,w,h)}})}
 return items.sort((a,b)=>a.depth-b.depth);
}
export function drawWorld(ctx,s,w,h,frame,target){
 const z=8*s.zoom,left=s.cam.x-w/2/z,top=s.cam.y-h/2/z,right=left+w/z,bottom=top+h/z;
 let visible;
 if(typeof document!=='undefined'){
  // Cache a padded static view. It only rebuilds after camera travel or zoom,
  // while the student and local occluders remain depth-correct every frame.
  const d=Math.min(devicePixelRatio||1,2),pad=240/z;
  let c=backgroundCache;
  if(!c||c.z!==z||c.d!==d||c.w!==w||c.h!==h||left<c.left||top<c.top||right>c.right||bottom>c.bottom){
   const surface=document.createElement('canvas');surface.width=Math.ceil((w+480)*d);surface.height=Math.ceil((h+480)*d);
   c={surface,z,d,w,h,left:left-pad,top:top-pad,right:right+pad,bottom:bottom+pad};
   const painter=surface.getContext('2d');painter.scale(z*d,z*d);painter.translate(-c.left,-c.top);
   c.objects=staticWorld(painter,c.left,c.top,c.right,c.bottom);backgroundCache=c;
  }
  ctx.drawImage(c.surface,(c.left-left)*z,(c.top-top)*z,c.surface.width/d,c.surface.height/d);
  visible=c.objects;
 }else{
  ctx.save();ctx.translate(-left*z,-top*z);ctx.scale(z,z);visible=staticWorld(ctx,left,top,right,bottom);ctx.restore();
 }
 ctx.save();ctx.translate(-left*z,-top*z);ctx.scale(z,z);
 drawStudent(ctx,s.p.x,s.p.y,11.5,s.p.dir,frame);
 for(const item of visible){if(item.depth>s.p.y&&item.x<s.p.x+6&&item.x+item.w>s.p.x-6&&item.y<s.p.y+1&&item.y+item.h>s.p.y-11)item.draw(ctx)}
 if(target){ctx.strokeStyle='#f7e7af';ctx.lineWidth=.3;ctx.beginPath();ctx.ellipse(target.x,target.y,2,1,0,0,7);ctx.stroke()}
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${14/z}px "Microsoft YaHei", sans-serif`;
 for(const b of buildings){const x=b[2]+b[4]/2;let y=b[3]+b[5]+5;if(x<left-20||x>right+20||y<top||y>bottom)continue;const tw=ctx.measureText(b[1]).width;if(Math.abs(x-s.p.x)<tw/2+7&&y>s.p.y-12&&y<s.p.y+4)y=s.p.y+6;ctx.fillStyle='#213b4dde';ctx.fillRect(x-tw/2-5/z,y-10/z,tw+10/z,20/z);ctx.fillStyle='#edf1e7';ctx.fillText(b[1],x,y)}
 for(const p of placeSpots.filter(p=>['court','pond'].includes(p[0]))){if(p[2]<left||p[2]>right||p[3]<top||p[3]>bottom)continue;ctx.fillStyle='#213b4ddd';const label=p[1]+' · E',tw=ctx.measureText(label).width;ctx.fillRect(p[2]-tw/2-5/z,p[3]-10/z,tw+10/z,20/z);ctx.fillStyle='#f8edbd';ctx.fillText(label,p[2],p[3])}
 ctx.restore();
}
