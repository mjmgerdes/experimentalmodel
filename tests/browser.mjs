import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
await mkdir("qa-artifacts", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.goto(process.env.PREVIEW_URL || "http://localhost:3001", {
  waitUntil: "networkidle",
});
await page.locator("canvas").waitFor();
await page.waitForTimeout(1800);
await page.screenshot({
  path: "qa-artifacts/desktop-explore.png",
  fullPage: true,
});
assert.equal(await page.locator("canvas").count(), 1);
await page.getByText("All setup elements", { exact: false }).click();
await page.getByRole("button", { name: "EEG electrodes", exact: true }).click();
await page.getByRole("button", { name: "Focus on electrodes" }).click();
await page.waitForTimeout(1000);
assert.equal(await page.locator(".electrode-label").count(), 4);
await page.screenshot({ path: "qa-artifacts/eeg-focus.png", fullPage: true });
await page.getByRole("button", { name: "Reset camera" }).click();
await page.getByRole("button", { name: "Run trial", exact: true }).click();
await page.getByRole("button", { name: "Mismatch", exact: true }).click();
await page.getByRole("button", { name: "03 Delay", exact: false }).click();
assert.match(await page.locator(".window-status").innerText(), /OPAQUE/);
assert.match(
  await page.locator(".delay-note").innerText(),
  /Object still hidden/,
);
await page.screenshot({ path: "qa-artifacts/delay.png", fullPage: true });
await page.getByRole("button", { name: "Next step", exact: true }).click();
assert.match(await page.locator(".window-status").innerText(), /TRANSPARENT/);
assert.match(await page.locator(".onset-marker").innerText(), /t = 0/);
assert.match(await page.locator(".relationship").innerText(), /Frisbee/);
await page.waitForTimeout(700);
await page.screenshot({
  path: "qa-artifacts/mismatch-reveal.png",
  fullPage: true,
});
await page.getByRole("button", { name: "Reset trial", exact: true }).click();
await page.getByRole("button", { name: "Play trial", exact: true }).click();
await page.waitForTimeout(2050);
await page.getByRole("button", { name: "Pause trial", exact: true }).click();
assert.match(await page.locator(".step-eyebrow").innerText(), /STEP 01/);
const paused = await page
  .locator(".sequence .current .sequence-line i")
  .getAttribute("style");
await page.waitForTimeout(300);
assert.equal(
  await page
    .locator(".sequence .current .sequence-line i")
    .getAttribute("style"),
  paused,
);
await page.getByRole("button", { name: "Play trial", exact: true }).click();
await page.waitForTimeout(11000);
assert.match(await page.locator(".step-eyebrow").innerText(), /STEP 05/);
assert.equal(
  await page.getByRole("button", { name: "Play trial", exact: true }).count(),
  1,
);
await page.keyboard.press("p");
assert.equal(await page.locator(".experiment.presentation").count(), 1);
await page
  .getByRole("button", { name: "04 Object onset", exact: false })
  .click();
await page.screenshot({
  path: "qa-artifacts/presentation.png",
  fullPage: true,
});
await page.keyboard.press("Escape");
assert.equal(await page.locator(".experiment.presentation").count(), 0);
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(1000);
assert.equal(
  await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  ),
  true,
);
await page.screenshot({
  path: "qa-artifacts/mobile-trial.png",
  fullPage: true,
});
await page.getByRole("button", { name: "Explore setup", exact: true }).click();
await page.screenshot({
  path: "qa-artifacts/mobile-explore.png",
  fullPage: true,
});
await page.emulateMedia({ reducedMotion: "reduce" });
await page.locator("#camera").selectOption("Side view");
await page.waitForTimeout(150);
assert.equal(await page.locator("#camera").inputValue(), "Side view");
assert.deepEqual(errors, []);
await browser.close();
console.log(
  "Browser QA passed: desktop, mobile, EEG labels, match/mismatch, sequence, pause/resume, presentation, reduced motion; no runtime errors.",
);
