# Final scientific-accuracy and presentation pass

The refinement pass was verified locally before publication. `AUTHOR_VALIDATED` remains `false`, and the not-to-scale statement is unchanged.

## Files changed

- `lib/experimentData.ts`: corrected EEG roles and study-design explanation.
- `lib/trialStates.ts`: explicit, testable mapping from trial elapsed time to the EEG epoch; original durations unchanged.
- `components/Experiment.tsx`: precise subtitle and a relationship panel that reveals information in trial order.
- `components/Models.tsx`: `Pz · reference` label, positioned separately from the active derivation labels.
- `components/ExperimentScene.tsx`: context-appropriate annotations in focus views; immediate window closing preserves the complete opaque interval.
- `components/Timeline.tsx`: explicit baseline explanation and observable timing values for browser QA.
- `app/layout.tsx`: precise browser title.
- `app/globals.css`: targeted spacing, label, and presentation readability fixes.
- `tests/science.test.ts`: baseline/onset invariants.
- `tests/browser.mjs`: camera, keyboard, condition, temporal-disclosure, real playback, console, responsive, and label-overlap checks.
- `tests/capture.mjs`: six required views at desktop and mobile sizes, with visual metrics.
- `README.md`: corrected electrode roles and occlusion behavior.
- `QA_REPORT.md`: this report.

## Exact scientific-copy changes

### EEG description

> EEG activity was recorded from Fz, FCz, and Cz, referenced to Pz. F7/F8 near the eyes captured EOG activity; the ground electrode was on the left temporalis. The electrodes recorded electrical activity and did not stimulate the dog. The event marker timestamps visual object onset in the EEG recording.

The scalp label now reads **Pz · reference**. The README distinguishes the three active derivations, reference, EOG, and ground. EOG and ground are described but are not newly modeled.

### Study-design explanation

> The researchers wanted to test whether hearing a familiar object word caused dogs to form a mental representation of the referred object. The same words and physical objects appeared across match and mismatch conditions. Because the physical stimuli themselves were reused across conditions, an ERP difference cannot be explained simply by one word or object being inherently different from another. Instead, the critical manipulation is the relationship between the preceding word and the subsequently presented object.

Separate statement:

> EEG allowed the researchers to study semantic expectations without requiring an overt behavioral response.

### Subtitle

> REFERENTIAL OBJECT-WORD UNDERSTANDING

The main title remains **Word → Object**.

### Timeline explanation

> Baseline: only the final 200 ms before visual onset. The highlighted interval is an observed result, not a programmed stimulus period. The object remains visible for 2000 ms; the axis shows the first 1000 ms.

## Temporal disclosure

- Ready/preparation: no upcoming word–object pairing is shown in the relationship panel.
- Prime/delay: **Ball → Hidden**, without the mismatch color or outcome sentence.
- Object onset: **Ball → Ball** or **Ball → Frisbee**, synchronized through the existing step transition with the visual reveal, EEG marker, and epoch origin.
- End: retains the revealed pairing. Changing condition resets the trial.
- The owner's monitor retains its object cue.

## Visual changes supported by screenshot inspection

The baseline screenshots showed the delay explanation clipped below the sidebar edge, very small projector timing/event labels, a wrapping/crowded Pz label, and irrelevant zone labels projected over close-up subjects.

- Compact sidebar spacing keeps the delay explanation visible; tighten prime-quote spacing so its audio disclaimer remains visible.
- At desktop presentation size, critical step, window, relationship, event, and epoch labels are 12 px or larger. Secondary stimulus-pool copy is hidden in presentation mode.
- Keep Pz's reference label on one line and separate it from adjacent electrode labels.
- Hide annotations for the opposite zone in focused views; EEG focus keeps the electrode labels rather than room labels.
- Preserve the existing palette, camera presets, geometry, lighting, layout, and architecture.

## Verification

- `npm test`: four tests pass, including baseline boundaries and the unchanged trial timings.
- `npm run lint`, `npm run typecheck`, `npm run build`: pass.
- Production-browser capture and interaction scripts: see `qa-artifacts/final-pass/qa-results.json` and `visual-metrics.json`.
- Real-time playback is sampled from committed UI states in `playback-trace.json`. The cursor stays at −200 ms through elapsed delay time 800 ms, then follows `elapsed − 1000`; the first object-onset state is 0 ms.
- Browser QA covers all five camera presets, no electrode-label overlaps in EEG focus, arrow keys, P, play/pause/reset, both conditions, window states, no premature relationship disclosure, responsive overflow, reduced motion, and console/page errors.
- Browser timing is checked with tolerance for rendering frames; this remains an educational simulation, not acquisition software.

## Final screenshots

All screenshots are in `qa-artifacts/final-pass/` (ignored by Git):

1. [Explore / Overview](qa-artifacts/final-pass/01-overview.png)
2. [Word Prime](qa-artifacts/final-pass/02-word-prime.png)
3. [Delay](qa-artifacts/final-pass/03-delay.png)
4. [Mismatch / Object Onset](qa-artifacts/final-pass/04-mismatch-onset.png)
5. [Presentation / Object Onset](qa-artifacts/final-pass/05-presentation-onset.png)
6. [Mobile](qa-artifacts/final-pass/06-mobile.png)

Additional `camera-*.png` images document all five camera presets. Before-pass screenshots are retained in `qa-artifacts/before-pass/` for comparison.
