# Heat, redirected

A complete 34.000-second interactive field study of a planar thermal-conduction cloak. TypeScript, Three.js, Vite, original procedural Web Audio, and a GPU-free projected renderer. No accounts, API keys, tracking, external runtime services, or paid assets.

**Evidence level: Option A — scientific schematic.** Illustrative field—not a calculated heat-conduction solution. No performance values or physical heating times are claimed.

## Open or run

- Open the supplied `thermal-cloak.html` for the self-contained experience. All scripts, styles, fonts, and favicon are embedded. Modern browser JavaScript is required. If your file viewer restricts active HTML, download it and open it in a browser.
- Upload the contents of `dist/` to any static host. Serve with HTTP(S); no server functions are required.
- For development, use Node.js 22.12+ or 24 and npm:

```sh
npm ci
npm run dev
```

Open the URL Vite prints. Run `npm test`, `npm run build`, or `npm run package:html`. The last command creates `standalone/thermal-cloak.html` as well as `dist/`.

Repository: https://github.com/mizcausevic-dev/thermal-cloak-field-study. See [DEPLOY.md](DEPLOY.md) for the GitHub Pages deployment workflow and [VALIDATION.md](VALIDATION.md) for verification status. Source publication has been approved; deployment and public browser checks are recorded separately.

## The five shots

| Presentation time | Reference frames | Scene |
| --- | --- | --- |
| [0, 5) s | 0–149 | Oblique plate, material regions, uniform initial field, boundary setup |
| [5, 10) s | 150–299 | Duplicate sectional inset; intact operating plate; radial and circumferential glyphs |
| [10, 17) s | 300–509 | Schematic field development and locally consistent flux directions |
| [17, 25) s | 510–749 | Direction-dependent transport, separate isotherms and flux arrows |
| [25, 34) s | 750–1019 | Pullback into equal-scale cloaked, uncloaked, and homogeneous-reference views |

At 34 seconds the presentation holds. Camera motion resolves before 33 seconds. The master clock uses absolute elapsed time, independently of rendering frame rate. All visual state is evaluated from absolute timeline time; seeking never accumulates physics.

## Controls and accessibility

Play/pause, replay, timeline scrubbing, chapter seeking, mute, music/effects levels, fullscreen when available, temperature/flux/isotherm toggles, still-camera inspection, and lower render resolution. The mobile player and shared temperature/flux key remain visible while scrolling.

- Space or K: play/pause; R: replay; M: mute; F: fullscreen.
- Left/right: seek one second. Home/End: initial/final state.
- Chapter buttons seek and pause for inspection. Native input and button keyboard behavior is preserved when a control has focus.
- Reduced-motion preferences select a static camera and disable nonessential CSS motion. Playback never autostarts.
- Audio is created only after a play/unmute interaction. Pause and seek stop and disconnect old sources. Resume creates exactly one music source and one effects source at the current offset. The score and effects are pre-rendered procedural PCM, not event schedules that can replay skipped cues.
- Leaving the tab pauses playback. Accessible names, focus outlines, a labeled slider, chapter announcements, textual explanations, and separate geometric encodings support non-color reading.
- If WebGL cannot initialize, the same timeline and scientific field use a Canvas 2D renderer with a Three.js perspective camera. If that also fails, a static labeled SVG and chapter text remain available.

## Scientific construction and limits

The visible plate is 10 × 6.2 arbitrary length units, about 0.22 units thick. The inclusion radius is 0.8; the annulus outer radius is 1.8. These are illustrative geometry choices, not hardware specifications. X is left to right, Y transverse in the plate, Z thickness. The same inclusion conductivity, 0.12 relative to a host value of 1, is used in both inclusion cases. No heat sink or cooling source is present.

The initial scalar temperature is uniform. During the authored development, fixed hot/cold edge values are imposed; a smooth envelope broadens the interior change. Top/bottom in-plane edges have zero transverse gradient in the authored field. The intended physical scenario omits convection, radiation, contact resistance, internal generation, and out-of-plane loss. These omissions are idealizations, not claims about real hardware.

