import { test, expect } from "@playwright/test";

test.describe("Contact Section External Links", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#contact");
  });

  test("LinkedIn button opens in new tab", async ({ page, context }) => {
    const link = page.getByRole("link", { name: "LinkedIn" });
    await expect(link).toHaveAttribute("href", /linkedin\.com/);

    const initialPageCount = context.pages().length;
    const pagePromise = context.waitForEvent("page");
    await link.click();
    const newPage = await pagePromise;

    expect(newPage).toBeTruthy();
    expect(context.pages()).toHaveLength(initialPageCount + 1);
  });

  test("GitHub button opens in new tab", async ({ page, context }) => {
    const link = page.getByRole("link", { name: "GitHub" });
    await expect(link).toHaveAttribute("href", /github\.com/);

    const initialPageCount = context.pages().length;
    const pagePromise = context.waitForEvent("page");
    await link.click();
    const newPage = await pagePromise;

    expect(newPage).toBeTruthy();
    expect(context.pages()).toHaveLength(initialPageCount + 1);
  });

  test("Discord button opens in new tab", async ({ page, context }) => {
    const link = page.getByRole("link", { name: "Discord" });
    await expect(link).toHaveAttribute("href", /discord\.com/);

    const initialPageCount = context.pages().length;
    const pagePromise = context.waitForEvent("page");
    await link.click();
    const newPage = await pagePromise;

    expect(newPage).toBeTruthy();
    expect(context.pages()).toHaveLength(initialPageCount + 1);
  });

  test("Email button uses mailto protocol", async ({ page }) => {
    const emailLink = page.getByRole("link", {
      name: "edwardguevarra2003@gmail.com",
    });
    await expect(emailLink).toHaveAttribute(
      "href",
      "mailto:edwardguevarra2003@gmail.com"
    );
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
