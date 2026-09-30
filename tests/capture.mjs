import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
await mkdir("qa-artifacts", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(process.env.PREVIEW_URL || "http://localhost:3002", {
  waitUntil: "networkidle",
});
await page.locator("canvas").waitFor();
await page.waitForTimeout(1400);
await page.screenshot({
  path: "qa-artifacts/final-overview.png",
  fullPage: true,
});
await page.getByRole("button", { name: "Run trial", exact: true }).click();
await page.getByRole("button", { name: "Mismatch", exact: true }).click();
await page
  .getByRole("button", { name: "04 Object onset", exact: false })
  .click();
await page.waitForTimeout(700);
await page.screenshot({ path: "qa-artifacts/final-trial.png", fullPage: true });
await page.getByRole("button", { name: "Present", exact: false }).click();
await page.waitForTimeout(800);
await page.screenshot({
  path: "qa-artifacts/final-presentation.png",
  fullPage: true,
});
await page.keyboard.press("Escape");
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(1000);
await page.screenshot({
  path: "qa-artifacts/final-mobile.png",
  fullPage: true,
});
console.log(
  JSON.stringify({
    errors,
    overflow: await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
  }),
);
await browser.close();
