# Stills group: generated asset manifest

Group: **stills** (raking-light test, atmosphere stills, basement "What we build" tiles, demo samples).
Outputs: `public/images/{raking,atmosphere,basement-tiles,samples}` from `assets-src/stills/raw`.
The `public/images/atmosphere/wall-stage-*` files come from the hero stage stills and are logged in `hero.md` §7.

Brief lines are quoted verbatim from `docs/CAPITAL_BUILD_BRIEF.md` §8.3 and §8.4. The tile and sample
subjects are not in the brief; they follow the file names (the basement page's "What we build" tiles and
the before/after demo samples). Under each brief line is the **exact prompt sent**, taken from the
Higgsfield generation history. Job ids come from `assets-src/stills/work/jobs.log` (written at generation
time) and match the history.

**Honesty (brief §3, §8.4):** every image here is AI-generated. The atmosphere stills are atmosphere, the
raking panels are a concept demo, the tiles are concept rooms, and the samples are demo before/after
pairs. The sample prompts ask for a documentary "jobsite photograph" look, so those files must always be
labelled as samples or illustrations. **None of these images may be captioned or presented as a completed
client project.**

**Seeds:** not exposed by the API; every entry lists the job id. Jobs requested as `nano_banana_pro` are
reported by the API as `nano_banana_2`. All stills: `resolution: "2k"`.

**Billing:** credits only (`use_unlim: false`), no free gens, no preference changes, no projects created.

---

## Credit tally (stills group)

| Item | Model | Jobs charged | Credits each | Credits |
|---|---|---|---|---|
| Atmosphere 16:9 (six subjects + smooth-ceiling v2) | `nano_banana_pro` | 7 | 2 | 14 |
| Atmosphere 16:9 (taping knife, paint roller) | `gpt_image_2_5` | 2 | 2.75 | 5.50 |
| Raking R1-R4 incl. retries | `nano_banana_pro` | 6 (2 refunded) | 2 | 8 |
| Basement tiles | `nano_banana_pro` | 6 | 2 | 12 |
| Tile clean-up edits | `nano_banana_pro` | 7 | 2 | 14 |
| Demo samples (befores, hallway, taping) | `nano_banana_pro` | 6 | 2 | 12 |
| Sample edits (afters, clean-ups) | `nano_banana_pro` | 6 | 2 | 12 |
| **Stills group total** | | **40** | | **77.50** |

Refunds: job `af8ed9e3-9843-42eb-8c01-f148787c1962` (R1, backend failure, +2) and job
`3f214d35-e0fa-4d32-96aa-d6d7d46c9d9f` (R3 first attempt, false-positive NSFW flag, +2).
Rejected submissions with no job and no charge: `gpt_image_2_5` for sanding ceiling, smooth ceiling,
bathroom and kitchen (HTTP 429, smooth ceiling retried twice more), one `flux_3_image` raking attempt (429).

Processing for every output: `scripts/assets/stills-process.mjs` (load raw PNG, optional retouch
of small text, logo or defect patches by Coons-patch inpaint with matched grain or by clone, optional
low-frequency light/colour match to a partner panel, crop, Lanczos resize to the exact size, JPEG mozjpeg q82).
Before/after and flat/raking partners use identical crops so they stay pixel-aligned.

---

## 1. Raking-light test (brief §8.3), 1200x1500

Brief lines (verbatim):
- R1: `a painted white interior wall evenly lit by soft overhead light, looks plain and smooth, photorealistic close-up`
- R2: same wall, `lit by a single low-angle light from the left, revealing visible taped seams, ridges, trowel marks, sanding swirls and two nail pops`
- R3: a second wall, flat-lit like R1
- R4: R3 `lit by a single low-angle light from the left, revealing a perfectly flat, uniform surface with no visible seams or marks`

All four: `nano_banana_pro`, aspect 4:5, raw 1856x2304, cover/centre to 1200x1500.

