import { test, expect } from "@playwright/test";

test.describe("Mobile Layout (375px)", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
  });

  test("hobby buttons display in single column with full width", async ({
    page,
  }) => {
    await page.locator("section#about").scrollIntoViewIfNeeded();

    const hobbyButtons = page.locator('[data-testid^="hobby-button-"]');
    const count = await hobbyButtons.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const button = hobbyButtons.nth(i);
      const buttonBoundingBox = await button.boundingBox();
      const parentBoundingBox = await button.locator("xpath=..").boundingBox();
      const width = buttonBoundingBox?.width || 0;
      const parentWidth = parentBoundingBox?.width || 0;

      expect(width).toBeGreaterThan(0);
      expect(parentWidth).toBeGreaterThan(0);
      expect(Math.abs(parentWidth - width)).toBeLessThan(2);
    }
  });

  test("experience buttons display in single column with full width", async ({
    page,
  }) => {
    await page.locator("section#about").scrollIntoViewIfNeeded();

    const experienceButtons = page.locator(
      '[data-testid^="experience-button-"]'
    );
    const count = await experienceButtons.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const button = experienceButtons.nth(i);
      const buttonBoundingBox = await button.boundingBox();
      const parentBoundingBox = await button.locator("xpath=..").boundingBox();
      const width = buttonBoundingBox?.width || 0;
      const parentWidth = parentBoundingBox?.width || 0;

      expect(width).toBeGreaterThan(0);
      expect(parentWidth).toBeGreaterThan(0);
      expect(Math.abs(parentWidth - width)).toBeLessThan(2);
    }
  });

  test("hobby buttons have correct grid layout classes", async ({ page }) => {
    await page.locator("section#about").scrollIntoViewIfNeeded();

    const hobbyContainer = page
      .locator("section#about .grid.grid-cols-1.gap-6")
      .filter({ has: page.locator('[data-testid="hobby-button-0"]') })
      .first();

    await expect(hobbyContainer).toBeVisible();
    await expect(hobbyContainer).toHaveClass(/grid-cols-1/);
  });

  test("experience buttons have correct grid layout classes", async ({
    page,
  }) => {
    await page.locator("section#about").scrollIntoViewIfNeeded();

    const experienceContainer = page
      .locator("section#about .grid.grid-cols-1.gap-6")
      .filter({ has: page.locator('[data-testid="experience-button-0"]') })
      .first();

    await expect(experienceContainer).toBeVisible();
    await expect(experienceContainer).toHaveClass(/grid-cols-1/);
  });
});

test.describe("Desktop Layout (1280px)", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
  });

  test("hobby buttons display correctly on desktop", async ({ page }) => {
    await page.locator("section#about").scrollIntoViewIfNeeded();

    const hobbyButtons = page.locator('[data-testid^="hobby-button-"]');
    const firstButton = hobbyButtons.first();
    await expect(firstButton).toBeVisible();
    const buttonBoundingBox = await firstButton.boundingBox();
    const parentBoundingBox = await firstButton
      .locator("xpath=..")
      .boundingBox();
    const width = buttonBoundingBox?.width || 0;
    const parentWidth = parentBoundingBox?.width || 0;

    expect(width).toBeGreaterThan(0);
    expect(parentWidth - width).toBeGreaterThan(20);
  });

  test("hobby buttons not full width on desktop", async ({ page }) => {
    await page.locator("section#about").scrollIntoViewIfNeeded();

    const hobbyButtons = page.locator('[data-testid^="hobby-button-"]');
    const count = await hobbyButtons.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const button = hobbyButtons.nth(i);
      const buttonBoundingBox = await button.boundingBox();
      const parentBoundingBox = await button.locator("xpath=..").boundingBox();
      const width = buttonBoundingBox?.width || 0;
      const parentWidth = parentBoundingBox?.width || 0;

      expect(width).toBeGreaterThan(0);
      expect(parentWidth - width).toBeGreaterThan(20);
    }
  });
});
