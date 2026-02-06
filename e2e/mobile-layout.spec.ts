import { test, expect } from "@playwright/test";

test.describe("Mobile Layout (375px)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.setViewportSize({ width: 375, height: 667 });
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
      const boundingBox = await button.boundingBox();

      const width = boundingBox?.width || 0;
      expect(width).toBeGreaterThan(330);
      expect(width).toBeLessThan(375);
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
      const boundingBox = await button.boundingBox();

      const width = boundingBox?.width || 0;
      expect(width).toBeGreaterThan(330);
      expect(width).toBeLessThan(375);
    }
  });

  test("hobby buttons have correct grid layout classes", async ({ page }) => {
    await page.locator("section#about").scrollIntoViewIfNeeded();

    const hobbyContainer = page
      .locator('[data-animate*="animate-delay-200"]')
      .locator("div");

    await expect(hobbyContainer).toHaveClass(/grid-cols-1/);
  });

  test("experience buttons have correct grid layout classes", async ({
    page,
  }) => {
    await page.locator("section#about").scrollIntoViewIfNeeded();

    const experienceContainer = page.locator(".grid.grid-cols-1");

    await expect(experienceContainer).toBeVisible();
  });
});

test.describe("Desktop Layout (1280px)", () => {
  test("hobby buttons display correctly on desktop", async ({ page }) => {
    await page.goto("/");
    await page.setViewportSize({ width: 1280, height: 800 });

    await page.locator("section#about").scrollIntoViewIfNeeded();

    const hobbyButtons = page.locator('[data-testid^="hobby-button-"]');
    const firstButton = hobbyButtons.first();
    const boundingBox = await firstButton.boundingBox();

    expect(boundingBox?.width).toBeLessThan(200);
  });

  test("hobby buttons not full width on desktop", async ({ page }) => {
    await page.goto("/");
    await page.setViewportSize({ width: 1280, height: 800 });

    await page.locator("section#about").scrollIntoViewIfNeeded();

    const hobbyButtons = page.locator('[data-testid^="hobby-button-"]');
    const count = await hobbyButtons.count();

    for (let i = 0; i < count; i++) {
      const button = hobbyButtons.nth(i);
      const boundingBox = await button.boundingBox();

      expect(boundingBox?.width).toBeLessThan(500);
    }
  });
});
