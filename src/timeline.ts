export const DURATION = 34;
export const SHOTS = [
  {start:0,end:5,name:'Plate & boundaries',title:'Heat takes a different path.',description:'A passive inclusion sits inside a patterned annulus. Fixed hot and cold edges establish the direction of conduction.'},
  {start:5,end:10,name:'Annulus anatomy',title:'The pattern sets the direction.',description:'Thin concentric copper and polymer layers illustrate higher circumferential and lower radial conductivity. The floating section is a duplicate; the plate stays intact.'},
  {start:10,end:17,name:'Field development',title:'Around the center. Through the plate.',description:'An authored temperature field develops smoothly. Gold arrows show the direction of heat flux derived from that field and a positive conductivity tensor.'},
  {start:17,end:25,name:'Directional conduction',title:'Conductivity has a direction.',description:'The local radial and circumferential directions rotate around the annulus. In an anisotropic material, heat flux need not align with the temperature gradient.'},
  {start:25,end:34,name:'Matched comparison',title:'A quieter field outside.',description:'Intended cloaking behavior · schematic. Compare the same inclusion and boundaries against a homogeneous host reference. The illustrated field is authored, not a performance prediction.'}
] as const;
export const clamp=(v:number,a=0,b=1)=>Math.min(b,Math.max(a,v));
export const smooth=(a:number,b:number,t:number)=>{const v=clamp((t-a)/(b-a));return v*v*(3-2*v)};
export function stateAt(input:number,reduced=false){
  const t=clamp(input,0,DURATION);
  const shot=Math.min(4,SHOTS.findIndex(s=>t>=s.start&&t<s.end) < 0?4:SHOTS.findIndex(s=>t>=s.start&&t<s.end));
  return {t,shot,frame:Math.min(1019,Math.floor(t*30)),field:smooth(10,16.3,t),
    inset:smooth(5,6.5,t)*(1-smooth(9,10,t)),
    flux:smooth(11.2,14,t),contours:smooth(14.5,17,t),
    detail:smooth(17,19,t)*(1-smooth(23.5,25,t)),
    compare:smooth(25,27,t),cameraTime:reduced?17:Math.min(t,33)};
}
export class MasterClock{
  time=0;playing=false;private anchor=0;private offset=0;
  play(now:number){if(this.time>=DURATION)this.time=0;this.offset=this.time;this.anchor=now;this.playing=true;}
  pause(now:number){this.update(now);this.playing=false;}
  seek(value:number,now:number){this.time=clamp(value,0,DURATION);this.offset=this.time;this.anchor=now;if(this.time===DURATION)this.playing=false;}
  update(now:number){if(this.playing){this.time=clamp(this.offset+(now-this.anchor)/1000,0,DURATION);if(this.time===DURATION)this.playing=false;}return this.time;}
}
