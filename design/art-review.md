# Version 2 independent art, frame and motion review

Reviewed reference-three-panels.png first panel, bg_command_v2.png, version-2/scene.js, and frames/v2-qa match/crouch/roll/hang/pipe screenshots. No code edited. Scope: command-center movement and hand vault to city landing; no combat. This review judges current stills plus explicit rig implementation, not unseen animation footage.

## Scores

- Background style **8/10**: faithful acid-green city/window and indigo command-center shapes, with detailed SEGA-like hard-edged material shading.
- Character/style **8/10**: consistent ink, strong blond/denim silhouette, matching pixel-family shading.
- First-frame composition **7/10**: correct left small consoles / right tilted large screens; movement additions visibly alter the reference.
- Foreground integration **3/10**: flat slabs and suspended straight pipe visibly sit over richer generated art.
- Crouch/roll motion readability **3/10**: anatomical torso shrink and no actual somersault silhouette.
- Hanging/grip readability **5/10**: endpoints contact the ledge but body sits too high for a weighted hang.
- Overall current frame **6/10**; background itself is acceptable.

## Top fixes ranked by visible impact

1. **Style the three platforms and overhead pipe.** `platform` and pipe drawing in scene.js. Match screenshot first crate x398–483,y648–713; next slab x535–639,y549–575; ledge x700–845,y480–507. They are nearly single-colour blue rectangles with thin uniform highlights and sparse square rivets. Adjacent background uses multi-tone shaded hardware and detailed texture. Cheap code fix: add shaded inset front panels, irregular grime/edge wear, a bright top plane separated from dark underside, beveled ends, and 2–3px ink contours. For the pipe add a cylindrical 4-tone vertical ramp, dark lower edge, flanged collars, and bracket shadows. Preserve collisions. Style integration matters more than extra particles.

2. **Preserve anatomy in crouch and make roll rotate a tucked pose.** `actor` body sprite shrinks from h113 to h70, a 38% reduction, while arms/legs retain 55–56px lengths. Crouch screenshot x198–311,y601–722 reads as a shortened child torso with folded limbs. Keep body sprite height113, lower hips approximately40–50px, lean torso forward about20–30deg, and flex knees by spreading grounded feet. Roll screenshot x214–307,y603–718 retains upright head/torso and no rotation in code; this reads as a crouch sliding. Tuck limbs around a stable center and rotate the full articulated pose through a full turn over roll duration, keeping approximately95–115px envelope and foot/shoulder contact with ground. Torso rotation alone is insufficient if legs stay at world-oriented ground positions. Continuous pose blend into/out of tuck avoids snaps.

3. **Give hanging poses visible arm extension and weight.** Hang screenshot hands near x695,y482 while hero head begins y474; pipe grip y260 while head begins approximatelyy257. Thus grip and crown are effectively level. Ends are technically anchored, but fists read beside ears rather than supporting body. Lower body/head about45–55px while preserving grip coordinates; choose leg pose that hangs under hips with slight pendulum motion. Ensure reachable shoulder-hand distance remains below111px arm total. Draw ledge/pipe before torso but place gripping gloves over its upper/front edge, so actual contact can be seen. Keep both anchors and use a longer straight supporting-arm silhouette.

## Fidelity and known differences

Reference first panel: hero approximately48/134=36% panel height; current hero202/658=31%. Reference contains one continuous floor and no floating stair platforms or overhead traversal pipe. Additions serve requested movement gameplay, so no exact layout reconstruction demanded. Current background retains the first panel's diagonal white beams at left, green window center, large slanted monitors right, blue tiled foreground. No regeneration necessary.

## Checklist / review limits

Rendering family FAIL only at new code hardware; texel density broadly PASS; outline/material consistency FAIL at new hardware; HUD PASS in current states; gripping origin numerical endpoint matches but visible contact needs adjustment; articulation FAIL crouch/roll; grounding PASS first-frame idle, but crouch foot planting needs explicit poses; generator artifacts PASS; placeholder tells FAIL flat foreground; movement states do have distinct labels but silhouette readability FAIL low/roll; straight rectangular speed marks are a minor known FX limitation.

Accept background and existing character assets. Fix the three issues above in code; do not generate more scene art just to add detail. Recheck crouch/roll/hang once after these changes. No publication requested.
