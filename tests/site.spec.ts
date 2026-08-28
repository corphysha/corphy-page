import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 1000 },
] as const;

function trackRuntimeErrors(page: import("@playwright/test").Page) {
  const errors: string[] = [];

  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`);
    }
  });

  return errors;
}

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  await expect
    .poll(() =>
      page.evaluate(() => Math.ceil(document.documentElement.scrollWidth - window.innerWidth)),
    )
    .toBeLessThanOrEqual(1);
}

test("home establishes a usable field-notes shell", async ({ page }) => {
  const runtimeErrors = trackRuntimeErrors(page);

  await page.goto("./");

  await expect(page.getByRole("link", { name: "Skip to content" })).toBeVisible();
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await expect(page.locator("h1")).toContainText("Corphy");
  await expect(page.locator(".split-word")).toHaveCount(4);
  await expect(page.getByRole("link", { name: "Read field notes" })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  expect(runtimeErrors).toEqual([]);
});

test("blog index reaches every generated article without runtime errors", async ({ page }) => {
  const runtimeErrors = trackRuntimeErrors(page);

  await page.goto("./blog/");
  await expect(page.getByRole("heading", { name: "Field notes" })).toBeVisible();

  const postHrefs = await page
    .locator("[data-post-link]")
    .evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).href));

  expect(postHrefs.length).toBeGreaterThan(0);

  for (const href of postHrefs) {
    await page.goto(href);
    await expect(page.locator("article")).toBeVisible();
    await expect(page.locator("[data-table-of-contents]")).toBeVisible();
  }

  expect(runtimeErrors).toEqual([]);
});

test("article code can be copied with accessible feedback", async ({ browser }) => {
  const context = await browser.newContext();
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:4321",
  });

  const page = await context.newPage();
  const runtimeErrors = trackRuntimeErrors(page);

  await page.goto("./blog/switching-to-bun/");
  const code = page.locator("pre code").first();
  const expectedText = (await code.textContent())?.trim();

  await page.getByRole("button", { name: "Copy code" }).first().click();
  await expect(page.getByRole("status")).toContainText("Copied");

  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(expectedText);
  expect(runtimeErrors).toEqual([]);

  await context.close();
});

test("reduced motion retains a readable home-page thesis", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");

  const title = page.locator("h1");
  await expect(title).toContainText("Corphy");
  await expect(title).toBeVisible();
  await expect(page.locator(".split-word")).toHaveCount(0);
});

test("RSS and the branded missing-page route remain reachable", async ({ page }) => {
  const rssResponse = await page.goto("./rss.xml");
  expect(rssResponse?.status()).toBe(200);
  await expect(page.locator("body")).toContainText("Corphy");

  const missingResponse = await page.goto("./this-route-does-not-exist/");
  expect(missingResponse?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "This page is not in the notebook." }),
  ).toBeVisible();
});

test("desktop thesis stays within two editorial lines", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("./");

  const lineCount = await page.locator("h1").evaluate((heading) => {
    const range = document.createRange();
    range.selectNodeContents(heading);

    return new Set(
      [...range.getClientRects()]
        .filter((rect) => rect.width > 0 && rect.height > 0)
        .map((rect) => Math.round(rect.top)),
    ).size;
  });

  expect(lineCount).toBeLessThanOrEqual(2);
});

for (const viewport of viewports) {
  test(`${viewport.name} layout has no horizontal overflow and keeps navigation reachable`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("./");

    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto("./blog/switching-to-bun/");
    await expect(page.locator("article")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
}

test("mobile navigation targets meet the accessible tap size", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");

  for (const link of await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link")
    .all()) {
    const box = await link.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
});

test("tag routes list their articles and keyboard focus reaches interactive content", async ({
  page,
}) => {
  await page.goto("./blog/tags/astro/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("astro");
  await expect(page.locator("[data-post-link]").first()).toBeVisible();

  await page.goto("./");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();

  await page.getByRole("link", { name: "Skip to content" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeInViewport();
});

test("copy reports a recovery message when the clipboard is unavailable", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("./blog/switching-to-bun/");
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
  });

  await page.getByRole("button", { name: "Copy code" }).first().click();
  await expect(page.getByRole("status")).toContainText("Unable to copy");

  await context.close();
});

test("home and article have no serious or critical axe violations", async ({ page }) => {
  for (const path of ["./", "./blog/switching-to-bun/"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();

    const blocking = results.violations.filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical",
    );

    expect(blocking).toEqual([]);
  }
});
