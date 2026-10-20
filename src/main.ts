import '@fontsource/space-grotesk/latin-400.css';
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-600.css';
import '@fontsource/space-grotesk/latin-700.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import './style.css';
import { MasterClock, SHOTS, stateAt } from './timeline';
import { LabScene } from './scene';
import { SoftwareScene } from './software-scene';
import { Soundtrack } from './audio';

const icons={play:'<path d="m8 5 11 7-11 7Z" fill="currentColor" stroke="none"/>',pause:'<path d="M8 5v14M16 5v14" stroke-width="4"/>',replay:'<path d="M4 9a8 8 0 1 1 0 6M4 3v6h6"/>',sound:'<path d="m11 5-5 4H3v6h3l5 4ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',mute:'<path d="m11 5-5 4H3v6h3l5 4ZM16 9l6 6m0-6-6 6"/>',full:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>'};
const icon=(name:keyof typeof icons)=>`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
document.querySelector<HTMLDivElement>('#app')!.innerHTML=`
<main id="experience">
  <header class="masthead">
    <a class="wordmark" href="#" aria-label="Thermal field study home"><span class="mark" aria-hidden="true"><i></i><i></i><i></i></span><span>THERMAL<br><b>FIELD STUDY</b></span></a>
    <span class="header-note">A study in direction-dependent conduction</span>
    <button class="text-button" id="notes-open">Model notes ${icon('info')}</button>
  </header>
  <section class="player" aria-label="Thermal cloak interactive explainer">
    <div class="stage-layout">
      <section class="visual" aria-label="Three-dimensional scientific schematic">
        <div class="stage-title"><h1>Heat, <em>redirected.</em></h1><p>A planar thermal-conduction cloak</p></div>
        <div id="viewport" class="viewport"><div class="loading" role="status">Preparing the field study…</div></div>
        <div id="webgl-fallback" class="fallback" hidden>
          <svg viewBox="0 0 700 400" role="img" aria-label="Static scientific schematic. Hot boundary at left, cold boundary at right, concentric annulus around a passive center.">
            <defs><linearGradient id="temperature"><stop stop-color="#ff9f1c"/><stop offset=".5" stop-color="#737d89"/><stop offset="1" stop-color="#00b4d8"/></linearGradient></defs>
            <path d="M50 65h600v260H50z" fill="#737d89" stroke="#a6b1bb"/>
            <path d="M50 65v260" stroke="#ff9f1c" stroke-width="9"/><path d="M650 65v260" stroke="#00b4d8" stroke-width="9"/>
            <g fill="none" stroke="#b57950" stroke-width="6"><circle cx="350" cy="195" r="99"/><circle cx="350" cy="195" r="84"/><circle cx="350" cy="195" r="69"/></g>
            <circle cx="350" cy="195" r="48" fill="#293443" stroke="#afbdca"/><g fill="#ecf0f3" font-family="sans-serif" text-anchor="middle" font-size="17"><text x="80" y="40">HOT</text><text x="620" y="40">COLD</text><text x="350" y="350">Concentric copper / polymer material concept</text></g>
          </svg>
          <p id="fallback-message">WebGL is unavailable. The static anatomy and complete chapter transcript remain available.</p>
        </div>
        <div class="boundary-label hot">HOT BOUNDARY<span>Fixed temperature</span></div><div class="boundary-label cold">COLD BOUNDARY<span>Fixed temperature</span></div>
        <div class="anatomy-label" id="anatomy-label">Central inclusion<span>Passive · finite conductivity</span></div>
        <div class="inset-label" id="inset-label" hidden><b>Duplicate sectional inset</b><span><i class="copper-dot"></i>Copper · higher conductivity</span><span><i class="polymer-dot"></i>Polymer · lower conductivity</span></div>
        <div class="comparison-titles" id="comparison-titles" hidden><div>CLOAKED<span>Inclusion + engineered annulus</span></div><div>UNCLOAKED<span>Same inclusion + host</span></div><div>REFERENCE<span>Homogeneous host</span></div></div>
        <div class="visual-bottom"><span id="visual-caption">Patterned material concept.</span><span class="axis-caption">X / Y · in plane &nbsp; Z · thickness</span></div>
      </section>
      <aside class="narrative fx-layer fx-vignette">
        <div class="chapter-meta"><span id="chapter-count">01 / 05</span><span id="chapter-range">00–05 s</span></div>
        <div class="narrative-body"><h2 id="shot-title">Heat takes a different path.</h2><p id="shot-description"></p><div id="shot-note" class="shot-note"></div></div>
        <div class="equation"><span class="equation-label">CONDUCTIVE HEAT FLUX</span><div>q = −K∇T</div><p>Temperature sets the gradient.<br>Conductivity sets the response.</p></div>
        <div class="legend" aria-label="Shared explanatory temperature legend"><div class="legend-title">Temperature overlay <span>qualitative</span></div><div class="colorbar"></div><div class="legend-ends"><span>Colder</span><span>Warmer</span></div><div class="legend-row"><i class="flux-icon"></i><span>Heat flux · arrow direction only</span></div><div class="legend-row"><i class="contour-icon"></i><span>White contours · equal temperature</span></div><p class="encoding-note">Explanatory colors, not visible heat or a thermal-camera image.</p></div>
      </aside>
    </div>
    <div class="evidence-strip"><span class="evidence-dot"></span><span>Illustrative field—not a calculated heat-conduction solution.</span><span id="transient-label">Presentation time ≠ physical heating time</span></div>
    <div class="transport">
      <div class="mobile-key" aria-label="Shared temperature legend and flux key"><span>Colder</span><i></i><span>Warmer</span><b>${icon('arrow')}</b><span>Direction only</span></div>
      <button class="primary-play" id="play" aria-label="Play animation">${icon('play')}<span>Play study</span></button>
      <button class="icon-button" id="replay" aria-label="Replay from beginning" title="Replay (R)">${icon('replay')}</button>
      <output class="time" id="time" aria-live="off">00.00 <span>/ 34.00</span></output>
      <div class="timeline-wrap"><label for="timeline" class="sr-only">Presentation timeline in seconds</label><input id="timeline" type="range" min="0" max="34" step="0.01" value="0" aria-valuetext="0 seconds, Plate and boundaries"/><div class="timeline-markers" aria-hidden="true">${SHOTS.map(s=>`<i style="left:${s.start/34*100}%"></i>`).join('')}</div></div>
      <button class="icon-button" id="mute" aria-label="Mute audio" title="Mute (M)">${icon('sound')}</button>
      <button class="icon-button" id="fullscreen" aria-label="Enter fullscreen" title="Fullscreen (F)">${icon('full')}</button>
    </div>
    <nav class="chapters" aria-label="Animation chapters">${SHOTS.map((s,i)=>`<button data-shot="${i}" class="chapter ${i===0?'active':''}" ${i===0?'aria-current="step"':''}><span>0${i+1}</span><b>${s.name}</b><small>${String(s.start).padStart(2,'0')}–${String(s.end).padStart(2,'0')} s</small></button>`).join('')}</nav>
    <div class="inspection-tools"><fieldset><legend class="sr-only">Visible scientific layers</legend><span>LAYERS</span><label><input type="checkbox" id="layer-temperature" checked/> Temperature</label><label><input type="checkbox" id="layer-flux" checked/> Flux arrows</label><label><input type="checkbox" id="layer-contours" checked/> Isotherms</label></fieldset><label class="inspection-toggle"><input type="checkbox" id="reduced"/> Still-camera inspection</label><details class="audio-mixer"><summary>Audio mix</summary><div><label>Music<input type="range" id="music" min="0" max="1" step=".01" value=".52"/></label><label>Effects<input type="range" id="effects" min="0" max="1" step=".01" value=".45"/></label></div></details><label class="quality"><input type="checkbox" id="low-quality"/> Low power</label></div>
  </section>
  <footer class="footer"><p>Idealized planar conduction; convection and radiation omitted.</p><span>34.000 s / 1,020 reference frames</span><p class="keys"><kbd>Space</kbd> play &nbsp; <kbd>←</kbd><kbd>→</kbd> seek &nbsp; <kbd>M</kbd> mute</p></footer>
  <section id="model-notes" class="model-notes" aria-labelledby="notes-title"><div><h2 id="notes-title">What this study shows.</h2><p>A material concept. A directional transport mechanism. The limits of the claim.</p></div><div class="notes-content">
    <details open><summary>Evidence level & field construction</summary><p><b>Option A — scientific schematic.</b> The temperature field is authored from smooth functions, not obtained by solving a heat equation. Every gold arrow is evaluated from the same field using q = −K∇T and finite positive conductivities. This enforces local downhill transport but does not enforce energy conservation or interface flux continuity. Visual agreement is not physical validation.</p><p>The field-development sequence is <b>schematic transient development · time-compressed</b>. It interpolates from the same uniform initial field in every case. It is not a calculated transient, a physical heating time, or evidence of transient cloaking.</p></details>
    <details><summary>Patterned material concept ≠ effective tensor</summary><p>The visible concentric copper/polymer rings illustrate higher circumferential and lower radial conductivity. The <b>homogenized anisotropic model</b> uses a position-dependent radial profile, with local principal directions rotating around the annulus. It is not derived from the displayed rings. Feasibility of this profile using these materials has not been established.</p><p>For ideal thin laminates, the circumferential conductivity is the arithmetic mixture and radial conductivity the harmonic mixture. One material fraction therefore cannot select any arbitrary pair of conductivities. Radial profile, host matching, geometry, thermal contact, and operating conditions all matter.</p><div class="math-pair"><span>qᵣ = −kᵣ ∂T/∂r</span><span>qθ = −kθ (1/r) ∂T/∂θ</span><span>kθ &gt; kᵣ &gt; 0</span></div></details>
    <details><summary>Boundary conditions & matched comparison</summary><p>X runs from the hot left edge to the cold right edge. Y is transverse in-plane; Z is plate thickness. Top and bottom edges are insulated in the idealized scenario. Out-of-plane losses, internal heat generation, and contact resistance are omitted. Real hardware may have all of these effects.</p><p>All three panels use the same plate dimensions, boundaries, uniform initial field, observation stage, temperature legend, normalized arrow length, and camera. The same passive inclusion has finite conductivity below the host in both inclusion cases. There is no cooling source or hidden sink. The uncloaked annulus is replaced with host material; the reference is host throughout.</p><p>The exterior comparison region is outside the same annulus radius in each panel. No numerical disturbance metric or performance value is reported. Qualitative schematic matching is authored, not a measured reduction.</p></details>
    <details><summary>Four different outcomes</summary><p>Exterior disturbance, central heat-flux magnitude, central gradient, and delayed temperature change are different quantities. This schematic illustrates intended exterior matching and reduced central flux. It does not establish any of these as device performance, and does not claim delayed heating.</p><ul><li>Reduced flux does not guarantee a colder center.</li><li>Steady-state exterior matching does not establish transient cloaking.</li><li>Finite conductivity permits leakage.</li><li>Performance depends on geometry and boundary conditions.</li><li>This is not perfect insulation or thermal-camera invisibility.</li></ul></details>
    <details><summary>Reading the scene & accessibility</summary><p>Amber–gray–cyan encodes temperature qualitatively. Gold arrows show direction only, with equal lengths and the same suppression threshold in very weak flux regions. White isotherms connect equal values of the authored field; they are not heat paths. Their warm, midpoint, and cool labels distinguish qualitative contour levels, not measured temperatures.</p><p>Space or K: play/pause. R: replay. M: mute. F: fullscreen where supported. Left/right: seek one second. Home/End: start/final state. Chapter buttons seek and pause for inspection. Still-camera inspection removes camera travel while preserving the selected timeline state. Reduced-motion preferences select this mode by default; playback always requires interaction. Audio begins only with Play or unmute interaction.</p><p>All geometry, overlays, and audio are procedural. A static SVG remains available without WebGL. The field study contains no remote runtime services or tracking.</p></details>
    <details><summary>Research context</summary><p>Research has demonstrated engineered thermal cloaks under specific conditions. That work does not validate this illustrated pattern or authored field.</p><p><a href="https://doi.org/10.1103/PhysRevLett.110.195901" target="_blank" rel="noreferrer">Schittny et al. — Experiments on Transformation Thermodynamics (2013) ${icon('arrow')}</a></p><p><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5015050/" target="_blank" rel="noreferrer">Detecting Thermal Cloaks via Transient Effects (2016) ${icon('arrow')}</a></p></details>
  </div></section>
  <div class="sr-only" id="announcer" role="status" aria-live="polite"></div>
</main>`;

const $=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const clock=new MasterClock(),sound=new Soundtrack();let lab:LabScene|SoftwareScene|null=null,currentShot=-1,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,pendingPlay=0;
$<HTMLInputElement>('reduced').checked=reduced;
await document.fonts.ready;
function fallback(){
  const previousFlags=lab?.flags;lab?.dispose();$('viewport').querySelectorAll('canvas').forEach(c=>c.remove());
  try{lab=new SoftwareScene($('viewport'));lab.reduced=reduced;if(previousFlags)lab.flags={...previousFlags};document.querySelector('.axis-caption')!.textContent='Software projection · simplified lighting';}
  catch{$('viewport').classList.add('failed');$('webgl-fallback').hidden=false;$('anatomy-label').hidden=true;}
  document.querySelector('.loading')?.remove();
}
try{lab=new LabScene($('viewport'),fallback);lab.reduced=reduced;document.querySelector('.loading')?.remove();}catch(error){console.warn('WebGL unavailable; showing accessible fallback.',error);fallback();}

const notes=[
  '<b>One plate. Three regions.</b><span>Homogeneous host / patterned annulus / passive central inclusion.</span>',
  '<b>Patterned material concept.</b><span>The visible rings illustrate anisotropy. They are not a validated cloak or a directly simulated microstructure.</span>',
  '<b>Schematic transient development · time-compressed.</b><span>A smooth authored transition from a uniform field; no physical time or heating delay is predicted.</span>',
  '<b>Homogenized anisotropic model.</b><span>Higher kθ · lower kᵣ. Finite positive values permit leakage. The shown material pattern has not been proved to realize this profile.</span>',
  '<b>Performance depends on geometry and boundary conditions.</b><span>Compare exterior fields outside the dashed circles.<br>Finite conductivity permits leakage.<br>Not thermal-camera invisibility.</span>'
];
function update(){
  const s=stateAt(clock.time,reduced);lab?.render(s);
  $('experience').classList.toggle('comparison',s.shot===4);
  $<HTMLInputElement>('timeline').value=String(clock.time);
  $('timeline').style.setProperty('--progress',`${clock.time/34*100}%`);
  $('timeline').setAttribute('aria-valuetext',`${clock.time.toFixed(2)} seconds, ${SHOTS[s.shot].name}`);
  $('time').innerHTML=`${clock.time.toFixed(2).padStart(5,'0')} <span>/ 34.00</span>`;
  $('play').innerHTML=icon(clock.playing?'pause':'play')+`<span>${clock.playing?'Pause':clock.time>=34?'Play again':'Play study'}</span>`;
  $('play').setAttribute('aria-label',clock.playing?'Pause animation':clock.time>=34?'Replay animation':'Play animation');
  $('inset-label').hidden=!(s.inset>.3);
  $('anatomy-label').hidden=s.shot!==0||!lab;
  if(lab&&s.shot===0){const p=lab.project(0,-.15,.3);$('anatomy-label').style.left=`${p.x}px`;$('anatomy-label').style.top=`${p.y+75}px`;}
  $('comparison-titles').hidden=s.shot!==4;
  $('comparison-titles').style.opacity=String(s.compare);
  $('visual-caption').textContent=s.shot<2?'Patterned material concept.':s.shot===4?'Intended cloaking behavior · schematic.':'Homogenized anisotropic model.';
  $('transient-label').textContent=s.shot===2?'Schematic transient development · time-compressed.':'Presentation time ≠ physical heating time';
  if(s.shot!==currentShot){
    currentShot=s.shot;const shot=SHOTS[s.shot];$('shot-title').textContent=shot.title;$('shot-description').textContent=shot.description;
    $('shot-note').innerHTML=notes[s.shot];$('chapter-count').textContent=`0${s.shot+1} / 05`;$('chapter-range').textContent=`${String(shot.start).padStart(2,'0')}–${String(shot.end).padStart(2,'0')} s`;
    document.querySelectorAll<HTMLButtonElement>('[data-shot]').forEach((el,i)=>{el.classList.toggle('active',i===s.shot);if(i===s.shot)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
    $('announcer').textContent=`Chapter ${s.shot+1}. ${shot.name}. ${shot.title}`;
  }
}
async function toggle(){
  if(clock.playing){pendingPlay++;clock.pause(performance.now());sound.stop();update();return;}
  const intent=++pendingPlay;
  try{await sound.unlock();}catch{ $('announcer').textContent='Audio unavailable. The visual study can still play.';}
  if(intent!==pendingPlay)return;
  clock.play(performance.now());sound.start(clock.time);update();
}
function seek(t:number,pause=false){pendingPlay++;if(pause){clock.pause(performance.now());sound.stop();}clock.seek(t,performance.now());if(clock.playing)sound.start(clock.time);else sound.stop();update();}
function mute(){sound.muted=!sound.muted;sound.levels();$('mute').innerHTML=icon(sound.muted?'mute':'sound');$('mute').setAttribute('aria-label',sound.muted?'Unmute audio':'Mute audio');$('mute').setAttribute('aria-pressed',String(sound.muted));}
async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await $('experience').requestFullscreen();}catch{$('announcer').textContent='Fullscreen is not supported in this browser context.';}}
$('play').addEventListener('click',()=>void toggle());
$('replay').addEventListener('click',()=>{seek(0,true);void toggle();});
$('timeline').addEventListener('input',()=>seek(+$<HTMLInputElement>('timeline').value));
$('mute').addEventListener('click',()=>{mute();if(!sound.muted&&clock.playing)void sound.unlock().then(()=>sound.start(clock.time));});
$('fullscreen').addEventListener('click',()=>void fullscreen());
document.addEventListener('fullscreenchange',()=>{$('fullscreen').setAttribute('aria-label',document.fullscreenElement?'Exit fullscreen':'Enter fullscreen');$('fullscreen').setAttribute('aria-pressed',String(!!document.fullscreenElement));});
if(!document.fullscreenEnabled){$<HTMLButtonElement>('fullscreen').disabled=true;$('fullscreen').title='Fullscreen unavailable in this browser';}
document.querySelectorAll<HTMLButtonElement>('[data-shot]').forEach(el=>el.addEventListener('click',()=>seek(SHOTS[Number(el.dataset.shot)].start,true)));
for(const name of ['temperature','flux','contours'] as const)$(`layer-${name}`).addEventListener('change',()=>{if(lab)lab.flags[name]=$<HTMLInputElement>(`layer-${name}`).checked;update();});
$('reduced').addEventListener('change',()=>{reduced=$<HTMLInputElement>('reduced').checked;if(lab)lab.reduced=reduced;update();});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{reduced=e.matches;$<HTMLInputElement>('reduced').checked=reduced;if(lab)lab.reduced=reduced;update();});
$('low-quality').addEventListener('change',()=>lab?.setQuality($<HTMLInputElement>('low-quality').checked));
for(const level of ['music','effects'] as const)$(level).addEventListener('input',()=>{sound[`${level}Level`]=+$<HTMLInputElement>(level).value;sound.levels();});
$('notes-open').addEventListener('click',()=>$('model-notes').scrollIntoView({behavior:reduced?'instant':'smooth'}));
document.querySelector('.wordmark')!.addEventListener('click',e=>{e.preventDefault();seek(0,true);});
document.addEventListener('keydown',e=>{
  const target=e.target as HTMLElement;if(/INPUT|TEXTAREA|SELECT|BUTTON|SUMMARY/.test(target.tagName)||target.isContentEditable)return;
  if(e.code==='Space'||e.code==='KeyK'){e.preventDefault();void toggle();}
  else if(e.code==='ArrowRight'){e.preventDefault();seek(clock.time+1);}
  else if(e.code==='ArrowLeft'){e.preventDefault();seek(clock.time-1);}
  else if(e.code==='KeyM')mute();else if(e.code==='KeyR'){seek(0,true);void toggle();}
  else if(e.code==='KeyF')void fullscreen();else if(e.code==='Home'){e.preventDefault();seek(0,true);}else if(e.code==='End'){e.preventDefault();seek(34,true);}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&clock.playing){pendingPlay++;clock.pause(performance.now());sound.stop();update();}});
window.addEventListener('resize',()=>requestAnimationFrame(()=>update()));
let slowFrames=0,lastFrame=performance.now();
function frame(now:number){
  const wasPlaying=clock.playing;clock.update(now);
  if(wasPlaying){update();if(!clock.playing)sound.stop();}
  if(now-lastFrame>48&&clock.playing&&++slowFrames===45){lab?.setQuality(true);$<HTMLInputElement>('low-quality').checked=true;}
  lastFrame=now;requestAnimationFrame(frame);
}
update();requestAnimationFrame(frame);
