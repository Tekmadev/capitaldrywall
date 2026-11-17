# Bathroom & kitchen transformations: asset manifest (group: rooms)

Two four-stage concept visualizations for `/renovations-ottawa`, built with the basement method:
a dated 1990s Ottawa bathroom and kitchen → stripped / torn out with rough-ins → board and waterproofing
(bathroom) or cabinets and counters (kitchen) → finished room. Generated 2026-11-17.

**Honesty:** every image and frame here is AI-generated concept visualization. None of it shows a real
client project. The UI keeps the "Concept visualization" corner label on both scenes, and the sheet-index
thumbnails in the renovations hero carry the concept label through MediaFrame.

Seeds: not exposed by the Higgsfield API; each entry lists the job id. `nano_banana_pro` jobs are reported
by the API as `nano_banana_2`. Full job log: `assets-src/rooms/jobs.log`.

## Credit tally

Credits only (`use_unlim: false`, no free generations, no credits bought, no preference changes).
Balance 504 before the first job, 342 after the last: **162 credits**.

| Item | Model | Jobs | Credits each | Credits |
|---|---|---|---|---|
| Stage 1, 16:9, two variants per room | `nano_banana_pro` (2k, count 2) | 2 | 4 | 8 |
| Stages 2-4, 16:9 edits | `nano_banana_pro` (2k) | 6 | 2 | 12 |
| Kitchen stage 4 dishwasher-panel fix, 16:9 | `nano_banana_pro` (2k) | 1 | 2 | 2 |
| Stages 1-4, 9:16 edits, both rooms | `nano_banana_pro` (2k) | 8 | 2 | 16 |
| 9:16 stage 4 fixes (bathroom door jamb, rejected; kitchen dishwasher panel, kept) | `nano_banana_pro` (2k) | 2 | 2 | 4 |
| Interpolation clips, 3 per room per ratio | `minimax_h3` (5 s, 2K) | 12 | 10 | 120 |
| **Rooms group total** | | **31** | | **162** |

## Stage prompts

Stage 1 is text-to-image; every later stage is an edit of the previous kept stage (single reference),
so camera, lens, window and door frames stay locked. The 9:16 set re-composes the kept 16:9 stage 1
vertically, then edits each stage from the previous 9:16 stage with the matching 16:9 stage as a second
reference for the design. Exact prompts are in the Higgsfield job records (ids below); in short:

| Stage | Bathroom | Kitchen |
|---|---|---|
| 1 | Dated 1990s bathroom: almond drop-in tub, beige square tile surround, oak vanity with cultured-marble top, large mirror and brass light bar, vinyl floor, frosted window | Dated 1990s kitchen: honey-oak cathedral-arch cabinets, speckled laminate counters, almond tile backsplash, white double sink under the window, fluorescent box light, worn vinyl floor |
| 2 | Stripped to the studs: plywood subfloor, copper/PEX rough-in for tub, valve and vanity, vanity light box, yellow LED work light | Torn out: patched drywall, pencil cabinet layout, electrical boxes, sink stubs, pot-light holes, paper floor runner, LED work light |
| 3 | Moisture-resistant drywall taped and mudded, cement board with plain orange waterproofing membrane at the tub, new alcove tub, cement-board floor | Walls primed, pot lights on, white shaker cabinets and quartz counter in the original L layout, undermount sink, oak plank floor, no backsplash yet |
| 4 | Large-format warm-white tile surround, matte black fixtures, grey porcelain floor, floating white-oak vanity, round mirror, two sconces | Handmade-look white tile backsplash, brass bar pulls, stainless slide-in range (no badges), white hood insert, black faucet, under-cabinet light, panelled dishwasher |

Every prompt ends with: photorealistic, no people, no text, no logos, no brand names.

## Kept stills

All `nano_banana_pro`, `{resolution: "2k"}`, 2752x1536 (16:9) / 1536x2752 (9:16).

| Stage | 16:9 job id | 9:16 job id |
|---|---|---|
| Bathroom 1 | `93aabb71-e7af-48d4-9c49-51e84bd682cc` (v1 of 2) | `8f57c5ed-a8d0-402f-802e-8c1566f612d6` |
| Bathroom 2 | `49d81455-b794-4890-9ddf-1c0805fc7392` | `3b9b31d8-8d83-4069-9ea4-c1464ccd6226` |
| Bathroom 3 | `ab649663-f361-48c3-ba05-20fda06206e0` | `4c6f6e4a-673e-4ccf-8eb4-c6aebe38b481` |
| Bathroom 4 | `996195cf-9041-42c5-9c3d-b6fb68c0f13a` | `72d80366-ff33-4e1b-bb35-27ff5bc27a81` + local door-edge composite (`bath-s4c-9x16`) |
| Kitchen 1 | `9027e634-9d36-4536-af05-aaa5581c4bd5` (v1 of 2) | `c4554895-76ee-4c5f-842c-54aa12b2b56a` |
| Kitchen 2 | `63f85d2a-e9d7-4304-8267-67c04aca4669` | `90bf10a2-1719-4733-9aae-94500d0e5f96` |
| Kitchen 3 | `9cf256e7-cc84-493b-b097-3e05b8ba8de1` | `c82383cb-a83e-4dee-b9a6-9bbae7b99089` |
| Kitchen 4 | `241fe9b3-d6e3-43e6-9c54-0dc29ba19918` (dishwasher fix of `095c207c`) | `3589eee9-b717-471f-8971-9c6041767bd3` (dishwasher fix of `b695abce`) |

