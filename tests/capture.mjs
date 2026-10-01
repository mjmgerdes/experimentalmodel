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
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
const metrics = [];
async function capture(name) {
  await page.waitForTimeout(1000);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
    `${name}: horizontal overflow`,
  );
  await page.screenshot({ path: `${output}/${name}.png`, fullPage: true });
  metrics.push({
    name,
    ...(await page.evaluate(() => ({
      viewport: { width: innerWidth, height: innerHeight },
      labels: Array.from(document.querySelectorAll(".scene-annotation")).map(
        (el) => ({
          text: el.textContent,
          rect: el.getBoundingClientRect().toJSON(),
        }),
      ),
      text: Array.from(
        document.querySelectorAll(
          ".presentation .step-eyebrow,.presentation .relationship .micro,.presentation .epoch-tick span,.presentation .window-status strong,.presentation .onset-marker .micro",
        ),
      ).map((el) => ({
        text: el.textContent,
        size: getComputedStyle(el).fontSize,
      })),
    }))),
  });
}
try {
  await page.goto(process.env.PREVIEW_URL || "http://localhost:3002", {
    waitUntil: "networkidle",
  });
  await page.locator("canvas").waitFor();
  await capture("01-overview");
  await page.getByRole("button", { name: "Run trial", exact: true }).click();
  await page.getByRole("button", { name: "Mismatch", exact: true }).click();
  for (const [step, name] of [
    ["02 Word prime", "02-word-prime"],
    ["03 Delay", "03-delay"],
    ["04 Object onset", "04-mismatch-onset"],
  ]) {
    await page.getByRole("button", { name: step, exact: false }).click();
    await capture(name);
  }
  await page.keyboard.press("p");
  await capture("05-presentation-onset");
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await capture("06-mobile");
  await writeFile(
    `${output}/visual-metrics.json`,
    JSON.stringify({ metrics, errors }, null, 2),
  );
  if (!process.env.QA_BASELINE) assert.deepEqual(errors, []);
  console.log(JSON.stringify({ output, errors }));
} finally {
  await browser.close();
}
