export type TrialStep = 0 | 1 | 2 | 3 | 4 | 5;
export interface StepDefinition {
  id: TrialStep;
  short: string;
  title: string;
  caption: string;
  duration: number;
  timing: string;
  window: "opaque" | "transparent";
}
export const STEPS: StepDefinition[] = [
  {
    id: 0,
    short: "Ready",
    title: "A quiet starting point.",
    caption: "Dog positioned and EEG recording underway.",
    duration: 1800,
    timing: "Self-paced",
    window: "opaque",
  },
  {
    id: 1,
    short: "Prepare",
    title: "An object, still hidden.",
    caption: "1500 ms — O1 prepares the object out of the dog’s view.",
    duration: 1500,
    timing: "1500 ms",
    window: "opaque",
  },
  {
    id: 2,
    short: "Word prime",
    title: "First, a familiar word.",
    caption:
      "Object word presented in natural, dog-directed speech in the owner’s voice.",
    duration: 2800,
    timing: "Audio duration varies",
    window: "transparent",
  },
  {
    id: 3,
    short: "Delay",
    title: "The word is heard. The object is absent.",
    caption:
      "1000 ms delay — the word has been heard, but the object is still hidden.",
    duration: 1000,
    timing: "1000 ms",
    window: "opaque",
  },
  {
    id: 4,
    short: "Object onset",
    title: "Now, the object appears.",
    caption: "EEG response is time-locked to visual object onset.",
    duration: 2000,
    timing: "2000 ms",
    window: "transparent",
  },
  {
    id: 5,
    short: "End trial",
    title: "Reset, when the dog is ready.",
    caption:
      "Next trial begins when the dog is attentive and correctly positioned.",
    duration: 1800,
    timing: "Attention-dependent",
    window: "opaque",
  },
];
export function nextStep(step: TrialStep): TrialStep {
  return Math.min(step + 1, 5) as TrialStep;
}
export function previousStep(step: TrialStep): TrialStep {
  return Math.max(step - 1, 0) as TrialStep;
}
export const EPOCH = {
  start: -200,
  end: 1000,
  effectStart: 206,
  effectEnd: 606,
};

// The 1000 ms delay contains only a final 200 ms prestimulus baseline.
export function epochTime(step: TrialStep, elapsed: number): number {
  if (step === 3)
    return Math.min(0, Math.max(EPOCH.start, elapsed - STEPS[3].duration));
  if (step === 4) return Math.min(EPOCH.end, Math.max(0, elapsed));
  return step === 5 ? EPOCH.end : EPOCH.start;
}
