import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads and shows main sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(page.locator("section#about")).toBeVisible();
    await expect(page.locator("section#projects")).toBeVisible();
    await expect(page.locator("section#contact")).toBeVisible();
    await expect(page.locator("section#blog")).toBeVisible();
  });

  test("has nav links with correct hash hrefs", async ({ page }) => {
    await page.goto("/");

    const mainNav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(mainNav.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "#about"
    );
    await expect(mainNav.getByRole("link", { name: "Works" })).toHaveAttribute(
      "href",
      "#projects"
    );
    await expect(
      mainNav.getByRole("link", { name: "Contact" })
    ).toHaveAttribute("href", "#contact");
    await expect(mainNav.getByRole("link", { name: "Blog" })).toHaveAttribute(
      "href",
      "#blog"
    );
  });
});
