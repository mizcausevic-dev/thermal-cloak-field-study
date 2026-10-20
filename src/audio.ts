// Original procedural score. No samples, downloads, or audio services.
const sampleRate=24000,duration=34,notes=[110,130.8128,164.8138,146.8324];
const fade=(t:number,a:number,r:number)=>Math.min(1,t/a)*Math.max(0,Math.min(1,r));
export class Soundtrack{
  context:AudioContext|null=null;private music:AudioBuffer|null=null;private effects:AudioBuffer|null=null;
  private sources:AudioBufferSourceNode[]=[];private mg:GainNode|null=null;private eg:GainNode|null=null;private master:GainNode|null=null;
  muted=false;musicLevel=.52;effectsLevel=.45;active=false;generation=0;
  async unlock(){
    if(!this.context){this.context=new AudioContext();this.master=this.context.createGain();this.master.connect(this.context.destination);this.mg=this.context.createGain();this.eg=this.context.createGain();this.mg.connect(this.master);this.eg.connect(this.master);this.generate();this.levels();}
    await this.context.resume();
  }
  private generate(){
    const ctx=this.context!;this.music=ctx.createBuffer(2,sampleRate*duration,sampleRate);this.effects=ctx.createBuffer(2,sampleRate*duration,sampleRate);
    for(let ch=0;ch<2;ch++){
      const data=this.music.getChannelData(ch),fx=this.effects.getChannelData(ch);
      for(let i=0;i<data.length;i++){
        const t=i/sampleRate,section=Math.min(3,Math.floor(t/8.5)),root=notes[section];
        const detune=ch===0?.999:1.001,env=Math.min(1,t/2)*Math.min(1,(duration-t)/2);
        const chord=(Math.sin(2*Math.PI*root*.5*detune*t)+.45*Math.sin(2*Math.PI*root*1.5*detune*t)+.3*Math.sin(2*Math.PI*root*2*detune*t))*.055;
        const beat=t%(.625),index=Math.floor(t/.625),freq=root*[2,3,4,3,2,1.5,3,4][index%8];
        const pluck=Math.sin(2*Math.PI*freq*beat)*Math.exp(-beat*11)*.03*Math.min(1,t/5);
        const bass=Math.sin(2*Math.PI*root*.25*t)*.035*(.7+.3*Math.sin(t*.5));
        data[i]=(chord+pluck+bass)*env;
        let sound=0;
        for(const at of [5,10,17,25]){const u=t-at;if(u>=0&&u<1.3){const f=at===25?330:220;sound+=Math.sin(2*Math.PI*f*u+.4*Math.sin(u*13))*Math.exp(-u*5)*Math.min(1,u*35)*.085;}}
        if(t>31){const u=t-31;sound+=(Math.sin(2*Math.PI*110*u)+.5*Math.sin(2*Math.PI*220*u))*Math.sin(Math.PI*u/3)*.025;}
        fx[i]=sound;
      }
    }
  }
  start(offset:number){
    this.stop();if(!this.context||!this.music||offset>=duration)return;
    this.active=true;this.generation++;
    for(const [buffer,gain] of [[this.music,this.mg],[this.effects,this.eg]] as const){
      const source=this.context.createBufferSource();source.buffer=buffer;source.connect(gain!);source.start(this.context.currentTime+.015,Math.max(0,offset));this.sources.push(source);
    }
  }
  stop(){for(const source of this.sources){try{source.stop();}catch{}source.disconnect();}this.sources=[];this.active=false;}
  levels(){if(!this.context)return;const t=this.context.currentTime;this.master!.gain.setTargetAtTime(this.muted?0:.8,t,.025);this.mg!.gain.setTargetAtTime(this.musicLevel,t,.025);this.eg!.gain.setTargetAtTime(this.effectsLevel,t,.025);}
  get sourceCount(){return this.sources.length;}
}
