// AUTHORED SCHEMATIC. This scalar field is not a solution of the heat equation.
// Its gradient drives EVERY displayed arrow through q = -K grad(T).
export type Case = 'cloaked'|'uncloaked'|'reference';
export const GEOMETRY={width:10,height:6.2,inner:.8,outer:1.8,thickness:.22};
export const INCLUSION_K=.12; // Dimensionless illustrative ratio; identical in both cases.
export function temperature(x:number,y:number,kind:Case,development=1):number{
  const r=Math.hypot(x,y);
  let slope=1;
  if(kind==='cloaked'){
    const v=Math.max(0,Math.min(1,(r-.8)/1));
    slope=.28+.72*(v*v*(3-2*v));
  } else if(kind==='uncloaked'){
    // A smooth compact perturbation extending outside the comparison annulus.
    const v=Math.max(0,Math.min(1,(r-.8)/2));
    slope=.52+.48*(v*v*(3-2*v));
  }
  if(development<=0)return .5;
  // Boundary temperatures are imposed after the uniform initial state.
  // A smooth authored edge development keeps both Dirichlet edges fixed.
  // This envelope is NOT a diffusion solution or a physical time law.
  const edge=Math.exp(-(5-Math.abs(x))/Math.max(.03,development*2.5));
  const envelope=development+(1-development)*edge;
  return .5-envelope*x*slope/10;
}
export function tensor(x:number,y:number,kind:Case):[number,number,number]{
  const r=Math.hypot(x,y);
  if(kind!=='reference'&&r<.8)return [INCLUSION_K,0,INCLUSION_K];
  if(kind!=='cloaked'||r>=1.8)return [1,0,1];
  const c=x/r,s=y/r;
  const u=(r-.8)/1;
  const kr=.16+.36*u,kt=2.8-1.0*u;
  return [kr*c*c+kt*s*s,(kr-kt)*c*s,kr*s*s+kt*c*c];
}
export function gradient(x:number,y:number,kind:Case,development=1):[number,number]{
  const e=.0001;
  return [(temperature(x+e,y,kind,development)-temperature(x-e,y,kind,development))/(2*e),(temperature(x,y+e,kind,development)-temperature(x,y-e,kind,development))/(2*e)];
}
export function flux(x:number,y:number,kind:Case,development=1):[number,number]{
  const [gx,gy]=gradient(x,y,kind,development),[xx,xy,yy]=tensor(x,y,kind);
  return [-xx*gx-xy*gy,-xy*gx-yy*gy];
}
export function isothermX(y:number,value:number,kind:Case,development=1):number{
  // Each authored field is monotone in X. Find its actual equal-T contour.
  let lo=-5,hi=5;
  for(let i=0;i<28;i++){const mid=(lo+hi)/2;if(temperature(mid,y,kind,development)>value)lo=mid;else hi=mid;}
  return (lo+hi)/2;
}
