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
 let rigTransform=null;
 function bone(tex,a,b,width,face,u){if(rigTransform){a=M.ap(rigTransform,a);b=M.ap(rigTransform,b);}if(!ASSETS[tex])return;const d=Math.hypot(b[0]-a[0],b[1]-a[1]),rot=Math.atan2(-(b[0]-a[0]),b[1]-a[1]);L.sprite(tex,0,0,{m:M.of(M.t(...a),M.r(rot)),w:width,h:d+width*.35,pivot:[width*.5,width*.17],flip:face<0,u});}
 function foot(g,phase,amount,x,y,face){let q=((g/TAU+phase)%1+1)%1;let dx,dy=0;if(q<.6)dx=43.2-q*144;else{const k=(q-.6)/.4;dx=lerp(-43.2,43.2,k);dy=-27*Math.sin(k*Math.PI);}return [x+face*lerp(phase?18:-18,dx,amount),y+dy*amount];}
 function actor(a,who,cam,tr=null,clock=0,ground=SIM.FLOOR){
   const weight=a.grip&&!a.climb?clamp((clock-(a.grip.t||0))/.14,0,1):1,q=weight*weight*(3-2*weight),face=a.face||1,x=lerp(a.grip?.fromX??a.x,a.x,q)-cam,y=lerp(a.grip?.fromY??a.y,a.y,q),enemy=who==='mutant',id=enemy?a.id:'hero',death=clamp((a.dead||0)/.7,0,1),fade=1-death;
   if(fade<=0)return;
   const hurt=a.hurt>0,u={alpha:fade*(hurt&&Math.floor(clock*26)%2?.6:1)},far={alpha:u.alpha,tint:[.43,.38,.62,.35]},move=a.move||0,g=a.gait||0;
   const compression=tr?SIM.transitionPose(tr).compression:a.grounded?12*Math.max(0,1-(clock-(a.landAt??-10))/.16):0;
   const low=a.mode==='crouch'||a.mode==='roll', bob=move*2.5*Math.cos(g*2), hips=[x,y-(low?40:98)+death*66+bob+compression],shoulder=[x-face*22,hips[1]-(low?34:49)],air=!a.grounded;
   if(low){hips[0]-=face*12;shoulder[0]=hips[0]+face*26;shoulder[1]=hips[1]-47;}
   rigTransform=a.mode==='roll'?M.of(M.t(x,y-65),M.r(face*TAU*clamp(1-(a.roll||0)/.46,0,1)),M.t(-x,-(y-65))):null;
   let nearFoot=foot(g,0,move,x,y,face),farFoot=foot(g,.5,move,x,y,face);
   if(air){const tuck=tr?1:clamp(1-Math.abs(a.vy||0)/750,.15,1);const k=tr?Math.min(clamp(tr.t/.3,0,1),clamp((SIM.TRANSITION_DURATION-tr.t)/.18,0,1)):1,w=k*k*(3-2*k);nearFoot=[lerp(nearFoot[0],x+face*26,w),lerp(nearFoot[1],y-8-16*tuck,w)];farFoot=[lerp(farFoot[0],x-face*29,w),lerp(farFoot[1],y-12-27*tuck,w)];}
   const at=a.attack||0,progress=enemy?1-at/.48:1-at/.36,strike=at>0?(enemy?(progress<.5?-.25*Math.sin(progress*2*Math.PI):Math.sin((progress-.5)*2*Math.PI)):Math.sin(clamp(progress/.94,0,1)*Math.PI)):0;
   let nearHand=[shoulder[0]+face*28-(nearFoot[0]-x)*.45*move,shoulder[1]+51],farHand=[shoulder[0]-face*18-(farFoot[0]-x)*.45*move,shoulder[1]+53];
   if(at>0){nearHand=[shoulder[0]+face*(28+strike*66),shoulder[1]+34-strike*24];farHand=[shoulder[0]+face*24,shoulder[1]+24];}
   if(air&&!tr){nearHand=[x+face*36,y-220];farHand=[shoulder[0]-face*25,shoulder[1]+18];}
   if(tr){const p=SIM.transitionPose(tr),k=clamp((SIM.TRANSITION_DURATION-tr.t)/.18,0,1),end=k*k*(3-2*k),free=[lerp(nearHand[0],shoulder[0]+face*55,end),lerp(nearHand[1],shoulder[1]-42,end)],grip=[tr.grip[0]-cam,tr.grip[1]];let w=p.phase<.30?clamp((p.phase-.18)/.12,0,1):p.phase<.36?1:1-clamp((p.phase-.36)/.10,0,1);w=w*w*(3-2*w);nearHand=[lerp(free[0],grip[0],w),lerp(free[1],grip[1],w)];farHand=[lerp(farHand[0],shoulder[0]-face*42,end),lerp(farHand[1],shoulder[1]-21,end)];}
   if(!enemy&&at>0&&a.attackKind===2){nearFoot=[x+face*(30+strike*85),y-35-strike*64];}
   if(a.grip&&!tr){const hands=SIM.supportHands(a);let w=a.climb?1-clamp((clock-a.climb.start-.18)/.25,0,1):1;w=w*w*(3-2*w);nearHand=[lerp(nearHand[0],hands[0][0]-cam,w),lerp(nearHand[1],hands[0][1],w)];farHand=[lerp(farHand[0],hands[1][0]-cam,w),lerp(farHand[1],hands[1][1],w)];const swing=5*Math.sin(clock*3+a.gait);nearFoot=[x+face*21+swing,y-14];farFoot=[x-face*18+swing,y-25];if(w===1){L.anchor('grip',[hands[0][0]-cam,hands[0][1]],nearHand,1);L.anchor('grip-far',[hands[1][0]-cam,hands[1][1]],farHand,1);};}
   if(a.mode==='roll'){nearFoot=[x+face*25,y-30];farFoot=[x-face*15,y-45];nearHand=[x+face*15,y-61];farHand=[x-face*17,y-65];}
   const nearKnee=ik(hips,nearFoot,56,56,-face),farKnee=ik(hips,farFoot,56,56,-face);
   const nearElbow=ik(shoulder,nearHand,55,56,face),farElbow=ik(shoulder,farHand,55,56,-face);
   const leg=(k,f,un)=>{bone(who+'_thigh',hips,k,enemy?34:28,face,un);bone(who+'_shin',k,f,enemy?37:32,face,un);};
   const arm=(e,h,un)=>{bone(who+'_upper',shoulder,e,enemy?28:24,face,un);bone(who+'_fore',e,h,enemy?27:24,face,un);};
   L.shadow(x,ground+3,43,9,.42*fade*(a.grip?.3:1));leg(farKnee,farFoot,far);arm(farElbow,farHand,far);leg(nearKnee,nearFoot,u);
   if(ASSETS[who+'_body']){if(low){let body=M.of(M.t(hips[0],hips[1]+3),M.s(face,1),M.r(.92));if(rigTransform)body=M.mul(rigTransform,body);L.sprite(who+'_body',0,0,{m:body,w:78,h:113,pivot:[39,105],u});}else L.sprite(who+'_body',x-39,y-202+death*66+bob+compression,{w:78,h:113,flip:face<0,u:{...u,sway:[.0015,8,clock*2,1]}});}
   arm(nearElbow,nearHand,u);
   for(const [name,p] of Object.entries({ground:[x,y],top:[x,y-202+bob],hip:hips,hipL:hips,hipR:hips,head:[x,y-181+bob],shoulder,shL:shoulder,shR:shoulder,elbowL:farElbow,elbowR:nearElbow,handL:farHand,handR:nearHand,kneeL:farKnee,kneeR:nearKnee,ankleL:farFoot,ankleR:nearFoot,heelL:farFoot,heelR:nearFoot,groundL:[farFoot[0],y],groundR:[nearFoot[0],y],footL:farFoot,footR:nearFoot,grip:nearHand,tip:nearHand}))L.joint(id,name,rigTransform&&name!=='ground'?M.ap(rigTransform,p):p);
   if(tr&&SIM.transitionPose(tr).grip)L.anchor('frame-grip',[tr.grip[0]-cam,tr.grip[1]],nearHand,1);
   rigTransform=null;
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
   if(['land','jump','step','turn','roll','rollDust'].includes(e.k)){for(let j=0;j<6;j++)L.puff(x+(j-2.5)*age*60,y-6-age*18,6+age*18,[.7,.58,.75],.27*(1-age/.7),j);}
   if(e.k==='heal'&&age<.65)label('heal'+e.t,'+24',x,y-age*50,26,'#bdff74',{al:.5,a:1-age/.65});
 }}
 S.shakeEnabled=true;
 function platform(b,cam){if(ASSETS.obstacle){const name=b.id==='step'?'obstacle':'platform';L.sprite(name,b.x-cam,b.y,{w:b.w,h:b.id==='step'?b.h:b.h+32});}else L.solid(b.x-cam,b.y,b.w,b.h,[.18,.19,.44]);}

 S.render=t=>{
  const st=S.state||SIM.at(t),gt=st.t;let shake=0;
  if(S.shakeEnabled)for(const e of st.ev){const age=gt-e.t;if(e.k==='land'&&e.v>650&&age>=0&&age<.18)shake+=2.5*Math.sin(age*90)*(1-age/.18);}
  const cam=st.cam+shake;L.beginBG();L.solid(0,0,W,H,[.98,.965,.93]);
  // Fine paper grain stays outside the panels.
  for(let j=0;j<120;j++){const x=(j*193)%W,y=(j*79)%H;L.solid(x,y,2,1,[.91,.9,.86]);}
  for(let n=0;n<2;n++){const x=100+n*SIM.STRIDE-cam;if(x>W||x+1240<0)continue;L.solid(x-6,142,1252,670,c.ink);L.sprite(ASSETS[SIM.PANELS[n].bg]?SIM.PANELS[n].bg:'bg_rooftop',x,148,{w:1240,h:658});}
  L.beginComp();
  if(st.panel===0||st.transition){SIM.SOLIDS.forEach(b=>platform(b,cam));const p=SIM.PIPE;
   L.sprite('pipe',p.x-cam-8,p.y-10,{w:p.x2-p.x+16,h:22});for(const x of [p.x,p.x2]){L.solid(x-cam-4,147,8,p.y-147,[.12,.16,.28]);L.solid(x-cam-7,p.y-8,14,23,[.7,.46,.24]);}
   if(st.fx){for(let j=0;j<8;j++)L.puff(210-cam+Math.sin(gt+j)*5,245-((gt*30+j*14)%95),14,[.4,.75,.7],.2,j);L.glow(1200-cam,205,28,[.9,.7,.17],.08+.05*Math.sin(gt*2.8),3);for(let j=0;j<7;j++)L.solid(1175-cam+j*4,233+Math.sin(gt*2+j*.3)*2,5,2,[.2,.32,.35]);}
  }
  actor(st,'hero',cam,st.transition,gt,st.ground||SIM.FLOOR);
  if(st.fx){effects(st,cam);if(st.mode==='run'||st.mode==='roll'||st.transition){for(let j=0;j<3;j++)L.solid(st.x-cam-st.face*(55+j*12),st.y-70-j*16,20+j*4,2,[.6,.75,.85]);}for(const e of st.ev){const age=gt-e.t;if(e.k==='grab'&&age<.3)L.star(e.x-cam,e.y,12*(1-age/.3),[1,.86,.25],.5);if(e.k==='vault'&&age<1.2)for(let j=0;j<6;j++)L.solid(e.x-cam+age*(35+j*12),e.y-age*90+age*age*110+j*7,3,5,[.96,.94,.86],age*(j-3));}}
  if(st.panel===0&&!st.transition){const pulse=1+.12*Math.sin(gt*4),x=1260-cam;L.solid(x-21,520,32*pulse,11,c.yellow);L.solid(x-3,515,22,11,c.yellow,.65);L.solid(x-3,532,22,11,c.yellow,-.65);}
  L.finish(t,{bloom:[.03,.02],vignette:0,warm:0,roll:0,dither:0});
  box('title',100,29,510,88,c.ink,16);label('titletext','РАЗЛОМ',118,67,48);label('sub','ДВИЖЕНИЕ ПО СТРАНИЦЕ / ВЕРСИЯ 2',120,99,13,'#d8c998');
  box('mode',630,33,710,79,c.ink,14);const modes={idle:'СТОЙКА',run:'БЕГ',jump:'ПРЫЖОК',fall:'ПАДЕНИЕ',crouch:'ПРИСЕД',roll:'ПЕРЕКАТ',hang:'ЗАЦЕП ЗА УСТУП',pipe:'ВИС НА ТРУБЕ',climb:'ПОДТЯГИВАНИЕ',vault:'МЕЖДУ КАДРАМИ'};label('modetext',modes[st.mode]||'СТОЙКА',648,60,22,'#eddf8e');label('paneltext',`КАДР ${st.panel+1} / 2`,648,91,14);
  box('caption',122,167,545,38,c.yellow,12);label('cap',SIM.PANELS[st.panel].caption,138,187,18,'#171325',{out:'transparent'});
  box('hint',100,830,1240,42,c.ink,15);label('hinttext',SIM.hint(st),720,851,18,'#eee4cb',{al:.5});
  if(!S.state){box('demo',475,745,490,44,c.yellow,12);label('demotext','КОСНИСЬ ЭКРАНА ИЛИ НАЖМИ ENTER',720,767,18,'#171325',{al:.5,out:'transparent'});}
  if(window.AUDIO)AUDIO.update(st,S.state!==null);
 };
 S.QA=()=>{const copy=s=>JSON.parse(JSON.stringify(s)),base=SIM.create(),states=[['match',base]],cycles={};
  for(const mode of ['crouch','roll','hang','pipe','climb','jump','fall']){const s=copy(base);s.mode=mode;s.grounded=!['hang','pipe','climb','jump','fall'].includes(mode);if(mode==='hang'||mode==='climb'){s.x=672;s.y=676;s.grip={kind:'ledge',id:'ledge',x:700,y:430};}if(mode==='pipe'){s.x=960;s.y=456;s.grip={kind:'pipe',x:960,y:210};}if(mode==='jump'||mode==='fall'){s.y=570;s.vy=mode==='jump'?-600:500;}states.push([mode,s]);}
  for(const t of [.12,.32,.60,.90]){const tr={t,start:1230,grip:[1338,490]},pose=SIM.transitionPose(tr),s=copy(base);Object.assign(s,{x:pose.x,y:pose.y,t,grounded:false,mode:'vault',transition:tr,cam:SIM.STRIDE*Math.max(0,Math.min(1,(t-.24)/.62))});states.push(['vault_'+Math.round(t*100),s]);}
  const second=copy(base);second.panel=1;second.x=SIM.STRIDE+270;second.cam=SIM.STRIDE;states.push(['landing_second',second]);
  for(const face of [1,-1])cycles['hero_'+(face===1?'right':'left')]=Array.from({length:36},(_,i)=>({...copy(base),x:300+face*i*4,face,mode:'run',gait:i/36*TAU,move:1,t:i/36*.45}));
  return {states,cycles,subject:{hero_right:'hero',hero_left:'hero'},sprites:{hero_right:['hero_body','hero_upper','hero_fore','hero_thigh','hero_shin'],hero_left:['hero_body','hero_upper','hero_fore','hero_thigh','hero_shin']},box:(n,s)=>[s.x-100,s.y-235,200,245],actors:['hero'],anim:{steam:{on:Array.from({length:8},(_,i)=>({...copy(base),t:10+i/60})),off:Array.from({length:8},(_,i)=>({...copy(base),t:10+i/60,fx:false})),box:[165,150,100,170],min:.001}}};
 };
})();

