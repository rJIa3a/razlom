(function(){
 'use strict';
 const S=window.SCENE={},L=LIB,M=L.M,W=SIM.VIEW.W,H=SIM.VIEW.H,TAU=Math.PI*2;
 S.NEAREST=true;S.REPEAT=[];
 S.programs=()=>{L.init(W,H,null,{pixel:1});L.SUN=[350,180];};
 const c={paper:[.93,.91,.84],ink:[.035,.025,.085],yellow:[1,.9,.1],purple:[.36,.12,.57]};
 const lerp=(a,b,t)=>a+(b-a)*t,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function label(id,text,x,y,size,col='#eee9d7',extra={}){return L.label(id,text,x,y,Object.assign({size,col,out:'#101020',font:'"Arial Black", "Arial", sans-serif',weight:900},extra));}
 function box(id,x,y,w,h,col,pad=8){L.solid(x,y,w,h,col);L.uiBox(id,x,y,w,h,pad);}
 function ik(a,b,l1,l2,side){const dx=b[0]-a[0],dy=b[1]-a[1],d=clamp(Math.hypot(dx,dy),1,l1+l2-.05),ang=Math.atan2(dy,dx),q=Math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1));return [a[0]+Math.cos(ang+side*q)*l1,a[1]+Math.sin(ang+side*q)*l1];}
 function bone(tex,a,b,width,face,u){if(!ASSETS[tex])return;const d=Math.hypot(b[0]-a[0],b[1]-a[1]),rot=Math.atan2(-(b[0]-a[0]),b[1]-a[1]);L.sprite(tex,0,0,{m:M.of(M.t(...a),M.r(rot)),w:width,h:d+width*.35,pivot:[width*.5,width*.17],flip:face<0,u});}
 function foot(g,phase,amount,x,y,face){let q=((g/TAU+phase)%1+1)%1;let dx,dy=0;if(q<.6)dx=43.2-q*144;else{const k=(q-.6)/.4;dx=lerp(-43.2,43.2,k);dy=-27*Math.sin(k*Math.PI);}return [x+face*lerp(phase?18:-18,dx,amount),y+dy*amount];}
 function actor(a,who,cam,tr=null,clock=0,ground=SIM.FLOOR){
   const face=a.face||1,x=a.x-cam,y=a.y,enemy=who==='mutant',id=enemy?a.id:'hero',death=clamp((a.dead||0)/.7,0,1),fade=1-death;
   if(fade<=0)return;
   const hurt=a.hurt>0,u={alpha:fade*(hurt&&Math.floor(clock*26)%2?.6:1)},far={alpha:u.alpha,tint:[.43,.38,.62,.35]},move=a.move||0,g=a.gait||0;
   const bob=move*2.5*Math.cos(g*2),hips=[x,y-98+death*66+bob],shoulder=[x-face*22,hips[1]-49],air=y<ground-2;
   let nearFoot=foot(g,0,move,x,y,face),farFoot=foot(g,.5,move,x,y,face);
   if(air){const k=tr?Math.min(clamp(tr.t/.3,0,1),clamp((1.9-tr.t)/.3,0,1)):1,w=k*k*(3-2*k);nearFoot=[lerp(nearFoot[0],x+face*26,w),lerp(nearFoot[1],y-12,w)];farFoot=[lerp(farFoot[0],x-face*29,w),lerp(farFoot[1],y-26,w)];}
   const at=a.attack||0,progress=enemy?1-at/.48:1-at/.36,strike=at>0?(enemy?(progress<.5?-.25*Math.sin(progress*2*Math.PI):Math.sin((progress-.5)*2*Math.PI)):Math.sin(clamp(progress/.94,0,1)*Math.PI)):0;
   let nearHand=[shoulder[0]+face*28-(nearFoot[0]-x)*.45*move,shoulder[1]+51],farHand=[shoulder[0]-face*18-(farFoot[0]-x)*.45*move,shoulder[1]+53];
   if(at>0){nearHand=[shoulder[0]+face*(28+strike*66),shoulder[1]+34-strike*24];farHand=[shoulder[0]+face*24,shoulder[1]+24];}
   if(air&&!tr){nearHand=[shoulder[0]+face*45,shoulder[1]-29];farHand=[shoulder[0]-face*25,shoulder[1]+18];}
   if(tr){const p=SIM.transitionPose(tr),k=clamp((1.9-tr.t)/.3,0,1),end=k*k*(3-2*k),free=[lerp(nearHand[0],shoulder[0]+face*55,end),lerp(nearHand[1],shoulder[1]-42,end)],grip=[tr.grip[0]-cam,tr.grip[1]];let w=p.phase<.26?clamp(p.phase/.26,0,1):p.phase<.83?1:1-clamp((p.phase-.83)/.14,0,1);w=w*w*(3-2*w);nearHand=[lerp(free[0],grip[0],w),lerp(free[1],grip[1],w)];farHand=[lerp(farHand[0],shoulder[0]-face*42,end),lerp(farHand[1],shoulder[1]-21,end)];}
   if(!enemy&&at>0&&a.attackKind===2){nearFoot=[x+face*(30+strike*85),y-35-strike*64];}
   const nearKnee=ik(hips,nearFoot,56,56,-face),farKnee=ik(hips,farFoot,56,56,-face);
   const nearElbow=ik(shoulder,nearHand,55,56,face),farElbow=ik(shoulder,farHand,55,56,-face);
   const leg=(k,f,un)=>{bone(who+'_thigh',hips,k,enemy?34:28,face,un);bone(who+'_shin',k,f,enemy?37:32,face,un);};
   const arm=(e,h,un)=>{bone(who+'_upper',shoulder,e,enemy?28:24,face,un);bone(who+'_fore',e,h,enemy?27:24,face,un);};
   L.shadow(x,ground+3,43,9,.42*fade);leg(farKnee,farFoot,far);arm(farElbow,farHand,far);leg(nearKnee,nearFoot,u);
   if(ASSETS[who+'_body'])L.sprite(who+'_body',x-39,y-202+death*66+bob,{w:78,h:113,flip:face<0,u});
   arm(nearElbow,nearHand,u);
   for(const [name,p] of Object.entries({ground:[x,y],top:[x,y-202+bob],hip:hips,hipL:hips,hipR:hips,head:[x,y-181+bob],shoulder,shL:shoulder,shR:shoulder,elbowL:farElbow,elbowR:nearElbow,handL:farHand,handR:nearHand,kneeL:farKnee,kneeR:nearKnee,ankleL:farFoot,ankleR:nearFoot,heelL:farFoot,heelR:nearFoot,groundL:[farFoot[0],y],groundR:[nearFoot[0],y],footL:farFoot,footR:nearFoot,grip:nearHand,tip:nearHand}))L.joint(id,name,p);
   if(tr&&SIM.transitionPose(tr).grip)L.anchor('frame-grip',[tr.grip[0]-cam,tr.grip[1]],nearHand,1);
   if(enemy&&a.hp>0&&a.hp<a.maxhp){L.solid(x-34,y-222,68,5,[.05,.025,.12]);L.solid(x-32,y-221,64*a.hp/a.maxhp,3,[.64,.93,.2]);}
 }
 function barrel(b,cam,t,ground){if(b.hp<=0)return;const x=b.x-cam;L.shadow(x,ground+5,35,8,.45);if(ASSETS.barrel)L.sprite('barrel',x-32,ground-85,{w:64,h:87,u:{tint:b.hp===1?[1,.5,.3,.2]:[1,1,1,0]}});}
 function effects(ST,cam){for(const e of ST.ev){const age=ST.t-e.t;if(age<0||age>.7)continue;const x=e.x-cam,y=e.y;
   if(['hit','kill','break','hurt'].includes(e.k)){
    const q=age/.7,col=e.k==='hurt'?[1,.15,.3]:[1,.78,.12];
    for(let j=0;j<12;j++){const a=j*2.399+(e.t%1)*3,r=(10+age*(110+j*5)),px=x+Math.cos(a)*r,py=y+Math.sin(a)*r+age*age*230;L.solid(px,py,5-j%3,9-j%4,col,a,2,3);}
    L.star(x,y,45*(1-q),col,.65*(1-q));
    const first=ST.ev.find(other=>other.k===e.k&&Math.abs(other.t-e.t)<.001&&Math.abs(other.x-e.x)<140);
    if(age<.33&&first===e){const word=e.k==='break'?'ХРУСТ!':e.k==='hurt'?'АХ!':e.kind===2?'БАХ!':'БАМ!';label('impact'+e.t,word,x,y-40-age*65,35*(1+age*.6),'#ffe935',{al:.5,a:1-age/.33});}
   }
   if(['land','jump'].includes(e.k)){for(let j=0;j<6;j++)L.puff(x+(j-2.5)*age*60,y-6-age*18,6+age*18,[.7,.58,.75],.27*(1-age/.7),j);}
   if(e.k==='heal'&&age<.65)label('heal'+e.t,'+24',x,y-age*50,26,'#bdff74',{al:.5,a:1-age/.65});
 }}
 S.render=t=>{
   const ST=S.state||SIM.at(t),GT=ST.t;let shake=0;for(const e of ST.ev){const age=GT-e.t;if(age<.17&&age>=0&&['hit','hurt','break'].includes(e.k))shake+=4*(1-age/.17)*Math.sin(age*105);}
   const cam=ST.cam+shake;L.beginBG();L.solid(0,0,W,H,c.paper);
   // Comic paper margins and black frames live outside every painted environment.
   for(let n=0;n<3;n++){const x=100+n*SIM.STRIDE-cam;if(x>W||x+1240<0)continue;
    L.solid(x-6,142,1252,670,c.ink);const bg=SIM.PANELS[n].bg;
    if(ASSETS[bg])L.sprite(bg,x,148,{w:1240,h:658});else if(ASSETS.bg_rooftop)L.sprite('bg_rooftop',x,148,{w:1240,h:658,u:{tint:n===1?[.2,1,.75,.7]:[.6,1,.3,.5]}});
   }
   L.beginComp();
   const activeX=100+ST.panel*SIM.STRIDE-cam;
   if(!ST.transition){
    if(ST.panel===0){for(let j=0;j<14;j++){const x=activeX+((j*137+GT*(12+j%3))%1240),y=180+(j*47)%330;L.star(x,y,1.2,[.95,.62,.26],.25+.2*Math.sin(GT+j));}}
    if(ST.panel===1&&!ST.hideFX){for(let j=0;j<14;j++){const x=activeX+70+(j*83)%1140,y=230+((GT*160+j*71)%420);L.solid(x,y,2,7,[.25,.8,.9]);}}
    ST.barrels.forEach(b=>barrel(b,cam,GT,SIM.groundY(ST.panel)));
    ST.heal.filter(h=>!h.taken).forEach(h=>{const x=h.x-cam;L.glow(x,h.y,29,[.4,1,.3],.15,3);L.solid(x-8,h.y-10,16,20,[.8,.94,.75]);L.solid(x-5,h.y-3,10,5,[.7,.12,.2]);L.solid(x-2,h.y-6,4,11,[.7,.12,.2]);});
    ST.enemies.forEach(e=>actor(e,'mutant',cam,null,GT,SIM.groundY(ST.panel)));
   }
   actor(ST,'hero',cam,ST.transition,GT,SIM.groundY(ST.panel));effects(ST,cam);
   if(ST.clearAt&&!ST.transition){const x=ST.panel*SIM.STRIDE+1264-cam;L.solid(x-22,491,38,69,c.yellow);L.solid(x-12,546,18,26,c.yellow,Math.PI/4);}
   L.finish(t,{bloom:[.035,.025],vignette:0,warm:0,roll:0,dither:0});
   // All static HUD text shares a fixed page grid.
   box('masthead',100,29,510,88,c.ink,16);label('title','РАЗЛОМ',118,67,48,'#f2e9d3');label('subtitle','НОЧЬ МУТАНТОВ  /  ВЫПУСК 01',120,99,13,'#dccbab');
   box('health',630,33,340,79,c.ink,14);label('life','ЖИЗНЬ',646,52,13,'#d8cae5');label('hp',Math.ceil(ST.hp)+'%',950,52,13,'#f5e4d0',{al:1});L.solid(646,74,307,18,[.23,.16,.29]);L.solid(648,76,303*ST.hp/100,14,ST.hp<30?[.96,.22,.32]:[.79,.92,.3]);
   box('score',992,33,184,79,c.ink,14);label('scoretitle','СЧЁТ',1008,52,13,'#d8cae5');label('scorevalue',String(ST.score).padStart(6,'0'),1008,85,26,'#ffde77');
   box('page',1198,33,142,79,c.ink,12);label('pagetitle','ПАНЕЛЬ',1213,53,12,'#d8cae5');label('pagevalue',`${ST.panel+1} / 3`,1213,85,26,'#f3e8d7');
   if(!ST.transition){const txt=SIM.PANELS[ST.panel].caption,w=L.labelW('captionmeasure',txt,{size:18,weight:900,font:'"Arial Black", "Arial", sans-serif'})+40;box('caption',122,166,w,38,c.yellow,12);label('captiontext',txt,138,185,18,'#151123',{out:'transparent'});}
   box('controls',100,830,1240,41,c.ink,14);label('controls','A D / ← →   ДВИЖЕНИЕ       ПРОБЕЛ   ПРЫЖОК       X / J   УДАР       P   ПАУЗА       R   ЗАНОВО',720,851,16,'#e9dec9',{al:.5});
   if(!S.state){box('demo',523,744,394,45,c.yellow,12);label('demotext','НАЖМИ ENTER, ЧТОБЫ ИГРАТЬ',720,766,18,'#101020',{al:.5,out:'transparent'});}
   if(ST.clearAt&&!ST.transition&&!ST.won){box('exit',700,219,600,45,c.ink,16);label('exittext',ST.panel===2?'К ПРАВОМУ КРАЮ → ПРОБЕЛ: ФИНАЛ':'К ПРАВОМУ КРАЮ → ПРОБЕЛ: ЗА РАМКУ!',1000,242,18,'#ffed49',{al:.5});}
   if(ST.transition){box('vaultcaption',500,120,440,40,c.yellow,10);label('vaulttext','МЕЖДУ СТРАНИЦАМИ...',720,141,18,'#151123',{al:.5,out:'transparent'});}
   if(ST.won||ST.gameover){box('end',430,299,580,238,c.ink,24);label('endtitle',ST.won?'ПРОДОЛЖЕНИЕ СЛЕДУЕТ':'СТРАНИЦА ОБОРВАЛАСЬ',720,363,30,ST.won?'#ffed49':'#ff7186',{al:.5});label('endbody',ST.won?'Первый выпуск пройден.':'Попробуй ещё раз.',720,422,23,'#e9dec9',{al:.5});label('endrestart','R — НАЧАТЬ ЗАНОВО',720,482,18,'#d0baeb',{al:.5});}
   if(window.AUDIO)AUDIO.update(ST,S.state!==null);
 };
 S.QA=()=>{
  const base=SIM.create(),copy=s=>JSON.parse(JSON.stringify(s));base.t=2;
  const match=copy(base),low=copy(base);low.hp=1;low.score=999999;
  const clear=copy(base);clear.enemies.forEach(e=>e.hp=0);clear.clearAt=1;
  const won=copy(clear);won.won=true;const lost=copy(base);lost.hp=0;lost.gameover=true;
  const vault=copy(clear);vault.transition={t:.6,from:0,start:1270,grip:[1338,490]};Object.assign(vault,SIM.transitionPose(vault.transition));vault.cam=180;
  const cycles={};for(const who of ['hero','mutant'])for(const face of [1,-1]){const name=who+(face===1?'_right':'_left');cycles[name]=Array.from({length:24},(_,i)=>{const st=copy(base),a=who==='hero'?st:st.enemies[0];a.x=400+face*i*144/24;a.face=face;a.gait=i/24*TAU;a.move=1;st.t=i/24*144/305;return st;});}
  const transition=Array.from({length:115},(_,i)=>{const st=copy(clear);st.t=i/60;st.transition={t:i/60,from:0,start:1270,grip:[1338,490]};Object.assign(st,SIM.transitionPose(st.transition));st.cam=0;return st;});
  const panelStates=[1,2].map(n=>{const st=copy(base),dx=n*SIM.STRIDE;st.panel=n;st.cam=dx;st.x+=dx;st.y=SIM.groundY(n);st.enemies.forEach(e=>{e.x+=dx;e.y=SIM.groundY(n);});st.barrels.forEach(b=>b.x+=dx);return [n===1?'sewer_ground':'factory_ground',st];});
  const multi=copy(base);multi.ev=[{k:'hit',t:1.9,x:600,y:595},{k:'hit',t:1.9,x:610,y:595}];
  const rainy=Array.from({length:6},(_,i)=>{const st=copy(panelStates[0][1]);st.t=10+i/60;return st;});
  return {states:[['match',match],['low_health',low],['clear',clear],['vault_grip',vault],['victory',won],['gameover',lost],...panelStates,['multi_hit',multi]],cycles,cycleT:Object.fromEntries(Object.keys(cycles).map(k=>[k,144/305])),subject:Object.assign({vault:'hero'},Object.fromEntries(Object.keys(cycles).map(k=>[k,k.startsWith('hero')?'hero':'enemy0']))),sprites:Object.fromEntries(Object.keys(cycles).map(k=>[k,['body','upper','fore','thigh','shin'].map(p=>(k.startsWith('hero')?'hero':'mutant')+'_'+p)])),box:(name,st)=>{const a=name.startsWith('hero')?st:st.enemies[0];return [a.x-110,a.y-245,220,255];},actors:['hero','mutant'],transitions:{vault:transition},anim:{drips:{on:rainy,off:rainy.map(st=>Object.assign(copy(st),{hideFX:true})),box:[120,230,1200,420],min:.001}}};
 };
})();
