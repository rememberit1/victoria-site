const {chromium}=require('/workspace/petra-3d-site-tools/node_modules/playwright');
const fs=require('fs');
(async()=>{
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1280,height:720}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto('http://127.0.0.1:8811/?capture=1',{waitUntil:'networkidle'});await p.waitForTimeout(1500);
 await p.evaluate(()=>document.fonts.ready);
 await p.evaluate(()=>window.renderAt(0,0,null));
 const T=await p.evaluate(()=>window.sectionTops());
 const dh=await p.evaluate(()=>document.getElementById('debt').offsetHeight);
 console.log(T,dh);
 const debtY=T.debt+Math.max(0,(dh-720)/2);
 const K=[[0,0],[5.5,0],[7.3,T.story],[10.8,T.story+40],[12.6,T.gallery],[15.8,T.gallery+30],[17.6,T.reviews],[20.6,T.reviews+30],[22.4,debtY],[27.6,debtY],[29.3,T.max],[30,T.max]];
 const ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
 const scrollAt=t=>{for(let i=0;i<K.length-1;i++){const[a,ya]=K[i],[c,yc]=K[i+1];if(t<=c){return ya+(yc-ya)*ease((t-a)/(c-a));}}return T.max;};
 fs.rmSync('/tmp/vframes',{recursive:true,force:true});fs.mkdirSync('/tmp/vframes');
 let cur=null, btn=[640,500];
 const N=900, s0=Date.now();
 for(let f=0;f<N;f++){
   const t=f/30;
   if(t>=22.8&&t<27.4){ if(!cur) cur=[1180,690]; const k=0.09; cur=[cur[0]+(btn[0]-cur[0])*k, cur[1]+(btn[1]-cur[1])*k]; }
   else if(t>=27.4&&cur){ cur=[cur[0]+(1200-cur[0])*0.12, cur[1]+(700-cur[1])*0.12]; if(t>28) cur=null; }
   btn=await p.evaluate(([t,y,c])=>window.renderAt(t,y,c),[t,Math.round(scrollAt(t)),cur]);
   await p.screenshot({path:`/tmp/vframes/f${String(f).padStart(4,'0')}.jpg`,type:'jpeg',quality:92});
   if(f%60===0) console.log('frame',f,((Date.now()-s0)/1000).toFixed(0)+'s');
 }
 console.log('ERRORS',JSON.stringify(errs));await b.close();
})();
