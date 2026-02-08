import { test, expect } from "@playwright/test";

const routes = ["/", "/blog", "/blog/how-i-use-cursor-ide", "/404"];

test.describe("Shared page shell", () => {
  for (const route of routes) {
    test(`renders shared shell on ${route}`, async ({ page }) => {
      await page.goto(route);

      const mainContent = page.locator("main#main-content");
      const skipLink = page.locator('a[href="#main-content"]');

      await expect(mainContent).toBeVisible();
      await expect(skipLink).toHaveCount(1);
      await expect(skipLink).toHaveAttribute("href", "#main-content");
      await expect(page.locator("header").first()).toBeVisible();
      await expect(page.locator("footer").first()).toBeVisible();
    });
  }
});