| Output | Raw | Seed / job id | Reference | Exact prompt | Post-processing |
|---|---|---|---|---|---|
| `public/images/raking/rushed-flat.jpg` (41,964 B) | `raking-r1-flat-nano-v1.png` (R1) | not exposed / job `8536ffbc-f24a-4fa7-af18-cb523f8a304d` (retry of failed `af8ed9e3`) | none | `a painted white interior wall evenly lit by soft overhead light, looks plain and smooth, photorealistic close-up` | none |
| `public/images/raking/rushed-raking.jpg` (211,842 B) | `raking-r2-raking-nano-v1.png` (R2) | not exposed / job `ca0d7b52-21cd-421a-87fc-a8f646a88b47` | R1 (`8536ffbc`) | `same wall, lit by a single low-angle light from the left, revealing visible taped seams, ridges, trowel marks, sanding swirls and two nail pops` | none |
| `public/images/raking/capital-flat.jpg` (18,451 B) | `raking-r3-flat-nano-v1.png` (R3) | not exposed / job `89a6b458-b7ff-4db0-b89e-76141b125425` | R1 (`8536ffbc`) | `a second wall, flat-lit like R1: a painted white interior wall evenly lit by soft overhead light, looks plain and smooth, photorealistic close-up, same framing as the reference image, no marks` | inpaint a faint hairline (878,930)-(940,1390) and a speck cluster (80,1200)-(175,1280); broad light/colour matched to R1 |
| `public/images/raking/capital-raking.jpg` (22,276 B) | `raking-r4-raking-nano-v1.png` (R4) | not exposed / job `27c5f3d9-3deb-49ca-ae29-8662efddc84d` | R2 (`ca0d7b52`) | `same wall, lit by a single low-angle light from the left, revealing a perfectly flat, uniform surface with no visible seams or marks. Remove every seam, ridge, trowel mark, sanding swirl and nail pop; keep exactly the same light, framing and colour.` | inpaint two leftover nail pops (220,1495)-(350,1615) and (840,1480)-(990,1630); broad light/colour matched to R2 |

Method deviations from the brief, recorded honestly: R4 was made as an edit of R2 (same raking light,
defects removed) rather than as R3 relit, so the "Capital" raking panel shares R2's light exactly. The R3
first attempt (job `3f214d35`, prompt `a second wall, flat-lit like this one: the same painted white interior wall with the same framing, evenly lit by the same soft overhead light, looks plain and smooth, photorealistic close-up, with the faint trowel streaks removed`)
was blocked by a false-positive NSFW flag and refunded.

## 2. Atmosphere stills (brief §8.4), 1920x1080 and 1200x1500

All generated at 16:9 (`nano_banana_pro` raw 2752x1536, `gpt_image_2_5` raw 2688x1520). The 16:9 output
is a cover/centre resize unless noted; the 4:5 output is a full-height crop of width `round(height x 0.8)`
starting at the listed x, resized to 1200x1500.

Shared style tail of every atmosphere prompt (exact; the macro shot says `shot on a full-frame camera with a macro lens`,
and the hands shot leaves out `no people, no faces` because hands are in frame):
`editorial architectural photography, cinematic low-key light, warm amber 3200K practical light against cool blue-grey shadow, texture-forward, real materials with honest imperfections, muted restrained colour, natural film grain, shot on a full-frame camera, calm and premium, no people, no faces, no text, no letters, no logos, no watermark`

### Taping knife
Brief: `Macro: taping knife spreading joint compound over a seam, warm light`
Exact prompt: `Macro: taping knife spreading joint compound over a seam, warm light. Extreme close-up at a low grazing angle along a drywall wall: the polished steel blade of a wide taping knife drawing a thin, creamy layer of off-white joint compound across a paper-taped seam, a soft bead of wet compound gathering at the blade edge, only the blade and the wall surface in frame, a single warm work light raking in from the left, the wall falling away into cool shadow, very shallow depth of field, editorial architectural photography, cinematic low-key light, warm amber 3200K practical light against cool blue-grey shadow, texture-forward, real materials with honest imperfections, muted restrained colour, natural film grain, shot on a full-frame camera with a macro lens, calm and premium, no people, no faces, no text, no letters, no logos, no watermark`
- Kept: `atm-taping-knife-16x9-gpt-v1.png`, `gpt_image_2_5`, seed not exposed / job `37a633c6-0bc6-4412-9b1a-aabcfd79495e`
- Outputs: `public/images/atmosphere/taping-knife-16x9.jpg` (126,709 B), `public/images/atmosphere/taping-knife-4x5.jpg` (163,370 B, crop x=620)
- Not kept: `atm-taping-knife-16x9-nano-v1.png`, `nano_banana_pro`, job `46c78692-b302-46d2-9982-29c6c8ea8536` (same prompt)

