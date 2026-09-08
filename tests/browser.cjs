const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('fs');
const http=require('http'),path=require('path');
process.chdir(path.resolve(__dirname,'..'));
const server=http.createServer((req,res)=>{
 let p;try{p=path.resolve(process.cwd(),'.'+decodeURIComponent(req.url.split('?')[0]));}catch{res.writeHead(400);res.end();return;}
 if(!p.startsWith(process.cwd()+path.sep)){res.writeHead(403);res.end();return;}
 fs.readFile(p,(e,b)=>{if(e){res.writeHead(404);res.end();return;}
  const types={'.js':'application/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.png':'image/png'};
  res.setHeader('Content-Type',types[path.extname(p)]||'image/jpeg');res.end(b);
 });
});
(async()=>{
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const BASE='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1280,height:1000},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const assert=require('assert/strict');
const results=[];
await page.goto(BASE+'/studies.html?lab=1&test=1');
await page.waitForFunction(()=>document.querySelector('#lab-status').textContent.includes('比較完成'));
const labChecks=await page.locator('#lab-checks').innerText();assert(!labChecks.includes('FAIL'));assert.equal((labChecks.match(/PASS/g)||[]).length,12);results.push({labPassed:12});
const png=()=>page.locator('#lab-view-2').evaluate(c=>c.toDataURL());
const before=await png();
await page.locator('#lab-enclosed').check();await page.locator('#lab-apply').click();
const after=await png();assert.notEqual(before,after);
const count=await page.locator('#lab-info-2').innerText();results.push({autoAbacus:count});
await page.screenshot({path:'previews/input-tests/lab-auto-abacus.png',fullPage:true});
// Closed white gaps removed, wood and coloured beads remain.
const alpha=await page.locator('#lab-view-2').evaluate(c=>{const d=c.getContext('2d');return [[350,48],[100,200],[200,82]].map(([x,y])=>d.getImageData(x,y,1,1).data[3]);});
assert.equal(alpha[0],0);assert.equal(alpha[1],255);assert.equal(alpha[2],255);
await page.locator('#lab-undo').click();assert.equal(await png(),before);assert.equal(await page.locator('#lab-enclosed').isChecked(),false);
await page.locator('#lab-enclosed').check();await page.locator('#lab-apply').click();
await page.locator('#lab-reset').click();assert.equal(await png(),before);
await page.locator('#lab-undo').click();assert.equal(await png(),after);
await page.locator('#lab-bg').selectOption('checker');
const [cutout]=await Promise.all([page.waitForEvent('download'),page.locator('#lab-export').click()]);
const cutoutPath='previews/input-tests/'+cutout.suggestedFilename();await cutout.saveAs(cutoutPath);
assert.equal(fs.readFileSync(cutoutPath).subarray(0,8).toString('hex'),'89504e470d0a1a0a');
const [mask]=await Promise.all([page.waitForEvent('download'),page.locator('#lab-mask').click()]);
const maskPath='previews/input-tests/'+mask.suggestedFilename();await mask.saveAs(maskPath);
const verify=await page.evaluate(async()=>{const im=new Image();im.src='previews/input-tests/toy-mask.png';await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,c.width,c.height).data;let opaque=true,gray=true;for(let i=0;i<d.length;i+=4){opaque&&=d[i+3]===255;gray&&=d[i]===d[i+1]&&d[i]===d[i+2];}return{opaque,gray,width:im.width,height:im.height};});
assert(verify.opaque&&verify.gray);results.push({exports:verify});
await page.locator('#lab-file').setInputFiles(process.cwd()+'/'+cutoutPath);await page.waitForFunction(()=>document.querySelector('#lab-status').textContent.includes('來源透明遮罩'));
assert.equal(await png(),after);assert(await page.locator('#lab-undo').isDisabled());results.push({exportReimportExact:true});
// Invalid inputs do not mutate pixels or create history.
await page.locator('details').evaluate(d=>d.open=true);
await page.locator('#lab-x').fill('');await page.locator('#lab-erase').click();assert.equal(await png(),after);assert(await page.locator('#lab-undo').isDisabled());
await page.locator('#lab-file').setInputFiles({name:'bad.jpg',mimeType:'image/jpeg',buffer:Buffer.from('bad')});await page.waitForFunction(()=>document.querySelector('#lab-status').classList.contains('error'));assert(await page.locator('#lab-export').isDisabled());
for(const sample of ['starwberry.jpeg','water.jpg','banana.jpeg']){
 await page.locator('#lab-sample').selectOption(sample);await page.waitForFunction(()=>document.querySelector('#lab-status').textContent.includes('比較完成'));
 const initial=await png();await page.locator('#lab-enclosed').check();await page.locator('#lab-apply').click();
 results.push({sample,auto:await page.locator('#lab-info-2').innerText()});
 await page.screenshot({path:'previews/input-tests/auto-'+sample.split('.')[0]+'.png',fullPage:true});
 await page.locator('#lab-undo').click();assert.equal(await png(),initial);
}
await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
await page.screenshot({path:'previews/input-tests/lab-complete-mobile.png',fullPage:true});
// Single-turn rapid selection: the last input owns the displayed result.
await page.locator('#lab-sample').evaluate(s=>{for(const value of ['toy.jpeg','water.jpg','banana.jpeg']){s.value=value;s.dispatchEvent(new Event('change'));}});
await page.waitForFunction(()=>document.querySelector('#lab-status').textContent.startsWith('banana.jpeg · 比較完成'));
assert.equal(await page.locator('#lab-view-2').evaluate(c=>c.width),620);
results.push({rapidSelection:true,mobileNoOverflow:true,invalidInput:true});
// Unsupported masks stay editable; supported prepared masks reach the existing renderer.
await page.locator('#lab-evolve').click();await page.waitForFunction(()=>document.querySelector('#lab-status').classList.contains('error'));assert(await page.locator('#lab-evolution').isHidden());assert(!(await page.locator('#lab-export').isDisabled()));
for(const [sample,recipe,title] of [['bottle','bottle','一口茶'],['bottle-b','flask','水，']]){
 await page.locator('#lab-sample').selectOption(sample);await page.waitForFunction(()=>document.querySelector('#lab-status').textContent.includes('比較完成'));
 await page.locator('#lab-recipe').selectOption(recipe);await page.locator('#lab-evolve').click();
 await page.waitForFunction(()=>!document.querySelector('#lab-evolution').hidden);
 assert((await page.locator('#title').innerText()).includes(title));
 assert.equal(await page.locator('#view').evaluate(c=>c.width),1456);
 await page.locator('#evolution').fill('0');await page.locator('#evolution').dispatchEvent('input');assert.equal(await page.locator('#phase').innerText(),'原始物件');
 await page.locator('#replay').click();
 await page.screenshot({path:'previews/input-tests/bridge-'+sample+'.png',fullPage:true});
 await page.locator('#lab-reset').click();assert(await page.locator('#lab-evolution').isHidden());
}
results.push({preparedMaskEvolution:true,rejectRetainsEditor:true,editsHideStalePreview:true});
for(const object of ['bottle','bottle-b','cup','banana','suica']){
 await page.goto(BASE+'/studies.html?object='+object+'&test=1');await page.waitForFunction(()=>document.querySelector('#checks').textContent.length>0);const checks=await page.locator('#checks').innerText();assert(!checks.includes('FAIL'));results.push({baseline:object,checks});
}
// The demo promise: any photo that segments produces an evolution. These three are outside every
// authored class and must land on the generic recipe rather than on a rejection or a wrong class.
await page.goto(BASE+'/studies.html?object=banana');
await page.waitForFunction(()=>!document.querySelector('#replay').disabled);
const generic={};
for(const f of ['toy.jpeg','starwberry.jpeg','water.jpg']){
 await page.locator('#file').setInputFiles('assets/segmentation/'+f);
 await page.waitForFunction(()=>document.querySelector('#phase').textContent.includes('完成'));
 generic[f]=await page.evaluate(()=>recipe);assert.equal(generic[f],'generic');
 const alive=await page.evaluate(()=>{const d=future.getContext('2d').getImageData(0,0,1456,970).data;
  let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>180)n++;return n;});
 assert(alive>40000);
}
await page.screenshot({path:'previews/input-tests/generic-water.png',fullPage:true});
results.push({genericFallback:generic});

