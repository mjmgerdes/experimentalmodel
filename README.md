# Word → Object

A presentation-ready, interactive 3D schematic of the canine EEG experiment in **Boros et al. (2024), “Neural evidence for referential understanding of object words in dogs,” Current Biology**. [Study](https://doi.org/10.1016/j.cub.2024.02.029).

## Run locally

Node.js 22.14 or later.

```sh
npm install
npm run dev
```

Open http://localhost:3000. No accounts, environment variables, API keys, or backend are needed.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

## Deploy to Vercel

Push this directory to a Git repository, import it in Vercel, choose **Next.js**, and deploy with the defaults (`npm run build`). No additional services or configuration are required. Alternatively, use the Vercel CLI from this directory. The `main` branch of `mjmgerdes/experimentalmodel` is connected to the existing Vercel project; pushing changes to `main` triggers deployment.

## Using the visualization

- **Explore setup:** drag to orbit; scroll/pinch to zoom. Choose one of five camera presets. Select model elements or use **All setup elements** for keyboard-accessible descriptions. Open/close the window for inspection.
- **Run trial:** choose Match or Mismatch, then play, pause, reset, or navigate directly to any step. Changing condition resets the trial so the event cannot change halfway through a reveal.
- **Presentation:** click **Present** or press **P**. Press **P** again or **Escape** to exit. No browser fullscreen APIs are used.
- **Keyboard:** Left/Right move between trial steps; Space plays/pauses. All controls have visible keyboard focus states.
- Playback pauses when the browser tab is hidden. Reduced-motion preferences disable cosmetic motion and camera interpolation while retaining scientific trial timing.

For the optional browser checks, install Google Chrome, start the local server, then run `PREVIEW_URL=http://localhost:3000 npm run test:browser`. Screenshots are written to the ignored `qa-artifacts/` directory.

## Architecture and editing

Next.js App Router + TypeScript + React Three Fiber / Three.js + Drei. The WebGL scene is client-loaded; the interface uses custom CSS. All models use local procedural geometry. There are no image or model downloads. DM Sans and IBM Plex Mono are requested from Google Fonts with local font fallbacks.

| File                              | Purpose                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| `lib/constants.ts`                | **`AUTHOR_VALIDATED = false`** and optional `AUTHOR_VALIDATION_NOTE`; paper link            |
| `lib/trialStates.ts`              | Six declarative steps, durations, captions, window states, EEG epoch                        |
| `lib/experimentData.ts`           | Setup descriptions, scientific explanations, reconstruction notes, illustrative object list |
| `components/Experiment.tsx`       | Modes, playback clock, keyboard controls, reduced motion, presentation mode                 |
| `components/ExperimentScene.tsx`  | Room arrangement, occluders, window, interaction, stimulus movement                         |
| `components/Models.tsx`           | Sculptural dog, people, furniture, five illustrative object models                          |
| `components/CameraController.tsx` | Smooth camera presets and orbit controls                                                    |
| `components/TrialController.tsx`  | Playback and direct step navigation                                                         |
| `components/Timeline.tsx`         | Baseline, object onset, and reported 206–606 ms effect interval                             |
| `components/InfoPanel.tsx`        | Keyboard-accessible setup index and expandable research notes                               |
| `app/globals.css`                 | Visual tokens, responsive layouts, presentation styling                                     |
| `tests/science.test.ts`           | Critical sequence/timing invariants                                                         |

To change illustrative objects, update `OBJECTS` in `lib/experimentData.ts`, corresponding models in `StimulusObject` in `components/Models.tsx`, and the match/mismatch examples in the controller and scene. The demonstration currently contrasts **ball → ball** and **ball → frisbee**. These examples represent two pairings from a shared pool, not the full study randomization.

## Scientific boundaries and assumptions

The supplied experiment brief is the scientific source of truth. This is **not to scale** and **not author-validated**. Set `AUTHOR_VALIDATED` to `true` only after explicit author confirmation; an optional note can record the scope/date of that confirmation.

- The dog faces O1 across the electric window, with O2/E2 next to the dog. The three occluders form a U; E1 is beyond a side occluder. Speakers sit on the ground on either side of O1. The monitor is below the window, facing O1.
- Room proportions, precise distances, silhouettes, furniture, colors, webcam mounting, EEG hardware position, cable routing, and electrode spacing are schematic. Elevated model views can see locations that the dog cannot see. No dimensions are asserted.
- Objects are hidden below the window before presentation. The opaque delay allows the object to be raised before the visual reveal.
- Preparation is 1500 ms, the opaque delay 1000 ms, and visual presentation 2000 ms. Ready/prime/end automatic pacing (1800/2800/1800 ms) is illustrative, not reported timing. Real intertrial progression depends on E1's attention check; automatic demonstration playback stops at the end.
- The recording is non-invasive. Event triggers are timestamps, not stimulation. Fz, FCz, and Cz are active scalp derivations referenced to Pz (labeled as the reference). F7/F8 near the eyes recorded EOG; the ground was on the left temporalis. EOG and ground positions are described in the EEG panel but omitted from the schematic geometry.
- Visual reveal and the EEG time origin share the same trial-state update. On reveal, the pane and object switch to their visible state immediately for synchronization; window closing is immediate to preserve the full opaque interval; the word-prime opening and object movement are eased. This browser demonstration is not laboratory stimulus-delivery or acquisition software.
- The analysis axis spans −200 to 1000 ms relative to object onset; the object remains visible for 2000 ms. The 206–606 ms band is a **reported result**, not a stimulus duration. No measured or fabricated EEG waveform is displayed.
- The example utterance is displayed in text, with illustrative sound arcs. No original owner audio is included. The five object models are illustrative and do not claim to reproduce the exact objects used in the paper.

## Performance and limitations

The scene caps device pixel ratio at 1.7, uses one shadow-casting light and no postprocessing or external 3D assets. WebGL hardware acceleration is required. The mobile layout stacks the model above the controls; a larger display is recommended for presenting. This version has no measured EEG traces, recorded speech, or scientific timing guarantees.
