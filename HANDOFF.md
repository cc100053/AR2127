# item2127 — Agent handoff

Updated: 2026-09-08 · Workspace: `/Users/fatboy/item2127`

## Current handoff — read this first

The user authorized continued implementation, chose **a few everyday-object classes** rather than arbitrary food/toy evolution, and chose **offline-first operation**. No physical hardware exists for this exploration. All runtime assets are local; no model or cloud API was added.

- `studies.html?lab=1`: compare original / bottle-specific segmentation / editable generic segmentation. Configurable colour tolerance, opt-in enclosed-region removal, optional bottle-shadow trim, eight-step undo, reset, drag/drop, transparent PNG and grayscale-mask export. Working/export resolution is capped at 1200px on the longest side. Existing input alpha is preserved.
- Edited masks can feed the existing tea-bottle or steel-flask renderer directly. Unsupported geometry keeps the editor available. Editing or replacing the mask hides stale evolution results. Recipe selection also updates the narrative.
- `phone.html` and `studies.html?object=suica`: upload a photo, mark four corners by pointer or coordinates, apply the existing artwork, or restore the original fixture. `calibration.js` shares the phone's projective map and inverse, alpha-aware resampling, validation and UI. `calibration.css` styles the shared controls.
- `segmentation.js`: shared segmentation and mask geometry. Local convex-outline corner proposals work on the card fixture; the phone fixture and banana are rejected rather than weakening the quadrilateral fit check. Proposals require human inspection and do not recognize object identity.
- Validation: **117 page self-checks**, plus the real UI workflow in `tests/browser.cjs`. See `tests/README.md` for prerequisites and invocation. Latest evidence: `previews/input-tests/workflow-results.json`, calibrated phone/card screenshots, mask exports and bottle bridge screenshots.
- Evidence limits: calibration was tested with translated/padded original fixtures, not a new physical phone/card. Glass bright regions are incorrectly removed by aggressive colour-keying. This is reusable local preparation and authored evolution, not arbitrary-object generation or exhibition validation.

Next work should improve robustness within these four authored directions using additional in-class photos. Keep manual correction and explicit rejection until automated geometry is supported by evidence. Camera capture, printing, exhibition cycling and second-view capture remain unimplemented or unvalidated; do not revive rotation work before the still-image flow is ready.

## Historical planning context (2026-09-06)

The sections below preserve the earlier handoff and proposed roadmap. Their counts, file inventory, implementation status and authorization statements describe that earlier date; the current summary above and `memory-bank/20-status.md` supersede them. They are not instructions to repeat completed work or seek authorization already given by the user.

## 1. The goal and the current gap

Turn a present-day object into a beautiful, imaginative interpretation of **that same object's form in 2127**, generated during an exhibition interaction. The user wants something that feels like a future model; actual 3D is optional. Recognition and surprise both matter.

The original complaint was twofold: attachments seemed to drift independently of the rotating object, and the result felt like effects around an unchanged object. The user agreed to develop the appearance with still photographs before adding camera and rotation. Camera and turntable hardware were not ready during this work.

**Today there are three runnable, manually authored, photo-calibrated 2.5D concepts. There is no pipeline that accepts an arbitrary new image and invents/constructs its future form.** Local canvas rendering is real; automatic understanding, general placement, semantic generation, and rotation consistency are not implemented or proved by these concepts.

The next useful milestone is a small complete path:

> A new photograph in one supported object class → segmentation and anchors → one parameterized physical evolution → original/future comparison → measured processing time and visual review.

A clearly labeled manual calibration UI can be an intermediate step. It is **not** evidence of automatic arbitrary-image generation. Do not jump from three hand-authored examples to a universal scene framework.

## 2. Confirmed decisions versus proposed work

### User-confirmed direction

