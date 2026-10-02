import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const output = process.env.QA_DIR || "qa-artifacts/final-pass";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
const button = (name) => page.getByRole("button", { name, exact: true });
async function step(n) {
  await page.locator(".sequence button").nth(n).click();
}
const relation = () => page.locator(".relationship").innerText();
async function overflow() {
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
}
async function presentationFits(label) {
  await overflow();
  const layout = await page.evaluate(() => {
    const panel = document.querySelector(".trial-panel");
    return {
      viewport: { width: innerWidth, height: innerHeight },
      documentHeight: Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      ),
      panelHeight: panel.clientHeight,
      panelScrollHeight: panel.scrollHeight,
    };
  });
  assert.ok(
    layout.documentHeight <= layout.viewport.height + 1,
    `${label}: presentation fits the viewport without vertical scrolling (${layout.documentHeight}px / ${layout.viewport.height}px)`,
  );
  assert.ok(
    layout.panelScrollHeight <= layout.panelHeight + 1,
    `${label}: presentation critical text is not clipped`,
  );
  return { label, ...layout };
}
try {
  await page.goto(process.env.PREVIEW_URL || "http://localhost:3004", {
    waitUntil: "networkidle",
  });
  await page.locator("canvas").waitFor();
  await page.waitForTimeout(1000);
  assert.match(
    await page.locator(".identity p").innerText(),
    /REFERENTIAL OBJECT-WORD UNDERSTANDING/,
  );
  assert.equal(await page.locator(".scene-annotation").count(), 7);
  for (const [i, name] of [
    "Overview",
    "Dog / Inner zone",
    "Owner / Outer zone",
    "Side view",
    "EEG focus",
  ].entries()) {
    await page.locator("#camera").selectOption(name);
    await page.waitForTimeout(1000);
    await page.locator(".identity h1").click();
    await page.screenshot({
      path: `${output}/camera-${i}-${name.split(" / ")[0].toLowerCase().replaceAll(" ", "-")}.png`,
      fullPage: true,
    });
    assert.equal(await page.locator("#camera").inputValue(), name);
    await overflow();
  }
  assert.equal(await page.locator(".electrode-label:visible").count(), 4);
  assert.match(
    await page
      .locator(".electrode-label")
      .allTextContents()
      .then((x) => x.join(" ")),
    /Pz · reference/,
  );
  const electrodeRects = await page
    .locator(".electrode-label:visible")
    .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON()));
  for (let i = 0; i < electrodeRects.length; i++) {
    for (let j = i + 1; j < electrodeRects.length; j++) {
      const a = electrodeRects[i],
        b = electrodeRects[j];
      assert.ok(
        a.right <= b.left ||
          b.right <= a.left ||
          a.bottom <= b.top ||
          b.bottom <= a.top,
        "Electrode labels do not overlap",
      );
    }
  }
  await button("Reset camera ↗").click();
  await button("Hide labels").click();
  await button("Show labels").click();
  await button("Run trial").click();
  await button("Mismatch").click();
  for (const n of [0, 1]) {
    await step(n);
    assert.doesNotMatch(await relation(), /Ball|Frisbee|REVEALED OBJECT/);
  }
  for (const n of [2, 3]) {
    await step(n);
    assert.match(await relation(), /Ball/);
    assert.match(await relation(), /Hidden/);
    assert.doesNotMatch(
      await relation(),
      /Frisbee|REVEALED OBJECT|does not correspond/,
    );
    assert.match(
      await page.locator(".window-status").innerText(),
      n === 2 ? /TRANSPARENT/ : /OPAQUE/,
    );
  }
  await step(4);
  assert.match(await relation(), /Frisbee/);
  assert.match(await page.locator(".onset-marker").innerText(), /t = 0/);
  assert.equal(
    await page.locator(".epoch").getAttribute("data-epoch-time"),
    "0",
  );
  await page.keyboard.press("ArrowLeft");
  assert.match(await relation(), /Hidden/);
  await page.keyboard.press("ArrowRight");
  assert.match(await relation(), /Frisbee/);
  await step(5);
  assert.match(await relation(), /Frisbee/);
  await button("Match").click();
  assert.doesNotMatch(await relation(), /Ball|Frisbee/);
  await step(4);
  assert.match(await relation(), /Ball\s*→\s*Ball/);
  await button("Reset trial").click();
  await button("Play trial").click();
  await page.waitForTimeout(700);
  await button("Pause trial").click();
  const elapsed = await page.locator(".epoch").getAttribute("data-elapsed");
  await page.waitForTimeout(250);
  assert.equal(
    await page.locator(".epoch").getAttribute("data-elapsed"),
    elapsed,
  );
  await button("Reset trial").click();
  await button("Mismatch").click();
  // Observe committed UI state during real-time playback, including exact onset.
  await page.evaluate(() => {
    window.__qaTrace = [];
    const record = () => {
      const el = document.querySelector(".epoch");
      window.__qaTrace.push({
        wall: performance.now(),
        step: Number(el.dataset.step),
        elapsed: Number(el.dataset.elapsed),
        epoch: Number(el.dataset.epochTime),
        window: document.querySelector(".window-status").textContent,
        relation: document.querySelector(".relationship").textContent,
        onset: !!document.querySelector(".onset-marker"),
      });
    };
    record();
    window.__qaObserver = new MutationObserver(record);
    window.__qaObserver.observe(document.querySelector(".epoch"), {
      attributes: true,
    });
  });
  await button("Play trial").click();
  await page.waitForFunction(
    () => document.querySelector(".epoch")?.dataset.step === "5",
    {},
    { timeout: 18000 },
  );
  await button("Play trial").waitFor({ state: "visible", timeout: 5000 });
  const trace = await page.evaluate(() => {
    window.__qaObserver.disconnect();
    return window.__qaTrace;
  });
  await writeFile(
    `${output}/playback-trace.json`,
    JSON.stringify(trace, null, 2),
  );
  const transitions = [0, 1, 2, 3, 4, 5].map((n) =>
    trace.find((row) => row.step === n && row.elapsed === 0),
  );
  assert.ok(transitions.every(Boolean), "All six states observed");
  for (const [n, duration] of [
    [1, 1500],
    [2, 2800],
    [3, 1000],
    [4, 2000],
  ]) {
    const actual = transitions[n + 1].wall - transitions[n].wall;
    assert.ok(
      Math.abs(actual - duration) < 220,
      `Step ${n}: ${actual.toFixed(0)} ms (expected ${duration})`,
    );
  }
  const delay = trace.filter((r) => r.step === 3);
  assert.ok(delay.some((r) => r.elapsed > 800 && r.elapsed < 1000));
  for (const r of delay)
    assert.ok(Math.abs(r.epoch - Math.max(-200, r.elapsed - 1000)) < 0.01);
  for (const r of trace.filter((r) => r.step === 2 || r.step === 3))
    assert.ok(r.relation.includes("Hidden") && !r.relation.includes("Frisbee"));
  assert.equal(transitions[4].epoch, 0);
  assert.equal(transitions[4].onset, true);
  assert.match(transitions[4].window, /TRANSPARENT/);
  assert.match(transitions[4].relation, /Frisbee/);
  assert.ok(trace.some((r) => r.step === 4 && r.epoch > 206 && r.epoch < 606));
  await step(4);
  await page.keyboard.press("p");
  assert.equal(await page.locator(".presentation").count(), 1);
  await page.waitForTimeout(900);
  const presentationLayouts = [];
  const sizes = [];
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(900);
    for (const n of [0, 1, 2, 3, 4, 5]) {
      await step(n);
      presentationLayouts.push(
        await presentationFits(
          `${viewport.width}×${viewport.height}, step ${n}`,
        ),
      );
    }
    await step(4);
    const viewportSizes = await page
      .locator(
        ".presentation .step-eyebrow,.presentation .relationship .micro,.presentation .epoch-tick span,.presentation .window-status strong,.presentation .onset-marker .micro",
      )
      .evaluateAll((els) =>
        els.map((e) => parseFloat(getComputedStyle(e).fontSize)),
      );
    assert.ok(
      viewportSizes.length > 0,
      "Presentation critical text is present",
    );
    assert.ok(
      viewportSizes.every((size) => size >= 11),
      `${viewport.width}×${viewport.height}: presentation critical text is at least 11px`,
    );
    sizes.push(...viewportSizes);
    await page.locator(".identity h1").click();
    await page.screenshot({
      path: `${output}/presentation-onset-${viewport.width}.png`,
      fullPage: true,
    });
  }
  await page.keyboard.press("p");
  assert.equal(await page.locator(".presentation").count(), 0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(800);
  await overflow();
  await button("Explore setup").click();
  await overflow();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator("#camera").selectOption("Side view");
  await page.waitForTimeout(200);
  assert.deepEqual(errors, []);
  await writeFile(
    `${output}/qa-results.json`,
    JSON.stringify(
      {
        passed: true,
        errors,
        timings: transitions.map((r, i) => ({ step: i, wall: r.wall })),
        presentationTextSizes: sizes,
        presentationLayouts,
      },
      null,
      2,
    ),
  );
  console.log(
    "PASS: all presets, temporal relationship, real-time timings/baseline/onset, keys, play/pause/reset, conditions, window states, presentation, mobile overflow, reduced motion; no console/page errors.",
  );
} finally {
  await browser.close();
}
