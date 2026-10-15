// Lightweight renderer for iPhone Safari/Home Screen. The scene, rig and simulation stay shared.
(function(){
 'use strict';
 const G=window.G,L=window.LIB,textures=new Map(),tints=new Map();let ctx,W,H;
 const css=(c,a=1)=>`rgba(${Math.round(c[0]*255)},${Math.round(c[1]*255)},${Math.round(c[2]*255)},${Math.max(0,Math.min(1,a))})`;
 G.renderer='canvas';
 G.init=(canvas,w,h)=>{canvas.width=W=w;canvas.height=H=h;ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw Error('Canvas unavailable');G.ctx=ctx;G.W=w;G.H=h;ctx.imageSmoothingEnabled=false;};
 G.load=(name,url)=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{const t={t:image,w:image.naturalWidth,h:image.naturalHeight};textures.set(name,t);resolve(t);};image.onerror=()=>reject(Error('Image failed: '+name));image.src=url;});
 G.tex=name=>{if(!textures.has(name))throw Error('Texture missing: '+name);return textures.get(name);};
 G.canvasTex=(name,canvas)=>{const t={t:canvas,w:canvas.width,h:canvas.height};textures.set(name,t);return t;};
 L.init=()=>{};
 L.beginBG=()=>{L.qaReset();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);};
 L.beginComp=()=>{};L.finish=()=>{};
 L.sprite=(name,x,y,o={})=>{if(L.ONLY.length&&!L.ONLY.includes(name))return {w:0,h:0};const tex=G.tex(name),src=o.src||[0,0,1,1],sw=tex.w*(src[2]-src[0]),sh=tex.h*(src[3]-src[1]);let w=o.w,h=o.h;if(w&&!h)h=w*sh/sw;if(h&&!w)w=h*sw/sh;if(!w){w=sw;h=sh;}const u=o.u||{},pivot=o.pivot||[0,0];let image=tex.t;
  if(u.tint&&u.tint[3]>0){const tint=u.tint,key=name+'|'+tint.join(',');if(!tints.has(key)){const cv=document.createElement('canvas');cv.width=tex.w;cv.height=tex.h;const c=cv.getContext('2d');c.drawImage(image,0,0);c.globalCompositeOperation='multiply';c.fillStyle=css(tint,tint[3]);c.fillRect(0,0,cv.width,cv.height);c.globalCompositeOperation='destination-in';c.drawImage(image,0,0);tints.set(key,cv);}image=tints.get(key);}
  ctx.save();ctx.globalAlpha=u.alpha===undefined?1:u.alpha;if(o.m){ctx.transform(...o.m);ctx.translate(-pivot[0],-pivot[1]);}else{ctx.translate(x+pivot[0],y+pivot[1]);ctx.rotate(o.rot||0);ctx.translate(-pivot[0],-pivot[1]);}if(o.flip){ctx.translate(w,0);ctx.scale(-1,1);}ctx.drawImage(image,tex.w*src[0],tex.h*src[1],sw,sh,0,0,w,h);ctx.restore();return {w,h};
 };
 L.solid=(x,y,w,h,col,rot=0,px=0,py=0,a=1)=>{ctx.save();ctx.translate(x+px,y+py);ctx.rotate(rot);ctx.fillStyle=css(col,a);ctx.fillRect(-px,-py,w,h);ctx.restore();};
 function cloud(x,y,rx,ry,col,amt){if(rx<=0||ry<=0)return;ctx.save();ctx.translate(x,y);ctx.scale(rx,ry);const g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,css(col,amt));g.addColorStop(1,css(col,0));ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore();}
 L.shadow=(x,y,rx,ry,amt=.5)=>cloud(x,y,rx,ry,[0,0,0],amt);
 L.glow=(x,y,r,col,amt)=>{ctx.save();ctx.globalCompositeOperation='lighter';cloud(x,y,r,r,col,amt);ctx.restore();};
 L.puff=(x,y,r,col,amt,seed=0)=>{for(let j=0;j<3;j++){const a=j*2.4+seed;cloud(x+Math.cos(a)*r*.18,y+Math.sin(a)*r*.15,r*.7,r*.55,col,amt*.55);}};
 L.star=(x,y,r,col,amt)=>{ctx.save();ctx.fillStyle=css(col,amt);ctx.beginPath();for(let j=0;j<8;j++){const a=j*Math.PI/4-Math.PI/2,k=j%2?.22:1;ctx.lineTo(x+Math.cos(a)*r*k,y+Math.sin(a)*r*k);}ctx.closePath();ctx.fill();ctx.restore();};
 function font(o){ctx.font=`${o.weight||'bold'} ${o.size||30}px ${o.font||'Arial,sans-serif'}`;}
 L.labelW=(slot,text,o={})=>{font(o);return ctx.measureText(text).width;};
 L.label=(slot,text,x,y,o={})=>{ctx.save();font(o);const size=o.size||30,width=ctx.measureText(text).width,x0=x-width*(o.al||0);ctx.globalAlpha=o.a===undefined?1:o.a;ctx.textBaseline='middle';ctx.lineJoin='round';if(!L.ONLY.length){if(o.out&&o.out!=='transparent'){ctx.lineWidth=Math.max(3,size*.16);ctx.strokeStyle=o.out;ctx.strokeText(text,x0,y);}ctx.fillStyle=o.col||'#f6e7c8';ctx.fillText(text,x0,y);}if(ctx.globalAlpha>.05)L.uiText(slot,text,x0,y-size*.62,width,size*1.24);ctx.restore();return width;};
})();