- Forward evolution by a century. Never switch the story to future archaeologists interpreting an ancient object. Read `CLAUDE.md` and `memory-bank/00-intent.md` for the established wording constraints.
- Changing a screen texture, adding neon outlines, or surrounding an unchanged body with HUD elements is insufficient.
- The second phone concept's imaginative principle was explicitly approved: remove and add physical structures, change the silhouette, preserve recognizable lineage, and connect additions to the object.
- The user authorized using their phone photograph, then supplied the bottle and Suica photographs and authorized those two further static studies.
- The user requested that the coordinating agent handle planning/decisions and delegate execution/coding to sub-agents. Keep a single integration owner; give implementers bounded tasks.
- **Capture direction changed on 2026-09-06 (tentative, no hardware exists yet).** The motorised turntable is dropped in favour of a **photo box with one fixed front camera**, staying 2.5D. The goal is explicitly **not 360 degrees**: it is a front-to-oblique **elevation transition**. A second camera at roughly **45 degrees** (not 90-degree top-down) is contemplated but not built. Backdrop is to be **mid-grey, matte, seamless** — white is ruled out by measurement, not preference, and green conflicts with object identity (trap 1). Photogrammetry, structured light and radiance fields are ruled out because this project's object mix (featureless steel, glossy phone, transparent bottle, thin card) is precisely their failure set. Full reasoning and the superseded turntable decisions are in `memory-bank/30-decisions.md`, section 擷取硬件方向.

### What was not established

- The exact three-petal phone, cultivation bottle, and cuff are **examples**, not universal templates every object should receive.
- The coordinating agent reviewed the bottle/cuff visuals as acceptable for this iteration. Do not report that the user explicitly endorsed their final aesthetic quality; that feedback is not recorded.
- The event's exact “real-time generation” rules, accepted use of templates/models, deadline, machine specs, latency budget, network constraints, camera model, turntable feedback, and budget are unconfirmed.
- No provider/API key availability was established. Gemini appears in old plans, not in a working backend.
- The roadmap below is a recommendation for future authorized work. It is not a command to build everything now.

### Creative acceptance criteria to preserve

A reviewer should be able to hide all titles/specifications and still see meaningful structural evolution. Keep some distinctive feature of the input; let the original function inform the future design; give new components visible roots, hinges, plumbing, or shared structural support. Removed regions must actually disappear in the final composite, including their opacity. Open negative space must show the background.

Do not demand that every successful evolution get larger. The cuff is new structure with a large opening even though its projected footprint fits inside the old card rectangle. Numeric area thresholds are example-specific checks, not an aesthetic scoring system.

## 3. What is in the working tree

This work is uncommitted. At this handoff's initial inspection, `README.md`, `index.html`, and two memory files were modified; `phone.html`, `studies.html`, `assets/`, and `previews/` were untracked. Ordinary `git diff` does not include untracked file contents. Preserve these files; do not reset or clean the working tree.

There is no `.codegraph/` directory in the inspected root, so CodeGraph was skipped. If a later checkout has one, follow the user's instruction to consult CodeGraph before code-location searches. Otherwise use `rg` and inspect the actual functions below; line numbers drift.

| Existing file | Purpose and relevant entry points |
|---|---|
| `index.html` | Original rotating-video/camera prototype. `CFG`, `fitTracker`, `analyze`, `track`, `radialContour`, `projectFuture`, `buildHull`, `bodyPoint`, `layoutParts`, `RING` helpers, `loop`, `boot`, `selfTest`. Recent change is only the link to `phone.html`; video implementation was preserved. |
| `phone.html` | Approved-direction static phone. `project(quad)` computes a planar homography; `path` maps `(u,v,z)` with artist-set screen-height offsets; `polygon`/`trace` draw parts; `makeFuture` creates the future canvas; `draw` crossfades; `evolve` replays; `selfTest` validates the fixture. |
| `studies.html` | Two static studies selected by `?object=bottle` or `?object=suica`; unknown/missing value currently defaults to bottle. `build` prepares the source and chooses `bottle()`/`cuff()`. `shape`, `line`, `oval`, `grad`, `tube` are small drawing helpers. `draw`, `evolve`, `selfTest` supply shared behavior. |
| `assets/phone-source.jpg` | User's 728×485 phone photo, copied from `white-smartphone-thin-galaxy-s5-wallpaper-preview.jpg`. |
| `assets/bottle-source.webp` | User's 1280×1280 tea-bottle photo. |
| `assets/suica-source.jpg` | User's 1280×961 card photo. |
| `previews/phone-future.png` | Saved screenshot of second phone concept; useful visual reference. |
| `previews/bottle-future.png`, `previews/suica-future.png` | Saved screenshots of the new studies. |
| `demo.mp4` | Existing green-screen rotating-basketball source. |
| `README.md`, `memory-bank/` | Planning/history with recent corrections at the top. Older sections contain assumptions/overclaims: see below before following them. |

