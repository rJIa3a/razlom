(function(root){
  'use strict';
  const DT=1/120, VIEW={W:1440,H:900}, L=48, STRIDE=1340, FLOOR=710;
  const PANELS=[{name:'МЁРТВЫЙ ГОРОД',caption:'Нью-Йорк. После полуночи.',bg:'bg_rooftop',enemies:[620,970]}, {name:'ПОД ГОРОДОМ',caption:'Внизу кто-то ждёт...',bg:'bg_sewer',enemies:[510,790,1050]}, {name:'СЕРДЦЕ ФАБРИКИ',caption:'Последняя страница этой ночи.',bg:'bg_factory',enemies:[550,850,1090]}];
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), mix=(a,b,t)=>a+(b-a)*t, ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
  const groundY=panel=>[710,650,632][panel];
  function actors(panel){return PANELS[panel].enemies.map((x,i)=>({id:'enemy'+i,x:x+panel*STRIDE,y:groundY(panel),vx:0,face:-1,hp:panel===2&&i===2?100:65,maxhp:panel===2&&i===2?100:65,attack:0,cd:.7+i*.45,hurt:0,dead:0,gait:0,move:0,target:0}));}
  function create(){return {t:0,steps:0,wt0:0,panel:0,x:290,y:FLOOR,vx:0,vy:0,face:1,hp:100,attack:0,attackKind:0,cd:0,hurt:0,inv:0,combo:0,score:0,kills:0,gait:0,move:0,cam:0,ev:[],freeze:0,transition:null,won:false,gameover:false,enemies:actors(0),barrels:[{x:460,hp:2},{x:1130,hp:2}],heal:[],clearAt:0,jumpHeld:false,hit:false,shake:0};}
  function emit(S,k,x,y,extra={}){S.ev.push(Object.assign({k,t:S.t,x,y},extra));if(S.ev.length>80)S.ev.shift();}
  const spawn=wt=>Object.assign(create(),{wt0:wt});
  function hand(S){return [S.x+S.face*104,S.y-115];}
  function beginTransition(S){S.transition={t:0,from:S.panel,start:S.x,grip:[S.panel*STRIDE+1338,490]};S.attack=0;S.vy=0;emit(S,'vault',S.x,S.y-130);}
  function transitionPose(tr){const p=tr.t,edge=tr.from*STRIDE+1338,dest=(tr.from+1)*STRIDE+270;let x,y;
    if(p<.35){const q=ease(p/.35);x=mix(tr.start,edge-57,q);y=mix(groundY(tr.from),615,q);}
    else if(p<.85){const q=ease((p-.35)/.5);x=edge-57+q*22;y=mix(615,548,q);}
    else{const q=clamp((p-.85)/1.05,0,1);x=mix(edge-35,dest,ease(q));y=mix(548,groundY(tr.from+1),q)-145*Math.sin(q*Math.PI);}
    return {x,y,grip:p>=.26&&p<.83?tr.grip:null,phase:p};}
  function step(S,inp){S.t+=DT;S.steps++;
    if(S.won||S.gameover)return S;
    S.inv=Math.max(0,S.inv-DT);S.hurt=Math.max(0,S.hurt-DT);S.cd=Math.max(0,S.cd-DT);
    if(S.freeze>0){S.freeze-=DT;return S;}
    if(S.transition){const tr=S.transition;tr.t+=DT;const pose=transitionPose(tr);S.x=pose.x;S.y=pose.y;S.face=1;S.move=0;
      S.cam=mix(tr.from*STRIDE,(tr.from+1)*STRIDE,ease((tr.t-.4)/1.3));
      if(tr.t>=1.9){S.panel++;S.transition=null;S.x=S.panel*STRIDE+270;S.y=groundY(S.panel);S.cam=S.panel*STRIDE;S.enemies=actors(S.panel);S.barrels=[{x:S.panel*STRIDE+425,hp:2},{x:S.panel*STRIDE+1150,hp:2}];S.heal=[];S.clearAt=0;emit(S,'land',S.x,S.y);emit(S,'page',S.x,S.y);}
      return S;
    }
    const ground=groundY(S.panel);if(S.y>ground)S.y=ground;
    const dir=(inp.right?1:0)-(inp.left?1:0), grounded=S.y>=ground-.01;
    const target=dir*(S.attack>0?100:305);S.vx=mix(S.vx,target,1-Math.exp(-DT*20));
    if(dir&&!S.attack)S.face=dir;
    S.x=clamp(S.x+S.vx*DT,S.panel*STRIDE+155,S.panel*STRIDE+1280);
    S.move=mix(S.move,Math.abs(S.vx)>30&&grounded?1:0,1-Math.exp(-DT*12));S.gait+=S.vx*DT/23;
    if(inp.jump&&!S.jumpHeld&&grounded){
      if(S.enemies.every(e=>e.hp<=0)&&S.x>S.panel*STRIDE+1190){if(S.panel<2)beginTransition(S);else {S.won=true;emit(S,'win',S.x,S.y);}}
      else{S.vy=-710;emit(S,'jump',S.x,S.y);}
    }
    S.jumpHeld=!!inp.jump;
    if(S.transition)return S;
    if(!grounded||S.vy){S.vy+=1800*DT;S.y+=S.vy*DT;if(S.y>=ground){S.y=ground;S.vy=0;emit(S,'land',S.x,S.y);}}
    if(inp.act&&S.cd<=0){S.attack=.36;S.cd=.4;S.hit=false;S.attackKind=S.combo++%3;emit(S,'swing',S.x+S.face*70,S.y-100);}
    if(S.attack>0){const before=S.attack;S.attack=Math.max(0,S.attack-DT);
      if(before>.19&&S.attack<=.19&&!S.hit){S.hit=true;let did=false;
        for(const e of S.enemies){if(e.hp>0&&Math.abs(e.x-S.x)<145&&(e.x-S.x)*S.face>-20&&Math.abs(e.y-S.y)<145){const damage=S.attackKind===2?33:24;e.hp=Math.max(0,e.hp-damage);e.hurt=.3;e.vx=S.face*480;e.attack=0;e.cd=.7;S.score+=75;did=true;emit(S,'hit',e.x,e.y-115,{face:S.face,kind:S.attackKind});if(!e.hp){S.kills++;S.score+=200;e.dead=.001;emit(S,'kill',e.x,e.y-90);}}}
        for(const b of S.barrels){if(b.hp>0&&Math.abs(b.x-S.x)<140&&(b.x-S.x)*S.face>-15&&Math.abs(S.y-ground)<100){b.hp--;did=true;emit(S,'break',b.x,ground-45);if(!b.hp){S.heal.push({x:b.x,y:ground-26,taken:false});S.score+=50;}}}
        if(did)S.freeze=.055;
      }
    }
    S.heal.forEach(h=>{if(!h.taken&&Math.abs(h.x-S.x)<50&&Math.abs(S.y-ground)<50){h.taken=true;S.hp=Math.min(100,S.hp+24);emit(S,'heal',S.x,S.y-100);}});
    for(const e of S.enemies){e.y=ground;e.hurt=Math.max(0,e.hurt-DT);e.cd=Math.max(0,e.cd-DT);
      if(e.hp<=0){e.dead+=DT;e.x+=e.vx*DT;e.vx*=Math.exp(-DT*8);continue;}
      const d=S.x-e.x;e.face=d>=0?1:-1;
      if(e.hurt>0){e.x+=e.vx*DT;e.vx*=Math.exp(-DT*9);}
      else if(e.attack>0){const prev=e.attack;e.attack=Math.max(0,e.attack-DT);if(prev>.12&&e.attack<=.12&&Math.abs(d)<112&&S.y>ground-95&&S.inv<=0){S.hp=Math.max(0,S.hp-9);S.inv=.75;S.hurt=.22;S.x=clamp(S.x+e.face*23,S.panel*STRIDE+155,S.panel*STRIDE+1280);emit(S,'hurt',S.x,S.y-110);S.freeze=.045;if(S.hp===0){S.gameover=true;emit(S,'lose',S.x,S.y);}}}
      else if(Math.abs(d)>86){e.vx=e.face*(92+S.panel*14);e.x+=e.vx*DT;e.gait+=e.vx*DT/21;}
      else if(e.cd<=0){e.attack=.48;e.cd=1.2;emit(S,'enemySwing',e.x,e.y-100);}
      e.x=clamp(e.x,S.panel*STRIDE+150,S.panel*STRIDE+1280);e.move=mix(e.move,Math.abs(d)>86&&!e.hurt&&!e.attack?1:0,1-Math.exp(-DT*12));
    }
    if(S.enemies.every(e=>e.hp<=0)&&!S.clearAt){S.clearAt=S.t;emit(S,'clear',S.panel*STRIDE+1220,520);}
    return S;
  }
  function scriptInput(t,S){if(S.transition)return {};const alive=S.enemies.filter(e=>e.hp>0).sort((a,b)=>Math.abs(a.x-S.x)-Math.abs(b.x-S.x));if(alive.length){const d=alive[0].x-S.x;return {left:d<-92,right:d>92,act:true,jump:false};}return {right:true,act:true,jump:S.x>S.panel*STRIDE+1200&&Math.floor(t*4)%2===0};}
  let cache=null;function at(t){const loop=Math.floor(t/L),q=t-loop*L,n=Math.round(q/DT);if(!cache||cache.loop!==loop||cache.S.steps>n)cache={loop,S:spawn(loop*L)};while(cache.S.steps<n)step(cache.S,scriptInput(cache.S.t,cache.S));return Object.assign({},cache.S,{loop,q});}
  function selfCheck(){const errors=[];for(const p of PANELS)for(const x of p.enemies)if(x<150||x>1280)errors.push('Enemy outside panel');const S=create();for(let i=0;i<120*48;i++)step(S,scriptInput(S.t,S));if(!S.won)errors.push('Demo did not complete episode: panel '+S.panel);if(S.hp<=0)errors.push('Demo died');return errors;}
  root.SIM={DT,L,VIEW,PANELS,STRIDE,FLOOR,groundY,create,spawn,step,at,hand,transitionPose,scriptInput,selfCheck,demoCheck:S=>S.won,HINT:'← → / A D — движение   ·   ПРОБЕЛ — прыжок / переход   ·   X / J — удар   ·   P — пауза   ·   R — заново'};
  if(typeof module!=='undefined')module.exports=root.SIM;
})(typeof window!=='undefined'?window:globalThis);