`field.ts` constructs smooth scalar temperature functions. The final cloaked field matches the authored homogeneous reference outside radius 1.8 by construction. The uncloaked perturbation extends outside that same radius. This is **not evidence that a fabricated annulus creates those fields**. All displayed arrows use the exact same scalar field and `q = -K ∇T`, with central differences for its gradient. Isotherms are found by monotone bisection of that scalar, not drawn independently.

Inside the annulus, with `u = (r - 0.8) / 1.0`, the illustrative effective conductivities are `k_r = 0.16 + 0.36u` and `k_theta = 2.8 - u`, relative to the host. Both are finite and positive. The local radial/circumferential tensor rotates into X/Y at every position. Outside the annulus the host is isotropic. The shown rings are **not directly simulated** and have **not been proved capable of realizing this effective profile or its host matching**. One copper/polymer mixture fraction does not provide two independent conductivity choices. The concentric pattern is a material concept, not a validated cloak.

Gold arrows have the same normalized length in all views and encode **direction only**. They are suppressed below a shared illustrative magnitude threshold of 0.0045 in the arbitrary normalization. No arrow density or length represents a measured magnitude. In the comparison, identical dashed circles mark radius 1.8; compare exterior fields only outside them. Temperature, arrow scales, dimensions, boundaries, observation stage, and camera are shared. Qualitative contour labels identify equal-temperature levels; no numerical temperatures are displayed.

Local downhill transport follows from the positive tensor. The authored field does **not** enforce the heat equation, energy conservation, interface normal-flux continuity, or a particular material realization. There is no computed transient, heat-capacity model, grid-convergence study, or experimental validation. Interpolation illustrates development; it does not predict delayed heating. Central flux, central gradient, exterior disturbance, and a delayed temperature change are distinct outcomes. The study claims no permanent cold region, perfect insulation, or thermal-camera invisibility.

## Rendering and audio approximations

The primary renderer uses extruded procedural geometry, metallic copper and matte polymer, controlled lights, and translucent vertex colors. Thin annulus surfaces extend slightly above the host for legibility. The sectional anatomy is a duplicate sector. The operating plate is never cut open. The fallback projects matching geometry outlines and field samples using the same camera mathematics but uses flat lighting and coarser color tiles. Conduction is never represented by moving particles, optical rays, or closed circulating loops.

The electronic score uses generated sine-based chords, bass, and restrained plucks. Reveal and comparison cues are short synthesized presentation tones. All audio is original procedural output; no samples are used. Presentation duration is exactly 34 seconds, while audible scheduling can have normal browser/output-device latency. Fullscreen and audio depend on browser support and user interaction.

## Source map

| File | Responsibility |
| --- | --- |
| `src/timeline.ts` | Master clock, exact shot boundaries, deterministic state |
| `src/field.ts` | Authored temperature scalar, rotating tensor, flux, contours |
| `src/scene.ts` | Native Three.js geometry, materials, lighting, viewports, camera |
| `src/software-scene.ts` | Projected rendering fallback with the same field and timeline |
| `src/audio.ts` | Original 34-second PCM score/effects and source lifecycle |
| `src/main.ts` | Accessible player, annotations, controls, transcript, evidence labels |
| `src/style.css` | Bundled typography, responsive layout, subtle vignette, mobile controls |
| `scripts/standalone.mjs` | Embeds built assets and licenses into one HTML file |
| `.github/workflows/pages.yml` | Test/build and GitHub Pages artifact deployment |

See [VALIDATION.md](VALIDATION.md) for checks actually performed and remaining verification limits.

## Research context

Primary research provides context, not validation of this visual concept:

- Schittny et al., *Experiments on Transformation Thermodynamics: Molding the Flow of Heat* (2013), https://doi.org/10.1103/PhysRevLett.110.195901
- *Detecting Thermal Cloaks via Transient Effects* (2016), https://pmc.ncbi.nlm.nih.gov/articles/PMC5015050/

Custom source is MIT-licensed. Three.js uses MIT; Space Grotesk and IBM Plex Mono use the SIL Open Font License. Notices accompany the package and standalone HTML.