No `package.json`, `.env.example`, `server.js`, or `server.ts` was found. No application backend exists in this checkout. Historical `npm run dev`, `npm run calibrate`, and `npm run soak` commands are plans, **not runnable scripts**.

### Phone behavior and limits

- Keeps the photographed lower grip and home button; removes the upper rectangular slab/screen; adds an exposed spine, three attached ceramic petals, and a tip sensor.
- The four plane corners, screen cutout, component geometry, and height offsets are authored specifically for this photograph. The `z` value in `path()` is an artistic vertical projection offset, not reconstructed metric depth or a camera model.
- Near-white border-connected pixels are removed at source preparation. The enclosed white phone remains. Remaining source JPEG edge artifacts are visible at large scale.
- `draw()` scales both source and future around the same center by `.84`; all tests touching final canvas pixels must account for that transform.
- Two 1456×970 canvases store source/future in a 728×485 logical coordinate space. Responsive CSS scales the view, not the underlying object coordinates.

### Bottle behavior and limits

- Keeps the actual cap/mouth and amber lower reservoir. Large label/body regions are gone; a narrower translucent-looking amber chamber, cultivation membrane, connected filter pods, plumbing, and ribs replace them.
- `build()` uses border-connected near-white removal on the 1280×1280 image and a fixed scale/translation. `bottle()` uses explicitly authored screen-space geometry and source-region clips.
- The chamber's transparency, material, and plant-like interior are procedural artwork. This is not a fluid, optical, biological, or physically validated device simulation.

### Suica behavior and limits

- Replaces the rectangular slab with an open ceramic/jade cuff, layered band, connected contactless terminal, and a smaller face retaining a crop of the photographed penguin/green design.
- `build()` crops the card from `(155,190,938,588)` into a rounded source rectangle. `cuff()` separately crops the recognizable face and draws layered curved paths for depth/occlusion.
- This is authored crop calibration, not automatic card segmentation. No OCR or credential data is sent anywhere or transcribed into the page. Do not infer that this example establishes a privacy pipeline for actual personal transit cards.

### Shared static interaction

Source load → prepare/crop source → draw one future canvas → enable controls → show an approximately **1.8-second crossfade**. The slider compares the two images; replay repeats the reveal. At 100%, original alpha is zero except source material explicitly retained within the future canvas. At 0%, the user sees the prepared original image.

The animation is a reveal, **not physical unfolding**, inference latency, reconstruction, or a fresh design per replay. It stops requesting animation frames on completion. Reduced-motion support is implemented. Neither static page records a repeated still into `RING`, rotates attachments, invokes a model, or uses the legacy seven-state loop.

### Legacy implementation is still a prototype

`MOCK_DB` contains canned object names, descriptions, themes, and modules. `mockScan()` cycles through them after `2000 + Math.random()*4000` milliseconds. That delay is artificial, not measured Gemini performance or visual understanding.

A code comment suggests `/api/scan`; older docs propose `/api/project`. Neither exists. Pick one real contract only when implementing the backend; do not wire code to an assumed existing endpoint.

## 4. Launching the previews safely

Use HTTP. `file://` can taint canvas image reads. The original repository-root `python3 -m http.server` advice is too broad for this working tree: it contains `firebase-debug.log` and may acquire other private files. A previous broad-server escalation was rejected for potential exposure of authentication-related metadata. Do not inspect or serve that log just to test the artwork.

The implementation session used `/tmp/item2127-preview.py` on `127.0.0.1:8128`. That helper is **ephemeral and not committed**. The most recent server session was `10453`, but session IDs/processes may not survive handoff. Check the URL before starting another server. Do not kill an unknown process merely because the port is occupied; use a different local port if necessary.

The following is a reproducible, allowlisted replacement. It serves only the three HTML pages, three source images, and existing demo video. It does not expose documentation, previews, directory listings, logs, environment files, or arbitrary paths. Run from the project root in a terminal; stop with Ctrl-C. In a sandbox, requesting permission to bind a loopback listener may be necessary.