### Sanding ceiling
Brief: `Sanding pole with a dust-extraction hose against a smooth ceiling`
Exact prompt: `Sanding pole with a dust-extraction hose against a smooth ceiling. Upward view in a dim, empty room: the rectangular head of a drywall pole sander pressed flat against a freshly skimmed, smooth white ceiling, a ribbed grey dust-extraction hose clipped to the sanding head and curving down out of frame, the pole running diagonally down out of frame, a faint haze of fine dust hanging in a single warm work light that grazes across the ceiling from a low angle, the far corner of the ceiling falling into cool shadow, editorial architectural photography, cinematic low-key light, warm amber 3200K practical light against cool blue-grey shadow, texture-forward, real materials with honest imperfections, muted restrained colour, natural film grain, shot on a full-frame camera, calm and premium, no people, no faces, no text, no letters, no logos, no watermark`
- Kept: `atm-sanding-ceiling-16x9-nano-v1.png`, `nano_banana_pro`, seed not exposed / job `abf34cad-ebe3-4442-8b65-55579dd5125b`
- Outputs: `public/images/atmosphere/sanding-ceiling-16x9.jpg` (81,461 B), `public/images/atmosphere/sanding-ceiling-4x5.jpg` (137,597 B, crop x=950)

### Paint roller (hands only)
Brief: `Hands rolling warm-white paint on a smooth wall (hands only)`
Exact prompt: `Hands rolling warm-white paint on a smooth wall (hands only). Close side view along the wall: a hand gripping a paint roller, rolling a fresh band of warm-white paint over a smooth primed wall, the wet satin edge where new paint meets dry wall, a few tiny paint flecks on the knuckles, warm light raking across the wall from the left, the background in soft cool shadow, hands only, no face, nothing of the body beyond the forearm, editorial architectural photography, cinematic low-key light, warm amber 3200K practical light against cool blue-grey shadow, texture-forward, real materials with honest imperfections, muted restrained colour, natural film grain, shot on a full-frame camera, calm and premium, no text, no letters, no logos, no watermark`
- Kept: `atm-paint-roller-16x9-gpt-v1.png`, `gpt_image_2_5`, seed not exposed / job `025cbfee-2876-444c-b53c-ef319a49dfb4`
- Outputs: `public/images/atmosphere/paint-roller-16x9.jpg` (101,250 B), `public/images/atmosphere/paint-roller-4x5.jpg` (110,429 B, crop x=820)
- Not kept: `atm-paint-roller-16x9-nano-v1.png`, `nano_banana_pro`, job `542990dd-b0d5-44f0-b1d6-9dedeed4e058` (same prompt)

