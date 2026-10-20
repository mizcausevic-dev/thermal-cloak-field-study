import test from 'node:test';
import assert from 'node:assert/strict';
import { DURATION, MasterClock, SHOTS, stateAt } from '../src/timeline';
import { Case, temperature, gradient, flux, tensor, isothermX, INCLUSION_K } from '../src/field';
const cases:Case[]=['cloaked','uncloaked','reference'];
test('exact shot boundaries, frame indexing, and final hold',()=>{
  assert.equal(DURATION,34);assert.equal(DURATION*30,1020);
  for(let i=0;i<SHOTS.length;i++){assert.equal(stateAt(SHOTS[i].start).shot,i);assert.equal(stateAt(SHOTS[i].end-.000001).shot,i);}
  assert.equal(stateAt(0).frame,0);assert.equal(stateAt(33.999).frame,1019);assert.equal(stateAt(34).frame,1019);assert.deepEqual(stateAt(100),stateAt(34));
});
test('frame-rate-independent clock, pause, seek, and replay',()=>{
  const a=new MasterClock(),b=new MasterClock();a.play(0);b.play(0);
  for(let t=0;t<=9000;t+=10)a.update(t);b.update(9000);assert.equal(a.time,b.time);assert.equal(a.time,9);
  a.pause(10000);a.update(20000);assert.equal(a.time,10);a.seek(7.5,22000);assert.equal(a.time,7.5);a.play(24000);a.update(50500);assert.equal(a.time,34);assert.equal(a.playing,false);a.play(60000);assert.equal(a.time,0);
});
test('arbitrary seek history reproduces the absolute visual state',()=>{
  const targets=[0,5,7.5,10,13.8,17,21,25,29,33,34];
  for(const t of targets){const expected=stateAt(t);stateAt(31);stateAt(1);assert.deepEqual(stateAt(t),expected);assert.deepEqual(stateAt(t,true),stateAt(t,true));}
  assert.equal(stateAt(33).cameraTime,stateAt(34).cameraTime);
});
test('the same passive central conductivity is used in both inclusion cases',()=>{
  assert.ok(INCLUSION_K>0&&INCLUSION_K<1);assert.deepEqual(tensor(.2,.3,'cloaked'),tensor(.2,.3,'uncloaked'));assert.deepEqual(tensor(.2,.3,'cloaked'),[INCLUSION_K,0,INCLUSION_K]);
});
test('positive tensor eigenvalues and rotating radial/circumferential directions',()=>{
  for(let r=.81;r<1.8;r+=.07)for(let theta=0;theta<Math.PI*2;theta+=.13){
    const c=Math.cos(theta),s=Math.sin(theta),[xx,xy,yy]=tensor(r*c,r*s,'cloaked');
    assert.ok(xx>0&&yy>0&&xx*yy-xy*xy>0);
    const radial=c*c*xx+2*c*s*xy+s*s*yy,tangential=s*s*xx-2*c*s*xy+c*c*yy;
    assert.ok(tangential>radial&&radial>0);
    assert.ok(Math.abs((-s)*(xx*c+xy*s)+c*(xy*c+yy*s))<1e-10);
  }
  assert.notEqual(tensor(1,0,'cloaked')[0],tensor(0,1,'cloaked')[0]);
});
test('flux uses the displayed scalar gradient and never flows uphill',()=>{
  for(const kind of cases)for(let x=-4.8;x<5;x+=.27)for(let y=-3;y<=3;y+=.29){
    const [gx,gy]=gradient(x,y,kind),[qx,qy]=flux(x,y,kind),[xx,xy,yy]=tensor(x,y,kind);
    assert.ok(Math.abs(qx+xx*gx+xy*gy)<1e-10);assert.ok(Math.abs(qy+xy*gx+yy*gy)<1e-10);assert.ok(qx*gx+qy*gy<=1e-12);
    assert.ok(temperature(x,y,kind)>=0&&temperature(x,y,kind)<=1);
  }
});
test('matched uniform initial fields, exterior reference, and insulated Y edges',()=>{
  for(const kind of cases)for(const x of [-5,-2,0,2,5]){
    assert.equal(temperature(x,0,kind,0),.5);
    assert.ok(Math.abs(gradient(x,3.1,kind)[1])<1e-9);assert.ok(Math.abs(gradient(x,-3.1,kind)[1])<1e-9);
    assert.equal(temperature(-5,x/2,kind),1);assert.equal(temperature(5,x/2,kind),0);
  }
  assert.equal(temperature(2,0,'cloaked'),temperature(2,0,'reference'));
  for(const progress of [.01,.2,.6,1])for(const kind of cases){assert.equal(temperature(-5,0,kind,progress),1);assert.equal(temperature(5,0,kind,progress),0);}
});
test('all contour samples are actual equal-temperature contours',()=>{
  for(const kind of cases)for(const level of [.2,.3,.4,.5,.6,.7,.8])for(let y=-3;y<3;y+=.13){assert.ok(Math.abs(temperature(isothermX(y,level,kind),y,kind)-level)<1e-7);}
});