```bash
cd /Users/fatboy/item2127
python3 - <<'PY'
import http.server
import socketserver
from pathlib import Path
from urllib.parse import urlsplit

root = Path.cwd()
port = 8128
routes = {
    '/': ('phone.html', 'text/html; charset=utf-8'),
    '/phone.html': ('phone.html', 'text/html; charset=utf-8'),
    '/studies.html': ('studies.html', 'text/html; charset=utf-8'),
    '/index.html': ('index.html', 'text/html; charset=utf-8'),
    '/assets/phone-source.jpg': ('assets/phone-source.jpg', 'image/jpeg'),
    '/assets/bottle-source.webp': ('assets/bottle-source.webp', 'image/webp'),
    '/assets/suica-source.jpg': ('assets/suica-source.jpg', 'image/jpeg'),
    '/demo.mp4': ('demo.mp4', 'video/mp4'),
}

class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        entry = routes.get(urlsplit(self.path).path)
        if entry is None:
            self.send_error(404)
            return
        try:
            body = (root / entry[0]).read_bytes()
        except OSError:
            self.send_error(404)
            return
        self.send_response(200)
        self.send_header('Content-Type', entry[1])
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)

# HTTPServer.server_bind performs reverse DNS via getfqdn; that hung here.
# Preserve TCP binding without reverse DNS for this local preview helper.
class Server(http.server.ThreadingHTTPServer):
    server_bind = socketserver.TCPServer.server_bind
    server_name = 'localhost'
    server_port = port

Server(('127.0.0.1', port), Handler).serve_forever()
PY
```

This is a preview helper, not a production server; it reads allowed files into memory and has no video range-request implementation. Add only exact required static routes if authorized work adds assets. Do not turn it into a wildcard project file server. A 404 for `/favicon.ico` is expected.

| View | URL on the helper above |
|---|---|
| Phone | `http://127.0.0.1:8128/phone.html` |
| Bottle | `http://127.0.0.1:8128/studies.html?object=bottle` |
| Suica | `http://127.0.0.1:8128/studies.html?object=suica` |
| Legacy video | `http://127.0.0.1:8128/index.html` |
| Legacy camera | `http://127.0.0.1:8128/index.html?cam=1` — existing path, not validated against exhibition hardware |
| Legacy synthetic source | `http://127.0.0.1:8128/index.html?synth=1` |

The legacy page also supports `?src=...` and video drag/drop. The safe helper intentionally cannot serve an arbitrary new filename until explicitly allowlisted. Its `/` route points to phone, so use **`/index.html?test=1`**, not `/?test=1`, for legacy tests.

Use `open_in_codex` from the user-facing coordinating task to show a preview. Calling it from a child agent previously queued the tab in the child context. Screenshots/previews are local files; no deployment has occurred.

## 5. Validation baseline and its limits

### Evidence already obtained

The last implementation QA ran headless Chrome via a temporary Playwright script against the loopback helper. It reported:

| Test route | Executed checks | Last result |
|---|---:|---|
| `/index.html?test=1` | 67 | All passed |
| `/phone.html?test=1` | 9 | All passed |
| `/studies.html?object=bottle&test=1` | 7 | All passed |
| `/studies.html?object=suica&test=1` | 7 | All passed |
| **Total** | **90** | **All passed** |

Original-only and future-only views, slider interaction, replay, desktop 1440×960, and mobile 390px were exercised. No browser `pageerror` or horizontal overflow was reported. The coordinating agent inspected future screenshots. Reduced-motion code exists, but the recorded QA did not separately emulate that preference; do not count it as browser-tested without doing so.

For this **documentation-only handoff**, actual test definitions, file inventory, and the Git diff were inspected; the browser suite was **not rerun**. Static counting confirms 67 `T(...)` sites in legacy, 9 `check(...)` sites in phone, and 8 check sites in studies with one mutually exclusive bottle/Suica branch, hence 7 executed per study. The saved previews are from implementation QA, not fresh output from this documentation turn.

### How to rerun without a new test framework

1. Open each test URL above over HTTP and confirm every displayed line starts with `PASS`. Legacy replaces the body with its report; static pages display `#checks` after loading.
2. Check source at slider 0, future at 100, and replay after interrupting with the slider. Preserve the transparent holes at completion.
3. Inspect desktop/mobile screenshots and page errors. Hide `#checks` for final artwork screenshots, not to hide failures.
4. If modifying source loading/replay, also exercise failed image load, reduced motion, and repeated source changes. Release old object URLs/streams if introduced.
5. Run `git diff --check` and inspect untracked files as well as tracked diffs. Update test counts only after observing actual results.