### Smooth flat ceiling with pot lights (popcorn-removal section)
Brief: `Smooth flat ceiling with pot lights (popcorn-removal section)`
Exact prompt (v2, kept): `Smooth flat ceiling with pot lights. A modest living room in an Ottawa suburban home at dusk, camera low and tilted up so the flat horizontal ceiling fills the top two-thirds of the frame: a perfectly smooth, flat, matte white drywall ceiling with a neat row of slim recessed LED pot lights glowing warm, a soft band of window light grazing across the ceiling plane and showing no ridges, seams or texture, a crisp clean line where the ceiling meets a plain painted wall, an ordinary wall window below showing snowy blue dusk, cool shadow in the far corner, standard 8-foot ceiling, editorial architectural photography, cinematic low-key light, warm amber 3200K practical light against cool blue-grey shadow, texture-forward, real materials with honest imperfections, muted restrained colour, natural film grain, shot on a full-frame camera, calm and premium, no people, no faces, no text, no letters, no logos, no watermark`
- Kept: `atm-smooth-ceiling-pot-lights-16x9-nano-v2.png`, `nano_banana_pro`, seed not exposed / job `8e17b5be-079f-4fbf-91a7-080ce9943e5a`
- Outputs: `public/images/atmosphere/smooth-ceiling-pot-lights-16x9.jpg` (128,688 B; crop 2468x1388 at (0,110) first, to drop a dark out-of-focus shape at the right edge that could read as a figure), `public/images/atmosphere/smooth-ceiling-pot-lights-4x5.jpg` (134,050 B, crop x=760)
- Not kept: `atm-smooth-ceiling-pot-lights-16x9-nano-v1.png`, job `e972c741-ebb6-446a-bc7d-836afc5837ab`, v1 prompt: `Smooth flat ceiling with pot lights. Low upward view across the living-room ceiling of a modest Ottawa suburban home at dusk: a perfectly smooth, flat, matte white drywall ceiling with a neat grid of slim recessed LED pot lights glowing warm, soft light from a window grazing across the ceiling and revealing no ridges, seams or texture, a crisp clean line where ceiling meets wall, the top of a window showing snowy blue dusk outside, cool shadow in the far corner, standard 8-foot ceiling,` + the shared style tail

### Bathroom
Brief: `Modern bathroom: large-format tile shower, floating vanity`
Exact prompt: `Modern bathroom: large-format tile shower, floating vanity. A modestly sized renovated bathroom in an Ottawa suburban home in the evening: a walk-in shower clad floor to ceiling in large-format matte warm-grey porcelain tiles with tight grout lines, a frameless clear glass panel, a floating white-oak vanity with a simple white basin and a plain brushed-nickel faucet, a mirror reflecting only the tiled wall, a warm sconce glowing beside the mirror, cool blue evening light through a small frosted window, standard 8-foot ceiling, editorial architectural photography, cinematic low-key light, warm amber 3200K practical light against cool blue-grey shadow, texture-forward, real materials with honest imperfections, muted restrained colour, natural film grain, shot on a full-frame camera, calm and premium, no people, no faces, no text, no letters, no logos, no watermark`
- Kept: `atm-bathroom-tile-shower-16x9-nano-v1.png`, `nano_banana_pro`, seed not exposed / job `fdbc84a4-5a11-4825-bb3a-0af409846ae1`
- Outputs: `public/images/atmosphere/bathroom-tile-shower-16x9.jpg` (151,534 B), `public/images/atmosphere/bathroom-tile-shower-4x5.jpg` (165,468 B, crop x=1450)

### Kitchen
Brief: `Updated kitchen: painted shaker cabinets, white tile backsplash`
Exact prompt: `Updated kitchen: painted shaker cabinets, white tile backsplash. A modest updated kitchen in an Ottawa suburban home at dusk: soft putty-grey painted shaker cabinets with simple brass pulls, a white tile backsplash with slightly uneven handmade glaze, a pale quartz counter with a wooden board and a ceramic jug, warm under-cabinet lights washing down the tile, a window over the sink looking onto a snowy backyard fence in blue dusk, standard 8-foot ceiling, lived-in but tidy, editorial architectural photography, cinematic low-key light, warm amber 3200K practical light against cool blue-grey shadow, texture-forward, real materials with honest imperfections, muted restrained colour, natural film grain, shot on a full-frame camera, calm and premium, no people, no faces, no text, no letters, no logos, no watermark`
- Kept: `atm-kitchen-shaker-cabinets-16x9-nano-v1.png`, `nano_banana_pro`, seed not exposed / job `e0179ff8-4394-4c67-825c-b9437c335120`
- Retouch: soap-bottle label with pseudo-text inpainted, (2331,1078)-(2385,1133)
- Outputs: `public/images/atmosphere/kitchen-shaker-cabinets-16x9.jpg` (171,765 B), `public/images/atmosphere/kitchen-shaker-cabinets-4x5.jpg` (169,402 B, crop x=1150)

