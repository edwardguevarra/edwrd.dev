import { test, expect } from "@playwright/test";

test.describe("Contact Section External Links", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#contact");
  });

  test("LinkedIn button opens in new tab", async ({ page, context }) => {
    const pagePromise = context.waitForEvent("page");
    await page.getByRole("link", { name: "LinkedIn" }).click();
    const newPage = await pagePromise;

    await newPage.waitForLoadState("networkidle");
    expect(newPage.url()).toContain("linkedin.com");
  });

  test("GitHub button opens in new tab", async ({ page, context }) => {
    const pagePromise = context.waitForEvent("page");
    await page.getByRole("link", { name: "GitHub" }).click();
    const newPage = await pagePromise;

    await newPage.waitForLoadState("networkidle");
    expect(newPage.url()).toContain("github.com");
  });

  test("Discord button opens in new tab", async ({ page, context }) => {
    const pagePromise = context.waitForEvent("page");
    await page.getByRole("link", { name: "Discord" }).click();
    const newPage = await pagePromise;

    await newPage.waitForLoadState("networkidle");
    expect(newPage.url()).toContain("discord.com");
  });

  test("Email button opens mail client popup", async ({ page }) => {
    const [popup] = await Promise.all([
      page.waitForEvent("popup"),
      page.getByRole("link", { name: "edwardguevarra2003@gmail.com" }).click(),
    ]);

    expect(popup).toBeTruthy();
  });

  test("External links have target='_blank' attribute", async ({ page }) => {
    const externalLinks = ["LinkedIn", "GitHub", "Discord"];

    for (const linkName of externalLinks) {
      const link = page.getByRole("link", { name: linkName });
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  test("Email link does not have target attribute", async ({ page }) => {
    const emailLink = page.getByRole("link", {
      name: "edwardguevarra2003@gmail.com",
    });
    await expect(emailLink).not.toHaveAttribute("target");
  });
});
