import {createRequire} from 'node:module';
import fs from 'node:fs';
const require=createRequire(import.meta.url),sharp=require(require.resolve('sharp',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES]}));
const source=new URL('../art-source/',import.meta.url).pathname;
const out=new URL('../dist/assets/',import.meta.url).pathname;
const scenes=['dorm','canteen','class','library','court','pond'];
fs.mkdirSync(new URL('../art-source/',import.meta.url),{recursive:true});
for(const name of scenes)await sharp(source+name+'.png').webp({quality:96}).toFile(out+name+'-v3.webp');
// Normalize the generated sprite grid to fixed, aligned cells; never enlarge source detail.
const sprite=source+'walk-original.png';

const xs=[25,180,337,491,641,789,944,1095,1254],ys=[4,170,318,465,617,768,917,1069,1254],composite=[];
for(let row=0;row<8;row++)for(let col=0;col<8;col++){
 const region={left:xs[col],top:ys[row],width:xs[col+1]-xs[col],height:ys[row+1]-ys[row]};const {data,info}=await sharp(sprite).extract(region).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let x0=info.width,y0=info.height,x1=0,y1=0;for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>180){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
 const width=x1-x0+1,height=y1-y0+1,scale=Math.min(1,144/height,144/width),w=Math.round(width*scale),h=Math.round(height*scale);
 const input=await sharp(sprite).extract({left:region.left+x0,top:region.top+y0,width,height}).resize(w,h).png().toBuffer();composite.push({input,left:col*160+Math.round((160-w)/2),top:row*160+150-h});
}
await sharp({create:{width:1280,height:1280,channels:4,background:'#00000000'}}).composite(composite).png().toFile(out+'walk.png');
console.log('Imported six native-resolution scenes and aligned 64-frame walking atlas.');