## 3. Basement "What we build" tiles, 1200x1500

Subjects from the file names: rec room, home office, guest suite, gym/media room, bathroom + wet bar,
basement refresh. Each was generated at 4:5 (raw 1856x2304), then edited (single reference, the previous
version) to remove anything with text, a logo or a face, and finally cover-resized to 1200x1500.

Shared tail of every tile prompt (exact):
`smooth warm-white walls, a flat drywall ceiling with recessed pot lights and a crisp drywall bulkhead boxing in the ductwork, light oak luxury vinyl plank floor, white baseboards and trim, low 8-foot ceiling, calm and premium, real lived-in details, editorial interior photography, natural film grain, no faces, no letters, no logos, no watermark, photorealistic wide-angle 24mm interior photograph of a typical Ottawa suburban house basement, eye-level, identical camera position, soft daylight from small basement windows plus warm practical lights, no people, no text`

| Output | Kept raw | Generation chain (seed not exposed / job ids) | Exact prompts (base + tail; then each edit) | Retouch |
|---|---|---|---|---|
| `public/images/basement-tiles/rec-room.jpg` (129,772 B) | `tile-rec-room-nano-v2-clean.png` | base `32e8f2d9-de10-45c9-a460-80a91da03450` -> edit `e8a65d4e-f052-4968-936f-dcfb8464d1ca` | base: `A finished basement family rec room: a deep low sectional sofa in oatmeal fabric facing a low media console and a wall-mounted TV that is switched off, a wool rug, a woven basket of kids' toys, a floor lamp glowing warm, a small basement window with snow in the window well,` + tail. Edit: `Edit this photo: replace the two framed family photos on the media console with small framed abstract landscape prints with no people, replace every book in the console shelves with plain linen storage boxes and folded blankets, and replace the teddy bear in the basket with plain wooden blocks, so there are no faces, book spines or printed text anywhere. Keep everything else exactly the same: same framing, furniture, light and colour.` | TV bezel mark cloned from 26 px left, 3 px lower, (520,1224)-(546,1242) |
| `public/images/basement-tiles/home-office.jpg` (133,324 B) | `tile-home-office-nano-v2-clean.png` | base `9a62dba9-1667-4941-86a6-3c6013bf24f6` -> edit `1b0d203e-6696-4a82-803a-2b5272bd9a56` | base: `A quiet, bright basement home office: a simple white-oak desk beside a small basement window with snow in the window well, an upholstered desk chair, a closed plain laptop and a ceramic mug, a brass desk lamp glowing warm, a tall leafy plant, a low wooden credenza,` + tail. Edit: `Edit this photo: remove the books from the desk and the stack of books from the floor, put a small ceramic vase and a woven tray on the desk instead, make the closed laptop a plain silver lid with no logo, and fill the slatted credenza with plain storage boxes, so there is no logo or printed text anywhere. Keep everything else exactly the same: same framing, furniture, plant, window, light and colour.` | laptop-lid logo inpainted (436,1368)-(478,1387) |
| `public/images/basement-tiles/guest-suite.jpg` (119,505 B) | `tile-guest-suite-nano-v3-clean.png` | base `ddcaa6e3-1cfc-4c34-9147-a015509f50f6` -> edit `bcc32de8-1d39-4e75-a3b9-e389738f679a` (v2, not kept) -> edit `fe32268c-3aef-4fda-be3e-2dce69bbb549` | base: `A basement guest bedroom with an egress window: a neatly made queen bed with white linen and a wool throw, two bedside lamps glowing warm, a large egress window set into the foundation wall with a deep window well showing snow and daylight above, a small upholstered bench at the foot of the bed,` + tail. Edit 1: `Edit this photo: on the ledge by the window replace the books, the framed card and the labelled candle with a small plain ceramic vase and a plain unlabelled candle, and on the nightstand replace the books with a folded linen cloth, so there is no printed text or picture of people anywhere. Keep everything else exactly the same: same framing, bed, bench, lamps, window, light and colour.` Edit 2: `Edit this photo: remove the two books from the lower shelf of the left nightstand, leaving the shelf empty, so there is no printed text anywhere. Keep everything else exactly the same: same framing, bed, bench, lamps, window, light and colour.` | none |
| `public/images/basement-tiles/gym-media-room.jpg` (137,575 B) | `tile-gym-media-room-nano-v2-clean.png` | base `dc25ad46-bca8-4212-b089-e8904bb57110` -> edit `6e6cbcf7-88d8-428f-ba15-789034d14e0d` | base: `A basement home gym and media room: black rubber gym mats over part of the floor with a plain squat rack, a padded bench and a few plain unmarked dumbbells, a feature wall of vertical oak slat acoustic panels behind a large wall-mounted TV that is switched off, a small basement window high on the wall,` + tail. Edit: `Edit this photo: replace the water bottle with a plain matte black bottle with no logo, and replace the books in the console shelves with plain woven storage baskets, so there is no logo or printed text anywhere. Keep everything else exactly the same: same framing, squat rack, bench, dumbbells, acoustic wall, TV, light and colour.` | TV bezel logo inpainted (1752,1303)-(1781,1315) |
| `public/images/basement-tiles/bathroom-wet-bar.jpg` (114,785 B) | `tile-bathroom-wet-bar-nano-v2-clean.png` | base `aa23103b-e0ee-4e3d-8710-0db7bd2b4d8d` -> edit `03742e58-8ce2-4603-b16b-3cba1fea4f69` | base: `A basement wet bar: a compact wet bar with painted shaker lower cabinets, a small bar sink with a slim faucet, a pale quartz counter, two open oak floating shelves holding plain glassware, warm under-shelf lighting, and beyond it a half-open door to a small tiled basement bathroom,` + tail. Edit: `Edit this photo: remove the three wine bottles from the counter, leaving the wooden board and the towel, and make sure nothing has a printed label or text anywhere, including in the bathroom beyond the door. Keep everything else exactly the same: same framing, cabinets, shelves, glassware, door, light and colour.` | none |
| `public/images/basement-tiles/basement-refresh.jpg` (109,735 B) | `tile-basement-refresh-nano-v2-clean.png` | base `18387c27-3abd-4aa8-b2db-7c6b7678da92` -> edit `e0fcba76-4caa-4831-91d5-01617812fac8` | base: `A bright refreshed basement family room with smooth new drywall and ceiling: freshly finished smooth drywall walls and a flat smooth ceiling with pot lights, a simple sofa and a low console, a carpeted staircase with a white-painted railing, low afternoon daylight from a small basement window grazing across the smooth wall,` + tail. Edit: `Edit this photo: replace the books in the low console with plain woven storage baskets and a few plain ceramic pieces, so there are no book spines or printed text anywhere. Keep everything else exactly the same: same framing, sofa, staircase, framed prints, window, light and colour.` | none |