// A photo whose background cannot be removed is still refused, and the refusal points at the lab,
// which is where a mask gets fixed by hand. Built here rather than committed as a fixture.
const noisy=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=c.height=420;
 const g=c.getContext('2d');
 for(let i=0;i<900;i++){g.fillStyle=`hsl(${(i*37)%360} 70% ${25+(i*13)%50}%)`;
  g.fillRect((i*97)%420,(i*61)%420,18+(i%29),14+(i%23));}
 return c.toDataURL();});
await page.locator('#file').setInputFiles({name:'noisy.png',mimeType:'image/png',buffer:Buffer.from(noisy.split(',')[1],'base64')});
await page.waitForFunction(()=>document.querySelector('#phase').classList.contains('error'));
const refusal=await page.locator('#phase').innerText();
assert(await page.locator('#loadhint a[href*="lab=1"]').count()===1);
results.push({busyBackgroundRefused:refusal});

// Each recipe has its own supported proportions: picking the wrong one must be rejected with
// the reason and the recipe that does fit, not drawn as if it were that class.
await page.goto(BASE+'/studies.html?object=cup');
await page.waitForFunction(()=>!document.querySelector('#replay').disabled);
await page.locator('.rbtn[data-r=bottle]').click();
await page.waitForFunction(()=>document.querySelector('#phase').classList.contains('error'));
const mismatch=await page.locator('#phase').innerText();
assert(mismatch.includes('闊高比')&&mismatch.includes('闊身容器'));
await page.locator('.rbtn[data-r=cup]').click();
await page.waitForFunction(()=>!document.querySelector('#phase').classList.contains('error'));
await page.screenshot({path:'previews/input-tests/cup-recipe-mismatch.png',fullPage:true});
results.push({cupRecipeMismatch:mismatch,recoveredByReselecting:true});
await page.setViewportSize({width:390,height:844});
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
await page.setViewportSize({width:1280,height:1000});
for(const [file,src,quad,w,h] of [
 ['phone.html','assets/phone-source.jpg',[[421,65],[662,108],[329,408],[61,329]],728,485],
 ['studies.html?object=suica','assets/suica-source.jpg',[[155,190],[1093,190],[1093,778],[155,778]],1280,961]
]){
 await page.goto(BASE+'/'+file+(file.includes('?')?'&':'?')+'test=1');await page.waitForFunction(()=>document.querySelector('#checks').textContent.includes('PASS'));
 assert(!(await page.locator('#checks').innerText()).includes('FAIL'));
 const fixture=await page.evaluate(async({src,quad,w,h})=>{
  const img=new Image();img.src=src;await img.decode();
  const c=document.createElement('canvas');c.width=w+160;c.height=h+100;const g=c.getContext('2d');g.fillStyle='#aaa';g.fillRect(0,0,c.width,c.height);g.drawImage(img,80,50);
  const original=warpPhoto(img,quad,quad,w,h),shifted=new Image();shifted.src=c.toDataURL();await shifted.decode();
  const shiftedQuad=quad.map(([x,y])=>[x+80,y+50]),recovered=warpPhoto(shifted,shiftedQuad,quad,w,h);
  const a=original.getContext('2d').getImageData(0,0,w,h).data,b=recovered.getContext('2d').getImageData(0,0,w,h).data;let max=0;for(let i=0;i<a.length;i++)max=Math.max(max,Math.abs(a[i]-b[i]));
  const map=project(quad),uv=[.23,.67],back=map.inverse(...map(...uv));
  return{png:c.toDataURL(),quad:shiftedQuad,scale:Math.min(1,1200/Math.max(c.width,c.height)),max,roundtrip:Math.hypot(back[0]-uv[0],back[1]-uv[1]),rejectCrossed:!validQuad([quad[0],quad[2],quad[1],quad[3]],w,h)};
 },{src,quad,w,h});
 assert(fixture.max<=1);assert(fixture.roundtrip<1e-9);assert(fixture.rejectCrossed);
 await page.locator('.calibration').evaluate(p=>p.open=true);
 await page.locator('.cal-file').setInputFiles({name:'reframed.png',mimeType:'image/png',buffer:Buffer.from(fixture.png.split(',')[1],'base64')});
 await page.waitForFunction(()=>!document.querySelector('.cal-view').hidden);
 await page.locator('.cal-auto').click();
 if(file.includes('suica'))assert(!(await page.locator('.cal-apply').isDisabled()));
 for(let i=0;i<4;i++)for(let axis=0;axis<2;axis++)await page.locator(`[data-point="${i}"][data-axis="${axis}"]`).fill(String(fixture.quad[i][axis]*fixture.scale));
 assert(!(await page.locator('.cal-apply').isDisabled()));await page.locator('.cal-apply').click();
 await page.waitForFunction(()=>document.querySelector('.cal-status').textContent.includes('已套用'));
 assert(!(await page.locator('#replay').isDisabled()));
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:'previews/input-tests/calibrated-'+(file.startsWith('phone')?'phone':'card')+'.png',fullPage:true});
 await page.locator('.cal-restore').click();await page.waitForFunction(()=>!document.querySelector('#checks').hidden);
 assert(!(await page.locator('#checks').innerText()).includes('FAIL'));
 results.push({file,translationInvariant:fixture.max,projectiveRoundtrip:fixture.roundtrip,calibrationApplied:true,restorePass:true,mobileNoOverflow:true});
 await page.setViewportSize({width:1280,height:1000});
}
const curved=await page.evaluate(async()=>{const img=new Image();img.src='assets/segmentation/banana.jpeg';await img.decode();try{suggestCorners(img);return false;}catch{return true;}});assert(curved);results.push({curvedProposalRejected:true});
assert.equal(errors.length,0);

await page.goto(BASE+'/index.html?test=1');const legacy=await page.locator('pre').innerText();assert(!legacy.includes('FAIL'));results.push({legacyPassed:(legacy.match(/PASS/g)||[]).length});
fs.writeFileSync('previews/input-tests/workflow-results.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results,errors},null,2));await browser.close();server.close();
})().catch(e=>{console.error(e);process.exit(1);});