There is no committed automation runner. `/tmp/studies-qa.cjs` and `/tmp/item2127-qa.cjs` were session-only harnesses. Their original output printed test text; it did not automatically assert every `PASS`, so the agent inspected the output. If recreating automation, fail on any `FAIL` line or page error rather than trusting exit code alone.

The Codex runtime supplied Playwright through `load_workspace_dependencies` for that historical run. **Next agents must use the browser tools currently permitted in their session (CUA in this context) and obey their tool restrictions; do not blindly execute the old Playwright harnesses.** Runtime paths may change. The historical headless Chrome run needed sandbox escalation with a temporary empty profile; this is evidence of the previous test setup, not permission to bypass current restrictions. Do not attach to or export a personal browser profile for these tests.

### What the checks prove

They protect specific fixture dimensions, projective corner math, alpha removal, some retained source pixels, added geometry/negative space, and legacy numerical invariants. The Suica check tests a solid band/credential face and an open gap, rather than forcing growth outside the original card bounds.

They do **not** prove beauty, functional plausibility, arbitrary-image support, a universally connected mesh, true 3D, optical tracking, real rotation phase, frame-rate on an exhibition machine, API latency, or exhibition readiness. Keep visual review separate and mandatory for material geometry changes. Do not loosen checks merely to obtain a green count; change example-specific assertions only when the design legitimately changes and add the property that matters instead.

## 6. Proposed roadmap and independently assignable work

The coordinating/integration agent owns the goal, scope decisions, acceptance, and scheduling. Do not launch all packages at once. After the user's next implementation authorization, start with A and a narrow B/C vertical slice. A research/testing task can run beside a code owner; two agents should not edit `studies.html` simultaneously.

### A — Establish the real-time contract and one supported input class

**Dependencies:** none. **Suggested owner/files:** coordinator; findings in this handoff or `memory-bank/30-decisions.md`, status in `memory-bank/20-status.md`.

Obtain the actual event rule text if available. Distinguish on-demand local procedural rendering, model-assisted recipe generation, image generation, camera tracking, and live rotation. Determine what is required and what counts as pre-authored content. Ask for target hardware/network and any deadline only where it changes the next step.

Until clarified, a reasonable **development assumption** is a single opaque, compact object on a controlled plain background, fixed viewpoint, local still-image processing, and explicit unsupported-input feedback. An upright capped bottle is a candidate first class because neck/body/base give useful anchors; it is not a confirmed scope decision.

**Deliverable:** a short requirement table marking confirmed versus assumed: allowed inputs/background, need for automatic placement, allowed assistance/templates, what starts/ends the “generation” timer, and an agreed latency target. Do not invent a “2 seconds” or “60 fps” requirement. Measure decode, segmentation, anchor extraction, recipe creation, render-ready time, and reveal separately; choose budgets from evidence and event rules.

**Gate:** a reviewer can tell whether the proposed vertical slice meets the known rules and what remains unknown. Missing hardware should not block still-image work; unknown cloud permission/key availability should block only dependent provider calls.

### B — Make one evolution an explicit, bounded recipe

**Dependencies:** A's initial input choice; can start from a deterministic local recipe without a model. **Suggested owner/files:** one renderer owner in `studies.html`; preserve `phone.html` artwork. Coordinate test edits with the same owner.

Separate the few parameters that must vary from fixed rendering details for one supported class. The recipe needs object identity/function, what remains recognizable, removed regions, added components, their attachment points, materials, and intended structural change. Anchors should come from normalized object coordinates or named features, not the filename or absolute coordinates of the fixture photograph.

Example conceptual fields—not an existing schema and not a required serialization format:

- `identity` / `function`: drinking vessel, transport credential, etc.; user-selected is acceptable before semantic automation exists.
- `kept`: recognizable source regions plus the human continuity of its function.
- `removed`: defined regions/material that disappear from the final source layer.
- `added`: a small supported set of components, each with a named attachment and dimensions relative to the object.
- `materials` / `seed`: bounded renderer choices and deterministic variation, when variation is actually needed.

Use ordinary objects and the helpers already present. Do not build a universal scene DSL, component registry, plugin architecture, or full graph editor. If a proposed component cannot be drawn coherently by the current renderer, reject it or use a declared fallback rather than silently creating an unrelated plate. The exact petal/pod/cuff artwork is not the universal target.

