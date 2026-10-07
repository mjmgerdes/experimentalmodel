import type { Condition } from "./experimentData";
import type { TrialStep } from "./trialStates";

// The only condition-to-content mapping. Frozen entries also prevent mutation
// while a trial is playing. Literal types reject incompatible scene props.
export const TRIAL_DEFINITIONS = Object.freeze({
  match: Object.freeze({
    condition: "match",
    spokenWord: "ball",
    preparedObject: "ball",
    revealedObject: "ball",
  } as const),
  mismatch: Object.freeze({
    condition: "mismatch",
    spokenWord: "ball",
    preparedObject: "frisbee",
    revealedObject: "frisbee",
  } as const),
});

export type TrialDefinition = (typeof TRIAL_DEFINITIONS)[Condition];

export function getTrialDefinition(condition: Condition): TrialDefinition {
  return TRIAL_DEFINITIONS[condition];
}

function displayName(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// Phase-dependent disclosure is separate from content identity. The owner can
// prepare the object before the dog sees it; the panel must still say Hidden.
export function getTrialContent(definition: TrialDefinition, step: TrialStep) {
  const heard = step >= 2;
  const revealed = step >= 4;
  const corresponds = definition.spokenWord === definition.revealedObject;
  return {
    revealed,
    preparationCue: step === 1 ? definition.preparedObject : null,
    primeWord: step === 2 ? definition.spokenWord : null,
    wordLabel: heard ? displayName(definition.spokenWord) : null,
    objectLabel: !heard
      ? null
      : revealed
        ? displayName(definition.revealedObject)
        : "Hidden",
    heldObject: revealed
      ? definition.revealedObject
      : definition.preparedObject,
    explanation: !heard
      ? step === 0
        ? "Trial not yet begun."
        : "Owner preparing the object. The dog has not yet heard the word."
      : !revealed
        ? "The object has not yet been revealed."
        : corresponds
          ? "The word corresponds to the object."
          : "The word does not correspond to the object.",
  };
}
