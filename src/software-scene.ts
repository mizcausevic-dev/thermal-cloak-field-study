// GPU-free projected rendering fallback. Uses the same scalar field, tensor,
// timeline, dimensions and camera path. Flat lighting replaces PBR materials.
import { PerspectiveCamera, Vector3 } from 'three';
import { Case, flux, isothermX, temperature } from './field';
import { smooth, stateAt } from './timeline';
type State=ReturnType<typeof stateAt>;
type Point=[number,number,number];
export class SoftwareScene{
  canvas=document.createElement('canvas');ctx:CanvasRenderingContext2D;
  camera=new PerspectiveCamera(34,1,.1,100);flags={temperature:true,flux:true,contours:true};reduced=false;
  private w=1;private h=1;private offsetX=0;private offsetY=0;private viewW=1;private viewH=1;private low=false;private last=stateAt(0);private observer:ResizeObserver;
  constructor(private container:HTMLElement){
    const context=this.canvas.getContext('2d');if(!context)throw new Error('Canvas 2D unavailable');this.ctx=context;
    this.canvas.setAttribute('role','img');this.canvas.setAttribute('aria-label','Projected three-dimensional scientific schematic; software fallback with simplified lighting');
    container.prepend(this.canvas);this.camera.up.set(0,0,1);this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(container);this.resize();
  }
  resize(){this.w=this.container.clientWidth;this.h=this.container.clientHeight;const ratio=this.low?1:Math.min(devicePixelRatio,1.5);this.canvas.width=this.w*ratio;this.canvas.height=this.h*ratio;this.ctx.setTransform(this.canvas.width/this.w,0,0,this.canvas.height/this.h,0,0);this.render(this.last);}
  project(x:number,y:number,z:number){const p=new Vector3(x,y,z).project(this.camera);return {x:this.offsetX+(p.x*.5+.5)*this.viewW,y:this.offsetY+(-p.y*.5+.5)*this.viewH};}
  private path(points:Point[],fill:string|null,stroke:string|null=null,width=1){
    const ctx=this.ctx;ctx.beginPath();points.forEach((v,i)=>{const p=this.project(...v);if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);});if(fill){ctx.closePath();ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}
  }
  private circle(r:number,z:number,fill:string,stroke:string|null=null){const p:Point[]=[];for(let i=0;i<=96;i++){const a=i/96*Math.PI*2;p.push([r*Math.cos(a),r*Math.sin(a),z]);}this.path(p,fill,stroke);}
  private annulus(inner:number,outer:number,z:number,fill:string,start=0,length=Math.PI*2){
    const points:Point[]=[];for(let i=0;i<=72;i++){const a=start+length*i/72;points.push([outer*Math.cos(a),outer*Math.sin(a),z]);}for(let i=72;i>=0;i--){const a=start+length*i/72;points.push([inner*Math.cos(a),inner*Math.sin(a),z]);}this.path(points,fill,'#18212a',.45);
  }
  private text(text:string,x:number,y:number,z:number,color='#b5c2cf',size=10){const p=this.project(x,y,z);this.ctx.font=`500 ${size}px "Space Grotesk", sans-serif`;this.ctx.fillStyle=color;this.ctx.textAlign='center';this.ctx.fillText(text,p.x,p.y);}
  private arrow(x:number,y:number,dx:number,dy:number,color:string,z=.1,len=.3){
    const m=Math.hypot(dx,dy);if(m<1e-8)return;const p=this.project(x,y,z),q=this.project(x+len*dx/m,y+len*dy/m,z);const a=Math.atan2(q.y-p.y,q.x-p.x),ctx=this.ctx;
    ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=1.05;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(q.x-4*Math.cos(a-.5),q.y-4*Math.sin(a-.5));ctx.lineTo(q.x-4*Math.cos(a+.5),q.y-4*Math.sin(a+.5));ctx.closePath();ctx.fill();
  }
  private col(t:number,alpha:number){const m=Math.abs(t-.5)*2,endpoint=t>.5?[255,159,28]:[0,180,216],neutral=[122,129,136];return `rgba(${neutral.map((v,i)=>Math.round(v+(endpoint[i]-v)*m)).join(',')},${alpha})`;}
  private plate(kind:Case,s:State,comparison:boolean){
    const field=comparison?1:s.field;
    this.path([[-5.2,-3.3,-.37],[5.2,-3.3,-.37],[5.2,3.3,-.37],[-5.2,3.3,-.37]],'#192431','#33404f');
    this.path([[-5,-3.1,-.02],[5,-3.1,-.02],[5,-3.1,-.24],[-5,-3.1,-.24]],'#4c5867','#707e8f');
    this.path([[-5,-3.1,0],[5,-3.1,0],[5,3.1,0],[-5,3.1,0]],'#737d89','#9cabb8');
    if(kind==='cloaked')for(let i=17;i>=0;i--)this.annulus(.8+i/18,.8+(i+1)/18,0,i%2===0?'#b57950':'#293443');
    if(kind!=='reference'){this.circle(.8,.003,'#293443','#9eacb9');this.circle(.74,.004,'#344252');}
    if(this.flags.temperature&&field>0){
      const n=this.low?38:58,m=this.low?24:36,dx=10/n,dy=6.2/m;
      for(let j=0;j<m;j++)for(let i=0;i<n;i++){const x=-5+i*dx,y=-3.1+j*dy;this.path([[x,y,.012],[x+dx+.004,y,.012],[x+dx+.004,y+dy+.004,.012],[x,y+dy+.004,.012]],this.col(temperature(x+dx/2,y+dy/2,kind,field),.74*field));}
      // Keep material boundaries identifiable under the explanatory overlay.
      if(kind==='cloaked')for(let i=0;i<10;i++){const r=.8+i/9;this.annulus(r-.003,r+.003,.018,'#18212a90');}
      if(kind!=='reference')this.annulus(.795,.805,.02,'#c4cdd5');
    }
    if(this.flags.contours&&(comparison||s.contours>.1))for(let i=0;i<7;i++){
      const value=.8-i*.1;if(Math.abs(value-.5)>=field*.5-.005)continue;
      const points:Point[]=[];for(let j=0;j<=58;j++){const y=-3.02+j/58*6.04;points.push([isothermX(y,value,kind,field),y,.05]);}this.path(points,null,'#e9eff2a3',.75);
      if(!comparison||i===0||i===3||i===6)this.text(['warm A','warm B','warm C','midpoint','cool C','cool B','cool A'][i],isothermX(2.85,value,kind,field),3.33,.05,'#b2c0ce',comparison?9:10);
    }
    if(this.flags.flux&&(comparison||s.flux>.15))for(let y=-2.65;y<2.7;y+=.65)for(let x=-4.4;x<4.5;x+=.65){const [qx,qy]=flux(x,y,kind,field);if(Math.hypot(qx,qy)>.0045)this.arrow(x,y,qx,qy,'#ffd166',.06);}
    if(comparison){const boundary:Point[]=[];for(let i=0;i<=96;i++){const a=i/96*Math.PI*2;boundary.push([1.8*Math.cos(a),1.8*Math.sin(a),.08]);}this.ctx.setLineDash([3,3]);this.path(boundary,null,'#d5dfe8',.8);this.ctx.setLineDash([]);}
    this.path([[-5.05,-3.1,.04],[-5.05,3.1,.04]],null,'#ff9f1c',comparison?3:5);this.path([[5.05,-3.1,.04],[5.05,3.1,.04]],null,'#00b4d8',comparison?3:5);
    for(const x of [-4.75,4.75])for(const y of [-2.84,2.84]){const p=this.project(x,y,.04);this.ctx.fillStyle='#222d3b';this.ctx.beginPath();this.ctx.arc(p.x,p.y,comparison?1:2,0,Math.PI*2);this.ctx.fill();}
    if(kind==='cloaked'&&!comparison&&s.inset>.001){
      const z=2.2*s.inset;
      // A duplicate sector rises above the intact operating annulus.
      for(let i=17;i>=0;i--){const inner=.8+i/18,outer=.8+(i+1)/18,angle=.25,end=2.38;
        this.path([[inner*Math.cos(angle),inner*Math.sin(angle),z-.18],[outer*Math.cos(angle),outer*Math.sin(angle),z-.18],[outer*Math.cos(angle),outer*Math.sin(angle),z],[inner*Math.cos(angle),inner*Math.sin(angle),z]],i%2===0?'#7f4e33':'#202a36','#17202a',.6);
        this.annulus(inner,outer,z,i%2===0?'#c18b62':'#2c3a4c',angle,end-angle);
      }
      this.path([[1.7,0,.08],[1.7,0,z-.12]],null,'#99a6b5',.75);
    }
    if(kind==='cloaked'&&!comparison&&(s.detail>.2||s.inset>.2)){
      this.arrow(.65,.65,1,1,'#f1f3ee',.14,.9);this.text('r · radial',1.65,1.5,.15,'#e8edf1',10);
      const points:Point[]=[];for(let i=0;i<=35;i++){const a=.5+i/35*1.6;points.push([1.45*Math.cos(a),1.45*Math.sin(a),.14]);}this.path(points,null,'#f1f3ee',1.5);this.arrow(-.5,1.36,-1,-.37,'#f1f3ee',.14,.2);this.text('θ · circumferential',-.5,2.15,.15,'#e8edf1',10);
    }
    if(!comparison){this.text('X',-4.35,-3.62,0,'#8ea0b3',9);this.text('Y',-5.6,-2.6,0,'#8ea0b3',9);this.text('Z',-5.6,-3.6,.6,'#8ea0b3',9);this.path([[-4.6,-3.55,0],[-5.55,-3.55,0],[-5.55,-2.75,0]],null,'#697e93',.7);this.path([[-5.55,-3.55,0],[-5.55,-3.55,.5]],null,'#697e93',.7);}
  }
  private view(x:number,y:number,w:number,h:number,kind:Case,s:State,comparison:boolean){
    this.offsetX=x;this.offsetY=y;this.viewW=w;this.viewH=h;const aspect=w/h;this.camera.aspect=aspect;
    if(comparison){const c=s.compare,d=20*Math.max(1,1.35/aspect),orbit=this.reduced?0:Math.sin(25*.07)*.9;this.camera.position.set(orbit*(1-c),-d*.38*(1-c)-3.5*c,d*.86*(1-c)+17*Math.max(1,1.05/aspect)*c);this.camera.lookAt(0,0,0);}
    else{
      const t=s.cameraTime,detail=smooth(17,20,t)*(1-smooth(23.5,25,t)),anatomy=smooth(5,6.5,t)*(1-smooth(9,10,t));
      const orbit=this.reduced?0:Math.sin(Math.min(t,25)*.07)*.9,d=20*Math.max(1,1.35/aspect);
      this.camera.position.set(orbit+detail*1.2,-d*(.38+anatomy*.2-detail*.12),d*(.86-anatomy*.08-detail*.12));this.camera.lookAt(detail*.28,detail*.25,anatomy*.55);
    }
    this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();this.ctx.save();this.ctx.beginPath();this.ctx.rect(x,y,w,h);this.ctx.clip();this.plate(kind,s,comparison);this.ctx.restore();
  }
  render(s:State){
    this.last=s;this.ctx.clearRect(0,0,this.w,this.h);
    if(s.t<25)this.view(0,0,this.w,this.h,'cloaked',s,false);
    else{const cases:Case[]=['cloaked','uncloaked','reference'];if(this.w<650){const h=this.h*s.compare/3,first=this.h-2*h;this.view(0,0,this.w,first,cases[0],s,true);if(h>1)for(let i=1;i<3;i++)this.view(0,first+(i-1)*h,this.w,h,cases[i],s,true);}else{const w=this.w*s.compare/3,first=this.w-2*w;this.view(0,0,first,this.h,cases[0],s,true);if(w>1)for(let i=1;i<3;i++)this.view(first+(i-1)*w,0,w,this.h,cases[i],s,true);}}
  }
  setQuality(low:boolean){this.low=low;this.resize();}
  dispose(){this.observer.disconnect();}
}
