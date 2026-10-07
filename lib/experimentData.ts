export type ElementId =
  | "dog"
  | "mattress"
  | "eeg"
  | "companion"
  | "window"
  | "owner"
  | "experimenter"
  | "speakers"
  | "monitor"
  | "objects"
  | "webcam"
  | "inner"
  | "outer";
export type Condition = "match" | "mismatch";
export type ObjectKind = "ball" | "frisbee" | "rope" | "toy" | "cup";
export const OBJECTS: { kind: ObjectKind; label: string }[] = [
  { kind: "ball", label: "Ball" },
  { kind: "frisbee", label: "Frisbee" },
  { kind: "rope", label: "Rope toy" },
  { kind: "toy", label: "Stuffed toy" },
  { kind: "cup", label: "Cup" },
];
export const ELEMENTS: Record<
  ElementId,
  { name: string; tag: string; description: string }
> = {
  dog: {
    name: "The listener",
    tag: "DOG · INNER ZONE",
    description:
      "The dog rests on a mattress, facing the electric window. No fetching, choosing, or button press is required: scalp EEG records the response to the revealed object.",
  },
  mattress: {
    name: "A place to settle",
    tag: "MATTRESS",
    description:
      "A low padded surface supports the dog during recording. Its dimensions, color, and exact position are schematic.",
  },
  eeg: {
    name: "Recording expectation",
    tag: "NON-INVASIVE SCALP EEG",
    description:
      "EEG activity was recorded from Fz, FCz, and Cz, referenced to Pz. F7/F8 near the eyes captured EOG activity; the ground electrode was on the left temporalis. The electrodes recorded electrical activity and did not stimulate the dog. The event marker timestamps visual object onset in the EEG recording.",
  },
  companion: {
    name: "A familiar presence",
    tag: "O2 / E2 · INNER ZONE",
    description:
      "A second owner or experimenter sits next to the dog, helping the dog remain relaxed and appropriately positioned.",
  },
  window: {
    name: "Controlling visibility",
    tag: "ELECTRIC WINDOW",
    description:
      "The middle of three U-shaped occluders contains an electrically controlled window. It becomes transparent for the word prime and object presentation, and opaque during preparation and the delay.",
  },
  owner: {
    name: "The presenter",
    tag: "OWNER O1 · OUTER ZONE",
    description:
      "O1 faces the dog across the window. Their prerecorded, dog-directed voice provides the word prime. After the opaque delay, O1 presents an object in front of their face.",
  },
  experimenter: {
    name: "Running the experiment",
    tag: "E1 · OUT OF THE DOG’S SIGHT",
    description:
      "E1 controls the experiment and watches a webcam feed of the dog. The next trial begins only when the dog is attentive, appropriately positioned, facing the window, and has open eyes.",
  },
  speakers: {
    name: "A familiar voice",
    tag: "TWO GROUND-LEVEL SPEAKERS",
    description:
      "Loudspeakers on the ground, to the left and right of O1, play the owner’s prerecorded voice. The sentence combines the dog’s name, an ostensive cue, and an object word. Sound arcs are illustrative; this demo has no recorded audio.",
  },
  monitor: {
    name: "A cue for the owner",
    tag: "MONITOR · BELOW THE WINDOW",
    description:
      "Visible to O1, the monitor first identifies the object to prepare and later displays a countdown. The preparation cue is shown here as an object name in place of an image. The separate speaker label illustrates the word heard by the dog.",
  },
  objects: {
    name: "One shared object pool",
    tag: "INDIVIDUALIZED STIMULI",
    description:
      "Five familiar, visually distinct objects were selected for each dog. Owners reportedly used at least three object names. The same words and objects appeared in both conditions; the five models here are illustrative examples.",
  },
  webcam: {
    name: "Checking attention",
    tag: "WEBCAM",
    description:
      "E1 monitors the dog’s posture, eyes, and orientation toward the window via webcam. The camera mount and exact position are approximate.",
  },
  inner: {
    name: "The listening side",
    tag: "INNER ZONE",
    description:
      "The dog and O2/E2 occupy the inner zone. The dog’s view of the owner and object is controlled by the window in the central occluder.",
  },
  outer: {
    name: "The presentation side",
    tag: "OUTER ZONE",
    description:
      "O1, E1, the object pool, the monitor, and two ground-level speakers occupy the outer zone. Three occluders form a U-shaped boundary; E1 and the stored objects remain outside the dog’s view.",
  },
};
export const COPY = {
  schematic:
    "Schematic reconstruction based on Boros et al. (2024) — not to scale.",
  why: "The researchers wanted to test whether hearing a familiar object word caused dogs to form a mental representation of the referred object. The same words and physical objects appeared across match and mismatch conditions. Because the physical stimuli themselves were reused across conditions, an ERP difference cannot be explained simply by one word or object being inherently different from another. Instead, the critical manipulation is the relationship between the preceding word and the subsequently presented object.",
  behavioral:
    "EEG allowed the researchers to study semantic expectations without requiring an overt behavioral response.",
  notes:
    "This visualization is a schematic reconstruction of the experimental setup described in Boros et al. (2024) and is not to scale. Relative positions are based on the published Methods and Figure 1 where specified. Exact room dimensions and distances were not reported and are represented approximately.",
  assumptions:
    "Room proportions, furniture, human and canine silhouettes, electrode spacing, cable routing, and webcam mounting are approximate. Walls remain visible in the model; overhead views can see locations hidden from the dog. Objects are illustrative. Ready, word-prime, and end-step playback durations are demonstration pacing, not reported timings. The spoken sentence is shown as text; no original recording or measured EEG waveform is reproduced.",
};
export const CAMERAS = [
  "Overview",
  "Dog / Inner zone",
  "Owner / Outer zone",
  "Side view",
  "EEG focus",
] as const;
export type CameraPreset = (typeof CAMERAS)[number];