**Deliverable:** one existing concept driven by a small explicit recipe and measured object anchors; a runnable check for valid attachments/ranges and rejection of unsupported data.

**Gate:** changing a relevant recipe field predictably changes geometry; replay stays deterministic; output preserves lineage and connected physical structure with text hidden. Existing approved phone remains visually intact. No claim of general generation yet.

### C — New-photo input, segmentation, and anchors: the first complete slice

**Dependencies:** initial A scope and B's minimal renderer contract. **Suggested owner/files:** the renderer owner integrates in `studies.html`; a second agent may independently characterize segmentation on new input samples and report masks/anchors without editing that file.

Accept a new local file without changing JavaScript source. Constrain image size/type, handle decode failure, preserve source alpha, and establish one mapping from source pixels through normalized object coordinates into display space. For the initial supported class, derive silhouette/bounds and required anchors from the actual input; keep an explicit confidence/failure route.

Start with at least one genuinely new photograph not used to tune per-photo constants. Prefer a second scale/position/background-lighting case and one unsupported/poor mask example. Do not acquire arbitrary external imagery or upload user images without the relevant authorization.

There are two distinct deliverable levels:

1. **Intermediate calibration UI:** user can mark required corners/neck/base or correct a mask; no developer edits or hardcoded filename cases. Label the result “calibrated.” This proves reuse, not automatic generation.
2. **Constrained automatic placement:** new image in the supported class yields usable anchors without manual coordinate entry; unsupported cases clearly fail. This is the first automatic success gate, still not arbitrary-object support.

**Deliverable:** new image → source preparation → anchors → recipe → render → comparison/replay, plus measurements for each stage. Keep original fixtures available for regression.

**Gate:** recognizable input survives; removed alpha is actually removed; attachments share the object's mapping; output doesn't clip on mobile/desktop; input changes do not retain stale anchors/canvases. A novel in-class image works at the claimed level. Report unsupported classes and assisted steps honestly. Add one meaningful regression check around the new logic and visually review the outcome.

### D — Optional semantic/model service, only when needed by the contract

**Dependencies:** A's rule/provider decision and B's validated bounded contract. It is not needed to demonstrate the initial local parameterized renderer. **Suggested owner/files:** separate backend owner; there is no current backend file to claim. Agree the minimal server file and interface with the integrator before creation. The renderer owner alone edits front-end integration.

Decide whether a model adds object identity, future function, a bounded recipe, or a new image. These are different problems with different latency/consistency requirements. The older categorical bans on image generation or Three.js were based on the former live-tracking assumptions; they are not permanent constraints, nor are they reasons to add either now.

If using a provider, confirm provider/model access, image-upload permission and budget. Keep secrets on the server, outside served assets and logs. Validate responses at the boundary: accepted component/material enums, finite bounded numbers, existing attachment IDs, no executable code/HTML. Resolve `/api/scan` versus `/api/project` into one actual documented contract. One request per intended generation; ignore stale responses after input changes, handle timeouts/retries without duplicate output, and show a clear local fallback.

**Gate:** the real call is demonstrated and timed separately from reveal; malformed/unsupported responses and network failure leave a usable interface; no secrets enter front-end source or browser responses. Keep a local deterministic path. Do not describe mockScan's random delay as model performance.

### E — Camera single-frame capture

**2026-09-06:** this package is now the main hardware path, not an optional add-on, since the turntable is dropped. One fixed front camera in a photo box feeds exactly one frame into the still-image pipeline. The `?cam=1` legacy branch remains untested reference code.

**Dependencies:** C's working still-image path; D only if chosen. **Suggested owner/files:** camera/input owner coordinates with the `studies.html` integration owner; `index.html` camera helpers are reference code, not a mandate to merge pipelines.

Add permission, preview, capture, retake, and release-stream handling. Feed exactly one captured frame into the same tested still-image pipeline. Show the user when an unsupported background/mask needs correction. Keep file input for repeatable tests and for unavailable cameras.

**Gate:** permission denied/unavailable camera does not break file mode; capture orientation/aspect ratio is correct; replacing a frame resets old results; the frozen image and attached geometry remain aligned. Test on actual camera hardware when available. Do not call an untested legacy `?cam=1` branch evidence of exhibition readiness.

