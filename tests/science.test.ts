import test from "node:test";
import assert from "node:assert/strict";
// Node's native TypeScript runner requires explicit extensions.
// @ts-expect-error -- executable directly without a transpilation step
import { STEPS, EPOCH, nextStep, previousStep } from "../lib/trialStates.ts";
test("prime precedes the opaque 1000 ms delay and the 2000 ms visual reveal", () => {
  assert.equal(STEPS[0].window, "opaque");
  assert.equal(STEPS[1].duration, 1500);
  assert.equal(STEPS[1].window, "opaque");
  assert.equal(STEPS[2].window, "transparent");
  assert.equal(STEPS[3].window, "opaque");
  assert.equal(STEPS[3].duration, 1000);
  assert.equal(STEPS[4].window, "transparent");
  assert.equal(STEPS[4].duration, 2000);
  assert.equal(STEPS[5].window, "opaque");
});
test("analysis baseline and reported effect are anchored to visual onset", () => {
  assert.equal(EPOCH.start, -200);
  assert.equal(EPOCH.end, 1000);
  assert.equal(EPOCH.effectStart, 206);
  assert.equal(EPOCH.effectEnd, 606);
});
test("manual navigation cannot leave the six-step trial", () => {
  assert.equal(previousStep(0), 0);
  assert.equal(nextStep(5), 5);
  for (const i of [0, 1, 2, 3, 4] as const) assert.equal(nextStep(i), i + 1);
});
