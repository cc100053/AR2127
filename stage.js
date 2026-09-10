'use strict';
// 舞台層：五個 studies 入口同 phone.html 共用嘅卡牌式打光。
// 只依賴一張 1456×970 嘅 `future` 畫布 —— 唔識得任何 renderer，所以加新 renderer 唔使理呢層。
// 用法：stageBuild(future, accentOf(source)) 之後，喺 draw() 入面
//   stageBackdrop(ctx) → 畫主體 → stageOverlay(ctx, mix) → stageEdge(ctx)。
// The accent light is measured from the object's own pixels, so a banana's future glows amber and
// a steel flask's stays cold, instead of one house colour being painted over everything. A nearly
// grey object keeps the neutral cyan rather than being given a hue that its own photo never had.
function accentOf(canvas){
 const w=canvas.width,h=canvas.height,d=canvas.getContext('2d').getImageData(0,0,w,h).data;
 let r=0,g=0,b=0,n=0;
 for(let i=0;i<w*h;i+=7){const j=i*4;if(d[j+3]<200)continue;r+=d[j];g+=d[j+1];b+=d[j+2];n++;}
 if(!n)return{h:190,s:.55};
 r/=n*255;g/=n*255;b/=n*255;
 const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let hue=190,sat=0;
 if(mx!==mn){const dd=mx-mn;sat=l>.5?dd/(2-mx-mn):dd/(mx+mn);
  hue=60*(mx===r?(g-b)/dd+(g<b?6:0):mx===g?(b-r)/dd+2:(r-g)/dd+4);}
 return sat<.08?{h:190,s:.55}:{h:hue,s:Math.min(.8,.35+sat)};
}
// --- Card staging --------------------------------------------------------------------------
// The evolved form used to be a cutout floating on flat black. Hand-painted card art is not
// mostly detail, it is mostly *staging*: a lit backdrop, a rim light picking the silhouette off
// it, and a foil sheen. All three are procedural and cost one paint per build, so they cost the
// live demo nothing — which is why the polish budget goes here and not into more geometry.
const stage=document.createElement('canvas'),rim=document.createElement('canvas'),holo=document.createElement('canvas'),grain=document.createElement('canvas');
for(const cv of [stage,rim,holo,grain]){cv.width=1456;cv.height=970;}
// Perfectly smooth gradients are the last thing that still says "vector". Real surfaces carry a
// little noise, and a few percent of it is enough for the eye to stop reading the shading as a
// fill. xorshift rather than Math.random: build() re-runs, and the same photo must land on the
// same future every time.
const GRAIN=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=96;
 const g=cv.getContext('2d'),im=g.createImageData(96,96);let x=0x2127;
 for(let i=0;i<im.data.length;i+=4){x^=x<<13;x^=x>>>17;x^=x<<5;x>>>=0;
  const v=114+x%29;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255;}
 g.putImageData(im,0,0);return cv;})();
let stageAccent={h:190,s:.55},stageFuture=null;
const layer=cv=>{const c=cv.getContext('2d');c.setTransform(2,0,0,2,0,0);c.globalCompositeOperation='source-over';c.globalAlpha=1;c.clearRect(0,0,728,485);return c;};
// Silhouette of the evolved form, flooded with one colour. Both the rim and the sheen are just
// this shape masked differently, so neither can drift off the artwork it decorates.
function silhouette(cv,paint){const c=layer(cv);c.drawImage(stageFuture,0,0,728,485);
 c.globalCompositeOperation='source-in';paint(c);c.globalCompositeOperation='source-over';return c;}
