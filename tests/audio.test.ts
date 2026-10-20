import test from 'node:test';
import assert from 'node:assert/strict';
import { Soundtrack } from '../src/audio';

test('procedural audio has bounded samples, a clean end, and no duplicate sources on seek/replay',async()=>{
  const buffers:any[]=[],sources:any[]=[];
  class FakeAudioContext{
    currentTime=10;destination={};async resume(){}
    createGain(){return {gain:{setTargetAtTime(){}},connect(){}};}
    createBuffer(ch:number,length:number,rate:number){const data=Array.from({length:ch},()=>new Float32Array(length));const buffer={duration:length/rate,getChannelData:(i:number)=>data[i],data};buffers.push(buffer);return buffer;}
    createBufferSource(){const source={buffer:null,stopped:false,disconnected:false,offset:-1,connect(){},start(_when:number,offset:number){this.offset=offset;},stop(){this.stopped=true;},disconnect(){this.disconnected=true;}};sources.push(source);return source;}
  }
  const original=(globalThis as any).AudioContext;(globalThis as any).AudioContext=FakeAudioContext;
  try{
    const sound=new Soundtrack();assert.equal(sound.context,null);assert.equal(sound.sourceCount,0);await sound.unlock();
    assert.equal(buffers.length,2);for(const b of buffers){assert.equal(b.duration,34);for(const data of b.data){let peak=0;for(const sample of data)peak=Math.max(peak,Math.abs(sample));assert.ok(peak>0&&peak<1);assert.ok(Math.abs(data.at(-1))<.0001);}}
    sound.start(5);assert.equal(sound.sourceCount,2);assert.deepEqual(sources.slice(-2).map(s=>s.offset),[5,5]);
    sound.start(17);assert.equal(sound.sourceCount,2);assert.ok(sources.slice(0,2).every(s=>s.stopped&&s.disconnected));assert.deepEqual(sources.slice(-2).map(s=>s.offset),[17,17]);
    sound.stop();assert.equal(sound.sourceCount,0);assert.equal(sound.active,false);assert.ok(sources.every(s=>s.stopped&&s.disconnected));
    sound.start(34);assert.equal(sound.sourceCount,0);sound.start(0);assert.equal(sound.sourceCount,2);sound.stop();
  }finally{(globalThis as any).AudioContext=original;}
});