Not kept: bathroom 16:9 v2 `15cdf941`, kitchen 16:9 v2 `f9ca05ac`, kitchen 4 16:9 original `095c207c` and
9:16 original `b695abce` (open bay showed bare wall), bathroom 9:16 door-jamb edit `69e5c232` (the edit
pulled the camera back, breaking continuity).

### Retouch and composite (`scripts/assets/rooms-keyframes.mjs`)

Deterministic median + blur over small rects (raw-still pixels) so no frame carries pseudo-text: range
display digits, coffee-maker display and base badge, knife-block print (kitchen stage 1, both ratios);
range display and oven-door badge (kitchen stage 4, 16:9); cement-board print on the wall and floor
(bathroom stage 3, both ratios). `bath-s4c-9x16` = `bath-s4-9x16` with a 140 px strip of `bath-s3-9x16`
(the open door and jamb) composited along the left edge, 22 px feather, brightness 1.04 / saturation 0.85.

## Clips

`minimax_h3`, `{duration: 5, resolution: "2K", aspect_ratio}`, 10 credits each; role `start_image` =
stage A, `end_image` = stage B. Keyframes are unzoomed; the prompt asks for a locked-off camera and the
push-in is added in post. Retouched keyframes were uploaded (media ids in the job log); clean ones were
passed by generation job id. All twelve kept (no identity breaks on the 8-frame strips in
`assets-src/rooms/review/`).

| Clip | 16:9 job id | 9:16 job id |
|---|---|---|
| Bathroom 1→2 | `69309f9e-7ccf-4914-b814-6f658b963446` | `2d832421-9ad4-4f74-862f-3d101db5ecc6` |
| Bathroom 2→3 | `c47716f4-44f2-485b-a3df-0eeef0486c84` | `baf586b4-1198-4da8-b7fe-40ee7a8b68e3` |
| Bathroom 3→4 | `bca7d488-c8ba-4f30-b54a-612767e6d3a3` | `caedcedf-2b02-4334-a464-a9dbfb20adb2` |
| Kitchen 1→2 | `35334004-a7b6-48b2-903f-7d3748f00f3a` | `1ee635b4-e263-4338-989b-dd8c0b8bd55c` |
| Kitchen 2→3 | `f9ba7e86-e823-49d5-bad6-52e92ccb0643` | `eb3191c2-7074-4534-ba46-a6c4896e6f81` |
| Kitchen 3→4 | `1642dfe9-a324-42c1-940f-a7b83426a95c` | `ce12ce47-8643-4e91-82c3-3bbc8e52c6dc` |

## Outputs (`scripts/assets/rooms-frames.mjs`, `rooms-keyframes.mjs`)

Frames: concat (boundary duplicates dropped, CRF 12), piecewise-linear pick so stages land on the
keyframes, native-resolution cover crop, then a centred push-in from 1.00 to 1.15 linear in frame index,
Lanczos to size, sharp AVIF. Stage stills use the same crops (1.00 / 1.05 / 1.10 / 1.15).

| Output | Frames | Size | Bytes |
|---|---|---|---|
| `public/sequences/bathroom-desktop/` | 96, stages [0,32,64,95] | 1920x1080 | 3,221,045 |
| `public/sequences/bathroom-mobile/` | 48, stages [0,16,32,47] | 900x1600 | 1,423,242 |
| `public/sequences/kitchen-desktop/` | 96, stages [0,32,64,95] | 1920x1080 | 3,529,249 |
| `public/sequences/kitchen-mobile/` | 48, stages [0,16,32,47] | 900x1600 | 1,308,084 |
| `public/images/{bathroom,kitchen}/*-stage-{1..4}-{desktop,mobile}.jpg` | reduced-motion stills | 1920x1080 / 900x1600 | mozjpeg q82 |
| `public/images/{bathroom,kitchen}/*-poster-{desktop,mobile}.jpg` | exact first frame | 1920x1080 / 900x1600 | mozjpeg q84 |
