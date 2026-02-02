import { test, expect } from "@playwright/test";

test.describe("Blog index", () => {
  test("loads and shows page title", async ({ page }) => {
    await page.goto("/blog");

    await expect(page.locator("h1").filter({ hasText: "Blog" })).toBeVisible();
  });

  test("lists at least one post with link to post", async ({ page }) => {
    await page.goto("/blog");

    const postLink = page.locator('a[href="/blog/how-i-use-cursor-ide"]');
    await expect(postLink).toBeVisible();
    await expect(postLink).toContainText("Cursor IDE");
  });
});

test.describe("Blog post", () => {
  test("loads post page with title and content", async ({ page }) => {
    await page.goto("/blog/how-i-use-cursor-ide");

    await expect(
      page.locator("h1").filter({ hasText: /Cursor/i })
    ).toBeVisible();
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(page.getByRole("article")).toBeVisible();
  });

  test("does not show 404", async ({ page }) => {
    const response = await page.goto("/blog/how-i-use-cursor-ide");
    expect(response?.status()).not.toBe(404);
  });
});