function paintStage(){const c=layer(stage),H=stageAccent.h.toFixed(1),S=(Math.min(.62,stageAccent.s)*100).toFixed(0);
 const hsl=(l,a='')=>`hsl(${H} ${S}% ${l}%${a})`;
 c.fillStyle=hsl(5);c.fillRect(0,0,728,485);
 const key=c.createRadialGradient(364,222,8,364,222,340);
 key.addColorStop(0,hsl(27));key.addColorStop(.5,hsl(13));key.addColorStop(1,hsl(4));
 c.fillStyle=key;c.fillRect(0,0,728,485);
 // Nine rays, blurred hard and held at 7% alpha. Unblurred they read as a rising-sun poster —
 // drawn spokes competing with the subject — instead of light hanging in the air behind it.
 c.save();c.globalCompositeOperation='lighter';c.filter='blur(16px)';c.translate(364,222);
 for(let i=0;i<9;i++){c.rotate(Math.PI*2/9);
  const r=c.createLinearGradient(0,0,0,-380);
  r.addColorStop(0,hsl(46,' / 0'));r.addColorStop(.40,hsl(46,' / .07'));r.addColorStop(1,hsl(46,' / 0'));
  c.fillStyle=r;c.beginPath();c.moveTo(0,0);c.lineTo(-42,-400);c.lineTo(42,-400);c.fill();}
 c.restore();
 const vig=c.createRadialGradient(364,222,120,364,240,430);
 vig.addColorStop(0,'#0000');vig.addColorStop(.62,'#00000066');vig.addColorStop(1,'#000000e6');
 c.fillStyle=vig;c.fillRect(0,0,728,485);
}
// The artwork sits in a card, not in a rectangle of page background: rounded plate, thin edge.
const CARD=()=>{const p=new Path2D();p.roundRect(1,1,726,483,16);return p;};
// A crescent of key light along the top-left edge: the silhouette minus itself nudged 2.6px, then
// faded out toward the bottom-right. Without that second fade the crescent closes into a ring and
// the subject reads as a sticker with a white outline rather than a lit object.
function paintRim(){const c=silhouette(rim,c=>{c.fillStyle=`hsl(${stageAccent.h.toFixed(1)} 92% 80%)`;c.fillRect(0,0,728,485);});
 c.globalCompositeOperation='destination-out';c.drawImage(stageFuture,-2.6,-2.6,728,485);
 // Same axis as pearl, so the rim agrees with the highlight already painted on the frame.
 const g=c.createLinearGradient(150,90,590,410);
 g.addColorStop(0,'#0000');g.addColorStop(.5,'#0007');g.addColorStop(1,'#000');
 c.fillStyle=g;c.fillRect(0,0,728,485);}
// Foil: bands alternating between the object's hue and its complement, so the sheen shifts colour
// across the form the way a holographic card does under a tilt.
// The hue swing follows how saturated the object is. On stainless a full complementary band reads
// as chromatic aberration, not foil, so a near-neutral object gets a value-only shimmer instead.
function paintHolo(){silhouette(holo,c=>{const h=stageAccent.h,off=170*stageAccent.s,g=c.createLinearGradient(110,440,650,30);
 for(let i=0;i<=10;i++)g.addColorStop(i/10,i%2?`hsl(${(h+off)%360} 80% 62% / .5)`:`hsl(${h} 85% 60% / .22)`);
 c.fillStyle=g;c.fillRect(0,0,728,485);});}
function paintGrain(){silhouette(grain,c=>{c.fillStyle=c.createPattern(GRAIN,'repeat');c.fillRect(0,0,728,485);});}
// 對外三步：背景、疊層、卡邊。mix 同主體嘅淡入一致，所以輪廓光同燙金係跟住未來形態一齊到。
function stageBuild(target,accent){stageFuture=target;stageAccent=accent;paintStage();paintRim();paintHolo();paintGrain();}
function stageBackdrop(c){c.drawImage(stage,0,0,728,485);}
function stageOverlay(c,mix){c.save();c.globalCompositeOperation='lighter';
 c.globalAlpha=mix*.6;c.drawImage(rim,0,0,728,485);
 // Overlay, not lighter: foil shifts hue across the form without flattening its darks, which is
 // what a straight additive pass did — it washed the whole subject to one pale value.
 c.globalCompositeOperation='overlay';c.globalAlpha=mix*(.25+.6*stageAccent.s);c.drawImage(holo,0,0,728,485);
 c.globalAlpha=mix*.45;c.drawImage(grain,0,0,728,485);c.restore();}
function stageEdge(c){c.strokeStyle=`hsl(${stageAccent.h.toFixed(1)} 45% 46% / .35)`;c.lineWidth=1.2;c.stroke(CARD());}
