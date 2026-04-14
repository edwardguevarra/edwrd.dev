import { test, expect } from "@playwright/test";

test.describe("Mobile Menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.locator("body[data-nav-ready='true']").waitFor();
  });

  test("mobile menu opens when hamburger button is clicked", async ({
    page,
  }) => {
    const menuButton = page.getByRole("button", {
      name: "Toggle navigation menu",
    });
    const mobileMenu = page.locator("#mobile-menu");

    await menuButton.click();
    await expect(mobileMenu).toBeVisible();
  });

  test("mobile menu closes when backdrop is clicked", async ({ page }) => {
    const menuButton = page.getByRole("button", {
      name: "Toggle navigation menu",
    });
    const mobileMenu = page.locator("#mobile-menu");
    const backdrop = page.locator("#mobile-menu-backdrop");

    await menuButton.click();
    await expect(mobileMenu).toBeVisible();

    await backdrop.click();
    await expect(mobileMenu).toBeHidden();
  });

  test("mobile menu closes when ESC key is pressed", async ({ page }) => {
    const menuButton = page.getByRole("button", {
      name: "Toggle navigation menu",
    });
    const mobileMenu = page.locator("#mobile-menu");

    await menuButton.click();
    await expect(mobileMenu).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(mobileMenu).toBeHidden();
  });

  test("mobile menu closes when Let's Talk button is clicked", async ({
    page,
  }) => {
    const menuButton = page.getByRole("button", {
      name: "Toggle navigation menu",
    });
    const mobileMenu = page.locator("#mobile-menu");

    await menuButton.click();
    await expect(mobileMenu).toBeVisible();

    const talkButton = page
      .locator("#mobile-menu-button-wrapper")
      .getByTestId("filled-button");
    await talkButton.click();

    await expect(mobileMenu).toBeHidden();
    expect(page.url()).toContain("/#contact");
  });

  test("mobile menu closes when nav link is clicked", async ({ page }) => {
    const menuButton = page.getByRole("button", {
      name: "Toggle navigation menu",
    });
    const mobileMenu = page.locator("#mobile-menu");

    await menuButton.click();
    await expect(mobileMenu).toBeVisible();

    const aboutLink = mobileMenu.getByRole("menuitem", { name: "About" });
    await aboutLink.click();

    await expect(mobileMenu).toBeHidden();
  });

  test("mobile menu has correct aria attributes when open", async ({
    page,
  }) => {
    const menuButton = page.getByRole("button", {
      name: "Toggle navigation menu",
    });

    await menuButton.click();

    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  });

  test("mobile menu has correct aria attributes when closed", async ({
    page,
  }) => {
    const menuButton = page.getByRole("button", {
      name: "Toggle navigation menu",
    });

    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  });

  test("mobile menu backdrop has correct aria-hidden attribute", async ({
    page,
  }) => {
    const menuButton = page.getByRole("button", {
      name: "Toggle navigation menu",
    });
    const backdrop = page.locator("#mobile-menu-backdrop");

    await menuButton.click();
    await expect(backdrop).toHaveAttribute("aria-hidden", "false");

    await backdrop.click();
    await expect(backdrop).toHaveAttribute("aria-hidden", "true");
  });
});
