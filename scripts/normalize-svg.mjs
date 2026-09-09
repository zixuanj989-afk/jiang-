import fs from 'node:fs';
for(const f of fs.readdirSync('dist/assets').filter(f=>f.endsWith('.svg'))){const p='dist/assets/'+f;let t=fs.readFileSync(p,'utf8');if(!t.slice(0,300).includes('viewBox')){t=t.replace(/(<svg[^>]*width="(\d+)" height="(\d+)")/,(m,a,w,h)=>a+` viewBox="0 0 ${w} ${h}"`);fs.writeFileSync(p,t)}}
