# Latest workflow evidence — 2026-09-08

`workflow-results.json` is the current passing end-to-end result. Reproduce it with `tests/browser.cjs` (instructions in `tests/README.md`). It covers 117 page self-checks plus editing, undo/reset, actual PNG downloads and alpha round-trip, prepared-mask bottle evolution, calibrated phone/card uploads, baseline restoration and mobile layout.

- `lab-auto-abacus.png`: opt-in enclosed background cleanup.
- `auto-water.png`: known destructive bright-region removal on glass; not a successful transparency reconstruction.
- `toy-cutout.png` / `toy-mask.png`: latest exported transparent image / grayscale alpha mask (the latter supersedes the early toy diagnostic mask).
- `bridge-bottle*.png`: edited-mask-to-authored-evolution flow.
- `reject-reasons.json` / `reject-reason.png`: per-condition rejection messages on the four out-of-class photos.
- `generic-water.png`: an out-of-class photo evolving through the generic silhouette-driven recipe.
- `cup-recipe-mismatch.png`: the cup photo rejected after picking a bottle recipe, naming the recipe that fits.
- `calibrated-phone.png` / `calibrated-card.png`: translated/padded fixture calibration, not different real objects.

Other result files and screenshots below retain earlier experiment history; use the latest workflow result for current status.

---

# Supplied-image trial — 2026-09-07

Tested unchanged `studies.html` through its real file input in headless Chrome with reduced motion. Inputs: `/Users/fatboy/Downloads/{toy.jpeg,starwberry.jpeg,water.jpg,banana.jpeg}`. No new evolution recipes or segmentation changes.

All four decoded, then were rejected by the bottle geometry gate: width / measured height must be between 0.15 and 0.6. Other gate conditions passed. This is not evidence of object recognition or successful segmentation.

| Input | Measured ratio | Mask inspection |
|---|---:|---|
| toy.jpeg | 0.970 | Outer background removed; white gaps between rods remain because row-span refill fills the interior. |
| starwberry.jpeg | 0.913 | Background patch above leaves and bottom shadow survive; measured bounds span full image height. |
| water.jpg | 0.727 | Outer cup outline largely retained, small residue under base; photographed white background remains inside transparent glass. This is an opaque cutout, not recovered transparency. |
| banana.jpeg | 2.044 | White region across the concave upper silhouette is filled by row-span refill. |

Each rejection clears the displayed canvases and disables evolution/replay. Same-page recovery with the original bottle succeeds. No page errors. Existing studies checks: bottle 10/10, bottle-b 12/12, suica 7/7. Legacy index and phone checks were not rerun; code was unchanged.

Evidence: `results.json`, each `*-mask.png` (transparent pixels outside retained mask), and each `*-page.png` (actual rejected UI). No manual ground-truth masks, so no numerical segmentation accuracy claim.

Next: separate generic segmentation from bottle-specific row filling and shadow trimming before supporting concave or open objects; do not merely relax the aspect gate. Each new object also needs an appropriate evolution recipe.
