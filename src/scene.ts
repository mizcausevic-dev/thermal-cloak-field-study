import * as THREE from 'three';
import { Case, flux, temperature, isothermX } from './field';
import { smooth, stateAt } from './timeline';

type ViewState=ReturnType<typeof stateAt>;
const gold=0xffd166, copper=0xb57950, graphite=0x293443;
function metal(color:number){return new THREE.MeshStandardMaterial({color,metalness:.65,roughness:.4});}
function ring(inner:number,outer:number,start=0,length=Math.PI*2){
  const shape=new THREE.Shape();
  shape.absarc(0,0,outer,start,start+length,false);
  if(length<Math.PI*2-.01){shape.lineTo(Math.cos(start+length)*inner,Math.sin(start+length)*inner);shape.absarc(0,0,inner,start+length,start,true);shape.closePath();}
  else{const hole=new THREE.Path();hole.absarc(0,0,inner,0,Math.PI*2,true);shape.holes.push(hole);}
  return new THREE.ExtrudeGeometry(shape,{depth:.24,bevelEnabled:true,bevelSize:.008,bevelThickness:.006,bevelSegments:1,steps:1,curveSegments:96});
}
function line(points:THREE.Vector3[],color:number,opacity=1){return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color,transparent:true,opacity}));}
function sprite(text:string,color='#bdc8d3',size=.22){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;
  const ctx=canvas.getContext('2d')!;ctx.fillStyle=color;ctx.font='500 42px "Space Grotesk", sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,48);
  const material=new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,depthTest:false});
  const obj=new THREE.Sprite(material);obj.scale.set(size*512/96,size,1);return obj;
}
function colorAt(t:number){
  const neutral=new THREE.Color('#7a8188'),c=new THREE.Color(t>.5?'#ff9f1c':'#00b4d8');
  return neutral.lerp(c,Math.abs(t-.5)*2);
}
class Plate{
  scene=new THREE.Scene();root=new THREE.Group();inset=new THREE.Group();glyph=new THREE.Group();
  overlay:THREE.Mesh<THREE.PlaneGeometry,THREE.MeshBasicMaterial>;
  arrows:THREE.ArrowHelper[]=[];contours:THREE.Line[]=[];contourLabels:THREE.Sprite[]=[];
  exteriorBoundary:THREE.Line;
  private positions:THREE.BufferAttribute;private colors:THREE.BufferAttribute;private lastField=-1;
  constructor(public kind:Case){
    this.scene.add(this.root);
    const exteriorPoints=[];for(let i=0;i<=120;i++){const a=i/120*Math.PI*2;exteriorPoints.push(new THREE.Vector3(1.8*Math.cos(a),1.8*Math.sin(a),.19));}
    this.exteriorBoundary=new THREE.Line(new THREE.BufferGeometry().setFromPoints(exteriorPoints),new THREE.LineDashedMaterial({color:0xcbd5df,dashSize:.1,gapSize:.08,transparent:true,opacity:.85}));this.exteriorBoundary.computeLineDistances();this.root.add(this.exteriorBoundary);
    this.scene.add(new THREE.HemisphereLight(0xd8e8ff,0x16202d,2.6));
    const key=new THREE.DirectionalLight(0xffedda,3.5);key.position.set(-4,-2,8);this.scene.add(key);
    const fill=new THREE.DirectionalLight(0xb0d6e5,2);fill.position.set(3,5,4);this.scene.add(fill);
    const host=new THREE.Shape();host.moveTo(-5,-3.1);host.lineTo(5,-3.1);host.lineTo(5,3.1);host.lineTo(-5,3.1);host.closePath();
    if(kind!=='reference'){const hole=new THREE.Path();hole.absarc(0,0,kind==='cloaked'?1.8:.8,0,Math.PI*2,true);host.holes.push(hole);}
    const plate=new THREE.Mesh(new THREE.ExtrudeGeometry(host,{depth:.22,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:2,curveSegments:96}),metal(0x737d89));plate.position.z=-.22;this.root.add(plate);
    if(kind==='cloaked'){
      for(let i=0;i<18;i++){
        const r=.8+i/18;const mesh=new THREE.Mesh(ring(r,r+1/18-.004),i%2===0?metal(copper):new THREE.MeshStandardMaterial({color:graphite,roughness:.82}));mesh.position.z=-.22;this.root.add(mesh);
        const section=new THREE.Mesh(ring(r,r+1/18-.004,Math.PI*.08,Math.PI*.68),i%2===0?metal(copper):new THREE.MeshStandardMaterial({color:graphite,roughness:.82}));this.inset.add(section);
      }
      this.root.add(this.inset);this.inset.visible=false;
      const arc=[];for(let i=0;i<=48;i++){const a=.3+i/48*1.7;arc.push(new THREE.Vector3(1.4*Math.cos(a),1.4*Math.sin(a),.2));}
      this.glyph.add(line(arc,0xf1f3ee,.85));
      const radial=new THREE.ArrowHelper(new THREE.Vector3(Math.cos(.8),Math.sin(.8),0),new THREE.Vector3(.85*Math.cos(.8),.85*Math.sin(.8),.2),.8,0xf1f3ee,.12,.09);this.glyph.add(radial);
      const theta=new THREE.ArrowHelper(new THREE.Vector3(-Math.sin(1.45),Math.cos(1.45),0),new THREE.Vector3(1.4*Math.cos(1.45),1.4*Math.sin(1.45),.2),.28,0xf1f3ee,.1,.08);this.glyph.add(theta);
      const rtext=sprite('r · radial','#f1f3ee',.2);rtext.position.set(1.5,1,.3);this.glyph.add(rtext);
      const ttext=sprite('θ · circumferential','#f1f3ee',.2);ttext.position.set(-.1,2,.3);this.glyph.add(ttext);this.root.add(this.glyph);
    }
    if(kind!=='reference'){
      const center=new THREE.Mesh(new THREE.CylinderGeometry(.79,.79,.22,96),new THREE.MeshStandardMaterial({color:0x344252,roughness:.9}));center.rotation.x=Math.PI/2;center.position.z=-.1;this.root.add(center);
      const centerOutline=[];for(let i=0;i<=96;i++){const a=i/96*Math.PI*2;centerOutline.push(new THREE.Vector3(.8*Math.cos(a),.8*Math.sin(a),.045));}this.root.add(line(centerOutline,0x97a6b7,.8));
    }
    const slab=new THREE.Mesh(new THREE.BoxGeometry(10.4,6.6,.14),metal(0x202936));slab.position.z=-.4;this.root.add(slab);
    for(const [x,color] of [[-5.08,0xff9f1c],[5.08,0x00b4d8]]){
      const rail=new THREE.Mesh(new THREE.BoxGeometry(.13,6.22,.28),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.16,roughness:.45,metalness:.4}));rail.position.set(x,0,-.08);this.root.add(rail);
    }
    // Quiet machined fasteners: detail only, never encoded as data.
    for(const x of [-4.75,4.75])for(const y of [-2.84,2.84]){
      const screw=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,.02,12),metal(0x293443));screw.rotation.x=Math.PI/2;screw.position.set(x,y,.018);this.root.add(screw);
    }
    const geometry=new THREE.PlaneGeometry(10,6.2,120,76);this.positions=geometry.getAttribute('position') as THREE.BufferAttribute;
    this.colors=new THREE.BufferAttribute(new Float32Array(this.positions.count*3),3);geometry.setAttribute('color',this.colors);
    this.overlay=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));this.overlay.position.z=.055;this.root.add(this.overlay);
    for(let y=-2.65;y<=2.66;y+=.65)for(let x=-4.4;x<=4.41;x+=.65){
      const arrow=new THREE.ArrowHelper(new THREE.Vector3(1,0,0),new THREE.Vector3(x,y,.1),.29,gold,.1,.065);this.arrows.push(arrow);this.root.add(arrow);
    }
    for(let i=0;i<7;i++){
      const contour=line(Array.from({length:97},()=>new THREE.Vector3()),0xe8eef3,.58);this.contours.push(contour);this.root.add(contour);
      const label=sprite(['warm A','warm B','warm C','midpoint','cool C','cool B','cool A'][i],'#d1dbe6',.17);this.contourLabels.push(label);this.root.add(label);
    }
    const axis=[['X',4.65,-3.65,0],['Y',-5.65,2.9,0],['Z',-5.65,-3.65,.7]] as const;
    this.root.add(line([new THREE.Vector3(-5.6,-3.6,0),new THREE.Vector3(-4.7,-3.6,0)],0x8d9aa9,.7));
    this.root.add(line([new THREE.Vector3(-5.6,-3.6,0),new THREE.Vector3(-5.6,-2.7,0)],0x8d9aa9,.7));
    this.root.add(line([new THREE.Vector3(-5.6,-3.6,0),new THREE.Vector3(-5.6,-3.6,.6)],0x8d9aa9,.7));
    for(const [text,x,y,z] of axis){const label=sprite(text,'#9cabb9',.17);label.position.set(x,y,z);this.root.add(label);}
  }
  update(s:ViewState,temperatureVisible:boolean,fluxVisible:boolean,contoursVisible:boolean,comparison=false){
    const field=comparison?1:s.field;
    this.exteriorBoundary.visible=comparison;
    this.overlay.material.opacity=temperatureVisible?.69*field:0;
    if(Math.abs(this.lastField-field)>.001){
      for(let i=0;i<this.positions.count;i++){const c=colorAt(temperature(this.positions.getX(i),this.positions.getY(i),this.kind,field));this.colors.setXYZ(i,c.r,c.g,c.b);}this.colors.needsUpdate=true;this.lastField=field;
    }
    for(const arrow of this.arrows){
      const x=arrow.position.x,y=arrow.position.y,[qx,qy]=flux(x,y,this.kind,field),m=Math.hypot(qx,qy);
      // Equal, normalized lengths: direction only. Suppress weak central leakage.
      arrow.visible=fluxVisible&&(comparison||s.flux>.15)&&m>.0045;
      if(arrow.visible)arrow.setDirection(new THREE.Vector3(qx/m,qy/m,0));
    }
    for(let i=0;i<this.contours.length;i++){
      const value=.8-i*.1;
      const visible=contoursVisible&&(comparison||s.contours>.1)&&Math.abs(value-.5)<field*.5-.005;
      const c=this.contours[i];c.visible=visible;this.contourLabels[i].visible=visible&&(!comparison||i===0||i===3||i===6);
      if(visible){const points=[];for(let j=0;j<=96;j++){const y=-3.05+j/96*6.1;points.push(new THREE.Vector3(isothermX(y,value,this.kind,field),y,.15));}c.geometry.setFromPoints(points);this.contourLabels[i].position.set(isothermX(2.9,value,this.kind,field),3.48,.18);}
    }
    this.inset.visible=s.inset>.001&&!comparison;this.inset.position.set(.4,.3,s.inset*2.2);this.inset.rotation.z=s.inset*-.15;
    this.glyph.visible=!comparison&&(s.inset>.2||s.detail>.2);
  }
}
export class LabScene{
  renderer:THREE.WebGLRenderer;camera=new THREE.PerspectiveCamera(34,1,.1,100);
  models:Plate[];flags={temperature:true,flux:true,contours:true};reduced=false;
  private w=1;private h=1;private lastState=stateAt(0);private resizeObserver:ResizeObserver;
  constructor(private container:HTMLElement,private onFailure:()=>void){
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));this.renderer.setClearColor(0x10151d,0);
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1;
    this.renderer.domElement.setAttribute('aria-label','Three-dimensional plate with a concentric annulus; temperature color, white isotherms, and gold heat-flux arrows');
    this.renderer.domElement.setAttribute('role','img');this.container.prepend(this.renderer.domElement);
    this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();this.onFailure();});
    this.models=[new Plate('cloaked'),new Plate('uncloaked'),new Plate('reference')];
    this.camera.up.set(0,0,1);
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);this.resize();
  }
  resize(){this.w=this.container.clientWidth;this.h=this.container.clientHeight;this.renderer.setSize(this.w,this.h);this.render(this.lastState);}
  private view(x:number,y:number,w:number,h:number,model:Plate,s:ViewState,comparison:boolean){
    const aspect=w/h;this.camera.aspect=aspect;
    if(comparison){const c=s.compare,d=20*Math.max(1,1.35/aspect),orbit=this.reduced?0:Math.sin(25*.07)*.9;this.camera.position.set(orbit*(1-c),-d*.38*(1-c)-3.5*c,d*.86*(1-c)+17*Math.max(1,1.05/aspect)*c);this.camera.lookAt(0,0,0);}
    else{
      const t=s.cameraTime;
      const detail=smooth(17,20,t)*(1-smooth(23.5,25,t));
      const anatomy=smooth(5,6.5,t)*(1-smooth(9,10,t));
      const orbit=this.reduced?0:Math.sin(Math.min(t,25)*.07)*.9;
      const distance=20*Math.max(1,1.35/aspect);
      this.camera.position.set(orbit+detail*1.2,-distance*(.38+anatomy*.2-detail*.12),distance*(.86-anatomy*.08-detail*.12));
      this.camera.lookAt(detail*.28,detail*.25,anatomy*.55);
    }
    this.camera.updateProjectionMatrix();this.renderer.setViewport(x,y,w,h);this.renderer.setScissor(x,y,w,h);this.renderer.render(model.scene,this.camera);
  }
  render(s:ViewState){
    this.lastState=s;this.renderer.setScissorTest(false);this.renderer.clear();this.renderer.setScissorTest(true);
    const comparison=s.t>=25;
    for(const m of comparison?this.models:[this.models[0]])m.update(s,this.flags.temperature,this.flags.flux,this.flags.contours,comparison);
    if(!comparison)this.view(0,0,this.w,this.h,this.models[0],s,false);
    else if(this.w<650){
      const h=this.h*s.compare/3,first=this.h-2*h;this.view(0,this.h-first,this.w,first,this.models[0],s,true);if(h>1)for(let i=1;i<3;i++)this.view(0,this.h-first-i*h,this.w,h,this.models[i],s,true);
    }else{
      // Equal viewport sizes and identical cameras: a fair visual comparison.
      const w=this.w*s.compare/3,first=this.w-2*w;this.view(0,0,first,this.h,this.models[0],s,true);if(w>1)for(let i=1;i<3;i++)this.view(first+(i-1)*w,0,w,this.h,this.models[i],s,true);
    }
    this.renderer.setScissorTest(false);
  }
  project(x:number,y:number,z:number){const v=new THREE.Vector3(x,y,z).project(this.camera);return {x:(v.x*.5+.5)*this.w,y:(-.5*v.y+.5)*this.h};}
  setQuality(low:boolean){this.renderer.setPixelRatio(low?1:Math.min(devicePixelRatio,1.75));this.resize();}
  dispose(){this.resizeObserver.disconnect();this.renderer.dispose();}
}