### F — Optional rotation and consistent viewpoints

**2026-09-06: deferred, not cancelled.** The user chose a fixed-camera photo box over a turntable, so nothing here is scheduled. What replaces it is a far smaller idea: parameterise elevation in the existing procedural artwork so the drawn 2127 parts re-project as the viewpoint rises (`flask()` already encodes elevation as the `r*.085` ellipse factor), and optionally cross-fade the photographed kept regions to a second camera's view. That is an approximation for effect, **not** a reconstruction, and must never be described as 3D. Everything below stays valid if rotation is ever revived — read it before reinventing it.

**Dependencies:** successful still-image pipeline and an explicit requirement for rotation; hardware/known-angle test data as appropriate. **Suggested owner/files:** dedicated geometry/video owner, eventually `index.html` and its geometry functions if reusing that path; schedule separately from unrelated edits to the same file.

Choose what rotates: real object under live augmentation, a captured playback sequence, or a rendered proxy. Define one stable object structure and coordinate system across views before adding ornate surfaces. Use verified angle signals, markers/features, or another evidence-based pose method. A frame index alone does not provide physical angle.

**First gate:** one small anchor remains on the same visible surface feature through known-angle motion, disappears correctly behind the object, and returns without a jump. Include a textured rotationally symmetric object; a round silhouette should not be accepted as proof of correct phase. Only then carry the full creative geometry/materials across views.

If a true 3D renderer becomes the smallest reliable solution for view-consistent geometry, depth and lighting, evaluate it then. Never “fix” a still by adding repeated frames to `RING` while rotating only its attachments.

### G — Exhibition operation and physical output

**Dependencies:** the core generated visual pipeline works at the promised input/latency level. **Suggested owner/files:** reliability/hardware owner; actual integration files depend on the chosen backend. Keep initial work separate from static art files.

Then implement explicit offline behavior, cache semantics, safe reset/recovery, and repeatable session timing. Evaluate printer interface with the actual device, not assumed Web Serial compatibility; handle script/language printing as needed. Printing a physical prediction is part of the original exhibition intent: treat it as a planned deliverable deferred until the visual pipeline works, unless the user removes it from scope. Pepper's Ghost, sound, lights, and rarity enhancements remain optional/deferred unless prioritized.

Privacy is not deferred if images leave the machine: consent, data minimization, no unnecessary OCR/credential transcription, and redacted logging belong at the first such boundary. Broader exhibition handling must also cover faces, personal documents, and people placing unexpected items into view.

**Gate:** an agreed soak test completes on target hardware with no operator rescue, bounded memory, recoverable source/provider/printer failures, and no unintended data retention. Old “50 cycles”/“60 seconds per visitor” notes are historical planning targets to confirm, not results already achieved. Nothing in the current repository is deployment-ready by default.

## 7. Integration and agent coordination

- One integration owner assigns file ownership before any edits. `studies.html` is a dense single file: do not assign its source input, renderer, UI and tests to four simultaneous writers.
- Let a read-only QA/input-analysis agent work independently while the renderer owner implements. Give the QA agent the exact input scope, acceptance gate, URL and current expected checks.
- Keep `phone.html` as the approved art reference; navigation or deliberate bug fixes are acceptable within scope, but do not restyle/rebuild it as collateral work.
- Keep `index.html` and its 67 checks as legacy regression/reference. A new static pipeline need not adopt its state machine or inaccurate physical assumptions.
- Agree data boundaries before splitting backend/front-end work. If a new file becomes useful, name it in the task then; do not pretend proposed files already exist.
- After each vertical slice, integrate, run relevant checks, inspect screenshots, record limitations in memory, and report what was actually measured. Preserve existing uncommitted work. Do not commit or deploy unless requested.
- A successful handoff from an implementer includes changed paths, run commands, exact test results, screenshots/URLs, assumptions, and remaining failures—not just a green test count.

## 8. Technical traps that must not return

