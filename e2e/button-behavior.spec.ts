import { test, expect } from "@playwright/test";

test.describe("Button Link Behavior", () => {
  test("Hero Let's Talk button navigates to contact section in same tab", async ({
    page,
  }) => {
    await page.goto("/");

    const button = page
      .getByTestId("filled-button")
      .filter({ hasText: "Let's Talk" })
      .first();
    await button.click();
    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("/#contact");
    expect(page.context().pages()).toHaveLength(1);
  });

  test("Header Let's Talk button navigates to contact section in same tab", async ({
    page,
  }) => {
    await page.goto("/");

    const header = page.locator("header");
    const button = header
      .getByTestId("filled-button")
      .filter({ hasText: "Let's Talk" });
    await button.click();

    expect(page.url()).toContain("/#contact");
    expect(page.context().pages()).toHaveLength(1);
  });

  test("Mobile Menu Let's Talk button closes menu and navigates to contact", async ({
    page,
  }) => {
    await page.goto("/");
    await page.setViewportSize({ width: 375, height: 667 });

    const menuButton = page.getByRole("button", {
      name: "Toggle navigation menu",
    });
    await menuButton.click();

    const mobileMenu = page.locator("#mobile-menu");
    await expect(mobileMenu).toBeVisible();

    const talkButton = page
      .locator("#mobile-menu-button-wrapper")
      .getByTestId("filled-button");
    await talkButton.click();

    await expect(mobileMenu).toBeHidden();
    expect(page.url()).toContain("/#contact");
    expect(page.context().pages()).toHaveLength(1);
  });

  test("Footer Let's Talk button navigates to contact section in same tab", async ({
    page,
  }) => {
    await page.goto("/");

    const footer = page.locator("footer");
    const button = footer
      .getByTestId("filled-button")
      .filter({ hasText: "Let's Talk" });
    await button.click();

    expect(page.url()).toContain("/#contact");
    expect(page.context().pages()).toHaveLength(1);
  });
});
