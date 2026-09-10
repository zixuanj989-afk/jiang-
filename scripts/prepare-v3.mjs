import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(require.resolve('sharp',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES]}));
const root=new URL('../dist/assets/',import.meta.url);
if(!process.argv.includes('--tree-only'))fs.writeFileSync(new URL('layers/ground.webp',root),await sharp(new URL('layers/ground.svg',root).pathname,{limitInputPixels:false}).webp({quality:96}).toBuffer(),{flush:true});
const cleanTree=fs.readFileSync(new URL('tree.svg',root),'utf8').replace(/<path\b[^>]*fill="#000000"[^>]*\/>/g,'');
fs.writeFileSync(new URL('layers/tree.png',root),await sharp(Buffer.from(cleanTree)).resize(420,546,{fit:'contain',background:'#00000000'}).png().toBuffer(),{flush:true});
console.log('Prepared ground and shared tree texture.');
