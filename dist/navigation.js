import {blocked} from './world-data.js';
const step=3,cols=361,rows=493;
let grid;
export function prepareNavigation(){if(grid)return;grid=new Uint8Array(cols*rows);for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)grid[y*cols+x]=!blocked(x*step,y*step)}
export function findPath(from,to){
 prepareNavigation();const sx=Math.round(from.x/step),sy=Math.round(from.y/step),tx=Math.round(to.x/step),ty=Math.round(to.y/step);
 if(tx<0||ty<0||tx>=cols||ty>=rows||!grid[ty*cols+tx])return [];
 const start=sy*cols+sx,end=ty*cols+tx;if(start===end)return [{x:to.x,y:to.y}];const queue=[start],seen=new Uint8Array(grid.length),parent=new Int32Array(grid.length);seen[start]=1;parent.fill(-1);
 for(let i=0;i<queue.length;i++){const n=queue[i];if(n===end)break;const x=n%cols,y=Math.floor(n/cols);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const xx=x+dx,yy=y+dy,k=yy*cols+xx;if(xx<0||yy<0||xx>=cols||yy>=rows||seen[k]||!grid[k])continue;if(dx&&dy&&(!grid[y*cols+xx]||!grid[yy*cols+x]))continue;seen[k]=1;parent[k]=n;queue.push(k)}}
 if(!seen[end])return [];const path=[];for(let n=end;n!==start;n=parent[n])path.push({x:(n%cols)*step,y:Math.floor(n/cols)*step});return path.reverse();
}
