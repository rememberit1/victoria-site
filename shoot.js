const {chromium}=require('/workspace/petra-3d-site-tools/node_modules/playwright');
(async()=>{
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const errs=[];
 const p=await b.newPage({viewport:{width:1440,height:900}});
 p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.type()+': '+m.text())});p.on('pageerror',e=>errs.push('pageerror: '+e.message));
 p.on('requestfailed',r=>errs.push('reqfail: '+r.url()));
 await p.goto('http://127.0.0.1:8811/',{waitUntil:'networkidle'});await p.waitForTimeout(3500);
 await p.screenshot({path:'/workspace/victoria-site/shots/01-hero.png'});
 let i=2;
 for(const id of ['story','gallery','reviews','debt','notify']){
   await p.evaluate(id=>{const el=document.getElementById(id);scrollTo(0,el.offsetTop-(id==='notify'?0:20))},id);
   await p.waitForTimeout(2600);
   if(id==='debt'){await p.mouse.move(720,700);await p.waitForTimeout(300);await p.mouse.move(740,690);await p.waitForTimeout(500);}
   await p.screenshot({path:`/workspace/victoria-site/shots/0${i++}-${id}.png`});
 }
 await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await p.waitForTimeout(1500);
 await p.click('#notifyBtn',{force:true});await p.waitForTimeout(800);
 await p.screenshot({path:'/workspace/victoria-site/shots/07-notify-footer.png'});
 console.log('ERRORS',JSON.stringify(errs));await b.close();})();