1. **Green key is not universal segmentation.** `index.html` removes hue-keyed green. Phone/bottle use border-connected near-white; Suica uses a calibrated crop. Alpha input requires its own preservation path. A green tea label is object identity, not background.
2. **Enclosed white body pixels matter.** Removing all white pixels would also remove white object surfaces; use connectivity/confidence and inspect edges. Mirror/transparent objects remain hard. JPEG halos are not evidence of segmentation generality.
3. **Coordinate spaces must agree.** Original/photo pixels, normalized body coordinates, logical canvas, backing resolution and CSS size are distinct. Do not mix them or bake one display size into inferred anchors.
4. **Source alpha must leave.** Painting new components over an opaque original preserves the removed screen underneath. The static crossfade's final source opacity and transparent target are deliberate.
5. **Stable time does not imply stable pose.** `ringYaw` uses phase/index. Shared playback timing does not prove the object's physical surface rotated that far, at a uniform speed, or through a full turn.
6. **Circular silhouettes have no texture phase.** Basketball seams move while silhouette stays round. `ringSeam`/radial signatures can agree for incorrect orientations. Use real surface evidence.
7. **A tilted screen row is not a physical horizontal cross-section.** The legacy `buildHull` inference and height assumptions do not become a true 3D reconstruction merely by applying `tilt`. Do not call it ground-truth geometry.
8. **Unique frames determine useful temporal detail.** Playback FPS derived from ring length can overstate information if captured frames duplicate a slower source. Background tabs throttle animation/capture; a smooth numerical loop is not proof of new source frames or exhibition frame-rate.
9. **Reset canvas state on repeated input.** Current `build()` functions run once after an image load and call `scale(2,2)`. A reusable loader must clear/reset transforms and old state before subsequent builds; otherwise scale and drawings accumulate.
10. **Artwork/text is not a semantic model.** The static recipes and copy are authored. The mock backend chooses canned entries irrespective of image contents. Be precise about what “generation” means.
11. **HTTP and startup details matter.** Avoid `file://`, broad directory serving, assumed persistent `/tmp` helpers, and reverse-DNS startup hangs. A cache-busting query can help against other servers; this helper sends `no-store`.
12. **Old plans are not universal constraints.** Historic “only bloom justifies Three.js,” “any silhouette works,” “all attachments mathematically locked,” and hardware-first schedules were written for an earlier approach. Preserve intent and inspect evidence, not overclaims. The newer user-approved static structural direction takes precedence where those conflict.

## 9. Smallest first assignment after implementation is authorized

Start with **one supported class and one new photograph**, not all remaining packages. Recommended candidate: an upright opaque capped bottle on a controlled plain background. Keep the present three demos available; reuse the relevant bottle drawing code only to the extent it serves a parameterized transformation.

The first agent should inspect source preparation and `bottle()`, identify the smallest set of neck/base/body anchors needed, and implement a new-photo path plus one bounded recipe. Automatic anchors are the desired gate. If that cannot be reliable yet, a labeled calibration UI is a useful intermediate delivery with the automatic part explicitly unfinished. Finish source comparison, honest failure handling, measurement, and screenshot review before broadening object classes or introducing a provider.

### Copy-paste kickoff prompt

> Work in `/Users/fatboy/item2127`. Read `HANDOFF.md`, `CLAUDE.md`, and the current memory entries; inspect the working tree and do not reset its uncommitted files. If `.codegraph/` exists, consult CodeGraph before searching for code. This task is the next authorized narrow static-input milestone, not the full exhibition build. Preserve the approved `phone.html` artwork and existing video tests. First confirm the initial supported class/background with the coordinator; proposed default is one upright opaque capped bottle on a controlled plain background. Implement a new local photograph → segmentation/anchors → one small parameterized evolution recipe → original/future comparison/replay path. Reuse `studies.html` helpers; coordinate sole ownership of that file. No filename-specific geometry for the new sample, universal scene DSL, new model/provider calls, rotation or broad rewrite. If manual anchor UI is necessary, label it as an intermediate calibrated mode and do not claim automatic arbitrary-image success. Preserve actual input identity, remove old material where intended, attach additions coherently, and handle unsupported/failed inputs clearly. Measure processing stages separately from the existing 1.8-second crossfade. Run relevant checks, preserve the 90-check baseline unless deliberately superseded with documented equivalent coverage, inspect desktop/mobile and original/future screenshots, and report limitations. Return a runnable result, exact commands/results, changed files and preview images to the coordinator for visual acceptance. Do not commit or deploy.

If no new photograph is available, request that specific missing input while inspecting the existing pipeline and planning the anchors; do not silently reuse one of the three calibrated fixtures as proof of novel-input success.
