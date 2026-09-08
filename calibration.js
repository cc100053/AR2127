'use strict';
// Unit rectangle -> image plane; shared with the phone's existing artwork.
function project(quad){
 const [[x0,y0],[x1,y1],[x2,y2],[x3,y3]]=quad;
 const dx1=x1-x2,dx2=x3-x2,dx3=x0-x1+x2-x3,dy1=y1-y2,dy2=y3-y2,dy3=y0-y1+y2-y3;
 const det=dx1*dy2-dx2*dy1;
 if(Math.abs(det)<1e-9)throw Error('四角太接近或重疊，請重新標記');
 const g=(dx3*dy2-dx2*dy3)/det,h=(dx1*dy3-dx3*dy1)/det;
 const a=x1-x0+g*x1,b=x3-x0+h*x3,d=y1-y0+g*y1,e=y3-y0+h*y3;
 const map=(u,v)=>{const z=g*u+h*v+1;return[(a*u+b*v+x0)/z,(d*u+e*v+y0)/z];};
 map.inverse=(x,y)=>{const A=a-x*g,B=b-x*h,D=d-y*g,E=e-y*h,z=A*E-B*D;return[((x-x0)*E-B*(y-y0))/z,(A*(y-y0)-(x-x0)*D)/z];};
 return map;
}
function validQuad(q,w,h){
 if(q.length!==4||q.some(p=>p.length!==2||p.some(v=>!Number.isFinite(v))||p[0]<0||p[0]>w||p[1]<0||p[1]>h))return false;
 let area=0;const turns=[];
 for(let i=0;i<4;i++){const a=q[i],b=q[(i+1)%4],c=q[(i+2)%4];area+=a[0]*b[1]-b[0]*a[1];turns.push((b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]));}
 return Math.abs(area)>w*h*.02&&(turns.every(v=>v>0)||turns.every(v=>v<0));
}
function warpPhoto(img,quad,target,w,h){
 if(!validQuad(quad,img.naturalWidth,img.naturalHeight))throw Error('請順序標記四角，範圍至少佔相片 1%，避免交叉或重疊');
 const from=project(quad),to=project(target),src=document.createElement('canvas'),out=document.createElement('canvas');
 src.width=img.naturalWidth;src.height=img.naturalHeight;out.width=w;out.height=h;
 const sg=src.getContext('2d',{willReadFrequently:true});sg.drawImage(img,0,0);
 const data=sg.getImageData(0,0,src.width,src.height).data,g=out.getContext('2d'),p=g.createImageData(w,h);
 const left=Math.max(0,Math.floor(Math.min(...target.map(p=>p[0])))),right=Math.min(w,Math.ceil(Math.max(...target.map(p=>p[0]))));
 const top=Math.max(0,Math.floor(Math.min(...target.map(p=>p[1])))),bottom=Math.min(h,Math.ceil(Math.max(...target.map(p=>p[1]))));
 for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){
  const [u,v]=to.inverse(x+.5,y+.5);if(!Number.isFinite(u)||!Number.isFinite(v)||u<0||u>1||v<0||v>1)continue;
  const point=from(u,v),sx=Math.max(0,Math.min(src.width-1,point[0]-.5)),sy=Math.max(0,Math.min(src.height-1,point[1]-.5));
  const ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy;let alpha=0,r=0,green=0,b=0;
  // Bilinear sampling in premultiplied alpha avoids dark fringes on uploaded cutouts.
  for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){
   const j=(Math.min(src.height-1,iy+dy)*src.width+Math.min(src.width-1,ix+dx))*4,weight=(dx?fx:1-fx)*(dy?fy:1-fy)*data[j+3];
   alpha+=weight;r+=data[j]*weight;green+=data[j+1]*weight;b+=data[j+2]*weight;
  }
  const k=(y*w+x)*4;if(alpha){p.data[k]=r/alpha;p.data[k+1]=green/alpha;p.data[k+2]=b/alpha;p.data[k+3]=alpha;}
 }
 g.putImageData(p,0,0);return out;
}
function suggestCorners(img){
 const mask=segment(img,false,{trimShadow:false});if(!mask||mask.bothSides||mask.kept>.85)throw Error('背景或輪廓唔清楚，請手動標記四角');
 const w=img.naturalWidth,h=img.naturalHeight,d=mask.canvas.getContext('2d').getImageData(0,0,w,h).data,points=[];
 for(let y=0;y<h;y++){let left=-1,right=-1;for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>127){if(left<0)left=x;right=x;}if(left>=0){points.push([left,y]);if(right!==left)points.push([right,y]);}}
 points.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const half=points=>{const out=[];for(const p of points){while(out.length>1&&cross(out[out.length-2],out[out.length-1],p)<=0)out.pop();out.push(p);}return out;};
 const lower=half(points),upper=half([...points].reverse());lower.pop();upper.pop();const hull=lower.concat(upper);
 if(hull.length<4)throw Error('搵唔到四邊形，請手動標記');
 const area=q=>Math.abs(q.reduce((sum,p,i)=>sum+p[0]*q[(i+1)%q.length][1]-q[(i+1)%q.length][0]*p[1],0))/2,full=area(hull);
 // ponytail: convex outline reduced to four vertices; rounded corners and shadows still need human adjustment.
 while(hull.length>4){let index=0,least=Infinity;for(let i=0;i<hull.length;i++){const loss=Math.abs(cross(hull[(i+hull.length-1)%hull.length],hull[i],hull[(i+1)%hull.length]));if(loss<least){least=loss;index=i;}}hull.splice(index,1);}
 if(area(hull)/full<.86||!validQuad(hull,w,h))throw Error('輪廓唔夠接近四邊形，請手動標記');
 const start=hull.reduce((best,p,i)=>p[0]+p[1]<hull[best][0]+hull[best][1]?i:best,0);
 return hull.slice(start).concat(hull.slice(0,start));
}
function mountCalibration({parent,kind,target,width,height,onReady,onRestore}){
 const panel=document.createElement('details');panel.className='calibration';
 panel.innerHTML=`<summary>用另一張${kind}相片試演化（人工四角校準）</summary>
 <p>選擇正面清楚、四角完整嘅相片。依次標記左上、右上、右下、左下，將相片對齊現有造型；呢個係人工校準，唔係自動辨識或 3D 重建。</p>
 <label>載入相片 <input class="cal-file" type="file" accept="image/jpeg,image/png,image/webp"></label>
 <canvas class="cal-view" width="728" height="485" role="img" aria-label="點選物件四角嘅校準相片" hidden></canvas>
 <div class="cal-points">${['左上','右上','右下','左下'].map((name,i)=>`<label>${i+1} ${name}<span>X <input type="number" required min="0" data-point="${i}" data-axis="0" aria-label="${name} X"> Y <input type="number" required min="0" data-point="${i}" data-axis="1" aria-label="${name} Y"></span></label>`).join('')}</div>
 <div class="cal-actions"><button class="cal-auto" disabled>自動提議四角（本地）</button><button class="cal-apply" disabled>套用校準並推演</button><button class="cal-clear" disabled>重新標四角</button><button class="cal-restore">返回原示範</button></div><p class="cal-status" role="status">未載入新相片</p>`;
 parent.append(panel);
 const view=panel.querySelector('canvas'),g=view.getContext('2d'),status=panel.querySelector('.cal-status'),apply=panel.querySelector('.cal-apply'),clear=panel.querySelector('.cal-clear'),auto=panel.querySelector('.cal-auto'),fields=[...panel.querySelectorAll('[data-point]')];
 let image=null,points=[],request=0,revision=0;
 const tell=(text,error=false)=>{status.textContent=text;status.classList.toggle('error',error);};
 function paint(){if(!image)return;g.clearRect(0,0,view.width,view.height);g.drawImage(image,0,0);
  g.lineWidth=Math.max(2,view.width/400);g.strokeStyle='#00e5b8';g.fillStyle='#062d27';g.font=`bold ${Math.max(16,view.width/35)}px sans-serif`;
  const radius=Math.max(12,view.width/50);g.beginPath();points.forEach((p,i)=>{i?g.lineTo(...p):g.moveTo(...p);});if(points.length===4)g.closePath();g.stroke();
  points.forEach(([x,y],i)=>{g.beginPath();g.arc(x,y,radius,0,Math.PI*2);g.fill();g.stroke();g.save();g.fillStyle='white';g.textAlign='center';g.textBaseline='middle';g.fillText(i+1,x,y);g.restore();});
 }
 function reset(){revision++;points=[];for(const f of fields)f.value='';apply.disabled=true;paint();}
 function ready(){apply.disabled=!image||!validQuad(points,view.width,view.height);}
 view.addEventListener('click',e=>{if(!image)return;revision++;if(points.length===4)reset();const r=view.getBoundingClientRect();points.push([(e.clientX-r.left)*view.width/r.width,(e.clientY-r.top)*view.height/r.height]);
  for(const f of fields)f.value=points[+f.dataset.point]?.[+f.dataset.axis]?.toFixed(1)??'';ready();paint();tell(points.length===4?(apply.disabled?'四角範圍無效，請重新標記':'四角已齊，可以套用'): `已標記 ${points.length}/4 個角`);
 });
 for(const f of fields){f.step='any';f.addEventListener('input',()=>{revision++;points=fields.every(f=>f.value!==''&&f.checkValidity())?[0,1,2,3].map(i=>fields.slice(i*2,i*2+2).map(f=>+f.value)):[];ready();paint();tell(apply.disabled?'請填齊有效四角座標':'四角已齊，可以套用');});}
 auto.addEventListener('click',()=>{if(!image)return;revision++;
  try{points=suggestCorners(image);for(const f of fields)f.value=points[+f.dataset.point][+f.dataset.axis].toFixed(1);ready();paint();tell('已按輪廓提議四角；請檢查位置及方向，必要時重新標記。未辨識物件類別。');}
  catch(e){reset();tell(e.message,true);}
 });
 clear.addEventListener('click',()=>{reset();tell('由左上角開始重新標記');});
 panel.querySelector('.cal-restore').addEventListener('click',()=>{request++;image=null;reset();view.hidden=true;clear.disabled=auto.disabled=true;onRestore();tell('已返回原示範');});
 panel.querySelector('.cal-file').addEventListener('change',async e=>{
  const file=e.target.files[0];e.target.value='';if(!file)return;const id=++request;image=null;reset();view.hidden=true;clear.disabled=auto.disabled=true;
  if(!/^image\/(jpeg|png|webp)$/.test(file.type)||file.size>20*1024*1024){tell('請用 20MB 以內嘅 JPEG / PNG / WebP',true);return;}
  const url=URL.createObjectURL(file),img=new Image();tell('載入中…');
  try{img.src=url;await img.decode();if(id!==request)return;
   if(Math.min(img.naturalWidth,img.naturalHeight)<200||img.naturalWidth*img.naturalHeight>40e6)throw Error('每邊至少 200px，總像素最多 4000 萬');
   // ponytail: calibration uses <=1200px input to keep interactive warping bounded.
   const scale=Math.min(1,1200/Math.max(img.naturalWidth,img.naturalHeight));view.width=Math.max(1,Math.round(img.naturalWidth*scale));view.height=Math.max(1,Math.round(img.naturalHeight*scale));
   g.drawImage(img,0,0,view.width,view.height);const normalized=new Image();normalized.src=view.toDataURL();await normalized.decode();if(id!==request)return;
   image=normalized;view.hidden=false;clear.disabled=auto.disabled=false;for(const f of fields)f.max=f.dataset.axis==='0'?view.width:view.height;paint();tell(`依次點四角：左上 → 右上 → 右下 → 左下${scale<1?'（分析相片已縮至 1200px）':''}`);
  }catch(e){if(id===request)tell(e.name==='EncodingError'?'圖片解碼失敗':e.message,true);}finally{URL.revokeObjectURL(url);}
 });
 apply.addEventListener('click',async()=>{if(!image)return;const id=request,version=revision;apply.disabled=true;
  try{const out=warpPhoto(image,points,target,width,height),normalized=new Image();normalized.src=out.toDataURL();await normalized.decode();if(id!==request||version!==revision)return;
   onReady(normalized,out);tell('已套用人工四角校準；正使用現有演化造型');
  }catch(e){if(id===request)tell(e.message,true);}finally{if(id===request)ready();}
 });
 return panel;
}
