const assert=require('node:assert/strict'),S=require('../sim.js');
const s=S.create();s.x=960;s.y=456;s.grip={kind:'pipe',x:960,y:210};s.mode='pipe';s.grounded=false;
for(const dir of [1,-1]){s.hangTravel=8;const a=S.supportHands(s)[0];S.step(s,{right:dir===1,left:dir===-1});const b=S.supportHands(s)[0];assert.ok(Math.abs(a[0]-b[0])<1e-8,'support hand must stay planted');}
for(const t of [0,.18,.30,.36,.60,.86,1.04]){const p=S.transitionPose({t,start:1230,grip:[1338,490]});assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));if(t===0||t>=.86)assert.equal(p.y,S.FLOOR);}
const p=S.transitionPose({t:1.04,start:1230,grip:[1338,490]});assert.equal(p.x,S.STRIDE+270);assert.equal(p.compression,0);console.log('Research motion: planted hands both directions; transition endpoints and settling pass.');
const v=S.create();v.transition={t:0,start:1230,grip:[1338,490]};v.grounded=false;for(let n=0;n<104;n++)S.step(v,{});assert.ok(v.transition,'recovery locks input');assert.equal(v.ev.filter(e=>e.k==='land').length,1);assert.ok(Math.abs(v.ev.find(e=>e.k==='land').t-.86)<S.DT);for(let n=0;n<30;n++)S.step(v,{});assert.equal(v.panel,1);assert.equal(v.ev.filter(e=>e.k==='land').length,1);
