import test from "node:test";
import assert from "node:assert/strict";
// Node's native TypeScript runner requires explicit extensions.
// @ts-expect-error -- executable directly without a transpilation step
import * as trials from "../lib/trialDefinition.ts";

const { TRIAL_DEFINITIONS, getTrialDefinition, getTrialContent } = trials;

test("canonical definitions fix the spoken word and prepared/revealed identities", () => {
  assert.deepEqual(getTrialDefinition("match"), {
    condition: "match",
    spokenWord: "ball",
    preparedObject: "ball",
    revealedObject: "ball",
  });
  assert.deepEqual(getTrialDefinition("mismatch"), {
    condition: "mismatch",
    spokenWord: "ball",
    preparedObject: "frisbee",
    revealedObject: "frisbee",
  });
  assert.ok(Object.isFrozen(TRIAL_DEFINITIONS));
  for (const definition of Object.values(TRIAL_DEFINITIONS)) {
    assert.ok(Object.isFrozen(definition));
    assert.strictEqual(getTrialDefinition(definition.condition), definition);
    assert.equal(definition.preparedObject, definition.revealedObject);
  }
});

for (const condition of ["match", "mismatch"] as const) {
  test(`${condition}: all six steps preserve content and delay disclosure`, () => {
    const definition = getTrialDefinition(condition);
    const expectedObject = condition === "match" ? "ball" : "frisbee";
    const expectedLabel = condition === "match" ? "Ball" : "Frisbee";
    for (const step of [0, 1, 2, 3, 4, 5] as const) {
      const content = getTrialContent(definition, step);
      assert.equal(content.preparationCue, step === 1 ? expectedObject : null);
      assert.equal(content.primeWord, step === 2 ? "ball" : null);
      assert.equal(content.heldObject, expectedObject);
      assert.equal(content.wordLabel, step < 2 ? null : "Ball");
      assert.equal(
        content.objectLabel,
        step < 2 ? null : step < 4 ? "Hidden" : expectedLabel,
      );
      assert.equal(content.revealed, step >= 4);
      if (step < 4)
        assert.doesNotMatch(
          content.explanation,
          /corresponds|does not correspond/,
        );
      else
        assert.equal(
          content.explanation,
          condition === "match"
            ? "The word corresponds to the object."
            : "The word does not correspond to the object.",
        );
    }
  });
}

test("switching condition cannot carry over a previous word or revealed object", () => {
  for (const condition of ["mismatch", "match", "mismatch"] as const) {
    const definition = getTrialDefinition(condition);
    assert.equal(definition.spokenWord, "ball");
    assert.equal(getTrialContent(definition, 0).objectLabel, null);
    assert.equal(getTrialContent(definition, 3).objectLabel, "Hidden");
    assert.equal(
      getTrialContent(definition, 4).objectLabel,
      condition === "match" ? "Ball" : "Frisbee",
    );
  }
});
