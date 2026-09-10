import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(require.resolve('sharp',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES]}));
const root=new URL('../dist/assets/',import.meta.url);
await sharp(new URL('layers/ground.svg',root).pathname,{limitInputPixels:false}).webp({quality:96}).toFile(new URL('layers/ground.webp',root).pathname);
await sharp(new URL('tree.svg',root).pathname).resize(300,390,{fit:'contain',background:'#00000000'}).png().toFile(new URL('layers/tree.png',root).pathname);
console.log('Prepared ground and shared tree texture.');
