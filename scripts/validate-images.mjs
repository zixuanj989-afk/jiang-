import {createRequire} from 'node:module';
import fs from 'node:fs';
const require=createRequire(import.meta.url),sharp=require(require.resolve('sharp',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES]}));
const assets=new URL('../dist/assets/',import.meta.url);
for(const name of ['walk.png',...['dorm','canteen','class','library','court','pond'].map(n=>n+'-v3.webp'),'layers/tree.png','layers/ground.webp']){const {info}=await sharp(new URL(name,assets).pathname).raw().toBuffer({resolveWithObject:true});console.log(name,info.width+'×'+info.height)}
for(const name of fs.readdirSync(new URL('layers/',assets)).filter(n=>n.endsWith('.svg'))){const svg=fs.readFileSync(new URL('layers/'+name,assets),'utf8');if(!svg.endsWith('</svg>')||/NaN|undefined/.test(svg))throw new Error('Invalid SVG: '+name)}
console.log('PASS: full image decoding and vector structure.');
