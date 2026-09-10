// Foreground masks follow objects in the supplied scene images (percent coordinates).
// They reuse source pixels; they do not paint replacement furniture.
const rect=(x,y,w,h,z)=>({z,points:[[x,y],[x+w,y],[x+w,y+h],[x,y+h]]});
const desk=(x,y,w,h)=>({z:y+h,points:[[x+1,y],[x+w-1,y],[x+w,y+3],[x+w-1,y+4],[x+w-1,y+h],[x+w-2,y+h],[x+w-2,y+4],[x+2,y+4],[x+2,y+h],[x+1,y+h],[x+1,y+4],[x,y+3]]});
export const foreground={
 class:[...[[25,46,9,10],[40,46,9,10],[53,48,10,10],[67,49,9,10],[22,58,10,12],[38,58,10,12],[53,58,10,12],[68,59,11,12],[19,72,12,15],[36,72,12,15],[52,72,12,15],[68,73,13,15]].map(v=>desk(...v)),rect(51.7,36.5,7.7,11,48)],
 dorm:[{z:90,points:[[5,78],[7,30],[16,21],[28,22],[30,29],[24,80],[20,86],[20,92],[18,92],[18,86],[7,87],[7,94],[5,94]]},{z:91,points:[[72,22],[81,22],[87,30],[96,79],[96,95],[93,95],[93,88],[80,86],[80,92],[78,92],[78,83]]}],
 library:[desk(12,58,20,25),desk(76,58,20,25),rect(65,35,18,14,49)],
 canteen:[desk(7,58,22,22),desk(72,58,23,22)],
 court:[],
 pond:[{z:65,points:[[17,51],[20,51],[20,60],[36,56],[38,57],[38,63],[19,66],[17,64]]},{z:65,points:[[63,55],[78,56],[78,51],[81,51],[81,65],[64,63]]}]
};
let lastKey='';
export function drawRoomForeground(canvas,img,kind,position){
 const rect=img.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),width=Math.round(rect.width*d),height=Math.round(rect.height*d);
 if(!width||!height||!img.complete||!img.naturalWidth)return;
 const objects=(foreground[kind]||[]).filter(o=>position.y<o.z);
 const key=kind+':'+img.currentSrc+':'+width+':'+height+':'+objects.map(o=>o.z).join(',');if(lastKey===key)return;lastKey=key;
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height}
 const ctx=canvas.getContext('2d');ctx.clearRect(0,0,width,height);
 for(const o of objects){ctx.save();ctx.beginPath();o.points.forEach(([x,y],i)=>i?ctx.lineTo(x*width/100,y*height/100):ctx.moveTo(x*width/100,y*height/100));ctx.closePath();ctx.clip();ctx.drawImage(img,0,0,width,height);ctx.restore()}
}
