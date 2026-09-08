'use strict';
// ponytail: one upright opaque object, plain and smoothly lit, fully inside frame.
// Background is estimated per row by blending that row's left and right edge colour, so a studio
// gradient is tracked where a single near-white threshold reads the whole frame as foreground.
// Busy, cropped-through or reflective backgrounds are out of scope and fail the sanity gate below.
function segment(img,fillRows=true,{tolerance=32,trimShadow=true,clearEnclosed=false}={}){
 const w=img.naturalWidth,h=img.naturalHeight,m=document.createElement('canvas');
 m.width=w;m.height=h;const x=m.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0);
 const id=x.getImageData(0,0,w,h),d=id.data,N=w*h,tol=tolerance;
 const med=a=>{a.sort((p,q)=>p-q);return(a[(a.length-1)>>1]+a[a.length>>1])/2;};
 const edge=(y,x0)=>{const r=[],g=[],b=[];for(let i=0;i<Math.min(6,w);i++){const j=(y*w+x0+i)*4;r.push(d[j]);g.push(d[j+1]);b.push(d[j+2]);}return[med(r),med(g),med(b)];};
 const ok=new Uint8Array(N);
 for(let y=0;y<h;y++){const L=edge(y,0),R=edge(y,Math.max(0,w-6));
  for(let px=0;px<w;px++){const t=w>1?px/(w-1):0,j=(y*w+px)*4;
   ok[y*w+px]=d[j+3]===0||Math.max(Math.abs(d[j]-(L[0]*(1-t)+R[0]*t)),Math.abs(d[j+1]-(L[1]*(1-t)+R[1]*t)),Math.abs(d[j+2]-(L[2]*(1-t)+R[2]*t)))<=tol?1:0;}}
 const q=new Int32Array(N),seen=new Uint8Array(N),cleared=new Uint8Array(N);let head=0,tail=0;
 const push=i=>{if(i<0||i>=N||seen[i])return;seen[i]=1;if(!ok[i])return;cleared[i]=1;q[tail++]=i;};
 for(let i=0;i<w;i++){push(i);push((h-1)*w+i);}
 for(let y=0;y<h;y++){push(y*w);push(y*w+w-1);}
 while(head<tail){const i=q[head++];if(i%w)push(i-1);if(i%w<w-1)push(i+1);push(i-w);push(i+w);}
 // Explicit opt-in colour-key experiment: enclosed matches may also be white object surfaces.
 if(clearEnclosed)for(let i=0;i<N;i++)if(ok[i])cleared[i]=1;
 for(let i=0;i<N;i++)if(d[i*4+3]===0)cleared[i]=1;
 // An upright bottle is horizontally convex at every height, so refilling each row's span closes
 // any low-contrast leak (here: the bottle's own reflection) that ate a channel up its middle.
 const wid=new Int32Array(h),ends=new Int32Array(h*2);
 for(let y=0;y<h;y++){let a=-1,b=-1;
  for(let px=0;px<w;px++)if(!cleared[y*w+px]){if(a<0)a=px;b=px;}
  if(a<0)continue;if(fillRows)for(let px=a;px<=b;px++)if(d[(y*w+px)*4+3])cleared[y*w+px]=0;
  wid[y]=b-a+1;ends[y*2]=a;ends[y*2+1]=b;}
 let top=-1,base=-1;for(let y=0;y<h;y++)if(wid[y]){if(top<0)top=y;base=y;}
 if(top<0)return null;
 const nz=[];for(let y=top;y<=base;y++)if(wid[y])nz.push(wid[y]);
 nz.sort((a,b)=>a-b);const body=nz[nz.length>>1];
 // The contact shadow and mirror reflection survive segmentation (they are genuinely darker
 // than the background). Below its widest point a bottle's silhouette only narrows, so the first
 // row in the lower part that flares back out is where the object ends and its shadow begins.
 // Only when the object ends inside the frame; a bottle cropped by the bottom edge has no
 // shadow below it, and trimming one there would shrink the silhouette and rescale the artwork.
 if(trimShadow&&base<h-1){let run=1e9;
  for(let y=top+((base-top)*.6|0);y<=base;y++){
   if(wid[y]<run)run=wid[y];
   if(wid[y]>run+body*.06){base=y-1;break;}}
  for(let y=base+1;y<h;y++){for(let px=0;px<w;px++)cleared[y*w+px]=1;wid[y]=0;}}
 for(let i=0;i<N;i++)if(cleared[i])d[i*4+3]=0;
 x.putImageData(id,0,0);return maskGeometry(m);
}
function maskGeometry(canvas){
 const w=canvas.width,h=canvas.height,d=canvas.getContext('2d').getImageData(0,0,w,h).data;
 const centers=[];let top=-1,base=-1,width=0,kept=0,onL=false,onR=false;
 for(let y=0;y<h;y++){let left=-1,right=-1;
  for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]){kept++;if(left<0)left=x;right=x;}
  if(left<0)continue;if(top<0)top=y;base=y;width=Math.max(width,right-left+1);centers.push((left+right)/2);
  if(left===0)onL=true;if(right===w-1)onR=true;
 }
 if(top<0)return null;centers.sort((a,b)=>a-b);
 return{canvas,top,base,cx:centers[centers.length>>1],width,kept:kept/(w*h),bothSides:onL&&onR};
}
