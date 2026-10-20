# Verification record — 2026-10-20

## Automated checks actually run

`npm test`: **9 tests passed; 0 failed.**

1. Exact five-shot boundaries, 34 seconds, 1,020 reference frames, frame 1019 final hold.
2. Rendering-rate-independent master clock, pause, seek, and replay.
3. Absolute timeline state is repeatable after arbitrary seek history; camera is stable in the final second.
4. The same finite positive inclusion conductivity is used in cloaked and uncloaked cases.
5. Annulus tensors have positive eigenvalues; radial/circumferential principal directions rotate with position.
6. Flux is derived from the displayed scalar's gradient and does not point uphill; sampled temperatures remain bounded.
7. Shared uniform initial fields, fixed hot/cold edges after application, and zero transverse gradient at the insulated Y edges.
8. Samples on every drawn contour recover its actual scalar temperature level.
9. Procedural audio buffers are 34 seconds long with bounded samples and a clean end. Source lifecycle tests verify cancellation/disconnection and exactly two active sources after repeated starts at different offsets. The audio test uses a mock AudioContext and does not establish acoustic quality or hardware latency.

`npm run build`: TypeScript and Vite production compilation succeeded. `npm run package:html` also generated a self-contained HTML file with embedded JavaScript, CSS, fonts, favicon, and license notices. Vite reports a JavaScript chunk over 500 kB uncompressed; its compressed size is about 146 kB. This is the bundled Three.js/application code, not a missing dependency.

## Browser inspection actually performed

Chrome cloud browser, desktop viewport approximately 1363 × 936 CSS pixels, plus a real 390 × 844 iframe viewport for mobile CSS/layout inspection. The iframe gives the app a native narrow viewport; this is not a physical-phone hardware test.

- Inspected initial anatomy, duplicate sectional reveal, developing field, directional conduction, and matched reference comparison.
- Sought to 7.5, 14, 21, 25/29, and 34 seconds; observed the correct chapter text and states.
- Started playback near the endpoint and observed `34.00 / 34.00` with the replay state retained.
- Ran the full presentation from 0 to 34 seconds and observed the final hold/replay state; no uncaught application errors were returned in the browser log check for that run. Bundled fonts reported loaded.
- Operated temperature/flux/isotherm layer controls, still-camera inspection, and mute; observed the matching control state.
- Attempted fullscreen: this browser context rejected it; the player announced the unsupported state without an uncaught exception. No successful fullscreen test is claimed.
- Checked desktop horizontal overflow: none at the tested viewport.
- Opened the generated standalone HTML in the browser, sought within it, toggled low power, and verified the Right-arrow shortcut moved the timeline from 21.00 to 22.00 seconds. Its uncaught-error log check was empty.
- Checked standalone packaging: no external script tags or stylesheet links, ten embedded font URLs, and a successful Node syntax check of the embedded module. This is a packaging check, not a disconnected-network browser test.
- Inspected the mobile stack, persistent player, and matched comparison. Enlarged cramped mobile annotations and moved the playback controls into a persistent bottom bar with a shared legend.
- Checked the primary scene palette, copper/polymer separation, temperature legend, separate gold arrows/white contours, readable hierarchy, and labeled comparisons against the supplied written brief. This is a code-native scientific experience; no raster design mockup was used as an implementation source.

## Important verification limits

**The test browser has WebGL disabled.** Three.js reported context-creation errors, caught by the application. Browser visual and interaction checks exercised the projected software renderer. Native Three.js/PBR rendering compiled successfully but could not be browser-rendered in this environment. It still needs a smoke test in a WebGL-capable desktop/mobile browser. No native-rendering success is claimed.

No physical phone, Safari, assistive-technology session, or offline network-disconnection session was tested. Public deployment and HTTP checks are recorded below; the public-page browser check did not complete. Fullscreen and audio device behavior depend on the user's browser. Procedural audio generation/lifecycle were checked, but the soundtrack was not acoustically auditioned in this environment.

These checks validate program behavior and local vector/contour consistency. They do **not** validate a heat-equation solution, energy balance, contact/interface continuity, mesh/timestep convergence, fabrication feasibility, or any experimental thermal-cloaking performance. Those claims are deliberately absent from the product.

## Publication status

The user approved publication to the public [mizcausevic-dev/thermal-cloak-field-study](https://github.com/mizcausevic-dev/thermal-cloak-field-study) repository on `main`, GitHub Pages deployment, Dependabot, topics, and branch protection. The repository's initial README and MIT license were inspected and preserved before source upload. Local tests and production build passed again before the upload.

- Source commit: `6c9d37a259f8fb774db2d5b0494533f7a87eacf1`, uploaded as a normal fast-forward update.
- [Pages workflow run 39467954148](https://github.com/mizcausevic-dev/thermal-cloak-field-study/actions/runs/39467954148), attempt 2: **successful build and deployment**. The first deployment attempt failed because Pages was not yet enabled. Pages was configured for GitHub Actions and the failed job was rerun successfully.
- Public URL: https://mizcausevic-dev.github.io/thermal-cloak-field-study/
- HTTP checks: public `index.html`, JavaScript, stylesheet, favicon, and bundled font files returned **200** and matched the corresponding local production build byte for byte.
- Repository description, homepage, five topics, and MIT licensing were verified. Dependabot alerts, security updates, grouped security updates, and version-update configuration are enabled.
- Active ruleset [Protect main](https://github.com/mizcausevic-dev/thermal-cloak-field-study/rules/25492780) targets `refs/heads/main`, blocks deletion and non-fast-forward updates, and has no bypass actors. Rules were read back through the repository API; no destructive test was attempted.
- Connected Chrome successfully displayed the published repository and its successful Pages deployment. Attempts to inspect the public app through browser automation timed out or lost tab-session ownership. No successful public-page browser interaction or native WebGL visual check is claimed.

See `DEPLOY.md` for maintenance. Build success, deployment success, HTTP availability, and public browser verification are separate statuses.
