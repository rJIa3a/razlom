# Version 2 — independent movement review

Scope: first movement frame and one transition into an empty second frame. Combat, items and publication excluded. Reviewed sim.js, scene.js and design/PLAN.md; ran an independent Node input route through create()/step(). No implementation edited.

## Verdict

Mechanics8/10, route completeness9/10, movement-state correctness8/10. Route is playable: all8learn flags become true through actual step calls. One concrete transition-pose correction should be applied before hand-back.

## Independent route evidence

Jump across the first obstacle → collision at low ceiling x512 → crouch/roll underneath → return near x660 and jump → automatic ledge grab(660,676), grip(700,480) → Up climb to(743,480) → jump right to pipe → right shimmy112.5px over100steps → Down drop → floor710 → run to1210.59 and new right+jump → land in panel2. Input script at E:/CodexGameQA/motion-v2.cjs. Final learn flags jump,crouch,roll,ledge,climb,pipe,shimmy,drop alltrue; transitionCount1; panel1, landedSecond=true.

Additional head-clearance test atx580,y710 retains crouch after releasing Down; free standing=false. Roll ends beyond ceiling atx815.56 without overlap. Pipe Down drop falls fromy456 to710 and does not regrab while Down held. Continued right+jump for500steps across landing never repeats the transition or jump; jump edges are correctly consumed during traversal.

## Top fixes

1. **Vault airborne pose (required visual correction).** sim.js transition start leaves grounded=true. scene.js actor() now defines air=!a.grounded, so vault skips its intended interpolated folded-leg airborne pose despite moving up into the gutter. Set grounded=false when beginning the frame transition; completion already restores true. Check transition screenshots at0.35,0.85,1.35and1.9s for folded legs, held edge, released grip and standing landing. Add QA assertion transition!=null implies grounded=false until completion.
2. **QA state markers match crouch.** actor() draws low top at y108 above soles, but its reported top/head joints always use y202/y181. This reports an invisible head79–94px above the visible crouching body and can mask clearance/rig results. Report mode-dependent top and head values; add actual crouch→roll→stand and hang→climb transition arrays to SCENE.QA(), rather than still states alone.
3. **Tutorial sequence optional.** Current exit can be reached by staying on floor and crouching through the low ceiling; no learn flags gate it. The full intended route works, but the level does not force discovery of ledge/pipe. If the desired acceptance is obligatory training, gate exit on relevant learn flags and show the missing-action hint. This is a scope choice, not a broken movement mechanic.

## Known small limitations

Roll is a compressed pose plus forward motion; it does not visibly rotate/tumble. Pipe hold uses both hands at fixed18px spacing and sliding, not alternating hand-over-hand locomotion. Grab mode enters instantly; maximum positional snap follows24–28px grab tolerance. These are readable basic mechanics but still visibly prototype motion. No claim of final shipped animation quality.

No combat or item dependency found in movement/transition logic; stale compatible fields/helpers exist but are dormant. No publication performed during review.