The `tile-*-nano-v1.png` bases and `tile-guest-suite-nano-v2-clean.png` are the not-kept steps of these chains.

## 4. Demo samples, 1600x1200

Subjects from the file names. Generated at 4:3 (raw 2400x1792), cover/centre resize to 1600x1200. Each
"after" is an edit of its "before" (single reference), so both share the camera and are pixel-aligned.

Shared tail of every base sample prompt (exact; the hallway, hole, ceiling and popcorn shots say
`real lived-in Ottawa suburban home`, the two basement shots `real Ottawa suburban home`; the two
ceiling shots say `straightforward documentary framing` without `eye-level`; the hole and water-damage
shots say `natural daylight from a nearby window`):
`honest jobsite photograph taken by the contractor, natural daylight, real lived-in Ottawa suburban home, straightforward eye-level documentary framing, unretouched, true-to-life colour, slight natural sensor noise, no people, no faces, no text, no letters, no logos, no watermark`

| Output | Raw | Seed / job id | Reference | Exact prompt |
|---|---|---|---|---|
| `public/images/samples/drywall-hole-repair-before.jpg` (154,464 B) | `sample-drywall-hole-repair-before-nano-v1.png` | not exposed / job `1b30c8b8-beac-4c94-8116-14eee096197e` | none | `A doorknob-size hole punched through a painted drywall wall in a hallway, just behind the edge of an open white interior door, ragged broken gypsum edges and torn paper face, a few gypsum crumbs on the white baseboard below, soft greige eggshell paint, honest jobsite photograph taken by the contractor, natural daylight from a nearby window, real lived-in Ottawa suburban home, straightforward eye-level documentary framing, unretouched, true-to-life colour, slight natural sensor noise, no people, no faces, no text, no letters, no logos, no watermark` |
| `public/images/samples/drywall-hole-repair-after.jpg` (114,148 B) | `sample-drywall-hole-repair-after-nano-v1.png` | not exposed / job `da31802a-c459-4b56-ab29-3788073ed5d9` | before (`1b30c8b8`) | `Edit this photo: repair the hole in the wall so it is completely invisible. The drywall is patched, sanded smooth and repainted in exactly the same greige eggshell paint, with no visible patch outline, and the gypsum crumbs are gone from the baseboard and floor. Keep everything else exactly the same: same camera position and framing, same door, baseboard, floor, daylight and colour. No people, no text.` |
| `public/images/samples/water-damaged-ceiling-before.jpg` (99,070 B) | `sample-water-damaged-ceiling-before-nano-v1.png` | not exposed / job `c6fcf027-8aaa-4d25-b32c-02c0820cf38f` | none | `A water-damaged drywall ceiling in a bedroom, looking up toward the corner: a large brown tide-mark stain with darker rings, the drywall sagging in a soft bulge, cracked paint and a split taped joint along the stain, part of the wall and a window frame visible at the edge, honest jobsite photograph taken by the contractor, natural daylight from a nearby window, real lived-in Ottawa suburban home, straightforward documentary framing, unretouched, true-to-life colour, slight natural sensor noise, no people, no faces, no text, no letters, no logos, no watermark` |
| `public/images/samples/water-damaged-ceiling-after.jpg` (59,706 B) | `sample-water-damaged-ceiling-after-nano-v1.png` | not exposed / job `188d545c-081d-4e6c-940a-2b49d133ffd9` | before (`c6fcf027`) | `Edit this photo: the water-damaged ceiling has been professionally repaired. The stained and sagging section is replaced and finished perfectly flat and smooth, freshly painted flat white to match the rest of the ceiling, with no stain, no rings, no cracks and no visible seam. Keep everything else exactly the same: same camera position and framing, same window, curtain, walls, daylight and colour. No people, no text.` |
| `public/images/samples/popcorn-ceiling-before.jpg` (298,878 B) | `sample-popcorn-ceiling-before-nano-v1.png` | not exposed / job `daa4534a-e936-41a4-b251-8bb2eca4adc7` | none | `A dated popcorn stipple ceiling in a 1980s living room, the bumpy texture slightly yellowed with age, an old frosted-glass flush-mount light fixture in the middle, the top of the walls and a window visible, low daylight from the window grazing across the textured ceiling, honest jobsite photograph taken by the contractor, natural daylight, real lived-in Ottawa suburban home, straightforward documentary framing, unretouched, true-to-life colour, slight natural sensor noise, no people, no faces, no text, no letters, no logos, no watermark` |
| `public/images/samples/popcorn-ceiling-after.jpg` (39,305 B) | `sample-popcorn-ceiling-after-nano-v1.png` | not exposed / job `98c6cc53-3ba8-4754-8651-df844a9f2887` | before (`daa4534a`) | `Edit this photo: the popcorn texture has been removed and the ceiling skim-coated perfectly smooth and flat, freshly painted clean flat white, and the old flush-mount light fixture is replaced by four slim recessed LED pot lights. Keep everything else exactly the same: same camera position and framing, same walls, window, curtain rod, daylight and colour. No people, no text.` |
| `public/images/samples/basement-finish-before.jpg` (198,848 B) | `sample-basement-finish-before-nano-v1.png` | not exposed / job `ec690abf-4407-48ab-af5b-94e04f9b077f` | none | `An unfinished basement corner in an Ottawa house: bare poured-concrete foundation walls with form-tie marks, exposed wood floor joists, a metal heating duct and wiring overhead, a bare bulb in a porcelain socket, a cracked concrete floor, a small hopper window with daylight and snow in the window well, honest jobsite photograph taken by the contractor, natural daylight, real Ottawa suburban home, straightforward eye-level documentary framing, unretouched, true-to-life colour, slight natural sensor noise, no people, no faces, no text, no letters, no logos, no watermark` |
| `public/images/samples/basement-finish-after.jpg` (65,319 B) | `sample-basement-finish-after-nano-v2-duct.png` | not exposed / job `d855684c-bc1c-42df-ba82-b593870542c7` (edit 1, not kept) -> job `7373ebb2-9d84-450a-9dbf-f0caf23aa159` (edit 2, kept) | before (`ec690abf`), then edit 1 | Edit 1: `Edit this photo: the same basement corner, now fully finished. Smooth warm-white drywall walls, a flat drywall ceiling with recessed pot lights, a crisp drywall bulkhead boxing in the duct, light oak luxury vinyl plank floor, white baseboards, the same small window now with a clean white drywall return, and the clutter removed. Keep exactly the same camera position, lens and framing, with the window in the same place and the same daylight. No people, no text.` Edit 2: `Edit this photo: enclose the exposed metal duct and the remaining exposed joists in the top right corner inside a smooth, crisp white drywall bulkhead that meets the flat drywall ceiling, so no ducts, joists or wires are visible anywhere. Keep everything else exactly the same: same camera position and framing, walls, window, floor, pot lights, light and colour.` |
| `public/images/samples/level-5-hallway.jpg` (119,582 B) | `sample-level-5-hallway-nano-v1.png` | not exposed / job `752c6f3b-d079-42d4-8b5b-668a57c7a464` | none | `A long upstairs hallway in an Ottawa suburban home with a Level 5 smooth wall finish: low afternoon sunlight from a window at the end of the hall rakes along the full length of a freshly painted matte white wall, the surface perfectly flat and uniform with no seams, ridges or nail pops even under the side light, white baseboards and door casings, a light oak floor, honest jobsite photograph taken by the contractor, natural daylight, real lived-in Ottawa suburban home, straightforward eye-level documentary framing, unretouched, true-to-life colour, slight natural sensor noise, no people, no faces, no text, no letters, no logos, no watermark` |
| `public/images/samples/basement-drywall-taping.jpg` (113,404 B) | `sample-basement-drywall-taping-nano-v2-clean.png` | not exposed / job `3df1291c-97bd-40a0-b9fa-74b41a9bfd8c` (base, not kept) -> job `22aa5230-e1de-4107-905f-068d3e6a13fd` (clean-up edit, kept) | base | Base: `Basement walls taped and mudded mid-job, no people: new drywall with paper-taped seams and screw heads spotted with wet off-white joint compound, a mudded inside corner, a steel mud pan and a taping knife resting on an overturned plain unbranded bucket, a drop cloth on the concrete floor, a work light on a tripod stand, a small basement window, honest jobsite photograph taken by the contractor, natural daylight, real Ottawa suburban home, straightforward eye-level documentary framing, unretouched, true-to-life colour, slight natural sensor noise, no people, no faces, no text, no letters, no logos, no watermark` Edit: `Edit this photo: remove all printed labels, text and symbols from the blue bucket and remove the small sticker from the tripod leg, leaving plain scuffed blue plastic and a plain grey tripod leg. Keep everything else exactly the same: same framing, walls, tools, drop cloth, light and colour.` |

## 5. Intermediates (not published)

`assets-src/stills/work/`: `*-aligned.png` and `tmp-blend-*.png` are alignment experiments from
`scripts/assets/stills-align.mjs` and `stills-blend.mjs` (the final outputs use the raw "after" edits
directly), `debug-r4-inpainted.png` is a debug dump of the R4 inpaint, `preview/` holds review crops,
`jobs.log`, `process-run.log` and `final-inventory.txt` are the stills agent's own logs.
