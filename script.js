// Replace these temporary passages with Amit's final text. The reading sequence contains 500 lines.
const passages=['אני חוזרת הביתה. מניחה את התיק ליד הדלת. מנסה למצוא מקום גם למה שאין לו צורה.','בחוץ היום ממשיך. אנשים ממהרים לעבודה, קובעים פגישות, שואלים מה שלומי. אני מחפשת את המרחק בין השאלה לתשובה.','יש ימים שבהם אני מצליחה להיות כאן. לשבת בכיתה, להקשיב, להחזיק שיחה עד סופה. ויש ימים שבהם חלק ממני נשאר במקום אחר.','אחרי השבעה באוקטובר יצאתי למילואים. בתוך הסיפור של כולנו יש גם רגעים שלי, שאני עוד לומדת לתת להם מילים.','אני רוצה לחזור לדברים הפשוטים. לשולחן, לעבודה, ללימודים. להיות עם המשפחה, להיות קרובה, בלי להיעלם באמצע.','לפעמים השקט מלא ברעש. לפעמים מילה רגילה פותחת מרחק גדול. אני אוספת את עצמי דרך פעולה קטנה ועוד אחת.','אני לא תמיד יודעת להסביר. הגוף מגיע לפני המילים. אני נשארת ליד הדלת, נושמת, מנסה להיכנס מחדש.','יש יד שנשארת לידי גם כשאין לי תשובה. יש מקום בבית, יש אור על הקיר. משהו קטן מבקש להמשיך.'];
const original=document.querySelector('#original'),reflection=document.querySelector('#reflection'),story=document.querySelector('.story'),sticky=document.querySelector('.sticky'),canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d');
const lines=Array.from({length:500},(_,i)=>passages[i%passages.length]);original.innerHTML=lines.map((t,i)=>`<p data-line="${i+1}">${i<24?t.split(' ').map(w=>`<span class="source-word">${w}</span>`).join(' '):t}</p>`).join('');reflection.innerHTML=original.innerHTML;
const sentence='אני לומדת לשאת את מה שהיה, ולפנות מקום למה שעוד יכול להיות.';
document.querySelector('#final-line').innerHTML=sentence.split(' ').map(w=>`<span class="word">${Array.from(w).map(c=>`<span class="letter">${c}</span>`).join('')}</span>`).join(' ');
let width,height,dpr,dirty=true,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=t=>{t=clamp(t);return t*t*(3-2*t)},range=(p,a,b)=>ease((p-a)/(b-a));
const rand=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const fractureFonts=[{family:'Heebo',weight:900,scale:1},{family:'Frank Ruhl Libre',weight:900,scale:1.12},{family:'Amatic SC',weight:700,scale:1.6},{family:'Rubik',weight:400,scale:1},{family:'Suez One',weight:400,scale:1.04},{family:'Secular One',weight:400,scale:1.05}];
Promise.allSettled(fractureFonts.map(f=>document.fonts.load(`${f.weight} 40px "${f.family}"`,'שגרה בית לחזור'))).then(()=>{dirty=true});
let fragments=[],sourcesDirty=true;
const sourceWords=[...document.querySelectorAll('.source-word')];
function columnPose(p,mirrored){
 const lead=range(p,0,.1),continuation=Math.max(0,p-.1);
 const travel=(lead*.8+continuation*1.1)*height;
 if(reduced)return {x:0,y:-travel*.2,angle:0};
 return {x:mirrored?lead*45+continuation*50:0,y:-travel-(mirrored?(lead*.5+continuation*.3)*height:0),angle:mirrored?-lead*5-continuation*7:0};
}
function sourcePoint(f,p){
 const pose=columnPose(p,f.mirrored),a=pose.angle*Math.PI/180,dx=f.x*width-f.cx,dy=f.y*height-f.cy;
 return {x:f.cx+pose.x+(f.mirrored?-1:1)*(Math.cos(a)*dx-Math.sin(a)*dy),y:f.cy+pose.y+Math.sin(a)*dx+Math.cos(a)*dy,angle:f.mirrored?-pose.angle:0};
}
function animateColumns(p){
 [original,reflection].forEach((col,i)=>{const pose=columnPose(p,i===1);col.style.transform=`translate(${pose.x}px,${pose.y}px) scaleX(${i?-1:1}) rotate(${pose.angle}deg)`});
}
function captureSources(){
 original.style.transform='none';reflection.style.transform='none';
 const frame=sticky.getBoundingClientRect(),baseFont=parseFloat(getComputedStyle(original).fontSize);
 const rightBox=original.getBoundingClientRect(),leftBox=reflection.getBoundingClientRect();
 fragments=sourceWords.map((el,i)=>{el.style.visibility='visible';const rect=el.getBoundingClientRect(),mirrored=reflection.contains(el),box=mirrored?leftBox:rightBox;return {el,text:el.textContent,x:(rect.left+rect.width/2-frame.left)/width,y:(rect.top+rect.height/2-frame.top)/height,cx:box.left+box.width/2-frame.left,cy:box.top+box.height/2-frame.top,r:rand(i+70),size:rand(i+90),launch:.105+rand(i+100)*.255,group:i%5,baseFont,mirrored}}).filter(f=>{const pt=sourcePoint(f,.1);return pt.y>=75&&pt.y<height*1.5});
 // Begin with shuffled words from every visible third of both columns.
 const shuffled=[...fragments].sort((a,b)=>rand(a.r*9137)-rand(b.r*9137));
 const buckets=Array.from({length:6},()=>[]);
 shuffled.forEach(f=>{const pt=sourcePoint(f,.1);if(pt.y<height-35)buckets[(f.mirrored?3:0)+Math.min(2,Math.floor(clamp(pt.y/height)*3))].push(f)});
 const ordered=[],bucketOrder=[4,0,5,2,1,3];
 for(let round=0;round<2;round++)for(const bucket of bucketOrder){const f=buckets[bucket].pop();if(f&&ordered.length<8)ordered.push(f)}
 const selected=new Set(ordered);ordered.push(...shuffled.filter(f=>!selected.has(f)));
 fragments=ordered.map((f,i)=>({...f,launch:i<8?.108+i*.012:.218+(i-8)/Math.max(1,ordered.length-9)*.145,featured:i<8}));
 sourcesDirty=false;
}
const letters=[...document.querySelectorAll('#final-line .letter')],selfLines=[...document.querySelectorAll('.self p')],worldLines=[...document.querySelectorAll('.world p')],memories=[...document.querySelectorAll('.memory span')];
const finalWords=[...document.querySelectorAll('#final-line .word')];
const arrivalOrder=finalWords.map((_,i)=>i).sort((a,b)=>rand(a+271)-rand(b+271));
const wordArrivals=finalWords.map((el,i)=>({el,rank:arrivalOrder.indexOf(i),direction:Math.floor(rand(i+141)*8),offset:rand(i+522)}));
let personal=false;
const perspectiveTrigger=document.querySelector('#perspective-trigger'),perspectiveMenu=document.querySelector('#perspective-menu');
const personalView=document.createElement('section');personalView.id='personal-view';personalView.hidden=true;
personalView.setAttribute('aria-label','אני — מסך שחור');
personalView.innerHTML='<div class="personal-stage"><span id="personal-stage-label">01 / להחזיק</span><span>המרחב שבין</span></div><span id="personal-count">001 / 500</span><a id="personal-restart" href="#" hidden>להתחיל מחדש ↗</a>';
document.body.appendChild(personalView);
function closePerspectiveMenu(){perspectiveMenu.hidden=true;perspectiveTrigger.setAttribute('aria-expanded','false')}
perspectiveTrigger.addEventListener('click',()=>{const open=perspectiveMenu.hidden;perspectiveMenu.hidden=!open;perspectiveTrigger.setAttribute('aria-expanded',String(open))});
document.querySelectorAll('[data-perspective]').forEach(button=>button.addEventListener('click',()=>{
 personal=button.dataset.perspective==='me';document.body.dataset.perspective=personal?'me':'you';personalView.hidden=!personal;
 document.querySelectorAll('[data-perspective]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 document.querySelector('main').inert=personal;
 document.documentElement.style.scrollBehavior=personal||reduced?'auto':'smooth';
 dirty=true;
}));
document.addEventListener('click',event=>{if(!event.target.closest('#perspective-menu')&&!event.target.closest('#perspective-trigger'))closePerspectiveMenu()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closePerspectiveMenu();perspectiveTrigger.focus()}});
document.querySelector('#personal-restart').addEventListener('click',event=>{event.preventDefault();scrollTo({top:0,behavior:'instant'});dirty=true});
// The pit keeps its silhouette. A separate white plane opens the field from right to left.
const opening=document.createElement('div');opening.id='opening';opening.setAttribute('aria-hidden','true');opening.innerHTML='<span>אני.</span>';sticky.appendChild(opening);
const echoes=document.createElement('canvas');echoes.id='echoes';echoes.setAttribute('aria-hidden','true');sticky.insertBefore(echoes,opening);const echoCtx=echoes.getContext('2d');
const signal=document.createElement('canvas');signal.id='signal-loss';signal.setAttribute('aria-hidden','true');sticky.insertBefore(signal,echoes);const signalCtx=signal.getContext('2d');
// Sparse, deliberately separated remnants preserve the empty black field.
const echoPositions=[[.17,.22],[.78,.3],[.39,.61],[.83,.76],[.12,.81],[.59,.15],[.53,.43],[.22,.46],[.68,.64],[.45,.84]];
const echoWords=echoPositions.map(([x,y],i)=>({text:Array.from({length:3+Math.floor(rand(i+330)*3)},(_,j)=>'אברשתמנחלכקצםףזע'[Math.floor(rand(i*31+j+400)*16)]).join(''),x,y,start:rand(i+930)*.13,size:7+rand(i+220)*6,angle:(rand(i+110)-.5)*.7}));
let baseTravel,holdTravel,extractionTravel,blankTravel,phraseTravel,emptyTravel,echoTravel,extraTravel,pauseAt;
function resize(){width=innerWidth;height=innerHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);echoes.width=width*dpr;echoes.height=height*dpr;echoCtx.setTransform(dpr,0,0,dpr,0,0);signal.width=width*dpr;signal.height=height*dpr;signalCtx.setTransform(dpr,0,0,dpr,0,0);baseTravel=17*height;holdTravel=5*height;extractionTravel=8*height;phraseTravel=6*height;emptyTravel=8*height;blankTravel=phraseTravel+emptyTravel;echoTravel=16*height;extraTravel=blankTravel+echoTravel;pauseAt=.69*baseTravel+holdTravel+extractionTravel;story.style.height=`${baseTravel+holdTravel+extractionTravel+extraTravel+height}px`;sourcesDirty=true;dirty=true}
addEventListener('resize',resize);resize();addEventListener('scroll',()=>dirty=true,{passive:true});document.fonts.ready.then(()=>{sourcesDirty=true;dirty=true});
const motionButton=document.querySelector('#motion');
function updateMotionMode(){
 document.body.dataset.motion=reduced?'reduced':'full';
 document.documentElement.style.scrollBehavior=reduced?'auto':'smooth';
 motionButton.setAttribute('aria-pressed',String(reduced));motionButton.textContent=reduced?'בקצב שלי':'להאט לרגע';
 motionButton.setAttribute('aria-label',reduced?'בקצב שלי — הפחתת אנימציות ותנועה פעילה. לחצי להחזרת תנועה מלאה':'להאט לרגע — הפחתת אנימציות ותנועה');
 motionButton.title=reduced?'תנועה מופחתת פעילה · לחצי להחזרת תנועה מלאה':'הפחתת אנימציות ותנועה';
 try{sessionStorage.setItem('amit-motion',reduced?'reduced':'full')}catch{}
 sourcesDirty=true;dirty=true;
}
try{const saved=sessionStorage.getItem('amit-motion');if(saved)reduced=saved==='reduced'}catch{}
updateMotionMode();motionButton.addEventListener('click',()=>{reduced=!reduced;updateMotionMode()});
document.querySelectorAll('[data-progress]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const target=Number(a.dataset.progress),offset=a.dataset.pause==='true'?pauseAt+blankTravel+echoTravel*.8:target*baseTravel+holdTravel*clamp(target/.1)+extractionTravel*clamp((target-.1)/.33)+(target>=.69?extraTravel:0);scrollTo({top:story.offsetTop+offset,behavior:reduced?'instant':'smooth'})}));
function drawEchoes(distance){
 echoCtx.clearRect(0,0,width,height);
 const local=(distance-pauseAt-blankTravel)/echoTravel;if(local<0||local>1)return;
 echoWords.forEach((word,i)=>{
  // Ten long isolated slots, then the same collective hold and fall.
  const soloStart=i*.068,solo=range(local,soloStart,soloStart+.009)*(1-range(local,soloStart+.049,soloStart+.065));
  const together=range(local,.7+i*.004,.735+i*.004),emerge=Math.max(solo,together);
  const settle=range(local,.78,.83),fall=clamp((local-(.855+word.start*.13))/.095),gravity=fall*fall;
  const float=1-settle,drift=reduced?0:Math.sin(local*16+i)*height*.045*float;
  const x=word.x*width+(reduced?0:Math.cos(local*13+i)*32*float),y=word.y*height+(reduced?0:(1-emerge)*height*.13+drift+gravity*height*1.25);
  echoCtx.save();echoCtx.globalAlpha=(.08+rand(i+170)*.065)*emerge*(1-range(local,.94,1));echoCtx.translate(x,y);echoCtx.rotate(reduced?0:word.angle*float+fall*(i%2?1:-1)*.65);
  const font=fractureFonts[i%fractureFonts.length];echoCtx.font=`${font.weight} ${word.size*font.scale}px "${font.family}",Arial`;echoCtx.fillStyle='#b4b1aa';echoCtx.textAlign='center';echoCtx.direction='rtl';
  if(reduced)echoCtx.globalAlpha*=1-fall;
  Array.from(word.text).forEach((letter,j)=>{echoCtx.save();echoCtx.translate((j-word.text.length/2)*word.size*.6,reduced?0:Math.sin(j*2+i)*3);echoCtx.rotate(reduced?0:(rand(i*20+j)-.5)*1.1);echoCtx.fillText(letter,0,0);echoCtx.restore()});echoCtx.restore();
 });
}
function drawFragments(p,dark){
 const sink=range(p,.49,.66),flow=range(p,.25,.52),alpha=(1-range(p,.64,.69));
 const tension=range(p,.43,.51)*(1-range(p,.55,.6));
 if(tension>0&&!reduced){
  ctx.save();ctx.globalAlpha=tension*.27;ctx.strokeStyle=dark>.45?'#c8c4ba':'#46443f';ctx.lineWidth=.7;
  for(let i=0;i<9;i++){
   const side=i%2?1:0,x=side*width,y=(i/9)*height,pull=range(p,.43,.58);
   ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+(width*.62-x)*pull*.6,y+height*.08*Math.sin(i),width*(.62+(side?1:-1)*.17*(1-pull)),height*(.59+(i-4)*.055*(1-pull)),width*.62,height*.59);ctx.stroke();
  }ctx.restore();
 }
 fragments.forEach((f,i)=>{
  const released=range(p,f.launch,f.launch+.042);f.el.style.visibility=p>f.launch?'hidden':'visible';if(!released)return;
  if(reduced){
   if(f.featured||i%12===0){const slot=f.featured?i:8+Math.floor(i/12),col=slot%3,row=Math.floor(slot/3)%9;
    ctx.save();ctx.globalAlpha=released*.78*(1-range(p,.45,.66));ctx.font=`400 ${Math.min(24,f.baseFont*1.25)}px Heebo,Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.direction='rtl';ctx.fillStyle=dark>.45?'#ddd9d0':'#171717';ctx.fillText(f.text,width*(.3+col*.2),height*(.18+row*.075));ctx.restore();
   }return;
  }
  const t=(p-f.launch)*18,sign=f.r>.5?1:-1,motion=reduced?.06:1;
  // Each word has its own launch, hold, rupture, orbit and destination.
  const rupture=range(p,.29+f.r*.13,.305+f.r*.13);
  const hold=Math.sin(t*(1+f.r*3))*Math.cos(t*.63+f.r*12);
  const centers=[[.12,.25],[.83,.7],[.68,.16],[.29,.84],[.52,.5]];
  const center=centers[f.group],orbit=t*(.4+f.r*2.8)*sign;
  const towardCenter=range(p,f.launch,f.launch+.06);
  const origin=sourcePoint(f,f.launch);
  let x=origin.x+(width*(.5+(f.r-.5)*.2)-origin.x)*towardCenter;
  const middleY=f.featured?.15+(i%8)*.085:.12+(i%17)*.046;
  let y=origin.y+(height*middleY-origin.y)*towardCenter;
  // Gather first; then fan outward to four different edges before the large type arrives.
  const scatter=range(p,.235,.345)*range(p,f.launch+.065,f.launch+.12);
  const edge=Math.floor(rand(i+602)*4),edgeAlong=.08+rand(i+733)*.84,edgeInset=.015+rand(i+811)*.12;
  const edgeX=edge===0?edgeInset:edge===1?1-edgeInset:edgeAlong;
  const edgeY=edge===2?edgeInset:edge===3?1-edgeInset:edgeAlong;
  x=x*(1-scatter)+width*edgeX*scatter;y=y*(1-scatter)+height*edgeY*scatter;
  const wander=range(p,.375,.435);
  x+=(Math.sin(t*1.7+f.r*8)*.13+rupture*(f.x-.5)*.55)*width*wander*motion;
  y+=(hold*.3+Math.cos(t*2.3+f.x*8)*.15)*height*wander*motion;
  const spiral=flow*(.3+f.r*.65)*motion*wander;
  x=x*(1-spiral)+(center[0]+Math.cos(orbit)*(.05+f.x*.2))*width*spiral;
  y=y*(1-spiral)+(center[1]+Math.sin(orbit)*(.08+f.y*.27))*height*spiral;
  const pull=range(p,.48+f.r*.045,.64+f.r*.025),bend=Math.sin(pull*Math.PI)*sign;
  x=x*(1-pull)+width*.62*pull+bend*width*.18*motion;
  y=y*(1-pull)+height*.59*pull+Math.cos(f.r*10)*height*.1*Math.sin(pull*Math.PI)*motion;
  const large=range(p,.32,.425)*released;
  const burst=i%13===0?large*(.5+f.size)*width*.15:0;
  const size=(f.baseFont+f.baseFont*(f.featured?1.1:.35)*towardCenter+f.size*25*large+burst)*(1-pull*.97);
  ctx.save();ctx.globalAlpha=alpha*(1-wander*(.1+f.r*.35));ctx.translate(x,y);
  ctx.rotate((origin.angle*Math.PI/180)*(1-towardCenter)+(reduced?0:((f.r-.5)*wander*3+Math.sin(t*1.3)*flow*2*wander+pull*sign*7)));
  const fontStep=reduced?0:Math.floor(Math.max(0,p-f.launch)* (i%7===0?24:9));
  const face=towardCenter<.75?{family:'Heebo',weight:400,scale:1}:fractureFonts[(Math.floor(f.r*fractureFonts.length)+fontStep)%fractureFonts.length];
  const mirror=f.mirrored?-1+2*range(p,f.launch+.035,f.launch+.065):1;
  ctx.scale(mirror*(1+Math.sin(t)*flow*.22*motion*wander),1);ctx.font=`${face.weight} ${size*face.scale}px "${face.family}",Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.direction='rtl';ctx.fillStyle=dark>.45?'#e9e6df':'#151513';ctx.fillText(f.text,0,0);
  if(i%9===0&&flow>.2){ctx.globalAlpha*=.18;ctx.fillText(f.text,-25*flow,12*flow)}ctx.restore();
 });
}
function drawSignalLoss(p){
 const c=signalCtx;c.clearRect(0,0,width,height);if(p<.435)return;
 const reveal=range(p,.755,.885);signal.style.opacity=reveal===1?0:1;
 const onset=range(p,.435,.475),collapse=range(p,.49,.675);
 if(reduced){c.globalAlpha=range(p,.435,.69);c.fillStyle='#000';c.fillRect(0,0,width,height);c.globalAlpha=1;return}
 c.fillStyle='#000';c.globalAlpha=onset;c.fillRect(0,0,width,height);c.globalAlpha=1;
 if(p>=.69)return;
 // The paper becomes 36 interrupted scan bands, then splits into offset blocks.
 // All stutter follows scroll position; there is no timed flashing loop.
 const count=36,bandHeight=height/count,tick=Math.floor(p*520);
 for(let i=0;i<count;i++){
  const seed=rand(i+1200),y=i*bandHeight,lag=.475+seed*.07;
  const pull=range(p,lag,.62+seed*.06),tear=range(p,.46,.55);
  const step=reduced?0:(rand(i*31+tick)-.5)*width*.15*tear*(1-pull);
  const thickness=bandHeight*(1-pull)**1.7;if(thickness<.3)continue;
  const sections=i%3===0?3:2;
  for(let j=0;j<sections;j++){
   const start=j/sections*width,baseWidth=width/sections;
   const bite=tear*(.04+rand(i*17+j)*.3)*baseWidth;
   const targetX=width*(.59+.08*Math.sin(i*2.1)),targetY=height*(.56+.06*Math.cos(i));
   const x=(start+step)*(1-pull)+targetX*pull;
   const yy=y*(1-pull)+targetY*pull;
   const w=(baseWidth-bite)*(1-pull)**1.3;
   c.save();c.translate(x,yy);c.transform(1,0,(reduced?0:Math.sin(i*3+pull*5)*.7*pull),1,0,0);
   c.beginPath();c.moveTo(0,0);c.lineTo(w,tear*seed*thickness*.4);c.lineTo(w-thickness*tear*.7,thickness);c.lineTo(thickness*tear*.6,thickness*(1-seed*tear*.3));c.closePath();c.clip();
   c.globalAlpha=onset*(1-range(p,.65,.68));c.fillStyle=i%9===0?'#bcbab3':'#f2f1ed';c.fillRect(-1,-1,w+2,thickness+2);
   if(!reduced&&pull<.9)c.drawImage(canvas,start*dpr,y*dpr,baseWidth*dpr,bandHeight*dpr,-step*.3,0,baseWidth*(1-pull),thickness);
   c.restore();
  }
 }
 c.globalAlpha=onset*(1-collapse)*.22;c.fillStyle='#aaa79e';
 for(let i=0;i<60;i++){const yy=rand(i+tick)*height;c.fillRect(rand(i*7+tick)*width,yy,width*(.02+rand(i)*.17),.5)}c.globalAlpha=1;
}
function updatePit(p){
 const reveal=range(p,.755,.885);document.querySelector('#hole').style.display='none';drawSignalLoss(p);
 const edge=105-reveal*115,bow=Math.sin(reveal*Math.PI)*5;
 const aperture=`polygon(${edge}% 0,100% 0,100% 100%,${edge}% 100%,${edge-bow*.3}% 82%,${edge-bow}% 50%,${edge-bow*.45}% 18%)`;
 opening.style.clipPath=aperture;opening.style.opacity=reveal>0?1:0;
 opening.querySelector('span').style.opacity=range(p,.77,.79)*(1-range(p,.83,.86));
 document.querySelector('#rebuild').style.clipPath=aperture;
}
function render(){if(dirty){dirty=false;
 const distance=scrollY-story.offsetTop;
 const inserted=distance<pauseAt?0:Math.min(extraTravel,distance-pauseAt),d=distance-inserted;
 const extractStart=.1*baseTravel+holdTravel,extractEnd=.43*baseTravel+holdTravel+extractionTravel;
 const p=clamp(d<extractStart?d/(baseTravel+holdTravel/.1):d<extractEnd?.1+(d-extractStart)/(baseTravel+extractionTravel/.33):(d-holdTravel-extractionTravel)/baseTravel);
 if(personal){
  const atLife=scrollY>=document.querySelector('.coexist').offsetTop;
  document.querySelector('#personal-stage-label').textContent=atLife?'05 / להמשיך לצד':p<.1?'01 / להחזיק':distance<pauseAt?'02 / לאבד אחיזה':p<.755?'03 / לשהות בשבר':'04 / לפנות מקום';
  const extent=document.documentElement.scrollHeight-height,progress=clamp(scrollY/Math.max(1,extent));
  document.querySelector('#personal-count').textContent=`${String(Math.min(500,1+Math.floor(progress*499))).padStart(3,'0')} / 500`;
  document.querySelector('#personal-restart').hidden=scrollY+height<document.querySelector('footer').offsetTop;
 }else{
 if(sourcesDirty)captureSources();
 const split=range(p,.055,.23),light=range(p,.885,.89),dark=range(p,.43,.68)*(1-light),reform=range(p,.82,.96),bg=Math.round(242*(1-dark));
 sticky.style.background=`rgb(${bg},${Math.round(bg*.996)},${Math.round(bg*.98)})`;sticky.style.color=dark>.55?'#b3b0a8':'#171717';
 animateColumns(p);
 document.querySelector('.columns').style.opacity=1-range(p,.425,.435);document.querySelector('.gridlines').style.opacity=1-range(p,.3,.435);
 ctx.clearRect(0,0,width,height);if(p>.1&&p<.7)drawFragments(p,dark);else if(p<=.1)fragments.forEach(f=>f.el.style.visibility='visible');updatePit(p);
 drawEchoes(distance);
 const blackDistance=distance-pauseAt,quiet=document.querySelector('#quiet');
 const phraseFade=range(blackDistance,phraseTravel-height*1.5,phraseTravel);
 quiet.style.opacity=blackDistance>=0?range(blackDistance,0,height*.4)*(1-phraseFade):0;
 quiet.style.transform=`translateY(${reduced?0:phraseFade*height*.12}px)`;
 // Once the phrase disappears, even the chapter furniture disappears for true emptiness.
 const furniture=1-range(blackDistance,phraseTravel-height*.5,phraseTravel);
 const restore=range(blackDistance,blankTravel,blankTravel+height*.5);
 document.querySelector('.chapter').style.opacity=blackDistance>=phraseTravel?restore:furniture;
 document.querySelector('.story-footer').style.opacity=blackDistance>=phraseTravel?restore:furniture;
 const inEmpty=blackDistance>=phraseTravel&&blackDistance<blankTravel;
 document.querySelector('nav').style.opacity=inEmpty?'0':'1';
 document.querySelector('#progress').style.opacity=inEmpty?'0':'1';
 document.querySelector('#rebuild').style.opacity=range(p,.8,.84);
 // Whole words enter in shuffled order; their final reading order stays intact.
 letters.forEach(el=>{el.style.transform='none';el.style.opacity=1});
 wordArrivals.forEach(({el,rank,direction,offset})=>{
  const start=.86+rank*.004,t=range(p,start,start+.014),remaining=1-t;
  const vectors=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]],vector=vectors[direction];
  const dx=vector[0]*width*(1.05+offset*.35),dy=vector[1]*height*(1.05+offset*.35);
  el.style.transform=reduced?'none':`translate(${dx*remaining}px,${dy*remaining}px) rotate(${(offset-.5)*32*remaining}deg)`;
  el.style.opacity=reduced?t:range(t,0,.25);
 });
 document.querySelector('.after').style.opacity=range(p,.95,.99);
 document.querySelector('#stage').textContent=p<.1?'01 / להחזיק':distance<pauseAt?'02 / לאבד אחיזה':p<.755?'03 / לשהות בשבר':'04 / לפנות מקום';
 document.querySelector('#hint').textContent=p<.1?'הסדר הוא דרך להחזיק.':p<.43?'המילים עוזבות. נשארים חללים.':p<.66?'מה שבפנים חוצה את הקווים.':p<.8?'':'יש מקום גם למה שנשאר.';
 document.querySelector('#counter').textContent=`${String(Math.min(500,Math.floor(p*500)+1)).padStart(3,'0')} / 500`;
 document.querySelector('#progress').style.width=`${clamp(scrollY/(document.documentElement.scrollHeight-height))*100}%`;
 const life=document.querySelector('.coexist'),q=clamp((scrollY-life.offsetTop)/(life.offsetHeight-height)),settle=range(q,.58,.95),fade=range(q,.62,.93);
 const active=scrollY+height>life.offsetTop;
 document.querySelector('.life-axis').style.transform=`rotate(${reduced?0:Math.sin(q*9)*1.2*(1-settle)}deg)`;
 selfLines.forEach((el,i)=>{const pulse=reduced?0:Math.sin(q*(11+i*2)+i)*(.3+rand(i))*(1-settle*.7);el.style.transform=`translate(${pulse*23}px,${pulse*12-i*q*2}px) rotate(${pulse*5}deg)`;el.style.opacity=active?range(q,i*.035,.14+i*.035):0});
 worldLines.forEach((el,i)=>{el.style.transform=`translateY(${-q*height*.12}px)`;el.style.opacity=1-fade*.55});
 document.querySelector('.self').style.opacity=1-fade*.5;
 memories.forEach((el,i)=>{el.style.left=`${15+rand(i+31)*60}%`;el.style.top=`${i*19}%`;el.style.transform=`translate(${reduced?0:Math.sin(q*12+i)*30}px,${reduced?0:-q*height*.2}px) rotate(${reduced?0:(rand(i)-.5)*55*(1-settle*.5)}deg)`;el.style.opacity=(.1+Math.sin(q*8+i)**2*.13)*(1-settle*.65)});
 document.querySelector('.life-bridge').style.opacity=range(q,.72,.96);
 }}requestAnimationFrame(render)}requestAnimationFrame(render);
